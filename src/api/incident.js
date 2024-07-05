import { axiosInstance } from "@/boot/axios";

const baseurl = `${import.meta.env.root.BASE_URL}/incident`;

function getBaseConfig() {
  return {
    headers: {
      Authorization: "Bearer " + localStorage.getItem("incident_jwt")
    }
  };
}

export async function getIncidents(payload) {
  const endpoint = `${baseurl}/search`;
  const response = await axiosInstance.post(endpoint, payload);
  const { data } = response;

  return data || {};
}

export async function getIncident(id) {
  const endpoint = `${baseurl}/${id}`;
  const response = await axiosInstance.get(endpoint);
  const { data } = response;

  return data || {};
}

export async function createIncident(payload) {
  const response = await axiosInstance.post(baseurl, payload);
  const { data } = response;

  return data || {};
}

export async function updateIncident(payload) {
  const response = await axiosInstance.put(baseurl, payload);
  const { data } = response;

  return data || {};
}

export async function employeeSearch(search) {
  const endpoint = `${baseurl}/employees/search/${search}`;
  const response = await axiosInstance.get(endpoint);
  const { data } = response;

  return data;
}

export async function clientSearch(search) {
  const endpoint = `${baseurl}/clients/search/${search}`;
  const response = await axiosInstance.get(endpoint);
  const { data } = response;

  return data;
}

export async function sendWorkerCompForm(id) {
  const endpoint = `${baseurl}/send-worker-comp-form/${id}`;
  const response = await axiosInstance.post(endpoint);
  const { data } = response;

  return data;
}

export async function pageData(surveyId) {
  const endpoint = `${baseurl}/page-data/${surveyId}`;
  const response = await axiosInstance.get(endpoint);
  const { data } = response;

  return data;
}

export async function getWorkerCompData(payload) {
  const endpoint = `${baseurl}/worker-comp-data`;
  const response = await axiosInstance.post(endpoint, payload);
  const { data } = response;

  return data;
}

export async function saveEmployeeSignature(payload) {
  const config = getBaseConfig();
  const endpoint = `${baseurl}/employee-signature`;
  const response = await axiosInstance.put(endpoint, payload, config);
  const { data } = response;

  return data;
}

export async function getSettings() {
  const endpoint = `${baseurl}/settings`;
  const response = await axiosInstance.get(endpoint);
  const { data } = response;

  return data;
}

export default {
  getIncidents,
  getIncident,
  createIncident,
  updateIncident,
  getSettings,
  employeeSearch,
  clientSearch,
  sendWorkerCompForm,
  pageData,
  getWorkerCompData,
  saveEmployeeSignature,
}
