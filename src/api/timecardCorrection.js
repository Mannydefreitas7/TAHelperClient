import { axiosInstance } from "@/boot/axios";

const baseurl = `${import.meta.env.root.BASE_URL}/timecard-correction`;

async function getPageData(surveyId) {
  const endpoint = `${baseurl}/page-data/${surveyId}`;
  const response = await axiosInstance.get(endpoint);
  const { data } = response;

  return data || {};
}

async function getUncorrectedTimecards(payload) {
  const endpoint = `${baseurl}/uncorrected`;
  const response = await axiosInstance.post(endpoint, payload);
  const { data } = response;

  return data || {};
}

async function saveTimecard(payload) {
  const endpoint = `${baseurl}/save-timecard`;
  const response = await axiosInstance.post(endpoint, payload);
  const { data } = response;

  return data || {};
}

async function findCorrectedTimecards(payload) {
  const endpoint = `${baseurl}/corrected`;
  const response = await axiosInstance.post(endpoint, payload);
  const { data } = response;

  return data || {};
}

async function downloadMergedDocument(messageId) {
  const endpoint = `${baseurl}/download/${messageId}`;
  const headers = { responseType: "blob" };
  const response = await axiosInstance.get(endpoint, headers);
  const { data, headers: responseHeaders } = response;
  const contentDisposition = responseHeaders["content-disposition"];
  const fileName = contentDisposition.split(';')[1].split('=')[1].replace(/['"]+/g, '');

  return { fileName: fileName, pdf: data } || null;
}

async function sendFeedback(payload) {
  const endpoint = `${baseurl}/send-feedback`;

  const response = await axiosInstance.post(endpoint, payload);
  const { data } = response;
  return data;
}

async function markFeedback(id, status) {
  const endpoint = `${baseurl}/mark-feedback/${id}/${status}`;

  const response = await axiosInstance.put(endpoint);
  const { data } = response;
  return data;
}

async function markSeen(id) {
  const endpoint = `${baseurl}/mark-seen/${id}`;

  const response = await axiosInstance.put(endpoint);
  const { data } = response;
  return data;
}

async function getSettings(tenantId = null) {
  const endpoint = `${baseurl}/settings` + (tenantId ? `/${tenantId}` : "");

  const response = await axiosInstance.get(endpoint);
  const { data } = response;
  return data;
}

export async function getMarkAcceptedData(id) {
  const endpoint = `${baseurl}/mark-accepted-data/${id}`;

  const response = await axiosInstance.get(endpoint);
  const { data } = response;
  return data;
}

export async function getTimecardCorrection(id) {
  const endpoint = `${baseurl}/${id}`;

  const response = await axiosInstance.get(endpoint);
  const { data } = response;
  return data;
}

export async function updateTimecardCorrection(payload) {
  const endpoint = `${baseurl}`;

  const response = await axiosInstance.put(endpoint, payload);
  const { data } = response;
  return data;
}

export default {
  getPageData,
  saveTimecard,
  getUncorrectedTimecards,
  findCorrectedTimecards,
  downloadMergedDocument,
  sendFeedback,
  markFeedback,
  markSeen,
  getSettings,
  getMarkAcceptedData,
  getTimecardCorrection,
  updateTimecardCorrection,
}
