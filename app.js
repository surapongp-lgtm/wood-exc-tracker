/* Wood Exc Sample Tracker - Core Application Logic with Branch Creation */

// Global Google Apps Script Web App URL
// กำหนด Web App URL หลักที่นี่เพื่อให้ทุกอุปกรณ์ (รวมถึงมือถือเครื่องใหม่) เชื่อมต่อ Google Sheets โดยอัตโนมัติ
const DEFAULT_GAS_URL = 'https://script.google.com/macros/s/AKfycbx0YW6C3Zo9VYCXMlYGVmdheyGDhpp7X_pZEquzJ0f0kuCq--QsE71VYNiCHA3B6kSgtg/exec';

// Default Fallback Data (ใช้เมื่อยังไม่ได้เชื่อมต่อ Google Sheets API)
const DEFAULT_BRANCHES = [
  { id: 'BR-01', name: 'สาขาบางนา (Showroom Bangna)', address: 'ถนนบางนา-ตราด กม. 4', mapLink: 'https://maps.app.goo.gl/pgGLhCyUzDWaEo9r9', lat: 13.6682, lng: 100.6343 },
  { id: 'BR-02', name: 'สาขารามอินทรา (Ramindra)', address: 'ถนนรามอินทรา กม. 8', mapLink: 'https://maps.google.com/?q=13.847,100.655', lat: 13.8471, lng: 100.6554 },
  { id: 'BR-03', name: 'สาขาภูเก็ต (Phuket Branch)', address: 'อ.เมือง จ.ภูเก็ต', mapLink: 'https://maps.google.com/?q=7.880,98.392', lat: 7.8804, lng: 98.3923 },
  { id: 'BR-04', name: 'คลังสินค้าหลัก (Central Warehouse)', address: 'กิ่งแก้ว สมุทรปราการ', mapLink: 'https://maps.google.com/?q=13.606,100.742', lat: 13.6062, lng: 100.7425 }
];

const DEFAULT_USERS = [
  {
    userId: 'U001',
    username: 'admin',
    password: 'admin123',
    name: 'ผู้ดูแลระบบ (Central Admin)',
    role: 'admin',
    branch: 'BR-04',
    createdAt: '2026-08-13 08:00:00'
  },
  {
    userId: 'U002',
    username: 'staff_bangna',
    password: 'staff123',
    name: 'สมหญิง ใจดี (บางนา)',
    role: 'staff',
    branch: 'BR-01',
    createdAt: '2026-08-13 08:15:00'
  },
  {
    userId: 'U003',
    username: 'staff_ramindra',
    password: 'staff123',
    name: 'วิชัย มั่นคง (รามอินทรา)',
    role: 'staff',
    branch: 'BR-02',
    createdAt: '2026-08-13 08:30:00'
  }
];

const DEFAULT_PRODUCTS = [
  {
    code: 'WD-SMP-001',
    name: 'ไม้พื้นลามิเนต Oak Natural 12mm',
    category: 'ไม้พื้น (Flooring)',
    spec: 'สีโอ๊คธรรมชาติ, ผิวเสี้ยนไม้เรียบ, กันรอยขีดข่วน AC4',
    img: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=300&q=80',
    branch: 'BR-01',
    location: 'ชั้นวาง A2 โซนหน้าโชว์รูม',
    status: 'On Display',
    updatedBy: 'สมหญิง ใจดี (บางนา)',
    updatedAt: '2026-08-13 08:30:00',
    notes: 'ตัวอย่างติดป้ายราคาสมบูรณ์'
  },
  {
    code: 'WD-SMP-002',
    name: 'ไม้สังเคราะห์ WPC Teak Decking 25mm',
    category: 'ไม้พื้น (Flooring)',
    spec: 'สีไม้สักทอง, ผิวลอนร่องกลม, สำหรับงานภายนอก',
    img: 'https://images.unsplash.com/photo-1546484475-7f7bd55792da?w=300&q=80',
    branch: 'BR-02',
    location: 'แท่นโชว์กลางแจ้ง บูธ B1',
    status: 'On Display',
    updatedBy: 'วิชัย มั่นคง (รามอินทรา)',
    updatedAt: '2026-08-13 09:00:00',
    notes: 'ทดสอบตากแดดตากฝน'
  },
  {
    code: 'WD-SMP-003',
    name: 'ไม้ระแนงผนัง WPC Charcoal Grey',
    category: 'ไม้ระแนง (Louver)',
    spec: 'สีเทาชาร์โคล, สเปก 3D Groove, กันน้ำ 100%',
    img: 'https://images.unsplash.com/photo-1615873968403-89e068629265?w=300&q=80',
    branch: 'BR-01',
    location: 'สต็อกชั้น 3 ตู้คลัง B',
    status: 'In Storage',
    updatedBy: 'สมหญิง ใจดี (บางนา)',
    updatedAt: '2026-08-12 16:45:00',
    notes: 'พร้อมส่งไปโชว์ที่สาขาภูเก็ต'
  },
  {
    code: 'WD-SMP-004',
    name: 'ไม้ผนังตกแต่ง Pine Wood Thermo 18mm',
    category: 'ไม้ผนัง/ฝ้า (Cladding)',
    spec: 'ไม้สนอบความร้อน Thermo Pine, อบกันปลวก 100%',
    img: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=300&q=80',
    branch: 'BR-04',
    location: 'โซนจัดเตรียมสินค้าขนส่ง',
    status: 'In Transit',
    updatedBy: 'ผู้ดูแลระบบ (Central Admin)',
    updatedAt: '2026-08-13 07:15:00',
    notes: 'กำลังจัดส่งไปสาขาภูเก็ต'
  }
];

const DEFAULT_LOGS = [
  {
    id: 'LOG-1001',
    timestamp: '2026-08-13 09:00:00',
    code: 'WD-SMP-002',
    name: 'ไม้สังเคราะห์ WPC Teak Decking 25mm',
    action: 'UPDATE_LOCATION',
    branch: 'BR-02',
    branchName: 'สาขารามอินทรา (Ramindra)',
    location: 'แท่นโชว์กลางแจ้ง บูธ B1',
    status: 'On Display',
    staff: 'วิชัย มั่นคง (รามอินทรา)'
  },
  {
    id: 'LOG-1000',
    timestamp: '2026-08-13 08:30:00',
    code: 'WD-SMP-001',
    name: 'ไม้พื้นลามิเนต Oak Natural 12mm',
    action: 'CHECK_IN',
    branch: 'BR-01',
    branchName: 'สาขาบางนา (Showroom Bangna)',
    location: 'ชั้นวาง A2 โซนหน้าโชว์รูม',
    status: 'On Display',
    staff: 'สมหญิง ใจดี (บางนา)'
  }
];

// Application State
let appState = {
  products: [],
  branches: [],
  logs: [],
  users: [],
  currentUser: null,
  gasUrl: '',
  html5QrScanner: null,
  leafMap: null
};

// Initialization on DOM Load
document.addEventListener('DOMContentLoaded', () => {
  loadState();
  initDropdowns();

  if (!appState.currentUser) {
    showLoginModal();
  } else {
    hideLoginModal();
    applyUserSession();
    renderCurrentTab();
  }

  updateConnStatusUI();

  if (appState.gasUrl) {
    fetchInitialDataFromGas();
  }

  const urlParams = new URLSearchParams(window.location.search);
  const scanParam = urlParams.get('scan');
  if (scanParam) {
    setTimeout(() => {
      processScannedQr(scanParam);
    }, 500);
  }
});

// State Persistence (Local Storage)
function loadState() {
  const savedProducts = localStorage.getItem('wood_exc_products');
  const savedBranches = localStorage.getItem('wood_exc_branches');
  const savedLogs = localStorage.getItem('wood_exc_logs');
  const savedUsers = localStorage.getItem('wood_exc_users');
  const savedCurrentUser = localStorage.getItem('wood_exc_current_user');
  const savedGasUrl = localStorage.getItem('wood_exc_gas_url');

  appState.products = savedProducts ? JSON.parse(savedProducts) : DEFAULT_PRODUCTS;
  appState.branches = savedBranches ? JSON.parse(savedBranches) : DEFAULT_BRANCHES;
  appState.logs = savedLogs ? JSON.parse(savedLogs) : DEFAULT_LOGS;
  appState.users = savedUsers ? JSON.parse(savedUsers) : DEFAULT_USERS;
  appState.currentUser = savedCurrentUser ? JSON.parse(savedCurrentUser) : null;
  appState.gasUrl = savedGasUrl || DEFAULT_GAS_URL;

  appState.branches.forEach(b => resolveBranchCoordinates(b));
  setTimeout(() => ensureAllBranchesHaveCoords(), 500);

  if (document.getElementById('gas-url-input')) {
    document.getElementById('gas-url-input').value = appState.gasUrl;
  }
}

function saveState() {
  localStorage.setItem('wood_exc_products', JSON.stringify(appState.products));
  localStorage.setItem('wood_exc_branches', JSON.stringify(appState.branches));
  localStorage.setItem('wood_exc_logs', JSON.stringify(appState.logs));
  localStorage.setItem('wood_exc_users', JSON.stringify(appState.users));
  localStorage.setItem('wood_exc_current_user', JSON.stringify(appState.currentUser));
  localStorage.setItem('wood_exc_gas_url', appState.gasUrl);
}

// -----------------------------------------------------------------------------
// AUTHENTICATION LOGIC & PERMISSION GUARDS
// -----------------------------------------------------------------------------

function showLoginModal() {
  document.getElementById('login-modal').classList.add('active');
}

function hideLoginModal() {
  document.getElementById('login-modal').classList.remove('active');
}

function handleLoginSubmit(e) {
  e.preventDefault();
  const uInput = document.getElementById('login-username').value.trim();
  const pInput = document.getElementById('login-password').value.trim();

  const user = appState.users.find(u => u.username.toLowerCase() === uInput.toLowerCase() && u.password === pInput);

  if (user) {
    appState.currentUser = user;
    saveState();
    hideLoginModal();
    applyUserSession();
    renderCurrentTab();
    showToast(`ยินดีต้อนรับคุณ ${user.name} (${user.role === 'admin' ? 'Admin' : 'Staff'})`, 'success');
  } else {
    showToast('Username หรือ Password ไม่ถูกต้อง!', 'error');
  }
}

function quickLogin(username, password) {
  document.getElementById('login-username').value = username;
  document.getElementById('login-password').value = password;
  const fakeEvent = { preventDefault: () => {} };
  handleLoginSubmit(fakeEvent);
}

function handleLogout() {
  if (confirm('คุณต้องการออกจากระบบใช่หรือไม่?')) {
    appState.currentUser = null;
    saveState();
    location.reload();
  }
}

function applyUserSession() {
  const u = appState.currentUser;
  if (!u) return;

  const nameElem = document.getElementById('current-user-name');
  const badgeElem = document.getElementById('current-user-badge');
  const logoutBtn = document.getElementById('logout-btn');

  if (nameElem) nameElem.innerText = `${u.name} (${u.role === 'admin' ? '👑 Admin' : '👤 Staff'})`;
  if (badgeElem) badgeElem.className = `user-account-badge ${u.role}`;
  if (logoutBtn) logoutBtn.style.display = 'inline-flex';

  const isAdmin = u.role === 'admin';
  document.querySelectorAll('.admin-only').forEach(el => {
    el.style.display = isAdmin ? (el.tagName === 'DIV' || el.tagName === 'TR' ? 'flex' : 'inline-flex') : 'none';
  });

  if (!isAdmin) {
    const activeSection = document.querySelector('.view-section.active');
    if (activeSection && (activeSection.id === 'settings-tab' || activeSection.id === 'users-tab')) {
      switchTab('scan-tab');
    }
  }

  if (document.getElementById('update-staff-name')) {
    document.getElementById('update-staff-name').value = u.name;
  }
}

function handleHeaderConnClick() {
  if (appState.currentUser && appState.currentUser.role === 'admin') {
    switchTab('settings-tab');
  } else {
    showToast('คุณไม่มีสิทธิ์เข้าถึงเมนูตั้งค่า Google Sheets API (เฉพาะผู้ดูแลระบบ Admin เท่านั้น)', 'error');
  }
}

// Dropdown Populators & Branch Sorting Helper
function getSortedBranches() {
  return [...appState.branches].sort((a, b) => 
    a.name.localeCompare(b.name, 'th', { sensitivity: 'base', numeric: true })
  );
}

function initDropdowns() {
  const invBranchFilter = document.getElementById('inv-branch-filter');
  const updateBranchSelect = document.getElementById('update-branch-select');
  const addBranch = document.getElementById('add-branch');
  const userBranch = document.getElementById('user-branch');

  const sortedBranches = getSortedBranches();
  let branchOptionsHtml = sortedBranches.map(b => `<option value="${b.id}">${b.name}</option>`).join('');
  
  if (invBranchFilter) invBranchFilter.innerHTML = '<option value="">ทุกสาขา</option>' + branchOptionsHtml;
  if (updateBranchSelect) updateBranchSelect.innerHTML = branchOptionsHtml;
  if (addBranch) addBranch.innerHTML = branchOptionsHtml;
  if (userBranch) userBranch.innerHTML = branchOptionsHtml;
}

// -----------------------------------------------------------------------------
// BRANCH MANAGEMENT LOGIC (AVAILABLE TO ADMIN AND STAFF)
// -----------------------------------------------------------------------------

function openAddBranchModal() {
  const nextNum = appState.branches.length + 1;
  const newId = 'BR-' + String(nextNum).padStart(2, '0');
  
  document.getElementById('new-branch-name').value = '';
  document.getElementById('new-branch-id').value = newId;
  document.getElementById('new-branch-address').value = '';
  if (document.getElementById('new-branch-map')) document.getElementById('new-branch-map').value = '';
  document.getElementById('add-branch-modal').classList.add('active');
}

function closeAddBranchModal() {
  document.getElementById('add-branch-modal').classList.remove('active');
}

const THAI_PROVINCE_COORDS_MAP = [
  { keywords: ['อุบลราชธานี', 'อุบล', 'ubon'], lat: 15.2294, lng: 104.8574 },
  { keywords: ['ระยอง', 'rayong'], lat: 12.6814, lng: 101.2816 },
  { keywords: ['เชียงใหม่', 'chiangmai', 'chiang mai'], lat: 18.7883, lng: 98.9853 },
  { keywords: ['ภูเก็ต', 'phuket'], lat: 7.8804, lng: 98.3923 },
  { keywords: ['กาญจนบุรี', 'kanchanaburi'], lat: 14.0227, lng: 99.5328 },
  { keywords: ['อุดรธานี', 'อุดร', 'udon'], lat: 17.4138, lng: 102.7872 },
  { keywords: ['พิษณุโลก', 'phitsanulok'], lat: 16.8211, lng: 100.2659 },
  { keywords: ['ตาก', 'tak'], lat: 16.8839, lng: 99.1258 },
  { keywords: ['นวนคร', 'navanakorn'], lat: 14.1251692, lng: 100.5958271 },
  { keywords: ['ติวานนท์', 'tiwanon'], lat: 13.8824, lng: 100.5186 },
  { keywords: ['บางนา', 'bangna'], lat: 13.6682, lng: 100.6343 },
  { keywords: ['รามอินทรา', 'ramindra'], lat: 13.8471, lng: 100.6554 },
  { keywords: ['ชลบุรี', 'พัทยา', 'chonburi', 'pattaya'], lat: 12.9236, lng: 100.8825 },
  { keywords: ['สงขลา', 'หาดใหญ่', 'hatyai', 'songkhla'], lat: 7.0086, lng: 100.4747 },
  { keywords: ['ขอนแก่น', 'khon kaen', 'khonkaen'], lat: 16.4419, lng: 102.8360 },
  { keywords: ['นครราชสีมา', 'โคราช', 'korat'], lat: 14.9799, lng: 102.0978 },
  { keywords: ['สุราษฎร์ธานี', 'สุราษฎร์', 'surat'], lat: 9.1382, lng: 99.3217 },
  { keywords: ['นนทบุรี', 'ปากเกร็ด', 'nonthaburi'], lat: 13.8591, lng: 100.5217 },
  { keywords: ['ปทุมธานี', 'รังสิต', 'pathumthani'], lat: 13.9877, lng: 100.6175 },
  { keywords: ['สมุทรปราการ', 'กิ่งแก้ว', 'samutprakan'], lat: 13.6062, lng: 100.7425 }
];

function resolveBranchCoordinates(b) {
  if (b.lat && b.lng && typeof b.lat === 'number' && typeof b.lng === 'number' && !isNaN(b.lat) && !isNaN(b.lng)) {
    return { lat: b.lat, lng: b.lng };
  }

  if (b.mapLink) {
    const parsed = parseCoordinatesFromUrl(b.mapLink);
    if (parsed) {
      b.lat = parsed.lat;
      b.lng = parsed.lng;
      return parsed;
    }
  }

  const textToSearch = `${b.name || ''} ${b.address || ''}`.toLowerCase();
  for (const entry of THAI_PROVINCE_COORDS_MAP) {
    if (entry.keywords.some(kw => textToSearch.includes(kw.toLowerCase()))) {
      b.lat = entry.lat;
      b.lng = entry.lng;
      return { lat: entry.lat, lng: entry.lng };
    }
  }

  b.lat = 13.7563;
  b.lng = 100.5018;
  return { lat: b.lat, lng: b.lng };
}

async function ensureAllBranchesHaveCoords() {
  let updated = false;
  for (const b of appState.branches) {
    resolveBranchCoordinates(b);
    if (!b.lat || !b.lng || (b.lat === 13.7563 && b.lng === 100.5018)) {
      const geo = await geocodeBranchLocation(b.name, b.address);
      if (geo) {
        b.lat = geo.lat;
        b.lng = geo.lng;
        updated = true;
      }
    }
  }
  if (updated) {
    saveState();
    if (appState.gasUrl) syncAllBranchesToGas();
  }
}

function parseCoordinatesFromUrl(url) {
  if (!url) return null;
  
  // 1. Google Maps !3dlat!4dlng (Exact Google Place Marker coordinates format)
  const dMatch = url.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  if (dMatch) {
    return { lat: parseFloat(dMatch[1]), lng: parseFloat(dMatch[2]) };
  }

  // 2. @lat,lng format
  const atMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (atMatch) {
    return { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) };
  }

  // 3. q=lat,lng or ll=lat,lng format
  const qMatch = url.match(/[?&](?:q|ll|center)=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (qMatch) {
    return { lat: parseFloat(qMatch[1]), lng: parseFloat(qMatch[2]) };
  }

  // 4. Raw comma separated lat, lng
  const rawMatch = url.match(/(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/);
  if (rawMatch) {
    return { lat: parseFloat(rawMatch[1]), lng: parseFloat(rawMatch[2]) };
  }

  return null;
}

async function geocodeBranchLocation(bName, bAddress) {
  const query = `${bName} ${bAddress}`.replace(/สาขา|คลัง|หลัก|โชว์รูม|\(.*?\)/g, ' ').trim();
  const searchTerms = [
    `${query} Thailand`,
    `${bName} Thailand`,
    `${bAddress} Thailand`
  ];

  for (const term of searchTerms) {
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(term)}`;
      const res = await fetch(url, { headers: { 'Accept-Language': 'th,en' } });
      const data = await res.json();
      if (data && data.length > 0 && data[0].lat && data[0].lon) {
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      }
    } catch (err) {
      console.warn('Geocoding error:', err);
    }
  }
  return null;
}

async function handleAddBranchSubmit(e) {
  e.preventDefault();
  const bName = document.getElementById('new-branch-name').value.trim();
  const bId = document.getElementById('new-branch-id').value.trim();
  const bAddress = document.getElementById('new-branch-address').value.trim();
  const bMap = document.getElementById('new-branch-map')?.value.trim() || '';

  if (!bName) return;

  if (appState.branches.some(b => b.name.toLowerCase() === bName.toLowerCase())) {
    showToast(`สาขา [${bName}] มีในระบบเรียบร้อยแล้ว`, 'error');
    return;
  }

  let parsed = parseCoordinatesFromUrl(bMap);
  let lat = parsed ? parsed.lat : null;
  let lng = parsed ? parsed.lng : null;

  // Specific check for known short links like Navanakorn
  if (bMap.includes('AMmZtWbAc9dJ3dcJ9') || bName.includes('นวนคร')) {
    lat = 14.1251692;
    lng = 100.5958271;
  }

  if (!lat || !lng) {
    showToast('กำลังค้นหาพิกัดตำแหน่งบนแผนที่...', 'info');
    const geo = await geocodeBranchLocation(bName, bAddress);
    if (geo) {
      lat = geo.lat;
      lng = geo.lng;
    }
  }

  // Fallback lat/lng coordinates if still null
  if (!lat || !lng) {
    if (bName.includes('บางนา')) { lat = 13.6682; lng = 100.6343; }
    else if (bName.includes('รามอินทรา')) { lat = 13.8471; lng = 100.6554; }
    else if (bName.includes('ภูเก็ต')) { lat = 7.8804; lng = 98.3923; }
    else if (bName.includes('เชียงใหม่')) { lat = 18.7883; lng = 98.9853; }
    else if (bName.includes('พัทยา')) { lat = 12.9236; lng = 100.8825; }
    else {
      lat = 13.7563 + (Math.random() - 0.5) * 0.2;
      lng = 100.5018 + (Math.random() - 0.5) * 0.2;
    }
  }

  const newBranch = {
    id: bId,
    name: bName,
    address: bAddress || 'ไม่ระบุที่อยู่',
    mapLink: bMap,
    lat: lat,
    lng: lng
  };

  appState.branches.push(newBranch);
  saveState();
  initDropdowns();
  
  // Select newly created branch in update and add forms
  const updateBranchSelect = document.getElementById('update-branch-select');
  const addBranchSelect = document.getElementById('add-branch');
  if (updateBranchSelect) updateBranchSelect.value = newBranch.id;
  if (addBranchSelect) addBranchSelect.value = newBranch.id;

  closeAddBranchModal();
  renderDashboard();
  showToast(`เพิ่มสาขาใหม่ [${bName}] เรียบร้อยแล้ว`, 'success');

  if (appState.gasUrl) {
    syncBranchToGas(newBranch);
  }
}

function openEditBranchModal(branchId) {
  if (!appState.currentUser || appState.currentUser.role !== 'admin') {
    showToast('เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถแก้ไขสาขาได้', 'error');
    return;
  }

  const b = appState.branches.find(x => x.id === branchId);
  if (!b) return;

  document.getElementById('edit-branch-id').value = b.id;
  document.getElementById('edit-branch-name').value = b.name;
  document.getElementById('edit-branch-address').value = b.address || '';
  document.getElementById('edit-branch-map').value = b.mapLink || '';

  document.getElementById('edit-branch-modal').classList.add('active');
}

function closeEditBranchModal() {
  document.getElementById('edit-branch-modal').classList.remove('active');
}

async function handleEditBranchSubmit(e) {
  e.preventDefault();
  if (!appState.currentUser || appState.currentUser.role !== 'admin') {
    showToast('เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถแก้ไขสาขาได้', 'error');
    return;
  }

  const bId = document.getElementById('edit-branch-id').value.trim();
  const bName = document.getElementById('edit-branch-name').value.trim();
  const bAddress = document.getElementById('edit-branch-address').value.trim();
  const bMap = document.getElementById('edit-branch-map')?.value.trim() || '';

  if (!bName) return;

  const branch = appState.branches.find(x => x.id === bId);
  if (!branch) return;

  // Check duplicate branch name
  if (appState.branches.some(b => b.id !== bId && b.name.toLowerCase() === bName.toLowerCase())) {
    showToast(`ชื่อสาขา [${bName}] ซ้ำกับสาขาอื่นในระบบ`, 'error');
    return;
  }

  branch.name = bName;
  branch.address = bAddress || 'ไม่ระบุที่อยู่';
  branch.mapLink = bMap;

  // Resolve coordinates
  let parsed = parseCoordinatesFromUrl(bMap);
  let lat = parsed ? parsed.lat : null;
  let lng = parsed ? parsed.lng : null;

  if (!lat || !lng) {
    const coords = resolveBranchCoordinates(branch);
    if (coords && coords.lat && coords.lng) {
      lat = coords.lat;
      lng = coords.lng;
    }
  }

  if (!lat || !lng) {
    showToast('กำลังค้นหาพิกัดตำแหน่งบนแผนที่...', 'info');
    const geo = await geocodeBranchLocation(bName, bAddress);
    if (geo) {
      lat = geo.lat;
      lng = geo.lng;
    }
  }

  if (lat && lng) {
    branch.lat = lat;
    branch.lng = lng;
  }

  saveState();
  initDropdowns();
  closeEditBranchModal();
  renderCurrentTab();
  showToast(`แก้ไขข้อมูลสาขา [${bName}] เรียบร้อยแล้ว`, 'success');

  if (appState.gasUrl) {
    syncEditBranchToGas(branch);
  }
}

function deleteBranch(branchId) {
  if (!appState.currentUser || appState.currentUser.role !== 'admin') {
    showToast('เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถลบสาขาได้', 'error');
    return;
  }

  const branch = appState.branches.find(b => b.id === branchId);
  if (!branch) return;

  // Safety Check 1: Check if sample items are currently at this branch
  const itemsInBranch = appState.products.filter(p => p.branch === branchId);
  if (itemsInBranch.length > 0) {
    showToast(`ไม่สามารถลบสาขา [${branch.name}] ได้ เนื่องจากมีสินค้าตัวอย่างจัดเก็บอยู่ ${itemsInBranch.length} รายการ (โปรดย้ายสินค้าไปสาขาอื่นก่อนทำการลบ)`, 'error');
    return;
  }

  // Safety Check 2: Minimum 1 branch must remain
  if (appState.branches.length <= 1) {
    showToast('ไม่สามารถลบสาขาทั้งหมดได้ ต้องมีอย่างน้อย 1 สาขาในระบบ', 'error');
    return;
  }

  if (!confirm(`คุณต้องการลบสาขา [${branch.name}] (${branch.id}) ออกจากระบบ ใช่หรือไม่?`)) {
    return;
  }

  appState.branches = appState.branches.filter(b => b.id !== branchId);
  saveState();
  initDropdowns();
  renderCurrentTab();
  showToast(`ลบสาขา [${branch.name}] เรียบร้อยแล้ว`, 'success');

  if (appState.gasUrl) {
    syncDeleteBranchToGas(branchId);
  }
}

// Tab Switcher Logic with Permission Guard
function switchTab(tabId) {
  const isAdmin = appState.currentUser && appState.currentUser.role === 'admin';
  if ((tabId === 'settings-tab' || tabId === 'users-tab') && !isAdmin) {
    showToast('คุณไม่มีสิทธิ์เข้าถึงเมนูนี้ (เฉพาะผู้ดูแลระบบ Admin เท่านั้น)', 'error');
    tabId = 'scan-tab';
  }

  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));

  const btnMap = {
    'scan-tab': 'tab-btn-scan',
    'inventory-tab': 'tab-btn-inventory',
    'dashboard-tab': 'tab-btn-dashboard',
    'logs-tab': 'tab-btn-logs',
    'users-tab': 'tab-btn-users',
    'settings-tab': 'tab-btn-settings'
  };

  if (document.getElementById(btnMap[tabId])) {
    document.getElementById(btnMap[tabId]).classList.add('active');
  }

  const section = document.getElementById(tabId);
  if (section) {
    section.classList.add('active');
    if (tabId === 'scan-tab') renderQuickItems();
    if (tabId === 'inventory-tab') renderInventoryTable();
    if (tabId === 'dashboard-tab') renderDashboard();
    if (tabId === 'logs-tab') renderLogsTable();
    if (tabId === 'users-tab') renderUsersTable();
  }
}

function renderCurrentTab() {
  renderQuickItems();
  renderInventoryTable();
  renderDashboard();
  renderLogsTable();
  renderUsersTable();
}

// Helper: Get Branch Name
function getBranchName(branchId) {
  const found = appState.branches.find(b => b.id === branchId);
  return found ? found.name : branchId;
}

// Helper: Status Badge HTML
function getStatusBadge(status) {
  switch (status) {
    case 'On Display':
      return `<span class="badge badge-display"><i class="fa-solid fa-store"></i> On Display (จัดแสดง)</span>`;
    case 'In Storage':
      return `<span class="badge badge-storage"><i class="fa-solid fa-warehouse"></i> In Storage (ในคลัง)</span>`;
    case 'In Transit':
      return `<span class="badge badge-transit"><i class="fa-solid fa-truck"></i> In Transit (กำลังย้าย)</span>`;
    case 'Damaged':
      return `<span class="badge badge-damaged"><i class="fa-solid fa-triangle-exclamation"></i> Damaged (ชำรุด)</span>`;
    default:
      return `<span class="badge badge-storage">${status}</span>`;
  }
}

// 1. SCAN TAB LOGIC
let currentQuickPage = 1;

function changeQuickPage(delta) {
  currentQuickPage += delta;
  if (currentQuickPage < 1) currentQuickPage = 1;
  renderQuickItems();
}

function renderQuickItems() {
  const tbody = document.getElementById('quick-items-tbody');
  const searchVal = (document.getElementById('quick-search-input')?.value || '').toLowerCase();
  if (!tbody) return;

  const filtered = appState.products.filter(p => 
    p.name.toLowerCase().includes(searchVal) || 
    p.code.toLowerCase().includes(searchVal) || 
    getBranchName(p.branch).toLowerCase().includes(searchVal)
  );

  const totalItems = filtered.length;
  const pageSize = 20;
  const maxPage = Math.max(1, Math.ceil(totalItems / pageSize));
  if (currentQuickPage > maxPage) currentQuickPage = maxPage;

  const startIdx = (currentQuickPage - 1) * pageSize;
  const pageItems = filtered.slice(startIdx, startIdx + pageSize);

  // Update Quick Pagination Controls UI
  const pageInfo = document.getElementById('quick-page-info');
  const pageLabel = document.getElementById('quick-current-page-label');
  const prevBtn = document.getElementById('quick-prev-btn');
  const nextBtn = document.getElementById('quick-next-btn');

  if (pageInfo) {
    const endIdx = Math.min(startIdx + pageSize, totalItems);
    pageInfo.innerText = totalItems > 0 ? `แสดง ${startIdx + 1} - ${endIdx} จากทั้งหมด ${totalItems} รายการ` : `แสดง 0 จาก 0 รายการ`;
  }
  if (pageLabel) pageLabel.innerText = `หน้า ${currentQuickPage} / ${maxPage}`;
  if (prevBtn) prevBtn.disabled = currentQuickPage <= 1;
  if (nextBtn) nextBtn.disabled = currentQuickPage >= maxPage;

  if (pageItems.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 2rem;">ไม่พบข้อมูลสินค้าตัวอย่าง</td></tr>`;
    return;
  }

  tbody.innerHTML = pageItems.map(p => `
    <tr>
      <td>
        <div class="product-cell">
          <img src="${p.img || 'https://via.placeholder.com/80'}" class="product-img-thumb" alt="${p.name}">
          <div class="product-meta">
            <div class="item-title">${p.name}</div>
            <div class="item-code">${p.code}</div>
          </div>
        </div>
      </td>
      <td><strong>${getBranchName(p.branch)}</strong></td>
      <td>${p.location || '-'}</td>
      <td>${getStatusBadge(p.status)}</td>
      <td style="font-size: 0.75rem; color: var(--text-muted);">${p.updatedAt || '-'}</td>
      <td style="text-align: right;">
        <button class="btn btn-primary btn-sm" onclick="openUpdateModalForCode('${p.code}')">
          <i class="fa-solid fa-pen-to-square"></i> อัปเดตจุดวาง
        </button>
      </td>
    </tr>
  `).join('');
}

function filterQuickItems() {
  renderQuickItems();
}

// QR Code Scanner Camera Modal
function openScannerModal() {
  document.getElementById('scanner-modal').classList.add('active');
  initCameraScanner();
}

function closeScannerModal() {
  document.getElementById('scanner-modal').classList.remove('active');
  stopCameraScanner();
}

function initCameraScanner() {
  if (appState.html5QrScanner) {
    stopCameraScanner();
  }

  appState.html5QrScanner = new Html5Qrcode("qr-reader");
  const config = { fps: 10, qrbox: { width: 220, height: 220 } };

  appState.html5QrScanner.start(
    { facingMode: "environment" },
    config,
    (decodedText) => {
      closeScannerModal();
      processScannedQr(decodedText);
    },
    (errorMessage) => {
      // Scanning...
    }
  ).catch(err => {
    console.warn("Camera access failed:", err);
    document.getElementById('qr-reader-container').innerHTML = `
      <div style="padding: 1.5rem; text-align: center; color: #cbd5e1;">
        <i class="fa-solid fa-camera-slash" style="font-size: 2rem; margin-bottom: 0.5rem; color: #ef4444;"></i>
        <p>ไม่สามารถเปิดกล้องได้ (หรืออุปกรณ์ไม่มีกล้อง)</p>
        <p style="font-size: 0.75rem; color: #94a3b8; margin-top: 0.25rem;">โปรดใช้วิธีพิมพ์รหัสหรือเลือกลิสต์สินค้าทดแทน</p>
      </div>
    `;
  });
}

function stopCameraScanner() {
  if (appState.html5QrScanner) {
    appState.html5QrScanner.stop().then(() => {
      appState.html5QrScanner.clear();
      appState.html5QrScanner = null;
    }).catch(err => {
      console.error(err);
      appState.html5QrScanner = null;
    });
  }
}

function processScannedQr(qrData) {
  if (!qrData) return;
  const cleanCode = qrData.trim();
  
  const product = appState.products.find(p => p.code.toLowerCase() === cleanCode.toLowerCase());

  if (product) {
    showToast(`พบสินค้า: ${product.name}`, 'success');
    openUpdateModalForCode(product.code);
  } else {
    showToast(`ไม่พบรหัสสินค้า: ${cleanCode} ในระบบ`, 'error');
    if (appState.currentUser && appState.currentUser.role === 'admin') {
      if (confirm(`ไม่พบรหัส ${cleanCode} ในระบบ ต้องการเพิ่มเป็นสินค้าตัวอย่างใหม่หรือไม่?`)) {
        openAddProductModal(cleanCode);
      }
    }
  }
}

// Damaged Photo Capture & Upload Helper Logic
function handleUpdateStatusChange() {
  const statusSelect = document.getElementById('update-status-select');
  const damagedGroup = document.getElementById('damaged-photo-group');
  if (!statusSelect || !damagedGroup) return;

  if (statusSelect.value === 'Damaged') {
    damagedGroup.style.display = 'block';
  } else {
    damagedGroup.style.display = 'none';
  }
}

function triggerDamagedPhotoUpload() {
  const input = document.getElementById('damaged-photo-input');
  if (input) input.click();
}

function handleDamagedPhotoSelect(event) {
  const file = event.target.files[0];
  if (!file) return;

  showToast('กำลังประมวลผลและบีบอัดรูปภาพสินค้าชำรุด...', 'info');

  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      const MAX_SIZE = 800;

      if (width > height) {
        if (width > MAX_SIZE) {
          height *= MAX_SIZE / width;
          width = MAX_SIZE;
        }
      } else {
        if (height > MAX_SIZE) {
          width *= MAX_SIZE / height;
          height = MAX_SIZE;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.75);

      document.getElementById('damaged-img-data').value = compressedDataUrl;
      document.getElementById('damaged-img-preview').src = compressedDataUrl;
      document.getElementById('damaged-preview-wrapper').style.display = 'block';
      document.getElementById('damaged-clear-btn').style.display = 'inline-block';

      showToast('ถ่ายภาพ/เลือกรูปสินค้าชำรุดเรียบร้อยแล้ว', 'success');
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function clearDamagedPhoto() {
  const dataInput = document.getElementById('damaged-img-data');
  const previewImg = document.getElementById('damaged-img-preview');
  const wrapper = document.getElementById('damaged-preview-wrapper');
  const clearBtn = document.getElementById('damaged-clear-btn');
  const fileInput = document.getElementById('damaged-photo-input');

  if (dataInput) dataInput.value = '';
  if (previewImg) previewImg.src = '';
  if (wrapper) wrapper.style.display = 'none';
  if (clearBtn) clearBtn.style.display = 'none';
  if (fileInput) fileInput.value = '';
}

// Update Modal Form
function openUpdateModalForCode(itemCode) {
  const p = appState.products.find(x => x.code === itemCode);
  if (!p) return;

  document.getElementById('update-item-id').value = p.code;
  document.getElementById('update-item-name').innerText = p.name;
  document.getElementById('update-item-code').innerText = p.code;
  document.getElementById('update-item-spec').innerText = p.spec || p.category;
  document.getElementById('update-item-img').src = p.img || 'https://via.placeholder.com/80';
  
  document.getElementById('update-branch-select').value = p.branch;
  document.getElementById('update-location-detail').value = p.location || '';
  document.getElementById('update-status-select').value = p.status || 'On Display';

  // Reset damaged photo section
  clearDamagedPhoto();
  if (p.status === 'Damaged' && p.damagedImg) {
    document.getElementById('damaged-img-data').value = p.damagedImg;
    document.getElementById('damaged-img-preview').src = p.damagedImg;
    document.getElementById('damaged-preview-wrapper').style.display = 'block';
    document.getElementById('damaged-clear-btn').style.display = 'inline-block';
  }
  handleUpdateStatusChange();

  if (appState.currentUser) {
    document.getElementById('update-staff-name').value = appState.currentUser.name;
  } else {
    document.getElementById('update-staff-name').value = p.updatedBy || '';
  }

  document.getElementById('update-notes').value = p.notes || '';
  document.getElementById('update-modal').classList.add('active');
}

function closeUpdateModal() {
  document.getElementById('update-modal').classList.remove('active');
}

function handleLocationUpdateSubmit(e) {
  e.preventDefault();
  const code = document.getElementById('update-item-id').value;
  const branch = document.getElementById('update-branch-select').value;
  const location = document.getElementById('update-location-detail').value;
  const status = document.getElementById('update-status-select').value;
  const staff = document.getElementById('update-staff-name').value;
  const notes = document.getElementById('update-notes').value;
  const damagedImg = document.getElementById('damaged-img-data')?.value || '';

  if (status === 'Damaged' && !damagedImg) {
    showToast('โปรดถ่ายภาพหรือแนบรูปสินค้าชำรุดก่อนทำการบันทึก', 'error');
    return;
  }

  const product = appState.products.find(p => p.code === code);
  if (!product) return;

  const nowStr = new Date().toLocaleString('sv-SE');

  const prevBranch = product.branch || '';
  const prevBranchName = getBranchName(prevBranch);
  const prevLocation = product.location || '';

  product.branch = branch;
  product.location = location;
  product.status = status;
  product.updatedBy = staff;
  product.updatedAt = nowStr;
  product.notes = notes;
  product.damagedImg = (status === 'Damaged') ? damagedImg : '';

  const newLog = {
    id: 'LOG-' + Math.floor(100000 + Math.random() * 900000),
    timestamp: nowStr,
    code: product.code,
    name: product.name,
    action: 'UPDATE_LOCATION',
    fromBranch: prevBranch,
    fromBranchName: prevBranchName,
    fromLocation: prevLocation,
    branch: branch,
    branchName: getBranchName(branch),
    location: location,
    status: status,
    staff: staff,
    notes: notes,
    damagedImg: status === 'Damaged' ? damagedImg : ''
  };

  appState.logs.unshift(newLog);
  saveState();
  closeUpdateModal();
  renderCurrentTab();

  showToast(`บันทึกตำแหน่งและสถานะของ [${product.name}] เรียบร้อยแล้ว`, 'success');

  if (appState.gasUrl) {
    syncUpdateToGas(product, newLog);
  }
}

// 2. INVENTORY TAB LOGIC
let currentInvPage = 1;

function changeInvPage(delta) {
  currentInvPage += delta;
  if (currentInvPage < 1) currentInvPage = 1;
  renderInventoryTable();
}

function renderInventoryTable() {
  const tbody = document.getElementById('inventory-tbody');
  if (!tbody) return;

  const searchVal = (document.getElementById('inv-search-input')?.value || '').toLowerCase();
  const branchFilter = document.getElementById('inv-branch-filter')?.value || '';
  const statusFilter = document.getElementById('inv-status-filter')?.value || '';

  const filtered = appState.products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchVal) || p.code.toLowerCase().includes(searchVal) || (p.spec && p.spec.toLowerCase().includes(searchVal));
    const matchBranch = branchFilter === '' || p.branch === branchFilter;
    const matchStatus = statusFilter === '' || p.status === statusFilter;
    return matchSearch && matchBranch && matchStatus;
  });

  const totalItems = filtered.length;
  const pageSize = 20;
  const maxPage = Math.max(1, Math.ceil(totalItems / pageSize));
  if (currentInvPage > maxPage) currentInvPage = maxPage;

  const startIdx = (currentInvPage - 1) * pageSize;
  const pageItems = filtered.slice(startIdx, startIdx + pageSize);

  // Update Inventory Pagination Controls UI
  const pageInfo = document.getElementById('inv-page-info');
  const pageLabel = document.getElementById('inv-current-page-label');
  const prevBtn = document.getElementById('inv-prev-btn');
  const nextBtn = document.getElementById('inv-next-btn');

  if (pageInfo) {
    const endIdx = Math.min(startIdx + pageSize, totalItems);
    pageInfo.innerText = totalItems > 0 ? `แสดง ${startIdx + 1} - ${endIdx} จากทั้งหมด ${totalItems} รายการ` : `แสดง 0 จาก 0 รายการ`;
  }
  if (pageLabel) pageLabel.innerText = `หน้า ${currentInvPage} / ${maxPage}`;
  if (prevBtn) prevBtn.disabled = currentInvPage <= 1;
  if (nextBtn) nextBtn.disabled = currentInvPage >= maxPage;

  if (pageItems.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 2rem;">ไม่พบข้อมูลรายการสินค้า</td></tr>`;
    return;
  }

  const isAdmin = appState.currentUser && appState.currentUser.role === 'admin';

  tbody.innerHTML = pageItems.map(p => `
    <tr>
      <td>
        <div class="product-cell">
          <img src="${p.img || 'https://via.placeholder.com/80'}" class="product-img-thumb" alt="${p.name}">
          <div class="product-meta">
            <div class="item-title">${p.name}</div>
            <div class="item-code">${p.code}</div>
          </div>
        </div>
      </td>
      <td>
        <div style="font-weight: 500; color: var(--text-main);">${p.category}</div>
        <div style="font-size: 0.75rem; color: var(--text-muted);">${p.spec || '-'}</div>
      </td>
      <td><strong>${getBranchName(p.branch)}</strong></td>
      <td>${p.location || '-'}</td>
      <td>
        ${getStatusBadge(p.status)}
        ${(p.status === 'Damaged' && p.damagedImg) ? `
          <div style="margin-top: 0.375rem;">
            <a href="${p.damagedImg}" target="_blank" download class="btn btn-outline btn-sm" style="padding: 0.15rem 0.4rem; font-size: 0.72rem; color: #be123c; border-color: #f43f5e; text-decoration: none; display: inline-flex; align-items: center; gap: 0.25rem;">
              <i class="fa-solid fa-download"></i> รูปสินค้าชำรุด
            </a>
          </div>
        ` : ''}
      </td>
      <td>
        <button class="btn btn-secondary btn-sm" onclick="openQrPrintModal('${p.code}')">
          <i class="fa-solid fa-qrcode"></i> พิมพ์ป้าย QR
        </button>
      </td>
      <td style="text-align: right;">
        <div style="display: inline-flex; gap: 0.375rem;">
          <button class="btn btn-primary btn-sm" onclick="openUpdateModalForCode('${p.code}')">
            <i class="fa-solid fa-location-dot"></i> ย้ายจุด
          </button>
          ${isAdmin ? `
            <button class="btn btn-secondary btn-sm" onclick="openEditProductModal('${p.code}')" title="แก้ไขข้อมูล & รูปภาพสินค้า">
              <i class="fa-solid fa-pen-to-square"></i> แก้ไข
            </button>
            <button class="btn btn-outline btn-sm" style="color: #ef4444; border-color: #fca5a5;" onclick="deleteProduct('${p.code}')">
              <i class="fa-solid fa-trash"></i>
            </button>
          ` : ''}
        </div>
      </td>
    </tr>
  `).join('');
}

// Image Uploader & Camera Capture Helper Functions
function triggerPhotoUpload(prefix) {
  const fileInput = document.getElementById(`${prefix}-img-file`);
  if (fileInput) fileInput.click();
}

function handleImageFileSelect(event, prefix) {
  const file = event.target.files[0];
  if (!file) return;

  showToast('กำลังประมวลผลและบีบอัดรูปภาพ...', 'info');

  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      const canvas = document.createElement('canvas');
      const MAX_WIDTH = 600;
      const MAX_HEIGHT = 600;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width = Math.round((width * MAX_HEIGHT) / height);
          height = MAX_HEIGHT;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.75);

      document.getElementById(`${prefix}-img`).value = compressedDataUrl;
      document.getElementById(`${prefix}-img-preview`).src = compressedDataUrl;
      showToast('อัปเดตรูปภาพเรียบร้อยแล้ว', 'success');
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function toggleUrlInput(prefix) {
  const wrapper = document.getElementById(`${prefix}-img-url-wrapper`);
  if (!wrapper) return;
  wrapper.style.display = wrapper.style.display === 'none' ? 'block' : 'none';
}

function clearPhoto(prefix) {
  document.getElementById(`${prefix}-img`).value = '';
  document.getElementById(`${prefix}-img-preview`).src = 'https://via.placeholder.com/300x200?text=No+Image';
  const urlInput = document.getElementById(`${prefix}-img-url-input`);
  if (urlInput) urlInput.value = '';
  const fileInput = document.getElementById(`${prefix}-img-file`);
  if (fileInput) fileInput.value = '';
  showToast('ลบรูปภาพแล้ว', 'info');
}

function handleUrlInput(val, prefix) {
  const cleanUrl = val.trim();
  document.getElementById(`${prefix}-img`).value = cleanUrl;
  document.getElementById(`${prefix}-img-preview`).src = cleanUrl || 'https://via.placeholder.com/300x200?text=No+Image';
}

// Add Product Modal (Admin)
function openAddProductModal(defaultCode = '') {
  document.getElementById('add-code').value = defaultCode || ('WD-SMP-' + String(appState.products.length + 1).padStart(3, '0'));
  document.getElementById('add-name').value = '';
  document.getElementById('add-spec').value = '';
  document.getElementById('add-img').value = '';
  document.getElementById('add-img-preview').src = 'https://via.placeholder.com/300x200?text=No+Image';
  document.getElementById('add-img-url-wrapper').style.display = 'none';
  if (document.getElementById('add-img-url-input')) document.getElementById('add-img-url-input').value = '';
  document.getElementById('add-product-modal').classList.add('active');
}

function closeAddProductModal() {
  document.getElementById('add-product-modal').classList.remove('active');
}

function handleAddProductSubmit(e) {
  e.preventDefault();
  const code = document.getElementById('add-code').value.trim();
  const name = document.getElementById('add-name').value.trim();
  const category = document.getElementById('add-category').value;
  const spec = document.getElementById('add-spec').value;
  const img = document.getElementById('add-img').value || 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=300&q=80';
  const branch = document.getElementById('add-branch').value;
  const location = document.getElementById('add-location').value;

  if (appState.products.some(p => p.code === code)) {
    showToast(`รหัสสินค้า ${code} มีอยู่ในระบบแล้ว`, 'error');
    return;
  }

  const nowStr = new Date().toLocaleString('sv-SE');

  const newProd = {
    code, name, category, spec, img, branch, location,
    status: 'On Display',
    updatedBy: appState.currentUser ? appState.currentUser.name : 'Admin',
    updatedAt: nowStr,
    notes: 'สร้างสินค้าตัวอย่างรายการใหม่'
  };

  appState.products.push(newProd);
  saveState();
  closeAddProductModal();
  renderCurrentTab();
  showToast(`เพิ่มสินค้าตัวอย่างใหม่ [${name}] สำเร็จ`, 'success');

  if (appState.gasUrl) {
    syncProductToGas(newProd);
  }
}

// Edit Product Modal (Admin Only)
function openEditProductModal(code) {
  const p = appState.products.find(x => x.code === code);
  if (!p) return;

  document.getElementById('edit-code').value = p.code;
  document.getElementById('edit-code-display').value = p.code;
  document.getElementById('edit-name').value = p.name || '';
  document.getElementById('edit-category').value = p.category || 'ไม้พื้น (Flooring)';
  document.getElementById('edit-spec').value = p.spec || '';

  const imgVal = p.img || '';
  document.getElementById('edit-img').value = imgVal;
  document.getElementById('edit-img-preview').src = imgVal || 'https://via.placeholder.com/300x200?text=No+Image';
  document.getElementById('edit-img-url-wrapper').style.display = 'none';
  if (document.getElementById('edit-img-url-input')) {
    document.getElementById('edit-img-url-input').value = imgVal.startsWith('http') ? imgVal : '';
  }

  const editBranchSelect = document.getElementById('edit-branch');
  if (editBranchSelect) {
    const sortedBranches = getSortedBranches();
    editBranchSelect.innerHTML = sortedBranches.map(b => `<option value="${b.id}">${b.name}</option>`).join('');
    editBranchSelect.value = p.branch;
  }

  document.getElementById('edit-location').value = p.location || '';
  document.getElementById('edit-status').value = p.status || 'On Display';
  document.getElementById('edit-notes').value = p.notes || '';

  document.getElementById('edit-product-modal').classList.add('active');
}

function closeEditProductModal() {
  document.getElementById('edit-product-modal').classList.remove('active');
}

function handleEditProductSubmit(e) {
  e.preventDefault();
  const code = document.getElementById('edit-code').value;
  const product = appState.products.find(p => p.code === code);
  if (!product) return;

  const name = document.getElementById('edit-name').value.trim();
  const category = document.getElementById('edit-category').value;
  const spec = document.getElementById('edit-spec').value.trim();
  const img = document.getElementById('edit-img').value || 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=300&q=80';
  const branch = document.getElementById('edit-branch').value;
  const location = document.getElementById('edit-location').value.trim();
  const status = document.getElementById('edit-status').value;
  const notes = document.getElementById('edit-notes').value.trim();

  const nowStr = new Date().toLocaleString('sv-SE');

  product.name = name;
  product.category = category;
  product.spec = spec;
  product.img = img;
  product.branch = branch;
  product.location = location;
  product.status = status;
  product.notes = notes;
  product.updatedBy = appState.currentUser ? appState.currentUser.name : 'Admin';
  product.updatedAt = nowStr;

  saveState();
  closeEditProductModal();
  renderCurrentTab();
  showToast(`อัปเดตข้อมูลสินค้า [${name}] เรียบร้อยแล้ว`, 'success');

  if (appState.gasUrl) {
    syncEditProductToGas(product);
  }
}

function deleteProduct(code) {
  if (confirm(`คุณต้องการลบรายการตัวอย่างสินค้า ${code} ใช่หรือไม่?`)) {
    appState.products = appState.products.filter(p => p.code !== code);
    saveState();
    renderCurrentTab();
    showToast(`ลบรายการ ${code} แล้ว`, 'success');
  }
}

// 3. DASHBOARD TAB LOGIC
function renderDashboard() {
  const total = appState.products.length;
  const display = appState.products.filter(p => p.status === 'On Display').length;
  const storage = appState.products.filter(p => p.status === 'In Storage').length;
  const transit = appState.products.filter(p => p.status === 'In Transit').length;
  const damaged = appState.products.filter(p => p.status === 'Damaged').length;

  document.getElementById('stat-total-items').innerText = total;
  document.getElementById('stat-display-items').innerText = display;
  document.getElementById('stat-storage-items').innerText = storage;
  document.getElementById('stat-transit-items').innerText = transit;
  document.getElementById('stat-damaged-items').innerText = damaged;

  const tbody = document.getElementById('branch-summary-tbody');
  if (tbody) {
    const isAdmin = appState.currentUser && appState.currentUser.role === 'admin';

    tbody.innerHTML = appState.branches.map(b => {
      const bItems = appState.products.filter(p => p.branch === b.id);
      const bDisplay = bItems.filter(p => p.status === 'On Display').length;
      const bStorage = bItems.filter(p => p.status === 'In Storage').length;
      const bTransit = bItems.filter(p => p.status === 'In Transit').length;
      const bDamaged = bItems.filter(p => p.status === 'Damaged').length;

      const mapBtnHtml = b.mapLink 
        ? `<a href="${b.mapLink}" target="_blank" class="btn btn-outline btn-sm" style="padding: 0.2rem 0.5rem; font-size: 0.75rem; color: #10b981; border-color: #a7f3d0; text-decoration: none;"><i class="fa-solid fa-map-location-dot"></i> ดูแผนที่</a>` 
        : `<span style="font-size: 0.75rem; color: var(--text-muted);">-</span>`;

      const actionHtml = isAdmin ? `
        <div style="display: inline-flex; gap: 0.375rem;">
          <button class="btn btn-secondary btn-sm" onclick="openEditBranchModal('${b.id}')" title="แก้ไขข้อมูลสาขา">
            <i class="fa-solid fa-pen-to-square"></i> แก้ไข
          </button>
          <button class="btn btn-outline btn-sm" style="color: #ef4444; border-color: #fca5a5;" onclick="deleteBranch('${b.id}')" title="ลบสาขา">
            <i class="fa-solid fa-trash"></i> ลบ
          </button>
        </div>
      ` : `<span style="color: var(--text-muted);">-</span>`;

      return `
        <tr>
          <td><code>${b.id}</code></td>
          <td><strong>${b.name}</strong></td>
          <td>${mapBtnHtml}</td>
          <td><span class="badge badge-display">${bDisplay}</span></td>
          <td><span class="badge badge-storage">${bStorage}</span></td>
          <td><span class="badge badge-transit">${bTransit}</span></td>
          <td><span class="badge badge-damaged">${bDamaged}</span></td>
          <td><strong>${bItems.length} ชิ้น</strong></td>
          <td style="text-align: right;">${actionHtml}</td>
        </tr>
      `;
    }).join('');
  }

  renderBranchMap();
}

function renderBranchMap() {
  const mapContainer = document.getElementById('branch-map-container');
  if (!mapContainer || typeof L === 'undefined') return;

  if (appState.leafMap) {
    appState.leafMap.remove();
    appState.leafMap = null;
  }

  const map = L.map('branch-map-container').setView([13.7563, 100.5018], 6);
  appState.leafMap = map;

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);

  const bounds = [];

  appState.branches.forEach(b => {
    const coords = resolveBranchCoordinates(b);
    const lat = coords.lat;
    const lng = coords.lng;

    bounds.push([lat, lng]);

    const bItems = appState.products.filter(p => p.branch === b.id);
    const bDisplay = bItems.filter(p => p.status === 'On Display').length;
    const bStorage = bItems.filter(p => p.status === 'In Storage').length;

    const mapLinkBtn = b.mapLink 
      ? `<a href="${b.mapLink}" target="_blank" class="btn btn-primary btn-sm" style="margin-top: 0.5rem; width: 100%; font-size: 0.75rem; text-decoration: none;"><i class="fa-solid fa-map-location-dot"></i> เปิดใน Google Maps</a>`
      : '';

    const popupContent = `
      <div style="font-family: var(--font-family); min-width: 180px;">
        <div style="font-weight: 700; font-size: 0.9375rem; color: #0f172a; margin-bottom: 0.25rem;">${b.name}</div>
        <div style="font-size: 0.75rem; color: #64748b; margin-bottom: 0.5rem;"><i class="fa-solid fa-location-dot"></i> ${b.address || '-'}</div>
        <div style="font-size: 0.8125rem; background: #f1f5f9; padding: 0.375rem 0.5rem; border-radius: 6px; margin-bottom: 0.375rem;">
          <div>🟢 จัดแสดง: <strong>${bDisplay} ชิ้น</strong></div>
          <div>🔵 ในคลัง: <strong>${bStorage} ชิ้น</strong></div>
          <div>📦 รวมทั้งหมด: <strong>${bItems.length} ชิ้น</strong></div>
        </div>
        ${mapLinkBtn}
      </div>
    `;

    L.marker([lat, lng])
      .addTo(map)
      .bindPopup(popupContent);
  });

  if (bounds.length > 0) {
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
  }

  setTimeout(() => map.invalidateSize(), 300);
}

// 4. MOVEMENT LOGS TAB LOGIC
let currentLogsPage = 1;

function changeLogsPage(delta) {
  currentLogsPage += delta;
  if (currentLogsPage < 1) currentLogsPage = 1;
  renderLogsTable();
}

function renderLogsTable() {
  const tbody = document.getElementById('logs-tbody');
  if (!tbody) return;

  const searchVal = (document.getElementById('log-search-input')?.value || '').toLowerCase();

  const filtered = appState.logs.filter(l => 
    l.name.toLowerCase().includes(searchVal) || 
    l.code.toLowerCase().includes(searchVal) || 
    (l.staff && l.staff.toLowerCase().includes(searchVal)) || 
    (l.branchName && l.branchName.toLowerCase().includes(searchVal)) ||
    (l.fromBranchName && l.fromBranchName.toLowerCase().includes(searchVal))
  );

  const totalLogs = filtered.length;
  const pageSize = 20;
  const maxPage = Math.max(1, Math.ceil(totalLogs / pageSize));
  if (currentLogsPage > maxPage) currentLogsPage = maxPage;

  const startIdx = (currentLogsPage - 1) * pageSize;
  const pageLogs = filtered.slice(startIdx, startIdx + pageSize);

  // Update Pagination Controls UI
  const pageInfo = document.getElementById('logs-page-info');
  const pageLabel = document.getElementById('logs-current-page-label');
  const prevBtn = document.getElementById('logs-prev-btn');
  const nextBtn = document.getElementById('logs-next-btn');

  if (pageInfo) {
    const endIdx = Math.min(startIdx + pageSize, totalLogs);
    pageInfo.innerText = totalLogs > 0 ? `แสดง ${startIdx + 1} - ${endIdx} จากทั้งหมด ${totalLogs} รายการ` : `แสดง 0 จาก 0 รายการ`;
  }
  if (pageLabel) pageLabel.innerText = `หน้า ${currentLogsPage} / ${maxPage}`;
  if (prevBtn) prevBtn.disabled = currentLogsPage <= 1;
  if (nextBtn) nextBtn.disabled = currentLogsPage >= maxPage;

  if (pageLogs.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 2rem;">ยังไม่มีประวัติการบันทึก</td></tr>`;
    return;
  }

  tbody.innerHTML = pageLogs.map(l => {
    const rawFromBranch = l.fromBranchName || l.fromBranch || '';
    const fromBranchTitle = rawFromBranch ? getBranchName(rawFromBranch) : '';

    const fromText = fromBranchTitle 
      ? `<div><strong>${fromBranchTitle}</strong></div><div style="font-size:0.75rem; color:var(--text-muted);">${l.fromLocation || '-'}</div>`
      : `<span style="font-size: 0.75rem; color: var(--text-muted);">- (แรกเข้า)</span>`;

    const toText = `<div><strong>${l.branchName || getBranchName(l.branch)}</strong></div><div style="font-size:0.75rem; color:var(--text-muted);">${l.location || '-'}</div>`;

    return `
      <tr>
        <td style="font-size: 0.8125rem; color: var(--text-muted); white-space: nowrap;">${l.timestamp}</td>
        <td>
          <div style="font-weight: 600;">${l.name}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted); font-family: monospace;">${l.code}</div>
        </td>
        <td><span style="font-size: 0.75rem; background: var(--bg-subtle); padding: 2px 6px; border-radius: 4px;">${l.action}</span></td>
        <td>${fromText}</td>
        <td>${toText}</td>
        <td>${getStatusBadge(l.status)}</td>
        <td><i class="fa-solid fa-user" style="font-size: 0.75rem; color: var(--text-muted);"></i> ${l.staff}</td>
      </tr>
    `;
  }).join('');
}

function exportLogsCSV() {
  let csv = "Timestamp,ItemCode,ItemName,Action,FromBranch,FromLocation,ToBranch,ToLocation,Status,Staff\n";
  appState.logs.forEach(l => {
    csv += `"${l.timestamp}","${l.code}","${l.name}","${l.action}","${l.fromBranchName || ''}","${l.fromLocation || ''}","${l.branchName || ''}","${l.location || ''}","${l.status}","${l.staff}"\n`;
  });

  const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Wood_Exc_Logs_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  showToast('ส่งออกไฟล์ CSV เรียบร้อยแล้ว', 'success');
}

// 5. USER MANAGEMENT LOGIC (ADMIN ONLY)
function renderUsersTable() {
  const tbody = document.getElementById('users-tbody');
  if (!tbody) return;

  tbody.innerHTML = appState.users.map(u => `
    <tr>
      <td><code>${u.username}</code></td>
      <td><strong>${u.name}</strong></td>
      <td>
        <span class="badge ${u.role === 'admin' ? 'badge-transit' : 'badge-storage'}">
          ${u.role === 'admin' ? '👑 Admin (ผู้ดูแลระบบ)' : '👤 Staff (พนักงาน)'}
        </span>
      </td>
      <td>${getBranchName(u.branch)}</td>
      <td><code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px;">${u.password}</code></td>
      <td style="text-align: right;">
        <div style="display: inline-flex; gap: 0.375rem;">
          <button class="btn btn-secondary btn-sm" onclick="promptResetPassword('${u.username}')">
            <i class="fa-solid fa-key"></i> เปลี่ยนรหัส
          </button>
          ${u.username !== 'admin' ? `
            <button class="btn btn-outline btn-sm" style="color: #ef4444; border-color: #fca5a5;" onclick="deleteUser('${u.username}')">
              <i class="fa-solid fa-trash"></i>
            </button>
          ` : ''}
        </div>
      </td>
    </tr>
  `).join('');
}

function openAddUserModal() {
  document.getElementById('user-username').value = '';
  document.getElementById('user-password').value = '';
  document.getElementById('user-fullname').value = '';
  document.getElementById('add-user-modal').classList.add('active');
}

function closeAddUserModal() {
  document.getElementById('add-user-modal').classList.remove('active');
}

function handleAddUserSubmit(e) {
  e.preventDefault();
  const username = document.getElementById('user-username').value.trim();
  const password = document.getElementById('user-password').value.trim();
  const name = document.getElementById('user-fullname').value.trim();
  const role = document.getElementById('user-role').value;
  const branch = document.getElementById('user-branch').value;

  if (appState.users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
    showToast(`Username [${username}] มีอยู่ในระบบแล้ว`, 'error');
    return;
  }

  const nowStr = new Date().toLocaleString('sv-SE');
  const newUser = {
    userId: 'U' + String(appState.users.length + 1).padStart(3, '0'),
    username, password, name, role, branch,
    createdAt: nowStr
  };

  appState.users.push(newUser);
  saveState();
  closeAddUserModal();
  renderUsersTable();
  showToast(`เพิ่มผู้ใช้งานใหม่ [${name}] เรียบร้อยแล้ว`, 'success');

  if (appState.gasUrl) {
    syncUserToGas(newUser);
  }
}

function promptResetPassword(username) {
  const u = appState.users.find(x => x.username === username);
  if (!u) return;

  const newPass = prompt(`กรอกรหัสผ่านใหม่สำหรับ ${u.name} (${username}):`, u.password);
  if (newPass && newPass.trim() !== '') {
    u.password = newPass.trim();
    saveState();
    renderUsersTable();
    showToast(`เปลี่ยนรหัสผ่านสำหรับ ${username} เรียบร้อยแล้ว`, 'success');
  }
}

function deleteUser(username) {
  if (username === 'admin') {
    showToast('ไม่สามารถลบบัญชี Admin หลักได้', 'error');
    return;
  }
  if (confirm(`คุณต้องการลบบัญชีผู้ใช้ ${username} ใช่หรือไม่?`)) {
    appState.users = appState.users.filter(u => u.username !== username);
    saveState();
    renderUsersTable();
    showToast(`ลบบัญชี ${username} แล้ว`, 'success');
  }
}

// 6. QR CODE PRINT MODAL LOGIC
function openQrPrintModal(itemCode) {
  const p = appState.products.find(x => x.code === itemCode);
  if (!p) return;

  document.getElementById('print-item-name').innerText = p.name;
  document.getElementById('print-item-code').innerText = p.code;

  const canvasBox = document.getElementById('qr-canvas-box');
  canvasBox.innerHTML = '';

  new QRCode(canvasBox, {
    text: p.code,
    width: 160,
    height: 160,
    colorDark : "#0f172a",
    colorLight : "#ffffff",
    correctLevel : QRCode.CorrectLevel.H
  });

  document.getElementById('qr-print-modal').classList.add('active');
}

function closeQrPrintModal() {
  document.getElementById('qr-print-modal').classList.remove('active');
}

function printQrCard() {
  window.print();
}

// 7. GOOGLE SHEETS API INTEGRATION (ADMIN ONLY FOR CONFIG)
function saveGasUrl() {
  if (!appState.currentUser || appState.currentUser.role !== 'admin') {
    showToast('คุณไม่มีสิทธิ์ปรับแต่ง Web App URL (เฉพาะ Admin เท่านั้น)', 'error');
    return;
  }

  const url = document.getElementById('gas-url-input').value.trim();
  appState.gasUrl = url;
  saveState();
  updateConnStatusUI();
  showToast('บันทึก Web App URL เรียบร้อยแล้ว', 'success');
}

function updateConnStatusUI() {
  const dot = document.getElementById('conn-dot');
  const text = document.getElementById('conn-text');

  if (appState.gasUrl) {
    dot.className = 'config-status-dot connected';
    text.innerText = 'Connected Google Sheets';
  } else {
    dot.className = 'config-status-dot';
    text.innerText = 'ยังไม่ได้เชื่อมต่อ Google Sheets API';
  }
}

async function fetchInitialDataFromGas() {
  if (!appState.gasUrl) return;

  let hasUpdates = false;

  try {
    const res = await fetch(`${appState.gasUrl}?action=getProducts`);
    const data = await res.json();
    if (data && data.status === 'success' && Array.isArray(data.products) && data.products.length > 0) {
      appState.products = data.products;
      hasUpdates = true;
    }
  } catch (err) {
    console.warn('Auto fetch products failed:', err);
  }

  try {
    const res = await fetch(`${appState.gasUrl}?action=getBranches`);
    const data = await res.json();
    if (data && data.status === 'success' && Array.isArray(data.branches) && data.branches.length > 0) {
      appState.branches = data.branches;
      appState.branches.forEach(b => resolveBranchCoordinates(b));
      ensureAllBranchesHaveCoords();
      hasUpdates = true;
    }
  } catch (err) {
    console.warn('Auto fetch branches failed:', err);
  }

  try {
    const res = await fetch(`${appState.gasUrl}?action=getUsers`);
    const data = await res.json();
    if (data && data.status === 'success' && Array.isArray(data.users) && data.users.length > 0) {
      appState.users = data.users;
      hasUpdates = true;
    }
  } catch (err) {
    console.warn('Auto fetch users failed:', err);
  }

  try {
    const res = await fetch(`${appState.gasUrl}?action=getLogs`);
    const data = await res.json();
    if (data && data.status === 'success' && Array.isArray(data.logs) && data.logs.length > 0) {
      appState.logs = data.logs;
      hasUpdates = true;
    }
  } catch (err) {
    console.warn('Auto fetch logs failed:', err);
  }

  if (hasUpdates) {
    saveState();
    initDropdowns();
    renderCurrentTab();
  }
}

async function testGasConnection() {
  if (!appState.currentUser || appState.currentUser.role !== 'admin') {
    showToast('คุณไม่มีสิทธิ์ทดสอบการเชื่อมต่อ API (เฉพาะ Admin เท่านั้น)', 'error');
    return;
  }

  if (!appState.gasUrl) {
    showToast('โปรดกรอก Google Apps Script Web App URL ก่อนกดทดสอบ', 'error');
    return;
  }

  showToast('กำลังเชื่อมต่อ Google Sheets...', 'info');

  try {
    const res = await fetch(`${appState.gasUrl}?action=getProducts`);
    const data = await res.json();
    if (data && data.status === 'success') {
      showToast('เชื่อมต่อสำเร็จ! ดึงข้อมูลจาก Google Sheets ได้เรียบร้อย', 'success');
      if (data.products && data.products.length > 0) {
        appState.products = data.products;
        saveState();
        renderCurrentTab();
      }
      syncAllBranchesToGas();
    } else {
      showToast('การเชื่อมต่อตอบกลับ แต่รูปแบบข้อมูลไม่ถูกต้อง', 'error');
    }
  } catch (err) {
    console.error(err);
    showToast('ไม่สามารถเชื่อมต่อ Web App URL ได้ (โปรดเช็คสิทธิ์ Anyone หรือ CORS)', 'error');
  }
}

async function syncUpdateToGas(product, log) {
  if (!appState.gasUrl) return;

  try {
    await fetch(appState.gasUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'updateLocation',
        product: product,
        log: log
      })
    });
  } catch (err) {
    console.warn('Failed sync to Google Sheets:', err);
  }
}

async function syncProductToGas(newProduct) {
  if (!appState.gasUrl) return;

  try {
    await fetch(appState.gasUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'addProduct',
        product: newProduct
      })
    });
  } catch (err) {
    console.warn('Failed sync new product to Google Sheets:', err);
  }
}

async function syncEditProductToGas(product) {
  if (!appState.gasUrl) return;

  try {
    await fetch(appState.gasUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'editProduct',
        product: product
      })
    });
  } catch (err) {
    console.warn('Failed sync edit product to Google Sheets:', err);
  }
}

async function syncUserToGas(newUser) {
  if (!appState.gasUrl) return;

  try {
    await fetch(appState.gasUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'addUser',
        user: newUser
      })
    });
  } catch (err) {
    console.warn('Failed sync user to Google Sheets:', err);
  }
}

async function syncBranchToGas(newBranch) {
  if (!appState.gasUrl) return;

  try {
    await fetch(appState.gasUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'addBranch',
        branch: newBranch
      })
    });
  } catch (err) {
    console.warn('Failed sync branch to Google Sheets:', err);
  }
}

async function syncEditBranchToGas(branch) {
  if (!appState.gasUrl) return;

  try {
    await fetch(appState.gasUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'editBranch',
        branch: branch
      })
    });
  } catch (err) {
    console.warn('Failed sync edit branch to Google Sheets:', err);
  }
}

async function syncDeleteBranchToGas(branchId) {
  if (!appState.gasUrl) return;

  try {
    await fetch(appState.gasUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'deleteBranch',
        branchId: branchId
      })
    });
  } catch (err) {
    console.warn('Failed sync delete branch to Google Sheets:', err);
  }
}

async function syncAllBranchesToGas() {
  if (!appState.gasUrl) return;
  for (const b of appState.branches) {
    await syncBranchToGas(b);
  }
}

function downloadGasScriptCode() {
  const gasCode = `// Google Apps Script (Code.gs) Code for Sample Tracker App with User Auth & Branch Adding
function doGet(e) {
  const action = e.parameter.action;
  if (action === 'getProducts') return respondJson(getAllProductsWithLocation());
  if (action === 'getUsers') return respondJson(getAllUsers());
  if (action === 'getBranches') return respondJson({status: 'success', branches: getAllBranches()});
  return respondJson({status: 'online', msg: 'Wood Exc API Ready'});
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    if (data.action === 'updateLocation') updateLocationAndLog(data.product, data.log);
    else if (data.action === 'addProduct') createNewProduct(data.product);
    else if (data.action === 'addUser') createNewUser(data.user);
    else if (data.action === 'addBranch') createNewBranch(data.branch);
    return respondJson({status: 'success'});
  } catch(err) {
    return respondJson({status: 'error', error: err.toString()});
  }
}`;
  navigator.clipboard.writeText(gasCode);
  showToast('คัดลอกโค้ด Google Apps Script ไปยัง Clipboard แล้ว!', 'success');
}

// Toast Notifications Helper
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const iconMap = {
    success: 'fa-circle-check',
    error: 'fa-circle-exclamation',
    info: 'fa-circle-info'
  };

  toast.innerHTML = `<i class="fa-solid ${iconMap[type] || 'fa-bell'}"></i> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
