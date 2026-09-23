import React, { useState, useRef } from 'react';
import { 
  FileText, 
  UploadCloud, 
  FileUp, 
  CheckCircle, 
  AlertCircle, 
  X, 
  Trash2, 
  Plus, 
  Clipboard, 
  Loader2,
  FileCheck,
  UserCheck,
  Info
} from 'lucide-react';
import { 
  ParsedStudent, 
  parseUploadedDocument, 
  parseRawTextToStudents,
  normalizeStudentName
} from '../utils/documentParser';
import { Member } from '../types';

interface ImportMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (students: Omit<Member, 'id' | 'stt'>[], replaceAll: boolean) => void;
  currentCount: number;
}

export const ImportMembersModal: React.FC<ImportMembersModalProps> = ({
  isOpen,
  onClose,
  onImport,
  currentCount,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pastedText, setPastedText] = useState('');
  
  // Parsed students preview list
  const [parsedList, setParsedList] = useState<ParsedStudent[]>([]);
  // Import mode: append or replace
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle file select
  const handleFileProcess = async (file: File) => {
    setSelectedFile(file);
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const results = await parseUploadedDocument(file);
      if (results.length === 0) {
        setErrorMessage(
          'Không tìm thấy danh sách học sinh hợp lệ trong file. Vui lòng kiểm tra lại cấu trúc file hoặc chuyển sang mục "Dán văn bản trực tiếp".'
        );
      } else {
        setParsedList(results);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(
        err.message || 'Đã xảy ra lỗi khi đọc file Word/PDF. Vui lòng thử lại!'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  // Handle parsing from pasted text
  const handleProcessPastedText = () => {
    if (!pastedText.trim()) {
      setErrorMessage('Vui lòng dán danh sách học sinh vào ô văn bản trước!');
      return;
    }
    setErrorMessage(null);
    const results = parseRawTextToStudents(pastedText);
    if (results.length === 0) {
      setErrorMessage(
        'Không nhận diện được tên học sinh từ văn bản đã dán. Vui lòng xem ví dụ mẫu bên dưới!'
      );
    } else {
      setParsedList(results);
    }
  };

  // Modify row in preview table
  const handleUpdateStudent = (id: string, field: keyof ParsedStudent, val: any) => {
    setParsedList((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        if (field === 'name') {
          return { ...s, name: val.toUpperCase() };
        }
        return { ...s, [field]: val };
      })
    );
  };

  // Delete row in preview
  const handleDeleteRow = (id: string) => {
    setParsedList((prev) => prev.filter((s) => s.id !== id));
  };

  // Add empty manual row in preview
  const handleAddEmptyRow = () => {
    const newStudent: ParsedStudent = {
      id: `manual-${Date.now()}`,
      stt: parsedList.length + 1,
      name: '',
      gender: 'Nam',
      note: '',
    };
    setParsedList([...parsedList, newStudent]);
  };

  // Confirm and commit import
  const handleConfirmImport = () => {
    const validStudents = parsedList
      .filter((s) => s.name.trim().length >= 2)
      .map((s) => ({
        name: normalizeStudentName(s.name),
        gender: s.gender,
        note: s.note.trim(),
      }));

    if (validStudents.length === 0) {
      setErrorMessage('Không có học sinh nào hợp lệ để nhập vào tổ.');
      return;
    }

    onImport(validStudents, importMode === 'replace');
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setSelectedFile(null);
    setParsedList([]);
    setPastedText('');
    setErrorMessage(null);
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <FileUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Thêm thành viên từ file Word / PDF
              </h3>
              <p className="text-2xs text-slate-500">
                Nhập danh sách học sinh tự động từ văn bản (.docx, .doc, .pdf, .txt, .csv)
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              handleReset();
              onClose();
            }}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers if no preview yet */}
        {parsedList.length === 0 && (
          <div className="flex items-center gap-2 border-b border-slate-100 pt-3 pb-2">
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === 'upload'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              <span>Tải file Word / PDF</span>
            </button>
            <button
              onClick={() => setActiveTab('paste')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === 'paste'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Clipboard className="w-4 h-4" />
              <span>Dán danh sách văn bản (Copy - Paste)</span>
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs pr-1">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* STEP 1A: File Upload */}
          {parsedList.length === 0 && activeTab === 'upload' && (
            <div className="space-y-4">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50/50 scale-[1.01]'
                    : 'border-slate-300 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/20'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".docx,.doc,.pdf,.txt,.csv"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="w-14 h-14 rounded-2xl bg-white shadow-xs border border-slate-200 flex items-center justify-center text-blue-600">
                  {isLoading ? (
                    <Loader2 className="w-7 h-7 animate-spin" />
                  ) : (
                    <FileUp className="w-7 h-7" />
                  )}
                </div>

                <div>
                  <div className="text-sm font-bold text-slate-800">
                    {isLoading ? 'Đang trích xuất danh sách...' : 'Chọn file hoặc kéo thả file vào đây'}
                  </div>
                  <div className="text-2xs text-slate-500 mt-1">
                    Hỗ trợ đầy đủ: <strong>Word (.docx, .doc)</strong>, <strong>PDF (.pdf)</strong>, văn bản (.txt, .csv)
                  </div>
                </div>

                {/* Formats badges */}
                <div className="flex items-center gap-2 pt-2">
                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-3xs">
                    WORD (.DOCX, .DOC)
                  </span>
                  <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold text-3xs">
                    ACROBAT (.PDF)
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-3xs">
                    TEXT & CSV
                  </span>
                </div>
              </div>

              {/* Tips for best results */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-2xs space-y-1.5 text-slate-600">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-blue-600" />
                  <span>Mẹo để nhập file chính xác nhất:</span>
                </div>
                <p>• File Word có bảng danh sách chứa các cột: <em>STT, Họ và tên, Giới tính (Nam/Nữ), Ghi chú/Chức vụ</em>.</p>
                <p>• Hoặc danh sách dòng dạng: <em>"1. NGUYỄN VĂN A - Nam - Tổ trưởng"</em>.</p>
                <p>• Hệ thống sẽ tự động lọc bỏ các dòng tiêu đề như "Cộng hòa xã hội...", "Bảng điểm...", "Họ và tên".</p>
              </div>
            </div>
          )}

          {/* STEP 1B: Paste Raw Text */}
          {parsedList.length === 0 && activeTab === 'paste' && (
            <div className="space-y-3">
              <label className="block font-semibold text-slate-700">
                Dán nội dung danh sách học sinh (copy từ Word, PDF hoặc Zalo):
              </label>
              <textarea
                rows={8}
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder={`Dán nội dung danh sách vào đây. Ví dụ:\n1. NGUYỄN VĂN AN - Nam - Tổ trưởng\n2. TRẦN THỊ BÍCH - Nữ - Tổ phó\n3. LÊ HOÀNG NAM - Nam\n4. PHẠM THUÝ VY - Nữ`}
                className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono leading-relaxed bg-white"
              />

              <div className="flex items-center justify-between">
                <span className="text-2xs text-slate-500">
                  Mỗi học sinh trên một dòng, tự động nhận diện Nam/Nữ và chức vụ.
                </span>
                <button
                  onClick={handleProcessPastedText}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs transition-colors flex items-center gap-1.5"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Xử lý danh sách</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Preview & Validation Table */}
          {parsedList.length > 0 && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-800 font-bold">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>
                    Đã trích xuất thành công {parsedList.length} học sinh
                  </span>
                  <span className="text-2xs font-normal text-emerald-700">
                    ({parsedList.filter((s) => s.gender === 'Nam').length} Nam,{' '}
                    {parsedList.filter((s) => s.gender === 'Nữ').length} Nữ)
                  </span>
                </div>
                <button
                  onClick={handleReset}
                  className="text-2xs font-semibold text-slate-600 hover:text-slate-900 bg-white px-2.5 py-1 rounded-md border border-slate-200"
                >
                  Chọn file khác
                </button>
              </div>

              {/* Table of extracted students */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="max-h-64 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 text-2xs uppercase text-slate-500 font-semibold">
                      <tr>
                        <th className="py-2.5 px-3 w-10 text-center">STT</th>
                        <th className="py-2.5 px-3">Họ và tên học sinh</th>
                        <th className="py-2.5 px-3 w-28 text-center">Giới tính</th>
                        <th className="py-2.5 px-3">Chức vụ / Ghi chú</th>
                        <th className="py-2.5 px-2 w-10 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {parsedList.map((item, index) => (
                        <tr key={item.id} className="hover:bg-slate-50/70">
                          <td className="py-2 px-3 text-center text-slate-400 font-medium tabular-nums">
                            {index + 1}
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) =>
                                handleUpdateStudent(item.id, 'name', e.target.value)
                              }
                              placeholder="HỌ VÀ TÊN..."
                              className="w-full px-2 py-1 border border-slate-200 rounded font-bold uppercase text-xs focus:ring-1 focus:ring-blue-500 bg-white"
                            />
                          </td>
                          <td className="py-2 px-3 text-center">
                            <div className="inline-flex rounded-md p-0.5 bg-slate-100">
                              <button
                                type="button"
                                onClick={() => handleUpdateStudent(item.id, 'gender', 'Nam')}
                                className={`px-2 py-0.5 text-3xs font-bold rounded ${
                                  item.gender === 'Nam'
                                    ? 'bg-blue-600 text-white'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                              >
                                Nam
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUpdateStudent(item.id, 'gender', 'Nữ')}
                                className={`px-2 py-0.5 text-3xs font-bold rounded ${
                                  item.gender === 'Nữ'
                                    ? 'bg-rose-500 text-white'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                              >
                                Nữ
                              </button>
                            </div>
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={item.note || ''}
                              onChange={(e) =>
                                handleUpdateStudent(item.id, 'note', e.target.value)
                              }
                              placeholder="Tổ trưởng, tổ phó..."
                              className="w-full px-2 py-1 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-blue-500 bg-white"
                            />
                          </td>
                          <td className="py-2 px-2 text-center">
                            <button
                              onClick={() => handleDeleteRow(item.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                              title="Xóa dòng này"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-2 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
                  <button
                    onClick={handleAddEmptyRow}
                    className="inline-flex items-center gap-1 text-2xs font-semibold text-blue-600 hover:text-blue-800 px-2 py-1 rounded"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm 1 dòng học sinh thủ công</span>
                  </button>
                  <span className="text-3xs text-slate-500">
                    Bạn có thể chỉnh sửa trực tiếp tên, giới tính hoặc xóa các dòng thừa.
                  </span>
                </div>
              </div>

              {/* Import Mode selection */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="font-semibold text-slate-800 text-2xs uppercase">
                  Tùy chọn nhập vào danh sách tổ:
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <label className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer flex-1">
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'append'}
                      onChange={() => setImportMode('append')}
                      className="text-blue-600"
                    />
                    <div>
                      <div className="font-bold text-slate-800">Thêm tiếp vào tổ</div>
                      <div className="text-3xs text-slate-500">
                        Giữ nguyên {currentCount} thành viên hiện tại và thêm {parsedList.length} bạn mới.
                      </div>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer flex-1">
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'replace'}
                      onChange={() => setImportMode('replace')}
                      className="text-blue-600"
                    />
                    <div>
                      <div className="font-bold text-rose-700">Thay thế toàn bộ tổ</div>
                      <div className="text-3xs text-slate-500">
                        Xóa danh sách cũ và đặt {parsedList.length} bạn này làm thành viên tổ mới.
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={() => {
              handleReset();
              onClose();
            }}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Đóng
          </button>

          {parsedList.length > 0 && (
            <button
              type="button"
              onClick={handleConfirmImport}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
            >
              <UserCheck className="w-4 h-4" />
              <span>
                {importMode === 'append'
                  ? `Xác nhận thêm ${parsedList.length} bạn vào tổ`
                  : `Xác nhận thay thế danh sách (${parsedList.length} bạn)`}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
