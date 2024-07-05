import axiosInstance from "axios";

const baseurl = `${import.meta.env.VITE_BASE_URL}/campaign`;

export async function getCampaigns(showAll) {
  const endpoint = `${baseurl}/campaigns`;
  const response = await axiosInstance.post(endpoint, { showAll: showAll });
  const { data } = response;
  return data;
}

export async function updateCampaign(payload) {
  const endpoint = `${baseurl}/add-campaign`;
  try {
    const response = await axiosInstance.post(endpoint, payload);
    const { data } = response;
    return data;
  } catch (e) {
    return {
      errorCode: e.response.status,
      errorText: e.response.data
    }
  }
}

export async function acknowledgeCampaignMessage(payload) {
  const endpoint = `${baseurl}/acknowledge-message/${payload.campaignId}/${payload.name}/${payload.visitTime}`;
  const response = await axiosInstance.post(endpoint, payload);
  const { data } = response;
  return data;
}

export async function acknowledgeCampaignResponse(payload) {
  const endpoint = `${baseurl}/acknowledge-response`;
  const response = await axiosInstance.post(endpoint, payload);
  const { data } = response;
  return data;
}

export async function acknowledgeCampaignResponseNote(payload) {
  const endpoint = `${baseurl}/acknowledge-response-note`;
  const response = await axiosInstance.post(endpoint, payload);
  const { data } = response;
  return data;
}

export async function loadCampaignImmediateAttentionResponses(payload) {
  const endpoint = `${baseurl}/attention-word-replies/${payload.campaignId}/${payload.amountOfDays}`;
  const response = await axiosInstance.get(endpoint);
  const { data } = response;
  return data;
}

export async function loadCampaignResponseRate(payload) {
  const endpoint = `${baseurl}/replies/${payload.campaignId}/${payload.amountOfDays}`;
  const response = await axiosInstance.get(endpoint);
  const { data } = response;
  return data;
}

export async function loadCampaignRequests(payload) {
  const endpoint = `${baseurl}/requests/${payload.campaignId}/${payload.amountOfDays}/${payload.showAll}`;
  const response = await axiosInstance.get(endpoint);
  const { data } = response;
  return data;
}

async function attachFile(payload) {
  const endpoint = `${import.meta.env.root.BASE_URL}/campaign/attach-file/${payload.campaignId}`;
  const options = { headers: {"Content-Type": "multipart/form-data"} };

  const response = await axiosInstance.post(endpoint, payload.data, options);
  const { data } = response;
  return data;
};

async function removeFile(payload) {
  const endpoint = `${import.meta.env.root.BASE_URL}/campaign/remove-file/${payload.campaignId}/${payload.fileName}`;
  const response = await axiosInstance.post(endpoint, payload);
  const { data } = response;
  return data;
};

async function downloadFile(payload) {
  const endpoint = `${import.meta.env.root.BASE_URL}/campaign/download-file/${payload.campaignId}/${payload.fileName}`;
  const headers = { responseType: "blob" };
  const response = await axiosInstance.get(endpoint, headers);
  const { data, headers: responseHeaders } = response;
  const contentDisposition = responseHeaders["content-disposition"];
  const fileName = contentDisposition.split(';')[1].split('=')[1].replace(/['"]+/g, '');

  return { fileName: fileName, file: data } || null;
}

async function pdfToHtml(payload) {
  const endpoint = `${import.meta.env.root.BASE_URL}/campaign/pdfToHtml`;
  const options = { headers: {"Content-Type": "multipart/form-data"} };

  const response = await axiosInstance.post(endpoint, payload, options);
  const { data } = response;
  return data;
};

async function moveToTenant(payload) {
  const endpoint = `${import.meta.env.root.BASE_URL}/campaign/move-to-tenant`;
  const response = await axiosInstance.post(endpoint, payload);
  const { data } = response;
  return data;
};

async function copyToTenant(payload) {
  const endpoint = `${import.meta.env.root.BASE_URL}/campaign/copy-to-tenant`;
  const response = await axiosInstance.post(endpoint, payload);
  const { data } = response;
  return data;
}

async function getFromEmails(payload) {
  const endpoint = `${import.meta.env.root.BASE_URL}/user/from-emails`;
  const response = await axiosInstance.get(endpoint);
  const { data } = response;
  return data;
}

export default {
  getCampaigns,
  getFromEmails,
  updateCampaign,
  acknowledgeCampaignMessage,
  acknowledgeCampaignResponse,
  acknowledgeCampaignResponseNote,
  loadCampaignImmediateAttentionResponses,
  loadCampaignResponseRate,
  loadCampaignRequests,
  attachFile,
  removeFile,
  downloadFile,
  pdfToHtml,
  moveToTenant,
  copyToTenant,
};
