import React, { useState } from 'react';
import { BEHAVIOR_CRITERIA } from '../config/constants';
import { 
  BehaviorCriterion, 
  BehaviorRecord, 
  BehaviorType, 
  Member 
} from '../types';
import { 
  getTodayDateString, 
  formatVietnameseDate 
} from '../utils/dateUtils';
import { 
  Award, 
  Check, 
  Trash2, 
  Edit3, 
  PlusCircle, 
  AlertTriangle, 
  Sparkles, 
  UserCheck, 
  FileText,
  Calendar,
  X
} from 'lucide-react';

interface BehaviorLogProps {
  members: Member[];
  behaviors: BehaviorRecord[];
  onAddBehavior: (record: Omit<BehaviorRecord, 'id' | 'createdAt'>) => void;
  onUpdateBehavior: (record: BehaviorRecord) => void;
  onDeleteBehavior: (id: string) => void;
  leaderName: string;
}

const CATEGORY_TABS: { id: BehaviorType; title: string; color: string }[] = [
  { id: 'violation', title: '❌ Vi phạm', color: 'text-rose-700 bg-rose-50 border-rose-200' },
  { id: 'reminder', title: '⚠️ Nhắc nhở', color: 'text-amber-700 bg-amber-50 border-amber-200' },
  { id: 'positive', title: '✅ Tích cực', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  { id: 'highlight', title: '🌟 Hoạt động nổi bật', color: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
  { id: 'personal', title: '🎯 Cá nhân', color: 'text-purple-700 bg-purple-50 border-purple-200' },
];

export const BehaviorLog: React.FC<BehaviorLogProps> = ({
  members,
  behaviors,
  onAddBehavior,
  onUpdateBehavior,
  onDeleteBehavior,
  leaderName,
}) => {
  const [selectedMemberId, setSelectedMemberId] = useState<string>(members[0]?.id || '');
  const [selectedTab, setSelectedTab] = useState<BehaviorType>('violation');
  const [selectedCriterion, setSelectedCriterion] = useState<BehaviorCriterion>(
    BEHAVIOR_CRITERIA.find((c) => c.groupId === 'violation') || BEHAVIOR_CRITERIA[0]
  );
  const [pointValue, setPointValue] = useState<number>(selectedCriterion.defaultPoint);
  const [recordDate, setRecordDate] = useState<string>(getTodayDateString());
  const [recordNote, setRecordNote] = useState<string>('');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Edit record modal state
  const [editingRecord, setEditingRecord] = useState<BehaviorRecord | null>(null);
  // Delete confirm state
  const [recordToDelete, setRecordToDelete] = useState<BehaviorRecord | null>(null);

  // When changing tab, select first criterion of that tab
  const handleSelectTab = (tab: BehaviorType) => {
    setSelectedTab(tab);
    const firstCrit = BEHAVIOR_CRITERIA.find((c) => c.groupId === tab);
    if (firstCrit) {
      setSelectedCriterion(firstCrit);
      setPointValue(firstCrit.defaultPoint);
    }
  };

  // When selecting a criterion
  const handleSelectCriterion = (crit: BehaviorCriterion) => {
    setSelectedCriterion(crit);
    setPointValue(crit.defaultPoint);
  };

  // Submit new record
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId) return;

    const currentMember = members.find((m) => m.id === selectedMemberId);

    onAddBehavior({
      memberId: selectedMemberId,
      date: recordDate,
      criterionId: selectedCriterion.id,
      categoryTitle: selectedCriterion.groupTitle,
      label: selectedCriterion.label,
      point: pointValue,
      note: recordNote.trim(),
      recordedBy: leaderName,
    });

    setSuccessToast(`Đã lưu ghi nhận cho học sinh "${currentMember?.name}"!`);
    setRecordNote('');
    setTimeout(() => setSuccessToast(null), 3500);
  };

  // Save edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;
    onUpdateBehavior(editingRecord);
    setEditingRecord(null);
  };

  // Confirm delete
  const handleConfirmDelete = () => {
    if (recordToDelete) {
      onDeleteBehavior(recordToDelete.id);
      setRecordToDelete(null);
    }
  };

  // Criteria for current tab
  const criteriaInCurrentTab = BEHAVIOR_CRITERIA.filter((c) => c.groupId === selectedTab);

  // Recent 10 behavior records
  const recentRecords = [...behaviors]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 10);

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Add Behavior Record */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs">
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
            <Award className="w-5 h-5 text-blue-600" />
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Ghi nhận vi phạm / Tuyên dương
              </h2>
              <p className="text-2xs text-slate-500">
                Cộng hoặc trừ điểm hành vi đạo đức theo tiêu chí nội quy
              </p>
            </div>
          </div>

          {successToast && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">{successToast}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* 1. Chọn học sinh & Ngày */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  1. Chọn học sinh <span className="text-rose-500">*</span>
                </label>
                <select
                  aria-label="Chọn học sinh để ghi nhận"
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white font-medium"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.stt}. {m.name} ({m.gender})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Ngày ghi nhận
                </label>
                <input
                  type="date"
                  value={recordDate}
                  onChange={(e) => setRecordDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
            </div>

            {/* 2. Chọn nhóm hành vi */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                2. Nhóm hành vi
              </label>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORY_TABS.map((tab) => {
                  const isActive = selectedTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => handleSelectTab(tab.id)}
                      className={`px-3 py-1.5 rounded-lg text-2xs font-semibold transition-all border ${
                        isActive
                          ? `${tab.color} font-bold shadow-xs scale-102`
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {tab.title}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Chọn nội dung cụ thể */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                3. Nội dung cụ thể (Bấm chọn nhanh)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {criteriaInCurrentTab.map((crit) => {
                  const isSelected = selectedCriterion.id === crit.id;
                  const isNegative = crit.defaultPoint < 0;

                  return (
                    <button
                      key={crit.id}
                      type="button"
                      onClick={() => handleSelectCriterion(crit)}
                      className={`p-2.5 rounded-lg text-left transition-all border flex items-center justify-between gap-2 ${
                        isSelected
                          ? isNegative
                            ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-500/20'
                            : 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20'
                          : 'bg-slate-50/70 border-slate-200 hover:bg-white hover:border-slate-300'
                      }`}
                    >
                      <span className="font-semibold text-slate-800 text-xs">
                        {crit.label}
                      </span>
                      <span className={`text-2xs font-bold tabular-nums px-1.5 py-0.5 rounded ${
                        isNegative ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {crit.defaultPoint > 0 ? `+${crit.defaultPoint}` : crit.defaultPoint}đ
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Điểm số & Ghi chú */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Mức điểm áp dụng
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.05"
                    value={pointValue}
                    onChange={(e) => setPointValue(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-bold tabular-nums text-xs"
                  />
                  <span className="text-xs text-slate-500 font-medium">điểm</span>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Ghi chú chi tiết (nếu có)
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Tiết Toán cô Lan, bài tập trang 25..."
                  value={recordNote}
                  onChange={(e) => setRecordNote(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-xs"
                />
              </div>
            </div>

            {/* Nút lưu */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 px-4 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-xs shadow-blue-500/20 flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Lưu lượt ghi nhận này</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right side: Recent 10 behavior records with Edit/Delete */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs flex flex-col">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">
              Ghi nhận gần đây ({behaviors.length})
            </h3>
            <span className="text-2xs text-slate-400">Mới nhất</span>
          </div>

          <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[480px] pr-1">
            {recentRecords.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                Chưa có lượt ghi nhận nào. Hãy điền form bên trái để ghi nhận.
              </div>
            ) : (
              recentRecords.map((r) => {
                const member = members.find((m) => m.id === r.memberId);
                const isNegative = r.point < 0;

                return (
                  <div
                    key={r.id}
                    className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{member?.name || 'Học sinh'}</span>
                          <span className="text-3xs text-slate-400 font-normal">
                            · {formatVietnameseDate(r.date)}
                          </span>
                        </div>
                        <div className="text-2xs font-medium text-slate-600 mt-0.5">
                          {r.label}
                        </div>
                        {r.note && (
                          <div className="text-3xs text-slate-500 italic mt-0.5">
                            "{r.note}"
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span className={`text-xs font-bold tabular-nums px-2 py-0.5 rounded-full ${
                          isNegative
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {r.point > 0 ? `+${r.point.toFixed(2)}` : r.point.toFixed(2)}
                        </span>
                        
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setEditingRecord(r)}
                            title="Sửa ghi nhận"
                            className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setRecordToDelete(r)}
                            title="Xóa ghi nhận"
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Edit Record Modal */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                Sửa lượt ghi nhận
              </h3>
              <button
                aria-label="Đóng cửa sổ sửa lượt ghi nhận"
                onClick={() => setEditingRecord(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 mt-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nội dung tiêu chí
                </label>
                <input
                  type="text"
                  value={editingRecord.label}
                  onChange={(e) => setEditingRecord({ ...editingRecord, label: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Điểm số
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    value={editingRecord.point}
                    onChange={(e) => setEditingRecord({ ...editingRecord, point: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold tabular-nums text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Ngày
                  </label>
                  <input
                    type="date"
                    value={editingRecord.date}
                    onChange={(e) => setEditingRecord({ ...editingRecord, date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Ghi chú
                </label>
                <input
                  type="text"
                  value={editingRecord.note || ''}
                  onChange={(e) => setEditingRecord({ ...editingRecord, note: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Record Confirmation Dialog */}
      {recordToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-2">
              Xác nhận xóa lượt ghi nhận?
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Bạn có chắc chắn muốn xóa ghi nhận "{recordToDelete.label}" ({recordToDelete.point > 0 ? `+${recordToDelete.point}` : recordToDelete.point}đ)? Tổng điểm của học sinh sẽ tự động được điều chỉnh lại.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setRecordToDelete(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmDelete}
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
