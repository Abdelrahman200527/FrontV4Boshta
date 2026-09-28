import { httpGet, httpPost } from "../http";

export const getParentData = async (parent_phone, student_id = null) => {
  const payload = { parent_phone };
  if (student_id) {
    payload.student_id = student_id;
  }
  const response = await httpPost("/parent", payload);
  return response.data;
};

export const getParentDataByToken = async (token) => {
  const response = await httpGet(`/parent/${encodeURIComponent(token || "")}`);
  return response.data;
};

