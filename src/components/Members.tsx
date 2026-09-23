import React, { useState, useMemo } from 'react';
import { BehaviorRecord, Member } from '../types';
import { getWeekRange, isDateInWeek } from '../utils/dateUtils';
import { 
  UserPlus, 
  Search, 
  Edit3, 
  Trash2, 
  UserCheck, 
  AlertCircle, 
  CheckCircle2, 
  X,
  User,
  Sparkles,
  FileUp
} from 'lucide-react';
import { ImportMembersModal } from './ImportMembersModal';

interface MembersProps {
  members: Member[];
  behaviors: BehaviorRecord[];
  onAddMember: (member: Omit<Member, 'id' | 'stt'>) => void;
  onBulkAddMembers?: (members: Omit<Member, 'id' | 'stt'>[], replaceAll: boolean) => void;
  onUpdateMember: (member: Member) => void;
  onDeleteMember: (id: string) => void;
}

export const Members: React.FC<MembersProps> = ({
  members,
  behaviors,
  onAddMember,
  onBulkAddMembers,
  onUpdateMember,
  onDeleteMember,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formGender, setFormGender] = useState<'Nam' | 'Nữ'>('Nam');
  const [formNote, setFormNote] = useState('');

  // Delete confirmation modal state
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);

  const currentWeek = getWeekRange(new Date());

  // Calculate points for this week for each member
  const membersWithStats = useMemo(() => {
    return members.map((m) => {
      const memberWeeklyBehaviors = behaviors.filter(
        (b) => b.memberId === m.id && isDateInWeek(b.date, currentWeek)
      );
      const pos = memberWeeklyBehaviors
        .filter((b) => b.point > 0)
        .reduce((sum, b) => sum + b.point, 0);
      const neg = memberWeeklyBehaviors
        .filter((b) => b.point < 0)
        .reduce((sum, b) => sum + Math.abs(b.point), 0);
      const net = pos - neg;
      const status: 'Tốt' | 'Cần chú ý' = neg >= 0.5 || net < 0 ? 'Cần chú ý' : 'Tốt';

      return {
        ...m,
        pos,
        neg,
        net,
        status,
        infractionCount: memberWeeklyBehaviors.filter((b) => b.point < 0).length,
      };
    });
  }, [members, behaviors, currentWeek]);

  // Filtered members by search
  const filteredMembers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return membersWithStats;
    return membersWithStats.filter((m) =>
      m.name.toLowerCase().includes(term) || (m.note && m.note.toLowerCase().includes(term))
    );
  }, [membersWithStats, searchTerm]);

  // Open modal for add
  const handleOpenAdd = () => {
    setEditingMember(null);
    setFormName('');
    setFormGender('Nam');
    setFormNote('');
    setIsModalOpen(true);
  };

  // Open modal for edit
  const handleOpenEdit = (m: Member) => {
    setEditingMember(m);
    setFormName(m.name);
    setFormGender(m.gender);
    setFormNote(m.note || '');
    setIsModalOpen(true);
  };

  // Save form
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (editingMember) {
      onUpdateMember({
        ...editingMember,
        name: formName.trim().toUpperCase(),
        gender: formGender,
        note: formNote.trim(),
      });
    } else {
      onAddMember({
        name: formName.trim().toUpperCase(),
        gender: formGender,
        note: formNote.trim(),
      });
    }
    setIsModalOpen(false);
  };

  // Confirm delete
  const handleConfirmDelete = () => {
    if (memberToDelete) {
      onDeleteMember(memberToDelete.id);
      setMemberToDelete(null);
    }
  };

  return (
    <div className="space-y-5 pb-20 md:pb-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Danh sách thành viên trong tổ
          </h2>
          <p className="text-2xs sm:text-xs text-slate-500">
            Tổng số: <strong className="text-slate-800">{members.length}</strong> học sinh ({members.filter(m => m.gender === 'Nam').length} Nam, {members.filter(m => m.gender === 'Nữ').length} Nữ)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Search bar */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-all"
            />
            {searchTerm && (
              <button
                aria-label="Xóa nội dung tìm kiếm"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors shadow-2xs whitespace-nowrap"
            title="Tải danh sách học sinh từ file Word (.docx, .doc), PDF hoặc văn bản"
          >
            <FileUp className="w-4 h-4 text-blue-600" />
            <span>Nhập từ Word / PDF</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-2xs shadow-blue-500/20 whitespace-nowrap"
          >
            <UserPlus className="w-4 h-4" />
            <span>Thêm thủ công</span>
          </button>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase text-2xs tracking-wider">
              <tr>
                <th className="py-3 px-3.5 w-12 text-center">STT</th>
                <th className="py-3 px-4 min-w-[180px]">Họ và tên</th>
                <th className="py-3 px-3 w-20 text-center">Giới tính</th>
                <th className="py-3 px-3.5 text-center text-emerald-700">Điểm cộng tuần</th>
                <th className="py-3 px-3.5 text-center text-rose-600">Điểm trừ tuần</th>
                <th className="py-3 px-3.5 text-center">Điểm tổng</th>
                <th className="py-3 px-3.5 text-center">Trạng thái</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Không tìm thấy thành viên phù hợp với từ khóa "{searchTerm}".
                  </td>
                </tr>
              ) : (
                filteredMembers.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3.5 text-center font-medium text-slate-400 tabular-nums">
                      {m.stt}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-2">
                        <span>{m.name}</span>
                        {m.note && (
                          <span className="text-3xs px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-medium">
                            {m.note}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center text-slate-600">
                      <span className={`text-2xs font-medium px-2 py-0.5 rounded ${
                        m.gender === 'Nam' ? 'bg-sky-50 text-sky-700' : 'bg-pink-50 text-pink-700'
                      }`}>
                        {m.gender}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-center font-bold text-emerald-600 tabular-nums">
                      {m.pos > 0 ? `+${m.pos.toFixed(2)}` : '0'}
                    </td>
                    <td className="py-3 px-3.5 text-center font-bold text-rose-600 tabular-nums">
                      {m.neg > 0 ? `-${m.neg.toFixed(2)}` : '0'}
                    </td>
                    <td className="py-3 px-3.5 text-center font-bold tabular-nums">
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        m.net > 0 
                          ? 'bg-emerald-50 text-emerald-700' 
                          : m.net < 0 
                            ? 'bg-rose-50 text-rose-700' 
                            : 'bg-slate-100 text-slate-600'
                      }`}>
                        {m.net > 0 ? `+${m.net.toFixed(2)}` : m.net.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      {m.status === 'Tốt' ? (
                        <span className="inline-flex items-center gap-1 text-2xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Tốt</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-2xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                          <AlertCircle className="w-3 h-3" />
                          <span>Cần chú ý</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(m)}
                          title="Sửa thông tin học sinh"
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setMemberToDelete(m)}
                          title="Xóa học sinh khỏi tổ"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit Member */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingMember ? 'Sửa thông tin thành viên' : 'Thêm thành viên mới'}
              </h3>
              <button
                aria-label="Đóng cửa sổ"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Họ và tên học sinh <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: NGUYỄN VĂN A"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-xs uppercase"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Giới tính
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer font-medium">
                    <input
                      type="radio"
                      name="gender"
                      value="Nam"
                      checked={formGender === 'Nam'}
                      onChange={() => setFormGender('Nam')}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span>Nam</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-medium">
                    <input
                      type="radio"
                      name="gender"
                      value="Nữ"
                      checked={formGender === 'Nữ'}
                      onChange={() => setFormGender('Nữ')}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span>Nữ</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Chức vụ / Ghi chú (tùy chọn)
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Tổ trưởng, Tổ phó, Cán sự học tập..."
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
                >
                  {editingMember ? 'Cập nhật' : 'Thêm vào tổ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog Delete */}
      {memberToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-xl border border-slate-200">
            <div className="flex items-center gap-3 text-rose-600 mb-2">
              <div className="w-9 h-9 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Xác nhận xóa thành viên?
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Bạn có chắc chắn muốn xóa học sinh <strong className="text-slate-900">{memberToDelete.name}</strong> khỏi danh sách tổ? Thao tác này sẽ xóa thành viên này.
            </p>
            <div className="flex items-center justify-end gap-2 mt-5">
              <button
                onClick={() => setMemberToDelete(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-xs"
              >
                Xóa ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Word / PDF Modal */}
      <ImportMembersModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={(newStudents, replaceAll) => {
          if (onBulkAddMembers) {
            onBulkAddMembers(newStudents, replaceAll);
          } else {
            newStudents.forEach((s) => onAddMember(s));
          }
        }}
        currentCount={members.length}
      />
    </div>
  );
};
