
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';


export async function downloadExcelTemplate(filename, headers, sampleRow) {
  const ws = XLSX.utils.aoa_to_sheet([headers, sampleRow]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  XLSX.writeFile(wb, filename);
}

export async function exportAoaExcel(filename, sheetName, aoa) {
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName || "Sheet1");
  XLSX.writeFile(wb, filename);
}

export async function exportExcel(filename, sheetName, rows) {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName || "Sheet1");
  XLSX.writeFile(wb, filename);
}


export async function pickExcelFile() {
  return new Promise((resolve) => {
    const inp = document.createElement("input");
    inp.type = "file";
    inp.accept = ".xlsx,.xls,.csv";
    inp.onchange = async () => {
      const f = inp.files?.[0];
      if (!f) return resolve(null);
      const buf = await f.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { defval: "" });
      resolve(rows);
    };
    inp.click();
  });
}



function escapeHtml(v) {
  return String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}


export async function exportPdfTable(filename, title, columns, rows) {
  const head = columns.map(c => `<th>${escapeHtml(c.header)}</th>`).join("");
  const body = rows.map(r =>
    `<tr>${columns.map(c => `<td>${escapeHtml(r[c.key] ?? "")}</td>`).join("")}</tr>`
  ).join("");

  const today = new Date();
  const dateStr = today.toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const timeStr = today.toLocaleTimeString('ar-EG', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const displayName = filename.replace(/\.pdf$/i, '');

  const html = `<!doctype html>
<html dir="rtl" lang="ar">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(title)} - ${dateStr}</title>
<style>
  @page { 
    size: A4 landscape; 
    margin: 12mm;
  }
  
  * { 
    box-sizing: border-box; 
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  
  body {
    font-family: "Cairo","Tajawal","Segoe UI","Arial",sans-serif;
    direction: rtl;
    color: #111;
    margin: 0;
    padding: 16px;
    background: #fff;
  }
  
  h1 { 
    text-align: center; 
    font-size: 22px; 
    margin: 0 0 8px; 
    color: #1e40af;
  }
  
  .report-info {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: #555;
    margin: 8px 0 16px;
    padding: 10px 16px;
    background: #f0f4ff;
    border-radius: 8px;
    border: 1px solid #dbeafe;
  }
  
  .subtitle {
    text-align: center;
    font-size: 14px;
    color: #666;
    margin-bottom: 20px;
  }
  
  table { 
    width: 100%; 
    border-collapse: collapse; 
    font-size: 12px; 
  }
  
  th, td { 
    border: 1px solid #999; 
    padding: 8px 10px; 
    text-align: right; 
  }
  
  th { 
    background: #1e40af !important; 
    color: #fff !important; 
    font-weight: bold;
  }
  
  tr:nth-child(even) td { 
    background: #f5f7fb; 
  }
  
  tr:hover td {
    background: #e8edf9;
  }
  
  .actions { 
    text-align: center; 
    margin: 16px 0; 
  }
  
  .actions button {
    padding: 10px 24px; 
    border: 0; 
    border-radius: 8px;
    background: #1e40af; 
    color: #fff; 
    cursor: pointer; 
    font-size: 14px;
    font-weight: bold;
    transition: background 0.3s;
  }
  
  .actions button:hover {
    background: #1e3a8a;
  }
  
  .footer {
    text-align: center;
    font-size: 10px;
    color: #999;
    margin-top: 20px;
    border-top: 1px solid #ddd;
    padding-top: 10px;
  }
  
  @media print { 
    .actions { display: none; } 
    body { background: #fff !important; }
    .report-info {
      background: #f0f4ff !important;
      border: 1px solid #dbeafe !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    th { 
      background: #1e40af !important; 
      color: #fff !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    tr:nth-child(even) td { 
      background: #f5f7fb !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
  }
</style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  
  <div class="report-info">
    <span>التاريخ: ${dateStr}</span>
    <span>الوقت: ${timeStr}</span>
    <span>عدد السجلات: ${rows.length}</span>
  </div>
  
  <div class="subtitle">تم التصدير بتاريخ: ${dateStr} - ${timeStr}</div>
  
  <div class="actions">
    <button onclick="window.print()">طباعة / حفظ PDF</button>
  </div>
  
  <table>
    <thead><tr>${head}</tr></thead>
    <tbody>${body || `<tr><td colspan="${columns.length}" style="text-align:center;color:#666;padding:30px;">لا توجد بيانات</td></tr>`}</tbody>
  </table>
  
  <div class="footer">${escapeHtml(displayName)} - جميع الحقوق محفوظة © ${today.getFullYear()}</div>
  
  <script>
    window.addEventListener('load', () => {
      document.title = "${escapeHtml(displayName)}";
      
      setTimeout(() => {
        window.print();
      }, 800);
    });
    
    window.addEventListener('beforeprint', () => {
      document.title = "${escapeHtml(displayName)}";
    });
  </script>
</body>
</html>`;

  const w = window.open("", "_blank", "width=800,height=600");
  if (!w) throw new Error("تعذر فتح نافذة الطباعة");
  
  w.document.open();
  w.document.write(html);
  w.document.close();
  
  try {
    w.document.title = filename;
  } catch(e) {}
}


