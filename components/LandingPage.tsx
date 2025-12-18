
import React, { useState } from 'react';

const LandingPage: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const start = (e: any) => { e.preventDefault(); setLoading(true); setTimeout(onLogin, 800); };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-sky-200 selection:text-sky-900 overflow-x-hidden">
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-sky-100 z-[999]">
        <div className="max-w-[1200px] mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">ItOngEdu<span className="text-sky-600">AI</span></div>
          <nav className="hidden md:flex gap-8">
            {['Trang chủ', 'Tính năng', 'Liên hệ'].map(i => <a key={i} href="http://thitong.io.vn" className="text-sm font-bold text-slate-600 hover:text-sky-600">{i}</a>)}
          </nav>
          <button className="md:hidden" onClick={start}>☰</button>
        </div>
      </header>

      <main className="flex-1 pt-20 flex flex-col items-center justify-center px-4 relative">
         <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.8),rgba(255,255,255,0))]" />
         <div className="max-w-4xl mx-auto text-center space-y-10 animate-in fade-in duration-1000 z-10">
            <div className="text-6xl mb-6">🎓</div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-800 leading-tight">
              <span className="block text-slate-500 text-xl font-bold uppercase tracking-widest mb-4">Trợ lý AI đắc lực</span>
              Thấu hiểu nỗi vất vả của <span className="text-sky-600">nghề giáo</span>.
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">Tự động hóa việc soạn bài theo đúng chuẩn Công văn 2345.</p>
            <button onClick={start} disabled={loading} className="bg-gradient-to-r from-sky-500 to-blue-600 text-white px-12 py-5 rounded-full font-bold text-xl shadow-xl hover:shadow-sky-500/50 transition-all">
               {loading ? 'Đang khởi tạo...' : 'Bắt đầu ngay'}
            </button>
         </div>
      </main>

      <footer className="bg-slate-900 text-slate-300 py-12 px-6 mt-auto border-t border-slate-800">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex gap-6 text-sm font-medium">
                {['Điều khoản', 'Bảo mật', 'Liên hệ'].map(l => <a key={l} href="http://thitong.io.vn" className="hover:text-sky-400 underline">{l}</a>)}
            </div>
            <div className="opacity-80 text-sm">© 2025 ItOngEdu AI. "Đồng hành cùng sự nghiệp trồng người."</div>
        </div>
      </footer>
    </div>
  );
};
export default LandingPage;
