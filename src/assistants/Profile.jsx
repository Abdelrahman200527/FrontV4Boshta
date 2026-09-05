/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback } from "react";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  Phone,
  Camera,
  X,
  Shield,
  Calendar,
  RefreshCw,
} from "lucide-react";
import {
  changeAssistantPassword,
  fetchAssistantProfile,
  updateAssistantProfileImageAction,
  deleteAssistantProfileImageAction,
} from "../api/assistant/actions";
import getUser from "../utils/getUser";
import { motion } from "framer-motion";
import { pageVariants, itemVariants } from "../motion";
import config from "../config";

function resolveImageUrl(path) {
  if (!path) return null;
  if (path.startsWith("http") || path.startsWith("data:")) return path;
  const baseUrl = config.apiUrl.replace("/api", "");
  return `${baseUrl}/${path.replace(/^\/+/, "")}`;
}

const Profile = () => {
  const user = getUser();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [message, setMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [profileImage, setProfileImage] = useState(null);
  const [showImageOptions, setShowImageOptions] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageMessage, setImageMessage] = useState(null);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchAssistantProfile();
      if (result.success && result.data) {
        setProfileData(result.data);
        if (result.data.profile_image) {
          setProfileImage(resolveImageUrl(result.data.profile_image));
        }
      } else {
        setError(result.error || "حدث خطأ في تحميل الملف الشخصي");
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      setError("حدث خطأ في تحميل الملف الشخصي");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const getInitial = (name) => {
    if (!name) return "؟";
    return String(name).trim().charAt(0).toUpperCase() || "؟";
  };

  const handleChangePassword = async () => {
    setMessage(null);

    if (!oldPassword || !newPassword || !confirmPassword) {
      setMessage({ type: "error", text: "يرجى ملء جميع الحقول" });
      return;
    }

    if (newPassword.length < 4) {
      setMessage({
        type: "error",
        text: "كلمة السر يجب أن تكون 4 أحرف على الأقل",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "كلمة السر الجديدة غير متطابقة" });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await changeAssistantPassword(
        oldPassword,
        newPassword,
        confirmPassword,
      );

      if (result.success) {
        setMessage({ type: "success", text: "تم تغيير كلمة السر بنجاح" });
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setMessage({
          type: "error",
          text: result.error || "حدث خطأ في تغيير كلمة السر",
        });
      }
    } catch (error) {
      console.error("Error changing password:", error);
      setMessage({ type: "error", text: "حدث خطأ في تغيير كلمة السر" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // ✅ Validation: تأكد إن الملف صورة
    if (!file.type.startsWith("image/")) {
      setImageMessage({ type: "error", text: "يرجى اختيار ملف صورة" });
      return;
    }

    setImageUploading(true);
    setImageMessage(null);
    try {
      const reader = new FileReader();
      reader.onload = (e) => setProfileImage(e.target.result);
      reader.readAsDataURL(file);

      const formData = new FormData();
      formData.append("image", file);
      const result = await updateAssistantProfileImageAction(formData);

      if (result.success) {
        const newPath =
          result.data?.profile_image || result.data?.data?.profile_image;
        if (newPath) {
          setProfileImage(resolveImageUrl(newPath));
          setProfileData((prev) =>
            prev ? { ...prev, profile_image: newPath } : prev,
          );
        }
        setImageMessage({ type: "success", text: "تم تحديث الصورة بنجاح" });
        setShowImageOptions(false);
      } else {
        setProfileImage(resolveImageUrl(profileData?.profile_image));
        setImageMessage({
          type: "error",
          text: result.error || "فشل رفع الصورة",
        });
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      setProfileImage(resolveImageUrl(profileData?.profile_image));
      setImageMessage({ type: "error", text: "حدث خطأ أثناء رفع الصورة" });
    } finally {
      setImageUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    setImageUploading(true);
    setImageMessage(null);
    try {
      const result = await deleteAssistantProfileImageAction();
      if (result.success) {
        setProfileImage(null);
        setProfileData((prev) =>
          prev ? { ...prev, profile_image: null } : prev,
        );
        setImageMessage({ type: "success", text: "تم حذف الصورة" });
        setShowImageOptions(false);
      } else {
        setImageMessage({
          type: "error",
          text: result.error || "فشل حذف الصورة",
        });
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      setImageMessage({ type: "error", text: "حدث خطأ أثناء حذف الصورة" });
    } finally {
      setImageUploading(false);
    }
  };

  const displayName = profileData?.full_name || user?.full_name || "غير معروف";
  const displayPhone = profileData?.phone || user?.phone || "غير معروف";
  const displayRole = profileData?.role || user?.role || "غير معروف";
  const displayPermissions =
    profileData?.permissions || user?.permissions || "-";
  const displayImage = resolveImageUrl(profileData?.profile_image);

  const getRoleName = (role) => {
    const roles = {
      super_admin: "مدير عام",
      admin: "مدير",
      assistant: "مساعد",
      teacher: "معلم",
      student: "طالب",
      parent: "ولي أمر",
    };
    return roles[role] || role || "غير معروف";
  };

  const getPermissionsName = (permissions) => {
    const perms = {
      center_management: "إدارة المركز",
      online_management: "إدارة أونلاين",
      full_access: "صلاحية كاملة",
      view_only: "عرض فقط",
    };
    return perms[permissions] || permissions || "-";
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-500">جاري تحميل الملف الشخصي...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.section
      variants={pageVariants}
      initial="hidden"
      animate="show"
      className="w-full min-h-screen"
      dir="rtl"
    >
      <motion.div
        variants={itemVariants}
        className="max-w-xl mx-auto flex flex-col gap-4"
      >
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              الملف الشخصي
            </h1>
            <span className="text-gray-500 text-sm">بيانات الحساب</span>
          </div>
          <button
            onClick={loadProfile}
            disabled={loading}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
            title="تحديث"
          >
            <RefreshCw
              size={18}
              className={
                loading ? "animate-spin text-primary" : "text-gray-400"
              }
            />
          </button>
        </header>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        )}

        {/* Info Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <div className="relative group">
              <div
                className="w-16 h-16 rounded-full bg-linear-to-br from-primary to-green-600 flex items-center justify-center text-white overflow-hidden border-2 border-green-200 cursor-pointer relative shadow-md"
                onClick={() => setShowImageOptions(true)}
              >
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : displayImage ? (
                  <img
                    src={displayImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold">
                    {getInitial(displayName)}
                  </span>
                )}

                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full">
                  <Camera size={20} className="text-white" />
                </div>
              </div>
            </div>

            <div>
              <h2 className="font-bold text-base text-gray-900">
                {displayName}
              </h2>
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Shield size={12} className="text-primary" />
                {getRoleName(displayRole)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <span className="text-xs text-gray-500 block mb-1">
                رقم الهاتف
              </span>
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-gray-400" />
                <span className="font-bold text-sm text-gray-800" dir="ltr">
                  {displayPhone}
                </span>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <span className="text-xs text-gray-500 block mb-1">الدور</span>
              <span className="font-bold text-sm text-gray-800">
                {getRoleName(displayRole)}
              </span>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 sm:col-span-2">
              <span className="text-xs text-gray-500 block mb-1">
                الصلاحيات
              </span>
              <span className="font-bold text-sm text-gray-800">
                {getPermissionsName(displayPermissions)}
              </span>
            </div>
            {profileData?.created_at && (
              <div className="bg-gray-50 rounded-lg p-3 sm:col-span-2">
                <span className="text-xs text-gray-500 block mb-1">
                  تاريخ التسجيل
                </span>
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-gray-400" />
                  <span className="font-bold text-sm text-gray-800">
                    {formatDate(profileData.created_at)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Change Password Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="font-bold text-base mb-4 flex items-center gap-2">
            <Lock size={16} className="text-primary" />
            تغيير كلمة السر
          </h3>

          <div className="flex flex-col gap-3">
            <div className="relative">
              <input
                type={showPasswords ? "text" : "password"}
                placeholder="كلمة السر القديمة"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-200 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all pr-4 pl-10"
              />
              <button
                type="button"
                onClick={() => setShowPasswords(!showPasswords)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div className="relative">
              <input
                type={showPasswords ? "text" : "password"}
                placeholder="كلمة السر الجديدة"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-200 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all pr-4 pl-10"
              />
            </div>

            <div className="relative">
              <input
                type={showPasswords ? "text" : "password"}
                placeholder="تأكيد كلمة السر الجديدة"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-200 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all pr-4 pl-10"
              />
            </div>

            {message && (
              <div
                className={`p-3 rounded-lg text-sm font-bold ${
                  message.type === "success"
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {message.text}
              </div>
            )}

            <button
              onClick={handleChangePassword}
              disabled={isSubmitting}
              className="w-full py-3 rounded-lg text-sm font-bold bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/30 hover:shadow-xl"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  جاري التغيير...
                </span>
              ) : (
                "تغيير كلمة السر"
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {showImageOptions && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => !imageUploading && setShowImageOptions(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-gray-900">
                صورة الملف الشخصي
              </h3>
              <button
                onClick={() => setShowImageOptions(false)}
                disabled={imageUploading}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex justify-center">
                <div className="w-24 h-24 rounded-full bg-linear-to-br from-primary to-green-600 flex items-center justify-center text-white overflow-hidden border-2 border-green-200 shadow-md">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : displayImage ? (
                    <img
                      src={displayImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl font-bold">
                      {getInitial(displayName)}
                    </span>
                  )}
                </div>
              </div>

              <p className="text-center text-xs text-gray-400">
                {profileImage ? "تعديل الصورة الشخصية" : "إضافة صورة شخصية"}
              </p>

              {imageMessage && (
                <div
                  className={`p-3 rounded-lg text-sm font-bold text-center ${
                    imageMessage.type === "success"
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {imageMessage.text}
                </div>
              )}

              <label
                className={`w-full py-3 rounded-lg text-sm font-bold bg-primary text-white hover:bg-primary/90 transition-colors cursor-pointer text-center shadow-lg shadow-primary/30 ${
                  imageUploading ? "opacity-50 pointer-events-none" : ""
                }`}
              >
                {imageUploading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    جاري الرفع...
                  </span>
                ) : profileImage ? (
                  "تغيير الصورة"
                ) : (
                  "إضافة صورة"
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={imageUploading}
                  className="hidden"
                />
              </label>

              {profileImage && (
                <button
                  onClick={handleRemoveImage}
                  disabled={imageUploading}
                  className="w-full py-3 rounded-lg text-sm font-bold bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                >
                  حذف الصورة
                </button>
              )}

              <button
                onClick={() => setShowImageOptions(false)}
                disabled={imageUploading}
                className="w-full py-3 rounded-lg text-sm font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.section>
  );
};

export default Profile;
