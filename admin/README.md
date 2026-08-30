# Lesson Planner — Admin

A separate, small, read-mostly dashboard for monitoring the main app's users,
teachers, classes and generations. **Not part of the main site** — deployed as
its own Render service (`lessonlab-admin`), its own URL, its own login. It
reads the *same* Supabase Postgres database `lessonlab-backend` uses; it does
not have its own copy of the data.

## Why a separate service, and why Node instead of PHP

The main app is PHP. This is Node/Express instead, on purpose: it's a
completely separate deploy with its own auth perimeter (see below), so there
was no reason to share code with `backend/`, and Node let this get created and
verified end-to-end via Render's API in one pass rather than depending on a
Docker Blueprint sync.

## Auth model

One shared admin password (`ADMIN_PASSWORD`), not a user account in the
`users` table — deliberately not reusing the main app's login system, since
this dashboard's whole purpose is to look at that table, and an "admin" row
living inside it would blur the line between what's being monitored and who's
monitoring it. A session cookie (signed, `httpOnly`, `secure` in production)
tracks whether you're logged in; failed logins are rate-limited in-memory (5
attempts → 5 minute lockout per IP).

`X-Robots-Tag: noindex, nofollow` is set on every response — this should never
show up in search results or be linked from the public site.

## Environment variables (set these on the Render service)

| Var | What |
|---|---|
| `ADMIN_PASSWORD` | The one password that logs in. Pick something long and random — this gates access to every teacher/student's data. |
| `SESSION_SECRET` | Random string used to sign the session cookie. Any long random value. |
| `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD` | Same Supabase database `lessonlab-backend` uses. `lessonlab-backend`'s `DB_DSN` env var is a single PDO string like `pgsql:host=HOST;port=PORT;dbname=DBNAME` — split that into `PGHOST`/`PGPORT`/`PGDATABASE` here, and copy `DB_USER`/`DB_PASS` from there as `PGUSER`/`PGPASSWORD`. Find them in the Render dashboard under `lessonlab-backend` → Environment (they're `sync: false`, so they don't appear in `render.yaml` and can't be read by anything other than someone with dashboard access — including me). |
| `PGSSL` | Leave unset in production (Supabase requires TLS). Set to `disable` only for local development against a plain local Postgres. |

## Local development

```bash
cd admin
npm install
PGSSL=disable NODE_ENV=development \
  ADMIN_PASSWORD=devpass SESSION_SECRET=devsecret \
  PGHOST=localhost PGPORT=5432 PGDATABASE=lessonlab PGUSER=postgres PGPASSWORD=postgres \
  node server.js
```

Then open `http://localhost:10000/login` (or whatever `$PORT` you set).

## What it shows

- **Overview** — live counts (users, teachers, students, classes, generations,
  generations today/this week, errors today) plus recent signups and recent
  generations.
- **Users** — searchable list (email/name), roles, plan (free/PRO), coin
  balance, active status, last login. Click through to a user's page for
  their full profile plus classes/generations/quiz results/achievements.
  "Disable" flips `users.is_active` to `false` — blocks login without
  deleting anything, reversible from the same button. "Move to PRO" /
  "Move to Free" flips `users.plan` — **this is the only way anyone actually
  becomes PRO**: there's no payment provider connected (see
  `src/lib/plans.js`), so a teacher pays you outside the site and you flip
  their plan here. Also reversible.
- **Teachers** — teachers ranked by generations created, with their class and
  (approved) student counts.
- **Classes** — every class, its teacher, join code, and approved/pending
  member counts.
- **Generations** — recent lesson plans and tests across all teachers,
  filterable by status (`done`/`error`/`running`/`pending`) — the `error`
  filter is the fastest way to see who's currently hitting a broken
  generation provider.
- **Rate limits** — the `rate_limits` table sorted by hit count, to spot
  abuse or a misbehaving client (see `backend/src/RateLimiter.php` for how
  buckets are named).

Everything past login is read-only except the "Disable/Enable" and
"Move to PRO/Free" toggles on Users — deliberately: this is a monitoring
tool, not a second copy of the main app's admin surface.
