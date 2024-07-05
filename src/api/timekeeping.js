import { axiosInstance } from "@/boot/axios";

const baseurl = `${import.meta.env.root.BASE_URL}/timekeeping`;

async function getTimecard(id) {
  const endpoint = `${baseurl}/${id}`;

  const response = await axiosInstance.get(endpoint);
  const { data } = response;

  return data || [];
}

async function getTimecardsById(id) {
  const endpoint = `${baseurl}/timecards-by-id/${id}`;

  const response = await axiosInstance.get(endpoint);
  const { data } = response;

  return data || [];
}

async function getTimecards(payPeriod) {
  const endpoint = `${baseurl}/list-by-pay-period`;
  const response = await axiosInstance.post(endpoint, { payPeriod });
  const { data } = response;

  return data || [];
}

async function getCurrentEmployee() {
  const endpoint = `${baseurl}/employee`;

  const response = await axiosInstance.get(endpoint);
  const { data } = response;

  return data || {};
}

async function getAllEmployees() {
  const endpoint = `${baseurl}/employees`;

  const response = await axiosInstance.get(endpoint);
  const { data } = response;

  return data || [];
}

async function addTimecard(payload) {
  const endpoint = `${baseurl}`;

  const response = await axiosInstance.post(endpoint, payload);
  const { data } = response;

  return data || {};
}

async function addEntryLine(payload) {
  const endpoint = `${baseurl}/entries`;

  const response = await axiosInstance.post(endpoint, payload);
  const { data } = response;

  return data || {};
}

async function getTimecardPayTypes() {
  const endpoint = `${baseurl}/pay-types`;

  const response = await axiosInstance.get(endpoint);
  const { data } = response;

  return data || {};
}

async function getTimecardStatuses() {
  const endpoint = `${baseurl}/statuses`;

  const response = await axiosInstance.get(endpoint);
  const { data } = response;

  return data || {};
}

async function saveTimecard(payload) {
  const endpoint = `${baseurl}`;

  const response = await axiosInstance.put(endpoint, payload);
  const { data } = response;

  return data || {};
}

async function saveTimecardEntries(payload) {
  const endpoint = `${baseurl}/entries`;

  const response = await axiosInstance.put(endpoint, payload);
  const { data } = response;

  return data || {};
}

async function deleteTimecardEntries(payload) {
  const endpoint = `${baseurl}/delete-entries`;

  const response = await axiosInstance.post(endpoint, payload);
  const { data } = response;

  return data || {};
}

async function printTimecard(id) {
  const endpoint = `${baseurl}/print/${id}`;

  const headers = { responseType: "blob" };
  const response = await axiosInstance.get(endpoint, headers);
  const { data: file, headers: responseHeaders } = response;
  const contentDisposition = responseHeaders["content-disposition"];
  const fileName = contentDisposition.split(';')[1].split('=')[1].replace(/['"]+/g, '');

  return { fileName, file } || {};
}

async function getSettings(tenantId = null) {
  const endpoint = `${baseurl}/settings` + (tenantId ? `/${tenantId}` : "");

  const response = await axiosInstance.get(endpoint);
  const { data } = response;
  return data;
}

async function sendRejectedNotification(payload) {
  const endpoint = `${baseurl}/reject`;

  const response = await axiosInstance.post(endpoint, payload);
  const { data } = response;
  return data;
}

export default {
  getTimecard,
  saveTimecard,
  addTimecard,
  addEntryLine,
  getCurrentEmployee,
  getTimecards,
  getTimecardsById,
  getSettings,
  getTimecardPayTypes,
  getTimecardStatuses,
  saveTimecardEntries,
  deleteTimecardEntries,
  printTimecard,
  getAllEmployees,
  sendRejectedNotification
}
