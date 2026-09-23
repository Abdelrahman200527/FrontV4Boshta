import { httpPost } from "../http";

export const getParentData = async (parent_phone) => {
  const response = await httpPost("/parent", {parent_phone});
  return response.data;
};
