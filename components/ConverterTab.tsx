
import React, { useState, useEffect } from 'react';
import { generateDocxBlob } from '../utils/docxGenerator';

const ConverterTab: React.FC<{ initialContent?: string }> = ({ initialContent }) => {
  const [md, setMd] = useState(initialContent || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (initialContent) setMd(initialContent); }, [initialContent]);

  const process = (fn: (s: string) => string) => setMd(prev => fn(prev));

  const fixes = {
    delimiters: (t: string) => t.replace(/\\\[([\s\S]*?)\\\]/g, '$$$1$$').replace(/\\\((.*?)\\\)/g, '$$$1$$').replace(/\$\$([\s\S]*?)\$\$/g, '$$$1$$'),
    fractions: (t: string) => t.replace(/\$([^$]+)\$/g, (m, c) => `$${c.replace(/(\b\w+|\([^)]+\))\s*\/\s*(\b\w+|\([^)]+\))/g, '\\frac{$1}{$2}')}$`),
    whitespace: (t: string) => t.replace(/\$([^$]+)\$/g, (m, c) => `$${c.replace(/\s*=\s*/g, ' = ')}$`).replace(/\n\s*\n\s*\n/g, '\n\n')
  };

  const autoFix = () => setMd(fixes.whitespace(fixes.fractions(fixes.delimiters(md))));

  const download = async () => {
    if (!md.trim()) return;
    setLoading(true);
    try {
      const url = URL.createObjectURL(await generateDocxBlob(md));
      const a = document.createElement('a'); a.href = url; a.download = 'Tai_lieu_chuyen_doi.docx'; a.click();
    } catch { alert("Lỗi chuyển đổi."); } finally { setLoading(false); }
  };

  const Btn = ({ onClick, label, main = false }: any) => (
    <button onClick={onClick} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${main ? 'text-violet-700 bg-violet-100 hover:bg-violet-200 ml-auto' : 'text-slate-600 bg-slate-100 hover:bg-violet-50'}`}>{label}</button>
  );

  return (

    <div className="w-full max-w-5xl mx-auto bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 overflow-hidden">
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-8 py-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        <h2 className="text-xl font-bold flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>
          </div>
          Chuyển đổi LaTeX / Markdown sang Word
        </h2>
      </div>
      <div className="p-8">
        <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50 focus-within:ring-4 focus-within:ring-violet-500/10 transition-all shadow-inner">
          <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-slate-200 bg-white/50 backdrop-blur-sm">
            <span className="text-xs text-slate-500 font-bold uppercase mr-2 tracking-wider">Công cụ:</span>
            <Btn onClick={() => process(fixes.delimiters)} label="[...] → $...$" />
            <Btn onClick={() => process(fixes.fractions)} label="a/b → \frac" />
            <Btn onClick={() => process(fixes.whitespace)} label="Dọn Space" />
            <Btn onClick={autoFix} label="Auto Fix All" main />
          </div>
          <textarea value={md} onChange={(e) => setMd(e.target.value)} rows={15} className="w-full px-6 py-5 outline-none font-mono text-sm bg-transparent resize-y text-slate-700 leading-relaxed" placeholder="Dán nội dung vào đây..." />
        </div>
        <div className="mt-8 flex justify-end">
          <button onClick={download} disabled={loading} className={`px-8 py-3.5 rounded-xl text-white font-bold shadow-lg shadow-violet-500/30 transition-all active:scale-95 ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:shadow-violet-500/40 hover:-translate-y-0.5'}`}>
            {loading ? <span className="flex items-center gap-2"><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg> Đang tạo...</span> : 'Tải Word (.docx)'}
          </button>
        </div>
      </div>
    </div>
  );
};
export default ConverterTab;
