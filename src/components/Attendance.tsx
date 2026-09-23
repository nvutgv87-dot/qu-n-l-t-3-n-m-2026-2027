import React, { useState, useEffect, useMemo } from 'react';
import { 
  AttendanceRecord, 
  AttendanceStatus, 
  BehaviorRecord, 
  Member 
} from '../types';
import { getTodayDateString, formatVietnameseFullDate } from '../utils/dateUtils';
import { 
  Check, 
  Clock, 
  AlertCircle, 
  HelpCircle, 
  Save, 
  CheckCheck, 
  Info,
  Calendar,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface AttendanceProps {
  members: Member[];
  attendance: AttendanceRecord[];
  onSaveAttendance: (records: AttendanceRecord[]) => void;
  onAddBehaviorRecord: (record: Omit<BehaviorRecord, 'id' | 'createdAt'>) => void;
  leaderName: string;
}

export const Attendance: React.FC<AttendanceProps> = ({
  members,
  attendance,
  onSaveAttendance,
  onAddBehaviorRecord,
  leaderName,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  // Local state map for memberId -> status
  const [statusMap, setStatusMap] = useState<Record<string, AttendanceStatus>>({});
  // Local state map for memberId -> note
  const [notesMap, setNotesMap] = useState<Record<string, string>>({});
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Deduction proposal state: members who are late or absent unexcused
  const [showDeductionProposal, setShowDeductionProposal] = useState(false);
  const [appliedDeductions, setAppliedDeductions] = useState<Record<string, boolean>>({});

  // Sync state whenever selectedDate or attendance changes
  useEffect(() => {
    const existing = attendance.filter((a) => a.date === selectedDate);
    const newStatusMap: Record<string, AttendanceStatus> = {};
    const newNotesMap: Record<string, string> = {};

    members.forEach((m) => {
      const rec = existing.find((a) => a.memberId === m.id);
      if (rec) {
        newStatusMap[m.id] = rec.status;
        newNotesMap[m.id] = rec.note || '';
      } else {
        // Default to present for speed
        newStatusMap[m.id] = 'present';
        newNotesMap[m.id] = '';
      }
    });

    setStatusMap(newStatusMap);
    setNotesMap(newNotesMap);
    setShowDeductionProposal(false);
    setAppliedDeductions({});
  }, [selectedDate, members, attendance]);

  // Handle status toggle
  const handleSetStatus = (memberId: string, status: AttendanceStatus) => {
    setStatusMap((prev) => ({
      ...prev,
      [memberId]: status,
    }));
  };

  // Quick mark all present
  const handleMarkAllPresent = () => {
    const newStatusMap: Record<string, AttendanceStatus> = {};
    members.forEach((m) => {
      newStatusMap[m.id] = 'present';
    });
    setStatusMap(newStatusMap);
  };

  // Counts
  const counts = useMemo(() => {
    let present = 0;
    let excused = 0;
    let unexcused = 0;
    let late = 0;

    Object.values(statusMap).forEach((st) => {
      if (st === 'present') present++;
      else if (st === 'absent_excused') excused++;
      else if (st === 'absent_unexcused') unexcused++;
      else if (st === 'late') late++;
    });

    return { present, excused, unexcused, late, total: members.length };
  }, [statusMap, members]);

  // Candidates for deduction: late or unexcused
  const deductionCandidates = useMemo(() => {
    return members
      .filter((m) => {
        const st = statusMap[m.id];
        return st === 'late' || st === 'absent_unexcused';
      })
      .map((m) => ({
        member: m,
        status: statusMap[m.id],
        reason: statusMap[m.id] === 'late' ? 'Đi học trễ' : 'Vắng không phép (Vi phạm nội quy lớp)',
        point: -0.25,
      }));
  }, [members, statusMap]);

  // Handle Save
  const handleSave = () => {
    const updatedRecords: AttendanceRecord[] = members.map((m) => {
      const existing = attendance.find((a) => a.date === selectedDate && a.memberId === m.id);
      return {
        id: existing ? existing.id : `att-${selectedDate}-${m.id}-${Date.now()}`,
        memberId: m.id,
        date: selectedDate,
        status: statusMap[m.id] || 'present',
        note: notesMap[m.id] || '',
        createdAt: existing ? existing.createdAt : new Date().toISOString(),
      };
    });

    onSaveAttendance(updatedRecords);
    setSaveSuccessMessage(`Đã lưu điểm danh ngày ${selectedDate} thành công!`);
    setTimeout(() => setSaveSuccessMessage(null), 3000);

    // If there are deduction candidates, show proposal
    if (deductionCandidates.length > 0) {
      setShowDeductionProposal(true);
    }
  };

  // Apply single deduction
  const handleApplyDeduction = (candidate: { member: Member; status: AttendanceStatus; reason: string; point: number }) => {
    const criterionId = candidate.status === 'late' ? 'crit-late' : 'crit-class-rule';
    onAddBehaviorRecord({
      memberId: candidate.member.id,
      date: selectedDate,
      criterionId,
      categoryTitle: '❌ Vi phạm',
      label: candidate.reason,
      point: candidate.point,
      note: `Ghi nhận tự động từ điểm danh ngày ${selectedDate}: ${candidate.status === 'late' ? 'Đi trễ' : 'Vắng không phép'}`,
      recordedBy: leaderName,
    });

    setAppliedDeductions((prev) => ({
      ...prev,
      [candidate.member.id]: true,
    }));
  };

  // Apply all deductions
  const handleApplyAllDeductions = () => {
    deductionCandidates.forEach((c) => {
      if (!appliedDeductions[c.member.id]) {
        handleApplyDeduction(c);
      }
    });
  };

  return (
    <div className="space-y-5 pb-20 md:pb-6">
      {/* Date selector & Fast actions bar */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xs font-bold uppercase text-slate-400">
                Thời gian điểm danh
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
                />
                <button
                  onClick={() => setSelectedDate(getTodayDateString())}
                  className="px-2.5 py-1 text-2xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  Hôm nay
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleMarkAllPresent}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <CheckCheck className="w-4 h-4 text-emerald-600" />
              <span>Tất cả có mặt</span>
            </button>

            <button
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-2xs shadow-blue-500/20"
            >
              <Save className="w-4 h-4" />
              <span>Lưu điểm danh</span>
            </button>
          </div>
        </div>

        {/* Success toast */}
        {saveSuccessMessage && (
          <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{saveSuccessMessage}</span>
          </div>
        )}

        {/* Quick summary counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-3 border-t border-slate-100">
          <div className="bg-emerald-50/70 border border-emerald-100 p-2.5 rounded-lg text-center">
            <div className="text-2xs font-semibold text-emerald-700">Có mặt</div>
            <div className="text-lg font-bold text-emerald-700 tabular-nums">
              {counts.present} <span className="text-2xs font-normal text-emerald-600">/ {counts.total}</span>
            </div>
          </div>
          <div className="bg-blue-50/70 border border-blue-100 p-2.5 rounded-lg text-center">
            <div className="text-2xs font-semibold text-blue-700">Vắng có phép</div>
            <div className="text-lg font-bold text-blue-700 tabular-nums">{counts.excused}</div>
          </div>
          <div className="bg-rose-50/70 border border-rose-100 p-2.5 rounded-lg text-center">
            <div className="text-2xs font-semibold text-rose-700">Vắng không phép</div>
            <div className="text-lg font-bold text-rose-700 tabular-nums">{counts.unexcused}</div>
          </div>
          <div className="bg-amber-50/70 border border-amber-100 p-2.5 rounded-lg text-center">
            <div className="text-2xs font-semibold text-amber-700">Đi trễ</div>
            <div className="text-lg font-bold text-amber-700 tabular-nums">{counts.late}</div>
          </div>
        </div>
      </div>

      {/* Deduction Proposal Box (Automatic infraction suggestion) */}
      {showDeductionProposal && deductionCandidates.length > 0 && (
        <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-amber-200/60">
            <div className="flex items-center gap-2 text-amber-900 font-bold">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Đề xuất trừ điểm chuyên cần theo Nội quy thi đua</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleApplyAllDeductions}
                className="px-2.5 py-1 text-2xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-md transition-colors"
              >
                Áp dụng tất cả (−0.25đ/bạn)
              </button>
              <button
                onClick={() => setShowDeductionProposal(false)}
                className="px-2.5 py-1 text-2xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-amber-200 rounded-md"
              >
                Bỏ qua
              </button>
            </div>
          </div>

          <p className="text-2xs text-amber-800 mt-2 mb-3">
            Hôm nay có {deductionCandidates.length} bạn đi trễ hoặc vắng không phép. Bấm "Áp dụng" để tự động ghi nhận vào Bảng điểm thi đua:
          </p>

          <div className="space-y-2">
            {deductionCandidates.map((c) => {
              const isApplied = appliedDeductions[c.member.id];
              return (
                <div
                  key={c.member.id}
                  className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-amber-200/70"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{c.member.stt}. {c.member.name}</span>
                    <span className="text-2xs text-rose-600 font-medium">({c.reason} — {c.point}đ)</span>
                  </div>
                  <div>
                    {isApplied ? (
                      <span className="inline-flex items-center gap-1 text-2xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                        <Check className="w-3 h-3" />
                        Đã áp dụng
                      </span>
                    ) : (
                      <button
                        onClick={() => handleApplyDeduction(c)}
                        className="px-2.5 py-1 text-2xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded border border-rose-200 transition-colors"
                      >
                        Áp dụng trừ 0.25đ
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Member Attendance List */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-3.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800">
            Danh sách điểm danh ({formatVietnameseFullDate(selectedDate)})
          </span>
          <span className="text-2xs text-slate-500">
            Bấm nút lớn bên dưới để đổi trạng thái nhanh
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {members.map((m) => {
            const currentStatus = statusMap[m.id] || 'present';

            return (
              <div 
                key={m.id} 
                className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors"
              >
                {/* Member info */}
                <div className="min-w-[180px]">
                  <div className="flex items-center gap-2">
                    <span className="w-6 text-center text-xs font-semibold text-slate-400 tabular-nums">
                      {m.stt}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-slate-900">
                      {m.name}
                    </span>
                    {m.note && (
                      <span className="text-3xs px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-medium">
                        {m.note}
                      </span>
                    )}
                  </div>
                </div>

                {/* Status action buttons */}
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  {/* Có mặt */}
                  <button
                    type="button"
                    onClick={() => handleSetStatus(m.id, 'present')}
                    className={`flex-1 sm:flex-none px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                      currentStatus === 'present'
                        ? 'bg-emerald-600 text-white shadow-xs shadow-emerald-600/30'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Có mặt</span>
                  </button>

                  {/* Vắng có phép */}
                  <button
                    type="button"
                    onClick={() => handleSetStatus(m.id, 'absent_excused')}
                    className={`flex-1 sm:flex-none px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                      currentStatus === 'absent_excused'
                        ? 'bg-blue-600 text-white shadow-xs shadow-blue-600/30'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span>Vắng CP</span>
                  </button>

                  {/* Vắng không phép */}
                  <button
                    type="button"
                    onClick={() => handleSetStatus(m.id, 'absent_unexcused')}
                    className={`flex-1 sm:flex-none px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                      currentStatus === 'absent_unexcused'
                        ? 'bg-rose-600 text-white shadow-xs shadow-rose-600/30'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span>Vắng KP</span>
                  </button>

                  {/* Đi trễ */}
                  <button
                    type="button"
                    onClick={() => handleSetStatus(m.id, 'late')}
                    className={`flex-1 sm:flex-none px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                      currentStatus === 'late'
                        ? 'bg-amber-600 text-white shadow-xs shadow-amber-600/30'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Đi trễ</span>
                  </button>
                </div>

                {/* Optional note input for absent/late reason */}
                {currentStatus !== 'present' && (
                  <div className="w-full sm:w-56 mt-1 sm:mt-0">
                    <input
                      type="text"
                      placeholder="Lý do (VD: Sốt, kẹt xe...)"
                      value={notesMap[m.id] || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNotesMap((prev) => ({ ...prev, [m.id]: val }));
                      }}
                      className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 focus:outline-hidden focus:ring-1 focus:ring-blue-500 bg-white"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
