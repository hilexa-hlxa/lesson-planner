-- Migration 001: Class roster system

-- Add phone number to users (for student profiles)
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(30);

-- Classes created by teachers
CREATE TABLE IF NOT EXISTS classes (
  id          SERIAL PRIMARY KEY,
  teacher_id  INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        VARCHAR(100) NOT NULL,
  join_code   CHAR(6) UNIQUE NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Student membership in a class
CREATE TABLE IF NOT EXISTS class_members (
  id          SERIAL PRIMARY KEY,
  class_id    INT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  student_id  INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status      VARCHAR(20) NOT NULL DEFAULT 'pending',
  applied_at  TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  UNIQUE(class_id, student_id)
);

-- Link a quiz generation to a class (nullable — existing quizzes unaffected)
ALTER TABLE generations ADD COLUMN IF NOT EXISTS class_id INT REFERENCES classes(id) ON DELETE SET NULL;

-- Link quiz results to a student account (nullable — legacy guest results kept)
ALTER TABLE quiz_results ADD COLUMN IF NOT EXISTS student_id INT REFERENCES users(id) ON DELETE SET NULL;
