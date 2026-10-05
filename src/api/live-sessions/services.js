import { httpGet, httpPost, httpPut, httpDelete, httpPostFormData, httpPutFormData } from "../http";
import config from "../../config";

const { apiUrl } = config;

const isDemo = () => localStorage.getItem("is_demo") === "true";

const mockLiveSessions = [
  {
    id: 1,
    title: "مراجعة ليلة الامتحان: همزة الوصل والقطع (مباشر الآن)",
    description: "بث مباشر تفاعلي لمراجعة شاملة على همزات الوصل والقطع مع حل تدريبات تفاعلية والإجابة على استفسارات الطلاب مباشرة.",
    start_time: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    end_time: new Date(Date.now() + 1000 * 60 * 45).toISOString(),
    duration_minutes: 60,
    status: "live",
    target_type: "grade",
    grade_id: 3,
    meet_link: "https://meet.google.com/aqx-mmwy-zhv",
    material_name: "ملزمة_المراجعة_الشاملة.pdf"
  },
  {
    id: 2,
    title: "ورشة عمل: تدريبات إعراب كان وأخواتها وبنك الأسئلة",
    description: "حصة أونلاين تفاعلية لحل أكثر من 50 سؤال من بنك المعرفة وأسئلة امتحانات الثانوية العامة السابقة.",
    start_time: new Date(Date.now() + 86400000).toISOString(),
    end_time: new Date(Date.now() + 86400000 + 1000 * 60 * 90).toISOString(),
    duration_minutes: 90,
    status: "scheduled",
    target_type: "grade",
    grade_id: 3,
    meet_link: "https://meet.google.com/aqx-mmwy-zhv",
    material_name: "تدريبات_كان_وأخواتها.pdf"
  },
  {
    id: 3,
    title: "شرح نصوص وبلاغة الوحدة الأولى وحل أسئلة الوزارة",
    description: "تسجيل الحصة التفاعلية الخاصة بشرح المحسنات البديعية واستخراج الصور البيانية من نصوص المنهج.",
    start_time: new Date(Date.now() - 86400000 * 3).toISOString(),
    end_time: new Date(Date.now() - 86400000 * 3 + 1000 * 60 * 120).toISOString(),
    duration_minutes: 120,
    status: "ended",
    target_type: "group",
    group_id: 1,
    meet_link: "https://meet.google.com/aqx-mmwy-zhv",
    recording_url: "https://www.youtube.com/watch?v=03hsHuIXLQE",
    material_name: "ملخص_البلاغة_والنصوص.pdf"
  },
  {
    id: 4,
    title: "مهارات كتابة التعبير المقالي للثانوية العامة",
    description: "تسجيل ورشة تدريب الطلاب على صياغة الأفكار والابتعاد عن الأخطاء الإملائية الشائعة في سؤال المقال.",
    start_time: new Date(Date.now() - 86400000 * 8).toISOString(),
    end_time: new Date(Date.now() - 86400000 * 8 + 1000 * 60 * 60).toISOString(),
    duration_minutes: 60,
    status: "ended",
    target_type: "grade",
    grade_id: 3,
    meet_link: "https://meet.google.com/aqx-mmwy-zhv",
    recording_url: "https://www.youtube.com/watch?v=gbst-g9OMdw",
    material_name: "دليل_التعبير_المقالي.pdf"
  }
];

const LIVE_SESSIONS_STORAGE_KEY = "demo_live_sessions_store_v2";

const getDemoLiveSessions = () => {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem(LIVE_SESSIONS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
  }
  return [...mockLiveSessions];
};

const saveDemoLiveSessions = (sessions) => {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(LIVE_SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
    } catch {
      // ignore
    }
  }
};

// ============================================
// TEACHER LIVE SESSIONS SERVICES
// ============================================

export const teacherGetGoogleAuthUrl = async () => {
  if (isDemo()) return { url: "https://accounts.google.com" };
  const response = await httpGet("/teacher/google/auth-url");
  return response.data;
};

export const teacherGetGoogleStatus = async () => {
  if (isDemo()) return { connected: true, email: "boshta@benben.cloud" };
  const response = await httpGet("/teacher/google/status");
  return response.data;
};

export const teacherDisconnectGoogle = async () => {
  if (isDemo()) return { success: true };
  const response = await httpPost("/teacher/google/disconnect", {});
  return response;
};

export const teacherGetLiveSessions = async (params = {}) => {
  if (isDemo()) {
    let sessions = getDemoLiveSessions();
    if (params.status && params.status !== "all") {
      sessions = sessions.filter(s => s.status === params.status);
    }
    if (params.grade_id) {
      sessions = sessions.filter(s => String(s.grade_id) === String(params.grade_id));
    }
    if (params.search) {
      sessions = sessions.filter(s => s.title.includes(params.search));
    }
    return {
      data: sessions,
      sessions: sessions,
      pagination: { totalItems: sessions.length, totalPages: 1 }
    };
  }
  const query = new URLSearchParams();
  if (params.page) query.append("page", params.page);
  if (params.limit) query.append("limit", params.limit);
  if (params.status) query.append("status", params.status);
  if (params.grade_id) query.append("grade_id", params.grade_id);
  if (params.group_id) query.append("group_id", params.group_id);
  if (params.target_type) query.append("target_type", params.target_type);
  if (params.search) query.append("search", params.search);
  const response = await httpGet(`/teacher/live-sessions?${query.toString()}`);
  return response.data;
};

export const teacherGetLiveSessionById = async (id) => {
  if (isDemo()) {
    const sessions = getDemoLiveSessions();
    const s = sessions.find(item => String(item.id) === String(id)) || sessions[0];
    return { data: s, ...s };
  }
  const response = await httpGet(`/teacher/live-sessions/${id}`);
  return response.data;
};

export const teacherCreateLiveSession = async (formData) => {
  if (isDemo()) {
    const sessions = getDemoLiveSessions();
    const title = formData instanceof FormData ? formData.get("title") : formData?.title;
    const description = formData instanceof FormData ? formData.get("description") : formData?.description;
    const start_time = formData instanceof FormData ? formData.get("start_time") : formData?.start_time;
    const duration_minutes = formData instanceof FormData ? formData.get("duration_minutes") : formData?.duration_minutes;
    const target_type = formData instanceof FormData ? formData.get("target_type") : formData?.target_type;
    const grade_id = formData instanceof FormData ? formData.get("grade_id") : formData?.grade_id;
    const group_id = formData instanceof FormData ? formData.get("group_id") : formData?.group_id;

    const newSession = {
      id: Date.now(),
      title: title || "حصة بث مباشر تفاعلية",
      description: description || "",
      start_time: start_time || new Date().toISOString(),
      end_time: new Date(Date.now() + 3600000).toISOString(),
      duration_minutes: Number(duration_minutes) || 60,
      status: "scheduled",
      target_type: target_type || "grade",
      grade_id: grade_id ? Number(grade_id) : 3,
      group_id: group_id ? Number(group_id) : null,
      meet_link: "https://meet.google.com/aqx-mmwy-zhv",
      material_name: "ملزمة_المراجعة.pdf",
    };
    sessions.unshift(newSession);
    saveDemoLiveSessions(sessions);
    return { success: true, message: "تم إنشاء الحصة بنجاح", data: newSession };
  }
  const response = await httpPostFormData("/teacher/live-sessions", formData);
  return response.data;
};

export const teacherUpdateLiveSession = async (id, formData) => {
  if (isDemo()) {
    const sessions = getDemoLiveSessions();
    const idx = sessions.findIndex(s => String(s.id) === String(id));
    if (idx !== -1) {
      const title = formData instanceof FormData ? formData.get("title") : formData?.title;
      const description = formData instanceof FormData ? formData.get("description") : formData?.description;
      const start_time = formData instanceof FormData ? formData.get("start_time") : formData?.start_time;
      const duration_minutes = formData instanceof FormData ? formData.get("duration_minutes") : formData?.duration_minutes;
      const status = formData instanceof FormData ? formData.get("status") : formData?.status;
      const recording_url = formData instanceof FormData ? formData.get("recording_url") : formData?.recording_url;

      if (title) sessions[idx].title = title;
      if (description !== undefined) sessions[idx].description = description;
      if (start_time) sessions[idx].start_time = start_time;
      if (duration_minutes) sessions[idx].duration_minutes = Number(duration_minutes);
      if (status) sessions[idx].status = status;
      if (recording_url) sessions[idx].recording_url = recording_url;

      saveDemoLiveSessions(sessions);
      return { success: true, message: "تم حفظ التعديلات بنجاح", data: sessions[idx] };
    }
    return { success: true, message: "تم حفظ التعديلات بنجاح" };
  }
  const response = await httpPutFormData(`/teacher/live-sessions/${id}`, formData);
  return response.data;
};

export const teacherDeleteLiveSession = async (id) => {
  if (isDemo()) {
    let sessions = getDemoLiveSessions();
    sessions = sessions.filter(s => String(s.id) !== String(id));
    saveDemoLiveSessions(sessions);
    return { success: true, message: "تم حذف الحصة بنجاح" };
  }
  const response = await httpDelete(`/teacher/live-sessions/${id}`);
  return response;
};

export const teacherSyncRecording = async (id) => {
  if (isDemo()) {
    const sessions = getDemoLiveSessions();
    const s = sessions.find(item => String(item.id) === String(id));
    if (s) {
      s.recording_url = "https://www.youtube.com/watch?v=gbst-g9OMdw";
      saveDemoLiveSessions(sessions);
    }
    return { success: true, message: "تمت مزامنة التسجيل بنجاح" };
  }
  const response = await httpPost(`/teacher/live-sessions/${id}/sync-recording`, {});
  return response;
};

export const teacherUpdateRecordingUrl = async (id, recording_url) => {
  if (isDemo()) {
    const sessions = getDemoLiveSessions();
    const s = sessions.find(item => String(item.id) === String(id));
    if (s) {
      s.recording_url = recording_url;
      saveDemoLiveSessions(sessions);
    }
    return { success: true, message: "تم تحديث رابط التسجيل بنجاح" };
  }
  const response = await httpPut(`/teacher/live-sessions/${id}/recording`, { recording_url });
  return response.data;
};

export const teacherGetDownloadMaterialUrl = (id) => {
  if (isDemo()) return "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
  const token = localStorage.getItem("token") || ""; 
  return `${apiUrl}/teacher/live-sessions/${id}/download-material?token=${token}`;
};

// ============================================
// ASSISTANT LIVE SESSIONS SERVICES
// ============================================

export const assistantGetLiveSessions = async (params = {}) => {
  if (isDemo()) {
    let sessions = getDemoLiveSessions();
    if (params.status && params.status !== "all") {
      sessions = sessions.filter(s => s.status === params.status);
    }
    if (params.grade_id) {
      sessions = sessions.filter(s => String(s.grade_id) === String(params.grade_id));
    }
    if (params.search) {
      sessions = sessions.filter(s => s.title.includes(params.search));
    }
    return {
      data: sessions,
      sessions: sessions,
      pagination: { totalItems: sessions.length, totalPages: 1 }
    };
  }
  const query = new URLSearchParams();
  if (params.page) query.append("page", params.page);
  if (params.limit) query.append("limit", params.limit);
  if (params.status) query.append("status", params.status);
  if (params.grade_id) query.append("grade_id", params.grade_id);
  if (params.group_id) query.append("group_id", params.group_id);
  if (params.target_type) query.append("target_type", params.target_type);
  if (params.search) query.append("search", params.search);
  const response = await httpGet(`/assistant/live-sessions?${query.toString()}`);
  return response.data;
};

export const assistantGetLiveSessionById = async (id) => {
  if (isDemo()) {
    const sessions = getDemoLiveSessions();
    const s = sessions.find(item => String(item.id) === String(id)) || sessions[0];
    return { data: s, ...s };
  }
  const response = await httpGet(`/assistant/live-sessions/${id}`);
  return response.data;
};

export const assistantCreateLiveSession = async (formData) => {
  if (isDemo()) {
    const sessions = getDemoLiveSessions();
    const title = formData instanceof FormData ? formData.get("title") : formData?.title;
    const description = formData instanceof FormData ? formData.get("description") : formData?.description;
    const start_time = formData instanceof FormData ? formData.get("start_time") : formData?.start_time;
    const duration_minutes = formData instanceof FormData ? formData.get("duration_minutes") : formData?.duration_minutes;
    const target_type = formData instanceof FormData ? formData.get("target_type") : formData?.target_type;
    const grade_id = formData instanceof FormData ? formData.get("grade_id") : formData?.grade_id;
    const group_id = formData instanceof FormData ? formData.get("group_id") : formData?.group_id;

    const newSession = {
      id: Date.now(),
      title: title || "حصة بث مباشر تفاعلية",
      description: description || "",
      start_time: start_time || new Date().toISOString(),
      end_time: new Date(Date.now() + 3600000).toISOString(),
      duration_minutes: Number(duration_minutes) || 60,
      status: "scheduled",
      target_type: target_type || "grade",
      grade_id: grade_id ? Number(grade_id) : 3,
      group_id: group_id ? Number(group_id) : null,
      meet_link: "https://meet.google.com/aqx-mmwy-zhv",
      material_name: "ملزمة_المراجعة.pdf",
    };
    sessions.unshift(newSession);
    saveDemoLiveSessions(sessions);
    return { success: true, message: "تم إنشاء الحصة بنجاح", data: newSession };
  }
  const response = await httpPostFormData("/assistant/live-sessions", formData);
  return response.data;
};

export const assistantUpdateLiveSession = async (id, formData) => {
  if (isDemo()) {
    const sessions = getDemoLiveSessions();
    const idx = sessions.findIndex(s => String(s.id) === String(id));
    if (idx !== -1) {
      const title = formData instanceof FormData ? formData.get("title") : formData?.title;
      const description = formData instanceof FormData ? formData.get("description") : formData?.description;
      const start_time = formData instanceof FormData ? formData.get("start_time") : formData?.start_time;
      const duration_minutes = formData instanceof FormData ? formData.get("duration_minutes") : formData?.duration_minutes;
      const status = formData instanceof FormData ? formData.get("status") : formData?.status;
      const recording_url = formData instanceof FormData ? formData.get("recording_url") : formData?.recording_url;

      if (title) sessions[idx].title = title;
      if (description !== undefined) sessions[idx].description = description;
      if (start_time) sessions[idx].start_time = start_time;
      if (duration_minutes) sessions[idx].duration_minutes = Number(duration_minutes);
      if (status) sessions[idx].status = status;
      if (recording_url) sessions[idx].recording_url = recording_url;

      saveDemoLiveSessions(sessions);
      return { success: true, message: "تم تحديث الحصة بنجاح", data: sessions[idx] };
    }
    return { success: true, message: "تم تحديث الحصة بنجاح" };
  }
  const response = await httpPutFormData(`/assistant/live-sessions/${id}`, formData);
  return response.data;
};

export const assistantDeleteLiveSession = async (id) => {
  if (isDemo()) {
    let sessions = getDemoLiveSessions();
    sessions = sessions.filter(s => String(s.id) !== String(id));
    saveDemoLiveSessions(sessions);
    return { success: true, message: "تم حذف الحصة بنجاح" };
  }
  const response = await httpDelete(`/assistant/live-sessions/${id}`);
  return response;
};

export const assistantSyncRecording = async (id) => {
  if (isDemo()) {
    const sessions = getDemoLiveSessions();
    const s = sessions.find(item => String(item.id) === String(id));
    if (s) {
      s.recording_url = "https://www.youtube.com/watch?v=03hsHuIXLQE";
      saveDemoLiveSessions(sessions);
    }
    return { success: true, message: "تمت مزامنة التسجيل بنجاح" };
  }
  const response = await httpPost(`/assistant/live-sessions/${id}/sync-recording`, {});
  return response;
};

export const assistantUpdateRecordingUrl = async (id, recording_url) => {
  if (isDemo()) {
    const sessions = getDemoLiveSessions();
    const s = sessions.find(item => String(item.id) === String(id));
    if (s) {
      s.recording_url = recording_url;
      saveDemoLiveSessions(sessions);
    }
    return { success: true, message: "تم تحديث رابط التسجيل بنجاح" };
  }
  const response = await httpPut(`/assistant/live-sessions/${id}/recording`, { recording_url });
  return response.data;
};

export const assistantGetDownloadMaterialUrl = (id) => {
  if (isDemo()) return "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
  const token = localStorage.getItem("token") || ""; 
  return `${apiUrl}/assistant/live-sessions/${id}/download-material?token=${token}`;
};

// ============================================
// STUDENT LIVE SESSIONS SERVICES
// ============================================

export const studentGetLiveSessions = async (params = {}) => {
  if (isDemo()) {
    let sessions = getDemoLiveSessions();
    if (params.status && params.status !== "all") {
      sessions = sessions.filter(s => s.status === params.status);
    }
    return {
      data: sessions,
      sessions: sessions,
      pagination: { totalItems: sessions.length, totalPages: 1 }
    };
  }
  const query = new URLSearchParams();
  if (params.page) query.append("page", params.page);
  if (params.limit) query.append("limit", params.limit);
  if (params.status) query.append("status", params.status);
  const response = await httpGet(`/student/live-sessions?${query.toString()}`);
  return response.data;
};

export const studentGetLiveSessionById = async (id) => {
  if (isDemo()) {
    const sessions = getDemoLiveSessions();
    const s = sessions.find(item => String(item.id) === String(id)) || sessions[0];
    return { data: s, ...s };
  }
  const response = await httpGet(`/student/live-sessions/${id}`);
  return response.data;
};

export const studentJoinSession = async (id) => {
  if (isDemo()) return { meet_link: "https://meet.google.com/aqx-mmwy-zhv" };
  const response = await httpGet(`/student/live-sessions/${id}/join`);
  return response.data;
};

export const studentGetDownloadMaterialUrl = (id) => {
  if (isDemo()) return "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
  const token = localStorage.getItem("token") || ""; 
  return `${apiUrl}/student/live-sessions/${id}/download-material?token=${token}`;
};
