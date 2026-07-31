# Operations

## Environment variables

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | ✅ | Postgres connection string (Neon in production). |
| `AUTH_SECRET` | ✅ | Signs session JWTs. Use a long random value; rotating it logs everyone out. |
| `COOKIE_INSECURE` | — | Set to `1` only when serving over plain HTTP on a non-localhost host. |
| `SENTRY_DSN` | — | Server/edge error reporting. **Unset = Sentry is completely inert.** |
| `NEXT_PUBLIC_SENTRY_DSN` | — | Browser error reporting. Inlined at build time. |
| `SENTRY_ENVIRONMENT` / `NEXT_PUBLIC_SENTRY_ENVIRONMENT` | — | Defaults to `NODE_ENV`. |
| `SENTRY_TRACES_SAMPLE_RATE` | — | Defaults to `0.1`. |
| `CRON_SECRET` | — | Bearer token for `/api/cron/digest`. **Unset = the endpoint refuses every request**, so the weekly digest never runs. |
| `RESEND_API_KEY` | — | Resend API key. **Unset = no email is sent**; the run still executes and reports `skipped`. |
| `DIGEST_FROM` | — | From address, e.g. `Sideline365 <digest@yourdomain>`. Required alongside `RESEND_API_KEY`. |
| `APP_URL` | — | Public base URL used for links inside emails. Defaults to the Netlify site URL. |

Nothing is sent to Sentry until a DSN is set, and `sendDefaultPii` is off so
request bodies and headers are never transmitted.

## Weekly digest

Coaches get a Monday-morning summary of their squad: who to check on, what
improved, and the week's totals. It is composed from data athletes already log
— nothing extra to fill in.

Three independent switches, each failing closed:

1. **`CRON_SECRET` unset** — `/api/cron/digest` returns 401 to everything. An
   endpoint that emails every coach in the system must never be open by
   default.
2. **`RESEND_API_KEY` / `DIGEST_FROM` unset** — the run happens and reports
   what it *would* have sent, delivering nothing. Coaches can still read the
   digest in-app at `/coach/digest`.
3. **Per-coach opt-out** — `User.digestOptOut`, toggled from `/coach/digest`.

A digest is only sent when there is something in it. A squad that logged
nothing and has nobody needing attention gets silence, because a weekly
"nothing happened" email is what teaches people to filter the sender.

### Schedule

`netlify/functions/weekly-digest.mts` runs at `0 22 * * 0` (22:00 UTC Sunday =
07:00 Monday in Asia/Seoul) and POSTs to `/api/cron/digest`. The function only
pulls the trigger, so any other scheduler works just as well:

```bash
curl -X POST -H "Authorization: Bearer $CRON_SECRET" https://<site>/api/cron/digest
```

The response reports per recipient, which is what to check first when a
Monday goes quiet:

```json
{"considered":3,"sent":2,"skipped":0,"failed":1,
 "mailerConfigured":true,
 "results":[{"email":"…","status":"failed","reason":"403 domain not verified"}]}
```

### Swapping mail provider

Everything above `src/lib/mailer.ts` deals in `{ to, subject, html, text }`.
Changing provider means rewriting `deliver()` in that one file.

## Deploying

Netlify runs `npm run netlify:build`:

```
prisma generate → prisma/baseline.ts → prisma migrate deploy → seed → next build
```

Schema changes only reach production as committed migrations. See
`prisma/migrations/README.md`.

## Continuous integration

`.github/workflows/ci.yml` runs on every push and pull request: typecheck,
migrate against a throwaway Postgres, seed, build, then the Playwright suite.
Failures upload the HTML report as an artifact.

Run the same suite locally:

```bash
npm run build          # the suite runs against a production build
npm run db:fixture     # deterministic starting state for the seeded athlete
npm run test:e2e
```

## Database backups — check these in the Neon console

The migration workflow protects against *accidental schema* changes; it does not
protect against bad data or a dropped table. Confirm in Neon:

1. **Point-in-time restore** is enabled and its retention window is long enough
   to notice a problem (7 days minimum; 30 is better).
2. You know how to **branch from a past timestamp** — that is the fastest
   recovery path, and it is worth doing once as a drill before you need it.
3. Take a manual snapshot (or a Neon branch) **before running any migration that
   drops or renames a column**.

## Known gaps

- `User.houseRepairs` is unused (left over from the old house-repair mechanic).
  It is retained deliberately; dropping it is a destructive migration and should
  be done as its own reviewed change.
- Guide step/tip content exists in Korean, English and Spanish. Blog posts,
  community posts and athlete guides stay in whatever language they were
  authored in — this is intentional, and the i18n test excludes those routes.
