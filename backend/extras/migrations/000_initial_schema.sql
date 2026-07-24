-- Migration 000: Full initial schema
-- Run this on a fresh PostgreSQL database (e.g. Supabase)

-- =============================================
-- Roles
-- =============================================
CREATE TABLE IF NOT EXISTS roles (
  id   SERIAL PRIMARY KEY,
  code VARCHAR(30) UNIQUE NOT NULL
);

INSERT INTO roles (code) VALUES ('teacher'), ('student'), ('parent')
ON CONFLICT (code) DO NOTHING;

-- =============================================
-- Users
-- =============================================
CREATE TABLE IF NOT EXISTS users (
  id                  SERIAL PRIMARY KEY,
  email               VARCHAR(255) UNIQUE NOT NULL,
  password_hash       TEXT NOT NULL,
  display_name        VARCHAR(160),
  first_name          VARCHAR(80),
  last_name           VARCHAR(80),
  phone               VARCHAR(30),
  coins               INT NOT NULL DEFAULT 0,
  failed_login_count  INT NOT NULL DEFAULT 0,
  lock_until          TIMESTAMPTZ,
  last_login_at       TIMESTAMPTZ,
  is_active           BOOLEAN NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- User ↔ Roles (many-to-many)
-- =============================================
CREATE TABLE IF NOT EXISTS user_roles (
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id INT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);

-- =============================================
-- Sessions
-- =============================================
CREATE TABLE IF NOT EXISTS sessions (
  id                  SERIAL PRIMARY KEY,
  user_id             INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token_hash  CHAR(64) UNIQUE NOT NULL,
  expires_at          TIMESTAMPTZ NOT NULL,
  ip                  VARCHAR(45),
  user_agent          TEXT,
  last_seen_at        TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS sessions_token_idx ON sessions (session_token_hash);
CREATE INDEX IF NOT EXISTS sessions_expires_idx ON sessions (expires_at);

-- =============================================
-- Generations (lesson plans + tests)
-- =============================================
CREATE TABLE IF NOT EXISTS generations (
  id                   SERIAL PRIMARY KEY,
  user_id              INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject              VARCHAR(255) NOT NULL,
  topic                VARCHAR(255) NOT NULL,
  details              TEXT,
  grade                INT,
  duration             INT,
  lang                 VARCHAR(10) NOT NULL DEFAULT 'RU',
  prompt               TEXT NOT NULL,
  status               VARCHAR(30) NOT NULL DEFAULT 'pending',
  result_md            TEXT,
  result_json          JSONB,
  result_json_version  INT,
  template_key         VARCHAR(100),
  error                TEXT,
  access_code          VARCHAR(10),
  code_expires_at      TIMESTAMPTZ,
  class_id             INT,
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS generations_user_idx ON generations (user_id);
CREATE INDEX IF NOT EXISTS generations_code_idx ON generations (access_code) WHERE access_code IS NOT NULL;

-- =============================================
-- Quiz Results
-- =============================================
CREATE TABLE IF NOT EXISTS quiz_results (
  id               SERIAL PRIMARY KEY,
  quiz_id          INT NOT NULL REFERENCES generations(id) ON DELETE CASCADE,
  student_name     VARCHAR(160) NOT NULL DEFAULT 'Guest',
  student_id       INT REFERENCES users(id) ON DELETE SET NULL,
  score            INT NOT NULL DEFAULT 0,
  total_questions  INT NOT NULL,
  percentage       INT NOT NULL DEFAULT 0,
  duration_seconds INT NOT NULL DEFAULT 0,
  answers_json     JSONB,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS quiz_results_quiz_idx ON quiz_results (quiz_id);

-- =============================================
-- User Achievements
-- =============================================
CREATE TABLE IF NOT EXISTS user_achievements (
  id              SERIAL PRIMARY KEY,
  user_id         INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_key VARCHAR(100) NOT NULL,
  granted_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, achievement_key)
);

-- =============================================
-- Classes
-- =============================================
CREATE TABLE IF NOT EXISTS classes (
  id          SERIAL PRIMARY KEY,
  teacher_id  INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        VARCHAR(100) NOT NULL,
  join_code   CHAR(6) UNIQUE NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Class Members
-- =============================================
CREATE TABLE IF NOT EXISTS class_members (
  id          SERIAL PRIMARY KEY,
  class_id    INT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  student_id  INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status      VARCHAR(20) NOT NULL DEFAULT 'pending',
  applied_at  TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  UNIQUE (class_id, student_id)
);

-- =============================================
-- Foreign key: generations.class_id
-- (added after classes table exists)
-- =============================================
ALTER TABLE generations
  ADD CONSTRAINT fk_generations_class
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL
  NOT VALID;
