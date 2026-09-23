import * as mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker
if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  try {
    const version = (pdfjsLib as any).version || '4.10.38';
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.mjs`;
  } catch (err) {
    console.warn('PDF.js worker initialization notice:', err);
  }
}

export interface ParsedStudent {
  id: string;
  name: string;
  gender: 'Nam' | 'Nữ';
  note: string;
  stt?: number;
}

// Words to ignore (headers, class titles, metadata)
const IGNORE_HEADER_WORDS = [
  'DANH SACH',
  'DANH SÁCH',
  'HO VA TEN',
  'HỌ VÀ TÊN',
  'HỌ TÊN',
  'HO TEN',
  'GIOI TINH',
  'GIỚI TÍNH',
  'GHI CHU',
  'GHI CHÚ',
  'TRUONG THPT',
  'TRƯỜNG THPT',
  'CONG HOA',
  'CỘNG HÒA',
  'DOC LAP',
  'ĐỘC LẬP',
  'NAM HOC',
  'NĂM HỌC',
  'GIAO VIEN',
  'GIÁO VIÊN',
  'TO TRUONG',
  'TỔ TRƯỞNG',
  'SO THU TU',
  'SỐ THỨ TỰ',
  'TRANG',
  'PAGE',
  'CLASS',
  'MON HOC',
  'MÔN HỌC',
  'DIEM SO',
  'ĐIỂM SỐ',
  'NGAY THANG',
  'NGÀY THÁNG',
];

/**
 * Checks if a line is just table header or irrelevant document title
 */
function isIgnoredHeaderLine(line: string): boolean {
  const upper = line.toUpperCase().trim();
  if (upper.length < 3) return true;
  for (const h of IGNORE_HEADER_WORDS) {
    if (upper === h || upper.startsWith(h + ' ') || upper.startsWith(h + ':')) {
      return true;
    }
  }
  return false;
}

/**
 * Clean and normalize Vietnamese names to uppercase title standard
 */
export function normalizeStudentName(name: string): string {
  return name
    .replace(/[^\p{L}\s]/gu, '') // Keep letters and spaces
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();
}

/**
 * Parses raw text or lines into structured student list
 */
export function parseRawTextToStudents(text: string): ParsedStudent[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const results: ParsedStudent[] = [];
  let currentStt = 1;

  for (const rawLine of lines) {
    if (isIgnoredHeaderLine(rawLine)) continue;

    // Split by common delimiters (tabs, multiple spaces, |, ;, commas)
    let parts: string[] = [];
    if (rawLine.includes('\t')) {
      parts = rawLine.split('\t').map((p) => p.trim());
    } else if (rawLine.includes('|')) {
      parts = rawLine.split('|').map((p) => p.trim());
    } else if (rawLine.includes(';') && rawLine.split(';').length >= 2) {
      parts = rawLine.split(';').map((p) => p.trim());
    } else {
      // Regex pattern: check for leading number "1. ", "01 -", "1\t"
      const matchLeadingNumber = rawLine.match(/^(\d+)[\.\s\-\:\)]+\s*(.*)$/);
      let content = rawLine;
      if (matchLeadingNumber) {
        content = matchLeadingNumber[2].trim();
      }

      // Check if line contains Gender hints
      // e.g. "Nguyễn Văn A - Nam - Tổ trưởng"
      if (content.includes(' - ')) {
        parts = content.split(' - ').map((p) => p.trim());
      } else if (content.includes(', ') && content.split(', ').length >= 2) {
        parts = content.split(', ').map((p) => p.trim());
      } else {
        // Fallback space separated or parentheses: "Nguyễn Văn A (Nam)"
        const parenMatch = content.match(/^(.*?)\s*[\(\[]\s*(Nam|Nữ|Nu|nam|nữ|nu)\s*[\)\]]\s*(.*)$/i);
        if (parenMatch) {
          parts = [parenMatch[1].trim(), parenMatch[2].trim(), parenMatch[3].trim()];
        } else {
          // Check if ending has Nam or Nữ
          const endGenderMatch = content.match(/^(.*?)\s+(Nam|Nữ|Nu|nam|nữ|nu)$/i);
          if (endGenderMatch) {
            parts = [endGenderMatch[1].trim(), endGenderMatch[2].trim()];
          } else {
            parts = [content];
          }
        }
      }
    }

    // Filter empty parts
    parts = parts.filter((p) => p.length > 0);
    if (parts.length === 0) continue;

    // Identify Name, Gender, Note
    let detectedName = '';
    let detectedGender: 'Nam' | 'Nữ' = 'Nam';
    let detectedNote = '';

    // If first part is just a number (STT), shift it
    if (/^\d+$/.test(parts[0])) {
      parts.shift();
    }

    if (parts.length === 0) continue;

    // Look for Gender among parts
    const genderIndex = parts.findIndex((p) =>
      /^(Nam|Nữ|Nu|boy|girl|trai|gái)$/i.test(p.trim())
    );

    if (genderIndex !== -1) {
      const gStr = parts[genderIndex].toLowerCase();
      detectedGender = gStr.startsWith('nữ') || gStr.startsWith('nu') || gStr === 'girl' || gStr === 'gái' ? 'Nữ' : 'Nam';
      // Name is usually the part before gender or first part
      const nameParts = parts.filter((_, i) => i < genderIndex);
      detectedName = nameParts.join(' ');
      // Notes are parts after gender
      const noteParts = parts.filter((_, i) => i > genderIndex);
      detectedNote = noteParts.join(', ');
    } else {
      // No explicit gender column
      detectedName = parts[0];
      if (parts.length > 1) {
        detectedNote = parts.slice(1).join(', ');
      }
      // Guess gender from Vietnamese middle name (Thị -> Nữ, Văn -> Nam)
      const upperName = detectedName.toUpperCase();
      if (upperName.includes(' THỊ ') || upperName.endsWith(' THỊ')) {
        detectedGender = 'Nữ';
      }
    }

    const cleanName = normalizeStudentName(detectedName);

    // Validate name: At least 2 words or length > 4, not just numbers or symbols
    if (cleanName.length >= 3 && !isIgnoredHeaderLine(cleanName)) {
      results.push({
        id: `parsed-${Date.now()}-${currentStt}-${Math.random().toString(36).substr(2, 4)}`,
        stt: currentStt++,
        name: cleanName,
        gender: detectedGender,
        note: detectedNote.trim(),
      });
    }
  }

  return results;
}

/**
 * Extracts students from HTML tables (converted by Mammoth from .docx)
 */
function extractFromHtmlTables(html: string): ParsedStudent[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const tables = doc.querySelectorAll('table');

  if (tables.length === 0) {
    return [];
  }

  const results: ParsedStudent[] = [];
  let currentStt = 1;

  tables.forEach((table) => {
    const rows = table.querySelectorAll('tr');
    rows.forEach((row) => {
      const cells = Array.from(row.querySelectorAll('td, th')).map((c) =>
        (c.textContent || '').trim()
      );
      if (cells.length < 2) return;

      const fullRowText = cells.join(' ').toUpperCase();
      if (
        fullRowText.includes('HỌ VÀ TÊN') ||
        fullRowText.includes('HỌ TÊN') ||
        fullRowText.includes('HỌ LÓT') ||
        fullRowText.includes('STT')
      ) {
        return; // skip table header row
      }

      // Check format:
      // Pattern A: [STT, Họ tên, Giới tính, Ghi chú]
      // Pattern B: [STT, Họ và chữ lót, Tên, Giới tính...]
      let name = '';
      let gender: 'Nam' | 'Nữ' = 'Nam';
      let note = '';

      if (cells.length >= 3) {
        // Test if cells[1] is name and cells[2] is gender
        const maybeGender = cells[2].trim();
        const maybeGenderLower = maybeGender.toLowerCase();

        if (['nam', 'nữ', 'nu'].includes(maybeGenderLower)) {
          name = cells[1];
          gender = maybeGenderLower === 'nam' ? 'Nam' : 'Nữ';
          note = cells.slice(3).join(', ');
        } else if (['nam', 'nữ', 'nu'].includes(cells[3]?.toLowerCase())) {
          // Columns: [STT, Họ lót, Tên, Giới tính]
          name = `${cells[1]} ${cells[2]}`;
          gender = cells[3].toLowerCase() === 'nam' ? 'Nam' : 'Nữ';
          note = cells.slice(4).join(', ');
        } else {
          name = cells[1];
          note = cells.slice(2).join(', ');
        }
      } else if (cells.length === 2) {
        name = /^\d+$/.test(cells[0]) ? cells[1] : cells[0];
      }

      const clean = normalizeStudentName(name);
      if (clean.length >= 3 && !isIgnoredHeaderLine(clean)) {
        // Auto detect gender from name if not specified
        if (clean.includes(' THỊ ') || clean.endsWith(' THỊ')) {
          gender = 'Nữ';
        }

        results.push({
          id: `html-${Date.now()}-${currentStt}-${Math.random().toString(36).substr(2, 4)}`,
          stt: currentStt++,
          name: clean,
          gender,
          note: note.trim(),
        });
      }
    });
  });

  return results;
}

/**
 * Parse .docx Microsoft Word file
 */
export async function parseDocxFile(file: File): Promise<ParsedStudent[]> {
  const arrayBuffer = await file.arrayBuffer();

  try {
    // 1. Try HTML conversion to preserve table structures
    const htmlResult = await mammoth.convertToHtml({ arrayBuffer });
    if (htmlResult && htmlResult.value) {
      const fromTables = extractFromHtmlTables(htmlResult.value);
      if (fromTables.length > 0) {
        return fromTables;
      }
    }
  } catch (err) {
    console.warn('Mammoth HTML parsing warning, falling back to raw text:', err);
  }

  // 2. Fallback to raw text extraction
  const textResult = await mammoth.extractRawText({ arrayBuffer });
  return parseRawTextToStudents(textResult.value || '');
}

/**
 * Parse .doc (Legacy Word 97-2003 Binary)
 */
export async function parseDocFile(file: File): Promise<ParsedStudent[]> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  // Try decoding as UTF-8 or Windows-1258
  let text = '';
  try {
    const decoder = new TextDecoder('utf-8', { fatal: false });
    text = decoder.decode(bytes);
  } catch {
    const decoder = new TextDecoder('windows-1258', { fatal: false });
    text = decoder.decode(bytes);
  }

  // Clean binary noise: extract lines with valid Vietnamese characters and spaces
  const cleanLines = text
    .split(/[\r\n\x00-\x08\x0B\x0C\x0E-\x1F]+/)
    .map((l) => l.trim())
    .filter((l) => l.length >= 3 && /[\p{L}]/u.test(l))
    .join('\n');

  return parseRawTextToStudents(cleanLines);
}

/**
 * Parse .pdf file
 */
export async function parsePdfFile(file: File): Promise<ParsedStudent[]> {
  const arrayBuffer = await file.arrayBuffer();

  try {
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdfDoc = await loadingTask.promise;
    let fullText = '';

    for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const content = await page.getTextContent();
      
      // Group items by vertical position (Y) to reconstruct rows
      const items = content.items as any[];
      let lastY: number | null = null;
      let pageText = '';

      for (const item of items) {
        if (!item.str) continue;
        const currentY = item.transform ? Math.round(item.transform[5]) : null;

        if (lastY !== null && currentY !== null && Math.abs(currentY - lastY) > 5) {
          pageText += '\n';
        } else if (pageText.length > 0 && !pageText.endsWith('\n') && !pageText.endsWith(' ')) {
          pageText += '\t';
        }

        pageText += item.str;
        lastY = currentY;
      }

      fullText += pageText + '\n';
    }

    const students = parseRawTextToStudents(fullText);
    return students;
  } catch (err) {
    console.error('PDF parsing error:', err);
    throw new Error('Không thể đọc nội dung file PDF. Vui lòng thử dùng file Word (.docx) hoặc dán trực tiếp danh sách vào ô văn bản.');
  }
}

/**
 * Universal Master Parser for any supported document
 */
export async function parseUploadedDocument(file: File): Promise<ParsedStudent[]> {
  const ext = file.name.split('.').pop()?.toLowerCase();

  if (ext === 'docx') {
    return await parseDocxFile(file);
  } else if (ext === 'doc') {
    return await parseDocFile(file);
  } else if (ext === 'pdf') {
    return await parsePdfFile(file);
  } else if (ext === 'txt' || ext === 'csv') {
    const text = await file.text();
    return parseRawTextToStudents(text);
  } else {
    throw new Error('Định dạng file không được hỗ trợ. Vui lòng chọn file Word (.docx, .doc), PDF (.pdf), hoặc file văn bản (.txt, .csv).');
  }
}
