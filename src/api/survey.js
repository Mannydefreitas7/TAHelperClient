import { axiosInstance } from "@/boot/axios";

export const BASE_URL = `${import.meta.env.root.BASE_URL}/survey`;

export async function findResponses(payload) {
  const endpoint = `${BASE_URL}/surveys`;

  const response = await axiosInstance.post(endpoint, payload);
  const { data } = response;
  return data;
};

export async function sendFeedback(payload) {
  const endpoint = `${BASE_URL}/send-feedback`;

  const response = await axiosInstance.post(endpoint, payload);
  const { data } = response;
  return data;
}

export async function markFeedback(id, status) {
  const endpoint = `${BASE_URL}/mark-feedback/${id}/${status}`;

  const response = await axiosInstance.put(endpoint);
  const { data } = response;
  return data;
}

export async function markSeen(id) {
  const endpoint = `${BASE_URL}/mark-seen/${id}`;

  const response = await axiosInstance.put(endpoint);
  const { data } = response;
  return data;
}

export async function downloadSurveys(startDate, endDate) {
  const endpoint = `${BASE_URL}/download`;
  const headers = { responseType: "blob" };
  const response = await axiosInstance.post(endpoint, { startDate, endDate }, headers);
  const { data, headers: responseHeaders } = response;
  const contentDisposition = responseHeaders["content-disposition"];
  const fileName = contentDisposition.split(';')[1].split('=')[1].replace(/['"]+/g, '');

  return { fileName: fileName, file: data } || null;
}

export async function getSettings(tenantId = null) {
  const endpoint = `${BASE_URL}/settings` + (tenantId ? `/${tenantId}` : "");

  const response = await axiosInstance.get(endpoint);
  const { data } = response;
  return data;
}

export default {
  BASE_URL,
  findResponses,
  sendFeedback,
  markFeedback,
  markSeen,
  downloadSurveys,
  getSettings
}
