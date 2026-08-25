-- 006: инфраструктура для новой игротеки (Math Battle, Memory Match, Hangman,
-- Word Sprint, Sort It Out, Trivia Race, Spin & Answer, Daily Streak Challenge)
--
-- game_scores — один общий журнал личных рекордов вместо отдельной таблицы на
-- каждую игру: Math Battle (соло), Memory Match, Word Sprint и Sort It Out не
-- нуждаются в собственном состоянии сессии, им нужно только сохранить лучший
-- результат. game_key отличает игру, meta хранит игро-специфичные детали
-- (например {wpm, accuracy} для Word Sprint), не раздувая схему новыми колонками.
--
-- *_sessions/*_players — те игры, что учитель реально «хостит» классом по коду,
-- получают собственную пару таблиц по образу wordle_sessions: код на 4 цифры,
-- TTL, генерируется с retry-циклом на уникальность (см. /api/wordle/session).
-- Отдельные таблицы на игру (а не общая) — потому что у Wordle-игры и игры в
-- Виселицу разная предметная область (см. CONTEXT.md), и путать их в одной
-- таблице значило бы стирать это различие.
--
-- user_streaks — ежедневная серия Daily Challenge. last_completed_date
-- сравнивается с CURRENT_DATE на сервере (не с датой от клиента), иначе
-- пользователь мог бы подделать себе серию, просто поменяв часы телефона.
--
-- coin_awards — журнал начислений монет учителем через колесо (Spin & Answer).
-- Не обязателен для работы функции, но нужен и для отладки жалоб «мне не
-- начислили», и как ключ для ограничения частоты (см. /api/coins/award).

CREATE TABLE IF NOT EXISTS game_scores (
  id         SERIAL PRIMARY KEY,
  user_id    INT REFERENCES users(id) ON DELETE CASCADE,
  game_key   VARCHAR(50) NOT NULL,
  score      INT NOT NULL DEFAULT 0,
  meta       JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS game_scores_user_game_idx ON game_scores (user_id, game_key);

CREATE TABLE IF NOT EXISTS math_battle_sessions (
  id           SERIAL PRIMARY KEY,
  teacher_id   INT REFERENCES users(id) ON DELETE CASCADE,
  access_code  VARCHAR(4) NOT NULL UNIQUE,
  grade        INT NOT NULL DEFAULT 5,
  problem_count INT NOT NULL DEFAULT 15,
  -- Задачи и верные ответы генерируются один раз при создании сессии и хранятся
  -- на сервере — иначе дуэль было бы легко выиграть, поправив ответ в devtools
  problems_json JSONB NOT NULL,
  expires_at   TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '4 hours'),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_math_battle_sessions_code ON math_battle_sessions (access_code);

CREATE TABLE IF NOT EXISTS math_battle_players (
  id           SERIAL PRIMARY KEY,
  session_id   INT NOT NULL REFERENCES math_battle_sessions(id) ON DELETE CASCADE,
  student_name VARCHAR(160) NOT NULL,
  student_id   INT REFERENCES users(id) ON DELETE SET NULL,
  solved_count INT NOT NULL DEFAULT 0,
  finished_at  TIMESTAMPTZ,
  joined_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_math_battle_players_session ON math_battle_players (session_id);

CREATE TABLE IF NOT EXISTS hangman_sessions (
  id          SERIAL PRIMARY KEY,
  teacher_id  INT REFERENCES users(id) ON DELETE CASCADE,
  word        TEXT NOT NULL,
  lang        VARCHAR(5) NOT NULL DEFAULT 'RU',
  access_code VARCHAR(4) NOT NULL UNIQUE,
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '4 hours'),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hangman_sessions_code ON hangman_sessions (access_code);

CREATE TABLE IF NOT EXISTS trivia_race_sessions (
  id           SERIAL PRIMARY KEY,
  teacher_id   INT REFERENCES users(id) ON DELETE CASCADE,
  -- Вопросы берутся из уже существующего Теста (generations.type = 'test'),
  -- а не дублируются — тот же принцип, что и у /api/quiz/*
  quiz_id      INT NOT NULL REFERENCES generations(id) ON DELETE CASCADE,
  access_code  VARCHAR(4) NOT NULL UNIQUE,
  board_length INT NOT NULL DEFAULT 20,
  expires_at   TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '4 hours'),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trivia_race_sessions_code ON trivia_race_sessions (access_code);

CREATE TABLE IF NOT EXISTS trivia_race_players (
  id             SERIAL PRIMARY KEY,
  session_id     INT NOT NULL REFERENCES trivia_race_sessions(id) ON DELETE CASCADE,
  student_name   VARCHAR(160) NOT NULL,
  student_id     INT REFERENCES users(id) ON DELETE SET NULL,
  position       INT NOT NULL DEFAULT 0,
  answered_count INT NOT NULL DEFAULT 0,
  finished_at    TIMESTAMPTZ,
  joined_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trivia_race_players_session ON trivia_race_players (session_id);

CREATE TABLE IF NOT EXISTS user_streaks (
  user_id             INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  current_streak      INT NOT NULL DEFAULT 0,
  longest_streak      INT NOT NULL DEFAULT 0,
  last_completed_date DATE,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS coin_awards (
  id         SERIAL PRIMARY KEY,
  teacher_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  student_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount     INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coin_awards_teacher ON coin_awards (teacher_id, created_at);
