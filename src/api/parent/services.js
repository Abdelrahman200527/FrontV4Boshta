import { httpGet, httpPost } from "../http";

export const getParentData = async (parent_phone) => {
  const response = await httpPost("/parent", { parent_phone });
  return response.data;
};

export const getParentDataByToken = async (token) => {
  const response = await httpGet(`/parent/${token}`);
  return response.data;
};
