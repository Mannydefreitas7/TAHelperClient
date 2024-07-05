import { axiosInstance } from "@/boot/axios";

async function findCampaignIntegrations() {
  const endpoint = `${import.meta.env.root.BASE_URL}/integration/campaign-integrations`;

  const response = await axiosInstance.get(endpoint);
  const { data } = response;
  return data;
}

async function findIntegrations(payload) {
  let endpoint = `${import.meta.env.root.BASE_URL}/integration/integrations`;

  if (payload) {
    endpoint += `?tenantId=${payload}`;
  }

  const response = await axiosInstance.get(endpoint);
  const { data } = response;
  return data;
};

async function saveIntegration(payload) {
  const endpoint = `${import.meta.env.root.BASE_URL}/integration/save-integration`;

  const response = await axiosInstance.post(endpoint, payload);
  const { data } = response;
  return data;
}

async function deleteIntegration(payload) {
  const endpoint = `${import.meta.env.root.BASE_URL}/integration/delete-integration`;

  const response = await axiosInstance.post(`${endpoint}/${payload}`);
  const { data } = response;
  return data;
}

async function testSqlQuery(payload) {
  const endpoint = `${import.meta.env.root.BASE_URL}/integration/test-sql`;

  const response = await axiosInstance.post(endpoint, payload);
  const { data } = response;
  return data;
}

async function testSqlAction(payload) {
  const endpoint = `${import.meta.env.root.BASE_URL}/integration/test-sql-action`;

  const response = await axiosInstance.post(endpoint, payload);
  const { data } = response;
  return data;
}

async function exportSqlData(payload) {
  const endpoint = `${import.meta.env.root.BASE_URL}/integration/export`;
  const headers = { responseType: "blob" };
  const response = await axiosInstance.post(endpoint, payload, headers);
  const { data, headers: responseHeaders } = response;
  const contentDisposition = responseHeaders["content-disposition"];
  const fileName = contentDisposition.split(';')[1].split('=')[1].replace(/['"]+/g, '');

  return { fileName: fileName, file: data } || null;
}

export async function getSettings() {
  const endpoint = `${import.meta.env.root.BASE_URL}/integration/settings`;
  const response = await axiosInstance.get(endpoint);
  const { data } = response;

  return data;
}

export async function getAuthUrl(payload) {
  const endpoint = `${import.meta.env.root.BASE_URL}/integration/get-auth-url/${payload.inUsername}/${payload.inLocation}`;
  const response = await axiosInstance.get(endpoint);
  const { data } = response;

  return data;
}

export async function testSftp(payload) {
  const encodedPwd = encodeURIComponent(payload.outPassword);
  const endpoint = `${import.meta.env.root.BASE_URL}/integration/test-sftp/${payload.outServerAddress}/${payload.outUsername}/${encodedPwd}`;
  const response = await axiosInstance.post(endpoint);
  const { data } = response;

  return data;
}

export default {
  findCampaignIntegrations,
  findIntegrations,
  saveIntegration,
  deleteIntegration,
  testSqlQuery,
  testSqlAction,
  exportSqlData,
  getSettings,
  getAuthUrl,
  testSftp,
};