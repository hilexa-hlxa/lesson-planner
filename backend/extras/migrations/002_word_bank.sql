-- Word Bank for Wordle solo mode (10 words × 3 languages = 30 words)
CREATE TABLE IF NOT EXISTS word_bank (
  id SERIAL PRIMARY KEY,
  word TEXT NOT NULL,
  lang VARCHAR(5) NOT NULL CHECK (lang IN ('RU', 'KZ', 'EN')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_word_bank_lang ON word_bank (lang);

INSERT INTO word_bank (word, lang) VALUES
  ('СЛОВО', 'RU'), ('КНИГА', 'RU'), ('ШКОЛА', 'RU'), ('КЛАСС', 'RU'), ('ОТВЕТ', 'RU'),
  ('НАУКА', 'RU'), ('КАРТА', 'RU'), ('ТЕКСТ', 'RU'), ('ДОСКА', 'RU'), ('УРОКИ', 'RU'),
  ('САБАҚ', 'KZ'), ('КІТАП', 'KZ'), ('ОҚУШЫ', 'KZ'), ('БІЛІМ', 'KZ'), ('ЖАУАП', 'KZ'),
  ('ОЙЛАН', 'KZ'), ('САНАҚ', 'KZ'), ('ШЕШІМ', 'KZ'), ('ҚАЛАМ', 'KZ'), ('ОҚЫТУ', 'KZ'),
  ('LEARN', 'EN'), ('CLASS', 'EN'), ('GRADE', 'EN'), ('STUDY', 'EN'), ('BOOKS', 'EN'),
  ('NOTES', 'EN'), ('TESTS', 'EN'), ('CHALK', 'EN'), ('BOARD', 'EN'), ('PAPER', 'EN')
ON CONFLICT DO NOTHING;

-- Wordle class sessions (teacher starts, students join with 4-digit code)
CREATE TABLE IF NOT EXISTS wordle_sessions (
  id SERIAL PRIMARY KEY,
  teacher_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  lang VARCHAR(5) NOT NULL DEFAULT 'RU',
  access_code VARCHAR(4) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '4 hours'),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wordle_sessions_code ON wordle_sessions (access_code);
