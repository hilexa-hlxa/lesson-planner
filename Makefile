# Единая точка входа в проект. Здесь три сервиса (React-фронтенд, PHP-бэкенд,
# Node-админка), у каждого свой способ запуска, и до сих пор они нигде не были
# записаны рядом — приходилось вспоминать по README, docker-compose.yml и
# admin/README.md сразу.
#
# Правило: то, что делает CI, и то, что делает `make`, — это одни и те же
# команды (см. .github/workflows/ci.yml). Если проверка есть здесь, но не там,
# или наоборот — они разойдутся.

.DEFAULT_GOAL := help
.PHONY: help setup dev dev-backend admin lint lint-js lint-php test build canary clean

# Origin бэкенда для локальной сборки. В проде значение задаётся в Render
# (см. render.yaml), здесь — умолчание под docker-compose (backend на :8000).
# Переопределяется: make build API_BASE=https://lessonlab-backend.onrender.com
API_BASE ?= http://localhost:8000

help: ## Показать список команд
	@grep -hE '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-14s\033[0m %s\n", $$1, $$2}'

setup: ## Поставить зависимости всех трёх сервисов
	npm ci
	cd admin && npm ci
	cd backend && composer install

dev: ## Фронтенд на :5173 (проксирует /api на localhost:8000, см. vite.config.js)
	npm run dev

dev-backend: ## Бэкенд на :8000 через docker-compose (нужен .env, см. .env.example)
	docker compose up backend

admin: ## Админка локально на :10000 (нужны PG*/ADMIN_PASSWORD/SESSION_SECRET)
	cd admin && npm start

lint: lint-js lint-php ## Весь линт (то же, что гоняет CI)

lint-js: ## ESLint по фронтенду и admin/
	npm run lint

lint-php: ## php -l по всему backend/
	./scripts/lint-php.sh

test: ## Юнит-тесты (vitest)
	npm test

build: ## Прод-сборка. Падает, если API_BASE пустой или кривой
	VITE_API_BASE_URL=$(API_BASE) npm run build

canary: ## Прогнать канарейку по проду локально (без отправки в Telegram)
	@CANARY_BASE_URL=$${CANARY_BASE_URL:-https://lessonlab-backend.onrender.com} \
		node scripts/canary.mjs --dry-run

clean: ## Убрать артефакты сборки
	rm -rf dist
