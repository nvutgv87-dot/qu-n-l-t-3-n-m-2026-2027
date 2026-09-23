import { BehaviorCriterion, ClassConfig, Member } from '../types';

/**
 * THÔNG TIN CẤU HÌNH LỚP & TỔ (Có thể dễ dàng chỉnh sửa tại đây hoặc qua giao diện Cài đặt)
 */
export const DEFAULT_CLASS_CONFIG: ClassConfig = {
  className: '11A1',
  groupName: 'Tổ 3',
  leaderName: 'Trần Công Minh',
  teacherName: 'Nguyễn Văn Út',
  schoolName: 'Trường THPT',
  schoolYear: '2025 - 2026',
};

export const AVAILABLE_GROUPS = ['Tổ 1', 'Tổ 2', 'Tổ 3', 'Tổ 4'];

/**
 * DANH SÁCH THÀNH VIÊN BAN ĐẦU THEO YÊU CẦU CỦA ĐỀ BÀI
 */
export const INITIAL_MEMBERS: Member[] = [
  { id: 'mem-1', stt: 1, name: 'TRẦN CÔNG MINH', gender: 'Nam', note: 'Tổ trưởng' },
  { id: 'mem-2', stt: 2, name: 'TỐNG NHẤT NAM', gender: 'Nam', note: 'Tổ phó' },
  { id: 'mem-3', stt: 3, name: 'NGUYỄN THỊ THANH THUỲ', gender: 'Nữ', note: '' },
  { id: 'mem-4', stt: 4, name: 'NGUYỄN TRẦN KHÁNH VY', gender: 'Nữ', note: '' },
  { id: 'mem-5', stt: 5, name: 'HÀ NGUYỄN TƯỜNG VY', gender: 'Nữ', note: '' },
  { id: 'mem-6', stt: 6, name: 'ĐẶNG THỊ TƯỜNG VY', gender: 'Nữ', note: '' },
];

/**
 * BẢNG TIÊU CHÍ HÀNH VI ĐẠO ĐỨC & NỘI QUY THI ĐUA
 * Chuẩn hóa theo quy định do nhà trường/GVCN quy định
 */
export const BEHAVIOR_CRITERIA: BehaviorCriterion[] = [
  // Nhóm ❌ Vi phạm (trừ điểm)
  {
    id: 'crit-late',
    groupId: 'violation',
    groupTitle: '❌ Vi phạm',
    label: 'Đi học trễ',
    defaultPoint: -0.25,
  },
  {
    id: 'crit-no-hw',
    groupId: 'violation',
    groupTitle: '❌ Vi phạm',
    label: 'Không làm bài',
    defaultPoint: -0.25,
  },
  {
    id: 'crit-talking',
    groupId: 'violation',
    groupTitle: '❌ Vi phạm',
    label: 'Nói chuyện riêng',
    defaultPoint: -0.25,
  },
  {
    id: 'crit-class-rule',
    groupId: 'violation',
    groupTitle: '❌ Vi phạm',
    label: 'Vi phạm nội quy lớp',
    defaultPoint: -0.25,
  },
  {
    id: 'crit-bad-words',
    groupId: 'violation',
    groupTitle: '❌ Vi phạm',
    label: 'Ngôn từ tiêu cực',
    defaultPoint: -0.25,
  },
  {
    id: 'crit-other-violation',
    groupId: 'violation',
    groupTitle: '❌ Vi phạm',
    label: 'Khác (tổ trưởng ghi rõ lý do)',
    defaultPoint: -0.25,
  },

  // Nhóm ⚠️ Nhắc nhở
  {
    id: 'crit-isolation',
    groupId: 'reminder',
    groupTitle: '⚠️ Nhắc nhở',
    label: 'Có dấu hiệu cô lập bạn',
    defaultPoint: -0.25,
  },

  // Nhóm ✅ Tích cực (cộng điểm)
  {
    id: 'crit-speak-up',
    groupId: 'positive',
    groupTitle: '✅ Tích cực',
    label: 'Phát biểu xây dựng bài (đủ 5 lần)',
    defaultPoint: 0.25,
  },
  {
    id: 'crit-help-friend',
    groupId: 'positive',
    groupTitle: '✅ Tích cực',
    label: 'Giúp đỡ bạn học',
    defaultPoint: 0.25,
  },

  // Nhóm 🌟 Sản phẩm/Hoạt động nổi bật
  {
    id: 'crit-prod-study',
    groupId: 'highlight',
    groupTitle: '🌟 Sản phẩm/Hoạt động nổi bật',
    label: 'Làm sản phẩm học tập (video, bài viết...)',
    defaultPoint: 0.25,
  },
  {
    id: 'crit-creative',
    groupId: 'highlight',
    groupTitle: '🌟 Sản phẩm/Hoạt động nổi bật',
    label: 'Sáng tạo nội dung (âm nhạc, hình ảnh...)',
    defaultPoint: 0.25,
  },

  // Nhóm 🎯 Cá nhân
  {
    id: 'crit-commend',
    groupId: 'personal',
    groupTitle: '🎯 Cá nhân',
    label: 'Được tuyên dương trong tuần',
    defaultPoint: 0.25,
  },
];

export const STORAGE_KEYS = {
  MEMBERS: 'quan_ly_to_11a1_members_v2',
  ATTENDANCE: 'quan_ly_to_11a1_attendance_v2',
  BEHAVIORS: 'quan_ly_to_11a1_behaviors_v2',
  CONFIG: 'quan_ly_to_11a1_config_v2',
};
