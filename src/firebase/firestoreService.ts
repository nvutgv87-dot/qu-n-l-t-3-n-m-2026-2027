import { 
  doc, 
  onSnapshot, 
  setDoc, 
  getDoc,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';
import { db, ensureAuth } from './firebase';
import { AttendanceRecord, BehaviorRecord, ClassConfig, Member } from '../types';
import { getDemoData, loadAttendance, loadBehaviors, loadConfig, loadMembers } from '../utils/storage';

export interface AppCloudData {
  config: ClassConfig;
  members: Member[];
  attendance: AttendanceRecord[];
  behaviors: BehaviorRecord[];
  leaderComments?: Record<string, string>;
  updatedAt?: any;
}

export type ConnectionStatus = 'connecting' | 'connected' | 'syncing' | 'offline' | 'error';

const MAIN_DOC_PATH = 'quan_ly_to_11a1';
const MAIN_DOC_ID = 'main_data';

// Helper to get main doc ref
export function getMainDocRef() {
  return doc(db, MAIN_DOC_PATH, MAIN_DOC_ID);
}

/**
 * Subscribes to real-time updates from Firebase Firestore
 */
export function subscribeToClassData(
  onData: (data: AppCloudData) => void,
  onStatusChange: (status: ConnectionStatus, message?: string) => void
): () => void {
  onStatusChange('connecting', 'Đang kết nối Firebase Firestore...');

  // Ensure auth in background
  ensureAuth().catch(() => {});

  const docRef = getMainDocRef();

  const unsubscribe = onSnapshot(
    docRef,
    { includeMetadataChanges: true },
    async (snapshot) => {
      const isFromCache = snapshot.metadata.fromCache;
      const hasPendingWrites = snapshot.metadata.hasPendingWrites;

      if (hasPendingWrites) {
        onStatusChange('syncing', 'Đang lưu vào đám mây Firebase...');
      } else if (isFromCache) {
        onStatusChange('connected', 'Dữ liệu cục bộ / Đang trực tuyến');
      } else {
        onStatusChange('connected', 'Đã kết nối thời gian thực với Firebase');
      }

      if (snapshot.exists()) {
        const raw = snapshot.data() as AppCloudData;
        onData({
          config: raw.config || loadConfig(),
          members: Array.isArray(raw.members) ? raw.members : loadMembers(),
          attendance: Array.isArray(raw.attendance) ? raw.attendance : loadAttendance(),
          behaviors: Array.isArray(raw.behaviors) ? raw.behaviors : loadBehaviors(),
          leaderComments: raw.leaderComments || {},
        });
      } else {
        // First time initialization on Firebase: seed from local/demo data!
        try {
          const initialData: AppCloudData = {
            config: loadConfig(),
            members: loadMembers(),
            attendance: loadAttendance(),
            behaviors: loadBehaviors(),
            leaderComments: {},
            updatedAt: serverTimestamp(),
          };
          await setDoc(docRef, initialData);
          onData(initialData);
        } catch (err: any) {
          console.error('Error seeding Firebase initial document:', err);
          onStatusChange('error', err.message || 'Lỗi khởi tạo dữ liệu Firebase');
        }
      }
    },
    (error) => {
      console.error('Firebase onSnapshot error:', error);
      onStatusChange('error', error.message || 'Không thể đồng bộ dữ liệu thời gian thực');
    }
  );

  return unsubscribe;
}

/**
 * Save updated members to Firebase Firestore
 */
export async function saveMembersToCloud(members: Member[]): Promise<void> {
  const docRef = getMainDocRef();
  try {
    await setDoc(
      docRef,
      {
        members,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    console.error('Failed to save members to Firebase:', err);
    throw err;
  }
}

/**
 * Save updated attendance to Firebase Firestore
 */
export async function saveAttendanceToCloud(attendance: AttendanceRecord[]): Promise<void> {
  const docRef = getMainDocRef();
  try {
    await setDoc(
      docRef,
      {
        attendance,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    console.error('Failed to save attendance to Firebase:', err);
    throw err;
  }
}

/**
 * Save updated behaviors to Firebase Firestore
 */
export async function saveBehaviorsToCloud(behaviors: BehaviorRecord[]): Promise<void> {
  const docRef = getMainDocRef();
  try {
    await setDoc(
      docRef,
      {
        behaviors,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    console.error('Failed to save behaviors to Firebase:', err);
    throw err;
  }
}

/**
 * Save updated config to Firebase Firestore
 */
export async function saveConfigToCloud(config: ClassConfig): Promise<void> {
  const docRef = getMainDocRef();
  try {
    await setDoc(
      docRef,
      {
        config,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    console.error('Failed to save config to Firebase:', err);
    throw err;
  }
}

/**
 * Save leader comment for a week to Firebase Firestore
 */
export async function saveLeaderCommentToCloud(weekStart: string, comment: string): Promise<void> {
  const docRef = getMainDocRef();
  try {
    await setDoc(
      docRef,
      {
        leaderComments: {
          [weekStart]: comment,
        },
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    console.error('Failed to save leader comment to Firebase:', err);
  }
}

/**
 * Reset all data to demo in Firebase Firestore
 */
export async function resetCloudToDemo(): Promise<AppCloudData> {
  const demo = getDemoData();
  const docRef = getMainDocRef();
  const data: AppCloudData = {
    config: demo.config,
    members: demo.members,
    attendance: demo.attendance,
    behaviors: demo.behaviors,
    leaderComments: {},
    updatedAt: serverTimestamp(),
  };
  await setDoc(docRef, data);
  return data;
}

/**
 * Import backup JSON directly to Firebase Firestore
 */
export async function importBackupToCloud(jsonString: string): Promise<boolean> {
  try {
    const data = JSON.parse(jsonString);
    const docRef = getMainDocRef();
    const updatePayload: Partial<AppCloudData> = {
      updatedAt: serverTimestamp(),
    };

    if (Array.isArray(data.members)) {
      updatePayload.members = data.members;
    }
    if (Array.isArray(data.attendance)) {
      updatePayload.attendance = data.attendance;
    }
    if (Array.isArray(data.behaviors)) {
      updatePayload.behaviors = data.behaviors;
    }
    if (data.config && typeof data.config === 'object') {
      updatePayload.config = data.config;
    }
    if (data.leaderComments && typeof data.leaderComments === 'object') {
      updatePayload.leaderComments = data.leaderComments;
    }

    await setDoc(docRef, updatePayload, { merge: true });
    return true;
  } catch (err) {
    console.error('Error importing backup to Firebase:', err);
    return false;
  }
}
