
import JsBarcode from 'jsbarcode';


export function renderBarcode(svgEl, code, opts = {}) {
  if (!svgEl || !code) return;

  JsBarcode(svgEl, String(code), {
    format: "CODE128",
    width: 2,
    height: 70,
    margin: 6,
    displayValue: false,
    ...opts,
  });
}



export function printBarcodeWindow(student, centerName = "السنتر") {
  const barcode = student.barcode || "";
  const name = student.full_name || "";

  const w = window.open("", "_blank", "width=420,height=320");

  if (!w) return;

  const html = `
<!doctype html>
<html dir="rtl">
<head>
  <meta charset="utf-8">

  <title>باركود ${name}</title>

  <style>
    * {
      box-sizing: border-box;
    }

    body {
      font-family: Arial, sans-serif;
      background: #fff;
      margin: 0;
      padding: 20px;
      display: flex;
      justify-content: center;
    }

    .barcode-card {
      width: 380px;
      min-height: 250px;

      border: 1px solid #222;
      border-radius: 10px;

      padding: 18px 20px;

      text-align: center;

      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .center-name {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 8px;
    }

    .divider {
      width: 70%;
      height: 1px;
      background: #ddd;
      margin-bottom: 10px;
    }

    .student-name {
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 12px;
    }

    .barcode-wrapper {
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    #bc {
      width: 100%;
      max-width: 320px;
      height: 150px;
    }

    .barcode-number {
      margin-top: 6px;
      font-size: 14px;
      letter-spacing: 1px;
      font-family: monospace;
    }

    .footer {
      margin-top: 10px;
      font-size: 10px;
      color: #777;
    }

    @media print {
      body {
        padding: 0;
      }

      .barcode-card {
        border: 1px solid #000;
        border-radius: 0;
      }
    }
  </style>
</head>

<body>

  <div class="barcode-card">

    <div class="center-name">
      ${centerName}
    </div>

    <div class="divider"></div>

    <div class="student-name">
      ${name}
    </div>

    <div class="barcode-wrapper">
      <svg id="bc"></svg>
    </div>

    <div class="barcode-number">
      ${barcode}
    </div>

    <div class="footer">
      باركود الطالب
    </div>

  </div>

</body>
</html>

  `;

  w.document.write(html);
  w.document.close();

  w.onload = () => {
    try {
      const svg = w.document.getElementById("bc");

      if (!svg) {
        console.error("لم يتم العثور على عنصر الباركود");
        return;
      }

      JsBarcode(svg, barcode, {
        format: "CODE128",
        width: 2,
        height: 75,
        margin: 5,
        displayValue: false
      });

      setTimeout(() => {
        w.focus();
        w.print();
      }, 300);

    } catch (error) {
      console.error("خطأ في رسم الباركود:", error);
    }
  };
}
