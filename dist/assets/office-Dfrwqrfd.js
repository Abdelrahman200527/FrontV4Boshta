import{u as b,w as g,r as x}from"./vendor-office-BojT3SgY.js";async function w(t,o,e){const c=b.aoa_to_sheet(e),r=b.book_new();b.book_append_sheet(r,c,o||"Sheet1"),g(r,t)}async function y(){return new Promise(t=>{const o=document.createElement("input");o.type="file",o.accept=".xlsx,.xls,.csv",o.onchange=async()=>{try{const e=o.files?.[0];if(!e)return t(null);if(e.size>15*1024*1024)return console.warn("Excel file exceeded safe size limit (15MB)"),t(null);const c=await e.arrayBuffer(),r=x(c,{type:"array",cellFormula:!1,cellHTML:!1}),p=r.SheetNames[0];if(!p)return t([]);const d=r.Sheets[p],f=b.sheet_to_json(d,{defval:""}).map(s=>{const u=Object.create(null);for(const[n,a]of Object.entries(s))n==="__proto__"||n==="constructor"||n==="prototype"||(u[n]=typeof a=="string"?a.trim():a);return{...u}});t(f)}catch(e){console.error("Excel parse error:",e),t(null)}},o.click()})}function i(t){return String(t??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}async function k(t,o,e,c){const r=e.map(a=>`<th>${i(a.header)}</th>`).join(""),p=c.map(a=>`<tr>${e.map(m=>`<td>${i(a[m.key]??"")}</td>`).join("")}</tr>`).join(""),d=new Date,l=d.toLocaleDateString("ar-EG",{year:"numeric",month:"long",day:"numeric"}),f=d.toLocaleTimeString("ar-EG",{hour:"2-digit",minute:"2-digit"}),s=t.replace(/\.pdf$/i,""),u=`<!doctype html>
<html dir="rtl" lang="ar">
<head>
<meta charset="utf-8" />
<title>${i(o)} - ${l}</title>
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
  <h1>${i(o)}</h1>
  
  <div class="report-info">
    <span>التاريخ: ${l}</span>
    <span>الوقت: ${f}</span>
    <span>عدد السجلات: ${c.length}</span>
  </div>
  
  <div class="subtitle">تم التصدير بتاريخ: ${l} - ${f}</div>
  
  <div class="actions">
    <button onclick="window.print()">طباعة / حفظ PDF</button>
  </div>
  
  <table>
    <thead><tr>${r}</tr></thead>
    <tbody>${p||`<tr><td colspan="${e.length}" style="text-align:center;color:#666;padding:30px;">لا توجد بيانات</td></tr>`}</tbody>
  </table>
  
  <div class="footer">${i(s)} - جميع الحقوق محفوظة © ${d.getFullYear()}</div>
  
  <script>
    window.addEventListener('load', () => {
      document.title = "${i(s)}";
      
      setTimeout(() => {
        window.print();
      }, 800);
    });
    
    window.addEventListener('beforeprint', () => {
      document.title = "${i(s)}";
    });
  <\/script>
</body>
</html>`,n=window.open("","_blank","width=800,height=600");if(!n)throw new Error("تعذر فتح نافذة الطباعة");n.document.open(),n.document.write(u),n.document.close();try{n.document.title=t}catch{}}export{w as a,k as e,y as p};
