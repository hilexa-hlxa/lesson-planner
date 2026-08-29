# Connect the admin panel to the database

One-time step, ~2 minutes. The admin panel (`lessonlab-admin`) is deployed
and working, but refuses to boot until it has database credentials — on
purpose (see `admin/db.js`): a clear crash beats a dashboard that silently
shows nothing.

I can't do this step myself — these are live secrets, unreadable by me
through any tool I have (Render doesn't expose an existing `sync: false`
env var's value to anyone, including via its own API), and I won't attempt
to work around that.

## Steps

1. Open the Render dashboard → **`lessonlab-backend`** → **Environment**.
2. Find three values there:
   - `DB_DSN` — looks like `pgsql:host=SOMETHING.pooler.supabase.com;port=5432;dbname=postgres`
   - `DB_USER`
   - `DB_PASS`
3. Open **`lessonlab-admin`** → **Environment**, and add:

   | New var on `lessonlab-admin` | Value |
   |---|---|
   | `PGHOST` | the `host=` part of `DB_DSN` |
   | `PGPORT` | the `port=` part of `DB_DSN` (usually `5432`) |
   | `PGDATABASE` | the `dbname=` part of `DB_DSN` (usually `postgres`) |
   | `PGUSER` | same value as `DB_USER` |
   | `PGPASSWORD` | same value as `DB_PASS` |

4. Save. Render redeploys automatically. Once it's live, log in at
   `https://lessonlab-admin.onrender.com` with the `ADMIN_PASSWORD` I set
   (also in `lessonlab-admin` → Environment, if you need to look it up or
   change it).

That's the whole thing. Full page-by-page docs: `admin/README.md`.
