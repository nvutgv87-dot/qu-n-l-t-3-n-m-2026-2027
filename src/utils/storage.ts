import { 
  DEFAULT_CLASS_CONFIG, 
  INITIAL_MEMBERS, 
  STORAGE_KEYS 
} from '../config/constants';
import { 
  AttendanceRecord, 
  BehaviorRecord, 
  ClassConfig, 
  Member 
} from '../types';
import { getTodayDateString, getWeekRange } from './dateUtils';

export function getDemoData(): {
  members: Member[];
  attendance: AttendanceRecord[];
  behaviors: BehaviorRecord[];
  config: ClassConfig;
} {
  const currentWeek = getWeekRange(new Date());
  const d0 = currentWeek.days[0].date; // Mon
  const d1 = currentWeek.days[1].date; // Tue
  const d2 = currentWeek.days[2].date; // Wed

  const attendance: AttendanceRecord[] = [
    // Thứ 2
    { id: 'att-1-1', memberId: 'mem-1', date: d0, status: 'present', createdAt: `${d0}T06:50:00` },
    { id: 'att-1-2', memberId: 'mem-2', date: d0, status: 'present', createdAt: `${d0}T06:51:00` },
    { id: 'att-1-3', memberId: 'mem-3', date: d0, status: 'present', createdAt: `${d0}T06:52:00` },
    { id: 'att-1-4', memberId: 'mem-4', date: d0, status: 'late', note: 'Kẹt xe 10 phút', createdAt: `${d0}T07:10:00` },
    { id: 'att-1-5', memberId: 'mem-5', date: d0, status: 'present', createdAt: `${d0}T06:55:00` },
    { id: 'att-1-6', memberId: 'mem-6', date: d0, status: 'present', createdAt: `${d0}T06:53:00` },

    // Thứ 3
    { id: 'att-2-1', memberId: 'mem-1', date: d1, status: 'present', createdAt: `${d1}T06:50:00` },
    { id: 'att-2-2', memberId: 'mem-2', date: d1, status: 'present', createdAt: `${d1}T06:50:00` },
    { id: 'att-2-3', memberId: 'mem-3', date: d1, status: 'absent_excused', note: 'Phụ huynh xin phép sốt nhẹ', createdAt: `${d1}T06:45:00` },
    { id: 'att-2-4', memberId: 'mem-4', date: d1, status: 'present', createdAt: `${d1}T06:52:00` },
    { id: 'att-2-5', memberId: 'mem-5', date: d1, status: 'present', createdAt: `${d1}T06:54:00` },
    { id: 'att-2-6', memberId: 'mem-6', date: d1, status: 'present', createdAt: `${d1}T06:51:00` },

    // Thứ 4
    { id: 'att-3-1', memberId: 'mem-1', date: d2, status: 'present', createdAt: `${d2}T06:50:00` },
    { id: 'att-3-2', memberId: 'mem-2', date: d2, status: 'present', createdAt: `${d2}T06:50:00` },
    { id: 'att-3-3', memberId: 'mem-3', date: d2, status: 'present', createdAt: `${d2}T06:52:00` },
    { id: 'att-3-4', memberId: 'mem-4', date: d2, status: 'late', note: 'Đến lớp lúc 7h15', createdAt: `${d2}T07:15:00` },
    { id: 'att-3-5', memberId: 'mem-5', date: d2, status: 'present', createdAt: `${d2}T06:53:00` },
    { id: 'att-3-6', memberId: 'mem-6', date: d2, status: 'present', createdAt: `${d2}T06:50:00` },
  ];

  const behaviors: BehaviorRecord[] = [
    // Trần Công Minh
    {
      id: 'beh-1',
      memberId: 'mem-1',
      date: d0,
      criterionId: 'crit-speak-up',
      categoryTitle: '✅ Tích cực',
      label: 'Phát biểu xây dựng bài (đủ 5 lần)',
      point: 0.25,
      note: 'Hăng hái tiết Toán và Ngữ Văn',
      recordedBy: 'Trần Công Minh',
      createdAt: `${d0}T10:15:00`,
    },
    {
      id: 'beh-2',
      memberId: 'mem-1',
      date: d2,
      criterionId: 'crit-prod-study',
      categoryTitle: '🌟 Sản phẩm/Hoạt động nổi bật',
      label: 'Làm sản phẩm học tập (video, bài viết...)',
      point: 0.25,
      note: 'Làm slide thuyết trình Lịch Sử',
      recordedBy: 'Trần Công Minh',
      createdAt: `${d2}T11:00:00`,
    },

    // Tống Nhất Nam
    {
      id: 'beh-3',
      memberId: 'mem-2',
      date: d0,
      criterionId: 'crit-help-friend',
      categoryTitle: '✅ Tích cực',
      label: 'Giúp đỡ bạn học',
      point: 0.25,
      note: 'Hướng dẫn giải bài tập Hóa cho bạn',
      recordedBy: 'Trần Công Minh',
      createdAt: `${d0}T11:30:00`,
    },
    {
      id: 'beh-4',
      memberId: 'mem-2',
      date: d1,
      criterionId: 'crit-talking',
      categoryTitle: '❌ Vi phạm',
      label: 'Nói chuyện riêng',
      point: -0.25,
      note: 'GV bộ môn Sinh nhắc nhở',
      recordedBy: 'Trần Công Minh',
      createdAt: `${d1}T08:45:00`,
    },

    // Nguyễn Thị Thanh Thuỳ
    {
      id: 'beh-5',
      memberId: 'mem-3',
      date: d0,
      criterionId: 'crit-speak-up',
      categoryTitle: '✅ Tích cực',
      label: 'Phát biểu xây dựng bài (đủ 5 lần)',
      point: 0.25,
      note: 'Phát biểu tích cực môn Tiếng Anh',
      recordedBy: 'Trần Công Minh',
      createdAt: `${d0}T09:30:00`,
    },
    {
      id: 'beh-6',
      memberId: 'mem-3',
      date: d2,
      criterionId: 'crit-commend',
      categoryTitle: '🎯 Cá nhân',
      label: 'Được tuyên dương trong tuần',
      point: 0.25,
      note: 'Đạt điểm 10 kiểm tra miệng môn Sử',
      recordedBy: 'Trần Công Minh',
      createdAt: `${d2}T10:00:00`,
    },

    // Nguyễn Trần Khánh Vy (Cần chú ý vì bị trừ điểm)
    {
      id: 'beh-7',
      memberId: 'mem-4',
      date: d0,
      criterionId: 'crit-late',
      categoryTitle: '❌ Vi phạm',
      label: 'Đi học trễ',
      point: -0.25,
      note: 'Đến muộn 10 phút đầu giờ',
      recordedBy: 'Trần Công Minh',
      createdAt: `${d0}T07:15:00`,
    },
    {
      id: 'beh-8',
      memberId: 'mem-4',
      date: d1,
      criterionId: 'crit-no-hw',
      categoryTitle: '❌ Vi phạm',
      label: 'Không làm bài',
      point: -0.25,
      note: 'Chưa hoàn thành bài tập Vật Lý',
      recordedBy: 'Trần Công Minh',
      createdAt: `${d1}T08:15:00`,
    },
    {
      id: 'beh-9',
      memberId: 'mem-4',
      date: d2,
      criterionId: 'crit-late',
      categoryTitle: '❌ Vi phạm',
      label: 'Đi học trễ',
      point: -0.25,
      note: 'Trễ buổi sáng thứ 4',
      recordedBy: 'Trần Công Minh',
      createdAt: `${d2}T07:20:00`,
    },

    // Hà Nguyễn Tường Vy
    {
      id: 'beh-10',
      memberId: 'mem-5',
      date: d1,
      criterionId: 'crit-creative',
      categoryTitle: '🌟 Sản phẩm/Hoạt động nổi bật',
      label: 'Sáng tạo nội dung (âm nhạc, hình ảnh...)',
      point: 0.25,
      note: 'Vẽ bảng tin phong trào thanh niên',
      recordedBy: 'Trần Công Minh',
      createdAt: `${d1}T16:00:00`,
    },

    // Đặng Thị Tường Vy
    {
      id: 'beh-11',
      memberId: 'mem-6',
      date: d0,
      criterionId: 'crit-help-friend',
      categoryTitle: '✅ Tích cực',
      label: 'Giúp đỡ bạn học',
      point: 0.25,
      note: 'Trực nhật lau bảng phụ giúp tổ',
      recordedBy: 'Trần Công Minh',
      createdAt: `${d0}T11:45:00`,
    },
  ];

  return {
    members: INITIAL_MEMBERS,
    attendance,
    behaviors,
    config: DEFAULT_CLASS_CONFIG,
  };
}

export function loadMembers(): Member[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MEMBERS);
    if (!raw) {
      const demo = getDemoData();
      saveMembers(demo.members);
      return demo.members;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_MEMBERS;
  }
}

export function saveMembers(members: Member[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
  } catch (err) {
    console.error('Lỗi khi lưu danh sách thành viên:', err);
  }
}

export function loadAttendance(): AttendanceRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    if (!raw) {
      const demo = getDemoData();
      saveAttendance(demo.attendance);
      return demo.attendance;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveAttendance(records: AttendanceRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(records));
  } catch (err) {
    console.error('Lỗi khi lưu điểm danh:', err);
  }
}

export function loadBehaviors(): BehaviorRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BEHAVIORS);
    if (!raw) {
      const demo = getDemoData();
      saveBehaviors(demo.behaviors);
      return demo.behaviors;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveBehaviors(records: BehaviorRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.BEHAVIORS, JSON.stringify(records));
  } catch (err) {
    console.error('Lỗi khi lưu ghi nhận hành vi:', err);
  }
}

export function loadConfig(): ClassConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONFIG);
    if (!raw) {
      saveConfig(DEFAULT_CLASS_CONFIG);
      return DEFAULT_CLASS_CONFIG;
    }
    return { ...DEFAULT_CLASS_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_CLASS_CONFIG;
  }
}

export function saveConfig(config: ClassConfig): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
  } catch (err) {
    console.error('Lỗi khi lưu cấu hình lớp:', err);
  }
}

export function resetToDemo(): {
  members: Member[];
  attendance: AttendanceRecord[];
  behaviors: BehaviorRecord[];
  config: ClassConfig;
} {
  const demo = getDemoData();
  saveMembers(demo.members);
  saveAttendance(demo.attendance);
  saveBehaviors(demo.behaviors);
  saveConfig(demo.config);
  return demo;
}

export function exportBackupJson(): string {
  const data = {
    app: 'QUẢN LÝ TỔ — THEO DÕI THI ĐUA LỚP 11A1',
    version: '2.0',
    exportDate: new Date().toISOString(),
    config: loadConfig(),
    members: loadMembers(),
    attendance: loadAttendance(),
    behaviors: loadBehaviors(),
  };
  return JSON.stringify(data, null, 2);
}

export function importBackupJson(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    if (data.members && Array.isArray(data.members)) {
      saveMembers(data.members);
    }
    if (data.attendance && Array.isArray(data.attendance)) {
      saveAttendance(data.attendance);
    }
    if (data.behaviors && Array.isArray(data.behaviors)) {
      saveBehaviors(data.behaviors);
    }
    if (data.config && typeof data.config === 'object') {
      saveConfig(data.config);
    }
    return true;
  } catch (err) {
    console.error('Lỗi khi khôi phục từ JSON:', err);
    return false;
  }
}
