-- 003: попытки прохождения теста и счётчики частоты запросов
--
-- quiz_attempts закрывает дыру, оставшуюся после переноса проверки ответов на
-- сервер: /api/quiz/answer раскрывал правильный вариант по номеру вопроса, и
-- ничто не мешало запросить все номера подряд до того, как отвечать. Теперь у
-- каждой попытки есть позиция, и раскрыть можно только тот вопрос, до которого
-- ученик реально дошёл. Выбранные варианты тоже хранятся здесь, поэтому балл
-- считается по серверным данным, а не по тому, что прислал клиент.
--
-- rate_limits — общий счётчик обращений (окно + количество). Нужен потому, что
-- воркеры PHP не делят память между собой: счётчик должен жить в базе.

CREATE TABLE IF NOT EXISTS quiz_attempts (
  id             SERIAL PRIMARY KEY,
  quiz_id        INT NOT NULL REFERENCES generations(id) ON DELETE CASCADE,
  -- В базе лежит sha256 от токена; сам токен есть только у ученика
  token_hash     CHAR(64) NOT NULL UNIQUE,
  session_code   VARCHAR(10) NOT NULL,
  student_name   VARCHAR(160) NOT NULL,
  student_id     INT REFERENCES users(id) ON DELETE SET NULL,
  -- Сколько вопросов уже отвечено — она же позиция: раскрывать можно только её
  answered_count INT NOT NULL DEFAULT 0,
  -- Выбранные варианты по порядку вопросов
  answers_json   JSONB NOT NULL DEFAULT '[]'::jsonb,
  submitted_at   TIMESTAMPTZ,
  expires_at     TIMESTAMPTZ NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS quiz_attempts_quiz_idx    ON quiz_attempts (quiz_id);
CREATE INDEX IF NOT EXISTS quiz_attempts_expires_idx ON quiz_attempts (expires_at);
-- Одно засчитанное прохождение на имя в рамках одной сессии кода
CREATE UNIQUE INDEX IF NOT EXISTS quiz_attempts_done_idx
  ON quiz_attempts (quiz_id, session_code, lower(student_name))
  WHERE submitted_at IS NOT NULL;

CREATE TABLE IF NOT EXISTS rate_limits (
  bucket       VARCHAR(200) PRIMARY KEY,
  hits         INT NOT NULL DEFAULT 0,
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS rate_limits_window_idx ON rate_limits (window_start);
