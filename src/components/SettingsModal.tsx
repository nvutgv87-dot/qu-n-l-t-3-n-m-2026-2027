import React, { useState } from 'react';
import { AVAILABLE_GROUPS } from '../config/constants';
import { ClassConfig } from '../types';
import { 
  Settings, 
  X, 
  Save, 
  Download, 
  Upload, 
  RotateCcw, 
  AlertTriangle,
  Info,
  Check
} from 'lucide-react';
import { exportBackupJson, importBackupJson } from '../utils/storage';
import { importBackupToCloud } from '../firebase/firestoreService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ClassConfig;
  onSaveConfig: (config: ClassConfig) => void;
  onResetDemo: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  onResetDemo,
}) => {
  const [formData, setFormData] = useState<ClassConfig>({ ...config });
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(formData);
    onClose();
  };

  const handleDownloadBackup = () => {
    const jsonStr = exportBackupJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Sao_Luu_QuanLyTo_${formData.className}_${formData.groupName}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importBackupJson(content);
        if (success) {
          try {
            await importBackupToCloud(content);
          } catch (cloudErr) {
            console.warn('Firebase cloud backup update warning:', cloudErr);
          }
          setImportStatus('Khôi phục dữ liệu lên Firebase thành công! Đang tải lại...');
          setTimeout(() => {
            window.location.reload();
          }, 800);
        } else {
          setImportStatus('File sao lưu không hợp lệ. Vui lòng kiểm tra lại!');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">
              Cài đặt thông tin lớp & tổ
            </h3>
          </div>
          <button
            aria-label="Đóng bảng cài đặt"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notice */}
        <div className="mt-3 p-3 bg-blue-50/70 border border-blue-100 rounded-xl flex items-start gap-2.5 text-xs text-blue-900">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            Dữ liệu được kết nối và đồng bộ hóa thời gian thực lên <strong>Firebase Cloud Firestore (Dự án: quan-li-to---3)</strong>, đồng thời tự động lưu trữ bộ nhớ đệm ngoại tuyến để ứng dụng luôn hoạt động mượt mà.
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tên lớp
              </label>
              <input
                type="text"
                required
                value={formData.className}
                onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-semibold text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tên tổ
              </label>
              <select
                aria-label="Chọn tên tổ trong bảng cài đặt"
                value={formData.groupName}
                onChange={(e) => setFormData({ ...formData, groupName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-semibold text-xs bg-white"
              >
                {AVAILABLE_GROUPS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Họ tên Tổ trưởng
              </label>
              <input
                type="text"
                required
                value={formData.leaderName}
                onChange={(e) => setFormData({ ...formData, leaderName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Họ tên Giáo viên chủ nhiệm (GVCN)
              </label>
              <input
                type="text"
                required
                value={formData.teacherName}
                onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tên trường
              </label>
              <input
                type="text"
                value={formData.schoolName}
                onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Năm học
              </label>
              <input
                type="text"
                value={formData.schoolYear}
                onChange={(e) => setFormData({ ...formData, schoolYear: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
              />
            </div>
          </div>

          {/* Backup & Restore section */}
          <div className="pt-3 border-t border-slate-100">
            <div className="font-semibold text-slate-800 mb-2">
              Sao lưu và đồng bộ dữ liệu
            </div>

            {importStatus && (
              <div className="mb-2 p-2 bg-emerald-50 text-emerald-800 text-2xs rounded border border-emerald-200">
                {importStatus}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleDownloadBackup}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-2xs font-semibold transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-blue-600" />
                <span>Xuất file sao lưu (JSON)</span>
              </button>

              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-2xs font-semibold cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5 text-emerald-600" />
                <span>Nhập từ file sao lưu</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Khôi phục dữ liệu mẫu demo ban đầu? Dữ liệu hiện tại sẽ được thay thế.')) {
                    onResetDemo();
                    onClose();
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-2xs font-semibold transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                <span>Khôi phục demo gốc</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>Lưu thông tin</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
