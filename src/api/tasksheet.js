import { axiosInstance } from "@/boot/axios";

const baseurl = `${import.meta.env.root.BASE_URL}/tasksheet-correction`;

async function getEmployeeTasksheets(payload) {
  const endpoint = `${baseurl}/employees/tasksheets`;

  const response = await axiosInstance.post(endpoint, payload);
  const { data } = response;

  return data || [];
}

async function getEmployees(payPeriod) {
  const endpoint = `${baseurl}/employees/list-by-pay-period`;
  const response = await axiosInstance.post(endpoint, { payPeriod });
  const { data } = response;

  return data || [];
}

async function getJobs() {
  const endpoint = `${baseurl}/jobs`;

  const response = await axiosInstance.get(endpoint);
  const { data } = response;

  return data || [];
}

async function getTasks() {
  const endpoint = `${baseurl}/tasks`;

  const response = await axiosInstance.get(endpoint);
  const { data } = response;

  return data || [];
}

async function getPageData(surveyId) {
  const endpoint = `${baseurl}/page-data/${surveyId}`;
  const response = await axiosInstance.get(endpoint);
  const { data } = response;

  return data || {};
}

async function getTasksheets(payload) {
  const endpoint = `${baseurl}/uncorrected`;
  const response = await axiosInstance.post(endpoint, payload);
  const { data } = response;

  return data || {};
}

async function getTimecardStatuses() {
  const endpoint = `${baseurl}/statuses`;

  const response = await axiosInstance.get(endpoint);
  const { data } = response;

  return data || {};
}

async function saveTimecardEntries(payload) {
  const endpoint = `${baseurl}/entries`;

  const response = await axiosInstance.put(endpoint, payload);
  const { data } = response;

  return data || {};
}

async function saveTimecard(payload) {
  const endpoint = `${baseurl}`;

  const response = await axiosInstance.put(endpoint, payload);
  const { data } = response;

  return data || {};
}

async function submitTimecard(payload) {
  const endpoint = `${baseurl}/submit-timecard`;

  const response = await axiosInstance.post(endpoint, payload);
  const { data } = response;

  return data || {};
}

async function sendRejectFeedback(payload) {
  const endpoint = `${baseurl}/rejected-feedback`;

  const response = await axiosInstance.post(endpoint, payload);
  const { data } = response;

  return data || {};
}

async function sendAcceptedFeedback(payload) {
  const endpoint = `${baseurl}/accepted-feedback`;

  const response = await axiosInstance.post(endpoint, payload);
  const { data } = response;

  return data || {};
}

async function deleteTasksheetEntries(payload) {
  const endpoint = `${baseurl}/delete-entries`;

  const response = await axiosInstance.post(endpoint, payload);
  const { data } = response;

  return data || {}
}

export default {
  getEmployeeTasksheets,
  getEmployees,
  getJobs,
  getTasks,
  getPageData,
  getTasksheets,
  getTimecardStatuses,
  submitTimecard,
  saveTimecard,
  saveTimecardEntries,
  sendRejectFeedback,
  sendAcceptedFeedback,
  deleteTasksheetEntries,
}
