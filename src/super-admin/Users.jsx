import React, { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  Search,
  KeyRound,
  Shield,
  ShieldCheck,
  UserX,
  UserCheck,
  Trash2,
  RotateCcw,
  Edit,
  X,
  AlertCircle,
  Phone,
  Lock,
} from "lucide-react";
import {
  getAllUsers,
  createUser,
  updateUser,
  updateUserPassword,
  resetUserPassword,
  toggleUserActive,
  deleteUser,
  restoreUser,
} from "../api/super-admin/services";
import { toast } from "sonner";
import { isValidEgyptianPhone, normalizePhone } from "../utils/validators";

export default function SuperAdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    password: "",
    role: "assistant",
    permissions: "center_management",
  });
  const [newPassword, setNewPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await getAllUsers({ role: roleFilter, search: searchTerm });
      setUsers(res.data || []);
    } catch (err) {
      toast.error("فشل تحميل قائمة المستخدمين");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    const cleanPhone = normalizePhone(formData.phone);
    if (!isValidEgyptianPhone(cleanPhone)) {
      toast.error("يرجى إدخال رقم هاتف مصري صحيح (11 رقم يبدأ بـ 01)");
      return;
    }
    if (!formData.password || formData.password.length < 6) {
      toast.error("كلمة المرور يجب ألا تقل عن 6 أحرف");
      return;
    }

    try {
      setSubmitting(true);
      await createUser({ ...formData, phone: cleanPhone });
      toast.success("تم إضافة الموظف بنجاح");
      setIsAddModalOpen(false);
      setFormData({
        full_name: "",
        phone: "",
        password: "",
        role: "assistant",
        permissions: "center_management",
      });
      fetchUsers();
    } catch (err) {
      toast.error(err?.data?.message || "فشل إضافة الموظف");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    const cleanPhone = normalizePhone(formData.phone);

    try {
      setSubmitting(true);
      await updateUser(selectedUser.id, {
        full_name: formData.full_name,
        phone: cleanPhone,
        role: formData.role,
        permissions: formData.permissions,
      });
      toast.success("تم تحديث بيانات الموظف بنجاح");
      setIsEditModalOpen(false);
      fetchUsers();
    } catch (err) {
      toast.error(err?.data?.message || "فشل تحديث البيانات");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    if (!newPassword || newPassword.length < 6) {
      toast.error("كلمة المرور يجب ألا تقل عن 6 أحرف");
      return;
    }

    try {
      setSubmitting(true);
      await updateUserPassword(selectedUser.id, newPassword);
      toast.success("تم تغيير كلمة المرور بنجاح");
      setIsPasswordModalOpen(false);
      setNewPassword("");
    } catch (err) {
      toast.error("فشل تغيير كلمة المرور");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (userId) => {
    try {
      await toggleUserActive(userId);
      toast.success("تم تغيير حالة الحساب");
      fetchUsers();
    } catch (err) {
      toast.error("فشل تغيير حالة الحساب");
    }
  };

  const handleDeleteUser = async (userId, permanent = false) => {
    const confirmMsg = permanent
      ? "هل أنت متأكد من الحذف النهائي لهذا المستخدم؟ لا يمكن التراجع!"
      : "هل أنت متأكد من تعطيل/حذف هذا المستخدم؟";
    if (!window.confirm(confirmMsg)) return;

    try {
      await deleteUser(userId, permanent);
      toast.success("تم الحذف بنجاح");
      fetchUsers();
    } catch (err) {
      toast.error("فشل إجراء الحذف");
    }
  };

  const handleRestoreUser = async (userId) => {
    try {
      await restoreUser(userId);
      toast.success("تم استعادة الحساب بنجاح");
      fetchUsers();
    } catch (err) {
      toast.error("فشل استعادة الحساب");
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans" dir="rtl">
      {/* Top Header */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-800 flex items-center gap-2">
            <Users size={24} className="text-[#1a5d1a]" />
            إدارة الموظفين وفريق العمل
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            إضافة وتعديل بيانات المدرسين والمساعدين والمشرفين والتحكم بصلاحياتهم.
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({
              full_name: "",
              phone: "",
              password: "",
              role: "assistant",
              permissions: "center_management",
            });
            setIsAddModalOpen(true);
          }}
          className="w-full sm:w-auto bg-[#1a5d1a] hover:bg-[#124112] text-white px-5 py-3 rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2"
        >
          <UserPlus size={18} />
          إضافة موظف جديد
        </button>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-96">
          <div className="relative flex-1">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
            <input
              type="text"
              placeholder="البحث بالاسم أو رقم الهاتف..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1a5d1a] focus:bg-white transition"
            />
          </div>
          <button
            type="submit"
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-bold transition"
          >
            بحث
          </button>
        </form>

        {/* Role Filters */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { label: "الكل", value: "" },
            { label: "معلمين", value: "teacher" },
            { label: "مساعدين", value: "assistant" },
            { label: "مديرين", value: "super_admin" },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => setRoleFilter(item.value)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                roleFilter === item.value
                  ? "bg-[#1a5d1a] text-white shadow-sm"
                  : "bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-gray-500 font-bold">جاري تحميل بيانات الموظفين...</div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">لا يوجد موظفين مطابقين للبحث.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-gray-50/80 text-gray-500 text-xs font-bold border-b border-gray-100">
                <tr>
                  <th className="py-3.5 px-4">الموظف</th>
                  <th className="py-3.5 px-4">رقم الهاتف</th>
                  <th className="py-3.5 px-4">الدور الوظيفي</th>
                  <th className="py-3.5 px-4">الصلاحية</th>
                  <th className="py-3.5 px-4">الحالة</th>
                  <th className="py-3.5 px-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {users.map((u) => {
                  const isDeleted = u.deleted === 1;
                  const isActive = u.is_active === 1;

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-emerald-50 text-[#1a5d1a] font-bold flex items-center justify-center text-sm shrink-0">
                            {u.full_name?.charAt(0) || "U"}
                          </div>
                          <div>
                            <span className="font-bold text-gray-900 block">{u.full_name}</span>
                            <span className="text-[11px] text-gray-400 font-mono">ID: #{u.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-gray-600" dir="ltr">
                        {u.phone}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                            u.role === "super_admin"
                              ? "bg-purple-50 text-purple-700 border border-purple-200"
                              : u.role === "teacher"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}
                        >
                          {u.role === "super_admin"
                            ? "مدير عام"
                            : u.role === "teacher"
                            ? "معلم"
                            : "مساعد"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-gray-500">
                        {u.permissions === "center_management"
                          ? "إدارة سنتر"
                          : u.permissions === "online_management"
                          ? "إدارة أونلاين"
                          : "شامل"}
                      </td>
                      <td className="py-3.5 px-4">
                        {isDeleted ? (
                          <span className="text-xs bg-red-50 text-red-700 px-2.5 py-1 rounded-full font-bold">
                            محذوف
                          </span>
                        ) : isActive ? (
                          <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-bold">
                            نشط
                          </span>
                        ) : (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-bold">
                            معطل
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Edit */}
                          <button
                            onClick={() => {
                              setSelectedUser(u);
                              setFormData({
                                full_name: u.full_name,
                                phone: u.phone,
                                role: u.role,
                                permissions: u.permissions || "center_management",
                              });
                              setIsEditModalOpen(true);
                            }}
                            title="تعديل البيانات"
                            className="p-1.5 hover:bg-gray-100 text-blue-600 rounded-lg transition"
                          >
                            <Edit size={16} />
                          </button>

                          {/* Change Password */}
                          <button
                            onClick={() => {
                              setSelectedUser(u);
                              setNewPassword("");
                              setIsPasswordModalOpen(true);
                            }}
                            title="تغيير كلمة المرور"
                            className="p-1.5 hover:bg-gray-100 text-amber-600 rounded-lg transition"
                          >
                            <KeyRound size={16} />
                          </button>

                          {/* Toggle Active */}
                          <button
                            onClick={() => handleToggleActive(u.id)}
                            title={isActive ? "تعطيل الحساب" : "تفعيل الحساب"}
                            className="p-1.5 hover:bg-gray-100 text-gray-600 rounded-lg transition"
                          >
                            {isActive ? <UserCheck size={16} /> : <UserX size={16} />}
                          </button>

                          {/* Delete / Restore */}
                          {isDeleted ? (
                            <button
                              onClick={() => handleRestoreUser(u.id)}
                              title="استعادة الحساب"
                              className="p-1.5 hover:bg-emerald-50 text-emerald-600 rounded-lg transition"
                            >
                              <RotateCcw size={16} />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              title="حذف الموظف"
                              className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition"
                            >
                              <Trash2 size={16} />
                            </button>
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
      </div>

      {/* Modal: Add User */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                <UserPlus size={20} className="text-[#1a5d1a]" />
                إضافة موظف جديد
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">الاسم بالكامل</label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="مثال: أحمد محمود"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1a5d1a]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">رقم الهاتف</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="01012345678"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1a5d1a] text-left"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">كلمة المرور</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="6 أحرف على الأقل"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1a5d1a] text-left"
                  dir="ltr"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">الدور الوظيفي</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1a5d1a]"
                  >
                    <option value="assistant">مساعد</option>
                    <option value="teacher">معلم</option>
                    <option value="super_admin">مدير عام</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">الصلاحية</label>
                  <select
                    value={formData.permissions}
                    onChange={(e) => setFormData({ ...formData, permissions: e.target.value })}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1a5d1a]"
                  >
                    <option value="center_management">إدارة سنتر</option>
                    <option value="online_management">إدارة أونلاين</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-[#1a5d1a] hover:bg-[#124112] text-white py-2.5 rounded-xl font-bold text-sm transition disabled:opacity-50"
                >
                  {submitting ? "جاري الإضافة..." : "حفظ الموظف"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-sm transition"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit User */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                <Edit size={20} className="text-[#1a5d1a]" />
                تعديل بيانات: {selectedUser.full_name}
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">الاسم بالكامل</label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1a5d1a]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">رقم الهاتف</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1a5d1a] text-left"
                  dir="ltr"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">الدور الوظيفي</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1a5d1a]"
                  >
                    <option value="assistant">مساعد</option>
                    <option value="teacher">معلم</option>
                    <option value="super_admin">مدير عام</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">الصلاحية</label>
                  <select
                    value={formData.permissions}
                    onChange={(e) => setFormData({ ...formData, permissions: e.target.value })}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1a5d1a]"
                  >
                    <option value="center_management">إدارة سنتر</option>
                    <option value="online_management">إدارة أونلاين</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-[#1a5d1a] hover:bg-[#124112] text-white py-2.5 rounded-xl font-bold text-sm transition disabled:opacity-50"
                >
                  {submitting ? "جاري التحديث..." : "حفظ التغييرات"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-sm transition"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Change Password */}
      {isPasswordModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-gray-800 flex items-center gap-2">
                <KeyRound size={18} className="text-amber-600" />
                تغيير كلمة المرور
              </h3>
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-xs text-gray-500">
              أدخل كلمة المرور الجديدة للمستخدم: <span className="font-bold text-gray-800">{selectedUser.full_name}</span>
            </p>

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">كلمة المرور الجديدة</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="6 أحرف أو أكثر"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1a5d1a] text-left"
                  dir="ltr"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-[#1a5d1a] hover:bg-[#124112] text-white py-2.5 rounded-xl font-bold text-sm transition disabled:opacity-50"
                >
                  {submitting ? "جاري الحفظ..." : "تأكيد التغيير"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-sm transition"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
