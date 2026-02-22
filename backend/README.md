# Backend (PHP 8.2) — DDD modules

`backend/src` организован по слоям и модулям.

## Слои

- `Domain` — сущности, value objects, доменные события и интерфейсы репозиториев.
- `Application` — use-cases (handlers), команды и результаты.
- `Infrastructure` — PDO-репозитории, кэш-декораторы, Redis и безопасность.
- `Interfaces` — HTTP-контроллеры и преобразование ошибок.
- `Bootstrap` — DI-контейнер и связывание зависимостей.

## Модули

- `Auth` — регистрация и логин пользователей.
- `Posts` — работа с постами.
- `Comments` — работа с комментариями.
- `Groups` — работа с группами.
- `Audit` — аудит доменных событий.

## Как добавлять новый use-case

1. Создайте каталог `src/Application/<Module>/<Action>/`.
2. Добавьте:
   - `<Action>Command.php` (вход);
   - `<Action>Handler.php` (приложенческий сценарий);
   - `<Action>Result.php` (выход).
3. Если нужны новые бизнес-концепции, добавляйте сущности/value objects в `src/Domain/<Module>/...`.
4. Интерфейс репозитория размещайте в Domain, реализацию на PDO — в `src/Infrastructure/Persistence/PDO`.
5. Для read-heavy сценариев оборачивайте репозиторий кэш-декоратором из `src/Infrastructure/Cache`.
6. Если use-case генерирует доменные события, сохраняйте их в `Audit` через `AuditLog::fromDomainEvent()` и `AuditLogRepository`.

## Запуск тестов

```bash
cd backend
composer install
vendor/bin/phpunit
```
