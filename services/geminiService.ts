import { GoogleGenAI } from "@google/genai";
import { LessonInput } from "../types";

const generatePrompt = (data: LessonInput): string => {
  let specificInstruction = "";

  if (data.lessonType === 'Soạn bài luyện tập thực hành') {
    specificInstruction = `
    **TRỌNG TÂM: RÈN LUYỆN KỸ NĂNG & CỦNG CỐ KIẾN THỨC**
    - Giảm tối đa lý thuyết (chỉ nhắc lại < 3 phút nếu cần).
    - Thiết kế chuỗi hoạt động theo cấp độ: Nhận biết -> Thông hiểu -> Vận dụng.
    - Sử dụng phương pháp Trò chơi hóa (Gamification) hoặc Hoạt động nhóm để bài luyện tập không nhàm chán.
    - Chú trọng sửa lỗi sai thường gặp của học sinh.`;
  } else if (data.lessonType === 'Soạn bài bồi dưỡng') {
    specificInstruction = `
    **TRỌNG TÂM: PHÁT TRIỂN TƯ DUY SÂU & SÁNG TẠO (VƯỢT CHUẨN)**
    - Nội dung phải có tính thách thức, kích thích tò mò.
    - Toán học: Bài toán có lời văn lắt léo, tư duy ngược, logic nhiều bước.
    - Tiếng Việt: Cảm thụ văn học sâu sắc, sáng tạo câu chuyện/tình huống mới.`;
  } else if (data.lessonType === 'Soạn bài phụ đạo') {
    specificInstruction = `
    **TRỌNG TÂM: LẤY LẠI CĂN BẢN & XÂY DỰNG SỰ TỰ TIN**
    - Nguyên tắc "Chia nhỏ vấn đề" (Scaffolding): Tách kiến thức phức tạp thành các bước nhỏ, dễ thực hiện.
    - Bắt buộc ôn lại kiến thức nền tảng (cũ) liên quan trực tiếp đến bài mới.
    - Thực hành: "Cầm tay chỉ việc", làm mẫu kỹ lưỡng -> HS làm tương tự.`;
  } else {
    specificInstruction = `
    **TRỌNG TÂM: HÌNH THÀNH KIẾN THỨC MỚI QUA TRẢI NGHIỆM**
    - Tuân thủ quy trình: Khởi động (Kết nối) -> Khám phá (Hình thành kiến thức) -> Luyện tập -> Vận dụng.`;
  }

  let methodInstruction = "";
  if (data.teachingMethod && data.teachingMethod !== 'Phương pháp Tích cực (Mặc định)') {
    methodInstruction = `=== YÊU CẦU ĐẶC BIỆT VỀ PHƯƠNG PHÁP: ${data.teachingMethod.toUpperCase()} ===`;
  }

  const hasAttachments = data.attachments && data.attachments.length > 0;

  return `
ĐÓNG VAI: Bạn là một Giáo viên Giỏi cấp Tỉnh/Thành phố, am hiểu sâu sắc Chương trình Giáo dục Phổ thông 2018 và Công văn 2345.

NHIỆM VỤ: Soạn thảo Kế hoạch bài dạy (Giáo án) chi tiết.

THÔNG TIN ĐẦU VÀO:
- Môn học: ${data.subject}
- Lớp: ${data.grade}
- Tuần: ${data.week}
- Tên bài: ${data.lessonName}
- Loại bài dạy: ${data.lessonType}
- Thời lượng: ${data.duration}
${data.topicContext ? `- Ghi chú đặc biệt: ${data.topicContext}` : ''}

=== YÊU CẦU QUAN TRỌNG VỀ ĐỊNH DẠNG: PHẦN "CÁC HOẠT ĐỘNG DẠY HỌC CHỦ YẾU" BẮT BUỘC PHẢI TRÌNH BÀY DƯỚI DẠNG BẢNG 2 CỘT. ===
Cột 1: Hoạt động của giáo viên
Cột 2: Hoạt động của học sinh

HƯỚNG DẪN CỤ THỂ CHO LOẠI BÀI NÀY:
${specificInstruction}
${methodInstruction}

${hasAttachments ? `Sử dụng nội dung từ file đính kèm để làm ngữ liệu.` : ''}

=== QUY ĐỊNH ĐỊNH DẠNG ===
1. **Toán học & LaTeX**: Mọi biểu thức toán học BẮT BUỘC phải viết bằng LaTeX giữa dấu \`$\` hoặc \`$$\`.
2. **Danh sách**: Dùng gạch đầu dòng "-".
3. **Tiêu đề**: Dùng #, ##, ### theo chuẩn Markdown.
4. **Bảng**: Sử dụng Markdown Table chuẩn.

---
CẤU TRÚC GIÁO ÁN MONG MUỐN:
## I. YÊU CẦU CẦN ĐẠT
(Liệt kê trực tiếp các biểu hiện cần đạt của học sinh bằng gạch đầu dòng "-". KHÔNG chia mục Năng lực đặc thù/Năng lực chung/Phẩm chất. KHÔNG ghi tên năng lực.)
- [Biểu hiện 1]
- [Biểu hiện 2]
- ...

## II. ĐỒ DÙNG DẠY HỌC
1. **Giáo viên**
2. **Học sinh**

## III. CÁC HOẠT ĐỘNG DẠY HỌC CHỦ YẾU
*(Bắt buộc dùng bảng 2 cột như mẫu dưới đây)*

| Hoạt động của giáo viên | Hoạt động của học sinh |
| :--- | :--- |
| **1. Khởi động (5 phút)**<br>- GV tổ chức trò chơi...<br>- GV đặt câu hỏi... | <br>- HS tham gia trò chơi...<br>- HS trả lời... |
| **2. Khám phá (15 phút)**<br>... | ... |

## IV. ĐIỀU CHỈNH SAU BÀI DẠY
- .........................
  `;
};

export const generateLessonPlan = async (input: LessonInput): Promise<string> => {
  try {
    const apiKey = process.env.API_KEY;
    const ai = new GoogleGenAI({ apiKey });
    const parts: any[] = [{ text: generatePrompt(input) }];
    if (input.attachments && input.attachments.length > 0) {
      input.attachments.forEach(att => parts.push({ inlineData: { mimeType: att.mimeType, data: att.base64 } }));
    }
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: parts },
      config: { temperature: 0.7, maxOutputTokens: 8192 }
    });
    return response.text || "";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};