-- 007: журнал поведения/участия — быстрые заметки учителя по ученику во
-- время урока (Behavior/Participation Log). Отдельная таблица, а не
-- расширение user_achievements/game_scores: это не награда и не игровой
-- результат, а обычная текстовая запись с плюсом/минусом, которую учитель
-- потом читает как список, а не превращает в баллы.

CREATE TABLE IF NOT EXISTS behavior_notes (
  id         SERIAL PRIMARY KEY,
  teacher_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  class_id   INT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  student_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type       VARCHAR(10) NOT NULL CHECK (type IN ('positive', 'negative')),
  note       TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_behavior_notes_class ON behavior_notes (class_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_behavior_notes_student ON behavior_notes (student_id, created_at DESC);
