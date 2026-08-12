-- 004: тип генерации (план урока / тест)
--
-- Клиент с самого начала присылал type в POST /api/generations, но колонки под
-- него не было и значение молча терялось. Из-за этого страницы не могли
-- отличить план от теста: история на /dashboard показывала всё подряд, а
-- библиотека на /create-test с фильтром `type === 'test'` — вообще ничего.

ALTER TABLE generations
  ADD COLUMN IF NOT EXISTS type VARCHAR(32) NOT NULL DEFAULT 'lesson_plan';

-- Разбор того, что было создано до появления колонки: код доступа выдаётся
-- только тестам, поэтому по нему их и опознаём. Остальное — планы уроков.
-- Повторный прогон безопасен: строки, уже помеченные 'test', под условие не
-- попадают, а у планов кода доступа не бывает.
UPDATE generations
   SET type = 'test'
 WHERE type = 'lesson_plan'
   AND access_code IS NOT NULL;

CREATE INDEX IF NOT EXISTS generations_user_type_idx ON generations (user_id, type);
