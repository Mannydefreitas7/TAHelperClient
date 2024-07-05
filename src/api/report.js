import { axiosInstance } from "@/boot/axios";

const baseurl = `${import.meta.env.root.BASE_URL}/report`;

async function invalidNumberReport() {
  const endpoint = `${baseurl}/invalid-numbers`;
  const headers = { responseType: "blob" };
  const response = await axiosInstance.get(endpoint, headers);
  const { data, headers: responseHeaders } = response;

  return { fileName: getFileName(responseHeaders), file: data } || null;
}

async function sentWithRepliesReport(payload) {
  const endpoint = `${baseurl}/sent-with-replies`;
  const headers = { responseType: "blob" };
  const response = await axiosInstance.post(endpoint, payload, headers);
  const { data, headers: responseHeaders } = response;

  return { fileName: getFileName(responseHeaders), file: data } || null;
}

async function additionalShiftsRequestedReport(payload) {
  const endpoint = `${baseurl}/additional-shifts-requested`;
  const headers = { responseType: "blob" };
  const response = await axiosInstance.post(endpoint, payload, headers);
  const { data, headers: responseHeaders } = response;

  return { fileName: getFileName(responseHeaders), file: data } || null;
}

async function responseAlertAcknowledgementsReport(payload) {
  const endpoint = `${baseurl}/response-alert-acknowledgements`;
  const headers = { responseType: "blob" };
  const response = await axiosInstance.post(endpoint, payload, headers);
  const { data, headers: responseHeaders } = response;

  return { fileName: getFileName(responseHeaders), file: data } || null;
}

async function tasksheetReport(payload, exportOneFile = false) {
  const endpoint = `${baseurl}/tasksheets`;
  const body = { ...payload, exportOneFile: exportOneFile };
  const headers = { 'Content-Type': 'application/json', responseType: "blob" };
  const response = await axiosInstance.post(endpoint, body, headers);
  const { data, headers: responseHeaders } = response;

  return { fileName: getFileName(responseHeaders), file: data } || null;
}

async function timecardReport(payload) {
  const endpoint = `${baseurl}/timecards`;
  const headers = { responseType: "blob" };
  const response = await axiosInstance.post(endpoint, payload, headers);
  const { data, headers: responseHeaders } = response;

  return { fileName: getFileName(responseHeaders), file: data } || null;
}

async function campaignsAndChatsReport(payload) {
  const endpoint = `${baseurl}/campaigns-and-chats`;
  const headers = { responseType: "blob" };
  const response = await axiosInstance.post(endpoint, payload, headers);
  const { data, headers: responseHeaders } = response;

  return { fileName: getFileName(responseHeaders), file: data } || null;
}

async function incompleteServiceRequirementsReport(payload) {
  const endpoint = `${baseurl}/service-requirements`;
  const headers = { responseType: "blob" };
  const response = await axiosInstance.post(endpoint, payload, headers);
  const { data, headers: responseHeaders } = response;

  return { fileName: getFileName(responseHeaders), file: data } || null;
}

async function activitySheetsReport(payload) {
  const endpoint = `${baseurl}/activity-sheets`;
  const headers = { responseType: "blob" };
  const response = await axiosInstance.post(endpoint, payload, headers);
  const { data, headers: responseHeaders } = response;

  return { fileName: getFileName(responseHeaders), file: data } || null;
}

async function chatsReport(payload) {
  const endpoint = `${baseurl}/chats`;
  const headers = { responseType: "blob" };
  const response = await axiosInstance.post(endpoint, payload, headers);
  const { data, headers: responseHeaders } = response;

  return { fileName: getFileName(responseHeaders), file: data } || null;
}

function getFileName(headers) {
  const contentDisposition = headers["content-disposition"];
  return contentDisposition.split(';')[1].split('=')[1].replace(/['"]+/g, '');
}

export default {
  invalidNumberReport,
  sentWithRepliesReport,
  additionalShiftsRequestedReport,
  responseAlertAcknowledgementsReport,
  tasksheetReport,
  timecardReport,
  campaignsAndChatsReport,
  incompleteServiceRequirementsReport,
  activitySheetsReport,
  chatsReport,
}
