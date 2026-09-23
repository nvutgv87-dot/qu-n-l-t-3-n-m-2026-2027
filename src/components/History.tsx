import React, { useState, useMemo } from 'react';
import { AttendanceRecord, BehaviorRecord, Member } from '../types';
import { formatVietnameseDate } from '../utils/dateUtils';
import { 
  History as HistoryIcon, 
  Search, 
  Filter, 
  Trash2, 
  CalendarCheck, 
  Award, 
  AlertTriangle,
  User,
  X
} from 'lucide-react';

interface HistoryProps {
  members: Member[];
  behaviors: BehaviorRecord[];
  attendance: AttendanceRecord[];
  onDeleteBehavior: (id: string) => void;
  leaderName: string;
}

interface UnifiedHistoryItem {
  id: string;
  sourceType: 'behavior' | 'attendance';
  date: string;
  memberId: string;
  memberName: string;
  category: string;
  label: string;
  point: number | null;
  note?: string;
  recordedBy: string;
  createdAt: string;
  originalBehavior?: BehaviorRecord;
}

export const History: React.FC<HistoryProps> = ({
  members,
  behaviors,
  attendance,
  onDeleteBehavior,
  leaderName,
}) => {
  const [filterMemberId, setFilterMemberId] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all'); // all, violation, positive, attendance
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [itemToDelete, setItemToDelete] = useState<UnifiedHistoryItem | null>(null);

  // Build unified list
  const unifiedList = useMemo<UnifiedHistoryItem[]>(() => {
    const list: UnifiedHistoryItem[] = [];

    // Behaviors
    behaviors.forEach((b) => {
      const mem = members.find((m) => m.id === b.memberId);
      list.push({
        id: b.id,
        sourceType: 'behavior',
        date: b.date,
        memberId: b.memberId,
        memberName: mem?.name || 'Học sinh',
        category: b.categoryTitle,
        label: b.label,
        point: b.point,
        note: b.note,
        recordedBy: b.recordedBy || leaderName,
        createdAt: b.createdAt,
        originalBehavior: b,
      });
    });

    // Attendance (only include non-present to avoid cluttering or include with specific tag)
    attendance.forEach((a) => {
      const mem = members.find((m) => m.id === a.memberId);
      let statusLabel = 'Có mặt';
      let statusCat = 'Điểm danh';
      if (a.status === 'absent_excused') statusLabel = 'Vắng có phép';
      else if (a.status === 'absent_unexcused') statusLabel = 'Vắng không phép';
      else if (a.status === 'late') statusLabel = 'Đi học trễ';

      list.push({
        id: a.id,
        sourceType: 'attendance',
        date: a.date,
        memberId: a.memberId,
        memberName: mem?.name || 'Học sinh',
        category: statusCat,
        label: `Chuyên cần: ${statusLabel}`,
        point: null,
        note: a.note,
        recordedBy: leaderName,
        createdAt: a.createdAt || `${a.date}T07:00:00`,
      });
    });

    // Sort newest first
    return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [behaviors, attendance, members, leaderName]);

  // Filter
  const filteredList = useMemo(() => {
    return unifiedList.filter((item) => {
      // Member filter
      if (filterMemberId !== 'all' && item.memberId !== filterMemberId) return false;

      // Type filter
      if (filterType === 'violation' && (!item.point || item.point >= 0)) return false;
      if (filterType === 'positive' && (!item.point || item.point <= 0)) return false;
      if (filterType === 'attendance' && item.sourceType !== 'attendance') return false;

      // Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesName = item.memberName.toLowerCase().includes(term);
        const matchesLabel = item.label.toLowerCase().includes(term);
        const matchesNote = item.note?.toLowerCase().includes(term);
        if (!matchesName && !matchesLabel && !matchesNote) return false;
      }

      return true;
    });
  }, [unifiedList, filterMemberId, filterType, searchTerm]);

  const handleDelete = () => {
    if (itemToDelete && itemToDelete.sourceType === 'behavior') {
      onDeleteBehavior(itemToDelete.id);
      setItemToDelete(null);
    }
  };

  return (
    <div className="space-y-5 pb-20 md:pb-6">
      {/* Header & Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <HistoryIcon className="w-5 h-5 text-blue-600" />
              <span>Lịch sử điểm danh và ghi nhận</span>
            </h2>
            <p className="text-2xs text-slate-500 mt-0.5">
              Toàn bộ nhật ký chuyên cần, vi phạm, khen thưởng được sắp xếp theo thời gian mới nhất
            </p>
          </div>

          <div className="text-2xs text-slate-500 font-medium">
            Hiển thị: <strong className="text-slate-900">{filteredList.length}</strong> / {unifiedList.length} lượt
          </div>
        </div>

        {/* Filters row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-3 pt-1">
          {/* Member filter */}
          <div>
            <label className="block text-2xs font-semibold text-slate-500 mb-1">
              Lọc theo học sinh
            </label>
            <select
              aria-label="Lọc theo học sinh"
              value={filterMemberId}
              onChange={(e) => setFilterMemberId(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="all">Tất cả thành viên ({members.length})</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.stt}. {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Type filter */}
          <div>
            <label className="block text-2xs font-semibold text-slate-500 mb-1">
              Phân loại
            </label>
            <select
              aria-label="Phân loại sự kiện"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="all">Tất cả hoạt động</option>
              <option value="violation">Chỉ vi phạm / Nhắc nhở (Trừ điểm)</option>
              <option value="positive">Chỉ tuyên dương / Tích cực (Cộng điểm)</option>
              <option value="attendance">Chỉ điểm danh chuyên cần</option>
            </select>
          </div>

          {/* Search bar */}
          <div>
            <label className="block text-2xs font-semibold text-slate-500 mb-1">
              Tìm kiếm nội dung
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Nhập tên, lỗi hoặc khen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase text-2xs tracking-wider">
              <tr>
                <th className="py-3 px-3.5 w-24">Ngày</th>
                <th className="py-3 px-4 min-w-[160px]">Học sinh</th>
                <th className="py-3 px-3">Phân loại</th>
                <th className="py-3 px-4 min-w-[200px]">Nội dung cụ thể</th>
                <th className="py-3 px-3 text-center">Điểm</th>
                <th className="py-3 px-3 text-slate-400">Người ghi nhận</th>
                <th className="py-3 px-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400 text-xs">
                    Không tìm thấy lịch sử phù hợp với điều kiện lọc.
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3.5 text-slate-600 font-medium tabular-nums whitespace-nowrap">
                      {formatVietnameseDate(item.date)}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {item.memberName}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="text-2xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-800">
                      <div>{item.label}</div>
                      {item.note && (
                        <div className="text-3xs text-slate-500 italic mt-0.5">
                          Ghi chú: {item.note}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center tabular-nums font-bold whitespace-nowrap">
                      {item.point !== null ? (
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          item.point > 0
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}>
                          {item.point > 0 ? `+${item.point.toFixed(2)}` : item.point.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-2xs font-normal">—</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-500 text-2xs whitespace-nowrap">
                      {item.recordedBy}
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      {item.sourceType === 'behavior' ? (
                        <button
                          onClick={() => setItemToDelete(item)}
                          title="Xóa lượt ghi nhận"
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <span className="text-3xs text-slate-300">Điểm danh</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-2">
              Xóa lượt ghi nhận này?
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Bạn có chắc chắn muốn xóa ghi nhận "{itemToDelete.label}" của {itemToDelete.memberName}?
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setItemToDelete(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg"
              >
                Xóa ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
