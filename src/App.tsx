/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Members } from './components/Members';
import { Attendance } from './components/Attendance';
import { BehaviorLog } from './components/BehaviorLog';
import { Scoreboard } from './components/Scoreboard';
import { History } from './components/History';
import { WeeklyReport } from './components/WeeklyReport';
import { SettingsModal } from './components/SettingsModal';
import { 
  ActiveTab, 
  AttendanceRecord, 
  BehaviorRecord, 
  ClassConfig, 
  Member 
} from './types';
import { 
  loadAttendance, 
  loadBehaviors, 
  loadConfig, 
  loadMembers, 
  resetToDemo, 
  saveAttendance, 
  saveBehaviors, 
  saveConfig, 
  saveMembers 
} from './utils/storage';
import { downloadStandaloneHtmlFile } from './utils/exportSingleHtml';
import { 
  subscribeToClassData, 
  saveMembersToCloud, 
  saveAttendanceToCloud, 
  saveBehaviorsToCloud, 
  saveConfigToCloud, 
  resetCloudToDemo, 
  ConnectionStatus,
  AppCloudData
} from './firebase/firestoreService';
import { FirebaseStatusBadge } from './components/FirebaseStatusBadge';

export default function App() {
  const [config, setConfig] = useState<ClassConfig>(loadConfig);
  const [members, setMembers] = useState<Member[]>(loadMembers);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(loadAttendance);
  const [behaviors, setBehaviors] = useState<BehaviorRecord[]>(loadBehaviors);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Firebase Realtime connection state
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [statusMessage, setStatusMessage] = useState<string>('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Subscribe to Firebase Firestore real-time updates
  useEffect(() => {
    const unsubscribe = subscribeToClassData(
      (cloudData: AppCloudData) => {
        if (cloudData.config) {
          setConfig(cloudData.config);
          saveConfig(cloudData.config);
        }
        if (cloudData.members) {
          setMembers(cloudData.members);
          saveMembers(cloudData.members);
        }
        if (cloudData.attendance) {
          setAttendance(cloudData.attendance);
          saveAttendance(cloudData.attendance);
        }
        if (cloudData.behaviors) {
          setBehaviors(cloudData.behaviors);
          saveBehaviors(cloudData.behaviors);
        }
      },
      (status, message) => {
        setConnectionStatus(status);
        if (message) setStatusMessage(message);
      }
    );

    return () => unsubscribe();
  }, []);

  // 1. Members handlers
  const handleAddMember = async (newMemData: Omit<Member, 'id' | 'stt'>) => {
    const newMember: Member = {
      ...newMemData,
      id: `mem-${Date.now()}`,
      stt: members.length + 1,
    };
    const updated = [...members, newMember];
    setMembers(updated);
    saveMembers(updated);
    showToast(`Đã thêm thành viên "${newMember.name}" vào tổ!`);
    try {
      await saveMembersToCloud(updated);
    } catch (err) {
      console.warn('Firebase sync notice:', err);
    }
  };

  const handleBulkAddMembers = async (
    newMembersList: Omit<Member, 'id' | 'stt'>[],
    replaceAll: boolean = false
  ) => {
    let updated: Member[];
    if (replaceAll) {
      updated = newMembersList.map((m, idx) => ({
        ...m,
        id: `mem-${Date.now()}-${idx}`,
        stt: idx + 1,
      }));
      setMembers(updated);
      saveMembers(updated);
      showToast(`Đã thay thế và nhập mới ${updated.length} thành viên vào tổ!`);
    } else {
      const currentLength = members.length;
      const formatted: Member[] = newMembersList.map((m, idx) => ({
        ...m,
        id: `mem-${Date.now()}-${idx}`,
        stt: currentLength + idx + 1,
      }));
      updated = [...members, ...formatted];
      setMembers(updated);
      saveMembers(updated);
      showToast(`Đã thêm ${formatted.length} học sinh mới vào danh sách tổ!`);
    }
    try {
      await saveMembersToCloud(updated);
    } catch (err) {
      console.warn('Firebase sync notice:', err);
    }
  };

  const handleUpdateMember = async (updatedMember: Member) => {
    const updated = members.map((m) => (m.id === updatedMember.id ? updatedMember : m));
    setMembers(updated);
    saveMembers(updated);
    showToast(`Đã cập nhật thông tin thành viên "${updatedMember.name}"!`);
    try {
      await saveMembersToCloud(updated);
    } catch (err) {
      console.warn('Firebase sync notice:', err);
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    const remaining = members.filter((m) => m.id !== memberId);
    // Re-index STT
    const reindexed = remaining.map((m, index) => ({
      ...m,
      stt: index + 1,
    }));
    setMembers(reindexed);
    saveMembers(reindexed);
    showToast('Đã xóa thành viên khỏi danh sách tổ!');
    try {
      await saveMembersToCloud(reindexed);
    } catch (err) {
      console.warn('Firebase sync notice:', err);
    }
  };

  // 2. Attendance handlers
  const handleSaveAttendance = async (recordsToSave: AttendanceRecord[]) => {
    // Merge or replace records for the dates updated
    const date = recordsToSave[0]?.date;
    if (!date) return;

    const filtered = attendance.filter((a) => a.date !== date);
    const updated = [...filtered, ...recordsToSave];
    setAttendance(updated);
    saveAttendance(updated);
    showToast('Đã lưu dữ liệu điểm danh thành công!');
    try {
      await saveAttendanceToCloud(updated);
    } catch (err) {
      console.warn('Firebase sync notice:', err);
    }
  };

  // 3. Behavior handlers
  const handleAddBehavior = async (recordData: Omit<BehaviorRecord, 'id' | 'createdAt'>) => {
    const newRecord: BehaviorRecord = {
      ...recordData,
      id: `beh-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [newRecord, ...behaviors];
    setBehaviors(updated);
    saveBehaviors(updated);
    try {
      await saveBehaviorsToCloud(updated);
    } catch (err) {
      console.warn('Firebase sync notice:', err);
    }
  };

  const handleUpdateBehavior = async (updatedRecord: BehaviorRecord) => {
    const updated = behaviors.map((b) => (b.id === updatedRecord.id ? updatedRecord : b));
    setBehaviors(updated);
    saveBehaviors(updated);
    showToast('Đã cập nhật lượt ghi nhận!');
    try {
      await saveBehaviorsToCloud(updated);
    } catch (err) {
      console.warn('Firebase sync notice:', err);
    }
  };

  const handleDeleteBehavior = async (recordId: string) => {
    const updated = behaviors.filter((b) => b.id !== recordId);
    setBehaviors(updated);
    saveBehaviors(updated);
    showToast('Đã xóa lượt ghi nhận khỏi hệ thống!');
    try {
      await saveBehaviorsToCloud(updated);
    } catch (err) {
      console.warn('Firebase sync notice:', err);
    }
  };

  // 4. Config handlers
  const handleSaveConfig = async (newConfig: ClassConfig) => {
    setConfig(newConfig);
    saveConfig(newConfig);
    showToast('Đã cập nhật thông tin lớp và tổ!');
    try {
      await saveConfigToCloud(newConfig);
    } catch (err) {
      console.warn('Firebase sync notice:', err);
    }
  };

  const handleChangeGroup = async (newGroupName: string) => {
    const updated = { ...config, groupName: newGroupName };
    setConfig(updated);
    saveConfig(updated);
    showToast(`Đã chuyển sang ${newGroupName}!`);
    try {
      await saveConfigToCloud(updated);
    } catch (err) {
      console.warn('Firebase sync notice:', err);
    }
  };

  // 5. Reset demo handler
  const handleResetDemo = async () => {
    if (window.confirm('Khôi phục toàn bộ dữ liệu mẫu ban đầu (6 thành viên, điểm danh & ghi nhận mẫu)? Dữ liệu trên Firebase Cloud sẽ được làm mới.')) {
      const demo = resetToDemo();
      setMembers(demo.members);
      setAttendance(demo.attendance);
      setBehaviors(demo.behaviors);
      setConfig(demo.config);
      try {
        await resetCloudToDemo();
        showToast('Đã khôi phục dữ liệu demo thành công trên Firebase Cloud!');
      } catch (err) {
        console.warn('Firebase reset warning:', err);
        showToast('Đã khôi phục dữ liệu demo cục bộ!');
      }
    }
  };

  // 6. Export single HTML
  const handleExportStandaloneHtml = () => {
    downloadStandaloneHtmlFile();
    showToast('Đang tải file HTML độc lập về máy tính/điện thoại!');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        config={config}
        onChangeGroup={handleChangeGroup}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onResetDemo={handleResetDemo}
        onExportStandaloneHtml={handleExportStandaloneHtml}
        firebaseStatusBadge={
          <FirebaseStatusBadge
            status={connectionStatus}
            statusMessage={statusMessage}
            membersCount={members.length}
            behaviorsCount={behaviors.length}
            attendanceCount={attendance.length}
          />
        }
      />

      {/* Main Layout Container */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Sidebar (Desktop) + Bottom Nav (Mobile) */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          memberCount={members.length}
        />

        {/* Content Pane */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {/* Toast Notification */}
          {toastMessage && (
            <div className="fixed bottom-20 md:bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700 animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{toastMessage}</span>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <Dashboard
              config={config}
              members={members}
              attendance={attendance}
              behaviors={behaviors}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'members' && (
            <Members
              members={members}
              behaviors={behaviors}
              onAddMember={handleAddMember}
              onBulkAddMembers={handleBulkAddMembers}
              onUpdateMember={handleUpdateMember}
              onDeleteMember={handleDeleteMember}
            />
          )}

          {activeTab === 'attendance' && (
            <Attendance
              members={members}
              attendance={attendance}
              onSaveAttendance={handleSaveAttendance}
              onAddBehaviorRecord={handleAddBehavior}
              leaderName={config.leaderName}
            />
          )}

          {activeTab === 'behavior' && (
            <BehaviorLog
              members={members}
              behaviors={behaviors}
              onAddBehavior={handleAddBehavior}
              onUpdateBehavior={handleUpdateBehavior}
              onDeleteBehavior={handleDeleteBehavior}
              leaderName={config.leaderName}
            />
          )}

          {activeTab === 'scoreboard' && (
            <Scoreboard
              members={members}
              behaviors={behaviors}
              attendance={attendance}
            />
          )}

          {activeTab === 'history' && (
            <History
              members={members}
              behaviors={behaviors}
              attendance={attendance}
              onDeleteBehavior={handleDeleteBehavior}
              leaderName={config.leaderName}
            />
          )}

          {activeTab === 'report' && (
            <WeeklyReport
              config={config}
              members={members}
              behaviors={behaviors}
              attendance={attendance}
            />
          )}
        </main>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onSaveConfig={handleSaveConfig}
        onResetDemo={handleResetDemo}
      />
    </div>
  );
}
