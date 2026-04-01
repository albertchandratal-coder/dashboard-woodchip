/**
 * WOODCHIP MONITORING BACKEND (Google Apps Script) - MULTI-TAB SUPPORT
 * 
 * This version supports reading from all sheets (tabs) and handles the specific
 * formatting found in your existing database (e.g., "9.710 Kg", "3 Orang").
 */

function doGet(e) {
  const action = e.parameter.action;
  
  if (action === 'read') {
    return readData();
  }
  
  return ContentService.createTextOutput("WOODCHIP API is running. Use ?action=read to fetch data.")
    .setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  const action = e.parameter.action;
  
  if (action === 'write') {
    try {
      return writeData(e.postData.contents);
    } catch (err) {
      return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Invalid action' }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Reads data from ALL sheets in the spreadsheet.
 * Cleans data (removes "Kg", "Orang") and maps headers to app format.
 */
function readData() {
  try {
    // GANTI 'YOUR_SPREADSHEET_ID' dengan ID Spreadsheet Anda jika skrip tidak dibuka dari Sheet (Standalone)
    // ID ada di URL Sheet Anda: https://docs.google.com/spreadsheets/d/[ID_ADA_DI_SINI]/edit
    const SPREADSHEET_ID = ''; 
    
    let ss;
    if (SPREADSHEET_ID) {
      ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    } else {
      ss = SpreadsheetApp.getActiveSpreadsheet();
    }
    
    if (!ss) throw new Error("Spreadsheet tidak ditemukan. Masukkan SPREADSHEET_ID di baris 43 Code.gs.");
    
    const sheets = ss.getSheets();
    let allData = [];
    
    // Header mapping: Sheet Header -> App Property
    const headerMap = {
      'Tanggal': 'tanggal',
      'Tgl': 'tanggal',
      'Date': 'tanggal',
      'Nama Supir': 'namaSupir',
      'Supir': 'namaSupir',
      'Plat Mobil': 'platMobil',
      'Plat': 'platMobil',
      'Bruto': 'bruto',
      'Tara': 'tara',
      'Netto': 'netto',
      'Mesin': 'mesin',
      'Jumlah Team': 'jumlahTeam',
      'Tim': 'jumlahTeam',
      'Team Giling': 'teamGiling',
      'Nama Team': 'teamGiling',
      'Kontraktor': 'kontraktor'
    };

    sheets.forEach(sheet => {
      const data = sheet.getDataRange().getValues();
      if (data.length <= 1) return; // Skip empty sheets
      
      const headers = data[0].map(h => h.toString().trim());
      const rows = data.slice(1);
      
      rows.forEach((row, rowIndex) => {
        const obj = { id: sheet.getName() + '-' + (rowIndex + 2) }; // Unique ID based on sheet and row
        let hasData = false;
        
        headers.forEach((header, i) => {
          const appKey = headerMap[header];
          if (appKey) {
            let value = row[i];
            
            // Clean data if it's a string with units
            if (typeof value === 'string') {
              // Handle weights (Bruto, Tara, Netto)
              if (value.includes('Kg')) {
                value = value.replace('Kg', '').trim();
                // Replace "." (thousand separator) with nothing, then replace "," (decimal) with "."
                value = value.replace(/\./g, '').replace(',', '.');
                value = parseFloat(value) || 0;
              }
              // Keep "Orang" for jumlahTeam as expected by frontend
              else if (value.includes('Orang')) {
                value = value.trim();
              }
            }
            
            // If it's a number but should be jumlahTeam, add "Orang"
            if (appKey === 'jumlahTeam' && typeof value === 'number') {
              value = value + " Orang";
            }
            
            // Format date to ISO string if it's a Date object
            if (value instanceof Date) {
              value = value.toISOString().split('T')[0];
            } else if (appKey === 'tanggal' && typeof value === 'string') {
              // Try to parse string dates like DD/MM/YYYY or DD-MM-YYYY
              const parts = value.split(/[\/\-]/);
              if (parts.length === 3) {
                // Assume DD/MM/YYYY or YYYY/MM/DD
                if (parts[0].length === 4) {
                  // YYYY-MM-DD
                  value = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
                } else if (parts[2].length === 4) {
                  // DD-MM-YYYY -> YYYY-MM-DD
                  value = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                }
              }
            }
            
            obj[appKey] = value;
            if (value) hasData = true;
          }
        });
        
        if (hasData) allData.push(obj);
      });
    });
    
    // Sort by date descending
    allData.sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
    
    return ContentService.createTextOutput(JSON.stringify(allData))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Writes data to the correct sheet based on the date.
 * Format: "Month Year" (e.g., "Desember 2025")
 */
function writeData(contents) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const payload = JSON.parse(contents);
  const items = Array.isArray(payload) ? payload : [payload];
  
  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  items.forEach(item => {
    const date = new Date(item.tanggal);
    const sheetName = monthNames[date.getMonth()] + " " + date.getFullYear();
    
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(['Tanggal', 'Nama Supir', 'Plat Mobil', 'Bruto', 'Tara', 'Netto', 'Mesin', 'Jumlah Team', 'Team Giling', 'Kontraktor']);
      // Apply some basic formatting to header
      sheet.getRange(1, 1, 1, 10).setBackground('#2d5a27').setFontColor('white').setFontWeight('bold');
    }
    
    const formatNumber = (num) => {
      if (typeof num !== 'number') return num;
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    const row = [
      item.tanggal,
      item.namaSupir,
      item.platMobil,
      formatNumber(item.bruto) + " Kg",
      formatNumber(item.tara) + " Kg",
      formatNumber(item.netto) + " Kg",
      item.mesin,
      (item.jumlahTeam || "").toString().includes('Orang') ? item.jumlahTeam : item.jumlahTeam + " Orang",
      item.teamGiling,
      item.kontraktor
    ];
    
    sheet.appendRow(row);
  });
  
  return ContentService.createTextOutput(JSON.stringify({ status: 'success' }))
    .setMimeType(ContentService.MimeType.JSON);
}
