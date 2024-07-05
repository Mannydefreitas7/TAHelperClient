import { axiosInstance } from "@/boot/axios";

const baseurl = `${import.meta.env.root.BASE_URL}/timekeeping/employee`;

async function getPageData(surveyId) {
  const endpoint = `${baseurl}/page-data/${surveyId}`;
  const response = await axiosInstance.get(endpoint);
  const { data } = response;

  return data || {};
}

async function getTimecard(payload) {
  const endpoint = `${baseurl}`;
  const response = await axiosInstance.post(endpoint, payload);
  const { data } = response;

  return data || {};
}

async function getTimecardStatuses() {
  const endpoint = `${import.meta.env.root.BASE_URL}/timekeeping/statuses`;

  const response = await axiosInstance.get(endpoint);
  const { data } = response;

  return data || {};
}

async function addEntryLine(payload) {
  const endpoint = `${baseurl}/entries`;

  const response = await axiosInstance.post(endpoint, payload);
  const { data } = response;

  return data || {};
}

async function getTimecardPayTypes(payload) {
  const endpoint = `${baseurl}/pay-types`;

  const response = await axiosInstance.post(endpoint, payload);
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

export default {
  getPageData,
  getTimecard,
  getTimecardStatuses,
  addEntryLine,
  getTimecardPayTypes,
  saveTimecardEntries,
  deleteTimecardEntries,
  saveTimecard
}