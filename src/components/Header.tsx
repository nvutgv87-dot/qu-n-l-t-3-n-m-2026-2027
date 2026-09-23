import React from 'react';
import { AVAILABLE_GROUPS } from '../config/constants';
import { ClassConfig } from '../types';
import { 
  Settings, 
  RotateCcw, 
  Download, 
  School, 
  UserCheck, 
  Layers
} from 'lucide-react';

interface HeaderProps {
  config: ClassConfig;
  onChangeGroup: (groupName: string) => void;
  onOpenSettings: () => void;
  onResetDemo: () => void;
  onExportStandaloneHtml: () => void;
  firebaseStatusBadge?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  config,
  onChangeGroup,
  onOpenSettings,
  onResetDemo,
  onExportStandaloneHtml,
  firebaseStatusBadge,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Zone 1: Brand title */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-xs shadow-blue-500/20">
              {config.className || '11A1'}
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight">
                QUẢN LÝ TỔ — {config.className}
              </h1>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="font-medium text-blue-700">{config.groupName}</span>
                <span>·</span>
                <span className="hidden sm:inline">GVCN: {config.teacherName}</span>
                <span className="hidden md:inline">·</span>
                <span className="hidden md:inline">Tổ trưởng: {config.leaderName}</span>
              </div>
            </div>
          </div>

          {/* Zone 2: Group Switcher & Teacher badge */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium">
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              <span>Đang chọn:</span>
              <select
                aria-label="Chọn tổ để quản lý"
                value={config.groupName}
                onChange={(e) => onChangeGroup(e.target.value)}
                className="bg-white border border-slate-300 rounded px-2 py-0.5 text-xs font-semibold text-blue-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {AVAILABLE_GROUPS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>GVCN: <strong className="text-slate-800">{config.teacherName}</strong></span>
            </div>
          </div>

          {/* Zone 3: Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Firebase Status Badge */}
            {firebaseStatusBadge}

            {/* Quick group select on mobile */}
            <div className="lg:hidden">
              <select
                aria-label="Chọn tổ"
                value={config.groupName}
                onChange={(e) => onChangeGroup(e.target.value)}
                className="bg-slate-100 border border-slate-300 rounded-lg px-2 py-1.5 text-xs font-semibold text-blue-700 focus:outline-hidden cursor-pointer"
              >
                {AVAILABLE_GROUPS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <button
              onClick={onExportStandaloneHtml}
              title="Tải file HTML độc lập để chạy offline không cần mạng"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-blue-700 transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>Tải file HTML</span>
            </button>

            <button
              onClick={onResetDemo}
              title="Khôi phục lại dữ liệu mẫu ban đầu"
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-amber-700 transition-colors shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden md:inline">Khôi phục demo</span>
            </button>

            <button
              onClick={onOpenSettings}
              title="Chỉnh sửa tên lớp, tên tổ, tên tổ trưởng, GVCN"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-2xs shadow-blue-500/20"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Cài đặt</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
