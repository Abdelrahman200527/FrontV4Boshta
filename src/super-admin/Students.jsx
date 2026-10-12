import React, { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  Search,
  Download,
  Upload,
  FileSpreadsheet,
  Printer,
  KeyRound,
  Eye,
  Edit,
  Trash2,
  RotateCcw,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Filter,
  RefreshCw,
  Phone,
  Barcode,
  GraduationCap,
  Layers,
  CalendarCheck2,
  BadgeDollarSign,
  FileCheck2,
  BookOpen,
  Video,
  X,
  Lock,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  getAllStudents,
  getDeletedStudents,
  createStudent,
  updateStudent,
  toggleStudentStatus,
  resetStudentPassword,
  deleteStudent,
  restoreStudent,
  downloadStudentsTemplate,
  bulkUploadStudents,
  exportStudentsExcel,
  exportStudentsPdf,
  getAllGrades,
  getGroupsByGrade,
  getStudentProfile,
  getStudentStats,
  getStudentAttendanceRecords,
  getStudentPaymentRecords,
  getStudentPaperExamRecords,
  getStudentOnlineExamRecords,
  getStudentSubmissions,
  getStudentPlaylists,
} from "../api/super-admin/services";
import { toast } from "sonner";
import { isValidEgyptianPhone, normalizePhone } from "../utils/validators";

export default function SuperAdminStudents() {
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("all");
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [statusFilter, setStatusFilter] = useState("active"); // 'active' | 'frozen' | 'deleted' | 'all'
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  // Selected student for editing/profiling
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [statusReason, setStatusReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Form data for create/edit
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    parent_phone: "",
    grade_id: "",
    group_id: "",
    barcode: "",
  });

  // Bulk upload file
  const [bulkFile, setBulkFile] = useState(null);
  const [uploadingBulk, setUploadingBulk] = useState(false);

  // 360 Profile details
  const [profileData, setProfileData] = useState(null);
  const [profileStats, setProfileStats] = useState(null);
  const [activeProfileTab, setActiveProfileTab] = useState("attendance");
  const [profileAttendance, setProfileAttendance] = useState([]);
  const [profilePayments, setProfilePayments] = useState([]);
  const [profilePaperExams, setProfilePaperExams] = useState([]);
  const [profileOnlineExams, setProfileOnlineExams] = useState([]);
  const [profileSubmissions, setProfileSubmissions] = useState([]);
  const [profilePlaylists, setProfilePlaylists] = useState([]);
  const [loadingProfileTab, setLoadingProfileTab] = useState(false);

  // Fetch Grades list
  useEffect(() => {
    getAllGrades()
      .then((res) => {
        const list = Array.isArray(res) ? res : res?.data || res?.grades || [];
        setGrades(list);
      })
      .catch(() => setGrades([]));
  }, []);

  // Fetch Groups when selectedGrade changes
  useEffect(() => {
    if (selectedGrade) {
      getGroupsByGrade(selectedGrade)
        .then((res) => {
          const list = Array.isArray(res) ? res : res?.data || res?.groups || [];
          setGroups(list);
        })
        .catch(() => setGroups([]));
    } else {
      setGroups([]);
      setSelectedGroup("");
    }
  }, [selectedGrade]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      if (statusFilter === "deleted") {
        const res = await getDeletedStudents();
        const list = Array.isArray(res) ? res : res?.data || res?.students || [];
        setStudents(list);
        setPagination({ page: 1, limit: 100, total: list.length, totalPages: 1 });
      } else {
        const params = {
          page,
          limit: 20,
          search: searchTerm.trim() || undefined,
          search_type: searchType !== "all" ? searchType : undefined,
          grade_id: selectedGrade || undefined,
          group_id: selectedGroup || undefined,
          status: statusFilter === "all" ? undefined : statusFilter === "frozen" ? "inactive" : "active",
        };
        const res = await getAllStudents(params);
        setStudents(res?.data || res?.students || []);
        if (res?.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("فشل تحميل قائمة الطلاب");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [page, statusFilter, selectedGrade, selectedGroup, searchType]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchStudents();
  };

  // Create Student
  const handleCreateStudent = async (e) => {
    e.preventDefault();
    const cleanPhone = normalizePhone(formData.phone);
    const cleanParentPhone = normalizePhone(formData.parent_phone);

    if (!isValidEgyptianPhone(cleanPhone)) {
      toast.error("يرجى إدخال رقم هاتف طالب مصري صحيح (11 رقم)");
      return;
    }
    if (!isValidEgyptianPhone(cleanParentPhone)) {
      toast.error("يرجى إدخال رقم ولي أمر مصري صحيح (11 رقم)");
      return;
    }
    if (!formData.grade_id) {
      toast.error("يرجى اختيار الصف الدراسي");
      return;
    }

    try {
      setSubmitting(true);
      await createStudent({
        full_name: formData.full_name,
        phone: cleanPhone,
        parent_phone: cleanParentPhone,
        grade_id: Number(formData.grade_id),
        group_id: formData.group_id ? Number(formData.group_id) : null,
        barcode: formData.barcode.trim() || undefined,
      });
      toast.success("تم إضافة الطالب بنجاح");
      setIsAddModalOpen(false);
      setFormData({
        full_name: "",
        phone: "",
        parent_phone: "",
        grade_id: "",
        group_id: "",
        barcode: "",
      });
      fetchStudents();
    } catch (err) {
      toast.error(err?.data?.message || "فشل إضافة الطالب");
    } finally {
      setSubmitting(false);
    }
  };

  // Edit Student
  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    if (!selectedStudent) return;
    const cleanPhone = normalizePhone(formData.phone);
    const cleanParentPhone = normalizePhone(formData.parent_phone);

    try {
      setSubmitting(true);
      await updateStudent(selectedStudent.id, {
        full_name: formData.full_name,
        phone: cleanPhone,
        parent_phone: cleanParentPhone,
        grade_id: Number(formData.grade_id),
        group_id: formData.group_id ? Number(formData.group_id) : null,
        barcode: formData.barcode.trim() || undefined,
      });
      toast.success("تم تحديث بيانات الطالب بنجاح");
      setIsEditModalOpen(false);
      fetchStudents();
    } catch (err) {
      toast.error(err?.data?.message || "فشل تحديث بيانات الطالب");
    } finally {
      setSubmitting(false);
    }
  };

  // Freeze/Activate with reason
  const handleToggleStatus = async (e) => {
    e.preventDefault();
    if (!selectedStudent) return;
    const willBeActive = !selectedStudent.is_active;

    if (!willBeActive && !statusReason.trim()) {
      toast.error("يرجى كتابة سبب إيقاف الحساب للمتابعة الإدارية");
      return;
    }

    try {
      setSubmitting(true);
      await toggleStudentStatus(selectedStudent.id, {
        is_active: willBeActive,
        reason: statusReason.trim() || undefined,
      });
      toast.success(willBeActive ? "تم تنشيط حساب الطالب بنجاح" : "تم تجميد حساب الطالب بنجاح");
      setIsStatusModalOpen(false);
      setStatusReason("");
      fetchStudents();
    } catch (err) {
      toast.error(err?.data?.message || "فشل تغيير حالة الحساب");
    } finally {
      setSubmitting(false);
    }
  };

  // Reset Student Password
  const handleResetPassword = async (studentId) => {
    if (!window.confirm("هل تريد تصفير كلمة مرور هذا الطالب؟ سيتم تعيينها لرقم هاتفه.")) return;
    try {
      await resetStudentPassword(studentId);
      toast.success("تم تصفير كلمة المرور بنجاح");
    } catch (err) {
      toast.error("فشل تصفير كلمة المرور");
    }
  };

  // Delete & Restore
  const handleDeleteStudent = async (studentId, permanent = false) => {
    const confirmMsg = permanent
      ? "تحذير أمني شديد: هل أنت متأكد من الحذف النهائي؟ سيتم مسح بيانات الطالب وسجلاته بالكامل من قاعدة البيانات ولا يمكن التراجع!"
      : "هل أنت متأكد من نقل هذا الطالب إلى قائمة المحذوفين مؤقتاً؟";

    if (!window.confirm(confirmMsg)) return;

    try {
      await deleteStudent(studentId, permanent);
      toast.success(permanent ? "تم الحذف النهائي من الداتابيز" : "تم حذف الطالب مؤقتاً");
      fetchStudents();
    } catch (err) {
      toast.error("فشل حذف الطالب");
    }
  };

  const handleRestoreStudent = async (studentId) => {
    try {
      await restoreStudent(studentId);
      toast.success("تم استعادة حساب الطالب بنجاح");
      fetchStudents();
    } catch (err) {
      toast.error("فشل استرجاع الطالب");
    }
  };

  // Bulk upload
  const handleBulkUpload = async (e) => {
    e.preventDefault();
    if (!bulkFile) {
      toast.error("يرجى اختيار ملف الإكسيل أولاً");
      return;
    }
    try {
      setUploadingBulk(true);
      await bulkUploadStudents(bulkFile);
      toast.success("تم استيراد شيت الطلاب بنجاح وتوليد الحسابات");
      setIsBulkModalOpen(false);
      setBulkFile(null);
      fetchStudents();
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "فشل استيراد شيت الطلاب");
    } finally {
      setUploadingBulk(false);
    }
  };

  // 360 Profile Open
  const handleOpen360Profile = async (student) => {
    setSelectedStudent(student);
    setIsProfileModalOpen(true);
    setActiveProfileTab("attendance");
    setProfileData(null);
    setProfileStats(null);
    setProfileSubmissions([]);
    setProfileAttendance([]);
    setProfilePayments([]);
    setProfilePaperExams([]);
    setProfileOnlineExams([]);
    setProfilePlaylists([]);

    try {
      const [profRes, statsRes, subRes] = await Promise.allSettled([
        getStudentProfile(student.id),
        getStudentStats(student.id),
        getStudentSubmissions(student.id),
      ]);
      if (profRes.status === "fulfilled") {
        setProfileData(profRes.value?.data || profRes.value);
      }
      if (statsRes.status === "fulfilled") {
        setProfileStats(statsRes.value?.data || statsRes.value);
      }
      if (subRes.status === "fulfilled") {
        const subs = subRes.value;
        setProfileSubmissions(Array.isArray(subs) ? subs : subs?.data || subs?.submissions || []);
      }

      // Load initial tab (attendance)
      loadProfileSubTab(student.id, "attendance");
    } catch (err) {
      console.error(err);
    }
  };

  const loadProfileSubTab = async (studentId, tabKey) => {
    setActiveProfileTab(tabKey);
    setLoadingProfileTab(true);
    try {
      if (tabKey === "attendance") {
        const res = await getStudentAttendanceRecords(studentId);
        setProfileAttendance(Array.isArray(res) ? res : res?.data || res?.attendance || []);
      } else if (tabKey === "payments") {
        const res = await getStudentPaymentRecords(studentId);
        setProfilePayments(Array.isArray(res) ? res : res?.data || res?.payments || []);
      } else if (tabKey === "paperExams") {
        const res = await getStudentPaperExamRecords(studentId);
        setProfilePaperExams(Array.isArray(res) ? res : res?.data || res?.exams || []);
      } else if (tabKey === "onlineExams") {
        const res = await getStudentOnlineExamRecords(studentId);
        setProfileOnlineExams(Array.isArray(res) ? res : res?.data || res?.exams || []);
      } else if (tabKey === "submissions") {
        const res = await getStudentSubmissions(studentId);
        setProfileSubmissions(Array.isArray(res) ? res : res?.data || res?.submissions || []);
      } else if (tabKey === "playlists") {
        const res = await getStudentPlaylists(studentId);
        setProfilePlaylists(Array.isArray(res) ? res : res?.data || res?.playlists || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingProfileTab(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans" dir="rtl">
      {/* Top Header */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#1a5d1a]/10 text-[#1a5d1a] text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
              <Users size={14} />
              منظومة شؤون الطلاب (Students 360°)
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 flex items-center gap-2">
            إدارة الطلاب والبروفايل الشامل
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 font-normal">
            إدارة متكاملة للطلاب وسجلاتهم، استيراد شيتات الإكسيل، كروت الباركود، والرقابة الكاملة.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <Link
            to="/super-admin/passwords"
            className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-[#1a5d1a] rounded-xl text-xs font-medium border border-emerald-200 transition flex items-center gap-1.5"
          >
            <KeyRound size={15} />
            إدارة كلمات المرور
          </Link>

          <button
            onClick={() => setIsBulkModalOpen(true)}
            className="px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-medium border border-gray-200 transition flex items-center gap-1.5"
          >
            <Upload size={15} />
            رفع إكسيل
          </button>

          <button
            onClick={() => exportStudentsExcel({ grade_id: selectedGrade, group_id: selectedGroup, search: searchTerm, search_type: searchType !== "all" ? searchType : undefined, status: statusFilter })}
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-medium shadow-xs transition flex items-center gap-1.5"
          >
            <FileSpreadsheet size={15} />
            تصدير Excel
          </button>

          <button
            onClick={() => exportStudentsPdf({ grade_id: selectedGrade, group_id: selectedGroup, search: searchTerm, search_type: searchType !== "all" ? searchType : undefined, status: statusFilter })}
            className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-medium shadow-xs transition flex items-center gap-1.5"
          >
            <Printer size={15} />
            كروت الباركود (PDF)
          </button>

          <button
            onClick={() => {
              setFormData({
                full_name: "",
                phone: "",
                parent_phone: "",
                grade_id: grades[0]?.id || "",
                group_id: "",
                barcode: "",
              });
              setIsAddModalOpen(true);
            }}
            className="px-5 py-2.5 bg-[#1a5d1a] hover:bg-[#124112] text-white rounded-xl text-xs sm:text-sm font-medium shadow-md transition flex items-center gap-2"
          >
            <UserPlus size={16} />
            إضافة طالب
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-2 border-b pb-3 overflow-x-auto">
          {[
            { key: "active", label: "الطلاب النشطين" },
            { key: "frozen", label: "الحسابات المجمدة" },
            { key: "deleted", label: "المحذوفين مؤقتاً" },
            { key: "all", label: "كافة الطلاب" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setStatusFilter(tab.key);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition shrink-0 ${
                statusFilter === tab.key
                  ? "bg-[#1a5d1a] text-white shadow-xs"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Cascading Dropdowns */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-auto flex-1 md:max-w-lg">
            <select
              value={searchType}
              onChange={(e) => {
                setSearchType(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:border-[#1a5d1a] shrink-0"
              title="نوع البحث"
            >
              <option value="all">🔍 بحث شامل</option>
              <option value="name">👤 بالاسم فقط</option>
              <option value="barcode">🏷️ بالباركود فقط</option>
              <option value="phone">📞 بالهاتف فقط</option>
            </select>

            <div className="relative flex-1">
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder={
                  searchType === "name"
                    ? "بحث باسم الطالب..."
                    : searchType === "barcode"
                      ? "بحث بالباركود الخاص بالطالب..."
                      : searchType === "phone"
                        ? "بحث برقم هاتف الطالب أو ولي الأمر..."
                        : "بحث بالاسم، الباركود، أو الهاتف..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#1a5d1a]"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setPage(1);
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-medium transition"
            >
              بحث
            </button>
          </form>

          <div className="flex items-center gap-2.5 w-full md:w-auto">
            {/* Grade filter */}
            <select
              value={selectedGrade}
              onChange={(e) => {
                setSelectedGrade(e.target.value);
                setPage(1);
              }}
              className="flex-1 md:flex-none px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 focus:outline-none focus:border-[#1a5d1a]"
            >
              <option value="">جميع الصفوف</option>
              {grades.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name || g.grade_name}
                </option>
              ))}
            </select>

            {/* Group filter */}
            <select
              value={selectedGroup}
              onChange={(e) => {
                setSelectedGroup(e.target.value);
                setPage(1);
              }}
              disabled={!selectedGrade}
              className="flex-1 md:flex-none px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 focus:outline-none focus:border-[#1a5d1a] disabled:opacity-50"
            >
              <option value="">جميع المجموعات</option>
              {groups.map((grp) => (
                <option key={grp.id} value={grp.id}>
                  {grp.name || grp.group_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-gray-500 font-medium">جاري تحميل بيانات الطلاب...</div>
        ) : students.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">لا يوجد طلاب يطابقون خيارات البحث.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs sm:text-sm">
              <thead className="bg-gray-50/80 text-gray-500 text-xs font-semibold border-b border-gray-100">
                <tr>
                  <th className="py-3.5 px-4">كود الطالب</th>
                  <th className="py-3.5 px-4">اسم الطالب</th>
                  <th className="py-3.5 px-4">الصف والمجموعة</th>
                  <th className="py-3.5 px-4">رقم الموبايل</th>
                  <th className="py-3.5 px-4">موبايل ولي الأمر</th>
                  <th className="py-3.5 px-4">حالة الحساب</th>
                  <th className="py-3.5 px-4 text-center">إجراءات الإدارة العليا</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map((st) => {
                  const isDeleted = st.deleted === 1 || st.is_deleted === 1 || st.status === "deleted" || Boolean(st.deleted_at);
                  const isActive = !isDeleted && (st.is_active === 1 || st.is_active === true || st.status === "active");

                  return (
                    <tr key={st.id} className="hover:bg-gray-50/80 transition">
                      <td className="py-3.5 px-4 font-mono font-medium text-[#1a5d1a]">
                        {st.barcode || st.code || `#${st.id}`}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-gray-900 block">{st.full_name || st.name}</span>
                      </td>
                      <td className="py-3.5 px-4 text-gray-600">
                        <span className="block font-medium">{st.grade_name || st.grade?.name || "الصف الدراسي"}</span>
                        <span className="text-[11px] text-gray-400">{st.group_name || st.group?.name || "بدون مجموعة"}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-gray-600" dir="ltr">
                        {st.phone || "-"}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-gray-600" dir="ltr">
                        {st.parent_phone || "-"}
                      </td>
                      <td className="py-3.5 px-4">
                        {isDeleted ? (
                          <span className="bg-red-50 text-red-700 border border-red-200 px-2.5 py-1 rounded-full text-xs font-medium">
                            محذوف مؤقتاً
                          </span>
                        ) : isActive ? (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full text-xs font-medium">
                            نشط
                          </span>
                        ) : (
                          <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full text-xs font-medium" title={st.freeze_reason || ""}>
                            مجمد
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* 360 Profile Button */}
                          <button
                            onClick={() => handleOpen360Profile(st)}
                            title="عرض البروفايل الشامل 360°"
                            className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition"
                          >
                            <Eye size={16} />
                          </button>

                          {!isDeleted && (
                            <>
                              {/* Edit Button */}
                              <button
                                onClick={() => {
                                  setSelectedStudent(st);
                                  setFormData({
                                    full_name: st.full_name || st.name || "",
                                    phone: st.phone || "",
                                    parent_phone: st.parent_phone || "",
                                    grade_id: st.grade_id || "",
                                    group_id: st.group_id || "",
                                    barcode: st.barcode || "",
                                  });
                                  setIsEditModalOpen(true);
                                }}
                                title="تعديل البيانات"
                                className="p-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg transition"
                              >
                                <Edit size={16} />
                              </button>

                              {/* Freeze/Activate Button */}
                              <button
                                onClick={() => {
                                  setSelectedStudent(st);
                                  setStatusReason("");
                                  setIsStatusModalOpen(true);
                                }}
                                title={isActive ? "تجميد الحساب" : "تفعيل الحساب"}
                                className={`p-1.5 rounded-lg transition ${
                                  isActive
                                    ? "bg-amber-50 hover:bg-amber-100 text-amber-700"
                                    : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700"
                                }`}
                              >
                                <Lock size={16} />
                              </button>

                              {/* Reset Password Button */}
                              <button
                                onClick={() => handleResetPassword(st.id)}
                                title="تصفير كلمة المرور لرقم هاتفه"
                                className="p-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition"
                              >
                                <KeyRound size={16} />
                              </button>

                              {/* Soft Delete */}
                              <button
                                onClick={() => handleDeleteStudent(st.id, false)}
                                title="حذف مؤقت"
                                className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}

                          {isDeleted && (
                            <>
                              {/* Restore Button */}
                              <button
                                onClick={() => handleRestoreStudent(st.id)}
                                title="استعادة الحساب"
                                className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition"
                              >
                                <RotateCcw size={16} />
                              </button>

                              {/* Permanent Delete Button */}
                              <button
                                onClick={() => handleDeleteStudent(st.id, true)}
                                title="حذف نهائي من الداتابيز"
                                className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination bar */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs font-medium text-gray-600">
            <span>إجمالي الطلاب: {pagination.total}</span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-40"
              >
                السابق
              </button>
              <span>صفحة {page} من {pagination.totalPages}</span>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-40"
              >
                التالي
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: ADD STUDENT */}
      {/* ======================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-semibold text-lg text-gray-900">إضافة طالب جديد للمنصة</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">اسم الطالب الرباعي *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: عمر مصطفى كمال الدين"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1a5d1a]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">رقم هاتف الطالب *</label>
                  <input
                    type="text"
                    required
                    placeholder="01012345678"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:border-[#1a5d1a]"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">رقم هاتف ولي الأمر *</label>
                  <input
                    type="text"
                    required
                    placeholder="01198765432"
                    value={formData.parent_phone}
                    onChange={(e) => setFormData({ ...formData, parent_phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:border-[#1a5d1a]"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">الصف الدراسي *</label>
                  <select
                    required
                    value={formData.grade_id}
                    onChange={(e) => setFormData({ ...formData, grade_id: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:border-[#1a5d1a]"
                  >
                    <option value="">اختر الصف</option>
                    {grades.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name || g.grade_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">المجموعة الدراسية (اختياري)</label>
                  <select
                    value={formData.group_id}
                    onChange={(e) => setFormData({ ...formData, group_id: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:border-[#1a5d1a]"
                  >
                    <option value="">بدون مجموعة حالياً</option>
                    {groups.map((grp) => (
                      <option key={grp.id} value={grp.id}>
                        {grp.name || grp.group_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  كود الطالب (الباركود) - اختياري
                </label>
                <input
                  type="text"
                  placeholder="اتركه فارغاً ليقوم النظام بتوليده تلقائياً"
                  value={formData.barcode}
                  onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:border-[#1a5d1a]"
                  dir="ltr"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-medium transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-[#1a5d1a] hover:bg-[#124112] text-white rounded-xl text-xs font-medium shadow-md transition disabled:opacity-50"
                >
                  {submitting ? "جاري الحفظ..." : "حفظ الطالب"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: EDIT STUDENT */}
      {/* ======================================================== */}
      {isEditModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-semibold text-lg text-gray-900">تعديل بيانات الطالب</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateStudent} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">اسم الطالب *</label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1a5d1a]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">رقم هاتف الطالب *</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:border-[#1a5d1a]"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">رقم ولي الأمر *</label>
                  <input
                    type="text"
                    required
                    value={formData.parent_phone}
                    onChange={(e) => setFormData({ ...formData, parent_phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:border-[#1a5d1a]"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">الصف الدراسي *</label>
                  <select
                    required
                    value={formData.grade_id}
                    onChange={(e) => setFormData({ ...formData, grade_id: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:border-[#1a5d1a]"
                  >
                    {grades.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name || g.grade_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">المجموعة الدراسية</label>
                  <select
                    value={formData.group_id}
                    onChange={(e) => setFormData({ ...formData, group_id: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:border-[#1a5d1a]"
                  >
                    <option value="">بدون مجموعة</option>
                    {groups.map((grp) => (
                      <option key={grp.id} value={grp.id}>
                        {grp.name || grp.group_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">كود الطالب (الباركود)</label>
                <input
                  type="text"
                  value={formData.barcode}
                  onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:border-[#1a5d1a]"
                  dir="ltr"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-medium transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-[#1a5d1a] hover:bg-[#124112] text-white rounded-xl text-xs font-medium shadow-md transition disabled:opacity-50"
                >
                  {submitting ? "جاري الحفظ..." : "حفظ التعديلات"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: FREEZE / ACTIVATE MODAL WITH REASON */}
      {/* ======================================================== */}
      {isStatusModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-semibold text-base text-gray-900">
                {selectedStudent.is_active ? "تجميد حساب الطالب" : "تنشيط حساب الطالب"}
              </h3>
              <button onClick={() => setIsStatusModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleToggleStatus} className="space-y-3.5">
              <p className="text-xs text-gray-600">
                الطالب: <strong className="text-gray-900 font-medium">{selectedStudent.full_name || selectedStudent.name}</strong>
              </p>

              {selectedStudent.is_active && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    سبب إيقاف / تجميد الحساب *
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="مثال: عدم سداد اشتراك شهر أكتوبر / تكرار الغياب بدون إذن"
                    value={statusReason}
                    onChange={(e) => setStatusReason(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#1a5d1a]"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    سيتم تسجيل السبب رسمياً في سجل العمليات لمنع اللبس الإداري.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsStatusModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-medium transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-5 py-2 text-white rounded-xl text-xs font-medium transition ${
                    selectedStudent.is_active
                       ? "bg-amber-600 hover:bg-amber-700"
                      : "bg-emerald-600 hover:bg-emerald-700"
                  }`}
                >
                  {submitting ? "جاري التحديث..." : selectedStudent.is_active ? "تأكيد التجميد" : "تأكيد التنشيط"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: BULK EXCEL UPLOAD */}
      {/* ======================================================== */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-semibold text-base text-gray-900">استيراد جماعي للطلاب من Excel</h3>
              <button onClick={() => setIsBulkModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between text-xs text-emerald-800">
              <span>تحميل القالب الرسمي للإكسيل:</span>
              <button
                type="button"
                onClick={downloadStudentsTemplate}
                className="font-medium underline flex items-center gap-1 hover:text-emerald-950"
              >
                <Download size={14} />
                تحميل القالب (.xlsx)
              </button>
            </div>

            <form onSubmit={handleBulkUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">اختر ملف الإكسيل المعبأ</label>
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  required
                  onChange={(e) => setBulkFile(e.target.files[0])}
                  className="w-full text-xs text-gray-600 file:mr-0 file:ml-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-medium file:bg-[#1a5d1a] file:text-white hover:file:bg-[#124112]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsBulkModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-medium transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={uploadingBulk}
                  className="px-6 py-2 bg-[#1a5d1a] hover:bg-[#124112] text-white rounded-xl text-xs font-medium shadow-md transition disabled:opacity-50"
                >
                  {uploadingBulk ? "جاري الرفع والمعالجة..." : "بدء الاستيراد"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 5: COMPLETE 360° STUDENT PROFILE MODAL */}
      {/* ======================================================== */}
      {isProfileModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
            {/* Profile Header */}
            <div className="flex items-start justify-between border-b pb-4">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-[#1a5d1a] text-white flex items-center justify-center text-xl font-medium font-mono shrink-0 shadow-sm">
                  {selectedStudent.full_name?.charAt(0) || "ط"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg text-gray-900">
                      {selectedStudent.full_name || selectedStudent.name}
                    </h3>
                    <span className="font-mono text-xs bg-gray-100 text-[#1a5d1a] font-medium px-2 py-0.5 rounded-lg">
                      {selectedStudent.barcode || `#${selectedStudent.id}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                    <span>{selectedStudent.grade_name || "الصف الدراسي"}</span>
                    <span>•</span>
                    <span>{selectedStudent.group_name || "بدون مجموعة"}</span>
                    <span>•</span>
                    <span dir="ltr">هاتف: {selectedStudent.phone || "-"}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={22} />
              </button>
            </div>

            {/* 4 KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100">
                <span className="text-xs text-emerald-700 font-medium block mb-1">نسبة الحضور</span>
                <span className="text-xl font-semibold text-emerald-800 block">
                  {profileStats?.attendance_percentage != null
                    ? `${Number(profileStats.attendance_percentage)}%`
                    : profileStats?.total_attendance_days > 0
                    ? `${Math.round(((profileStats.present_days || 0) / profileStats.total_attendance_days) * 100)}%`
                    : "0%"}
                </span>
                <span className="text-[11px] text-emerald-600 block mt-0.5 font-normal">
                  {profileStats ? `${profileStats.present_days || 0} حضور من ${profileStats.total_attendance_days || 0} يوم` : "0 حضور"}
                </span>
              </div>

              <div className="p-3.5 bg-blue-50 rounded-2xl border border-blue-100">
                <span className="text-xs text-blue-700 font-medium block mb-1">متوسط الدرجات</span>
                <span className="text-xl font-semibold text-blue-800 block">
                  {profileStats?.avg_paper_degree != null && profileStats?.avg_online_score != null
                    ? `${((Number(profileStats.avg_paper_degree) + Number(profileStats.avg_online_score)) / 2).toFixed(1)}`
                    : profileStats?.avg_paper_degree != null
                    ? `${Number(profileStats.avg_paper_degree)}`
                    : profileStats?.avg_online_score != null
                    ? `${Number(profileStats.avg_online_score)}`
                    : "-"}
                </span>
                <span className="text-[11px] text-blue-600 block mt-0.5 font-normal">
                  ورقي: {profileStats?.avg_paper_degree ?? "-"} | إلكتروني: {profileStats?.avg_online_score ?? "-"}
                </span>
              </div>

              <div className="p-3.5 bg-purple-50 rounded-2xl border border-purple-100">
                <span className="text-xs text-purple-700 font-medium block mb-1">امتحانات مكتملة</span>
                <span className="text-xl font-semibold text-purple-800 block">
                  {(Number(profileStats?.attended_paper_exams) || 0) + (Number(profileStats?.total_online_exams) || 0)}
                </span>
                <span className="text-[11px] text-purple-600 block mt-0.5 font-normal">
                  {profileStats?.attended_paper_exams ?? 0} ورقي • {profileStats?.total_online_exams ?? 0} إلكتروني
                </span>
              </div>

              <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-100">
                <span className="text-xs text-amber-700 font-medium block mb-1">واجبات مسلمة</span>
                <span className="text-xl font-semibold text-amber-800 block">
                  {profileSubmissions?.length ?? 0}
                </span>
                <span className="text-[11px] text-amber-600 block mt-0.5 font-normal">
                  تسليمات الواجبات المسجلة
                </span>
              </div>
            </div>

            {/* Sub-records Navigation Tabs */}
            <div className="flex items-center gap-1.5 border-b pb-2 overflow-x-auto text-xs font-medium">
              {[
                { key: "attendance", label: "سجل الحضور", icon: CalendarCheck2 },
                { key: "payments", label: "سجل المدفوعات", icon: BadgeDollarSign },
                { key: "paperExams", label: "الامتحانات الورقية", icon: FileCheck2 },
                { key: "onlineExams", label: "الامتحانات الإلكترونية", icon: BookOpen },
                { key: "submissions", label: "الواجبات والتسليمات", icon: Edit },
                { key: "playlists", label: "قوائم التشغيل", icon: Video },
              ].map((tab) => {
                const Icon = tab.icon;
                const isCurrent = activeProfileTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => loadProfileSubTab(selectedStudent.id, tab.key)}
                    className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shrink-0 ${
                      isCurrent
                        ? "bg-[#1a5d1a] text-white shadow-xs"
                        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <Icon size={14} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Sub-records Content View */}
            <div className="min-h-[220px]">
              {loadingProfileTab ? (
                <div className="text-center py-12 text-gray-400 font-medium text-xs">جاري تحميل السجلات...</div>
              ) : (
                <>
                  {/* 1. Attendance Tab */}
                  {activeProfileTab === "attendance" && (
                    <div>
                      {profileAttendance.length === 0 ? (
                        <p className="text-center py-8 text-gray-400 text-xs">لا توجد سجلات حضور مسجلة للطالب.</p>
                      ) : (
                        <div className="divide-y divide-gray-100 text-xs">
                          {profileAttendance.map((rec, i) => (
                            <div key={i} className="py-2.5 flex items-center justify-between">
                              <div>
                                <span className="font-medium text-gray-800 block">
                                  {rec.session_title || rec.title || "حصة دراسية"}
                                </span>
                                <span className="text-[11px] text-gray-400">{rec.date || rec.attendance_date}</span>
                              </div>
                              <span
                                className={`px-2.5 py-0.5 rounded-full font-medium ${
                                  rec.status === "present"
                                    ? "bg-emerald-50 text-emerald-700"
                                    : rec.status === "makeup"
                                    ? "bg-blue-50 text-blue-700"
                                    : "bg-red-50 text-red-700"
                                }`}
                              >
                                {rec.status === "present" ? "حاضر" : rec.status === "makeup" ? "تعويض" : "غائب"}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 2. Payments Tab */}
                  {activeProfileTab === "payments" && (
                    <div>
                      {profilePayments.length === 0 ? (
                        <p className="text-center py-8 text-gray-400 text-xs">لا توجد سجلات سداد مسجلة للطالب.</p>
                      ) : (
                        <div className="divide-y divide-gray-100 text-xs">
                          {profilePayments.map((pay, i) => (
                            <div key={i} className="py-2.5 flex items-center justify-between">
                              <div>
                                <span className="font-medium text-gray-800 block">
                                  اشتراك شهر {pay.month || (pay.payment_date ? pay.payment_date.slice(0, 7) : "-")}
                                </span>
                                <span className="text-[11px] text-gray-400">بتاريخ {pay.payment_date?.slice(0, 10) || pay.created_at?.slice(0, 10) || "-"}</span>
                              </div>
                              <span className="font-medium text-emerald-700">
                                {pay.amount || pay.paid_amount || 0} ج.م
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 3. Paper Exams Tab */}
                  {activeProfileTab === "paperExams" && (
                    <div>
                      {profilePaperExams.length === 0 ? (
                        <p className="text-center py-8 text-gray-400 text-xs">لا توجد امتحانات ورقية مرصودة للطالب.</p>
                      ) : (
                        <div className="divide-y divide-gray-100 text-xs">
                          {profilePaperExams.map((ex, i) => (
                            <div key={i} className="py-2.5 flex items-center justify-between">
                              <div>
                                <span className="font-medium text-gray-800 block">{ex.title || ex.exam_title}</span>
                                <span className="text-[11px] text-gray-400">{ex.date || "-"}</span>
                              </div>
                              <div className="text-left font-mono">
                                <span className="font-medium text-[#1a5d1a]">{ex.degree ?? ex.score ?? "-"}</span>
                                {ex.total_degree && <span className="text-gray-400"> / {ex.total_degree}</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 4. Online Exams Tab */}
                  {activeProfileTab === "onlineExams" && (
                    <div>
                      {profileOnlineExams.length === 0 ? (
                        <p className="text-center py-8 text-gray-400 text-xs">لا توجد محاولات امتحانات إلكترونية مسجلة.</p>
                      ) : (
                        <div className="divide-y divide-gray-100 text-xs">
                          {profileOnlineExams.map((onl, i) => (
                            <div key={i} className="py-2.5 flex items-center justify-between">
                              <div>
                                <span className="font-medium text-gray-800 block">{onl.title || "امتحان إلكتروني"}</span>
                                <span className="text-[11px] text-gray-400">{onl.submitted_at?.slice(0, 10) || "-"}</span>
                              </div>
                              <span className="font-medium text-purple-700 font-mono">
                                {onl.score ?? "-"} {onl.full_mark ? `/ ${onl.full_mark}` : ""}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 5. Submissions Tab */}
                  {activeProfileTab === "submissions" && (
                    <div>
                      {profileSubmissions.length === 0 ? (
                        <p className="text-center py-8 text-gray-400 text-xs">لا توجد تسليمات واجبات مسجلة.</p>
                      ) : (
                        <div className="divide-y divide-gray-100 text-xs">
                          {profileSubmissions.map((sub, i) => (
                            <div key={i} className="py-2.5 flex items-center justify-between">
                              <div>
                                <span className="font-medium text-gray-800 block">{sub.assignment_title || "واجب منزلي"}</span>
                                <span className="text-[11px] text-gray-500">{sub.teacher_feedback || "تم التسليم"}</span>
                              </div>
                              <span className="font-medium text-blue-700 font-mono">
                                {sub.score != null ? `${sub.score} / ${sub.full_mark || "-"}` : "قيد المراجعة"}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 6. Playlists Tab */}
                  {activeProfileTab === "playlists" && (
                    <div>
                      {profilePlaylists.length === 0 ? (
                        <p className="text-center py-8 text-gray-400 text-xs">لا توجد قوائم تشغيل مخصصة للطالب.</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          {profilePlaylists.map((pl, i) => (
                            <div key={i} className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                              <span className="font-medium text-gray-900 block">{pl.title}</span>
                              <span className="text-[11px] text-gray-400">{pl.videos_count || 0} فيديو متاح</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end pt-3 border-t">
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(false)}
                className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-medium transition"
              >
                إغلاق البروفايل
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
