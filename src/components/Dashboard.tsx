import React from 'react';
import { 
  AttendanceRecord, 
  BehaviorRecord, 
  ClassConfig, 
  Member 
} from '../types';
import { 
  getTodayDateString, 
  getWeekRange, 
  formatVietnameseFullDate,
  isDateInWeek 
} from '../utils/dateUtils';
import { 
  Users, 
  CalendarCheck, 
  TrendingUp, 
  TrendingDown, 
  Award, 
  AlertTriangle, 
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  XCircle
} from 'lucide-react';

interface DashboardProps {
  config: ClassConfig;
  members: Member[];
  attendance: AttendanceRecord[];
  behaviors: BehaviorRecord[];
  onNavigate: (tab: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  config,
  members,
  attendance,
  behaviors,
  onNavigate,
}) => {
  const todayStr = getTodayDateString();
  const currentWeek = getWeekRange(new Date());

  // 1. Attendance today
  const todayAttendance = attendance.filter((a) => a.date === todayStr);
  const presentToday = todayAttendance.filter((a) => a.status === 'present').length;
  const absentExcusedToday = todayAttendance.filter((a) => a.status === 'absent_excused').length;
  const absentUnexcusedToday = todayAttendance.filter((a) => a.status === 'absent_unexcused').length;
  const lateToday = todayAttendance.filter((a) => a.status === 'late').length;
  const totalAbsentToday = absentExcusedToday + absentUnexcusedToday;

  // 2. Weekly behaviors
  const weeklyBehaviors = behaviors.filter((b) => isDateInWeek(b.date, currentWeek));
  
  let weeklyPositivePoints = 0;
  let weeklyNegativePoints = 0;

  weeklyBehaviors.forEach((b) => {
    if (b.point > 0) weeklyPositivePoints += b.point;
    else if (b.point < 0) weeklyNegativePoints += Math.abs(b.point);
  });

  const netWeeklyScore = weeklyPositivePoints - weeklyNegativePoints;

  // 3. Member weekly stats for "Thành viên cần chú ý" & "Thành viên nổi bật"
  const memberWeeklyStats = members.map((m) => {
    const memberBehaviors = weeklyBehaviors.filter((b) => b.memberId === m.id);
    const infractions = memberBehaviors.filter((b) => b.point < 0);
    const praises = memberBehaviors.filter((b) => b.point > 0);
    const pos = praises.reduce((sum, b) => sum + b.point, 0);
    const neg = infractions.reduce((sum, b) => sum + Math.abs(b.point), 0);
    const net = pos - neg;

    return {
      member: m,
      pos,
      neg,
      net,
      infractionsCount: infractions.length,
      praisesCount: praises.length,
      recentInfractions: infractions.map((i) => i.label),
    };
  });

  // Members who need attention: infractionsCount >= 1 or net < 0
  const attentionMembers = memberWeeklyStats
    .filter((s) => s.infractionsCount >= 1 || s.net < 0)
    .sort((a, b) => b.neg - a.neg || a.net - b.net);

  // Top members
  const topMembers = memberWeeklyStats
    .filter((s) => s.pos > 0)
    .sort((a, b) => b.net - a.net)
    .slice(0, 3);

  // 4. Chart data for each day of the current week (T2 -> CN)
  const chartDays = currentWeek.days.map((day) => {
    const dayBehaviors = behaviors.filter((b) => b.date === day.date);
    const dayPos = dayBehaviors.filter((b) => b.point > 0).reduce((sum, b) => sum + b.point, 0);
    const dayNeg = dayBehaviors.filter((b) => b.point < 0).reduce((sum, b) => sum + Math.abs(b.point), 0);
    const dayNet = dayPos - dayNeg;
    return {
      label: day.shortLabel,
      fullLabel: day.label,
      date: day.date,
      pos: dayPos,
      neg: dayNeg,
      net: dayNet,
      isToday: day.date === todayStr,
    };
  });

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Hero Welcome banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 rounded-2xl p-5 sm:p-6 text-white shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          <div className="text-2xs font-bold uppercase tracking-wider text-blue-200 mb-1">
            Hệ thống quản lý nội bộ · Năm học {config.schoolYear}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Xin chào, tổ trưởng {config.leaderName}
          </h2>
          <p className="text-blue-100 text-xs sm:text-sm mt-1">
            Theo dõi thi đua <span className="font-semibold text-white">{config.groupName}</span> — Lớp <span className="font-semibold text-white">{config.className}</span> · {formatVietnameseFullDate(todayStr)}
          </p>

          {/* Quick buttons */}
          <div className="flex flex-wrap gap-2.5 mt-4 pt-2 border-t border-blue-500/30">
            <button
              onClick={() => onNavigate('attendance')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white text-blue-700 rounded-xl hover:bg-blue-50 transition-colors shadow-xs"
            >
              <CalendarCheck className="w-4 h-4 text-blue-600" />
              <span>Điểm danh hôm nay</span>
            </button>
            <button
              onClick={() => onNavigate('behavior')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-blue-800/60 hover:bg-blue-800 text-white rounded-xl transition-colors border border-blue-400/30"
            >
              <Award className="w-4 h-4 text-amber-300" />
              <span>Ghi nhận vi phạm / Khen</span>
            </button>
            <button
              onClick={() => onNavigate('report')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-blue-800/60 hover:bg-blue-800 text-white rounded-xl transition-colors border border-blue-400/30"
            >
              <span>Xem báo cáo tuần</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 5 Fast Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Sĩ số */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Sĩ số tổ</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">{members.length}</span>
            <span className="text-xs text-slate-500">học sinh</span>
          </div>
          <div className="mt-1 text-2xs text-slate-400">
            {members.filter(m => m.gender === 'Nam').length} Nam · {members.filter(m => m.gender === 'Nữ').length} Nữ
          </div>
        </div>

        {/* Điểm danh hôm nay */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Điểm danh hôm nay</span>
            <CalendarCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-600 tabular-nums">{presentToday}</span>
            <span className="text-xs text-slate-500">/ {members.length} có mặt</span>
          </div>
          <div className="mt-1 text-2xs text-slate-500 flex gap-2">
            <span className={totalAbsentToday > 0 ? 'text-rose-600 font-semibold' : 'text-slate-400'}>
              Vắng: {totalAbsentToday}
            </span>
            <span>·</span>
            <span className={lateToday > 0 ? 'text-amber-600 font-semibold' : 'text-slate-400'}>
              Trễ: {lateToday}
            </span>
          </div>
        </div>

        {/* Tổng điểm cộng tuần */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Điểm cộng tuần</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-600 tabular-nums">
              +{weeklyPositivePoints.toFixed(2)}
            </span>
            <span className="text-xs text-slate-500">điểm</span>
          </div>
          <div className="mt-1 text-2xs text-emerald-700">
            {weeklyBehaviors.filter(b => b.point > 0).length} lượt tuyên dương
          </div>
        </div>

        {/* Tổng điểm trừ tuần */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Điểm trừ tuần</span>
            <TrendingDown className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-600 tabular-nums">
              -{weeklyNegativePoints.toFixed(2)}
            </span>
            <span className="text-xs text-slate-500">điểm</span>
          </div>
          <div className="mt-1 text-2xs text-rose-600">
            {weeklyBehaviors.filter(b => b.point < 0).length} lượt vi phạm/nhắc
          </div>
        </div>

        {/* Điểm thi đua tổng của tổ */}
        <div className="col-span-2 lg:col-span-1 bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Điểm thi đua tổng</span>
            <Award className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-bold tabular-nums ${
              netWeeklyScore > 0 
                ? 'text-emerald-600' 
                : netWeeklyScore < 0 
                  ? 'text-rose-600' 
                  : 'text-slate-700'
            }`}>
              {netWeeklyScore > 0 ? `+${netWeeklyScore.toFixed(2)}` : netWeeklyScore.toFixed(2)}
            </span>
            <span className="text-xs text-slate-500">điểm</span>
          </div>
          <div className="mt-1 text-2xs text-slate-500">
            (Cộng − Trừ trong tuần)
          </div>
        </div>
      </div>

      {/* Grid: Chart & Members Needing Attention */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Biểu đồ thi đua theo ngày trong tuần
              </h3>
              <p className="text-2xs text-slate-500 mt-0.5">
                Điểm cộng (xanh lá) và Điểm trừ (đỏ) từ Thứ 2 đến Chủ Nhật
              </p>
            </div>
            <div className="flex items-center gap-3 text-2xs font-medium">
              <span className="flex items-center gap-1.5 text-emerald-700">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm" />
                Cộng
              </span>
              <span className="flex items-center gap-1.5 text-rose-600">
                <span className="w-2.5 h-2.5 bg-rose-500 rounded-sm" />
                Trừ
              </span>
            </div>
          </div>

          {/* SVG Bar Chart */}
          <div className="grid grid-cols-7 gap-2 pt-6 pb-2 items-end h-48 border-b border-slate-100">
            {chartDays.map((cd) => {
              const maxScale = 2.0; // scale limit for visual bar
              const posHeight = Math.min((cd.pos / maxScale) * 100, 100);
              const negHeight = Math.min((cd.neg / maxScale) * 100, 100);

              return (
                <div key={cd.date} className="flex flex-col items-center h-full justify-end group">
                  <div className="w-full flex items-end justify-center gap-1 h-32 px-1 relative">
                    {/* Tooltip */}
                    <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-3xs px-2 py-1 rounded shadow-md pointer-events-none whitespace-nowrap z-20">
                      +{cd.pos.toFixed(2)} / -{cd.neg.toFixed(2)} (Ròng: {cd.net > 0 ? `+${cd.net.toFixed(2)}` : cd.net.toFixed(2)})
                    </div>

                    {/* Positive bar */}
                    <div 
                      style={{ height: `${posHeight}%` }} 
                      className={`w-3 sm:w-4 bg-emerald-500 rounded-t transition-all ${cd.pos === 0 ? 'h-0.5 bg-slate-100' : ''}`}
                    />
                    {/* Negative bar */}
                    <div 
                      style={{ height: `${negHeight}%` }} 
                      className={`w-3 sm:w-4 bg-rose-500 rounded-t transition-all ${cd.neg === 0 ? 'h-0.5 bg-slate-100' : ''}`}
                    />
                  </div>

                  {/* Day label */}
                  <div className={`mt-2 text-center text-xs font-semibold ${cd.isToday ? 'text-blue-600' : 'text-slate-600'}`}>
                    {cd.label}
                    {cd.isToday && (
                      <span className="block text-3xs text-blue-500 font-normal">Hôm nay</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-2xs text-slate-500 mt-3 pt-1">
            <span>Tuần: {currentWeek.startDate} đến {currentWeek.endDate}</span>
            <span>Tổng lượt ghi nhận tuần: <strong>{weeklyBehaviors.length}</strong></span>
          </div>
        </div>

        {/* Thành viên cần chú ý */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900">
                Thành viên cần chú ý
              </h3>
            </div>
            <span className="text-2xs font-semibold text-slate-500">
              {attentionMembers.length} bạn
            </span>
          </div>

          <p className="text-2xs text-slate-500 mb-3">
            Học sinh có điểm trừ hoặc vi phạm nội quy nhiều lần trong tuần.
          </p>

          <div className="space-y-2.5 flex-1 overflow-y-auto max-h-72">
            {attentionMembers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-slate-400">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-1" />
                <span className="text-xs font-medium text-slate-600">
                  Tuần này tổ chấp hành rất tốt!
                </span>
                <span className="text-2xs text-slate-400">Không có thành viên bị trừ điểm.</span>
              </div>
            ) : (
              attentionMembers.map((item) => (
                <div 
                  key={item.member.id}
                  className="p-3 rounded-lg border border-rose-100 bg-rose-50/40 text-xs"
                >
                  <div className="flex items-center justify-between font-semibold text-slate-900">
                    <span>{item.member.stt}. {item.member.name}</span>
                    <span className="text-rose-600 font-bold tabular-nums">
                      -{item.neg.toFixed(2)}đ
                    </span>
                  </div>
                  <div className="mt-1 text-2xs text-slate-500 line-clamp-1">
                    Vi phạm ({item.infractionsCount} lần): {item.recentInfractions.join(', ')}
                  </div>
                  <div className="mt-1 text-2xs flex items-center justify-between text-slate-400">
                    <span>Điểm thi đua tổng tuần: <strong className={item.net < 0 ? 'text-rose-600' : 'text-slate-700'}>{item.net > 0 ? `+${item.net.toFixed(2)}` : item.net.toFixed(2)}</strong></span>
                    <span className="text-amber-700 font-medium">Cần nhắc nhở</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Top positive students */}
          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Biểu dương trong tuần</span>
            </div>
            <div className="space-y-1.5">
              {topMembers.slice(0, 2).map((tm) => (
                <div key={tm.member.id} className="flex items-center justify-between text-2xs text-slate-700 bg-slate-50 p-2 rounded-lg">
                  <span className="font-medium">{tm.member.name}</span>
                  <span className="text-emerald-600 font-bold tabular-nums">
                    +{tm.pos.toFixed(2)}đ
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
