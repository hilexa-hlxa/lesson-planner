# Lesson Planner

React + PHP (DDD) lesson planner with quiz, coins, achievements, and generation workflows.

## Stack
- React 18 + Vite
- PHP 8.2 backend (`backend/`)
- PDO SQL storage with DDD modules
- SWR client-side caching

## Run locally
```bash
npm install
npm run dev
```

Backend:
```bash
cd backend
composer install
php -S 127.0.0.1:8000 -t public
```

## Frontend API layer
All REST calls are centralized in `src/api.js` with:
- configurable `VITE_API_URL`
- request timeout
- retries with exponential backoff
- endpoint groups for auth, generations, quiz, economy, achievements

## DDD backend endpoints
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/generations`
- `GET /api/generations`
- `GET|PATCH|DELETE /api/generations/{id}`
- `GET /api/generations/{id}/export-docx`
- `POST /api/generate/stream`
- `POST /api/quiz/start`
- `POST /api/quiz/join`
- `POST /api/quiz/submit`
- `GET /api/quiz/{id}/report`
- `GET /api/quiz/{id}/export`
- `GET /api/coins`
- `POST /api/coins/add`
- `POST /api/achievements/grant`
- `GET /api/me`
