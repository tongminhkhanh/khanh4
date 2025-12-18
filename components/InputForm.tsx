import React, { useState, useRef } from 'react';
import { LessonInput } from '../types';

interface InputFormProps { onSubmit: (data: LessonInput) => void; isGenerating: boolean; }

const INITIAL: LessonInput = { schoolName: '', teacherName: '', date: '', subject: '', grade: 'Lớp 1', week: '1', lessonName: '', duration: '35 phút', lessonType: 'Soạn bài mới', teachingMethod: 'Phương pháp Tích cực (Mặc định)', topicContext: '', attachments: [] };

interface FieldProps {
  label: string;
  children: React.ReactNode;
}

const Field: React.FC<FieldProps> = ({ label, children }) => (
  <div className="w-full group">
    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 group-focus-within:text-indigo-600 transition-colors">
      {label}
    </label>
    {children}
  </div>
);

const SectionHeader = ({ title, icon, color = "indigo" }: { title: string, icon: React.ReactNode, color?: string }) => (
  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-${color}-500 to-${color}-600 flex items-center justify-center text-white shadow-lg shadow-${color}-500/20`}>
      {icon}
    </div>
    <h3 className="text-lg font-bold text-slate-800">{title}</h3>
  </div>
);

const InputForm: React.FC<InputFormProps> = ({ onSubmit, isGenerating }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [data, setData] = useState<LessonInput>(INITIAL);

  const update = (e: any) => setData(p => ({ ...p, [e.target.name]: e.target.value }));
  const inputClass = "w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium text-slate-700 text-sm placeholder:text-slate-400 hover:border-slate-300";

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const newFiles = [];
    for (let i = 0; i < e.target.files.length; i++) {
      const file = e.target.files[i];
      if (file.size > 10 * 1024 * 1024) { alert(`${file.name} quá lớn.`); continue; }
      const base64 = await new Promise<string>((res) => { const r = new FileReader(); r.onload = () => res((r.result as string).split(',')[1]); r.readAsDataURL(file); });
      newFiles.push({ base64, mimeType: file.type, fileName: file.name });
    }
    setData(p => ({ ...p, attachments: [...(p.attachments || []), ...newFiles] }));
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 overflow-hidden">
      <form onSubmit={(e) => { e.preventDefault(); onSubmit(data); }} className="p-6 md:p-8 space-y-10">
        <div className="flex flex-col gap-10">
          <div className="space-y-6">
            <SectionHeader
              title="Thông tin chung"
              color="indigo"
              icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>}
            />
            <div className="grid grid-cols-2 gap-6">
              <Field label="Môn học"><input name="subject" value={data.subject} onChange={update} placeholder="VD: Toán" className={inputClass} required /></Field>
              <Field label="Thời lượng"><input name="duration" value={data.duration} onChange={update} placeholder="VD: 35 phút" className={inputClass} required /></Field>
              <Field label="Lớp"><select name="grade" value={data.grade} onChange={update} className={`${inputClass} cursor-pointer appearance-none`}>{[1, 2, 3, 4, 5].map(g => <option key={g} value={`Lớp ${g}`}>Lớp {g}</option>)}</select></Field>
              <Field label="Tuần"><input type="number" name="week" value={data.week} onChange={update} className={inputClass} required /></Field>
            </div>
          </div>

          <div className="space-y-6">
            <SectionHeader
              title="Chi tiết bài dạy"
              color="violet"
              icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field label="Loại bài dạy">
                <select name="lessonType" value={data.lessonType} onChange={update} className={`${inputClass} cursor-pointer appearance-none`}>
                  {['Soạn bài mới', 'Soạn bài luyện tập thực hành', 'Soạn bài bồi dưỡng', 'Soạn bài phụ đạo'].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="Phương pháp / Phong cách">
                <select name="teachingMethod" value={data.teachingMethod} onChange={update} className={`${inputClass} cursor-pointer appearance-none`}>
                  {['Phương pháp Tích cực (Mặc định)', 'Mô hình 5E', 'Trò chơi hóa (Gamification)', 'Dạy học Dự án (PBL)', 'Bàn tay nặn bột (Hands-on)', 'Kể chuyện (Storytelling)', 'Dạy học Phân hóa', 'Lớp học Đảo ngược', 'Hợp tác nhóm', 'Giáo dục STEM'].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Tên bài dạy"><textarea name="lessonName" value={data.lessonName} onChange={update} rows={2} placeholder="Nhập tên bài học..." className={`${inputClass} resize-none`} required /></Field>
            <Field label="Ghi chú ngữ cảnh"><textarea name="topicContext" value={data.topicContext} onChange={update} rows={3} placeholder="Ngữ cảnh lớp học..." className={`${inputClass} resize-none`} /></Field>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100">
          <Field label="Tài liệu (Ảnh/PDF)">
            <div className="group border-2 border-dashed border-slate-200 rounded-2xl p-8 bg-slate-50/50 hover:bg-indigo-50/30 hover:border-indigo-400 transition-all text-center cursor-pointer relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <input type="file" ref={fileRef} multiple accept="image/*,application/pdf" onChange={handleFiles} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
              <div className="relative pointer-events-none text-slate-400 flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-700">Tải lên tài liệu tham khảo</p>
                  <p className="text-xs text-slate-500 mt-1">Kéo thả hoặc nhấn để chọn file (Ảnh/PDF)</p>
                </div>
              </div>
            </div>
          </Field>
          {data.attachments && data.attachments.length > 0 && (
            <div className="flex flex-col gap-2 mt-4">
              {data.attachments.map((f, i) => (
                <div key={i} className="flex justify-between items-center bg-white border border-slate-200 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><polyline points="13 2 13 9 20 9" /></svg>
                    </div>
                    <span className="text-sm font-medium text-slate-700 truncate">{f.fileName}</span>
                  </div>
                  <button type="button" onClick={() => setData(p => ({ ...p, attachments: p.attachments?.filter((_, idx) => idx !== i) }))} className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-2 sticky bottom-0 bg-white/90 backdrop-blur-md pb-0 -mx-6 px-6 md:-mx-8 md:px-8 py-4 border-t border-slate-100">
          <button type="submit" disabled={isGenerating} className={`w-full py-4 px-6 rounded-xl text-white font-bold text-lg shadow-xl shadow-indigo-500/30 transition-all active:scale-[0.98] hover:shadow-indigo-500/40 ${isGenerating ? 'bg-slate-300 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 bg-[length:200%_auto] animate-gradient'}`}>
            {isGenerating ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Đang suy nghĩ...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>
                Tạo Giáo Án
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
export default InputForm;
