import {
  Settings as SettingsIcon, Building2, CloudUpload,
  KeyRound, Save, CheckCircle, AlertCircle,
  Link2, ShieldCheck, Power, CloudDownload
} from "lucide-react";
import { memo, useState } from "react";
import { motion } from "framer-motion";
import { Spinner, LoadingState } from "../components/Spinner";

const TABS = [
  { key: "general", label: "عام", icon: Building2 },
];

const MOCK_CENTER = { Id: 1, Name: "مركز النور التعليمي", Phone: "01012345678", Address: "القاهرة - مدينة نصر", AcademicYear: "2025/2026" };

const Field = memo(function Field({ label, hint, ...props }) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        {...props}
        className="mt-1.5 w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
      />
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
});

const Card = memo(function Card({ icon: Icon, title, subtitle, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-lg p-4 sm:p-6"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 bg-primary rounded-xl"><Icon size={18} className="text-white" /></div>
        <div>
          <h3 className="font-bold text-gray-800">{title}</h3>
          {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
        </div>
      </div>
      {children}
    </motion.div>
  );
});

function formatDateTime(value) {
  if (!value) return "لا يوجد";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("ar-EG");
}

const Settings = () => {
  const [tab, setTab] = useState("general");
  const [busy, setBusy] = useState("");

  const center = MOCK_CENTER;
  const loading = false;

  const [centerForm, setCenterForm] = useState({
    Id: center.Id,
    Name: center.Name,
    Phone: center.Phone,
    Address: center.Address,
    AcademicYear: center.AcademicYear,
  });

  // ============ No-op actions (UI only) ============
  const saveCenter = () => {};

  return (
    <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="min-h-screen">
      {/* Header */}
      <motion.header initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary rounded-2xl shadow-lg shadow-primary/30">
            <SettingsIcon size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">الإعدادات</h1>
            <p className="text-sm text-gray-500">بيانات السنتر، المنصة، المزامنة، النسخ الاحتياطي وبيانات الدخول</p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {TABS.map((item) => (
            <button key={item.key} onClick={() => setTab(item.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                tab === item.key ? "bg-primary text-white shadow-lg shadow-primary/30" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}>
              <item.icon size={16} /> {item.label}
            </button>
          ))}
        </div>
      </motion.header>

      {loading ? (
        <LoadingState label="جاري تحميل الإعدادات..." />
      ) : (
        <div className="grid grid-cols-1 gap-5 max-w-4xl">
          {/* ============ عام ============ */}
          {tab === "general" && (
            <Card icon={Building2} title="بيانات السنتر" subtitle="مرتبطة بجدول Center وبتظهر في رسائل الواتساب">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="اسم السنتر" value={centerForm.Name}
                  onChange={(e) => setCenterForm((p) => ({ ...p, Name: e.target.value }))} placeholder="اسم السنتر" />
                <Field label="رقم الهاتف" value={centerForm.Phone}
                  onChange={(e) => setCenterForm((p) => ({ ...p, Phone: e.target.value }))} placeholder="01xxxxxxxxx" />
                <Field label="العنوان" value={centerForm.Address}
                  onChange={(e) => setCenterForm((p) => ({ ...p, Address: e.target.value }))} placeholder="العنوان" />
                <Field label="العام الدراسي" value={centerForm.AcademicYear}
                  onChange={(e) => setCenterForm((p) => ({ ...p, AcademicYear: e.target.value }))} placeholder="2025/2026" />
              </div>
              <button onClick={saveCenter} disabled={busy === "center"}
                className="mt-5 flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-white font-medium hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50">
                {busy === "center" ? <Spinner size={16} className="text-white" /> : <Save size={16} />} حفظ البيانات
              </button>
            </Card>
          )}
        </div>
      )}
    </motion.section>
  );
};

export default Settings;
