import { motion } from "framer-motion";
import { pageVariants } from "../motion";
import React, { useState } from "react";
import { GraduationCap, Menu, X, LogOut, ChevronDown } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { logout } from "../api/auth/actions";
import { getUserPermissions, getUserRole } from "../utils/getUser";
import MrBoshta from "../assets/Mr-Boshta-removebg.png";
import {
  LayoutDashboard,
  CalendarCheck2,
  BookOpen,
  BarChart3,
  FileCheck2,
  ClipboardList,
  User,
  Users,
  FileText,
  UserRoundPen,
  ClipboardPlus,
  Video,
  Layers,
  BadgeDollarSign,
  Globe,
  Settings,
  MessageCircle,
  CalendarClock,
} from "lucide-react";

// ============ NAV ITEMS ============

const studentNavItems = [
  { title: "لوحة التحكم", icon: LayoutDashboard, path: "/student" },
  {
    title: "الحضور والغياب",
    icon: CalendarCheck2,
    path: "/student/attendance",
  },
  { title: "المحاضرات", icon: BookOpen, path: "/student/courses" },
  { title: "الدرجات", icon: BarChart3, path: "/student/degrees" },
  { title: "الامتحانات", icon: FileCheck2, path: "/student/exams" },
  { title: "الواجبات", icon: ClipboardList, path: "/student/homework" },
  { title: "الملف الشخصي", icon: User, path: "/student/profile" },
];

const teacherNavItems = [
  { title: "لوحة التحكم", icon: LayoutDashboard, path: "/teacher" },
  { title: "الطلاب", icon: Users, path: "/teacher/students" },
  {
    title: "الحضور والغياب",
    icon: CalendarCheck2,
    path: "/teacher/attendance",
  },
  { title: "المحاضرات", icon: BookOpen, path: "/teacher/courses" },
  { title: "الإمتحانات", icon: BarChart3, path: "/teacher/degrees" },
  { title: "الإحصائيات", icon: FileText, path: "/teacher/reports" },
  { title: "المساعدين", icon: UserRoundPen, path: "/teacher/assistants" },
  { title: "الملف الشخصي", icon: User, path: "/teacher/profile" },
];

// ============ ASSISTANT ONLINE (online_management) ============
const assistantOnlineNavItems = [
  { title: "لوحة التحكم", icon: LayoutDashboard, path: "/assistant" },
  {
    title: "اونلاين",
    icon: Globe,
    children: [
      { title: "المحاضرات", icon: BookOpen, path: "/assistant/online/videos" },
      {
        title: "الامتحانات",
        icon: FileCheck2,
        path: "/assistant/online/exams",
      },
      {
        title: "الواجبات",
        icon: ClipboardList,
        path: "/assistant/online/homework",
      },
    ],
  },
  { title: "الملف الشخصي", icon: User, path: "/assistant/profile" },
];

// ============ ASSISTANT CENTER (center_management) ============
const assistantCenterNavItems = [
  { title: "لوحة التحكم", icon: LayoutDashboard, path: "/assistant" },
  {
    title: "اونلاين",
    icon: Globe,
    children: [
      { title: "المحاضرات", icon: BookOpen, path: "/assistant/online/videos" },
      {
        title: "الامتحانات",
        icon: FileCheck2,
        path: "/assistant/online/exams",
      },
      {
        title: "الواجبات",
        icon: ClipboardList,
        path: "/assistant/online/homework",
      },
    ],
  },
  {
    title: "إدارة",
    icon: Layers,
    children: [
      { title: "الطلاب", icon: Users, path: "/assistant/management/students" },
      {
        title: "الحضور والغياب",
        icon: CalendarCheck2,
        path: "/assistant/management/attendance",
      },
      {
        title: "المجموعات",
        icon: CalendarClock,
        path: "/assistant/management/groups",
      },
      {
        title: "الصفوف",
        icon: BarChart3,
        path: "/assistant/management/grades",
      },
      {
        title: "الامتحانات",
        icon: ClipboardPlus,
        path: "/assistant/management/exams",
      },
      {
        title: "المدفوعات",
        icon: BadgeDollarSign,
        path: "/assistant/management/payments",
      },
      {
        title: "واتساب",
        icon: MessageCircle,
        path: "/assistant/management/whatsapp",
      },
    ],
  },
  { title: "الملف الشخصي", icon: User, path: "/assistant/profile" },
];

const roleNames = {
  student: "الطالب",
  teacher: "المعلم",
  assistant: "المساعد",
};

function ArabicGeomPattern() {
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-10 pointer-events-none"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 200"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <pattern
          id="geom"
          x="0"
          y="0"
          width="40"
          height="40"
          patternUnits="userSpaceOnUse"
        >
          <circle
            cx="20"
            cy="20"
            r="8"
            fill="none"
            stroke="#E2A558"
            strokeWidth="0.8"
          />
          <circle
            cx="20"
            cy="20"
            r="4"
            fill="none"
            stroke="#E2A558"
            strokeWidth="0.5"
          />
          <line
            x1="20"
            y1="0"
            x2="20"
            y2="40"
            stroke="#E2A558"
            strokeWidth="0.4"
          />
          <line
            x1="0"
            y1="20"
            x2="40"
            y2="20"
            stroke="#E2A558"
            strokeWidth="0.4"
          />
          <line
            x1="0"
            y1="0"
            x2="40"
            y2="40"
            stroke="#E2A558"
            strokeWidth="0.3"
          />
          <line
            x1="40"
            y1="0"
            x2="0"
            y2="40"
            stroke="#E2A558"
            strokeWidth="0.3"
          />
          <polygon
            points="20,4 24,12 32,12 26,18 28,26 20,21 12,26 14,18 8,12 16,12"
            fill="none"
            stroke="#E2A558"
            strokeWidth="0.5"
          />
        </pattern>
      </defs>
      <rect width="200" height="200" fill="url(#geom)" />
    </svg>
  );
}

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState({});

  const toggleGroup = (title) =>
    setOpenGroups((prev) => ({ ...prev, [title]: !prev[title] }));

  const role = getUserRole() || getRoleFromPath();

  function getRoleFromPath() {
    if (location.pathname.startsWith("/student")) return "student";
    if (location.pathname.startsWith("/teacher")) return "teacher";
    if (location.pathname.startsWith("/assistant")) return "assistant";
    return "student";
  }

  const getNavItems = () => {
    const permissions = getUserPermissions();

    if (role === "student") return studentNavItems;
    if (role === "teacher") return teacherNavItems;

    if (role === "assistant") {
      if (permissions === "center_management") {
        return assistantCenterNavItems;
      }
      return assistantOnlineNavItems;
    }

    return studentNavItems;
  };

  const navItems = getNavItems();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 right-0 left-0 z-40 flex items-center justify-between bg-linear-to-l from-[#003322] to-[#009966] px-4 py-1 shadow-sm">
        <div className="flex items-center justify-center gap-2 text-white">
          <span className="text-lg font-bold font-mekalbaz">أ / محمد بشتة</span>
          <img className="w-20 h-20" src={MrBoshta} alt="Mr Boshta" />
        </div>
        <button
          type="button"
          aria-label="فتح القائمة"
          onClick={() => setOpen(true)}
          className="rounded-lg p-2 text-white transition-colors hover:bg-white/10"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 right-0 z-50 h-screen w-60 shrink-0 flex flex-col border-l border-sidebar-border bg-[#0f3d0f] p-6 transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between text-white lg:justify-start lg:gap-2 shrink-0">
          <div className="flex flex-col items-center justify-center">
            <span className="text-xl font-mekalbaz">أ / محمد بشتة</span>
            <span className="text-xs text-gray-400">
              {roleNames[role] || "الطالب"}
            </span>
          </div>
          <img className="w-20 h-20" src={MrBoshta} alt="Mr Boshta" />
          <button
            type="button"
            aria-label="إغلاق القائمة"
            onClick={() => setOpen(false)}
            className="lg:hidden rounded-lg p-2 text-white transition-colors hover:bg-white/10"
          >
            <X size={24} />
          </button>
        </div>

        <div className="mt-8 flex flex-col gap-3 z-10 flex-1 overflow-y-auto min-h-0 custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;

            if (item.children) {
              const groupActive = item.children.some(
                (child) => location.pathname === child.path,
              );
              const expanded = openGroups[item.title] ?? groupActive;

              return (
                <motion.div
                  variants={pageVariants}
                  initial="hidden"
                  animate="show"
                  key={item.title}
                  className="flex flex-col gap-2"
                >
                  <button
                    onClick={() => toggleGroup(item.title)}
                    aria-expanded={expanded}
                    className={`group flex items-center justify-between rounded-2xl px-5 py-4 transition-all duration-300 ${
                      groupActive
                        ? "bg-sidebar-accent text-white"
                        : "text-[#e2e8f0] hover:text-[#f8fafc] hover:bg-sidebar-accent"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <ChevronDown
                        size={18}
                        className={`transition-transform duration-300 ${
                          expanded ? "rotate-180" : ""
                        }`}
                      />
                      <span className="text-lg font-bold">{item.title}</span>
                    </span>
                    <Icon
                      size={22}
                      className={`transition-all ${
                        groupActive
                          ? "text-white"
                          : "text-gray-400 group-hover:text-white"
                      }`}
                    />
                  </button>

                  {expanded && (
                    <div className="flex flex-col gap-2 border-r border-white/10 pr-3 mr-3">
                      {item.children.map((child) => {
                        const ChildIcon = child.icon;
                        const childActive = location.pathname === child.path;

                        return (
                          <button
                            key={child.path}
                            onClick={() => {
                              navigate(child.path);
                              setOpen(false);
                            }}
                            className={`group flex items-center justify-between rounded-xl px-4 py-3 transition-all duration-300 ${
                              childActive
                                ? "bg-[#b8860b] text-white"
                                : "text-[#e2e8f0] hover:text-[#f8fafc] hover:bg-sidebar-accent"
                            }`}
                          >
                            <span className="text-base font-semibold">
                              {child.title}
                            </span>
                            <ChildIcon
                              size={18}
                              className={`transition-all ${
                                childActive
                                  ? "text-white"
                                  : "text-gray-500 group-hover:text-white"
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              );
            }

            const active = location.pathname === item.path;

            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setOpen(false);
                }}
                className={`group flex items-center justify-between rounded-2xl px-5 py-4 transition-all duration-300 ${
                  active
                    ? "bg-[#b8860b] text-white"
                    : "text-[#e2e8f0] hover:text-[#f8fafc] hover:bg-sidebar-accent"
                }`}
              >
                <span className="text-lg font-bold">{item.title}</span>
                <Icon
                  size={22}
                  className={`transition-all ${
                    active
                      ? "text-white"
                      : "text-gray-400 group-hover:text-white"
                  }`}
                />
              </button>
            );
          })}
        </div>

        <button
          onClick={handleLogout}
          className="shrink-0 flex items-center justify-between rounded-2xl px-5 py-4 text-gray-300 hover:bg-red-500/20 hover:text-red-400 transition-all z-10 mt-2 border-t border-white/10 pt-4"
        >
          <span className="text-lg font-bold">تسجيل الخروج</span>
          <LogOut size={22} />
        </button>

        <ArabicGeomPattern />
      </aside>
    </>
  );
};

export default Sidebar;