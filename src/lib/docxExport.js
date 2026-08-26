// Общий помощник для /api/export/simple-docx — POST, а не GET, потому что
// сгенерированный текст (worksheet/rubric/study guide) может быть длиннее,
// чем разумно пихать в query string. Ответ — сырые байты .docx, поэтому
// напрямую через api.js (там везде res.json()) не пройдёт — читаем как blob
// и скачиваем через временный <a>.
const API_PREFIX = `${import.meta.env.VITE_API_BASE_URL ?? ''}/api`;

export async function downloadDocx(title, content) {
  const res = await fetch(`${API_PREFIX}/export/simple-docx`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, content }),
  });

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try { message = (await res.json())?.error || message; } catch { /* body wasn't JSON */ }
    throw new Error(message);
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title.replace(/[^\p{L}\p{N}_-]+/gu, '_') || 'export'}.docx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
