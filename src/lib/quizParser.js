export const parseMarkdownQuiz = (markdown) => {
  if (!markdown) return [];

  const questions = [];
  // Разбиваем текст по заголовкам "## " (это начало вопроса)
  const blocks = markdown.split(/^## /m).filter(b => b.trim());

  blocks.forEach(block => {
    // Первая строка блока — это сам вопрос
    const lines = block.split('\n').filter(line => line.trim());
    if (lines.length < 2) return; // Если нет вопроса или ответов — пропускаем

    const questionText = lines[0].trim();
    const options = [];
    let correctIndex = 0;
    let currentOptionIndex = 0;

    // Ищем строки, начинающиеся с тире или звездочки (варианты ответов)
    // Формат: "- [ ] Ответ" или "- [x] Ответ"
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Регулярка ищет: (дефис/звезда) [пробел или x] (текст)
      const match = line.match(/^[-*]\s*\[([ xX])\]\s*(.+)$/);
      
      if (match) {
        const isCorrect = match[1].toLowerCase() === 'x';
        const text = match[2].trim();
        
        options.push(text);
        if (isCorrect) {
          correctIndex = currentOptionIndex;
        }
        currentOptionIndex++;
      }
    }

    // Добавляем вопрос только если есть минимум 2 варианта ответа
    if (options.length >= 2) {
      questions.push({
        question: questionText,
        options: options,
        correctIndex: correctIndex
      });
    }
  });

  return questions;
};