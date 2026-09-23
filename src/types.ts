export type Gender = 'Nam' | 'Nữ';

export interface Member {
  id: string;
  stt: number;
  name: string;
  gender: Gender;
  note?: string;
}

export type AttendanceStatus = 'present' | 'absent_excused' | 'absent_unexcused' | 'late';

export interface AttendanceRecord {
  id: string;
  memberId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  note?: string;
  createdAt: string;
}

export type BehaviorType = 'violation' | 'reminder' | 'positive' | 'highlight' | 'personal';

export interface BehaviorCriterion {
  id: string;
  groupId: BehaviorType;
  groupTitle: string;
  label: string;
  defaultPoint: number;
  icon?: string;
}

export interface BehaviorRecord {
  id: string;
  memberId: string;
  date: string; // YYYY-MM-DD
  criterionId: string;
  categoryTitle: string;
  label: string;
  point: number;
  note?: string;
  recordedBy: string;
  createdAt: string;
}

export interface ClassConfig {
  className: string;
  groupName: string;
  leaderName: string;
  teacherName: string;
  schoolName: string;
  schoolYear: string;
}

export type ActiveTab = 
  | 'dashboard' 
  | 'members' 
  | 'attendance' 
  | 'behavior' 
  | 'scoreboard' 
  | 'history' 
  | 'report';
