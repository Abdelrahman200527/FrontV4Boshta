import { useState, useEffect, useCallback } from "react";
import {
  User,
  Phone,
  GraduationCap,
  Lock,
  Eye,
  EyeOff,
  Camera,
  X,
  Barcode,
  Users,
  Shield,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Copy,
  Link2,
} from "lucide-react";
import {
  changeStudentPassword,
  updateStudentProfileImage,
  deleteStudentProfileImage,
  fetchStudentProfile,
  fetchStudentStats,
} from "../api/student/actions";
import getUser from "../utils/getUser";
import getImageUrl from "../utils/imageUrl";
import { motion, AnimatePresence } from "framer-motion";
import { pageVariants, itemVariants } from "../motion";

const Profile = () => {
  const user = getUser();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const [profileImage, setProfileImage] = useState(null);
  const [showImageOptions, setShowImageOptions] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageMessage, setImageMessage] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [copyMessage, setCopyMessage] = useState(null);

  const loadProfile = useCallback(async () => {
    const [profileRes, statsRes] = await Promise.all([
      fetchStudentProfile(),
      fetchStudentStats(),
    ]);

    if (profileRes.success) {
      setProfile(profileRes.data);
      if (profileRes.data.profile_image) {
        setProfileImage(getImageUrl(profileRes.data.profile_image));
      }
    }

    if (statsRes.success) {
      setStats(statsRes.data);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProfile();
    setRefreshing(false);
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

    setLoading(true);
    const result = await changeStudentPassword(
      oldPassword,
      newPassword,
      confirmPassword,
    );
    setLoading(false);

    if (result.success) {
      setMessage({ type: "success", text: "تم تغيير كلمة السر بنجاح" });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswords(false);
    } else {
      setMessage({ type: "error", text: result.error });
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setImageLoading(true);
    setImageMessage(null);

    const formData = new FormData();
    formData.append("image", file);

    const result = await updateStudentProfileImage(formData);

    if (result.success) {
      const imagePath =
        result.data?.profile_image || result.data?.data?.profile_image;
      if (imagePath) {
        setProfileImage(getImageUrl(imagePath));
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

    const result = await deleteStudentProfileImage();
    if (result.success) {
      setProfileImage(null);
      setShowImageOptions(false);
      setImageMessage({ type: "success", text: "تم حذف الصورة بنجاح" });
    } else {
      setImageMessage({
        type: "error",
        text: result.error || "فشل حذف الصورة",
      });
    }

    setImageLoading(false);
  };

  const handleCopyParentLink = async () => {
    if (!profile?.parent_token) return;

    const parentLink = `${window.location.origin}/parent/${profile.parent_token}`;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(parentLink);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = parentLink;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }

      setCopyMessage("تم نسخ الرابط بنجاح");
      setTimeout(() => setCopyMessage(null), 3000);
    } catch (error) {
      console.error("Copy error:", error);
      setCopyMessage("فشل نسخ الرابط");
      setTimeout(() => setCopyMessage(null), 3000);
    }
  };

  return (
    <motion.section
      variants={pageVariants}
      initial="hidden"
      animate="show"
      className="w-full min-h-screen p-3 sm:p-5 md:p-8 bg-gray-50"
      dir="rtl"
    >
      <motion.div
        variants={itemVariants}
        className="max-w-2xl mx-auto flex flex-col gap-4"
      >
        {/* Header */}
        <motion.header
          variants={itemVariants}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              الملف الشخصي
            </h1>
            <span className="text-sm text-gray-500">بيانات الطالب</span>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-2 rounded-lg text-sm font-bold text-gray-600 hover:border-[#009966] transition"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            تحديث
          </button>
        </motion.header>

        {/* Image Message */}
        <AnimatePresence>
          {imageMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-bold ${
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

        {/* Copy Message */}
        <AnimatePresence>
          {copyMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-bold bg-green-50 text-green-700 border border-green-200"
            >
              <CheckCircle2 size={16} />
              {copyMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info Card */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
        >
          {/* Profile Header */}
          <div className="p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-4 sm:gap-5 border-b border-gray-100 bg-linear-to-l from-green-50/50 to-transparent">
            <div className="relative group shrink-0">
              <div
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-green-50 flex items-center justify-center text-[#009966] overflow-hidden border-4 border-white shadow-lg cursor-pointer ring-2 ring-green-200"
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
                  <User size={44} />
                )}

                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full">
                  <Camera size={24} className="text-white" />
                </div>
              </div>
            </div>
            <div className="min-w-0 text-center sm:text-right">
              <h2 className="font-bold text-xl sm:text-2xl text-gray-900 truncate">
                {profile?.full_name || user?.full_name || "غير معروف"}
              </h2>
              <span className="text-sm text-gray-500 flex items-center justify-center sm:justify-start gap-1 mt-1">
                <GraduationCap size={14} className="text-[#009966]" />
                طالب
              </span>
            </div>
          </div>

          {/* Profile Details */}
          <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Barcode */}
            <div className="bg-gray-50 hover:bg-green-50/50 rounded-xl p-4 flex items-center gap-3 border border-transparent hover:border-green-200 transition-all duration-200">
              <div className="bg-white rounded-lg p-2.5 shadow-sm shrink-0">
                <Barcode size={18} className="text-[#009966]" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-gray-500 block mb-0.5">
                  الباركود
                </span>
                <span className="font-bold text-sm text-gray-900">
                  {profile?.barcode || "-"}
                </span>
              </div>
            </div>

            {/* Phone */}
            <div className="bg-gray-50 hover:bg-green-50/50 rounded-xl p-4 flex items-center gap-3 border border-transparent hover:border-green-200 transition-all duration-200">
              <div className="bg-white rounded-lg p-2.5 shadow-sm shrink-0">
                <Phone size={18} className="text-[#009966]" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-gray-500 block mb-0.5">
                  رقم الهاتف
                </span>
                <span className="font-bold text-sm text-gray-900" dir="ltr">
                  {profile?.phone || user?.phone || "-"}
                </span>
              </div>
            </div>

            {/* Grade */}
            <div className="bg-gray-50 hover:bg-green-50/50 rounded-xl p-4 flex items-center gap-3 border border-transparent hover:border-green-200 transition-all duration-200">
              <div className="bg-white rounded-lg p-2.5 shadow-sm shrink-0">
                <GraduationCap size={18} className="text-[#009966]" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-gray-500 block mb-0.5">
                  الصف
                </span>
                <span className="font-bold text-sm text-gray-900">
                  {profile?.grade_name || "-"}
                </span>
              </div>
            </div>

            {/* Group */}
            <div className="bg-gray-50 hover:bg-green-50/50 rounded-xl p-4 flex items-center gap-3 border border-transparent hover:border-green-200 transition-all duration-200">
              <div className="bg-white rounded-lg p-2.5 shadow-sm shrink-0">
                <Users size={18} className="text-[#009966]" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-gray-500 block mb-0.5">
                  المجموعة
                </span>
                <span className="font-bold text-sm text-gray-900">
                  {profile?.group_name || "-"}
                </span>
              </div>
            </div>

            {/* Parent Phone */}
            {profile?.parent_phone && (
              <div className="bg-gray-50 hover:bg-green-50/50 rounded-xl p-4 flex items-center gap-3 border border-transparent hover:border-green-200 transition-all duration-200">
                <div className="bg-white rounded-lg p-2.5 shadow-sm shrink-0">
                  <Phone size={18} className="text-[#009966]" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-gray-500 block mb-0.5">
                    هاتف ولي الأمر
                  </span>
                  <span className="font-bold text-sm text-gray-900" dir="ltr">
                    {profile.parent_phone}
                  </span>
                </div>
              </div>
            )}

            {/* Parent Link */}
            <div
              className="bg-gray-50 hover:bg-green-50/50 rounded-xl p-4 flex items-center gap-3 border border-transparent hover:border-green-200 transition-all duration-200 cursor-pointer group sm:col-span-2"
              onClick={handleCopyParentLink}
            >
              <div className="bg-white rounded-lg p-2.5 shadow-sm shrink-0">
                <Link2
                  size={18}
                  className="text-[#009966] group-hover:scale-110 transition-transform"
                />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] text-gray-500 block mb-0.5">
                  رابط متابعة ولي الأمر
                </span>
                <span className="font-bold text-sm text-gray-900">
                  انسخ الرابط وشاركه
                </span>
              </div>
              {profile?.parent_token && (
                <Copy
                  size={16}
                  className="text-gray-400 group-hover:text-[#009966] transition-colors shrink-0"
                />
              )}
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        {stats && (
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3"
          >
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 text-center hover:border-green-200 hover:shadow-md transition-all duration-200">
              <div className="w-10 h-10 mx-auto rounded-full bg-green-50 flex items-center justify-center mb-2">
                <CheckCircle2 size={18} className="text-green-600" />
              </div>
              <span className="text-xl sm:text-2xl font-bold text-green-700 block">
                {stats.attendance_percentage || 0}%
              </span>
              <span className="text-[10px] sm:text-xs text-gray-500">
                نسبة الحضور
              </span>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 text-center hover:border-blue-200 hover:shadow-md transition-all duration-200">
              <div className="w-10 h-10 mx-auto rounded-full bg-blue-50 flex items-center justify-center mb-2">
                <Users size={18} className="text-blue-600" />
              </div>
              <span className="text-xl sm:text-2xl font-bold text-blue-700 block">
                {stats.present_days || 0}
              </span>
              <span className="text-[10px] sm:text-xs text-gray-500">
                أيام الحضور
              </span>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 text-center hover:border-red-200 hover:shadow-md transition-all duration-200">
              <div className="w-10 h-10 mx-auto rounded-full bg-red-50 flex items-center justify-center mb-2">
                <X size={18} className="text-red-600" />
              </div>
              <span className="text-xl sm:text-2xl font-bold text-red-700 block">
                {stats.absent_days || 0}
              </span>
              <span className="text-[10px] sm:text-xs text-gray-500">
                أيام الغياب
              </span>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 text-center hover:border-purple-200 hover:shadow-md transition-all duration-200">
              <div className="w-10 h-10 mx-auto rounded-full bg-purple-50 flex items-center justify-center mb-2">
                <Shield size={18} className="text-purple-600" />
              </div>
              <span className="text-xl sm:text-2xl font-bold text-purple-700 block">
                {stats.avg_paper_degree || 0}
              </span>
              <span className="text-[10px] sm:text-xs text-gray-500">
                متوسط الدرجات
              </span>
            </div>
          </motion.div>
        )}

        {/* Change Password */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-5"
        >
          <h3 className="font-bold text-base mb-4 flex items-center gap-2">
            <div className="bg-[#009966] rounded-lg p-1.5">
              <Lock size={14} className="text-white" />
            </div>
            تغيير كلمة السر
          </h3>
          <div className="flex flex-col gap-3">
            <div className="relative">
              <input
                type={showPasswords ? "text" : "password"}
                placeholder="كلمة السر القديمة"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#009966] focus:ring-2 focus:ring-green-100 pl-10 transition-all"
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
                className="w-full p-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#009966] focus:ring-2 focus:ring-green-100 pl-10 transition-all"
              />
            </div>
            <div className="relative">
              <input
                type={showPasswords ? "text" : "password"}
                placeholder="تأكيد كلمة السر"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#009966] focus:ring-2 focus:ring-green-100 pl-10 transition-all"
              />
            </div>

            <AnimatePresence>
              {message && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`p-3 rounded-lg text-sm font-bold flex items-center gap-2 ${
                    message.type === "success"
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {message.type === "success" ? (
                    <CheckCircle2 size={14} />
                  ) : (
                    <AlertCircle size={14} />
                  )}
                  {message.text}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={handleChangePassword}
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-bold bg-[#009966] text-white hover:bg-[#007a52] transition-all hover:shadow-lg disabled:opacity-50"
            >
              {loading ? "جاري التغيير..." : "تغيير كلمة السر"}
            </button>
          </div>
        </motion.div>
      </motion.div>

      {/* Image Modal */}
      <AnimatePresence>
        {showImageOptions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowImageOptions(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-4 sm:p-6 max-w-sm w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-base sm:text-lg text-gray-900">
                  صورة الملف الشخصي
                </h3>
                <button
                  onClick={() => setShowImageOptions(false)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={18} className="text-gray-500" />
                </button>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex justify-center">
                  <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-green-50 flex items-center justify-center text-[#009966] overflow-hidden border-4 border-green-200 shadow-lg">
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
                      <User size={48} />
                    )}
                  </div>
                </div>

                <label className="w-full py-2.5 sm:py-3 rounded-xl text-sm font-bold bg-[#009966] text-white hover:bg-[#007a52] transition-all hover:shadow-lg cursor-pointer text-center disabled:opacity-50">
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
                    className="w-full py-2.5 sm:py-3 rounded-xl text-sm font-bold bg-red-50 text-red-600 hover:bg-red-100 transition-all disabled:opacity-50"
                  >
                    {imageLoading ? "جاري..." : "حذف الصورة"}
                  </button>
                )}

                <button
                  onClick={() => setShowImageOptions(false)}
                  className="w-full py-2.5 sm:py-3 rounded-xl text-sm font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
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
