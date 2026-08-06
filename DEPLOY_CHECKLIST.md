# Pre-deploy checklist

For shipping `claude/sports-performance-tracker-iul13e` to production.

Reference material lives in `OPERATIONS.md`; this file is the ordered list of
things to do and decide, once.

---

## 0. Decide first — the demo accounts

**`npm run netlify:build` runs `prisma/seed.ts` on every production build.** It
creates ten records including **five working logins, four of them COACH
accounts, all with the password `password123`** — and the login page prints two
of them on screen.

```
athlete@example.com / password123
coach@example.com   / password123
```

That is correct for a demo and wrong for a school. Anyone who opens the site can
sign in as a coach: create teams, publish blog posts, open the coach dashboard,
and send connection requests to any email address they can guess. Athlete
training data is now behind consent (see §3), so this is no longer a route into
a child's records — but it is still an unauthenticated stranger holding a staff
account.

Pick one before deploying:

- [ ] **Staying a demo** — change nothing, and know the above.
- [ ] **Going live with real users** — remove `tsx prisma/seed.ts` from the
      `netlify:build` script, drop the demo block from the login page, and
      delete or rotate the seeded accounts already in the database.

There is currently no env flag for this; the seed always runs. Say the word and
I'll add one.

### If you are showing the site to someone

The seeded coach has one athlete who has logged nothing, so every coach screen
correctly renders an empty state. Populate a squad first:

```bash
npm run db:demo
```

Run it **the same day** as the demo — the dates are relative to today. See
"Demo data" in `OPERATIONS.md`. `npm run db:demo -- --clean` removes it again.

---

## 1. Environment variables

Set in the Netlify UI. Required:

- [ ] `DATABASE_URL` — Neon connection string
- [ ] `AUTH_SECRET` — long random value. **Rotating it signs everyone out.**

Optional, each fails closed if unset:

- [ ] `CRON_SECRET` — unset means `/api/cron/digest` returns 401 to everything
      and the weekly digest never runs. Use a long random value.
- [ ] `RESEND_API_KEY` + `DIGEST_FROM` — unset means no email is sent at all.
      Affects **both** the weekly digest and **password reset**: without these,
      a locked-out user cannot recover their account. `DIGEST_FROM` needs a
      verified sending domain in Resend.
- [ ] `APP_URL` — public base URL. Used for links inside emails, including the
      password-reset link. Wrong value means dead reset links.
- [ ] `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN` — unset means Sentry is inert.

Quickest sanity check that they landed: after deploying, `/coach/digest` renders
the preview regardless, but sending only works with the mail pair set.

---

## 2. Back up before migrating

Two of the pending migrations change or delete existing data. Confirm the Neon
backup position **before** the deploy, not after — see the checklist under
"Database backups" in `OPERATIONS.md`.

- [ ] Note the current Neon PITR window / take a branch snapshot
- [ ] Record the current migration state:
      `SELECT migration_name, finished_at FROM "_prisma_migrations" ORDER BY finished_at;`

---

## 3. What will run against production

`netlify:build` chain: `prisma generate → baseline → migrate deploy → seed → next build`

Five migrations are pending. Three are additive and need no thought:

| Migration | Effect |
| --- | --- |
| `add_user_lang_and_digest_optout` | adds two nullable/defaulted columns |
| `add_password_reset_token` | new table |
| `add_connection_consent_and_notifications` | new table + columns, **plus a backfill** |

Two touch existing data:

### `repair_unpadded_day_keys` — rewrites rows

Fixes day keys written as `2026-08-3` instead of `2026-08-03`. Any row created
on the 1st–9th of a month since the journal shipped carries a bad key. It also
deletes a malformed `MissionClaim` where normalising it would collide with the
correctly-keyed row for the same day.

Check the blast radius first, out of interest rather than caution — it is
idempotent and safe either way:

```sql
SELECT
  (SELECT count(*) FROM "TrainingSession" WHERE day !~ '^\d{4}-\d{2}-\d{2}$') AS sessions,
  (SELECT count(*) FROM "MissionClaim"    WHERE day !~ '^\d{4}-\d{2}-\d{2}$') AS claims;
```

- [ ] Ran the query (any number is fine; it tells you how much was broken)

### `drop_house_repairs` — deletes a column

**Irreversible.** Verify it holds nothing first:

```sql
SELECT count(*) FILTER (WHERE array_length("houseRepairs", 1) > 0) FROM "User";
```

- [ ] Returned `0` → safe to proceed
- [ ] Returned anything else → **stop**, revert the schema change and the
      migration folder, and tell me

Run it *before* deploying. Afterwards it errors with `column "houseRepairs"
does not exist`, which just means the migration did its job.

### The consent backfill

`add_connection_consent_and_notifications` sets every existing `CoachAthlete`
row to `ACCEPTED`. Those links predate consent and are already in use, so this
preserves them. Without it, every coach's roster would silently empty.

- [ ] Understood: existing links keep working; only *new* links need accepting

---

## 4. Deploy

- [ ] Merge / deploy the branch
- [ ] Watch the Netlify build log for the migration step — `migrate deploy`
      applying five migrations, no failures
- [ ] Confirm afterwards:
      `SELECT migration_name FROM "_prisma_migrations" ORDER BY finished_at DESC LIMIT 5;`

---

## 5. Verify in production

The two fixes with real user impact, first:

- [ ] **`/coach` loads.** It was returning 500 for the first nine days of every
      month before `f09e855`. Today is inside that window, so this is the
      headline fix — if it renders, the day-key bug is gone.
- [ ] **Consent holds.** From a coach account, request a connection to an
      athlete who has not accepted. The athlete must *not* appear on `/coach`,
      and assigning them training must be refused.

Then the rest:

- [ ] `/` renders for both an athlete and a coach
- [ ] `/coach/report` prints cleanly (Ctrl+P → the app chrome disappears)
- [ ] `/coach/digest` shows the email preview
- [ ] Language switch to EN and ES on `/sports/lacrosse/program` — fully
      translated, no Korean left
- [ ] `/forgot` accepts an address and confirms; with mail configured, the email
      arrives and the link works once
- [ ] Notification bell appears in the nav

Trigger the digest by hand rather than waiting for Sunday:

```bash
curl -X POST -H "Authorization: Bearer $CRON_SECRET" https://<site>/api/cron/digest
```

- [ ] Response reports per recipient. `"mailerConfigured": false` means the
      mail keys are missing; `"status": "failed"` carries the provider's reason.

---

## 6. If it goes wrong

- **A migration fails mid-deploy** — Netlify's build fails and the old site
  stays up, but the database may be partway through. Check
  `_prisma_migrations` for a row with `finished_at` null and `logs` set; that
  names the failing statement.
- **`drop_house_repairs` was wrong** — the column is gone. Restore from the
  Neon PITR position recorded in §2. This is the only step in the list that a
  redeploy cannot undo.
- **Everything else** — redeploy the previous commit. The additive migrations
  are harmless to leave in place; the new columns and tables are simply unused
  by older code.
