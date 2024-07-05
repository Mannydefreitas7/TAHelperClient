import { axiosInstance } from "@/boot/axios";

const baseurl = `${import.meta.env.root.BASE_URL}/document`;

async function findMediaResponses(payload) {
  const endpoint = `${baseurl}/list`;

  const response = await axiosInstance.post(endpoint, payload);
  const { data } = response;
  return data;
};

async function getDocument(id) {
  const endpoint = `${baseurl}/${id}`;

  const response = await axiosInstance.get(endpoint);
  const { data } = response;
  return data;
};

async function downloadMergedDocument(messageId) {
  const endpoint = `${baseurl}/download/${messageId}`;
  const headers = { responseType: "blob" };
  const response = await axiosInstance.get(endpoint, headers);
  const { data, headers: responseHeaders } = response;
  const contentDisposition = responseHeaders["content-disposition"];
  const fileName = contentDisposition.split(';')[1].split('=')[1].replace(/['"]+/g, '');

  return { fileName: fileName, file: data } || null;
}

async function downloadAllMergedDocuments(payload) {
  const endpoint = `${baseurl}/download/all`;
  const headers = { responseType: "blob" };
  const response = await axiosInstance.post(endpoint, payload, headers);
  const { data, headers: responseHeaders } = response;
  const contentDisposition = responseHeaders["content-disposition"];
  const fileName = contentDisposition.split(';')[1].split('=')[1].replace(/['"]+/g, '');

  return { fileName: fileName, file: data } || null;
}

async function sendFeedback(payload) {
  const endpoint = `${import.meta.env.root.BASE_URL}/media/send-feedback`;

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

async function getMedia(onlyPublic = null) {
  const endpoint = `${baseurl}/media`;

  const response = await axiosInstance.post(endpoint, {onlyPublic});
  const { data } = response;
  return data || [];
}

async function downloadMedia(mediaId) {
  const endpoint = `${baseurl}/download-media/${mediaId}`;
  const headers = { responseType: "blob" };
  const response = await axiosInstance.get(endpoint, headers);
  const { data, headers: responseHeaders } = response;
  const contentDisposition = responseHeaders["content-disposition"];
  const fileName = contentDisposition.split(';')[1].split('=')[1].replace(/['"]+/g, '');

  return { fileName: fileName, file: data } || null;
}

async function uploadMedia(payload) {
  const endpoint = `${baseurl}/add-media`;

  const response = await axiosInstance.post(endpoint, payload);
  const { data } = response;
  return data;
}

async function updateMedia(payload) {
  const endpoint = `${baseurl}/update-media`;

  const response = await axiosInstance.put(endpoint, payload);
  const { data } = response;
  return data;
}

async function getMediaDownloadPageData(mediaId, surveyId) {
  const endpoint = `${import.meta.env.root.BASE_URL}/file/media-page-data/${mediaId}/${surveyId}`;

  const response = await axiosInstance.get(endpoint);
  const { data } = response;
  return data;
}

async function downloadMediaWithPin(mediaId, pinCode, surveyId) {
  let endpoint;

  if (surveyId) {
    endpoint = `${import.meta.env.root.BASE_URL}/file/download-media-id-pin/${mediaId}/${surveyId}/${pinCode}`;
  } else {
    endpoint = `${import.meta.env.root.BASE_URL}/file/download-media-pin/${mediaId}/${pinCode}`;
  }

  const headers = { responseType: "blob" };
  const response = await axiosInstance.get(endpoint, headers);
  const { data, headers: responseHeaders } = response;
  const contentDisposition = responseHeaders["content-disposition"];
  const fileName = contentDisposition.split(';')[1].split('=')[1].replace(/['"]+/g, '');

  return { fileName: fileName, file: data } || null;
}

async function deleteMedia(mediaId) {
  const endpoint = `${baseurl}/delete-media/${mediaId}`;

  const response = await axiosInstance.delete(endpoint);
  const { data } = response;
  return data;
}

async function deleteDocument(documentId) {
  const endpoint = `${baseurl}/${documentId}`;

  const response = await axiosInstance.delete(endpoint);
  const { data } = response;
  return data;
}

async function hasFiles(messageId) {
  const endpoint = `${baseurl}/has-files/${messageId}`;

  const response = await axiosInstance.get(endpoint);
  const { data } = response;
  return data;
}

async function markAsPrinted(messageId) {
  const endpoint = `${baseurl}/mark-printed/${messageId}`;
  const response = await axiosInstance.put(endpoint);
  const { data } = response;
  return data;
}

export default {
  findMediaResponses,
  downloadMergedDocument,
  sendFeedback,
  markFeedback,
  markSeen,
  getSettings,
  getMedia,
  downloadMedia,
  uploadMedia,
  updateMedia,
  getMediaDownloadPageData,
  downloadAllMergedDocuments,
  downloadMediaWithPin,
  deleteMedia,
  deleteDocument,
  hasFiles,
  markAsPrinted,
  getDocument,
};
