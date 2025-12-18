
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  HeadingLevel,
  AlignmentType,
  VerticalAlign,
  PageBreak,
  PageOrientation,
  TableLayoutType,
  Math,
  MathFraction,
  MathRun,
} from "docx";
import { LessonInput } from "../types";

// --- CONSTANTS ---
// 1 cm = 567 twips
const MARGIN_TOP = 1134;    // 2cm
const MARGIN_BOTTOM = 1134; // 2cm
const MARGIN_LEFT = 1701;   // 3cm
const MARGIN_RIGHT = 851;   // 1.5cm
const FONT_FAMILY = "Times New Roman";
const FONT_SIZE_STANDARD = 28; // 14pt (docx uses half-points)

/**
 * Helper to parse text with:
 * 1. Bold (**text**)
 * 2. Math ($a/b$)
 * Returns an array of children for a Paragraph (TextRun | Math)
 */
const parseTextToRuns = (text: string): (TextRun | Math)[] => {
  if (!text) return [];

  // Split by LaTeX delimiters ($...$)
  // Regex captures the content inside $...$ in odd indices
  const parts = text.split(/\$([^$]+)\$/g);

  const results: (TextRun | Math)[] = [];

  parts.forEach((part, index) => {
    // Even index = regular text (which might contain bold **...**)
    // Odd index = Math content
    if (index % 2 === 0) {
        if (!part) return;
        // Parse bold in regular text
        const boldParts = part.split(/\*\*(.*?)\*\*/g);
        boldParts.forEach((bp, bi) => {
            if (bi % 2 === 0) {
                // Regular
                if (bp) results.push(new TextRun({ text: bp, font: FONT_FAMILY, size: FONT_SIZE_STANDARD }));
            } else {
                // Bold
                if (bp) results.push(new TextRun({ text: bp, bold: true, font: FONT_FAMILY, size: FONT_SIZE_STANDARD }));
            }
        });
    } else {
        // MATH CONTENT (e.g., "1/2" or "\frac{1}{2}")
        // Simple parser for basic fractions
        if (part.includes("/")) {
            // Case: a/b
            const [num, den] = part.split("/").map(s => s.trim());
            if (num && den) {
                results.push(new Math({
                    children: [
                        new MathFraction({
                            numerator: [new MathRun(num)],
                            denominator: [new MathRun(den)],
                        })
                    ]
                }));
                return;
            }
        }
        
        if (part.includes("\\frac")) {
            // Case: \frac{a}{b} - Very basic parser for \frac{a}{b} format
            // Regex to match \frac{numerator}{denominator}
            const match = part.match(/\\frac\{(.+?)\}\{(.+?)\}/);
            if (match) {
                const num = match[1];
                const den = match[2];
                results.push(new Math({
                    children: [
                        new MathFraction({
                            numerator: [new MathRun(num)],
                            denominator: [new MathRun(den)],
                        })
                    ]
                }));
                return;
            }
        }

        // Fallback: Just render as MathRun if parsing fails or it's simple math like "x + y"
        results.push(new Math({
            children: [new MathRun(part)]
        }));
    }
  });

  return results;
};

/**
 * Creates the Cover Page section
 */
const createCoverPage = (metadata: LessonInput): Paragraph[] => {
    // Explicitly type align to prevent narrowing to specific string literal. 
    // Using 'any' because AlignmentType can sometimes be interpreted as a value (const object) rather than a type in certain setups.
    const p = (children: TextRun[], align: any = AlignmentType.LEFT, spaceAfter = 200, indentLeft = 0) => 
        new Paragraph({ children, alignment: align, spacing: { after: spaceAfter }, indent: { left: indentLeft } });

    const items: Paragraph[] = [];

    // Department Header
    items.push(new Paragraph({
        children: [
            new TextRun({ text: "PHÒNG GD&ĐT ....................", bold: true, font: FONT_FAMILY, size: FONT_SIZE_STANDARD }),
            new TextRun({ text: "\t\tCỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM", bold: true, font: FONT_FAMILY, size: FONT_SIZE_STANDARD }),
        ],
        tabStops: [{ type: "right", position: 9000 }],
        spacing: { after: 100 }
    }));

    // Motto
    items.push(new Paragraph({
        children: [
            new TextRun({ text: metadata.schoolName?.toUpperCase() || "TRƯỜNG................", bold: true, font: FONT_FAMILY, size: FONT_SIZE_STANDARD }),
            new TextRun({ text: "\t\tĐộc lập - Tự do - Hạnh phúc", bold: true, underline: { type: "single" }, font: FONT_FAMILY, size: FONT_SIZE_STANDARD }),
        ],
        tabStops: [{ type: "right", position: 9500 }],
        spacing: { after: 3000 }
    }));

    // Main Titles
    items.push(p([new TextRun({ text: "KẾ HOẠCH BÀI DẠY", bold: true, font: FONT_FAMILY, size: 40 })], AlignmentType.CENTER, 400));
    items.push(p([new TextRun({ text: `MÔN: ${metadata.subject.toUpperCase()}`, bold: true, font: FONT_FAMILY, size: 32 })], AlignmentType.CENTER, 200));
    items.push(p([new TextRun({ text: `BÀI: ${metadata.lessonName}`, bold: true, font: FONT_FAMILY, size: 30 })], AlignmentType.CENTER, 1000));

    // Info Details
    const infoIndent = 3000;
    const addInfo = (label: string, value: string) => {
        items.push(p([
            new TextRun({ text: `${label}: `, font: FONT_FAMILY, size: FONT_SIZE_STANDARD }),
            new TextRun({ text: value, bold: true, font: FONT_FAMILY, size: FONT_SIZE_STANDARD })
        ], AlignmentType.LEFT, 200, infoIndent));
    };

    addInfo("Giáo viên", metadata.teacherName || "........................................");
    addInfo("Lớp", metadata.grade);
    addInfo("Tuần", metadata.week);
    addInfo("Ngày dạy", metadata.date || "....................");

    // Year
    items.push(p([new TextRun({ text: `Năm học: ${new Date().getFullYear()} - ${new Date().getFullYear() + 1}`, italics: true, font: FONT_FAMILY, size: FONT_SIZE_STANDARD })], AlignmentType.CENTER, 0));
    
    // Break
    items.push(new Paragraph({ children: [new PageBreak()], spacing: { before: 2000 } }));

    return items;
};

/**
 * Generates the DOCX Blob
 */
export const generateDocxBlob = async (markdown: string, metadata?: LessonInput): Promise<Blob> => {
  const children: (Paragraph | Table)[] = [];
  
  // 1. Add Cover Page if applicable
  if (metadata?.schoolName) {
      children.push(...createCoverPage(metadata));
  }

  const lines = markdown.split("\n");
  let tableBuffer: string[] = [];

  const processTableBuffer = () => {
    if (tableBuffer.length === 0) return;

    // Filter valid rows (remove separator lines like |---|)
    const validRows = tableBuffer.filter(row => {
        const trimmed = row.trim();
        if (!trimmed) return false;
        // Detect separator line: typically contains only |, -, :, and whitespace
        if (/^\|?[\s\-:|]+\|?$/.test(trimmed)) return false;
        return true;
    });
    
    if (validRows.length > 0) {
        
        const docxRows = validRows.map((line) => {
            const cells = line.split("|");
            // Remove empty start/end artifacts from split
            if (line.trim().startsWith("|")) cells.shift();
            if (line.trim().endsWith("|")) cells.pop();

            return new TableRow({
                children: cells.map((cellText) => {
                    const cleanCellText = cellText.trim();
                    const lines = cleanCellText.split(/<br\s*\/?>/gi);
                    
                    const cellParagraphs = lines.map(l => {
                        const trimmedLine = l.trim();
                        
                        // Check for Blockquote
                        const isBlockquote = trimmedLine.startsWith(">");
                        
                        // Check for List Item
                        const isList = trimmedLine.startsWith("- ") || trimmedLine.startsWith("* ");

                        let txt = trimmedLine;
                        if (isBlockquote) txt = trimmedLine.replace(/^>\s*/, "");
                        if (isList) txt = trimmedLine.replace(/^[-*]\s+/, "");
                        
                        // Parse bold and content
                        const runs = parseTextToRuns(txt);

                        // If it is a list, prepend the hyphen manually
                        if (isList) {
                            runs.unshift(new TextRun({ text: "- ", font: FONT_FAMILY, size: FONT_SIZE_STANDARD }));
                        }

                        // Determine formatting
                        let indentSpec = undefined;
                        let borderSpec = undefined;
                        let shadingSpec = undefined;

                        if (isBlockquote) {
                            indentSpec = { left: 300 };
                            borderSpec = {
                                left: { style: BorderStyle.SINGLE, size: 12, color: "2E75B5", space: 5 } // Thick blue left border
                            };
                            shadingSpec = { fill: "F0F8FF" };
                        } else if (isList) {
                            // Standard hanging indent for list items inside tables
                            indentSpec = { left: 360, hanging: 360 };
                        }

                        return new Paragraph({
                            children: runs,
                            spacing: { after: 100 },
                            indent: indentSpec,
                            border: borderSpec,
                            shading: shadingSpec
                        });
                    });

                    return new TableCell({
                        children: cellParagraphs,
                        verticalAlign: VerticalAlign.CENTER,
                        borders: {
                            top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                            bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                            left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                            right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                        },
                        // OPTIMIZATION: Use AUTO width to allow content to dictate column size
                        width: { size: 0, type: WidthType.AUTO },
                        margins: { top: 100, bottom: 100, left: 100, right: 100 }
                    });
                })
            });
        });

        children.push(new Table({ 
            rows: docxRows, 
            width: { size: 100, type: WidthType.PERCENTAGE },
            layout: TableLayoutType.AUTOFIT 
        }));
    }
    tableBuffer = [];
  };

  // 2. Process Markdown Lines
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Check if it's a table line
    if (line.startsWith("|")) {
      tableBuffer.push(line);
      continue;
    } else {
      processTableBuffer();
    }

    if (!line) {
        children.push(new Paragraph({ text: "" }));
        continue;
    }

    // --- Headers ---
    if (line.startsWith("# ")) {
        // Only show H1 if no cover page exists to avoid duplication
        if (!metadata?.schoolName) {
             children.push(new Paragraph({
                children: [new TextRun({ text: line.replace("# ", ""), font: FONT_FAMILY, bold: true, size: 32, color: "2E75B5" })],
                heading: HeadingLevel.HEADING_1,
                alignment: AlignmentType.CENTER,
                spacing: { before: 400, after: 200 },
            }));
        }
    } else if (line.startsWith("## ")) {
      children.push(new Paragraph({
          children: [new TextRun({ text: line.replace("## ", ""), font: FONT_FAMILY, bold: true, size: 28, color: "1F4E79" })],
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 150 },
        }));
    } else if (line.startsWith("### ")) {
      children.push(new Paragraph({
          children: [new TextRun({ text: line.replace("### ", ""), font: FONT_FAMILY, bold: true, size: 28 })],
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 200, after: 100 },
        }));
    }
    // --- Blockquotes / Box (Outside Table) ---
    else if (line.startsWith("> ")) {
       children.push(new Paragraph({
          children: parseTextToRuns(line.replace(/^>\s*/, "")),
          border: {
            top: { style: BorderStyle.SINGLE, size: 6, space: 4, color: "CCCCCC" },
            bottom: { style: BorderStyle.SINGLE, size: 6, space: 4, color: "CCCCCC" },
            left: { style: BorderStyle.SINGLE, size: 18, space: 10, color: "2E75B5" }, // Thicker left border
            right: { style: BorderStyle.SINGLE, size: 6, space: 4, color: "CCCCCC" },
          },
          shading: { fill: "F8F9FA" },
          spacing: { before: 200, after: 200 },
          indent: { left: 720, right: 720 },
          alignment: AlignmentType.JUSTIFIED
        }));
    }
    // --- Lists (Hyphens) - Main Body ---
    else if (line.startsWith("- ") || line.startsWith("* ")) {
       children.push(new Paragraph({
          children: [
              new TextRun({ text: "- ", font: FONT_FAMILY, size: FONT_SIZE_STANDARD }),
              ...parseTextToRuns(line.replace(/^[-*]\s+/, ""))
          ],
          indent: { left: 720, hanging: 360 },
          spacing: { after: 100 }
        }));
    }
    // --- Standard Text ---
    else {
      children.push(new Paragraph({
          children: parseTextToRuns(line),
          alignment: AlignmentType.JUSTIFIED,
          spacing: { after: 200 },
        }));
    }
  }
  
  processTableBuffer(); // Final flush

  const doc = new Document({
    styles: {
        paragraphStyles: [
            {
                id: "Normal",
                name: "Normal",
                run: { font: FONT_FAMILY, size: FONT_SIZE_STANDARD },
                paragraph: { spacing: { line: 276 } }
            }
        ]
    },
    sections: [{
        properties: {
            page: {
                size: { orientation: PageOrientation.PORTRAIT, width: 11906, height: 16838 }, // A4
                margin: { top: MARGIN_TOP, bottom: MARGIN_BOTTOM, left: MARGIN_LEFT, right: MARGIN_RIGHT }
            }
        },
        children: children,
    }],
  });

  return Packer.toBlob(doc);
};
