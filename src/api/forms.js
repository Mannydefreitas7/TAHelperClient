import { axiosInstance } from "@/boot/axios";

const baseurl = `${import.meta.env.root.BASE_URL}/forms`;

function getBaseConfig() {
  return {
    headers: {
      Authorization: "Bearer " + localStorage.getItem("form_jwt")
    }
  };
}

async function getPageData(surveyId) {
  const endpoint = `${baseurl}/page-data/${surveyId}`;
  const response = await axiosInstance.get(endpoint);
  const { data } = response;

  return data || {};
}

async function getPageDataByCampaignId(campaignId) {
  const endpoint = `${baseurl}/page-data-campaign/${campaignId}`;
  const response = await axiosInstance.get(endpoint);
  const { data } = response;

  return data || {};
}

async function getForm(payload) {
  const endpoint = `${baseurl}/get`;
  const response = await axiosInstance.post(endpoint, payload);
  const { data } = response;

  return data || {};
}

async function saveForm(payload) {
  const config = getBaseConfig();
  const endpoint = `${baseurl}/save-form`;
  const response = await axiosInstance.post(endpoint, payload, config);
  const { data } = response;

  return data || {};
}

async function saveFormByCampaignId(payload) {
  const config = getBaseConfig();
  const endpoint = `${baseurl}/save-form-campaign`;
  const response = await axiosInstance.post(endpoint, payload, config);
  const { data } = response;

  return data || {};
}

async function listForms(payload) {
  const endpoint = `${baseurl}/list`;
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

async function downloadSubmitted() {
  const config = getBaseConfig();
  config.responseType = 'blob';
  const endpoint = `${baseurl}/downloadSubmitted`;
  const response = await axiosInstance.post(endpoint, {}, config);
  const { data, headers } = response;

  const contentDisposition = headers["content-disposition"];
  const fileName = contentDisposition
    .split(";")[1]
    .split("=")[1]
    .replace(/['"]+/g, "");

  return { fileName, file: data };
}

export async function searchPatients(payload) {
  const config = getBaseConfig();
  const endpoint = `${baseurl}/patients/${encodeURIComponent(payload)}`;
  const response = await axiosInstance.get(endpoint, config);
  const { data } = response;

  return data || {};
}

export default {
  getPageData,
  getPageDataByCampaignId,
  getForm,
  saveForm,
  saveFormByCampaignId,
  listForms,
  downloadMergedDocument,
  sendFeedback,
  markFeedback,
  markSeen,
  getSettings,
  searchPatients,
  downloadSubmitted,
}

