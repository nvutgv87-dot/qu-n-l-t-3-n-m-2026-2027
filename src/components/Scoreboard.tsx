import React, { useState, useMemo } from 'react';
import { AttendanceRecord, BehaviorRecord, Member } from '../types';
import { getWeekRange, isDateInWeek } from '../utils/dateUtils';
import { 
  BarChart3, 
  ArrowUpDown, 
  Filter, 
  Award, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar,
  ChevronDown,
  UserCheck
} from 'lucide-react';

interface ScoreboardProps {
  members: Member[];
  behaviors: BehaviorRecord[];
  attendance: AttendanceRecord[];
}

type TimeFilter = 'this_week' | 'last_week' | 'all';
type SortField = 'net' | 'pos' | 'neg' | 'stt' | 'name';

export const Scoreboard: React.FC<ScoreboardProps> = ({
  members,
  behaviors,
  attendance,
}) => {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('this_week');
  const [sortField, setSortField] = useState<SortField>('net');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [selectedMemberDetail, setSelectedMemberDetail] = useState<string | null>(null);

  const thisWeek = useMemo(() => getWeekRange(new Date(), 0), []);
  const lastWeek = useMemo(() => getWeekRange(new Date(), -1), []);

  // Filter records based on selected time
  const filteredData = useMemo(() => {
    let activeBehaviors = behaviors;
    let activeAttendance = attendance;

    if (timeFilter === 'this_week') {
      activeBehaviors = behaviors.filter((b) => isDateInWeek(b.date, thisWeek));
      activeAttendance = attendance.filter((a) => isDateInWeek(a.date, thisWeek));
    } else if (timeFilter === 'last_week') {
      activeBehaviors = behaviors.filter((b) => isDateInWeek(b.date, lastWeek));
      activeAttendance = attendance.filter((a) => isDateInWeek(a.date, lastWeek));
    }

    return {
      behaviors: activeBehaviors,
      attendance: activeAttendance,
    };
  }, [behaviors, attendance, timeFilter, thisWeek, lastWeek]);

  // Member aggregated stats
  const memberScores = useMemo(() => {
    return members.map((m) => {
      const mBehaviors = filteredData.behaviors.filter((b) => b.memberId === m.id);
      const mAttendance = filteredData.attendance.filter((a) => a.memberId === m.id);

      const pos = mBehaviors
        .filter((b) => b.point > 0)
        .reduce((sum, b) => sum + b.point, 0);
      const neg = mBehaviors
        .filter((b) => b.point < 0)
        .reduce((sum, b) => sum + Math.abs(b.point), 0);
      const net = pos - neg;

      const excusedCount = mAttendance.filter((a) => a.status === 'absent_excused').length;
      const unexcusedCount = mAttendance.filter((a) => a.status === 'absent_unexcused').length;
      const lateCount = mAttendance.filter((a) => a.status === 'late').length;

      return {
        member: m,
        pos,
        neg,
        net,
        excusedCount,
        unexcusedCount,
        lateCount,
        behaviors: mBehaviors,
      };
    });
  }, [members, filteredData]);

  // Sort
  const sortedMembers = useMemo(() => {
    return [...memberScores].sort((a, b) => {
      let comparison = 0;
      if (sortField === 'net') comparison = a.net - b.net;
      else if (sortField === 'pos') comparison = a.pos - b.pos;
      else if (sortField === 'neg') comparison = a.neg - b.neg;
      else if (sortField === 'stt') comparison = a.member.stt - b.member.stt;
      else if (sortField === 'name') comparison = a.member.name.localeCompare(b.member.name);

      return sortAsc ? comparison : -comparison;
    });
  }, [memberScores, sortField, sortAsc]);

  // Toggle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(field === 'stt' || field === 'name'); // default asc for names/stt, desc for points
    }
  };

  // Group totals
  const totalPos = memberScores.reduce((sum, m) => sum + m.pos, 0);
  const totalNeg = memberScores.reduce((sum, m) => sum + m.neg, 0);
  const totalNet = totalPos - totalNeg;

  return (
    <div className="space-y-5 pb-20 md:pb-6">
      {/* Controls Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <span>Bảng tổng hợp điểm thi đua</span>
          </h2>
          <p className="text-2xs text-slate-500 mt-0.5">
            Xếp hạng theo tổng điểm cộng, điểm trừ và điểm thi đua tổng của từng học sinh
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setTimeFilter('this_week')}
            className={`px-3 py-1.5 rounded-lg text-2xs font-semibold transition-all ${
              timeFilter === 'this_week'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tuần này ({thisWeek.startDate.slice(5)})
          </button>
          <button
            onClick={() => setTimeFilter('last_week')}
            className={`px-3 py-1.5 rounded-lg text-2xs font-semibold transition-all ${
              timeFilter === 'last_week'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tuần trước
          </button>
          <button
            onClick={() => setTimeFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-2xs font-semibold transition-all ${
              timeFilter === 'all'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Toàn bộ
          </button>
        </div>
      </div>

      {/* Scoreboard Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase text-2xs tracking-wider">
              <tr>
                <th 
                  onClick={() => handleSort('stt')}
                  className="py-3 px-3 w-12 text-center cursor-pointer hover:text-blue-600"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>STT</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('name')}
                  className="py-3 px-4 min-w-[170px] cursor-pointer hover:text-blue-600"
                >
                  <div className="flex items-center gap-1">
                    <span>Họ và tên</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3 text-center">Chuyên cần (Vắng/Trễ)</th>
                <th 
                  onClick={() => handleSort('pos')}
                  className="py-3 px-3.5 text-center text-emerald-700 cursor-pointer hover:text-emerald-800"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Tổng điểm cộng</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('neg')}
                  className="py-3 px-3.5 text-center text-rose-600 cursor-pointer hover:text-rose-700"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Tổng điểm trừ</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('net')}
                  className="py-3 px-4 text-center cursor-pointer hover:text-blue-600"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Điểm thi đua tổng</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3.5 text-center">Đánh giá</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedMembers.map((item, index) => {
                const isSelected = selectedMemberDetail === item.member.id;

                return (
                  <React.Fragment key={item.member.id}>
                    <tr 
                      onClick={() => setSelectedMemberDetail(isSelected ? null : item.member.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-50/50' : 'hover:bg-slate-50/70'
                      }`}
                    >
                      <td className="py-3.5 px-3 text-center font-medium text-slate-400 tabular-nums">
                        {item.member.stt}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        <div className="flex items-center gap-2">
                          <span>{item.member.name}</span>
                          {index === 0 && item.net > 0 && (
                            <span className="text-3xs bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">
                              Dẫn đầu
                            </span>
                          )}
                          {item.member.note && (
                            <span className="text-3xs text-slate-400 font-normal">
                              ({item.member.note})
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-center text-slate-600 tabular-nums">
                        <div className="flex items-center justify-center gap-2 text-2xs">
                          {item.excusedCount > 0 && (
                            <span className="text-blue-600 font-medium">{item.excusedCount} CP</span>
                          )}
                          {item.unexcusedCount > 0 && (
                            <span className="text-rose-600 font-bold">{item.unexcusedCount} KP</span>
                          )}
                          {item.lateCount > 0 && (
                            <span className="text-amber-600 font-bold">{item.lateCount} Trễ</span>
                          )}
                          {item.excusedCount === 0 && item.unexcusedCount === 0 && item.lateCount === 0 && (
                            <span className="text-emerald-600">Đầy đủ 100%</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-3.5 text-center font-bold text-emerald-600 tabular-nums">
                        {item.pos > 0 ? `+${item.pos.toFixed(2)}` : '0'}
                      </td>
                      <td className="py-3.5 px-3.5 text-center font-bold text-rose-600 tabular-nums">
                        {item.neg > 0 ? `-${item.neg.toFixed(2)}` : '0'}
                      </td>
                      <td className="py-3.5 px-4 text-center tabular-nums">
                        <span className={`inline-block px-3 py-1 rounded-lg font-bold text-xs ${
                          item.net > 0
                            ? 'bg-emerald-50 text-emerald-700'
                            : item.net < 0
                              ? 'bg-rose-50 text-rose-700'
                              : 'bg-slate-100 text-slate-700'
                        }`}>
                          {item.net > 0 ? `+${item.net.toFixed(2)}` : item.net.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3.5 px-3.5 text-center">
                        {item.net >= 0.5 ? (
                          <span className="text-2xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                            Xuất sắc
                          </span>
                        ) : item.net >= 0 ? (
                          <span className="text-2xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
                            Tốt
                          </span>
                        ) : (
                          <span className="text-2xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
                            Cần cố gắng
                          </span>
                        )}
                      </td>
                    </tr>

                    {/* Drill-down detail row */}
                    {isSelected && (
                      <tr className="bg-blue-50/30">
                        <td colSpan={7} className="p-4 border-y border-blue-100">
                          <div className="text-xs">
                            <div className="font-bold text-blue-900 mb-2">
                              Chi tiết các lượt ghi nhận của {item.member.name}:
                            </div>
                            {item.behaviors.length === 0 ? (
                              <p className="text-2xs text-slate-500 italic">
                                Không có ghi nhận vi phạm hay tuyên dương nào trong khoảng thời gian này.
                              </p>
                            ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {item.behaviors.map((b) => (
                                  <div key={b.id} className="bg-white p-2.5 rounded-lg border border-blue-100 flex items-center justify-between text-2xs">
                                    <div>
                                      <span className="font-semibold text-slate-800">{b.label}</span>
                                      <span className="text-slate-400 ml-1.5">({b.date})</span>
                                      {b.note && <div className="text-slate-500 italic">{b.note}</div>}
                                    </div>
                                    <span className={`font-bold tabular-nums px-2 py-0.5 rounded ${
                                      b.point > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                                    }`}>
                                      {b.point > 0 ? `+${b.point.toFixed(2)}` : b.point.toFixed(2)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>

            {/* Total Row */}
            <tfoot className="bg-slate-100/80 font-bold border-t-2 border-slate-300 text-xs">
              <tr>
                <td colSpan={3} className="py-3 px-4 text-slate-800 uppercase text-2xs">
                  Tổng điểm toàn tổ
                </td>
                <td className="py-3 px-3.5 text-center text-emerald-700 tabular-nums">
                  +{totalPos.toFixed(2)}
                </td>
                <td className="py-3 px-3.5 text-center text-rose-600 tabular-nums">
                  -{totalNeg.toFixed(2)}
                </td>
                <td className="py-3 px-4 text-center tabular-nums">
                  <span className={`inline-block px-3 py-0.5 rounded font-bold ${
                    totalNet > 0 ? 'text-emerald-700' : totalNet < 0 ? 'text-rose-700' : 'text-slate-700'
                  }`}>
                    {totalNet > 0 ? `+${totalNet.toFixed(2)}` : totalNet.toFixed(2)}
                  </span>
                </td>
                <td className="py-3 px-3.5 text-center text-slate-500 text-2xs">
                  {members.length} thành viên
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
