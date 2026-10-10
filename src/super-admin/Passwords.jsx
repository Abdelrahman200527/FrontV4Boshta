import React, { useState, useEffect } from "react";
import {
  KeyRound,
  Download,
  FileText,
  Printer,
  RefreshCw,
  Search,
  ShieldCheck,
  Users,
  Layers,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Copy,
  Check,
  X,
} from "lucide-react";
import {
  getStudentsWithoutPassword,
  generatePasswordsForAll,
  generatePasswordsForGrade,
  generatePasswordsForGroup,
  generatePasswordForStudent,
  exportPasswordsPdf,
  exportPasswordsExcel,
  getAllGrades,
  getGroupsByGrade,
} from "../api/super-admin/services";
import { toast } from "sonner";

export default function SuperAdminPasswords() {
  const [studentsWithoutPwd, setStudentsWithoutPwd] = useState([]);
  const [grades, setGrades] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Generation options
  const [targetType, setTargetType] = useState("all"); // 'all' | 'grade' | 'group'
  const [selectedGradeId, setSelectedGradeId] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [generating, setGenerating] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);
  const [generatingSingleId, setGeneratingSingleId] = useState(null);
  const [copiedBarcode, setCopiedBarcode] = useState(null);

  // Modal to inspect generated passwords immediately
  const [credentialsModal, setCredentialsModal] = useState({
    isOpen: false,
    list: [],
    title: "",
  });

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [studentsRes, gradesRes] = await Promise.allSettled([
        getStudentsWithoutPassword(),
        getAllGrades(),
      ]);

      if (studentsRes.status === "fulfilled") {
        const raw = studentsRes.value;
        setStudentsWithoutPwd(Array.isArray(raw) ? raw : raw?.data || raw?.students || []);
      }
      if (gradesRes.status === "fulfilled") {
        const raw = gradesRes.value;
        const gList = Array.isArray(raw) ? raw : raw?.data || raw?.grades || [];
        setGrades(gList);
        if (gList.length > 0 && !selectedGradeId) {
          setSelectedGradeId(gList[0].id);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("فشل تحميل بيانات كلمات المرور");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  // When grade changes, fetch its groups
  useEffect(() => {
    if (selectedGradeId) {
      getGroupsByGrade(selectedGradeId)
        .then((res) => {
          const list = Array.isArray(res) ? res : res?.data || res?.groups || [];
          setGroups(list);
          if (list.length > 0) setSelectedGroupId(list[0].id);
          else setSelectedGroupId("");
        })
        .catch(() => setGroups([]));
    } else {
      setGroups([]);
      setSelectedGroupId("");
    }
  }, [selectedGradeId]);

  const handleGenerateBulk = async () => {
    let confirmMsg = "هل أنت متأكد من توليد وتحديث كلمات المرور؟";
    let scopeTitle = "جميع طلاب السنتر";
    if (targetType === "all") confirmMsg = "هل تريد توليد كلمات المرور لجميع طلاب السنتر دفعة واحدة؟";
    if (targetType === "grade") {
      confirmMsg = "هل تريد توليد كلمات المرور لجميع طلاب هذا الصف؟";
      const selG = grades.find((g) => String(g.id) === String(selectedGradeId));
      scopeTitle = selG?.name || "الصف المحدد";
    }
    if (targetType === "group") {
      confirmMsg = "هل تريد توليد كلمات المرور لجميع طلاب هذه المجموعة؟";
      const selGrp = groups.find((g) => String(g.id) === String(selectedGroupId));
      scopeTitle = selGrp?.name || "المجموعة المحددة";
    }

    if (!window.confirm(confirmMsg)) return;

    try {
      setGenerating(true);
      let res = null;
      if (targetType === "all") {
        res = await generatePasswordsForAll();
      } else if (targetType === "grade") {
        if (!selectedGradeId) {
          toast.error("يرجى تحديد الصف الدراسي أولاً");
          return;
        }
        res = await generatePasswordsForGrade(selectedGradeId);
      } else if (targetType === "group") {
        if (!selectedGroupId) {
          toast.error("يرجى تحديد المجموعة الدراسية أولاً");
          return;
        }
        res = await generatePasswordsForGroup(selectedGroupId);
      }

      toast.success("تم توليد كلمات المرور بنجاح");
      fetchInitialData();

      const pwdList = res?.data?.passwords || res?.passwords || [];
      if (Array.isArray(pwdList) && pwdList.length > 0) {
        setCredentialsModal({
          isOpen: true,
          list: pwdList,
          title: `بيانات الدخول المولدة (${scopeTitle} - ${pwdList.length} طالب)`,
        });
      }
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "فشل توليد كلمات المرور");
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateSingle = async (studentId) => {
    try {
      setGeneratingSingleId(studentId);
      const res = await generatePasswordForStudent(studentId);
      toast.success("تم توليد كلمة المرور للطالب بنجاح");
      setStudentsWithoutPwd((prev) => prev.filter((s) => s.id !== studentId));

      const singleStudent = res?.data || res;
      if (singleStudent && (singleStudent.password || singleStudent.barcode)) {
        setCredentialsModal({
          isOpen: true,
          list: [singleStudent],
          title: `بيانات دخول الطالب: ${singleStudent.full_name || "طالب"}`,
        });
      }
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "فشل توليد كلمة المرور للطالب");
    } finally {
      setGeneratingSingleId(null);
    }
  };

  const handleExportPdf = async () => {
    try {
      setExportingPdf(true);
      toast.info("جاري تجهيز تقرير كروت الباركود للطباعة...");
      await exportPasswordsPdf({
        targetType,
        gradeId: selectedGradeId,
        groupId: selectedGroupId,
      });
      toast.success("تم فتح تقرير كروت الطباعة بنجاح");
    } catch (err) {
      toast.error("فشل تصدير كروت الطباعة");
    } finally {
      setExportingPdf(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      setExportingExcel(true);
      toast.info("جاري تجهيز وتحميل ملف Excel...");
      await exportPasswordsExcel({
        targetType,
        gradeId: selectedGradeId,
        groupId: selectedGroupId,
      });
      toast.success("تم تصدير كشف الباسوردات الإكسيل بنجاح");
    } catch (err) {
      toast.error("فشل تصدير ملف Excel");
    } finally {
      setExportingExcel(false);
    }
  };

  const copyToClipboard = (text, barcodeKey) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedBarcode(barcodeKey);
    toast.success("تم النسخ إلى الحافظة");
    setTimeout(() => setCopiedBarcode(null), 2500);
  };

  const copyAllCredentials = () => {
    if (!credentialsModal.list.length) return;
    const text = credentialsModal.list
      .map(
        (st) =>
          `الاسم: ${st.full_name}\nالباركود: ${st.barcode}\nكلمة المرور: ${st.password || "غير متوفرة"}\n---`
      )
      .join("\n\n");
    navigator.clipboard.writeText(text);
    toast.success("تم نسخ جميع الحسابات إلى الحافظة بنجاح");
  };

  const filteredStudents = studentsWithoutPwd.filter((s) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    return (
      (s.full_name && s.full_name.toLowerCase().includes(q)) ||
      (s.barcode && s.barcode.toLowerCase().includes(q)) ||
      (s.phone && s.phone.includes(q)) ||
      (s.parent_phone && s.parent_phone.includes(q))
    );
  });

  return (
    <div className="space-y-6 pb-12 font-sans" dir="rtl">
      {/* Top Header */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#1a5d1a]/10 text-[#1a5d1a] text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
              <ShieldCheck size={14} />
              منظومة الأمان والبطاقات التعريفية
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 flex items-center gap-2">
            <KeyRound size={24} className="text-[#1a5d1a]" />
            توليد كلمات المرور وكروت الباركود للطلاب
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 font-normal">
            توليد حسابات الدخول للسنتر بالجملة وتصدير كروت الطباعة الجاهزة للتوزيع بصيغتي PDF و Excel.
          </p>
        </div>

        <button
          onClick={fetchInitialData}
          disabled={loading}
          className="p-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl transition border border-gray-200 self-end sm:self-auto"
          title="تحديث البيانات"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Bulk Generator Card */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#1a5d1a] flex items-center justify-center">
              <KeyRound size={18} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 text-base">توليد كلمات المرور بالجملة</h3>
              <p className="text-xs text-gray-400 font-normal">حدد نطاق التوليد ثم اضغط توليد كلمات المرور.</p>
            </div>
          </div>
        </div>

        {/* Target Scope Radios */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label
            className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
              targetType === "all"
                ? "bg-emerald-50/80 border-[#1a5d1a] text-[#1a5d1a] font-medium"
                : "border-gray-200 hover:bg-gray-50 text-gray-700"
            }`}
          >
            <input
              type="radio"
              name="targetType"
              value="all"
              checked={targetType === "all"}
              onChange={() => setTargetType("all")}
              className="accent-[#1a5d1a]"
            />
            <Users size={18} />
            <span>جميع طلاب السنتر دفعة واحدة</span>
          </label>

          <label
            className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
              targetType === "grade"
                ? "bg-emerald-50/80 border-[#1a5d1a] text-[#1a5d1a] font-medium"
                : "border-gray-200 hover:bg-gray-50 text-gray-700"
            }`}
          >
            <input
              type="radio"
              name="targetType"
              value="grade"
              checked={targetType === "grade"}
              onChange={() => setTargetType("grade")}
              className="accent-[#1a5d1a]"
            />
            <GraduationCap size={18} />
            <span>صف دراسي محدد</span>
          </label>

          <label
            className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
              targetType === "group"
                ? "bg-emerald-50/80 border-[#1a5d1a] text-[#1a5d1a] font-medium"
                : "border-gray-200 hover:bg-gray-50 text-gray-700"
            }`}
          >
            <input
              type="radio"
              name="targetType"
              value="group"
              checked={targetType === "group"}
              onChange={() => setTargetType("group")}
              className="accent-[#1a5d1a]"
            />
            <Layers size={18} />
            <span>مجموعة دراسية محددة</span>
          </label>
        </div>

        {/* Dynamic Selectors for Grade / Group */}
        {(targetType === "grade" || targetType === "group") && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">اختر الصف الدراسي</label>
              <select
                value={selectedGradeId}
                onChange={(e) => setSelectedGradeId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:border-[#1a5d1a]"
              >
                {grades.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name || g.grade_name}
                  </option>
                ))}
              </select>
            </div>

            {targetType === "group" && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">اختر المجموعة الدراسية</label>
                <select
                  value={selectedGroupId}
                  onChange={(e) => setSelectedGroupId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:border-[#1a5d1a]"
                >
                  {groups.length === 0 ? (
                    <option value="">لا توجد مجموعات مسجلة لهذا الصف</option>
                  ) : (
                    groups.map((grp) => (
                      <option key={grp.id} value={grp.id}>
                        {grp.name || grp.group_name}
                      </option>
                    ))
                  )}
                </select>
              </div>
            )}
          </div>
        )}

        {/* Buttons Row */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleGenerateBulk}
            disabled={generating}
            className="flex-1 sm:flex-none px-6 py-3 bg-[#1a5d1a] hover:bg-[#124112] text-white rounded-xl text-sm font-medium shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <KeyRound size={16} />
            {generating ? "جاري التوليد..." : "توليد كلمات المرور الآن"}
          </button>

          <button
            onClick={handleExportPdf}
            disabled={exportingPdf}
            className="flex-1 sm:flex-none px-5 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Printer size={16} />
            {exportingPdf ? "جاري التصدير..." : "طباعة كروت الباركود (PDF)"}
          </button>

          <button
            onClick={handleExportExcel}
            disabled={exportingExcel}
            className="flex-1 sm:flex-none px-5 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-medium shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <FileSpreadsheet size={16} />
            {exportingExcel ? "جاري التصدير..." : "تصدير شيت الباسوردات (Excel)"}
          </button>
        </div>
      </div>

      {/* Students Without Password Table */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-800 text-base">
                الطلاب الذين لم يسجلوا دخولاً / بدون كلمة مرور
              </h3>
              <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {studentsWithoutPwd.length} طالب
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              قائمة بالطلاب المسجلين الذين يحتاجون إلى توليد أو توزيع كلمة مرور لأول مرة.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="بحث بالاسم أو الباركود..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#1a5d1a]"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500 font-medium">جاري فحص قائمة الطلاب...</div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <CheckCircle2 size={36} className="text-emerald-500 mx-auto" />
            <p className="text-sm font-medium text-gray-700">ممتاز! لا يوجد طلاب بدون كلمة مرور حالياً.</p>
            <p className="text-xs text-gray-400">جميع الطلاب المسجلين تم توليد كلمات مرور لهم بنجاح.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs sm:text-sm">
              <thead className="bg-gray-50/80 text-gray-500 text-xs font-semibold border-b border-gray-100">
                <tr>
                  <th className="py-3 px-4">كود الطالب (الباركود)</th>
                  <th className="py-3 px-4">اسم الطالب</th>
                  <th className="py-3 px-4">الصف الدراسي</th>
                  <th className="py-3 px-4">رقم الموبايل</th>
                  <th className="py-3 px-4">موبايل ولي الأمر</th>
                  <th className="py-3 px-4 text-center">إجراء فوري</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredStudents.map((st) => (
                  <tr key={st.id} className="hover:bg-gray-50/80 transition">
                    <td className="py-3 px-4 font-mono font-medium text-[#1a5d1a]">
                      {st.barcode || st.code || `#${st.id}`}
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900">{st.full_name || st.name}</td>
                    <td className="py-3 px-4 text-gray-600">{st.grade_name || st.grade?.name || "الصف الدراسي"}</td>
                    <td className="py-3 px-4 font-mono text-gray-600" dir="ltr">
                      {st.phone || "-"}
                    </td>
                    <td className="py-3 px-4 font-mono text-gray-600" dir="ltr">
                      {st.parent_phone || "-"}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleGenerateSingle(st.id)}
                        disabled={generatingSingleId === st.id}
                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-medium transition border border-emerald-200"
                      >
                        {generatingSingleId === st.id ? "جاري التوليد..." : "توليد باسورد"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Generated Credentials Inspector Modal */}
      {credentialsModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#1a5d1a] flex items-center justify-center">
                  <KeyRound size={18} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                    {credentialsModal.title || "بيانات الدخول المولدة"}
                  </h3>
                  <p className="text-xs text-gray-500 font-normal">
                    يمكنك نسخ البيانات مباشرة أو طباعة كروت الدخول للطلاب.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCredentialsModal({ isOpen: false, list: [], title: "" })}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick Actions Bar */}
            <div className="p-3 sm:p-4 bg-gray-50/80 border-b border-gray-100 flex flex-wrap items-center justify-between gap-2.5">
              <div className="text-xs font-medium text-gray-600">
                العدد المولد: <span className="text-[#1a5d1a] font-semibold">{credentialsModal.list.length} حساب</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={copyAllCredentials}
                  className="px-3 py-1.5 bg-white hover:bg-gray-100 text-gray-700 rounded-lg text-xs font-medium border border-gray-200 transition flex items-center gap-1.5 shadow-sm"
                >
                  <Copy size={13} />
                  نسخ الكل كبيانات نصية
                </button>
                <button
                  onClick={handleExportPdf}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium transition flex items-center gap-1.5 shadow-sm"
                >
                  <Printer size={13} />
                  طباعة الكروت (PDF)
                </button>
                <button
                  onClick={handleExportExcel}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-medium transition flex items-center gap-1.5 shadow-sm"
                >
                  <FileSpreadsheet size={13} />
                  تصدير شيت (Excel)
                </button>
              </div>
            </div>

            {/* Table of Passwords */}
            <div className="overflow-y-auto flex-1 p-3 sm:p-5">
              <div className="overflow-x-auto border border-gray-100 rounded-xl">
                <table className="w-full text-right text-xs sm:text-sm">
                  <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                    <tr>
                      <th className="py-2.5 px-3">اسم الطالب</th>
                      <th className="py-2.5 px-3">الباركود</th>
                      <th className="py-2.5 px-3">كلمة المرور المؤقتة</th>
                      <th className="py-2.5 px-3 text-center">نسخ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-sans">
                    {credentialsModal.list.map((st, i) => (
                      <tr key={i} className="hover:bg-slate-50/70 transition">
                        <td className="py-2.5 px-3 font-medium text-gray-900">{st.full_name || st.name}</td>
                        <td className="py-2.5 px-3 font-mono text-[#1a5d1a] font-medium" dir="ltr">
                          {st.barcode || `#${st.student_id}`}
                        </td>
                        <td className="py-2.5 px-3 font-mono bg-emerald-50/50 text-emerald-900 font-semibold" dir="ltr">
                          {st.password || "تم تعيينها"}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            onClick={() =>
                              copyToClipboard(
                                `الاسم: ${st.full_name}\nالباركود: ${st.barcode}\nكلمة المرور: ${st.password || ""}`,
                                st.barcode || String(i)
                              )
                            }
                            title="نسخ بيانات الدخول"
                            className="p-1.5 text-gray-500 hover:text-[#1a5d1a] hover:bg-emerald-50 rounded-lg transition inline-flex items-center"
                          >
                            {copiedBarcode === (st.barcode || String(i)) ? (
                              <Check size={14} className="text-emerald-600" />
                            ) : (
                              <Copy size={14} />
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 sm:p-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setCredentialsModal({ isOpen: false, list: [], title: "" })}
                className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs sm:text-sm font-medium transition"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
