ALTER TABLE generations ADD COLUMN type TEXT NOT NULL DEFAULT 'lesson_plan';
CREATE INDEX IF NOT EXISTS idx_generations_type ON generations(type);
