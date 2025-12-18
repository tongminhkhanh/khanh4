import React, { useState } from 'react';
import InputForm from './components/InputForm';
import PlanDisplay from './components/PlanDisplay';
import ConverterTab from './components/ConverterTab';
import { generateLessonPlan } from './services/geminiService';
import { LessonInput, ViewState, UserProfile } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>({
    name: "Giáo viên",
    email: "gv@itong.edu.vn",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Teacher"
  });
  const [tab, setTab] = useState<'PLANNER' | 'CONVERTER'>('PLANNER');
  const [state, setState] = useState<ViewState>(ViewState.INPUT);
  const [plan, setPlan] = useState<string | null>(null);
  const [input, setInput] = useState<LessonInput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [converterContent, setConverterContent] = useState<string | undefined>(undefined);

  const handleGenerate = async (data: LessonInput) => {
    setState(ViewState.GENERATING); setError(null); setInput(data); window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      setPlan(await generateLessonPlan({ ...data, teacherName: data.teacherName || user?.name || '' }));
      setState(ViewState.RESULT);
    } catch (e: any) { setError(e.message); setState(ViewState.INPUT); }
  };

  const toConverter = (c: string) => { setConverterContent(c); setTab('CONVERTER'); };

  if (!user) return null; // Safety check though user is initialized

  return (
    <div className="min-h-screen flex flex-col animate-in fade-in bg-slate-50/50">
      <header className="fixed top-4 left-4 right-4 h-16 glass-header rounded-2xl z-50 transition-all duration-300">
        <div className="max-w-[1920px] mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.location.reload()}>
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform">
              I
            </div>
            <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">ItOngEdu <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">AI</span></h1>
          </div>

          <nav className="flex p-1 bg-slate-100/50 backdrop-blur-md rounded-xl border border-slate-200/60">
            {[{ id: 'PLANNER', label: 'Soạn Bài' }, { id: 'CONVERTER', label: 'Công cụ' }].map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id as any)}
                className={`px-6 py-1.5 rounded-lg text-sm font-bold transition-all duration-300 ${tab === t.id
                    ? 'text-indigo-700 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] scale-105'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                  }`}
              >
                {t.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3 pl-6 border-l border-slate-200/60">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-700">{user.name}</p>
              <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Giáo viên</p>
            </div>
            <div className="relative group cursor-pointer">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full opacity-0 group-hover:opacity-100 transition duration-300 blur"></div>
              <img src={user.avatar} alt="" className="relative w-10 h-10 rounded-full bg-slate-100 border-2 border-white shadow-sm" />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[1920px] mx-auto px-6 py-28">
        {error && <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-red-50 border border-red-200 p-4 rounded-xl shadow text-red-700 font-bold">{error}</div>}

        {tab === 'PLANNER' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
            <div className="lg:col-span-5 xl:col-span-5 lg:sticky lg:top-24 lg:h-[calc(100vh-120px)] lg:overflow-y-auto pr-1">
              <InputForm onSubmit={handleGenerate} isGenerating={state === ViewState.GENERATING} />
            </div>
            <div className="lg:col-span-7 xl:col-span-7 min-h-[500px]">
              {state === ViewState.GENERATING && (
                <div className="h-full min-h-[60vh] flex flex-col items-center justify-center bg-white/80 backdrop-blur-xl rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-12 text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-violet-500/5 animate-pulse"></div>
                  <div className="relative z-10">
                    <div className="w-24 h-24 mx-auto mb-8 relative">
                      <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
                      <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center text-4xl animate-bounce">✨</div>
                    </div>
                    <h3 className="text-2xl font-extrabold text-slate-800 mb-2">AI Đang Soạn Giáo Án...</h3>
                    <p className="text-slate-500 mb-8">Đang phân tích yêu cầu và áp dụng chuẩn GDPT 2018</p>

                    <div className="bg-white/50 backdrop-blur-sm p-6 rounded-2xl border border-white/60 max-w-md mx-auto text-left shadow-sm">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                        <p className="text-sm font-medium text-slate-700">Đang xây dựng cấu trúc bài học...</p>
                      </div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse delay-75"></div>
                        <p className="text-sm font-medium text-slate-700">Đang đề xuất hoạt động thú vị...</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse delay-150"></div>
                        <p className="text-sm font-medium text-slate-700">Đang hoàn thiện nội dung...</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {state === ViewState.INPUT && (
                <div className="h-full min-h-[60vh] flex flex-col items-center justify-center bg-white/60 backdrop-blur-md border-2 border-dashed border-slate-300/50 rounded-3xl p-12 text-center group hover:border-indigo-300/50 transition-colors">
                  <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500 mb-6 group-hover:scale-110 transition-transform duration-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="12" y1="18" x2="12" y2="12" /><line x1="9" y1="15" x2="15" y2="15" /></svg>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">Sẵn sàng soạn giáo án</h3>
                  <p className="text-slate-500 max-w-xs mx-auto">Điền thông tin bài dạy vào biểu mẫu bên trái để AI hỗ trợ thầy cô soạn bài ngay lập tức.</p>
                </div>
              )}
              {state === ViewState.RESULT && plan && input && <PlanDisplay content={plan} metadata={input} onReset={() => { setState(ViewState.INPUT); setPlan(null); }} onEditInConverter={toConverter} />}
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto"><ConverterTab initialContent={converterContent} /></div>
        )}
      </main>
    </div>
  );
};
export default App;