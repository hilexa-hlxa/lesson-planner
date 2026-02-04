import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Play, RefreshCw, Eye, X, History, Sparkles, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

import { I18N as t } from '../lib/i18n';
import { buildPrompt } from '../lib/prompt';
import api from '../api';

const API_URL = 'http://localhost:8000/api';

const CreateTestPage = ({ lang, promptConfig }) => {
  // --- STATES ---
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState('5');
  const [loading, setLoading] = useState(false);
  
  const [generatedTest, setGeneratedTest] = useState(null); 
  const [accessCode, setAccessCode] = useState(null);
  const [report, setReport] = useState(null);
  
  const [library, setLibrary] = useState([]);
  const [showLibrary, setShowLibrary] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // States for AI Report
  const [showReportModal, setShowReportModal] = useState(false);
  const [aiReport, setAiReport] = useState("");
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [lessonContext, setLessonContext] = useState("");
  const [copied, setCopied] = useState(false); // Для анимации копирования

  const [testUi, setTestUi] = useState({
    difficulty: "medium",
    total: 10,
    includeAnswers: true,
    shuffle: false,
  });

  const cur = t[lang] || t.RU;

  // --- EFFECTS ---
  useEffect(() => { loadLibrary(); }, []);

  const loadLibrary = async () => {
    try {
        const res = await api.generations.list(50);
        const tests = (res.items || []).filter(item => item.subject); 
        setLibrary(tests);
    } catch (e) { console.error(e); }
  };

  // --- HANDLERS ---
  const handleSelectOldTest = (test) => {
      setGeneratedTest(test);
      setAccessCode(test.access_code); 
      setReport(null);
      setTopic(test.topic);
      setSubject(test.subject);
      setLessonContext(""); 
      fetchReport(test.id);
      setShowLibrary(false);
  };

  const handleGenerate = async () => {
    setLoading(true); setAccessCode(null); setGeneratedTest(null); setReport(null); setSelectedStudent(null);
    try {
        const vars = { lang, subject, topic, grade, details: "" };
        const mergedCfg = { ...promptConfig, tests: { ...promptConfig?.tests, ...testUi } };
        const promptText = buildPrompt("tests", vars, mergedCfg);

        const gen = await api.generations.create({
            subject: subject || "Test", topic: topic, grade: grade, lang, prompt: promptText, status: "running"
        });

        let accumulatedText = "";
        for await (const evt of api.generateStream({ prompt: promptText })) {
            const delta = typeof evt === "string" ? evt : (evt?.type === "delta" ? evt.text : "");
            if (delta) accumulatedText += delta;
        }

        await api.generations.update(gen.id, { status: "done", result_md: accumulatedText });
        const newTest = { id: gen.id, result_md: accumulatedText, topic, subject, access_code: null };
        setGeneratedTest(newTest);
        loadLibrary();

    } catch (e) { console.error(e); alert("Ошибка при генерации."); } finally { setLoading(false); }
  };

  const handleStartSession = async () => {
     if (!generatedTest) return;
     try {
         const res = await fetch(`${API_URL}/quiz/start`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ id: generatedTest.id }),
            credentials: 'include'
         });
         if (!res.ok) { alert("Ошибка сервера"); return; }
         const data = await res.json();
         const code = data.data?.code || data.code;
         if (code) {
             setAccessCode(code);
             setGeneratedTest(prev => ({...prev, access_code: code}));
         }
     } catch(e) { console.error(e); alert("Ошибка сети."); }
  };

  const fetchReport = async (forceId = null) => {
    const idToFetch = forceId || generatedTest?.id;
    if (!idToFetch) return;
    try {
        const res = await fetch(`${API_URL}/quiz/${idToFetch}/report`, {credentials: 'include'});
        const data = await res.json();
        setReport(data.data?.results || data.results || []);
    } catch (e) { console.error(e); }
  };

  const getDetailsSafe = (student) => {
      if (!student || !student.answers_json) return [];
      const raw = student.answers_json;
      try {
          if (typeof raw === 'object') return Array.isArray(raw) ? raw : [];
          if (typeof raw === 'string') {
              const parsed = JSON.parse(raw);
              if (typeof parsed === 'string') { 
                  const deepParsed = JSON.parse(parsed);
                  return Array.isArray(deepParsed) ? deepParsed : [];
              }
              return Array.isArray(parsed) ? parsed : [];
          }
      } catch (e) { return []; }
      return [];
  };

  // --- КОПИРОВАНИЕ ОТЧЕТА ---
  const copyToClipboard = () => {
      if (!aiReport) return;
      navigator.clipboard.writeText(aiReport);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  // --- ГЕНЕРАЦИЯ AI ОТЧЕТА ---
  const generateAiReport = async (type) => {
    if (!report || report.length === 0) {
        alert("Нет данных для анализа. Сначала ученики должны пройти тест.");
        return;
    }
    setIsGeneratingReport(true);
    setAiReport(""); 

    try {
        // Подготовка данных. Для "Для себя" собираем больше деталей.
        const summaryData = report.map(r => ({
            name: r.student_name,
            score: `${r.score}/${r.total_questions}`,
            time: `${r.duration_seconds}s`,
            // Если отчет для тренера - добавляем маркеры ошибок, если они есть
            status: type === 'coach' 
                ? (r.percentage === 100 ? "Отлично" : `Ошибки: ${getDetailsSafe(r).filter(d => !d.isCorrect).length} шт.`) 
                : `${r.percentage}%`
        }));

        const contextInfo = lessonContext 
            ? `Контекст урока: "${lessonContext}".` 
            : `Тема: ${topic}.`;

        let promptSystem = "";
        
        if (type === 'judge') {
            // ОТЧЕТ ДЛЯ РУКОВОДСТВА
            promptSystem = `
            Роль: Школьный методист.
            Задача: Составь ОФИЦИАЛЬНЫЙ ОТЧЕТ для директора.
            ${contextInfo}
            Данные: ${JSON.stringify(summaryData)}.
            
            Требования:
            1. Стиль: Сухой, деловой.
            2. Структура:
               - Общая статистика (Успеваемость %, Качество %).
               - Таблица результатов.
               - Список отстающих (<50%).
            3. Без советов. Markdown.
            `;
        } else {
            // ОТЧЕТ ДЛЯ СЕБЯ (Упростил промпт для надежности)
            promptSystem = `
            Роль: Опытный педагог-наставник.
            Задача: Напиши АНАЛИТИЧЕСКУЮ ЗАПИСКУ учителю по итогам теста.
            ${contextInfo}
            Данные учеников: ${JSON.stringify(summaryData)}.
            
            Требования:
            1. Оцени общее понимание темы классом (на основе баллов).
            2. Выдели группы риска (кто сдал хуже всех или решал слишком быстро/медленно).
            3. Дай 3 конкретных методических совета: что повторить на следующем уроке.
            4. Напиши краткие рекомендации для слабых учеников.
            Стиль: Полезный, без воды. Markdown.
            `;
        }

        let accumulatedText = "";
        for await (const evt of api.generateStream({ prompt: promptSystem })) {
            const delta = typeof evt === "string" ? evt : (evt?.type === "delta" ? evt.text : "");
            if (delta) accumulatedText += delta;
            setAiReport(accumulatedText);
        }

    } catch (e) {
        console.error(e);
        alert("Ошибка генерации AI отчета");
    } finally {
        setIsGeneratingReport(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-white p-6 md:p-10 font-sans flex flex-col md:flex-row gap-8">
      
      {/* ЛЕВАЯ ЧАСТЬ */}
      <div className="flex-1 max-w-4xl mx-auto w-full">
        <Link to="/hub" className="inline-flex items-center gap-2 font-black uppercase text-xs mb-8 text-gray-500 hover:text-black dark:hover:text-white">
            <ChevronLeft size={16} /> {cur.back || "Назад"}
        </Link>
        
        <div className="flex justify-between items-end mb-8">
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight">AI Quiz Creator</h1>
            <button className="md:hidden p-3 bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-200" onClick={() => setShowLibrary(!showLibrary)}>
                <History size={20}/>
            </button>
        </div>

        {/* ПАНЕЛЬ СОЗДАНИЯ */}
        <div className="bg-white dark:bg-zinc-900 p-6 md:p-8 rounded-[40px] border-[4px] border-black dark:border-white shadow-[8px_8px_0_0_#000] mb-8">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
               <div>
                   <label className="font-bold block mb-2 opacity-60 text-xs uppercase tracking-widest">{cur.s || "Предмет"}</label>
                   <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Математика" className="w-full p-4 bg-slate-100 dark:bg-zinc-800 rounded-xl font-bold outline-none" />
               </div>
               <div>
                   <label className="font-bold block mb-2 opacity-60 text-xs uppercase tracking-widest">Класс</label>
                   <select value={grade} onChange={e => setGrade(e.target.value)} className="w-full p-4 bg-slate-100 dark:bg-zinc-800 rounded-xl font-bold outline-none appearance-none cursor-pointer">
                        {[...Array(11)].map((_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}
                   </select>
               </div>
           </div>
           <label className="font-bold block mb-2 opacity-60 text-xs uppercase tracking-widest">{cur.t || "Тема"}</label>
           <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="Тема теста..." className="w-full p-4 bg-slate-100 dark:bg-zinc-800 rounded-xl font-bold outline-none mb-6" />
           
           <button onClick={handleGenerate} disabled={loading || !topic} className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-white transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 ${loading || !topic ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600'}`}>
                {loading ? "ГЕНЕРАЦИЯ..." : "СОЗДАТЬ ТЕСТ"}
           </button>
        </div>

        {/* АКТИВНЫЙ ТЕСТ */}
        {generatedTest && (
           <div className="bg-white dark:bg-zinc-900 p-6 md:p-8 rounded-[40px] border-[4px] border-blue-600 shadow-[8px_8px_0_0_#2563eb] animate-in fade-in slide-in-from-bottom-4">
              <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4 border-b border-gray-100 dark:border-zinc-800 pb-6">
                 <div>
                    <h2 className="text-2xl font-black text-blue-600 uppercase mb-1">{generatedTest.subject || "Тест"}</h2>
                    <p className="font-bold opacity-60 text-sm">Тема: {generatedTest.topic}</p>
                 </div>
                 
                 {!accessCode ? (
                    <button onClick={handleStartSession} className="w-full md:w-auto py-3 px-6 bg-green-500 text-white rounded-xl font-black uppercase shadow-[4px_4px_0_0_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition border-2 border-black flex items-center justify-center gap-2">
                       <Play size={20} /> Запустить Сессию
                    </button>
                 ) : (
                    <div className="w-full md:w-auto text-right bg-black text-white p-4 rounded-2xl animate-in zoom-in">
                       <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest mb-1">Код доступа</p>
                       <p className="text-5xl font-black tracking-[0.2em] font-mono text-yellow-400 leading-none text-center md:text-right">{accessCode}</p>
                    </div>
                 )}
              </div>

              {/* ТАБЛИЦА СТУДЕНТОВ */}
              <div className="mb-8 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl border-2 border-slate-100 dark:border-zinc-700 overflow-hidden">
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-700">
                        <h3 className="font-black text-sm uppercase flex items-center gap-2">📊 Успеваемость</h3>
                        <div className="flex gap-2">
                             <button 
                                onClick={() => setShowReportModal(true)}
                                className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg text-xs font-black uppercase shadow-sm hover:bg-purple-700 transition"
                            >
                                <Sparkles size={14} /> AI Отчет
                            </button>
                            <button onClick={() => fetchReport()} className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-zinc-800 rounded-lg text-xs font-black uppercase shadow-sm hover:text-blue-600 transition">
                                <RefreshCw size={12}/>
                            </button>
                        </div>
                    </div>

                    {report && report.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-[10px] font-black uppercase text-gray-400 border-b border-gray-200 dark:border-zinc-700">
                                        <th className="p-3">Ученик</th>
                                        <th className="p-3">Баллы</th>
                                        <th className="p-3">Время</th>
                                        <th className="p-3">Действие</th>
                                    </tr>
                                </thead>
                                <tbody className="font-bold text-sm">
                                    {report.map((r, i) => (
                                        <tr key={i} className="border-b border-gray-100 dark:border-zinc-700/50 last:border-0 hover:bg-white dark:hover:bg-zinc-800 transition">
                                            <td className="p-3">{r.student_name}</td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 rounded text-xs text-white ${r.percentage >= 80 ? 'bg-green-500' : r.percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}>
                                                    {r.score}/{r.total_questions}
                                                </span>
                                            </td>
                                            <td className="p-3 text-gray-500">{r.duration_seconds}с</td>
                                            <td className="p-3">
                                                <button onClick={() => setSelectedStudent(r)} className="px-3 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition text-[10px] font-black uppercase">
                                                    <Eye size={14} /> Детали
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-400 text-xs font-bold uppercase tracking-widest">
                            {accessCode ? "Ждем результаты..." : "Запустите сессию"}
                        </div>
                    )}
              </div>

              <div className="bg-slate-50 dark:bg-zinc-800 p-6 rounded-2xl border-2 border-slate-200 dark:border-zinc-700 max-h-60 overflow-y-auto prose dark:prose-invert text-sm">
                 <ReactMarkdown>{generatedTest.result_md}</ReactMarkdown>
              </div>
           </div>
        )}
      </div>

      {/* ПРАВАЯ ЧАСТЬ - БИБЛИОТЕКА */}
      <div className={`fixed inset-y-0 right-0 w-80 bg-white dark:bg-zinc-950 shadow-2xl p-6 transform transition-transform duration-300 z-40 md:static md:transform-none md:w-80 md:shadow-none md:bg-transparent md:block ${showLibrary ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
        <div className="flex justify-between items-center mb-6">
            <h3 className="font-black text-sm uppercase tracking-widest text-gray-500">Библиотека</h3>
            <button onClick={() => setShowLibrary(false)} className="md:hidden"><X size={20}/></button>
        </div>
        <div className="space-y-3 overflow-y-auto h-[calc(100vh-100px)]">
            {library.map((item) => (
                <div key={item.id} onClick={() => handleSelectOldTest(item)} className={`p-4 rounded-2xl border-2 cursor-pointer transition-all hover:scale-[1.02] ${generatedTest?.id === item.id ? 'bg-blue-600 border-black text-white shadow-md' : 'bg-white dark:bg-zinc-900 border-gray-100 dark:border-zinc-800 hover:border-blue-300'}`}>
                    <h4 className="font-black text-sm mb-1 line-clamp-2">{item.topic}</h4>
                    <div className="flex justify-between items-center opacity-70 text-[10px] font-bold uppercase tracking-wider">
                        <span>{item.subject}</span>
                        <span>{new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* МОДАЛКА: AI ОТЧЕТ */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-[30px] p-6 md:p-8 shadow-2xl border-[4px] border-purple-600 max-h-[90vh] overflow-y-auto flex flex-col">
                <h3 className="text-2xl font-black uppercase mb-2 flex-shrink-0">Генерация Отчета</h3>
                
                {!aiReport ? (
                    <div className="grid grid-cols-1 gap-4 overflow-y-auto">
                        <div>
                            <label className="text-xs font-black uppercase text-gray-500 mb-1 block">
                                Что проходили на уроке? (Опционально)
                            </label>
                            <textarea 
                                value={lessonContext}
                                onChange={(e) => setLessonContext(e.target.value)}
                                placeholder="Например: Разбирали дискриминант и формулу корней..."
                                className="w-full p-3 bg-slate-50 dark:bg-zinc-800 rounded-xl border-2 border-gray-200 dark:border-zinc-700 focus:border-purple-500 outline-none text-sm font-bold min-h-[80px]"
                            />
                        </div>

                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2">Тип отчета:</p>

                        <button onClick={() => generateAiReport('coach')} disabled={isGeneratingReport} className="p-4 border-2 border-gray-200 dark:border-zinc-700 rounded-2xl hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 text-left transition group">
                            <div className="font-black text-lg uppercase group-hover:text-purple-600">🎓 Отчет для себя</div>
                            <p className="text-xs text-gray-400 font-bold mt-1">Анализ ошибок, советы, контекст урока.</p>
                        </button>

                        <button onClick={() => generateAiReport('judge')} disabled={isGeneratingReport} className="p-4 border-2 border-gray-200 dark:border-zinc-700 rounded-2xl hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-left transition group">
                            <div className="font-black text-lg uppercase group-hover:text-blue-600">⚖️ Отчет для руководства</div>
                            <p className="text-xs text-gray-400 font-bold mt-1">Официальная сводка, таблица, факты.</p>
                        </button>
                        
                        {isGeneratingReport && <div className="text-center font-black animate-pulse mt-4 text-purple-600">ИИ АНАЛИЗИРУЕТ ДАННЫЕ...</div>}
                        {!isGeneratingReport && <button onClick={() => setShowReportModal(false)} className="mt-2 w-full py-3 font-bold text-gray-400 hover:text-red-500">Отмена</button>}
                    </div>
                ) : (
                    <div className="animate-in zoom-in flex flex-col h-full">
                        <div className="bg-slate-50 dark:bg-zinc-950 p-4 rounded-xl flex-1 overflow-y-auto prose dark:prose-invert text-sm border-2 border-purple-100 mb-4">
                            <ReactMarkdown>{aiReport}</ReactMarkdown>
                        </div>
                        <div className="flex gap-4 flex-shrink-0">
                            <button onClick={() => setAiReport("")} className="flex-1 py-3 font-bold text-gray-400 hover:text-black">Назад</button>
                            {/* КНОПКА КОПИРОВАТЬ */}
                            <button 
                                onClick={copyToClipboard} 
                                className={`flex-1 py-3 ${copied ? 'bg-green-500' : 'bg-purple-600'} text-white rounded-xl font-bold uppercase flex items-center justify-center gap-2 transition-all`}
                            >
                                {copied ? <Check size={18} /> : <Copy size={18} />}
                                {copied ? "Скопировано!" : "Копия"}
                            </button>
                            <button onClick={() => setShowReportModal(false)} className="flex-1 py-3 bg-black text-white rounded-xl font-bold uppercase">Закрыть</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
      )}

      {/* МОДАЛКА: ДЕТАЛИ СТУДЕНТА */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in zoom-in duration-200">
            <div className="bg-white dark:bg-zinc-900 w-full max-w-lg max-h-[80vh] overflow-hidden rounded-[30px] shadow-2xl flex flex-col border-[4px] border-black dark:border-gray-700">
                <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center bg-gray-50 dark:bg-zinc-800/50">
                    <div>
                        <h3 className="text-xl font-black uppercase">{selectedStudent.student_name}</h3>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                            Детальный разбор
                        </p>
                    </div>
                    <button onClick={() => setSelectedStudent(null)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700 transition">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-0 overflow-y-auto bg-slate-100 dark:bg-zinc-950">
                    {getDetailsSafe(selectedStudent).length > 0 ? (
                        <div className="divide-y divide-gray-200 dark:divide-zinc-800">
                            {getDetailsSafe(selectedStudent).map((detail, idx) => (
                                <div key={idx} className="p-5 bg-white dark:bg-zinc-900 flex items-center justify-between">
                                    <div className="flex flex-col gap-1">
                                        <span className="font-black text-xs uppercase text-gray-400">Вопрос {idx + 1}</span>
                                        <div className="flex items-center gap-2">
                                            {detail.isCorrect ? (
                                                <span className="text-green-600 font-black text-sm uppercase">✅ Правильно</span>
                                            ) : (
                                                <span className="text-red-500 font-black text-sm uppercase">❌ Неправильно</span>
                                            )}
                                            <span className="text-gray-300">|</span>
                                            <span className="font-bold text-sm text-black dark:text-white">
                                                Потрачено: {detail.time}с
                                            </span>
                                        </div>
                                    </div>
                                    <div className={`w-3 h-3 rounded-full ${detail.isCorrect ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-10 text-center text-gray-400 italic font-bold">
                            Нет детальных данных (возможно, старая запись)
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default CreateTestPage;