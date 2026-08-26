/**
 * ==============================================================================
 * Wood Exc Sample Tracker - Google Apps Script (Code.gs) with User Auth & Branch Management
 * ==============================================================================
 * สคริปต์นี้ใช้สำหรับติดตั้งใน Google Sheets ( Extensions > Apps Script )
 * รองรับระบบติดตามสินค้าตัวอย่าง, บัญชีผู้ใช้, และการเพิ่มรายชื่อสาขา/คลังจัดเก็บใหม่
 */

// ชื่อชีตหลักในไฟล์ Google Sheets
const SHEET_PRODUCTS = "Products";
const SHEET_BRANCHES = "Branches";
const SHEET_PLACEMENT = "Current_Placement";
const SHEET_HISTORY = "Scan_History";
const SHEET_USERS = "Users";

/**
 * สคริปต์ทำงานอัตโนมัติเมื่อสร้างไฟล์ครั้งแรก - สร้าง Header ในแต่ละชีต
 */
function setupDatabaseSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Sheet Products
  let pSheet = ss.getSheetByName(SHEET_PRODUCTS) || ss.insertSheet(SHEET_PRODUCTS);
  if (pSheet.getLastRow() === 0) {
    pSheet.appendRow(["item_code", "item_name", "category", "spec_details", "image_url", "created_at"]);
    pSheet.getRange(1, 1, 1, 6).setFontWeight("bold").setBackground("#f1f5f9");
    pSheet.appendRow(["WD-SMP-001", "ไม้พื้นลามิเนต Oak Natural 12mm", "ไม้พื้น (Flooring)", "สีโอ๊คธรรมชาติ AC4", "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=300&q=80", new Date()]);
  }

  // 2. Sheet Branches
  let bSheet = ss.getSheetByName(SHEET_BRANCHES) || ss.insertSheet(SHEET_BRANCHES);
  if (bSheet.getLastRow() === 0) {
    bSheet.appendRow(["branch_id", "branch_name", "contact_person", "phone", "address", "map_link"]);
    bSheet.getRange(1, 1, 1, 6).setFontWeight("bold").setBackground("#f1f5f9");
    bSheet.appendRow(["BR-01", "สาขาบางนา (Showroom Bangna)", "คุณสมหญิง", "02-111-1111", "ถนนบางนา-ตราด กม. 4", "https://maps.app.goo.gl/pgGLhCyUzDWaEo9r9"]);
    bSheet.appendRow(["BR-02", "สาขารามอินทรา (Ramindra)", "คุณวิชัย", "02-222-2222", "ถนนรามอินทรา กม. 8", "https://maps.google.com/?q=13.847,100.655"]);
    bSheet.appendRow(["BR-03", "สาขาภูเก็ต (Phuket Branch)", "คุณอนันต์", "076-333-333", "อ.เมือง จ.ภูเก็ต", "https://maps.google.com/?q=7.880,98.392"]);
    bSheet.appendRow(["BR-04", "คลังสินค้าหลัก (Central Warehouse)", "คุณสมชาย", "02-444-4444", "กิ่งแก้ว สมุทรปราการ", "https://maps.google.com/?q=13.606,100.742"]);
  } else {
    // Auto upgrade header row 1 to include map_link column 6 if missing
    const headerRow = bSheet.getRange(1, 1, 1, 6).getValues()[0];
    if (!headerRow[5] || headerRow[5] === '') {
      bSheet.getRange(1, 6).setValue("map_link").setFontWeight("bold").setBackground("#f1f5f9");
    }
  }

  // 3. Sheet Current_Placement
  let placeSheet = ss.getSheetByName(SHEET_PLACEMENT) || ss.insertSheet(SHEET_PLACEMENT);
  if (placeSheet.getLastRow() === 0) {
    placeSheet.appendRow(["item_code", "current_branch_id", "location_detail", "status", "updated_by", "updated_at", "notes"]);
    placeSheet.getRange(1, 1, 1, 7).setFontWeight("bold").setBackground("#f1f5f9");
    placeSheet.appendRow(["WD-SMP-001", "BR-01", "ชั้นวาง A2 โซนหน้าโชว์รูม", "On Display", "สมหญิง ใจดี (บางนา)", new Date(), "ตัวอย่างติดป้ายราคาสมบูรณ์"]);
  }

  // 4. Sheet Scan_History
  let logSheet = ss.getSheetByName(SHEET_HISTORY) || ss.insertSheet(SHEET_HISTORY);
  if (logSheet.getLastRow() === 0) {
    logSheet.appendRow(["log_id", "timestamp", "item_code", "item_name", "action_type", "branch_id", "location_detail", "status", "staff_name", "notes"]);
    logSheet.getRange(1, 1, 1, 10).setFontWeight("bold").setBackground("#f1f5f9");
  }

  // 5. Sheet Users (เก็บบัญชีผู้ใช้และรหัสผ่าน)
  let uSheet = ss.getSheetByName(SHEET_USERS) || ss.insertSheet(SHEET_USERS);
  if (uSheet.getLastRow() === 0) {
    uSheet.appendRow(["user_id", "username", "password", "name", "role", "branch_id", "created_at"]);
    uSheet.getRange(1, 1, 1, 7).setFontWeight("bold").setBackground("#f1f5f9");
    uSheet.appendRow(["U001", "admin", "admin123", "ผู้ดูแลระบบ (Central Admin)", "admin", "BR-04", new Date()]);
    uSheet.appendRow(["U002", "staff_bangna", "staff123", "สมหญิง ใจดี (บางนา)", "staff", "BR-01", new Date()]);
    uSheet.appendRow(["U003", "staff_ramindra", "staff123", "วิชัย มั่นคง (รามอินทรา)", "staff", "BR-02", new Date()]);
  }
}

/**
 * REST API Endpoint GET Requests
 */
function doGet(e) {
  setupDatabaseSheets();
  const action = e ? e.parameter.action : '';
  
  if (action === 'getProducts') {
    return respondJson(getAllProductsWithLocation());
  } else if (action === 'getUsers') {
    return respondJson({ status: 'success', users: getAllUsers() });
  } else if (action === 'getBranches') {
    return respondJson({ status: 'success', branches: getAllBranches() });
  } else if (action === 'getLogs') {
    return respondJson({ status: 'success', logs: getScanLogs() });
  }

  return respondJson({
    status: 'online',
    appName: 'Wood Exc Sample Tracker Backend API with Auth & Branch Management',
    time: new Date().toString()
  });
}

/**
 * REST API Endpoint POST Requests
 */
function doPost(e) {
  setupDatabaseSheets();
  try {
    const postData = JSON.parse(e.postData.contents);
    const action = postData.action;

    if (action === 'updateLocation') {
      updateLocationAndLog(postData.product, postData.log);
      return respondJson({ status: 'success', message: 'Location updated' });
    } else if (action === 'addProduct') {
      createNewProduct(postData.product);
      return respondJson({ status: 'success', message: 'New product added' });
    } else if (action === 'editProduct') {
      updateProductDetails(postData.product);
      return respondJson({ status: 'success', message: 'Product updated' });
    } else if (action === 'addUser') {
      createNewUser(postData.user);
      return respondJson({ status: 'success', message: 'New user added' });
    } else if (action === 'addBranch') {
      createNewBranch(postData.branch);
      return respondJson({ status: 'success', message: 'New branch added' });
    } else if (action === 'updatePassword') {
      updateUserPassword(postData.username, postData.newPassword);
      return respondJson({ status: 'success', message: 'Password updated' });
    }

    return respondJson({ status: 'error', message: 'Unknown action' });
  } catch (err) {
    return respondJson({ status: 'error', message: err.toString() });
  }
}

// -----------------------------------------------------------------------------
// HELPER FUNCTIONS FOR GOOGLE SHEETS MANIPULATION
// -----------------------------------------------------------------------------

function getAllProductsWithLocation() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const pSheet = ss.getSheetByName(SHEET_PRODUCTS);
  const placeSheet = ss.getSheetByName(SHEET_PLACEMENT);

  const pData = pSheet.getDataRange().getValues();
  const placeData = placeSheet.getDataRange().getValues();

  const products = [];

  for (let i = 1; i < pData.length; i++) {
    const row = pData[i];
    const code = row[0];
    if (!code) continue;

    let placementInfo = {
      branch: 'BR-04',
      location: 'คลังสินค้าหลัก',
      status: 'In Storage',
      updatedBy: 'System',
      updatedAt: '-',
      notes: ''
    };

    for (let j = 1; j < placeData.length; j++) {
      if (placeData[j][0] === code) {
        placementInfo = {
          branch: placeData[j][1],
          location: placeData[j][2],
          status: placeData[j][3],
          updatedBy: placeData[j][4],
          updatedAt: Utilities.formatDate(new Date(placeData[j][5]), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss"),
          notes: placeData[j][6]
        };
        break;
      }
    }

    products.push({
      code: code,
      name: row[1],
      category: row[2],
      spec: row[3],
      img: row[4],
      branch: placementInfo.branch,
      location: placementInfo.location,
      status: placementInfo.status,
      updatedBy: placementInfo.updatedBy,
      updatedAt: placementInfo.updatedAt,
      notes: placementInfo.notes
    });
  }

  return { status: 'success', products: products };
}

function updateLocationAndLog(product, log) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const placeSheet = ss.getSheetByName(SHEET_PLACEMENT);
  const logSheet = ss.getSheetByName(SHEET_HISTORY);

  const placeData = placeSheet.getDataRange().getValues();
  let foundRow = -1;

  for (let i = 1; i < placeData.length; i++) {
    if (placeData[i][0] === product.code) {
      foundRow = i + 1;
      break;
    }
  }

  const now = new Date();

  if (foundRow > -1) {
    placeSheet.getRange(foundRow, 2, 1, 6).setValues([[
      product.branch,
      product.location,
      product.status,
      product.updatedBy,
      now,
      product.notes || ''
    ]]);
  } else {
    placeSheet.appendRow([
      product.code,
      product.branch,
      product.location,
      product.status,
      product.updatedBy,
      now,
      product.notes || ''
    ]);
  }

  logSheet.appendRow([
    log ? log.id : ('LOG-' + Math.floor(Math.random() * 1000000)),
    now,
    product.code,
    product.name,
    'UPDATE_LOCATION',
    product.branch,
    product.location,
    product.status,
    product.updatedBy,
    product.notes || ''
  ]);
}

function createNewProduct(product) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const pSheet = ss.getSheetByName(SHEET_PRODUCTS);
  const placeSheet = ss.getSheetByName(SHEET_PLACEMENT);
  const now = new Date();

  pSheet.appendRow([
    product.code,
    product.name,
    product.category,
    product.spec,
    product.img,
    now
  ]);

  placeSheet.appendRow([
    product.code,
    product.branch,
    product.location,
    product.status || 'On Display',
    product.updatedBy || 'Admin',
    now,
    'เพิ่มสินค้าใหม่'
  ]);
}

function updateProductDetails(product) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const pSheet = ss.getSheetByName(SHEET_PRODUCTS);
  const placeSheet = ss.getSheetByName(SHEET_PLACEMENT);

  const pData = pSheet.getDataRange().getValues();
  for (let i = 1; i < pData.length; i++) {
    if (pData[i][0] === product.code) {
      pSheet.getRange(i + 1, 2, 1, 4).setValues([[
        product.name,
        product.category,
        product.spec,
        product.img
      ]]);
      break;
    }
  }

  const placeData = placeSheet.getDataRange().getValues();
  for (let j = 1; j < placeData.length; j++) {
    if (placeData[j][0] === product.code) {
      placeSheet.getRange(j + 1, 2, 1, 6).setValues([[
        product.branch,
        product.location,
        product.status || 'On Display',
        product.updatedBy || 'Admin',
        new Date(),
        product.notes || ''
      ]]);
      break;
    }
  }
}

function getAllUsers() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const uSheet = ss.getSheetByName(SHEET_USERS);
  const data = uSheet.getDataRange().getValues();

  const users = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[1]) continue;

    users.push({
      userId: row[0],
      username: row[1],
      password: row[2],
      name: row[3],
      role: row[4],
      branch: row[5],
      createdAt: Utilities.formatDate(new Date(row[6]), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss")
    });
  }
  return users;
}

function createNewUser(user) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const uSheet = ss.getSheetByName(SHEET_USERS);
  const now = new Date();

  uSheet.appendRow([
    user.userId,
    user.username,
    user.password,
    user.name,
    user.role,
    user.branch,
    now
  ]);
}

function getAllBranches() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const bSheet = ss.getSheetByName(SHEET_BRANCHES);
  const data = bSheet.getDataRange().getValues();

  const branches = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue;
    branches.push({
      id: row[0],
      name: row[1],
      contact: row[2],
      phone: row[3],
      address: row[4],
      mapLink: row[5] || ''
    });
  }
  return branches;
}

function createNewBranch(branch) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const bSheet = ss.getSheetByName(SHEET_BRANCHES);

  // Auto ensure column 6 has map_link header
  const headerRow = bSheet.getRange(1, 1, 1, 6).getValues()[0];
  if (!headerRow[5] || headerRow[5] === '') {
    bSheet.getRange(1, 6).setValue("map_link").setFontWeight("bold").setBackground("#f1f5f9");
  }

  const data = bSheet.getDataRange().getValues();
  let foundRow = -1;

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === branch.id || (branch.name && data[i][1] === branch.name)) {
      foundRow = i + 1;
      break;
    }
  }

  if (foundRow > -1) {
    bSheet.getRange(foundRow, 1, 1, 6).setValues([[
      branch.id,
      branch.name,
      '-',
      '-',
      branch.address || '',
      branch.mapLink || ''
    ]]);
  } else {
    bSheet.appendRow([
      branch.id,
      branch.name,
      '-',
      '-',
      branch.address || '',
      branch.mapLink || ''
    ]);
  }
}

function updateUserPassword(username, newPassword) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const uSheet = ss.getSheetByName(SHEET_USERS);
  const data = uSheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === username) {
      uSheet.getRange(i + 1, 3).setValue(newPassword);
      break;
    }
  }
}

function getScanLogs() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const logSheet = ss.getSheetByName(SHEET_HISTORY);
  const data = logSheet.getDataRange().getValues();

  const logs = [];
  for (let i = data.length - 1; i >= 1; i--) {
    const row = data[i];
    if (!row[0]) continue;

    logs.push({
      id: row[0],
      timestamp: Utilities.formatDate(new Date(row[1]), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss"),
      code: row[2],
      name: row[3],
      action: row[4],
      branch: row[5],
      location: row[6],
      status: row[7],
      staff: row[8],
      notes: row[9]
    });
  }

  return logs;
}

function respondJson(dataObj) {
  return ContentService
    .createTextOutput(JSON.stringify(dataObj))
    .setMimeType(ContentService.MimeType.JSON);
}
