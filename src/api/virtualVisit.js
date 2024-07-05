import { axiosInstance } from "@/boot/axios";

const baseurl = `${import.meta.env.root.BASE_URL}/virtual-visit`;

async function getAdminToken(surveyId) {
  const endpoint = `${baseurl}/admin-token/${surveyId}`;

  const response = await axiosInstance.post(endpoint);
  const { data } = response;
  return data;
};

async function getClientData(surveyId) {
  const endpoint = `${baseurl}/client-data/${surveyId}`;

  const response = await axiosInstance.get(endpoint);
  const { data } = response;
  return data;
};

async function searchVisits(payload) {
  const endpoint = `${baseurl}/search`;

  const response = await axiosInstance.post(endpoint, payload);
  const { data } = response;
  return data;
};

async function updateVisit(payload) {
  const endpoint = baseurl;
  const response = await axiosInstance.put(endpoint, payload);
  const { data } = response;
  return data;
};

async function updateVisitNote(id, payload) {
  const endpoint = `${baseurl}/note/${id}`;
  const response = await axiosInstance.put(endpoint, payload);
  const { data } = response;
  return data;
};

async function deleteVisitNote(id, noteId) {
  const endpoint = `${baseurl}/note/${id}/${noteId}`;
  const response = await axiosInstance.delete(endpoint);
  const { data } = response;
  return data;
};

async function getVisit(id) {
  const endpoint = `${baseurl}/${id}`;

  const response = await axiosInstance.get(endpoint);
  const { data } = response;
  return data;
};

async function processVideoData(id) {
  const endpoint = `${baseurl}/process/${id}`;

  const response = await axiosInstance.post(endpoint);
  const { data } = response;
  return data;
};

async function addParticipant(payload) {
  const endpoint = `${baseurl}/add-participant`;

  const response = await axiosInstance.post(endpoint, payload);
  const { data } = response;
  return data;
};

export default {
  getClientData,
  getAdminToken,
  updateVisit,
  updateVisitNote,
  deleteVisitNote,
  searchVisits,
  getVisit,
  processVideoData,
  addParticipant,
};
