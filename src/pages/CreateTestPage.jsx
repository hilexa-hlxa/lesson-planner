import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Play, RefreshCw, Eye, X, History, Sparkles, Copy, Check, ClipboardList, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

import { I18N as t } from '../lib/i18n';
import { buildPrompt } from '../lib/prompt';
import api from '../api';
import Header from "../components/Header";

// Сообщения об ошибках страницы (вместо браузерных alert)
const ERR = {
  RU: {
    generate: "Не удалось создать тест. Попробуйте ещё раз через минуту.",
    session: "Сервер не смог запустить сессию. Попробуйте ещё раз.",
    network: "Нет связи с сервером. Проверьте интернет и повторите.",
    noResults: "Пока нет данных. Отчёт можно собрать после того, как ученики завершат тест.",
    report: "Не удалось сформировать отчёт. Попробуйте ещё раз.",
  },
  KZ: {
    generate: "Тест жасау мүмкін болмады. Бір минуттан кейін қайталаңыз.",
    session: "Сервер сессияны іске қоса алмады. Қайталап көріңіз.",
    network: "Сервермен байланыс жоқ. Интернетті тексеріп, қайталаңыз.",
    noResults: "Әзірге дерек жоқ. Есепті оқушылар тестті аяқтаған соң жасауға болады.",
    report: "Есепті құру мүмкін болмады. Қайталап көріңіз.",
  },
  EN: {
    generate: "Could not create the quiz. Try again in a minute.",
    session: "The server could not start the session. Try again.",
    network: "No connection to the server. Check your internet and retry.",
    noResults: "No data yet. The report can be built once students finish the quiz.",
    report: "Could not generate the report. Try again.",
  },
};

// Подписи панели «История»
const LIBRARY = {
  RU: { empty: "Пока ничего не создано. Сгенерируйте первый тест — он появится здесь." },
  KZ: { empty: "Әзірге ештеңе жасалмаған. Алғашқы тестті жасаңыз — ол осында шығады." },
  EN: { empty: "Nothing here yet. Generate your first quiz and it will show up." },
};

const CreateTestPage = ({ lang, promptConfig, grantAchievement, ...accessProps }) => {
  const navigate = useNavigate();

  // --- State Management ---
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState('5');
  const [loading, setLoading] = useState(false);
  
  const [activeTest, setActiveTest] = useState(null);
  const [accessCode, setAccessCode] = useState(null);
  const [testResults, setTestResults] = useState(null);

  const [savedTests, setSavedTests] = useState([]);
  const [showLibrary, setShowLibrary] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Report states
  const [showReportModal, setShowReportModal] = useState(false);
  const [report, setReport] = useState("");
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportContext, setReportContext] = useState("");
  const [copied, setCopied] = useState(false);

  const [testUi, setTestUi] = useState({
    difficulty: "medium",
    total: 10,
    includeAnswers: true,
    shuffle: false,
  });

  const cur = t[lang] || t.RU;
  const err = ERR[lang] || ERR.RU;
  const LIB = LIBRARY[lang] || LIBRARY.RU;

  const [error, setError] = useState("");
  const [reportError, setReportError] = useState("");

  // --- Effects ---
  useEffect(() => { loadSavedTests(); }, []);

  const loadSavedTests = async () => {
    try {
      // Фильтровать на клиенте нечего: сервер отдаёт только type=test
      const res = await api.tests.list(100);
      setSavedTests(res.items || []);
    } catch (e) { console.error(e); }
  };

  // --- Handlers ---

  const handleGenerate = async () => {
    setLoading(true); setError(""); setAccessCode(null); setActiveTest(null); setTestResults(null); setSelectedStudent(null);
    try {
      const vars = { lang, subject, topic, grade, details: "" };
      const mergedCfg = { ...promptConfig, tests: { ...promptConfig?.tests, ...testUi } };
      const promptText = buildPrompt("tests", vars, mergedCfg);

      const test = await api.tests.create({
        type: 'test',
        subject: subject || "Test", topic, grade, lang, prompt: promptText, status: "running"
      });

      let accumulatedText = "";
      for await (const evt of api.generateStream({ prompt: promptText })) {
        const delta = typeof evt === "string" ? evt : (evt?.type === "delta" ? evt.text : "");
        if (delta) accumulatedText += delta;
      }

      await api.tests.update(test.id, { status: "done", result_md: accumulatedText });
      setActiveTest({ id: test.id, result_md: accumulatedText, topic, subject, access_code: null });
      loadSavedTests();

    } catch (e) { console.error(e); setError(err.generate); } finally { setLoading(false); }
  };

  const handleStartSession = async () => {
    if (!activeTest) return;
    setError("");
    try {
      const data = await api.quiz.start(activeTest.id);
      const code = data.data?.code || data.code;
      if (code) {
        setAccessCode(code);
        setActiveTest(prev => ({ ...prev, access_code: code }));
      }
    } catch (e) { console.error(e); setError(err.network); }
  };

  const handleSelectOldTest = async (item) => {
    setActiveTest(null);
    setAccessCode(null);
    setTestResults(null);
    setSelectedStudent(null);
    setShowLibrary(false);
    try {
      const res = await api.tests.get(item.id);
      const full = res?.item || res;
      setActiveTest({ id: full.id, result_md: full.result_md, topic: full.topic, subject: full.subject, access_code: full.access_code });
      if (full.access_code) {
        setAccessCode(full.access_code);
        fetchTestResults(full.id);
      }
    } catch (e) { console.error(e); }
  };

  const fetchTestResults = async (forceId = null) => {
    const id = forceId || activeTest?.id;
    if (!id) return;
    try {
      const data = await api.quiz.report(id);
      setTestResults(data.data?.results || data.results || []);
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

  // --- Copy Logic ---
  const copyToClipboard = () => {
    if (!report) return;
    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // --- AI Report Logic ---
  const generateReport = async (type) => {
    if (!testResults || testResults.length === 0) {
      setReportError(err.noResults);
      return;
    }
    setIsGeneratingReport(true);
    setReportError("");
    setReport("");

    try {
      const summaryData = testResults.map(r => ({
        name: r.student_name,
        score: `${r.score}/${r.total_questions}`,
        time: `${r.duration_seconds}s`,
        status: type === 'coach'
          ? (r.percentage === 100 ? "Perfect" : `Mistakes: ${getDetailsSafe(r).filter(d => !d.isCorrect).length}`)
          : `${r.percentage}%`
      }));

      const contextInfo = reportContext
        ? `Lesson Context: "${reportContext}".`
        : `Topic: ${topic}.`;

        let promptSystem = "";
        
        if (type === 'judge') {
            // OFFICIAL REPORT PROMPT
            promptSystem = `
            Role: School Administrator.
            Task: Write an OFFICIAL REPORT for the school director.
            Language: Russian (Strictly).
            ${contextInfo}
            Data: ${JSON.stringify(summaryData)}.
            
            Requirements:
            1. Style: Formal, professional.
            2. Structure:
               - General Statistics (Pass rate %, Quality %).
               - Results Table.
               - List of students lagging behind (<50%).
            3. No advice, just facts. Use Markdown.
            `;
        } else {
            // COACHING REPORT PROMPT
            promptSystem = `
            Role: Senior Teacher Mentor.
            Task: Write an ANALYTICAL NOTE for the teacher.
            Language: Russian (Strictly).
            ${contextInfo}
            Student Data: ${JSON.stringify(summaryData)}.
            
            Requirements:
            1. Assess general class understanding.
            2. Identify at-risk groups (low scores or too fast/slow).
            3. Provide 3 specific teaching tips for the next lesson.
            4. Brief recommendations for struggling students.
            Style: Helpful, concise. Use Markdown.
            `;
        }

      let accumulatedText = "";
      for await (const evt of api.generateStream({ prompt: promptSystem })) {
        const delta = typeof evt === "string" ? evt : (evt?.type === "delta" ? evt.text : "");
        if (delta) accumulatedText += delta;
        setReport(accumulatedText);
      }

    } catch (e) {
      console.error(e);
      setReportError(err.report);
    } finally {
      setIsGeneratingReport(false);
    }

    grantAchievement({ title: "Аналитик", reward: 300, key: "ai_report_master" });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-white p-5 sm:p-6 md:p-10 pt-[100px] lg:pt-[130px] font-sans flex flex-col md:flex-row gap-8">

    <Header {...accessProps} />
      
      {/* Left Column: Test Creation & Management */}
      <div className="flex-1 max-w-4xl mx-auto w-full">
        <Link to="/hub" className="inline-flex items-center gap-2 font-black uppercase text-xs mb-8 text-gray-500 hover:text-black dark:hover:text-white">
            <ChevronLeft size={16} /> {cur.back || "Back"}
        </Link>
        
        <div className="flex justify-between items-end mb-8">
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight">AI Quiz Creator</h1>
            <button className="md:hidden p-3 bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-200" onClick={() => setShowLibrary(!showLibrary)}>
                <History size={20}/>
            </button>
        </div>

        {/* Creation Panel */}
        <div className="bg-white dark:bg-zinc-900 p-6 md:p-8 rounded-[40px] border-[4px] border-black dark:border-white shadow-[8px_8px_0_0_#000] mb-8">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
               <div>
                   <label className="font-bold block mb-2 opacity-60 text-xs uppercase tracking-widest">{cur.s || "Subject"}</label>
                   <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Math" className="w-full p-4 bg-slate-100 dark:bg-zinc-800 rounded-xl font-bold outline-none" />
               </div>
               <div>
                   <label className="font-bold block mb-2 opacity-60 text-xs uppercase tracking-widest">Grade</label>
                   <select value={grade} onChange={e => setGrade(e.target.value)} className="w-full p-4 bg-slate-100 dark:bg-zinc-800 rounded-xl font-bold outline-none appearance-none cursor-pointer">
                        {[...Array(11)].map((_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}
                   </select>
               </div>
           </div>
           <label className="font-bold block mb-2 opacity-60 text-xs uppercase tracking-widest">{cur.t || "Topic"}</label>
           <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="Topic..." className="w-full p-4 bg-slate-100 dark:bg-zinc-800 rounded-xl font-bold outline-none mb-6" />
           
           <button
                onClick={handleGenerate}
                disabled={loading || !topic}
                className={`w-full py-5 tactical-button text-white
                ${loading || !topic ? 'bg-gray-400 opacity-50' : 'bg-emerald-600 hover:bg-emerald-500'}`}
            >
                {loading ? "ГЕНЕРАЦИЯ..." : "СОЗДАТЬ ТЕСТ"}
            </button>

            {error && (
              <div className="mt-5 flex items-start gap-2.5 px-4 py-3 rounded-2xl bg-red-50 dark:bg-red-950/40 border-2 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-bold">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
        </div>

        {/* Active Test View */}
        {activeTest && (
           <div className="bg-white dark:bg-zinc-900 p-6 md:p-8 rounded-[40px] border-[4px] border-emerald-600 shadow-[8px_8px_0_0_#059669] animate-in fade-in slide-in-from-bottom-4">
              <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4 border-b border-gray-100 dark:border-zinc-800 pb-6">
                 <div>
                    <h2 className="text-2xl font-black text-emerald-600 uppercase mb-1">{activeTest.subject || "Test"}</h2>
                    <p className="font-bold opacity-60 text-sm">Topic: {activeTest.topic}</p>
                 </div>

                 {!accessCode ? (
                    <button onClick={handleStartSession} className="w-full md:w-auto py-3 px-6 bg-green-500 text-white rounded-xl font-black uppercase shadow-[4px_4px_0_0_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition border-2 border-black flex items-center justify-center gap-2">
                       <Play size={20} /> Start Session
                    </button>
                 ) : (
                    <div className="w-full md:w-auto text-right bg-black text-white p-4 rounded-2xl animate-in zoom-in">
                       <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest mb-1">Access Code</p>
                       <p className="text-5xl font-black tracking-[0.2em] font-mono text-yellow-400 leading-none text-center md:text-right">{accessCode}</p>
                    </div>
                 )}
              </div>

              {/* Student Results Table */}
              <div className="mb-8 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl border-2 border-slate-100 dark:border-zinc-700 overflow-hidden">
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-700">
                        <h3 className="font-black text-sm uppercase flex items-center gap-2">📊 Class Performance</h3>
                        <div className="flex gap-2">
                             <button
                                onClick={() => setShowReportModal(true)}
                                className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg text-xs font-black uppercase shadow-sm hover:bg-purple-700 transition"
                            >
                                <Sparkles size={14} /> AI Report
                            </button>
                            <button onClick={() => fetchTestResults()} className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-zinc-800 rounded-lg text-xs font-black uppercase shadow-sm hover:text-emerald-600 transition">
                                <RefreshCw size={12}/>
                            </button>
                        </div>
                    </div>

                    {testResults && testResults.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-[10px] font-black uppercase text-gray-400 border-b border-gray-200 dark:border-zinc-700">
                                        <th className="p-3">Student</th>
                                        <th className="p-3">Score</th>
                                        <th className="p-3">Time</th>
                                        <th className="p-3">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="font-bold text-sm">
                                    {testResults.map((r, i) => (
                                        <tr key={i} className="border-b border-gray-100 dark:border-zinc-700/50 last:border-0 hover:bg-white dark:hover:bg-zinc-800 transition">
                                            <td className="p-3">{r.student_name}</td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 rounded text-xs text-white ${r.percentage >= 80 ? 'bg-green-500' : r.percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}>
                                                    {r.score}/{r.total_questions}
                                                </span>
                                            </td>
                                            <td className="p-3 text-gray-500">{r.duration_seconds}s</td>
                                            <td className="p-3">
                                                <button onClick={() => setSelectedStudent(r)} className="px-3 py-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 transition text-[10px] font-black uppercase">
                                                    <Eye size={14} /> Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-400 text-xs font-bold uppercase tracking-widest">
                            {accessCode ? "Waiting for results..." : "Start session to join"}
                        </div>
                    )}
              </div>

              {testResults && testResults.length > 0 && (
                <button
                  onClick={() => navigate(`/lesson-summary?quiz_id=${activeTest.id}&subject=${encodeURIComponent(subject)}&topic=${encodeURIComponent(topic || activeTest.topic || '')}`)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-4 border-green-600 text-green-600 font-black uppercase text-sm tracking-widest hover:bg-green-600 hover:text-white transition-all"
                >
                  <ClipboardList size={16} />
                  {lang === 'KZ' ? 'Сабақ қорытындысы' : lang === 'EN' ? 'Lesson Summary' : 'Итог урока'}
                </button>
              )}

              <div className="bg-slate-50 dark:bg-zinc-800 p-6 rounded-2xl border-2 border-slate-200 dark:border-zinc-700 max-h-60 overflow-y-auto prose dark:prose-invert text-sm">
                 <ReactMarkdown>{activeTest.result_md}</ReactMarkdown>
              </div>
           </div>
        )}
      </div>

      {/* Right Column: Library */}
      <div className={`fixed inset-y-0 right-0 w-80 bg-white dark:bg-zinc-950 shadow-2xl p-6 transform transition-transform duration-300 z-40 md:static md:transform-none md:w-80 md:shadow-none md:bg-transparent md:block ${showLibrary ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
        <div className="flex justify-between items-center mb-6">
            <h3 className="font-black text-sm uppercase tracking-widest text-gray-500">History</h3>
            <button onClick={() => setShowLibrary(false)} className="md:hidden"><X size={20}/></button>
        </div>
        <div className="space-y-3 overflow-y-auto h-[calc(100vh-100px)]">
            {savedTests.length === 0 && (
                <div className="flex flex-col items-center text-center px-4 py-10 rounded-2xl border-2 border-dashed border-black/10 dark:border-white/10">
                    <ClipboardList size={28} className="mb-3 text-slate-300" />
                    <p className="text-xs font-bold text-slate-400 leading-relaxed">{LIB.empty}</p>
                </div>
            )}
            {savedTests.map((item) => (
                <div key={item.id} onClick={() => handleSelectOldTest(item)} className={`p-4 rounded-2xl border-2 cursor-pointer transition-all hover:scale-[1.02] ${activeTest?.id === item.id ? 'bg-emerald-600 border-black text-white shadow-md' : 'bg-white dark:bg-zinc-900 border-gray-100 dark:border-zinc-800 hover:border-emerald-300'}`}>
                    <h4 className="font-black text-sm mb-1 line-clamp-2">{item.topic}</h4>
                    <div className="flex justify-between items-center opacity-70 text-[10px] font-bold uppercase tracking-wider">
                        <span>{item.subject}</span>
                        <span>{new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* Modal: AI Report */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-[30px] p-6 md:p-8 shadow-2xl border-[4px] border-purple-600 max-h-[90vh] overflow-y-auto flex flex-col">
                <h3 className="text-2xl font-black uppercase mb-2 flex-shrink-0">Report Generator</h3>
                
                {!report ? (
                    <div className="grid grid-cols-1 gap-4 overflow-y-auto">
                        <div>
                            <label className="text-xs font-black uppercase text-gray-500 mb-1 block">
                                Lesson Context (Optional)
                            </label>
                            <textarea
                                value={reportContext}
                                onChange={(e) => setReportContext(e.target.value)}
                                placeholder="E.g., We studied discriminants..."
                                className="w-full p-3 bg-slate-50 dark:bg-zinc-800 rounded-xl border-2 border-gray-200 dark:border-zinc-700 focus:border-purple-500 outline-none text-sm font-bold min-h-[80px]"
                            />
                        </div>

                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2">Report Type:</p>

                        <button onClick={() => generateReport('coach')} disabled={isGeneratingReport} className="p-4 border-2 border-gray-200 dark:border-zinc-700 rounded-2xl hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 text-left transition group">
                            <div className="font-black text-lg uppercase group-hover:text-purple-600">🎓 Teacher's Note</div>
                            <p className="text-xs text-gray-400 font-bold mt-1">Mistakes analysis, teaching tips, context.</p>
                        </button>

                        <button onClick={() => generateReport('judge')} disabled={isGeneratingReport} className="p-4 border-2 border-gray-200 dark:border-zinc-700 rounded-2xl hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-left transition group">
                            <div className="font-black text-lg uppercase group-hover:text-emerald-600">⚖️ Official Report</div>
                            <p className="text-xs text-gray-400 font-bold mt-1">Dry facts, statistics, table for administration.</p>
                        </button>
                        
                        {reportError && (
                          <div className="flex items-start gap-2.5 px-4 py-3 rounded-2xl bg-red-50 dark:bg-red-950/40 border-2 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-bold">
                            <AlertCircle size={18} className="shrink-0 mt-0.5" />
                            <span>{reportError}</span>
                          </div>
                        )}

                        {isGeneratingReport && <div className="text-center font-black animate-pulse mt-4 text-purple-600">AI IS ANALYZING...</div>}
                        {!isGeneratingReport && <button onClick={() => { setShowReportModal(false); setReportError(""); }} className="mt-2 w-full py-3 font-bold text-gray-400 hover:text-red-500">Cancel</button>}
                    </div>
                ) : (
                    <div className="animate-in zoom-in flex flex-col h-full">
                        <div className="bg-slate-50 dark:bg-zinc-950 p-4 rounded-xl flex-1 overflow-y-auto prose dark:prose-invert text-sm border-2 border-purple-100 mb-4">
                            <ReactMarkdown>{report}</ReactMarkdown>
                        </div>
                        <div className="flex gap-4 flex-shrink-0">
                            <button onClick={() => setReport("")} className="flex-1 py-3 font-bold text-gray-400 hover:text-black">Back</button>
                            {/* Copy Button */}
                            <button 
                                onClick={copyToClipboard} 
                                className={`flex-1 py-3 ${copied ? 'bg-green-500' : 'bg-purple-600'} text-white rounded-xl font-bold uppercase flex items-center justify-center gap-2 transition-all`}
                            >
                                {copied ? <Check size={18} /> : <Copy size={18} />}
                                {copied ? "Copied!" : "Copy"}
                            </button>
                            <button onClick={() => setShowReportModal(false)} className="flex-1 py-3 bg-black text-white rounded-xl font-bold uppercase">Close</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
      )}

      {/* Modal: Student Details */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in zoom-in duration-200">
            <div className="bg-white dark:bg-zinc-900 w-full max-w-lg max-h-[80vh] overflow-hidden rounded-[30px] shadow-2xl flex flex-col border-[4px] border-black dark:border-gray-700">
                <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center bg-gray-50 dark:bg-zinc-800/50">
                    <div>
                        <h3 className="text-xl font-black uppercase">{selectedStudent.student_name}</h3>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                            Detailed Breakdown
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
                                        <span className="font-black text-xs uppercase text-gray-400">Question {idx + 1}</span>
                                        <div className="flex items-center gap-2">
                                            {detail.isCorrect ? (
                                                <span className="text-green-600 font-black text-sm uppercase">✅ Correct</span>
                                            ) : (
                                                <span className="text-red-500 font-black text-sm uppercase">❌ Wrong</span>
                                            )}
                                            <span className="text-gray-300">|</span>
                                            <span className="font-bold text-sm text-black dark:text-white">
                                                Time: {detail.time}s
                                            </span>
                                        </div>
                                    </div>
                                    <div className={`w-3 h-3 rounded-full ${detail.isCorrect ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-10 text-center text-gray-400 italic font-bold">
                            No details available.
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