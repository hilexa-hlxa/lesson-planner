# Backend DDD blueprint

## Architecture
`backend/src` is split into `Domain / Application / Infrastructure / Interfaces`.
Only controllers in `src/Interfaces/Http/Controller` are exposed by routing in `backend/public/index.php`.

## Config loading
`backend/config.php` now returns the complete config array used by the container:
- `db.dsn`, `db.user`, `db.pass`, `db.timeout`
- `gemini.api_key`, `gemini.model`
- `cache.redis_host`, `cache.redis_port`, `cache.generation_ttl`
- `ssl.cafile`

All sensitive values are expected from env vars (`DB_*`, `GEMINI_*`, `REDIS_*`) unless overridden in `config.local.php`.

## Learning schema
Migration `database/migrations/202602190002_create_learning_tables.sql` creates domain tables:
- `generations`
- `quiz_sessions`
- `quiz_results`
- `wallets`
- `user_achievements`

Legacy tables are dropped (`users`, `user_roles`, `sessions`).
Indexes added for query speed (`generations.user_id`, `generations.updated_at`, `quiz_sessions.access_code`, `quiz_results.quiz_id`, etc.).

## Performance notes
- `GeminiGenerationService` now supports Redis response caching using key `(prompt, model)` hash + TTL.
- `/api/generate/stream` is handled as a regular async-friendly JSON endpoint (`{ markdown: ... }`) rather than legacy SSE semantics.
- PDO repositories use prepared statements and benefit from added indexes in migrations.
