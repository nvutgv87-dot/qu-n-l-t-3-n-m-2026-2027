import React, { useState } from 'react';
import { Cloud, CloudOff, RefreshCw, CheckCircle2, AlertTriangle, Database, ExternalLink, X } from 'lucide-react';
import { ConnectionStatus } from '../firebase/firestoreService';
import { firebaseConfig } from '../firebase/firebase';

interface FirebaseStatusBadgeProps {
  status: ConnectionStatus;
  statusMessage?: string;
  membersCount: number;
  behaviorsCount: number;
  attendanceCount: number;
  onRefresh?: () => void;
}

export const FirebaseStatusBadge: React.FC<FirebaseStatusBadgeProps> = ({
  status,
  statusMessage,
  membersCount,
  behaviorsCount,
  attendanceCount,
  onRefresh,
}) => {
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  let badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let dotColor = 'bg-emerald-500';
  let icon = <Cloud className="w-3.5 h-3.5 text-emerald-600" />;
  let label = 'Firebase Realtime';

  if (status === 'connecting' || status === 'syncing') {
    badgeColor = 'bg-blue-50 text-blue-700 border-blue-200';
    dotColor = 'bg-blue-500 animate-pulse';
    icon = <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin" />;
    label = status === 'syncing' ? 'Đang đồng bộ...' : 'Đang kết nối...';
  } else if (status === 'error') {
    badgeColor = 'bg-amber-50 text-amber-800 border-amber-200';
    dotColor = 'bg-amber-500';
    icon = <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />;
    label = 'Ngoại tuyến / Cache';
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsDetailOpen(true)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-2xs font-semibold border transition-all hover:shadow-xs cursor-pointer ${badgeColor}`}
        title="Nhấp để xem chi tiết kết nối cơ sở dữ liệu Firebase"
      >
        <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
        {icon}
        <span className="hidden sm:inline">{label}</span>
      </button>

      {/* Detail Modal */}
      {isDetailOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/50 backdrop-blur-2xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Cơ sở dữ liệu Firebase Realtime
                  </h4>
                  <p className="text-3xs text-slate-500">
                    Đồng bộ thời gian thực qua Cloud Firestore
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDetailOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-slate-700">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Trạng thái:</span>
                  <span className="font-bold flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${dotColor}`} />
                    {status === 'connected' ? 'Đang hoạt động (Trực tuyến)' : statusMessage || status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Dự án Firebase:</span>
                  <span className="font-mono font-bold text-slate-800">{firebaseConfig.projectId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Auth Domain:</span>
                  <span className="font-mono text-3xs text-slate-600">{firebaseConfig.authDomain}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="text-base font-extrabold text-blue-700">{membersCount}</div>
                  <div className="text-3xs text-blue-600 font-medium">Thành viên</div>
                </div>
                <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100">
                  <div className="text-base font-extrabold text-emerald-700">{attendanceCount}</div>
                  <div className="text-3xs text-emerald-600 font-medium">Lượt điểm danh</div>
                </div>
                <div className="p-2.5 bg-purple-50 rounded-xl border border-purple-100">
                  <div className="text-base font-extrabold text-purple-700">{behaviorsCount}</div>
                  <div className="text-3xs text-purple-600 font-medium">Ghi nhận vi phạm/khen</div>
                </div>
              </div>

              <div className="text-3xs text-slate-500 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                ⚡ Dữ liệu được đồng bộ hóa tức thì giữa tất cả các thiết bị (máy tính, điện thoại) của tổ trưởng và giáo viên chủ nhiệm. Nếu mất kết nối mạng, ứng dụng vẫn hoạt động bình thường trên bộ nhớ đệm và tự động đẩy lên Firebase khi có mạng trở lại.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              {onRefresh && (
                <button
                  type="button"
                  onClick={() => {
                    onRefresh();
                    setIsDetailOpen(false);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Làm mới kết nối</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsDetailOpen(false)}
                className="px-3.5 py-1.5 text-xs font-bold bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
