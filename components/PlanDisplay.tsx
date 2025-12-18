import React, { useState, useMemo, useEffect, useRef } from 'react';
import { generateDocxBlob } from '../utils/docxGenerator';
import { LessonInput } from '../types';

declare global {
  interface Window {
    MathJax: any;
  }
}

interface PlanDisplayProps {
  content: string;
  metadata?: LessonInput;
  onReset: () => void;
  onEditInConverter: (content: string) => void;
}

const THEMES: Record<string, any> = {
  indigo: { h1: 'text-indigo-900 border-indigo-100', h2: 'text-indigo-800', bar: 'bg-indigo-500', dot: 'bg-indigo-400', bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-900', btn: 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30', bullet: 'text-indigo-400', stripe: 'from-indigo-500 via-purple-500 to-pink-500' },
  emerald: { h1: 'text-emerald-900 border-emerald-100', h2: 'text-emerald-800', bar: 'bg-emerald-500', dot: 'bg-emerald-400', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-900', btn: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/30', bullet: 'text-emerald-500', stripe: 'from-emerald-500 via-teal-500 to-green-500' },
  rose: { h1: 'text-rose-900 border-rose-100', h2: 'text-rose-800', bar: 'bg-rose-500', dot: 'bg-rose-400', bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-900', btn: 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/30', bullet: 'text-rose-500', stripe: 'from-rose-500 via-pink-500 to-red-500' },
  amber: { h1: 'text-amber-900 border-amber-100', h2: 'text-amber-800', bar: 'bg-amber-500', dot: 'bg-amber-400', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-900', btn: 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/30', bullet: 'text-amber-500', stripe: 'from-amber-500 via-orange-500 to-yellow-500' },
  slate: { h1: 'text-slate-900 border-slate-200', h2: 'text-slate-800', bar: 'bg-slate-600', dot: 'bg-slate-500', bg: 'bg-slate-100', border: 'border-slate-300', text: 'text-slate-900', btn: 'bg-slate-700 hover:bg-slate-800 shadow-slate-500/30', bullet: 'text-slate-600', stripe: 'from-slate-600 via-gray-600 to-zinc-600' },
};

const RenderTextWithCopy: React.FC<{ text: string }> = ({ text }) => {
  const parts = text.split(/(\$\$[\s\S]*?\$\$|\$.*?\$)/g);

  return (
    <span className="leading-relaxed">
      {parts.map((part, i) => {
        const isLatex = part.startsWith('$');
        if (isLatex) {
          const rawLatex = part;
          return (
            <span key={i} className="group relative inline-block mx-1 align-middle">
              <span className="latex-content">{part}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(rawLatex);
                  const btn = document.getElementById(`copy-hint-${i}`);
                  if (btn) {
                    btn.innerText = "Đã chép!";
                    setTimeout(() => { if (btn) btn.innerText = "Chép LaTeX"; }, 2000);
                  }
                }}
                className="no-print absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap shadow-xl flex items-center gap-1"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                <span id={`copy-hint-${i}`}>Chép LaTeX</span>
              </button>
            </span>
          );
        }

        // Standard text with Bold support
        const boldParts = part.split(/\*\*(.*?)\*\*/g);
        return (
          <span key={i}>
            {boldParts.map((bp, bi) => (
              bi % 2 === 1 ? <b key={bi}>{bp}</b> : bp
            ))}
          </span>
        );
      })}
    </span>
  );
};

const PlanDisplay: React.FC<PlanDisplayProps> = ({ content, metadata, onReset, onEditInConverter }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [themeColor, setThemeColor] = useState<string>('indigo');
  const [localContent, setLocalContent] = useState(content);
  const [tempContent, setTempContent] = useState(content);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setLocalContent(content); setTempContent(content); }, [content]);

  useEffect(() => {
    if (!isEditing && window.MathJax?.typesetPromise && containerRef.current) {
      window.MathJax.typesetPromise([containerRef.current]).catch(console.error);
    }
  }, [localContent, isEditing, themeColor]);

  const hasLatex = useMemo(() => /\\\[|\\\(|\\begin\{|\\$|\\frac/.test(localContent), [localContent]);
  const theme = THEMES[themeColor];

  const handleDownloadDocx = async () => {
    setIsDownloading(true);
    try {
      const blob = await generateDocxBlob(localContent, metadata);
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'Giao_an_GDPT2018.docx';
      link.click();
    } catch (e) { alert("Lỗi tạo file Word."); }
    finally { setIsDownloading(false); }
  };

  const parsedBlocks = useMemo(() => {
    const lines = localContent.split('\n');
    const blocks: any[] = [];
    let currentBlock: any = { type: 'text', content: [] };

    lines.forEach((line) => {
      const isTable = line.trim().startsWith('|') && (line.trim().endsWith('|') || line.split('|').length > 2);
      if (isTable !== (currentBlock.type === 'table')) {
        if (currentBlock.content.length) blocks.push(currentBlock);
        currentBlock = { type: isTable ? 'table' : 'text', content: [] };
      }
      currentBlock.content.push(line);
    });
    if (currentBlock.content.length) blocks.push(currentBlock);
    return blocks;
  }, [localContent]);

  const renderBlock = (block: any, idx: number) => {
    if (block.type === 'table') {
      const rows = block.content.filter((r: string) => r.trim() && !/^\|?[\s\-:|]+\|?$/.test(r.trim()));
      if (!rows.length) return null;
      const [header, ...body] = rows.map((r: string) => r.split('|').map(c => c.trim()).filter((_, i, a) => i !== 0 && i !== a.length - 1));

      return (
        <div key={idx} className="overflow-hidden rounded-xl border border-slate-300 shadow-sm my-6 break-inside-avoid">
          <table className="min-w-full text-sm border-collapse">
            <thead>
              <tr className={`${theme.bg} border-b ${theme.border}`}>
                {header.map((h: string, i: number) => (
                  <th key={i} className={`px-4 py-3 text-left font-bold ${theme.text} border-r last:border-r-0 ${theme.border}`}><RenderTextWithCopy text={h} /></th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {body.map((row: string[], rIdx: number) => (
                <tr key={rIdx} className="bg-white">
                  {row.map((c: string, cIdx: number) => (
                    <td key={cIdx} className="px-4 py-3 align-top text-slate-800 border-r last:border-r-0 border-slate-200 text-justify"><RenderTextWithCopy text={c} /></td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    return block.content.map((line: string, i: number) => {
      const trimmed = line.trim();
      const key = `${idx}-${i}`;
      if (!trimmed) return <div key={key} className="h-4" />;

      if (line.startsWith('# ')) return <h1 key={key} className={`text-3xl font-extrabold ${theme.h1} mt-8 mb-4 text-center uppercase border-b-2 pb-3 break-after-avoid`}>{line.slice(2)}</h1>;
      if (line.startsWith('## ') || /^\*\*[IVX]+\./.test(trimmed)) return <div key={key} className="flex mt-6 mb-3 break-after-avoid"><div className={`h-6 w-1 ${theme.bar} rounded-full mr-3 mt-1.5 flex-shrink-0 print:hidden`} /><h2 className={`text-xl font-bold ${theme.h2} uppercase`}>{line.replace(/## |\*\*/g, '')}</h2></div>;
      if (line.startsWith('### ')) return <h3 key={key} className="text-lg font-bold text-slate-800 mt-4 mb-2 flex items-center gap-2 break-after-avoid"><span className={`w-1.5 h-1.5 ${theme.dot} rounded-full print:bg-slate-800`} />{line.slice(4)}</h3>;

      if (trimmed.startsWith('> ')) return (
        <div key={key} className={`my-4 p-4 bg-gradient-to-r from-slate-50 to-white border ${theme.border} rounded-xl shadow-sm relative overflow-hidden break-inside-avoid print:bg-white print:border-slate-300`}>
          <div className={`absolute top-0 left-0 w-1 h-full ${theme.bar} print:bg-slate-400`} />
          <div className="text-slate-900"><RenderTextWithCopy text={line.slice(2)} /></div>
        </div>
      );

      if (/^[-*]\s/.test(trimmed)) return (
        <div key={key} className="flex ml-2 mb-1.5 text-slate-800 group">
          <span className={`mr-3 ${theme.bullet} font-bold mt-1.5 text-xs print:text-slate-600`}>●</span>
          <span className="flex-1 text-justify"><RenderTextWithCopy text={line.replace(/^[-*]\s+/, '')} /></span>
        </div>
      );

      return <p key={key} className="mb-2.5 text-slate-800 leading-7 text-justify"><RenderTextWithCopy text={line} /></p>;
    });
  };

  const IconBtn = ({ onClick, icon, text, className = "", title = "" }: any) => (
    <button onClick={onClick} title={title} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 ${className}`}>
      {icon} {text}
    </button>
  );

  return (
    <div className="w-full mx-auto animation-fade-in pb-20" ref={containerRef}>
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 no-print gap-4 sticky top-24 z-30 pointer-events-none px-4">
        <div className="pointer-events-auto bg-white/80 backdrop-blur-xl border border-white/50 shadow-lg shadow-slate-200/50 p-1.5 rounded-2xl flex gap-2">
          <IconBtn onClick={onReset} className="text-slate-600 hover:bg-slate-100 hover:text-slate-900" text="Soạn lại" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5" /><path d="M12 19l-7-7 7-7" /></svg>} />
        </div>

        <div className="flex flex-wrap gap-2 pointer-events-auto items-center justify-center md:justify-end bg-white/80 backdrop-blur-xl border border-white/50 shadow-lg shadow-slate-200/50 p-1.5 rounded-2xl">
          <div className="relative group px-2">
            <select value={themeColor} onChange={(e) => setThemeColor(e.target.value)} className="appearance-none bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer pr-4">
              <option value="indigo">Mặc định</option><option value="emerald">Thiên nhiên</option><option value="rose">Năng động</option><option value="amber">Sáng tạo</option><option value="slate">Tối giản</option>
            </select>
          </div>
          <div className="w-px h-6 bg-slate-200 mx-1"></div>

          {!isEditing ? (
            <IconBtn onClick={() => { setTempContent(localContent); setIsEditing(true) }} className="text-slate-600 hover:bg-indigo-50 hover:text-indigo-600" text="Chỉnh sửa" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>} />
          ) : (
            <>
              <button onClick={() => setIsEditing(false)} className="px-4 py-2 rounded-xl text-slate-600 font-bold text-sm hover:bg-red-50 hover:text-red-600 transition-colors">Hủy</button>
              <button onClick={() => { setLocalContent(tempContent); setIsEditing(false) }} className={`px-4 py-2 rounded-xl text-white font-bold text-sm shadow-lg shadow-indigo-500/20 ${theme.btn}`}>Lưu lại</button>
            </>
          )}

          <button onClick={() => onEditInConverter(localContent)} className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${hasLatex ? 'bg-violet-50 text-violet-700 hover:bg-violet-100' : 'text-slate-600 hover:bg-slate-100'}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /></svg> {hasLatex ? 'Sửa LaTeX' : 'Sửa nâng cao'}
          </button>

          <button onClick={handleDownloadDocx} disabled={isDownloading} className={`flex items-center gap-2 px-5 py-2 rounded-xl text-white font-bold text-sm shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 transition-all ${theme.btn} disabled:opacity-50 disabled:cursor-not-allowed`}>
            {isDownloading ? <span className="animate-pulse">Đang tạo...</span> : <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg> Tải Word</>}
          </button>
        </div>
      </div>

      <div className="transition-all duration-500 bg-white relative overflow-hidden print-content print:w-full print:shadow-none print:m-0 w-full max-w-5xl mx-auto p-10 md:p-20 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] rounded-3xl border border-slate-100">
        {isEditing ? (
          <div className="w-full h-full min-h-[600px] flex flex-col">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-xl text-sm text-yellow-800 font-bold flex items-center gap-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
              Chế độ chỉnh sửa trực tiếp Markdown
            </div>
            <textarea value={tempContent} onChange={(e) => setTempContent(e.target.value)} className="w-full h-screen p-6 font-mono text-sm border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none resize-y bg-slate-50/50 leading-relaxed" />
          </div>
        ) : (
          <>
            <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${theme.stripe} no-print`} />
            {metadata?.schoolName && (
              <div className="mb-16 print-break-after">
                <div className="flex justify-between items-start mb-12 font-bold text-slate-800 text-sm uppercase leading-snug">
                  <div className="text-center"><p className="text-slate-500 font-medium text-xs mb-1">PHÒNG GD&ĐT ....................</p><p className="font-extrabold text-slate-900 text-base">{metadata.schoolName.toUpperCase()}</p><div className="w-16 h-[2px] bg-slate-300 mx-auto mt-3" /></div>
                  <div className="text-center"><p className="text-slate-900">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p><p className="font-extrabold underline decoration-2 underline-offset-4 text-slate-900 mt-1">Độc lập - Tự do - Hạnh phúc</p></div>
                </div>
                <div className="text-center my-24 relative">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-slate-50 rounded-full blur-3xl -z-10"></div>
                  <h1 className="text-5xl font-extrabold text-slate-900 mb-8 font-serif tracking-tight leading-tight">KẾ HOẠCH BÀI DẠY</h1>
                  <div className="inline-block px-8 py-3 border-2 border-slate-900 rounded-xl mb-6 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"><h2 className="text-xl font-bold text-slate-900 uppercase tracking-widest">{metadata.subject}</h2></div>
                  <h3 className="text-3xl font-bold text-slate-700 mt-6 max-w-2xl mx-auto leading-relaxed uppercase font-serif">{metadata.lessonName}</h3>
                </div>
                <div className="max-w-xl mx-auto space-y-4 text-lg text-slate-800 font-medium bg-slate-50/80 backdrop-blur-sm p-10 rounded-3xl border border-slate-100 shadow-inner">
                  {[{ l: 'Giáo viên', v: metadata.teacherName }, { l: 'Lớp', v: metadata.grade }, { l: 'Tuần', v: metadata.week }, { l: 'Ngày dạy', v: metadata.date }]
                    .map((item, i) => <div key={i} className="flex justify-between border-b border-slate-200 border-dashed pb-3 last:border-0"><span className="text-slate-500 font-semibold">{item.l}</span><span className="font-bold text-slate-900">{item.v || '....................'}</span></div>)}
                </div>
                <div className="text-center mt-24 text-slate-500 italic font-serif"><p>Năm học: {new Date().getFullYear()} - {new Date().getFullYear() + 1}</p></div>
                <div className="no-print mt-16 border-t-4 border-dashed border-slate-100"></div>
              </div>
            )}
            <div className={`prose prose-slate max-w-none prose-lg prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-p:text-justify prose-img:rounded-xl`}>{parsedBlocks.map(renderBlock)}</div>
            <div className="mt-20 pt-10 border-t border-slate-100 flex flex-col md:flex-row justify-between text-center md:text-left text-sm text-slate-700 break-inside-avoid font-medium print:mt-20">
              <div className="mb-10 md:mb-0"><p className="italic text-slate-500">Ngày ...... tháng ...... năm ......</p><p className="font-bold text-slate-900 uppercase mt-2 text-base">Người duyệt</p></div>
              <div className="text-center"><p className="italic text-slate-500">Ngày ...... tháng ...... năm ......</p><p className="font-bold text-slate-900 uppercase mt-2 text-base">Người soạn</p><div className="mt-24 border-t border-slate-300 w-40 mx-auto" /><p className="mt-3 font-bold text-slate-800 text-lg">{metadata?.teacherName}</p></div>
            </div>
          </>
        )}
      </div>
      <style>{`@media print { @page { size: A4; margin: 0; } .print-break-after { page-break-after: always; min-height: 95vh; display: flex; flex-direction: column; justify-content: center; } .break-inside-avoid { page-break-inside: avoid; } .break-after-avoid { page-break-after: avoid; } body { background: white !important; } .print-content { width: 100% !important; margin: 0 !important; padding: 20mm 20mm 20mm 30mm !important; box-shadow: none !important; font-family: 'Times New Roman', serif !important; font-size: 13pt !important; line-height: 1.5 !important; } }`}</style>
    </div>
  );
};
export default PlanDisplay;