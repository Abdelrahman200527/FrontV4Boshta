import{u as c,w as g,r as x}from"./vendor-office-BojT3SgY.js";async function w(o,t,e){const a=c.aoa_to_sheet(e),n=c.book_new();c.book_append_sheet(n,a,t||"Sheet1"),g(n,o)}async function y(){return new Promise(o=>{const t=document.createElement("input");t.type="file",t.accept=".xlsx,.xls,.csv",t.onchange=async()=>{const e=t.files?.[0];if(!e)return o(null);const a=await e.arrayBuffer(),n=x(a,{type:"array"}),p=n.Sheets[n.SheetNames[0]],i=c.sheet_to_json(p,{defval:""});o(i)},t.click()})}function r(o){return String(o??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}async function k(o,t,e,a){const n=e.map(f=>`<th>${r(f.header)}</th>`).join(""),p=a.map(f=>`<tr>${e.map(m=>`<td>${r(f[m.key]??"")}</td>`).join("")}</tr>`).join(""),i=new Date,s=i.toLocaleDateString("ar-EG",{year:"numeric",month:"long",day:"numeric"}),b=i.toLocaleTimeString("ar-EG",{hour:"2-digit",minute:"2-digit"}),l=o.replace(/\.pdf$/i,""),u=`<!doctype html>
<html dir="rtl" lang="ar">
<head>
<meta charset="utf-8" />
<title>${r(t)} - ${s}</title>
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
    color: #009966;
  }
  
  .report-info {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: #555;
    margin: 8px 0 16px;
    padding: 10px 16px;
    background: #f0fdf4;
    border-radius: 8px;
    border: 1px solid #bbf7d0;
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
    border: 1px solid #cbd5e1; 
    padding: 8px 10px; 
    text-align: right; 
  }
  
  th { 
    background: #009966 !important; 
    color: #fff !important; 
    font-weight: bold;
  }
  
  tr:nth-child(even) td { 
    background: #f8fafc; 
  }
  
  tr:hover td {
    background: #f1f5f9;
  }
  
  .actions { 
    text-align: center; 
    margin: 16px 0; 
  }
  
  .actions button {
    padding: 10px 24px; 
    border: 0; 
    border-radius: 8px;
    background: #009966; 
    color: #fff; 
    cursor: pointer; 
    font-size: 14px;
    font-weight: bold;
    transition: background 0.3s;
  }
  
  .actions button:hover {
    background: #007a52;
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
      background: #f0fdf4 !important;
      border: 1px solid #bbf7d0 !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    th { 
      background: #009966 !important; 
      color: #fff !important; 
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    tr:nth-child(even) td { 
      background: #f8fafc !important; 
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
  }
</style>
</head>
<body>
  <h1>${r(t)}</h1>
  
  <div class="report-info">
    <span>التاريخ: ${s}</span>
    <span>الوقت: ${b}</span>
    <span>عدد السجلات: ${a.length}</span>
  </div>
  
  <div class="subtitle">تم التصدير بتاريخ: ${s} - ${b}</div>
  
  <div class="actions">
    <button onclick="window.print()">طباعة / حفظ PDF</button>
  </div>
  
  <table>
    <thead><tr>${n}</tr></thead>
    <tbody>${p||`<tr><td colspan="${e.length}" style="text-align:center;color:#666;padding:30px;">لا توجد بيانات</td></tr>`}</tbody>
  </table>
  
  <div class="footer">${r(l)} - جميع الحقوق محفوظة © ${i.getFullYear()}</div>
  
  <script>
    window.addEventListener('load', () => {
      document.title = "${r(l)}";
      
      setTimeout(() => {
        window.print();
      }, 800);
    });
    
    window.addEventListener('beforeprint', () => {
      document.title = "${r(l)}";
    });
  <\/script>
</body>
</html>`,d=window.open("","_blank","width=800,height=600");if(!d)throw new Error("تعذر فتح نافذة الطباعة");d.document.open(),d.document.write(u),d.document.close();try{d.document.title=o}catch{}}export{w as a,k as e,y as p};
