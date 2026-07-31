# Database migrations

Schema changes are applied through `prisma migrate`, not `prisma db push`.
Every change lands as a reviewable `.sql` file that is committed with the code,
so production can never be altered by an implicit diff.

## Changing the schema (development)

```bash
# 1. edit prisma/schema.prisma, then:
npm run db:migrate -- --name describe_your_change
```

This writes `prisma/migrations/<timestamp>_describe_your_change/migration.sql`,
applies it to your local database, and regenerates the client. **Read the
generated SQL before committing** — that exact file is what runs in production.

Requires the local Postgres role to have `CREATEDB` (Prisma needs a shadow
database to diff against):

```bash
sudo -u postgres psql -c "ALTER ROLE <your_role> CREATEDB;"
```

## Deploying

`npm run netlify:build` runs on every deploy:

```
prisma generate → tsx prisma/baseline.ts → prisma migrate deploy → seed → next build
```

`migrate deploy` only applies migrations that haven't run yet. It never drops
anything that isn't spelled out in a committed migration file.

## Baselining (`prisma/baseline.ts`)

The production database predates this setup — its tables were created by
`db push`, so it has no `_prisma_migrations` history and `migrate deploy` would
otherwise try to re-create existing tables. `baseline.ts` handles that once:

| database state | what it does |
| --- | --- |
| has `_prisma_migrations` | nothing |
| no history, but tables exist | marks `0_init` as applied (no DDL runs) |
| completely empty | nothing — `migrate deploy` creates the schema |

It is idempotent and safe to leave in the build permanently.

## Destructive changes

Dropping or renaming a column loses data. `migrate deploy` will happily run it
if the migration says so, so review those SQL files especially carefully and
take a database snapshot first.
