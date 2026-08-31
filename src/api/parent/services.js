import { httpGet } from "../http";

export const getParentData = async (token) => {
  const response = await httpGet(`/parent/${token}`);
  return response.data;
};
