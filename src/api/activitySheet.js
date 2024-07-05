import { axiosInstance } from "../../../TAHelper/TAHelperClient/src/boot/axios"; // For admins

const baseurl = `${import.meta.env.root.BASE_URL}/activity-sheet`;

function getBaseConfig() {
  return {
    headers: {
      Authorization: "Bearer " + localStorage.getItem("caregiver_jwt")
    }
  };
}

export async function login(payload) {
  const endpoint = `${baseurl}/login`;
  const response = await axiosInstance.post(endpoint, payload);
  const { data } = response;

  return data || {};
}

export async function getPageData(surveyId) {
  const endpoint = `${baseurl}/page-data/${surveyId}`;
  const response = await axiosInstance.get(endpoint);
  const { data } = response;

  return data || {};
}

export async function getSheet(sheetId) {
  const config = getBaseConfig();
  const endpoint = `${baseurl}/sheet/${sheetId}`;
  const response = await axiosInstance.get(endpoint, config);
  const { data } = response;

  return data || {};
}

export async function getSheetsByPayPeriod(payload) {
  const config = getBaseConfig();
  const endpoint = `${baseurl}/sheets-by-pay-period`;
  const response = await axiosInstance.post(endpoint, payload, config);
  const { data } = response;

  return data || {};
}

export async function searchPatients(payload) {
  const config = getBaseConfig();
  const endpoint = `${baseurl}/patients/${encodeURIComponent(payload)}`;
  const response = await axiosInstance.get(endpoint, config);
  const { data } = response;

  return data || {};
}

export async function saveSheet(payload) {
  const config = getBaseConfig();
  const endpoint = `${baseurl}`;
  const response = await axiosInstance.put(endpoint, payload, config);
  const { data } = response;

  return data || {};
}

export async function submitSheet(payload) {
  const config = getBaseConfig();
  const endpoint = `${baseurl}/submit`;
  const response = await axiosInstance.put(endpoint, payload, config);
  const { data } = response;

  return data || {};
}

export async function findActivitySheets(payload) {
  const endpoint = `${baseurl}/sheets`;
  const response = await axiosInstance.post(endpoint, payload);
  const { data } = response;

  return data || {};
}

export async function markSeen(id) {
  const endpoint = `${baseurl}/seen/${id}`;
  const response = await axiosInstance.put(endpoint);
  const { data } = response;

  return data || {};
}

export async function findRnActivitySheets(payload) {
  const config = getBaseConfig();
  const endpoint = `${baseurl}/rn/sheets`;
  const response = await axiosInstance.post(endpoint, payload, config);
  const { data } = response;

  return data || {};
}

export async function acceptRn(payload) {
  const config = getBaseConfig();
  const endpoint = `${baseurl}/rn/accept`;
  const response = await axiosInstance.put(endpoint, payload, config);
  const { data } = response;

  return data || {};
}

export async function rejectRn(payload) {
  const config = getBaseConfig();
  const endpoint = `${baseurl}/rn/reject`;
  const response = await axiosInstance.put(endpoint, payload, config);
  const { data } = response;

  return data || {};
}

export async function accept(payload) {
  const endpoint = `${baseurl}/accept`;
  const response = await axiosInstance.put(endpoint, payload);
  const { data } = response;

  return data || {};
}

export async function reject(payload) {
  const endpoint = `${baseurl}/reject`;
  const response = await axiosInstance.put(endpoint, payload);
  const { data } = response;

  return data || {};
}

export async function getSettings(tenantId = null) {
  const endpoint = `${baseurl}/settings` + (tenantId ? `/${tenantId}` : "");

  const response = await axiosInstance.get(endpoint);
  const { data } = response;
  return data;
}

export async function downloadSheet(id) {
  const endpoint = `${baseurl}/download/${id}`;
  const config = { responseType: "blob" };
  const response = await axiosInstance.get(endpoint, config);
  const { data, headers } = response;

  const contentDisposition = headers["content-disposition"];
  const fileName = contentDisposition
    .split(";")[1]
    .split("=")[1]
    .replace(/['"]+/g, "");

  return { fileName, file: data };
}

export async function downloadAllSheets(payload) {
  const endpoint = `${baseurl}/download/all`;
  const config = { responseType: "blob" };
  const response = await axiosInstance.post(endpoint, payload, config);
  const { data, headers } = response;

  const contentDisposition = headers["content-disposition"];
  const fileName = contentDisposition
    .split(";")[1]
    .split("=")[1]
    .replace(/['"]+/g, "");

  return { fileName, file: data };
}

export default {
  login,
  getPageData,
  getSheet,
  getSheetsByPayPeriod,
  searchPatients,
  findRnActivitySheets,
  findActivitySheets,
  saveSheet,
  submitSheet,
  markSeen,
  acceptRn,
  rejectRn,
  accept,
  reject,
  downloadSheet,
  downloadAllSheets,
  getSettings
};
