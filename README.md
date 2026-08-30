# LESSON.LAB

AI-платформа для казахстанских учителей. Генерация планов уроков, живые тесты, автоматические итоги урока, классы с учениками и игры прямо на уроке.

---

## Возможности

**Для учителей**
- Генерация планов уроков (цели, ход, дифференциация, ДЗ) — экспорт в DOCX
- Создание AI-тестов и запуск живых сессий с 4-значным кодом доступа
- Итог урока — AI пишет отчёт после теста (что прошли, ДЗ, кому нужна помощь)
- Управление классами: создание, join code, одобрение учеников, история тестов
- Вордл для класса — учитель задаёт слово, делится кодом, ученики играют

**Для учеников**
- Вступление в класс по коду, прохождение тестов
- История своих тестов с разбором ошибок
- Вордл в соло-режиме (случайное слово из банка)

**Общее**
- Три языка: RU / KZ / EN (переключается в один клик)
- Тёмный/светлый режим
- Система достижений и монет

---

## Стек

| Слой | Технология |
|---|---|
| Frontend | React 18 + Vite (Rolldown) |
| Styling | Tailwind CSS v4 |
| Backend | PHP 8.2 |
| Database | PostgreSQL (Supabase) |
| AI | Groq (streaming) |
| Auth | Session-based (cookie) |
| Export | PHPWord (DOCX) |

---

## Запуск

### С Docker (рекомендуется)

```bash
# Запустить бэкенд
docker compose up backend

# Запустить фронтенд (отдельный терминал)
npm run dev
```

Открыть: `http://localhost:5173`

### Вручную

```bash
# Frontend
npm install
npm run dev

# Backend
cd backend
composer install
php -S 127.0.0.1:8000 -t public
```

---

## Переменные окружения

Бэкенд читает `backend/config.local.php` (не в репозитории):

```php
<?php
return [
  'db' => [
    'dsn'  => 'pgsql:host=...;port=6543;dbname=postgres;sslmode=require',
    'user' => 'postgres.xxxxx',
    'pass' => 'your_password',
  ],
];
```

---

## База данных

## Тесты

```
npm test                                          # чистые функции фронтенда (vitest)
php backend/extras/tests/quiz_parser_test.php     # разбор теста и ключ ответов
```

Миграции находятся в `backend/extras/migrations/`. Запускать по порядку через Supabase SQL Editor:

- `000_initial_schema.sql` — основные таблицы
- `001_classes.sql` — классы и участники
- `002_word_bank.sql` — банк слов для Вордл

---

## Структура проекта

```
src/
  pages/       — страницы (Dashboard, CreateTestPage, ClassesPage, WordlePage, ...)
  components/  — переиспользуемые компоненты (Header, QuizPlayer, WordleGame, ...)
  lib/         — утилиты (i18n, prompt builder, quiz parser)
  api.js       — все запросы к бэкенду
backend/
  public/      — точка входа (index.php, все роуты)
  src/         — DB, Auth, GenerateStream, DocxExport
  extras/      — миграции
```

---

© 2026 LESSON.LAB — All rights reserved
