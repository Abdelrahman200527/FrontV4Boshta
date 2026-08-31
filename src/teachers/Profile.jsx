import { useState, useCallback, useEffect } from "react";
import {
  User,
  Phone,
  GraduationCap,
  Camera,
  X,
  Lock,
  Eye,
  EyeOff,
  Shield,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Mail,
  Clock,
  BadgeCheck,
  KeyRound,
  Upload,
  Trash2,
  ChevronDown,
} from "lucide-react";
import getUser, { updateUserCookie } from "../utils/getUser";
import getImageUrl from "../utils/imageUrl";
import {
  changeTeacherPassword,
  updateTeacherProfileImageAction,
  deleteTeacherProfileImageAction,
  fetchTeacherProfile,
} from "../api/teacher/actions";
import { motion, AnimatePresence } from "framer-motion";
import { pageVariants, itemVariants } from "../motion";

const Profile = () => {
  const user = getUser();
  const [profileImage, setProfileImage] = useState(null);
  const [showImageOptions, setShowImageOptions] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageMessage, setImageMessage] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [profileData, setProfileData] = useState(user);
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  // تحميل البروفايل تلقائياً عند الدخول
  useEffect(() => {
    loadProfile();
  }, []);

  // إصلاح مسار الصورة
  useEffect(() => {
    if (profileData?.profile_image) {
      const fullImageUrl = getImageUrl(profileData.profile_image);
      setProfileImage(fullImageUrl);
    } else {
      setProfileImage(null);
    }
  }, [profileData]);

  const loadProfile = useCallback(async () => {
    const result = await fetchTeacherProfile();
    if (result.success && result.data) {
      setProfileData(result.data);
      updateUserCookie(result.data);
    }
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProfile();
    setRefreshing(false);
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setImageLoading(true);
    setImageMessage(null);

    const formData = new FormData();
    formData.append("image", file);

    const result = await updateTeacherProfileImageAction(formData);

    if (result.success) {
      const imagePath =
        result.data?.profile_image || result.data?.data?.profile_image;

      if (imagePath) {
        const fullImageUrl = getImageUrl(imagePath);
        setProfileImage(fullImageUrl);
        updateUserCookie({ profile_image: imagePath });
      }

      setShowImageOptions(false);
      setImageMessage({ type: "success", text: "تم تحديث الصورة بنجاح" });
    } else {
      setImageMessage({
        type: "error",
        text: result.error || "فشل تحديث الصورة",
      });
    }

    setImageLoading(false);
    event.target.value = "";
  };

  const handleRemoveImage = async () => {
    setImageLoading(true);
    setImageMessage(null);

    const result = await deleteTeacherProfileImageAction();
    if (result.success) {
      setProfileImage(null);
      setProfileData((prev) => ({ ...prev, profile_image: null }));
      setShowImageOptions(false);
      updateUserCookie({ profile_image: null });
      setImageMessage({ type: "success", text: "تم حذف الصورة بنجاح" });
    } else {
      setImageMessage({
        type: "error",
        text: result.error || "فشل حذف الصورة",
      });
    }

    setImageLoading(false);
  };

  const roleName =
    profileData?.role === "assistant"
      ? "مساعد"
      : profileData?.role === "teacher"
        ? "معلم"
        : profileData?.role;

  const permissionsName =
    profileData?.permissions === "center_management"
      ? "إدارة كاملة"
      : profileData?.permissions === "online_management"
        ? "إدارة المنصة التعليمية"
        : "-";

  // Password states
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleChangePassword = async () => {
    setPasswordMessage(null);

    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordMessage({ type: "error", text: "يرجى ملء جميع الحقول" });
      return;
    }

    if (newPassword.length < 4) {
      setPasswordMessage({
        type: "error",
        text: "كلمة السر يجب أن تكون 4 أحرف على الأقل",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({
        type: "error",
        text: "كلمة السر الجديدة غير متطابقة",
      });
      return;
    }

    setPasswordLoading(true);
    const result = await changeTeacherPassword(
      oldPassword,
      newPassword,
      confirmPassword,
    );
    setPasswordLoading(false);

    if (result.success) {
      setPasswordMessage({ type: "success", text: "تم تغيير كلمة السر بنجاح" });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswords(false);
    } else {
      setPasswordMessage({
        type: "error",
        text: result.error || "فشل تغيير كلمة السر",
      });
    }
  };

  return (
    <motion.section
      variants={pageVariants}
      initial="hidden"
      animate="show"
      className="p-3 sm:p-5 md:p-8 font-sans min-h-screen bg-gray-50"
      dir="rtl"
    >
      <div className="max-w-5xl mx-auto flex flex-col gap-4 sm:gap-5">
        {/* Header */}
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-between flex-wrap gap-3"
        >
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
              الملف الشخصي
            </h1>
            <span className="text-xs sm:text-sm text-gray-500">
              بيانات المعلم وإعدادات الحساب
            </span>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-2 rounded-lg text-xs sm:text-sm font-bold text-gray-600 hover:border-[#009966] hover:text-[#009966] transition"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            تحديث البيانات
          </button>
        </motion.div>

        {/* Image Message */}
        <AnimatePresence>
          {imageMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold ${
                imageMessage.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {imageMessage.type === "success" ? (
                <CheckCircle2 size={16} />
              ) : (
                <AlertCircle size={16} />
              )}
              {imageMessage.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Profile Card */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
        >
          {/* Header Banner */}
          <div className="bg-linear-to-l from-[#003322] to-[#009966] px-4 sm:px-6 py-6 sm:py-8 flex items-center gap-4 sm:gap-6">
            <div className="relative shrink-0">
              <div
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/20 flex items-center justify-center text-white overflow-hidden border-4 border-white/30 cursor-pointer hover:border-white/50 transition"
                onClick={() => setShowImageOptions(true)}
              >
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                ) : (
                  <User size={36} className="sm:w-10 sm:h-10" />
                )}
              </div>
              <button
                onClick={() => setShowImageOptions(true)}
                className="absolute -bottom-1 -left-1 bg-white text-[#009966] p-2 rounded-full shadow-lg hover:scale-110 transition"
              >
                <Camera size={14} />
              </button>
            </div>

            <div className="text-white flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold truncate">
                {profileData?.full_name || "غير معروف"}
              </h2>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-xs sm:text-sm bg-white/20 px-2 py-1 rounded-full flex items-center gap-1">
                  <BadgeCheck size={12} />
                  {roleName}
                </span>
                <span className="text-xs sm:text-sm bg-white/20 px-2 py-1 rounded-full flex items-center gap-1">
                  <Shield size={12} />
                  {permissionsName}
                </span>
              </div>
            </div>
          </div>

          {/* Info Grid */}
          <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-gray-50 rounded-xl p-3 sm:p-4 flex items-center gap-3 hover:bg-gray-100 transition">
              <div className="bg-white rounded-lg p-2 shadow-sm shrink-0">
                <Phone size={16} className="text-[#009966]" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] sm:text-xs text-gray-400 block mb-0.5">
                  رقم الهاتف
                </span>
                <span
                  className="font-bold text-xs sm:text-sm text-gray-800 block truncate"
                  dir="ltr"
                >
                  {profileData?.phone || "-"}
                </span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-3 sm:p-4 flex items-center gap-3 hover:bg-gray-100 transition">
              <div className="bg-white rounded-lg p-2 shadow-sm shrink-0">
                <GraduationCap size={16} className="text-[#009966]" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] sm:text-xs text-gray-400 block mb-0.5">
                  الدور
                </span>
                <span className="font-bold text-xs sm:text-sm text-gray-800 block truncate">
                  {roleName}
                </span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-3 sm:p-4 flex items-center gap-3 hover:bg-gray-100 transition">
              <div className="bg-white rounded-lg p-2 shadow-sm shrink-0">
                <Shield size={16} className="text-[#009966]" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] sm:text-xs text-gray-400 block mb-0.5">
                  الصلاحيات
                </span>
                <span className="font-bold text-xs sm:text-sm text-gray-800 block truncate">
                  {permissionsName}
                </span>
              </div>
            </div>
          </div>

          {/* Password Section Toggle */}
          <div className="px-4 sm:px-6 pb-4 sm:pb-6">
            <button
              onClick={() => setShowPasswordSection(!showPasswordSection)}
              className="w-full flex items-center justify-between bg-gray-50 hover:bg-gray-100 rounded-xl p-3 sm:p-4 transition"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="bg-white rounded-lg p-2 shadow-sm shrink-0">
                  <KeyRound size={16} className="text-[#009966]" />
                </div>
                <div className="text-right">
                  <span className="font-bold text-xs sm:text-sm text-gray-800 block">
                    تغيير كلمة السر
                  </span>
                  <span className="text-[10px] sm:text-xs text-gray-400">
                    تحديث كلمة السر الخاصة بك
                  </span>
                </div>
              </div>
              <ChevronDown
                size={16}
                className={`text-gray-400 transition-transform ${showPasswordSection ? "rotate-180" : ""}`}
              />
            </button>

            <AnimatePresence>
              {showPasswordSection && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 flex flex-col gap-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="relative">
                        <input
                          type={showPasswords ? "text" : "password"}
                          placeholder="كلمة السر القديمة"
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                          className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#009966] focus:ring-2 focus:ring-[#009966]/10 transition pl-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(!showPasswords)}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>
                      </div>
                      <input
                        type={showPasswords ? "text" : "password"}
                        placeholder="كلمة السر الجديدة"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="p-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#009966] focus:ring-2 focus:ring-[#009966]/10 transition"
                      />
                      <input
                        type={showPasswords ? "text" : "password"}
                        placeholder="تأكيد كلمة السر"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="p-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#009966] focus:ring-2 focus:ring-[#009966]/10 transition"
                      />
                    </div>

                    <AnimatePresence>
                      {passwordMessage && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className={`flex items-center gap-2 text-xs sm:text-sm font-bold ${
                            passwordMessage.type === "success"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {passwordMessage.type === "success" ? (
                            <CheckCircle2 size={14} />
                          ) : (
                            <AlertCircle size={14} />
                          )}
                          {passwordMessage.text}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <button
                      onClick={handleChangePassword}
                      disabled={passwordLoading}
                      className="w-full md:w-auto md:self-start px-6 py-2.5 rounded-xl text-sm font-bold bg-[#009966] text-white hover:bg-[#007a52] transition-colors disabled:opacity-50"
                    >
                      {passwordLoading ? "جاري التغيير..." : "تغيير كلمة السر"}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Modal لخيارات الصورة */}
      <AnimatePresence>
        {showImageOptions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowImageOptions(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-5 sm:p-6 max-w-sm w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-bold text-base sm:text-lg text-gray-900">
                  صورة الملف الشخصي
                </h3>
                <button
                  onClick={() => setShowImageOptions(false)}
                  className="p-1.5 hover:bg-gray-100 rounded-full transition"
                >
                  <X size={18} className="text-gray-500" />
                </button>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex justify-center">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-green-50 flex items-center justify-center text-[#009966] overflow-hidden border-4 border-green-100">
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt="Profile"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    ) : (
                      <User size={40} />
                    )}
                  </div>
                </div>

                <label className="w-full py-3 rounded-xl text-sm font-bold bg-[#009966] text-white hover:bg-[#007a52] transition-colors cursor-pointer text-center disabled:opacity-50 flex items-center justify-center gap-2">
                  <Upload size={16} />
                  {imageLoading
                    ? "جاري..."
                    : profileImage
                      ? "تغيير الصورة"
                      : "إضافة صورة"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={imageLoading}
                  />
                </label>

                {profileImage && (
                  <button
                    onClick={handleRemoveImage}
                    disabled={imageLoading}
                    className="w-full py-3 rounded-xl text-sm font-bold bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Trash2 size={16} />
                    {imageLoading ? "جاري..." : "حذف الصورة"}
                  </button>
                )}

                <button
                  onClick={() => setShowImageOptions(false)}
                  className="w-full py-3 rounded-xl text-sm font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
};

export default Profile;
