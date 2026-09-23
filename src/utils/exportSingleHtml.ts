/**
 * Generates a completely standalone, single-file HTML web application
 * (HTML + CSS + JavaScript in 1 file) that can run offline without any build tools or servers.
 */
export function generateStandaloneHtml(): string {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>QUẢN LÝ TỔ — THEO DÕI THI ĐUA LỚP 11A1</title>
  <style>
    :root {
      --primary: #2563eb;
      --primary-dark: #1d4ed8;
      --primary-light: #eff6ff;
      --success: #16a34a;
      --success-light: #f0fdf4;
      --danger: #dc2626;
      --danger-light: #fef2f2;
      --warning: #d97706;
      --warning-light: #fffbeb;
      --slate-50: #f8fafc;
      --slate-100: #f1f5f9;
      --slate-200: #e2e8f0;
      --slate-300: #cbd5e1;
      --slate-500: #64748b;
      --slate-700: #334155;
      --slate-800: #1e293b;
      --slate-900: #0f172a;
      --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: var(--font-family); background: var(--slate-50); color: var(--slate-800); line-height: 1.5; font-size: 14px; }
    
    /* Header */
    header { background: #fff; border-bottom: 1px solid var(--slate-200); position: sticky; top: 0; z-index: 100; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .header-container { max-width: 1200px; margin: 0 auto; padding: 0.75rem 1rem; display: flex; align-items: center; justify-content: space-between; }
    .brand { display: flex; align-items: center; gap: 0.75rem; }
    .brand-badge { background: var(--primary); color: #fff; font-weight: 700; padding: 0.4rem 0.6rem; border-radius: 8px; font-size: 0.9rem; }
    .brand-text h1 { font-size: 1.05rem; font-weight: 700; color: var(--slate-900); }
    .brand-text p { font-size: 0.75rem; color: var(--slate-500); }
    
    /* Layout */
    .app-layout { max-width: 1200px; margin: 0 auto; display: flex; min-height: calc(100vh - 65px); }
    .sidebar { width: 240px; background: #fff; border-right: 1px solid var(--slate-200); padding: 1rem; display: flex; flex-direction: column; gap: 0.35rem; }
    .main-content { flex: 1; padding: 1.25rem; overflow-x: hidden; }
    
    .nav-btn { display: flex; align-items: center; gap: 0.75rem; width: 100%; padding: 0.6rem 0.8rem; border-radius: 8px; border: none; background: transparent; font-size: 0.85rem; font-weight: 600; color: var(--slate-700); cursor: pointer; text-align: left; transition: all 0.15s; }
    .nav-btn:hover { background: var(--slate-100); color: var(--slate-900); }
    .nav-btn.active { background: var(--primary-light); color: var(--primary-dark); font-weight: 700; }
    
    /* Cards & Tables */
    .card { background: #fff; border-radius: 12px; border: 1px solid var(--slate-200); padding: 1.25rem; margin-bottom: 1.25rem; box-shadow: 0 1px 2px rgba(0,0,0,0.03); }
    .card-title { font-size: 1rem; font-weight: 700; margin-bottom: 0.5rem; color: var(--slate-900); display: flex; align-items: center; justify-content: space-between; }
    
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 1.25rem; }
    .stat-card { background: #fff; border-radius: 10px; border: 1px solid var(--slate-200); padding: 1rem; }
    .stat-card .label { font-size: 0.75rem; font-weight: 600; color: var(--slate-500); }
    .stat-card .value { font-size: 1.6rem; font-weight: 700; margin: 0.25rem 0; }
    .stat-card .sub { font-size: 0.72rem; color: var(--slate-500); }
    
    table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
    th, td { padding: 0.6rem 0.75rem; text-align: left; border-bottom: 1px solid var(--slate-200); }
    th { background: var(--slate-50); font-weight: 700; color: var(--slate-700); font-size: 0.75rem; text-transform: uppercase; }
    tr:hover td { background: var(--slate-50); }
    
    .btn { display: inline-flex; align-items: center; justify-content: center; gap: 0.35rem; padding: 0.45rem 0.85rem; font-size: 0.8rem; font-weight: 600; border-radius: 6px; border: 1px solid transparent; cursor: pointer; transition: all 0.15s; }
    .btn-primary { background: var(--primary); color: #fff; }
    .btn-primary:hover { background: var(--primary-dark); }
    .btn-outline { background: #fff; border-color: var(--slate-300); color: var(--slate-700); }
    .btn-outline:hover { background: var(--slate-100); }
    .btn-success { background: var(--success); color: #fff; }
    .btn-danger { background: var(--danger); color: #fff; }
    .btn-warning { background: var(--warning); color: #fff; }
    
    .badge { display: inline-block; padding: 0.2rem 0.5rem; border-radius: 9999px; font-size: 0.7rem; font-weight: 700; }
    .badge-success { background: var(--success-light); color: var(--success); }
    .badge-danger { background: var(--danger-light); color: var(--danger); }
    .badge-warning { background: var(--warning-light); color: var(--warning); }
    
    /* Attendance toggles */
    .att-btn-group { display: flex; gap: 0.35rem; }
    .att-toggle { padding: 0.35rem 0.6rem; font-size: 0.75rem; font-weight: 600; border-radius: 6px; border: 1px solid var(--slate-200); background: #fff; cursor: pointer; }
    .att-toggle.active-present { background: var(--success); color: #fff; border-color: var(--success); }
    .att-toggle.active-absent-cp { background: var(--primary); color: #fff; border-color: var(--primary); }
    .att-toggle.active-absent-kp { background: var(--danger); color: #fff; border-color: var(--danger); }
    .att-toggle.active-late { background: var(--warning); color: #fff; border-color: var(--warning); }
    
    .view-pane { display: none; }
    .view-pane.active { display: block; }
    
    /* Print */
    @media print {
      header, .sidebar, .btn, .print-hide { display: none !important; }
      .app-layout { display: block; }
      .main-content { padding: 0; }
      .card { border: none; box-shadow: none; padding: 0; }
      table { border: 1px solid #000; }
      th, td { border: 1px solid #000 !important; }
    }
    
    /* Mobile responsive */
    @media (max-width: 768px) {
      .app-layout { flex-direction: column; }
      .sidebar { width: 100%; border-right: none; border-bottom: 1px solid var(--slate-200); flex-direction: row; overflow-x: auto; padding: 0.5rem; }
      .nav-btn { white-space: nowrap; width: auto; font-size: 0.75rem; }
    }
  </style>
</head>
<body>

  <!-- Header -->
  <header>
    <div class="header-container">
      <div class="brand">
        <div class="brand-badge" id="headerClassBadge">11A1</div>
        <div class="brand-text">
          <h1 id="headerTitle">QUẢN LÝ TỔ — LỚP 11A1</h1>
          <p id="headerSubtitle">Tổ 3 · GVCN: Nguyễn Văn Út · Tổ trưởng: Trần Công Minh</p>
        </div>
      </div>
      <div>
        <button class="btn btn-outline" onclick="resetToDemoConfirm()">Khôi phục demo</button>
        <button class="btn btn-primary" onclick="window.print()">In báo cáo</button>
      </div>
    </div>
  </header>

  <div class="app-layout">
    <!-- Sidebar -->
    <aside class="sidebar">
      <button class="nav-btn active" onclick="switchTab('dashboard')">📊 Tổng quan</button>
      <button class="nav-btn" onclick="switchTab('members')">👥 Thành viên tổ</button>
      <button class="nav-btn" onclick="switchTab('attendance')">📅 Điểm danh</button>
      <button class="nav-btn" onclick="switchTab('behavior')">⭐ Ghi nhận điểm</button>
      <button class="nav-btn" onclick="switchTab('scoreboard')">🏆 Bảng điểm</button>
      <button class="nav-btn" onclick="switchTab('history')">📜 Lịch sử</button>
      <button class="nav-btn" onclick="switchTab('report')">📑 Báo cáo tuần</button>
    </aside>

    <!-- Main Views -->
    <main class="main-content">
      
      <!-- 1. DASHBOARD -->
      <section id="view-dashboard" class="view-pane active">
        <div class="card" style="background: linear-gradient(135deg, #1e40af, #3b82f6); color: #fff;">
          <h2 id="dashGreeting" style="font-size: 1.4rem; font-weight: 700;">Xin chào, tổ trưởng Trần Công Minh</h2>
          <p id="dashSub" style="opacity: 0.9; margin-top: 0.25rem;">Theo dõi thi đua Tổ 3 — Lớp 11A1</p>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="label">Sĩ số tổ</div>
            <div class="value" id="statMembersCount">6</div>
            <div class="sub">Học sinh</div>
          </div>
          <div class="stat-card">
            <div class="label">Có mặt hôm nay</div>
            <div class="value" style="color: var(--success);" id="statPresentCount">6</div>
            <div class="sub" id="statAbsentSub">Vắng: 0 · Trễ: 0</div>
          </div>
          <div class="stat-card">
            <div class="label">Điểm cộng tuần</div>
            <div class="value" style="color: var(--success);" id="statPosPoints">+0.00</div>
            <div class="sub">Tuyên dương</div>
          </div>
          <div class="stat-card">
            <div class="label">Điểm trừ tuần</div>
            <div class="value" style="color: var(--danger);" id="statNegPoints">-0.00</div>
            <div class="sub">Vi phạm / nhắc nhở</div>
          </div>
          <div class="stat-card">
            <div class="label">Điểm thi đua tổng của tổ</div>
            <div class="value" id="statNetPoints">0.00</div>
            <div class="sub">(Cộng − Trừ)</div>
          </div>
        </div>

        <div class="card">
          <div class="card-title">
            <span>⚠️ Thành viên cần chú ý trong tuần</span>
          </div>
          <div id="dashAttentionList" style="font-size: 0.85rem; color: var(--slate-700);"></div>
        </div>
      </section>

      <!-- 2. MEMBERS -->
      <section id="view-members" class="view-pane">
        <div class="card">
          <div class="card-title">
            <span>Danh sách thành viên</span>
            <div style="display: flex; gap: 0.5rem;">
              <button class="btn btn-outline" onclick="promptImportMembers()">📄 Nhập Word / Dán văn bản</button>
              <button class="btn btn-primary" onclick="promptAddMember()">+ Thêm thủ công</button>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th style="width: 40px; text-align: center;">STT</th>
                <th>Họ và tên</th>
                <th style="text-align: center;">Giới tính</th>
                <th style="text-align: center;">Cộng tuần</th>
                <th style="text-align: center;">Trừ tuần</th>
                <th style="text-align: center;">Tổng điểm</th>
                <th style="text-align: center;">Trạng thái</th>
                <th style="text-align: right;">Thao tác</th>
              </tr>
            </thead>
            <tbody id="membersTableBody"></tbody>
          </table>
        </div>
      </section>

      <!-- 3. ATTENDANCE -->
      <section id="view-attendance" class="view-pane">
        <div class="card">
          <div class="card-title">
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <span>Điểm danh chuyên cần</span>
              <input type="date" id="attDateInput" onchange="renderAttendance()" style="padding: 0.3rem 0.5rem; border: 1px solid var(--slate-300); border-radius: 6px;">
            </div>
            <div>
              <button class="btn btn-outline" onclick="markAllPresent()">Tất cả có mặt</button>
              <button class="btn btn-primary" onclick="saveAttendance()">Lưu điểm danh</button>
            </div>
          </div>
          <div id="attTableContainer"></div>
        </div>
      </section>

      <!-- 4. BEHAVIOR -->
      <section id="view-behavior" class="view-pane">
        <div class="card">
          <div class="card-title">Ghi nhận vi phạm / Tuyên dương đạo đức</div>
          <form id="behaviorForm" onsubmit="handleSaveBehavior(event)" style="display: grid; gap: 1rem; max-width: 600px;">
            <div>
              <label style="display:block; font-weight: 600; margin-bottom: 0.3rem;">Học sinh:</label>
              <select id="behStudentSelect" style="width: 100%; padding: 0.5rem; border: 1px solid var(--slate-300); border-radius: 6px;"></select>
            </div>
            <div>
              <label style="display:block; font-weight: 600; margin-bottom: 0.3rem;">Tiêu chí (Nội quy thi đua):</label>
              <select id="behCritSelect" onchange="updateCritPoint()" style="width: 100%; padding: 0.5rem; border: 1px solid var(--slate-300); border-radius: 6px;"></select>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
              <div>
                <label style="display:block; font-weight: 600; margin-bottom: 0.3rem;">Mức điểm:</label>
                <input type="number" step="0.05" id="behPointInput" style="width: 100%; padding: 0.5rem; border: 1px solid var(--slate-300); border-radius: 6px; font-weight: bold;">
              </div>
              <div>
                <label style="display:block; font-weight: 600; margin-bottom: 0.3rem;">Ngày:</label>
                <input type="date" id="behDateInput" style="width: 100%; padding: 0.5rem; border: 1px solid var(--slate-300); border-radius: 6px;">
              </div>
            </div>
            <div>
              <label style="display:block; font-weight: 600; margin-bottom: 0.3rem;">Ghi chú chi tiết:</label>
              <input type="text" id="behNoteInput" placeholder="Ví dụ: Tiết Toán, kẹt xe..." style="width: 100%; padding: 0.5rem; border: 1px solid var(--slate-300); border-radius: 6px;">
            </div>
            <button type="submit" class="btn btn-primary" style="padding: 0.6rem;">Lưu ghi nhận này</button>
          </form>
        </div>
      </section>

      <!-- 5. SCOREBOARD -->
      <section id="view-scoreboard" class="view-pane">
        <div class="card">
          <div class="card-title">Bảng tổng hợp điểm thi đua cả tổ</div>
          <table>
            <thead>
              <tr>
                <th style="text-align: center;">STT</th>
                <th>Họ và tên</th>
                <th style="text-align: center;">Điểm cộng</th>
                <th style="text-align: center;">Điểm trừ</th>
                <th style="text-align: center;">Điểm ròng</th>
                <th style="text-align: center;">Xếp loại</th>
              </tr>
            </thead>
            <tbody id="scoreboardTableBody"></tbody>
          </table>
        </div>
      </section>

      <!-- 6. HISTORY -->
      <section id="view-history" class="view-pane">
        <div class="card">
          <div class="card-title">Nhật ký lịch sử ghi nhận</div>
          <table>
            <thead>
              <tr>
                <th>Ngày</th>
                <th>Học sinh</th>
                <th>Nội dung</th>
                <th style="text-align: center;">Điểm</th>
                <th>Người ghi</th>
                <th style="text-align: right;">Thao tác</th>
              </tr>
            </thead>
            <tbody id="historyTableBody"></tbody>
          </table>
        </div>
      </section>

      <!-- 7. REPORT -->
      <section id="view-report" class="view-pane">
        <div class="card" style="padding: 2rem;">
          <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 1rem; margin-bottom: 1.5rem;">
            <div>
              <div style="font-weight: 700; text-transform: uppercase;">TRƯỜNG THPT</div>
              <div style="font-weight: 800; font-size: 1.1rem; color: #1e3a8a;" id="repClassTitle">LỚP 11A1 — TỔ 3</div>
              <div style="font-size: 0.8rem; color: #555;">GVCN: Nguyễn Văn Út</div>
            </div>
            <div style="text-align: right; font-size: 0.85rem;">
              <div style="font-weight: 700;">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
              <div style="font-style: italic;">Độc lập — Tự do — Hạnh phúc</div>
            </div>
          </div>

          <div style="text-align: center; margin: 1.5rem 0;">
            <h2 style="font-size: 1.3rem; font-weight: 800; text-transform: uppercase;">BÁO CÁO THI ĐUA VÀ KỶ LUẬT TUẦN</h2>
            <p style="font-style: italic; font-size: 0.85rem; color: #555;">Kính gửi: Giáo viên chủ nhiệm Nguyễn Văn Út</p>
          </div>

          <table style="border: 1px solid #333; margin-bottom: 2rem;">
            <thead>
              <tr style="background: #f1f5f9;">
                <th style="border: 1px solid #333; text-align: center;">STT</th>
                <th style="border: 1px solid #333;">Họ và tên</th>
                <th style="border: 1px solid #333; text-align: center;">Cộng</th>
                <th style="border: 1px solid #333; text-align: center;">Trừ</th>
                <th style="border: 1px solid #333; text-align: center;">Tổng</th>
                <th style="border: 1px solid #333;">Nội dung vi phạm / tuyên dương</th>
              </tr>
            </thead>
            <tbody id="reportTableBody"></tbody>
          </table>

          <!-- Notes & Suggestions by Leader -->
          <div style="margin: 1.5rem 0; padding: 1rem; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px;">
            <div style="font-weight: 700; margin-bottom: 0.5rem; color: #1e293b;">Ý kiến nhận xét của tổ trưởng:</div>
            <textarea id="repLeaderComment" rows="3" onchange="saveLeaderComment()" placeholder="Nhập ý kiến nhận xét của tổ trưởng gửi GVCN..." style="width: 100%; padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 6px; font-family: inherit; font-size: 0.85rem; box-sizing: border-box;"></textarea>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; text-align: center; margin-top: 3rem; font-weight: 700;">
            <div>
              <div>GIÁO VIÊN CHỦ NHIỆM</div>
              <div style="height: 60px;"></div>
              <div id="repTeacherSign">Nguyễn Văn Út</div>
            </div>
            <div>
              <div>TỔ TRƯỞNG LẬP BÁO CÁO</div>
              <div style="height: 60px;"></div>
              <div id="repLeaderSign">Trần Công Minh</div>
            </div>
          </div>
        </div>
      </section>

    </main>
  </div>

  <script>
    // Config defaults
    const DEFAULT_CONFIG = {
      className: '11A1',
      groupName: 'Tổ 3',
      leaderName: 'Trần Công Minh',
      teacherName: 'Nguyễn Văn Út',
      schoolYear: '2025 - 2026'
    };

    const INITIAL_MEMBERS = [
      { id: 'm1', stt: 1, name: 'TRẦN CÔNG MINH', gender: 'Nam', note: 'Tổ trưởng' },
      { id: 'm2', stt: 2, name: 'TỐNG NHẤT NAM', gender: 'Nam', note: 'Tổ phó' },
      { id: 'm3', stt: 3, name: 'NGUYỄN THỊ THANH THUỲ', gender: 'Nữ', note: '' },
      { id: 'm4', stt: 4, name: 'NGUYỄN TRẦN KHÁNH VY', gender: 'Nữ', note: '' },
      { id: 'm5', stt: 5, name: 'HÀ NGUYỄN TƯỜNG VY', gender: 'Nữ', note: '' },
      { id: 'm6', stt: 6, name: 'ĐẶNG THỊ TƯỜNG VY', gender: 'Nữ', note: '' }
    ];

    const CRITERIA = [
      { label: 'Đi học trễ', point: -0.25, group: '❌ Vi phạm' },
      { label: 'Không làm bài', point: -0.25, group: '❌ Vi phạm' },
      { label: 'Nói chuyện riêng', point: -0.25, group: '❌ Vi phạm' },
      { label: 'Vi phạm nội quy lớp', point: -0.25, group: '❌ Vi phạm' },
      { label: 'Ngôn từ tiêu cực', point: -0.25, group: '❌ Vi phạm' },
      { label: 'Khác (tổ trưởng ghi rõ lý do)', point: -0.25, group: '❌ Vi phạm' },
      { label: 'Có dấu hiệu cô lập bạn', point: -0.25, group: '⚠️ Nhắc nhở' },
      { label: 'Phát biểu xây dựng bài (đủ 5 lần)', point: 0.25, group: '✅ Tích cực' },
      { label: 'Giúp đỡ bạn học', point: 0.25, group: '✅ Tích cực' },
      { label: 'Làm sản phẩm học tập (video, bài viết...)', point: 0.25, group: '🌟 Nổi bật' },
      { label: 'Sáng tạo nội dung (âm nhạc, hình ảnh...)', point: 0.25, group: '🌟 Nổi bật' },
      { label: 'Được tuyên dương trong tuần', point: 0.25, group: '🎯 Cá nhân' }
    ];

    // State
    let config = JSON.parse(localStorage.getItem('to_config') || JSON.stringify(DEFAULT_CONFIG));
    let members = JSON.parse(localStorage.getItem('to_members') || JSON.stringify(INITIAL_MEMBERS));
    let behaviors = JSON.parse(localStorage.getItem('to_behaviors') || '[]');
    let attendance = JSON.parse(localStorage.getItem('to_attendance') || '[]');

    function saveState() {
      localStorage.setItem('to_config', JSON.stringify(config));
      localStorage.setItem('to_members', JSON.stringify(members));
      localStorage.setItem('to_behaviors', JSON.stringify(behaviors));
      localStorage.setItem('to_attendance', JSON.stringify(attendance));
    }

    function getToday() {
      const now = new Date();
      return now.toISOString().split('T')[0];
    }

    // Tab switching
    function switchTab(tabId) {
      document.querySelectorAll('.view-pane').forEach(el => el.classList.remove('active'));
      document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
      const target = document.getElementById('view-' + tabId);
      if (target) target.classList.add('active');
      event.target.classList.add('active');
      renderAll();
    }

    // Render Dashboard
    function renderDashboard() {
      document.getElementById('dashGreeting').innerText = 'Xin chào, tổ trưởng ' + config.leaderName;
      document.getElementById('dashSub').innerText = 'Theo dõi thi đua ' + config.groupName + ' — Lớp ' + config.className;
      document.getElementById('statMembersCount').innerText = members.length;

      let pos = 0, neg = 0;
      behaviors.forEach(b => {
        if (b.point > 0) pos += b.point;
        else if (b.point < 0) neg += Math.abs(b.point);
      });
      document.getElementById('statPosPoints').innerText = '+' + pos.toFixed(2);
      document.getElementById('statNegPoints').innerText = '-' + neg.toFixed(2);
      const net = pos - neg;
      const netEl = document.getElementById('statNetPoints');
      netEl.innerText = (net > 0 ? '+' : '') + net.toFixed(2);
      netEl.style.color = net > 0 ? 'var(--success)' : net < 0 ? 'var(--danger)' : 'var(--slate-800)';

      // Attention list
      const attMap = {};
      behaviors.filter(b => b.point < 0).forEach(b => {
        attMap[b.memberId] = (attMap[b.memberId] || 0) + 1;
      });
      const attentionIds = Object.keys(attMap);
      const attEl = document.getElementById('dashAttentionList');
      if (attentionIds.length === 0) {
        attEl.innerHTML = '<span style="color: var(--success); font-weight: 600;">✨ Toàn tổ chấp hành rất tốt, không có bạn nào bị trừ điểm!</span>';
      } else {
        attEl.innerHTML = attentionIds.map(id => {
          const m = members.find(x => x.id === id);
          return '<div style="padding: 0.4rem 0; border-bottom: 1px solid var(--slate-100);">• <strong>' + (m ? m.name : id) + '</strong> (' + attMap[id] + ' lần trừ điểm)</div>';
        }).join('');
      }
    }

    // Render Members
    function renderMembers() {
      const tbody = document.getElementById('membersTableBody');
      tbody.innerHTML = members.map(m => {
        const mBeh = behaviors.filter(b => b.memberId === m.id);
        const pos = mBeh.filter(b => b.point > 0).reduce((s, b) => s + b.point, 0);
        const neg = mBeh.filter(b => b.point < 0).reduce((s, b) => s + Math.abs(b.point), 0);
        const net = pos - neg;
        const status = net < 0 || neg >= 0.5 ? '<span class="badge badge-danger">Cần chú ý</span>' : '<span class="badge badge-success">Tốt</span>';

        return '<tr>' +
          '<td style="text-align: center;">' + m.stt + '</td>' +
          '<td><strong>' + m.name + '</strong>' + (m.note ? ' <span style="font-size:0.75rem; color:#888;">(' + m.note + ')</span>' : '') + '</td>' +
          '<td style="text-align: center;">' + m.gender + '</td>' +
          '<td style="text-align: center; color: var(--success); font-weight: bold;">+' + pos.toFixed(2) + '</td>' +
          '<td style="text-align: center; color: var(--danger); font-weight: bold;">-' + neg.toFixed(2) + '</td>' +
          '<td style="text-align: center; font-weight: bold;">' + (net > 0 ? '+' : '') + net.toFixed(2) + '</td>' +
          '<td style="text-align: center;">' + status + '</td>' +
          '<td style="text-align: right;"><button class="btn btn-outline" style="padding: 0.2rem 0.5rem;" onclick="deleteMember(\\'' + m.id + '\\')">Xóa</button></td>' +
          '</tr>';
      }).join('');
    }

    function promptImportMembers() {
      const text = prompt('Dán danh sách học sinh (từ Word, PDF hoặc Excel) vào đây:\\n(Ví dụ: 1. NGUYỄN VĂN A - Nam - Tổ trưởng)');
      if (!text) return;
      const lines = text.split('\\n').map(l => l.trim()).filter(l => l.length >= 2);
      let count = 0;
      lines.forEach(l => {
        const upper = l.toUpperCase();
        if (upper.includes('DANH SÁCH') || upper.includes('HỌ VÀ TÊN') || upper.includes('STT')) return;
        let name = l;
        let gender = 'Nam';
        let note = '';
        if (l.includes(' - ')) {
          const parts = l.split(' - ').map(p => p.trim());
          name = parts[0];
          if (parts[1] && (parts[1].toLowerCase().includes('nữ') || parts[1].toLowerCase().includes('nu'))) gender = 'Nữ';
          note = parts.slice(2).join(', ');
        } else if (l.toLowerCase().includes('nữ') || l.toLowerCase().includes('nu')) {
          gender = 'Nữ';
        }
        name = name.replace(/^(\\d+)[\\.\\s\\-\\:\\)]+\\s*/, '').trim().toUpperCase();
        if (name.length >= 2) {
          members.push({
            id: 'm_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            stt: members.length + 1,
            name: name,
            gender: gender,
            note: note
          });
          count++;
        }
      });
      if (count > 0) {
        saveState();
        renderAll();
        alert('Đã nhập thành công ' + count + ' học sinh vào danh sách tổ!');
      } else {
        alert('Không nhận diện được học sinh nào từ văn bản đã dán.');
      }
    }

    function promptAddMember() {
      const name = prompt('Nhập họ và tên học sinh:');
      if (!name) return;
      const gender = confirm('Học sinh là Nam? (Chọn OK: Nam, Cancel: Nữ)') ? 'Nam' : 'Nữ';
      members.push({
        id: 'm_' + Date.now(),
        stt: members.length + 1,
        name: name.trim().toUpperCase(),
        gender: gender,
        note: ''
      });
      saveState();
      renderAll();
    }

    function deleteMember(id) {
      if (confirm('Xác nhận xóa thành viên này khỏi tổ?')) {
        members = members.filter(m => m.id !== id);
        saveState();
        renderAll();
      }
    }

    // Render Attendance
    function renderAttendance() {
      const date = document.getElementById('attDateInput').value || getToday();
      const container = document.getElementById('attTableContainer');
      const dateRecords = attendance.filter(a => a.date === date);

      let html = '<table><thead><tr><th>STT</th><th>Họ và tên</th><th>Trạng thái chuyên cần</th></tr></thead><tbody>';
      html += members.map(m => {
        const rec = dateRecords.find(a => a.memberId === m.id);
        const status = rec ? rec.status : 'present';

        return '<tr>' +
          '<td style="width: 40px; text-align: center;">' + m.stt + '</td>' +
          '<td><strong>' + m.name + '</strong></td>' +
          '<td><div class="att-btn-group">' +
            '<button type="button" class="att-toggle ' + (status === 'present' ? 'active-present' : '') + '" onclick="setAtt(\\'' + m.id + '\\', \\'present\\')">Có mặt</button>' +
            '<button type="button" class="att-toggle ' + (status === 'absent_excused' ? 'active-absent-cp' : '') + '" onclick="setAtt(\\'' + m.id + '\\', \\'absent_excused\\')">Vắng CP</button>' +
            '<button type="button" class="att-toggle ' + (status === 'absent_unexcused' ? 'active-absent-kp' : '') + '" onclick="setAtt(\\'' + m.id + '\\', \\'absent_unexcused\\')">Vắng KP</button>' +
            '<button type="button" class="att-toggle ' + (status === 'late' ? 'active-late' : '') + '" onclick="setAtt(\\'' + m.id + '\\', \\'late\\')">Đi trễ</button>' +
          '</div></td>' +
          '</tr>';
      }).join('');
      html += '</tbody></table>';
      container.innerHTML = html;
    }

    function setAtt(memberId, status) {
      const date = document.getElementById('attDateInput').value || getToday();
      let rec = attendance.find(a => a.date === date && a.memberId === memberId);
      if (rec) {
        rec.status = status;
      } else {
        attendance.push({ date, memberId, status });
      }
      saveState();
      renderAttendance();
    }

    function markAllPresent() {
      const date = document.getElementById('attDateInput').value || getToday();
      members.forEach(m => {
        let rec = attendance.find(a => a.date === date && a.memberId === m.id);
        if (rec) rec.status = 'present';
        else attendance.push({ date, memberId: m.id, status: 'present' });
      });
      saveState();
      renderAttendance();
    }

    function saveAttendance() {
      alert('Đã lưu điểm danh thành công!');
    }

    // Render Behavior Form & Options
    function initBehaviorForm() {
      const studentSel = document.getElementById('behStudentSelect');
      studentSel.innerHTML = members.map(m => '<option value="' + m.id + '">' + m.stt + '. ' + m.name + '</option>').join('');

      const critSel = document.getElementById('behCritSelect');
      critSel.innerHTML = CRITERIA.map((c, i) => '<option value="' + i + '">' + c.group + ': ' + c.label + ' (' + (c.point > 0 ? '+' : '') + c.point + 'đ)</option>').join('');

      document.getElementById('behDateInput').value = getToday();
      document.getElementById('attDateInput').value = getToday();
      updateCritPoint();
    }

    function updateCritPoint() {
      const idx = document.getElementById('behCritSelect').value;
      const crit = CRITERIA[idx];
      if (crit) {
        document.getElementById('behPointInput').value = crit.point;
      }
    }

    function handleSaveBehavior(e) {
      e.preventDefault();
      const memberId = document.getElementById('behStudentSelect').value;
      const critIdx = document.getElementById('behCritSelect').value;
      const crit = CRITERIA[critIdx];
      const point = parseFloat(document.getElementById('behPointInput').value) || 0;
      const date = document.getElementById('behDateInput').value;
      const note = document.getElementById('behNoteInput').value;

      behaviors.unshift({
        id: 'beh_' + Date.now(),
        memberId,
        date,
        label: crit.label,
        group: crit.group,
        point,
        note,
        recordedBy: config.leaderName
      });

      saveState();
      alert('Đã ghi nhận thành công!');
      document.getElementById('behNoteInput').value = '';
      renderAll();
    }

    // Scoreboard
    function renderScoreboard() {
      const tbody = document.getElementById('scoreboardTableBody');
      const list = members.map(m => {
        const mBeh = behaviors.filter(b => b.memberId === m.id);
        const pos = mBeh.filter(b => b.point > 0).reduce((s, b) => s + b.point, 0);
        const neg = mBeh.filter(b => b.point < 0).reduce((s, b) => s + Math.abs(b.point), 0);
        const net = pos - neg;
        return { m, pos, neg, net };
      }).sort((a, b) => b.net - a.net);

      tbody.innerHTML = list.map(item => {
        return '<tr>' +
          '<td style="text-align:center;">' + item.m.stt + '</td>' +
          '<td><strong>' + item.m.name + '</strong></td>' +
          '<td style="text-align:center; color:var(--success); font-weight:bold;">+' + item.pos.toFixed(2) + '</td>' +
          '<td style="text-align:center; color:var(--danger); font-weight:bold;">-' + item.neg.toFixed(2) + '</td>' +
          '<td style="text-align:center; font-weight:bold;">' + (item.net > 0 ? '+' : '') + item.net.toFixed(2) + '</td>' +
          '<td style="text-align:center;">' + (item.net >= 0.5 ? '<span class="badge badge-success">Xuất sắc</span>' : item.net >= 0 ? '<span class="badge badge-success">Tốt</span>' : '<span class="badge badge-danger">Cần cố gắng</span>') + '</td>' +
          '</tr>';
      }).join('');
    }

    // History
    function renderHistory() {
      const tbody = document.getElementById('historyTableBody');
      tbody.innerHTML = behaviors.map(b => {
        const m = members.find(x => x.id === b.memberId);
        return '<tr>' +
          '<td>' + b.date + '</td>' +
          '<td><strong>' + (m ? m.name : b.memberId) + '</strong></td>' +
          '<td>' + b.label + (b.note ? ' <em>(' + b.note + ')</em>' : '') + '</td>' +
          '<td style="text-align:center; font-weight:bold; color:' + (b.point > 0 ? 'var(--success)' : 'var(--danger)') + '">' + (b.point > 0 ? '+' : '') + b.point + '</td>' +
          '<td>' + b.recordedBy + '</td>' +
          '<td style="text-align:right;"><button class="btn btn-outline" style="padding: 0.2rem 0.5rem;" onclick="deleteBehavior(\\'' + b.id + '\\')">Xóa</button></td>' +
          '</tr>';
      }).join('');
    }

    function deleteBehavior(id) {
      if (confirm('Xóa lượt ghi nhận này?')) {
        behaviors = behaviors.filter(b => b.id !== id);
        saveState();
        renderAll();
      }
    }

    // Report
    function renderReport() {
      document.getElementById('repClassTitle').innerText = 'LỚP ' + config.className + ' — ' + config.groupName.toUpperCase();
      document.getElementById('repTeacherSign').innerText = config.teacherName;
      document.getElementById('repLeaderSign').innerText = config.leaderName;

      const savedComment = localStorage.getItem('rep_leader_comment');
      const commentEl = document.getElementById('repLeaderComment');
      if (commentEl) {
        commentEl.value = savedComment !== null ? savedComment : '- Nhìn chung tuần qua các thành viên trong ' + config.groupName + ' duy trì tốt nề nếp học tập và kỷ luật lớp.';
      }

      const tbody = document.getElementById('reportTableBody');
      tbody.innerHTML = members.map(m => {
        const mBeh = behaviors.filter(b => b.memberId === m.id);
        const pos = mBeh.filter(b => b.point > 0).reduce((s, b) => s + b.point, 0);
        const neg = mBeh.filter(b => b.point < 0).reduce((s, b) => s + Math.abs(b.point), 0);
        const net = pos - neg;
        const details = mBeh.map(b => b.label).join(', ') || 'Chấp hành tốt';

        return '<tr>' +
          '<td style="border:1px solid #333; text-align:center;">' + m.stt + '</td>' +
          '<td style="border:1px solid #333; font-weight:bold;">' + m.name + '</td>' +
          '<td style="border:1px solid #333; text-align:center;">+' + pos.toFixed(2) + '</td>' +
          '<td style="border:1px solid #333; text-align:center;">-' + neg.toFixed(2) + '</td>' +
          '<td style="border:1px solid #333; text-align:center; font-weight:bold;">' + (net > 0 ? '+' : '') + net.toFixed(2) + '</td>' +
          '<td style="border:1px solid #333; font-size:0.75rem;">' + details + '</td>' +
          '</tr>';
      }).join('');
    }

    function saveLeaderComment() {
      const commentEl = document.getElementById('repLeaderComment');
      if (commentEl) {
        localStorage.setItem('rep_leader_comment', commentEl.value);
      }
    }

    function resetToDemoConfirm() {
      if (confirm('Khôi phục toàn bộ dữ liệu mẫu ban đầu?')) {
        config = { ...DEFAULT_CONFIG };
        members = [ ...INITIAL_MEMBERS ];
        behaviors = [];
        attendance = [];
        saveState();
        renderAll();
      }
    }

    function renderAll() {
      renderDashboard();
      renderMembers();
      renderAttendance();
      renderScoreboard();
      renderHistory();
      renderReport();
    }

    // Init
    initBehaviorForm();
    renderAll();
  </script>
</body>
</html>`;
}

export function downloadStandaloneHtmlFile(): void {
  const content = generateStandaloneHtml();
  const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'QUAN_LY_TO_11A1_OFFLINE.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
