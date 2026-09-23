import React from 'react';
import { ActiveTab } from '../types';
import { 
  LayoutDashboard, 
  Users, 
  CalendarCheck, 
  Award, 
  BarChart3, 
  History, 
  FileSpreadsheet,
  Info
} from 'lucide-react';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  memberCount: number;
}

const MENU_ITEMS = [
  { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
  { id: 'members', label: 'Thành viên tổ', icon: Users },
  { id: 'attendance', label: 'Điểm danh chuyên cần', icon: CalendarCheck },
  { id: 'behavior', label: 'Ghi nhận vi phạm / khen', icon: Award },
  { id: 'scoreboard', label: 'Bảng điểm thi đua', icon: BarChart3 },
  { id: 'history', label: 'Lịch sử ghi nhận', icon: History },
  { id: 'report', label: 'Báo cáo tuần', icon: FileSpreadsheet },
] as const;

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  memberCount,
}) => {
  return (
    <>
      {/* Desktop Sidebar (hidden on mobile) */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 shrink-0 min-h-[calc(100vh-4rem)]">
        <div className="p-4 space-y-1.5 flex-1">
          <div className="px-3 py-2 text-2xs font-bold uppercase tracking-wider text-slate-400">
            Chức năng quản lý
          </div>

          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id as ActiveTab)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.id === 'members' && (
                  <span className={`text-2xs px-2 py-0.5 rounded-full font-bold tabular-nums ${
                    isActive ? 'bg-blue-200/60 text-blue-800' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {memberCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Local storage note indicator */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-start gap-2 text-2xs text-slate-500 leading-relaxed">
            <Info className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
            <span>
              Lưu trữ an toàn trên trình duyệt thiết bị (localStorage). Phục vụ tổ trưởng chấm điểm nội bộ.
            </span>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation (fixed at bottom on mobile) */}
      <nav aria-label="Điều hướng chính" className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1 flex items-center justify-around shadow-lg">
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          // Shorten labels for mobile bottom bar
          let mobileLabel: string = item.label;
          if (item.id === 'dashboard') mobileLabel = 'Tổng quan';
          else if (item.id === 'members') mobileLabel = 'Thành viên';
          else if (item.id === 'attendance') mobileLabel = 'Điểm danh';
          else if (item.id === 'behavior') mobileLabel = 'Ghi điểm';
          else if (item.id === 'scoreboard') mobileLabel = 'Bảng điểm';
          else if (item.id === 'history') mobileLabel = 'Lịch sử';
          else if (item.id === 'report') mobileLabel = 'Báo cáo';

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id as ActiveTab)}
              className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-lg text-2xs font-medium transition-colors ${
                isActive ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full" />
                )}
              </div>
              <span className="truncate max-w-[48px] text-center mt-0.5 leading-none">{mobileLabel}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
