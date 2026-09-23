import React, { useState, useEffect, useMemo } from 'react';
import { AttendanceRecord, BehaviorRecord, ClassConfig, Member } from '../types';
import { getWeekRange, isDateInWeek, formatVietnameseDate } from '../utils/dateUtils';
import { 
  Printer, 
  Copy, 
  Check, 
  FileSpreadsheet, 
  ChevronLeft, 
  ChevronRight, 
  Download,
  Calendar,
  UserCheck,
  MessageSquare,
  Sparkles,
  RotateCcw,
  Plus
} from 'lucide-react';
import { saveLeaderCommentToCloud } from '../firebase/firestoreService';

interface WeeklyReportProps {
  config: ClassConfig;
  members: Member[];
  behaviors: BehaviorRecord[];
  attendance: AttendanceRecord[];
}

export const WeeklyReport: React.FC<WeeklyReportProps> = ({
  config,
  members,
  behaviors,
  attendance,
}) => {
  const [weekOffset, setWeekOffset] = useState<number>(0);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  const selectedWeek = useMemo(() => {
    return getWeekRange(new Date(), weekOffset);
  }, [weekOffset]);

  // Behaviors and attendance in this week
  const weekBehaviors = useMemo(() => {
    return behaviors.filter((b) => isDateInWeek(b.date, selectedWeek));
  }, [behaviors, selectedWeek]);

  const weekAttendance = useMemo(() => {
    return attendance.filter((a) => isDateInWeek(a.date, selectedWeek));
  }, [attendance, selectedWeek]);

  // Member stats
  const memberReportList = useMemo(() => {
    return members.map((m) => {
      const mBehaviors = weekBehaviors.filter((b) => b.memberId === m.id);
      const mAttendance = weekAttendance.filter((a) => a.memberId === m.id);

      const pos = mBehaviors.filter((b) => b.point > 0).reduce((sum, b) => sum + b.point, 0);
      const neg = mBehaviors.filter((b) => b.point < 0).reduce((sum, b) => sum + Math.abs(b.point), 0);
      const net = pos - neg;

      const excused = mAttendance.filter((a) => a.status === 'absent_excused').length;
      const unexcused = mAttendance.filter((a) => a.status === 'absent_unexcused').length;
      const late = mAttendance.filter((a) => a.status === 'late').length;

      // Violations list
      const violations = mBehaviors
        .filter((b) => b.point < 0)
        .map((b) => b.label);

      // Praises list
      const praises = mBehaviors
        .filter((b) => b.point > 0)
        .map((b) => b.label);

      let evaluation = 'Tốt';
      if (net >= 0.5) evaluation = 'Xuất sắc';
      else if (net < 0 || unexcused > 0 || late >= 2) evaluation = 'Cần nhắc nhở';

      return {
        member: m,
        pos,
        neg,
        net,
        excused,
        unexcused,
        late,
        violations,
        praises,
        evaluation,
      };
    });
  }, [members, weekBehaviors, weekAttendance]);

  // Group totals
  const totalGroupPos = memberReportList.reduce((sum, m) => sum + m.pos, 0);
  const totalGroupNeg = memberReportList.reduce((sum, m) => sum + m.neg, 0);
  const totalGroupNet = totalGroupPos - totalGroupNeg;
  const totalGroupLate = memberReportList.reduce((sum, m) => sum + m.late, 0);
  const totalGroupExcused = memberReportList.reduce((sum, m) => sum + m.excused, 0);
  const totalGroupUnexcused = memberReportList.reduce((sum, m) => sum + m.unexcused, 0);

  // Leader's editable comment state (persisted per week)
  const defaultLeaderText = useMemo(() => {
    let comment = `- Nhìn chung tuần qua các thành viên trong ${config.groupName} duy trì tốt nề nếp chuyên cần và hoàn thành nhiệm vụ học tập.`;
    if (totalGroupNeg > 0) {
      comment += `\n- Một số bạn cần chú ý khắc phục các lỗi về đi trễ hoặc nói chuyện riêng trong giờ học.`;
    } else {
      comment += `\n- Toàn tổ thực hiện rất tốt các quy định nề nếp, không có thành viên vi phạm.`;
    }
    if (totalGroupPos > 0) {
      comment += `\n- Đề nghị GVCN biểu dương các thành viên tích cực phát biểu xây dựng bài trong tuần.`;
    }
    return comment;
  }, [config.groupName, totalGroupNeg, totalGroupPos]);

  const [leaderComment, setLeaderComment] = useState<string>('');

  // Load saved comment for current selected week
  useEffect(() => {
    const key = `to_leader_comment_${selectedWeek.startDate}`;
    const saved = localStorage.getItem(key);
    if (saved !== null) {
      setLeaderComment(saved);
    } else {
      setLeaderComment(defaultLeaderText);
    }
  }, [selectedWeek.startDate, defaultLeaderText]);

  // Update comment handler
  const handleUpdateComment = (newText: string) => {
    setLeaderComment(newText);
    const key = `to_leader_comment_${selectedWeek.startDate}`;
    localStorage.setItem(key, newText);
    saveLeaderCommentToCloud(selectedWeek.startDate, newText).catch((err) => {
      console.warn('Firebase comment sync notice:', err);
    });
  };

  // Append a quick suggestion line
  const handleAppendSuggestion = (line: string) => {
    const updated = leaderComment.trim() ? `${leaderComment.trim()}\n${line}` : line;
    handleUpdateComment(updated);
  };

  // Trigger browser print
  const handlePrint = () => {
    window.print();
  };

  // Copy text summary for Zalo/SMS
  const handleCopyZaloText = () => {
    let text = `📋 BÁO CÁO THI ĐUA ${config.groupName.toUpperCase()} — LỚP ${config.className}\n`;
    text += `⏱ Thời gian: ${formatVietnameseDate(selectedWeek.startDate)} đến ${formatVietnameseDate(selectedWeek.endDate)}\n`;
    text += `👤 Tổ trưởng: ${config.leaderName} | GVCN: ${config.teacherName}\n`;
    text += `📊 Sĩ số: ${members.length} | Có mặt chuyên cần: Trễ ${totalGroupLate}, Vắng CP ${totalGroupExcused}, Vắng KP ${totalGroupUnexcused}\n`;
    text += `⭐ Tổng điểm cộng: +${totalGroupPos.toFixed(2)} | Tổng điểm trừ: -${totalGroupNeg.toFixed(2)} | Điểm thi đua tổng: ${totalGroupNet > 0 ? `+${totalGroupNet.toFixed(2)}` : totalGroupNet.toFixed(2)}\n`;
    text += `------------------------------------\n`;
    text += `CHI TIẾT THÀNH VIÊN:\n`;

    memberReportList.forEach((item) => {
      text += `${item.member.stt}. ${item.member.name}: Cộng +${item.pos.toFixed(2)} | Trừ -${item.neg.toFixed(2)} | Tổng: ${item.net > 0 ? `+${item.net.toFixed(2)}` : item.net.toFixed(2)}đ [${item.evaluation}]\n`;
      if (item.violations.length > 0) {
        text += `   - Vi phạm: ${item.violations.join(', ')}\n`;
      }
      if (item.praises.length > 0) {
        text += `   - Tuyên dương: ${item.praises.join(', ')}\n`;
      }
    });

    if (leaderComment.trim()) {
      text += `------------------------------------\n`;
      text += `📝 Ý KIẾN NHẬN XÉT CỦA TỔ TRƯỞNG:\n${leaderComment.trim()}\n`;
    }

    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 3000);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['STT', 'Họ và tên', 'Giới tính', 'Vắng CP', 'Vắng KP', 'Đi trễ', 'Điểm cộng', 'Điểm trừ', 'Điểm thi đua tổng', 'Xếp loại'];
    const rows = memberReportList.map((i) => [
      i.member.stt,
      `"${i.member.name}"`,
      i.member.gender,
      i.excused,
      i.unexcused,
      i.late,
      i.pos.toFixed(2),
      i.neg.toFixed(2),
      i.net.toFixed(2),
      `"${i.evaluation}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Bao_Cao_Thi_Dua_${config.groupName}_${config.className}_Tuan_${selectedWeek.startDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Action Toolbar (Hidden when printing) */}
      <div className="print:hidden bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Week navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekOffset((prev) => prev - 1)}
            className="p-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 transition-colors"
            title="Tuần trước"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-semibold text-slate-800">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span>
              {weekOffset === 0 ? 'Tuần hiện tại' : weekOffset === -1 ? 'Tuần trước' : `Cách ${Math.abs(weekOffset)} tuần`}: {formatVietnameseDate(selectedWeek.startDate)} — {formatVietnameseDate(selectedWeek.endDate)}
            </span>
          </div>

          <button
            onClick={() => setWeekOffset((prev) => prev + 1)}
            disabled={weekOffset >= 0}
            className={`p-1.5 rounded-lg border border-slate-300 transition-colors ${
              weekOffset >= 0 
                ? 'opacity-40 cursor-not-allowed text-slate-400' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
            title="Tuần sau"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {weekOffset !== 0 && (
            <button
              onClick={() => setWeekOffset(0)}
              className="px-2 py-1 text-2xs font-semibold text-blue-600 hover:underline"
            >
              Về tuần này
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleCopyZaloText}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            title="Sao chép nội dung ngắn gọn gửi Zalo cho GVCN"
          >
            {copySuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700">Đã sao chép!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-500" />
                <span>Sao chép Zalo</span>
              </>
            )}
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            title="Xuất bảng số liệu ra file Excel / CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Xuất Excel/CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-2xs shadow-blue-500/20"
          >
            <Printer className="w-4 h-4" />
            <span>In báo cáo (Ctrl+P)</span>
          </button>
        </div>
      </div>

      {/* Printable Paper Canvas (A4 style) */}
      <div className="bg-white p-6 sm:p-10 rounded-2xl border border-slate-200 shadow-sm print:border-none print:shadow-none print:p-0 max-w-4xl mx-auto text-slate-900 font-sans">
        {/* National / School Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4 border-b border-slate-800/20">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
              {config.schoolName}
            </div>
            <div className="text-sm font-extrabold text-blue-900 uppercase">
              LỚP {config.className} — {config.groupName.toUpperCase()}
            </div>
            <div className="text-2xs text-slate-500 mt-0.5">
              GVCN: {config.teacherName}
            </div>
          </div>

          <div className="sm:text-right text-xs">
            <div className="font-bold uppercase text-slate-800">
              CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
            </div>
            <div className="text-2xs italic text-slate-600">
              Độc lập — Tự do — Hạnh phúc
            </div>
            <div className="text-3xs text-slate-400 mt-1">
              Thời gian: {formatVietnameseDate(selectedWeek.startDate)} — {formatVietnameseDate(selectedWeek.endDate)}
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="text-center my-6">
          <h1 className="text-lg sm:text-xl font-bold uppercase tracking-tight text-slate-900">
            BÁO CÁO THI ĐUA VÀ KỶ LUẬT TUẦN
          </h1>
          <p className="text-xs italic text-slate-600 mt-1">
            Kính gửi: Giáo viên chủ nhiệm <strong className="text-slate-900">{config.teacherName}</strong>
          </p>
        </div>

        {/* Summary Info Box */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-2xs mb-6">
          <div>
            <span className="text-slate-500">Sĩ số tổ:</span>{' '}
            <strong className="text-slate-900">{members.length} học sinh</strong>
          </div>
          <div>
            <span className="text-slate-500">Chuyên cần tuần:</span>{' '}
            <strong className="text-slate-900">
              {totalGroupLate} trễ · {totalGroupExcused} CP · {totalGroupUnexcused} KP
            </strong>
          </div>
          <div>
            <span className="text-slate-500">Tổng điểm cộng:</span>{' '}
            <strong className="text-emerald-700">+{totalGroupPos.toFixed(2)}đ</strong>
          </div>
          <div>
            <span className="text-slate-500">Điểm thi đua tổng:</span>{' '}
            <strong className={totalGroupNet >= 0 ? 'text-emerald-700' : 'text-rose-700'}>
              {totalGroupNet > 0 ? `+${totalGroupNet.toFixed(2)}` : totalGroupNet.toFixed(2)}đ
            </strong>
          </div>
        </div>

        {/* Detailed Table */}
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-left text-xs border border-slate-300">
            <thead className="bg-slate-100 text-slate-800 font-bold uppercase text-2xs border-b border-slate-300">
              <tr>
                <th className="py-2.5 px-2 text-center border-r border-slate-300 w-10">STT</th>
                <th className="py-2.5 px-3 border-r border-slate-300 min-w-[140px]">Họ và tên</th>
                <th className="py-2.5 px-2 text-center border-r border-slate-300 w-16">Chuyên cần</th>
                <th className="py-2.5 px-2 text-center border-r border-slate-300 w-16 text-emerald-800">Cộng</th>
                <th className="py-2.5 px-2 text-center border-r border-slate-300 w-16 text-rose-800">Trừ</th>
                <th className="py-2.5 px-2 text-center border-r border-slate-300 w-16">Tổng</th>
                <th className="py-2.5 px-3 border-r border-slate-300">Nội dung ghi nhận trong tuần</th>
                <th className="py-2.5 px-2 text-center w-24">Đánh giá</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {memberReportList.map((item) => (
                <tr key={item.member.id} className="text-2xs">
                  <td className="py-2 px-2 text-center font-semibold text-slate-600 border-r border-slate-300 tabular-nums">
                    {item.member.stt}
                  </td>
                  <td className="py-2 px-3 font-bold text-slate-900 border-r border-slate-300">
                    {item.member.name}
                  </td>
                  <td className="py-2 px-2 text-center border-r border-slate-300 tabular-nums">
                    {item.late > 0 && <span className="text-amber-700 font-bold block">{item.late} trễ</span>}
                    {item.excused > 0 && <span className="text-blue-700 block">{item.excused} CP</span>}
                    {item.unexcused > 0 && <span className="text-rose-700 font-bold block">{item.unexcused} KP</span>}
                    {item.late === 0 && item.excused === 0 && item.unexcused === 0 && (
                      <span className="text-slate-400">Đầy đủ</span>
                    )}
                  </td>
                  <td className="py-2 px-2 text-center font-bold text-emerald-700 border-r border-slate-300 tabular-nums">
                    {item.pos > 0 ? `+${item.pos.toFixed(2)}` : '0'}
                  </td>
                  <td className="py-2 px-2 text-center font-bold text-rose-700 border-r border-slate-300 tabular-nums">
                    {item.neg > 0 ? `-${item.neg.toFixed(2)}` : '0'}
                  </td>
                  <td className="py-2 px-2 text-center font-bold border-r border-slate-300 tabular-nums">
                    <span className={item.net > 0 ? 'text-emerald-700' : item.net < 0 ? 'text-rose-700' : 'text-slate-700'}>
                      {item.net > 0 ? `+${item.net.toFixed(2)}` : item.net.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-2 px-3 border-r border-slate-300 text-slate-700">
                    {item.praises.length > 0 && (
                      <div className="text-emerald-800">
                        • <strong>Khen:</strong> {item.praises.join(', ')}
                      </div>
                    )}
                    {item.violations.length > 0 && (
                      <div className="text-rose-800">
                        • <strong>Vi phạm:</strong> {item.violations.join(', ')}
                      </div>
                    )}
                    {item.praises.length === 0 && item.violations.length === 0 && (
                      <span className="text-slate-400 italic">Thực hiện tốt nội quy lớp học</span>
                    )}
                  </td>
                  <td className="py-2 px-2 text-center font-semibold">
                    <span className={`px-2 py-0.5 rounded text-3xs ${
                      item.evaluation === 'Xuất sắc'
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.evaluation === 'Tốt'
                          ? 'bg-slate-100 text-slate-800'
                          : 'bg-rose-100 text-rose-800'
                    }`}>
                      {item.evaluation}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-400 text-2xs">
              <tr>
                <td colSpan={2} className="py-2 px-3 uppercase border-r border-slate-300">
                  Tổng kết tổ
                </td>
                <td className="py-2 px-2 text-center border-r border-slate-300">
                  {totalGroupLate + totalGroupExcused + totalGroupUnexcused} lượt
                </td>
                <td className="py-2 px-2 text-center text-emerald-800 border-r border-slate-300">
                  +{totalGroupPos.toFixed(2)}
                </td>
                <td className="py-2 px-2 text-center text-rose-800 border-r border-slate-300">
                  -{totalGroupNeg.toFixed(2)}
                </td>
                <td className="py-2 px-2 text-center border-r border-slate-300">
                  {totalGroupNet > 0 ? `+${totalGroupNet.toFixed(2)}` : totalGroupNet.toFixed(2)}
                </td>
                <td colSpan={2} className="py-2 px-3 text-slate-600 font-normal italic">
                  Báo cáo nộp tiết sinh hoạt chủ nhiệm
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Notes & Suggestions by Leader */}
        <div className="text-xs space-y-2 mb-8 bg-slate-50 p-4 rounded-xl border border-slate-200 print:bg-transparent print:border-slate-300 print:p-2 print:rounded-none">
          <div className="flex items-center justify-between">
            <div className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
              <MessageSquare className="w-4 h-4 text-blue-600 print:hidden" />
              <span>Ý kiến nhận xét của tổ trưởng:</span>
            </div>
            <span className="text-3xs text-slate-500 print:hidden italic">
              (Nhấp vào ô để viết thêm ý kiến hoặc chọn các gợi ý nhanh bên dưới)
            </span>
          </div>

          {/* Quick template buttons (Hidden when printing) */}
          <div className="print:hidden flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-3xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Gợi ý nhanh:</span>
            </span>

            <button
              type="button"
              onClick={() => handleAppendSuggestion('- Các thành viên trong tổ duy trì nề nếp học tập rất nghiêm túc, tích cực phát biểu xây dựng bài.')}
              className="px-2 py-1 rounded-md text-3xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60 transition-colors flex items-center gap-1"
            >
              <Plus className="w-2.5 h-2.5" />
              <span>Khen nề nếp tốt</span>
            </button>

            <button
              type="button"
              onClick={() => handleAppendSuggestion('- Đề nghị một số bạn chấn chỉnh việc đi học trễ và giữ gìn trật tự trong giờ học.')}
              className="px-2 py-1 rounded-md text-3xs font-medium bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/60 transition-colors flex items-center gap-1"
            >
              <Plus className="w-2.5 h-2.5" />
              <span>Nhắc nhở vi phạm</span>
            </button>

            <button
              type="button"
              onClick={() => handleAppendSuggestion('- Đề xuất GVCN biểu dương các thành viên có nhiều điểm cộng thi đua và tinh thần giúp đỡ bạn học.')}
              className="px-2 py-1 rounded-md text-3xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/60 transition-colors flex items-center gap-1"
            >
              <Plus className="w-2.5 h-2.5" />
              <span>Đề xuất biểu dương</span>
            </button>

            <button
              type="button"
              onClick={() => handleAppendSuggestion('- Tổ đã phân công các bạn học tốt hỗ trợ kèm cặp các bạn còn gặp khó khăn trong môn học.')}
              className="px-2 py-1 rounded-md text-3xs font-medium bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200/60 transition-colors flex items-center gap-1"
            >
              <Plus className="w-2.5 h-2.5" />
              <span>Hỗ trợ học tập</span>
            </button>

            <button
              type="button"
              onClick={() => handleUpdateComment(defaultLeaderText)}
              className="px-2 py-1 rounded-md text-3xs font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors flex items-center gap-1 ml-auto"
              title="Khôi phục nhận xét tự động theo dữ liệu tuần"
            >
              <RotateCcw className="w-2.5 h-2.5" />
              <span>Tự động theo tuần</span>
            </button>
          </div>

          {/* Interactive Editable Textarea (Screen view) */}
          <div className="print:hidden">
            <textarea
              rows={4}
              value={leaderComment}
              onChange={(e) => handleUpdateComment(e.target.value)}
              placeholder="Nhập ý kiến nhận xét của tổ trưởng về nề nếp, tinh thần học tập, đề xuất khen thưởng hoặc giải pháp khắc phục..."
              className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 leading-relaxed font-sans text-slate-800 placeholder:text-slate-400 resize-y shadow-2xs"
            />
            <div className="flex items-center justify-between text-3xs text-slate-400 mt-1 px-1">
              <span>Nội dung được tự động lưu lại theo từng tuần.</span>
              <button
                type="button"
                onClick={() => handleUpdateComment('')}
                className="hover:text-rose-600 underline"
              >
                Xóa trắng ô nhận xét
              </button>
            </div>
          </div>

          {/* Printable static paragraph view (Clean A4 Paper view when printing) */}
          <div className="hidden print:block text-2xs text-slate-800 leading-relaxed whitespace-pre-wrap font-sans pt-1">
            {leaderComment || 'Không có nhận xét hoặc đề xuất thêm.'}
          </div>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-8 text-center text-xs mt-10 pt-4">
          <div>
            <div className="font-bold uppercase text-slate-900">
              GIÁO VIÊN CHỦ NHIỆM
            </div>
            <div className="text-3xs text-slate-500 italic mt-0.5">
              (Ký và ghi rõ họ tên)
            </div>
            <div className="h-16" />
            <div className="font-bold text-slate-900">{config.teacherName}</div>
          </div>

          <div>
            <div className="font-bold uppercase text-slate-900">
              TỔ TRƯỞNG LẬP BÁO CÁO
            </div>
            <div className="text-3xs text-slate-500 italic mt-0.5">
              (Ký và ghi rõ họ tên)
            </div>
            <div className="h-16" />
            <div className="font-bold text-slate-900">{config.leaderName}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
