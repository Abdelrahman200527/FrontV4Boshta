// src/utils/pdfExport.js

import html2pdf from "html2pdf.js";

const generatePDF = (element, filename) => {
  const opt = {
    margin: [10, 10],
    filename: filename,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: "mm", format: "a4", orientation: "landscape" },
  };
  html2pdf().set(opt).from(element).save();
};

const exportStudentsPDF = (students, filters = {}) => {
  const container = document.createElement("div");
  container.style.fontFamily = "Cairo, sans-serif";
  container.style.direction = "rtl";
  container.style.padding = "20px";
  container.style.background = "#fff";

  container.innerHTML = `
    <div style="text-align:center;margin-bottom:20px;">
      <h2 style="color:#9224EB;">قائمة الطلاب</h2>
      ${filters.gradeName ? `<p style="color:#666;">الصف: ${filters.gradeName}</p>` : ""}
    </div>
    <table style="width:100%;border-collapse:collapse;">
      <thead>
        <tr>
          <th style="background:#9224EB;color:#fff;padding:8px;text-align:right;">الباركود</th>
          <th style="background:#9224EB;color:#fff;padding:8px;text-align:right;">الاسم</th>
          <th style="background:#9224EB;color:#fff;padding:8px;text-align:right;">الصف</th>
          <th style="background:#9224EB;color:#fff;padding:8px;text-align:right;">المجموعة</th>
          <th style="background:#9224EB;color:#fff;padding:8px;text-align:right;">الهاتف</th>
          <th style="background:#9224EB;color:#fff;padding:8px;text-align:right;">ولي الأمر</th>
        </tr>
      </thead>
      <tbody>
        ${students
          .map(
            (s) => `
          <tr>
            <td style="padding:6px;border-bottom:1px solid #eee;">${s.barcode}</td>
            <td style="padding:6px;border-bottom:1px solid #eee;">${s.full_name}</td>
            <td style="padding:6px;border-bottom:1px solid #eee;">${s.grade_name}</td>
            <td style="padding:6px;border-bottom:1px solid #eee;">${s.group_name}</td>
            <td style="padding:6px;border-bottom:1px solid #eee;">${s.phone}</td>
            <td style="padding:6px;border-bottom:1px solid #eee;">${s.parent_phone}</td>
          </tr>
        `,
          )
          .join("")}
      </tbody>
    </table>
  `;

  document.body.appendChild(container);
  generatePDF(container, `students-list-${Date.now()}.pdf`);
  setTimeout(() => document.body.removeChild(container), 1000);
};

const exportPaymentsPDF = (payments, filters = {}) => {
  const container = document.createElement("div");
  container.style.fontFamily = "Cairo, sans-serif";
  container.style.direction = "rtl";
  container.style.padding = "20px";
  container.style.background = "#fff";

  container.innerHTML = `
    <div style="text-align:center;margin-bottom:20px;">
      <h2 style="color:#9224EB;">تقرير المدفوعات</h2>
    </div>
    <table style="width:100%;border-collapse:collapse;">
      <thead>
        <tr>
          <th style="background:#9224EB;color:#fff;padding:8px;text-align:right;">الباركود</th>
          <th style="background:#9224EB;color:#fff;padding:8px;text-align:right;">اسم الطالب</th>
          <th style="background:#9224EB;color:#fff;padding:8px;text-align:right;">المجموعة</th>
          <th style="background:#9224EB;color:#fff;padding:8px;text-align:right;">حالة الدفع</th>
          <th style="background:#9224EB;color:#fff;padding:8px;text-align:right;">المبلغ المدفوع</th>
        </tr>
      </thead>
      <tbody>
        ${payments
          .map(
            (p) => `
          <tr>
            <td style="padding:6px;border-bottom:1px solid #eee;">${p.barcode}</td>
            <td style="padding:6px;border-bottom:1px solid #eee;">${p.full_name}</td>
            <td style="padding:6px;border-bottom:1px solid #eee;">${p.group_name}</td>
            <td style="padding:6px;border-bottom:1px solid #eee;color:${p.payment_status === "paid" ? "#16a34a" : "#dc2626"};font-weight:bold;">${p.payment_status === "paid" ? "✓ مدفوع" : "✗ غير مدفوع"}</td>
            <td style="padding:6px;border-bottom:1px solid #eee;font-weight:bold;">${p.paid_amount || 0} جنيه</td>
          </tr>
        `,
          )
          .join("")}
      </tbody>
    </table>
  `;

  document.body.appendChild(container);
  generatePDF(container, `payments-report-${Date.now()}.pdf`);
  setTimeout(() => document.body.removeChild(container), 1000);
};

export { exportStudentsPDF, exportPaymentsPDF };
