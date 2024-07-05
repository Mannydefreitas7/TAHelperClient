import axiosInstance from "axios";

const baseurl = `${import.meta.env.VITE_BASE_URL}/automation`;

function getAgentRegistrationUrl(tenantId) {
  return `${baseurl}/${tenantId}`;
}

async function findAgents(payload) {
  const endpoint = `${baseurl}/search`;
  const response = await axiosInstance.post(endpoint, payload);
  const { data } = response;
  return data;
}

async function findEvents(payload) {
  const endpoint = `${baseurl}/searchEvents`;
  const response = await axiosInstance.post(endpoint, payload);
  const { data } = response;
  return data;
}

async function restoreAgent(id) {
  const endpoint = `${baseurl}/restoreAgent/${id}`;
  const response = await axiosInstance.post(endpoint, {});
  const { data } = response;
  return data;
}

async function deleteAgent(id) {
  const endpoint = `${baseurl}/deleteAgent/${id}`;
  const response = await axiosInstance.post(endpoint, {});
  const { data } = response;
  return data;
}

async function deleteAgentBot(id) {
  const endpoint = `${baseurl}/deleteAgentBot/${id}`;
  const response = await axiosInstance.post(endpoint, {});
  const { data } = response;
  return data;
}

async function saveAgentBotConfiguration(payload) {
  const endpoint = `${baseurl}/saveAgentBotConfiguration`;
  const response = await axiosInstance.post(endpoint, payload);
  const { data } = response;
  return data;
}

async function fetchBots(showAll) {
  const endpoint = `${baseurl}/bots/${showAll ?? true}`;
  const response = await axiosInstance.get(endpoint);
  const { data } = response;
  return data;
}

async function addAgentBot(payload) {
  const endpoint = `${baseurl}/addAgentBot`;
  const response = await axiosInstance.post(endpoint, payload);
  const { data } = response;
  return data;
}

async function loadBotEvents(type) {
  const endpoint = `${baseurl}/events/${type}`;
  const response = await axiosInstance.get(endpoint);
  const { data } = response;
  return data;
}

async function loadBotEventAttachments(eventId) {
  const endpoint = `${baseurl}/eventAttachments/${eventId}`;
  const response = await axiosInstance.get(endpoint);
  const { data } = response;
  return data;
}

async function getAgents(showAll) {
  const endpoint = `${baseurl}/agentList/${showAll ? 1 : 0}`;
  const response = await axiosInstance.get(endpoint);
  const { data } = response;
  return data;
}

async function getBots(showAll) {
  const endpoint = `${baseurl}/botList/${showAll ? 1 : 0}`;
  const response = await axiosInstance.get(endpoint);
  const { data } = response;
  return data;
}

async function loadRunCombinedDataPayload(runGuid) {
  const endpoint = `${baseurl}/runPayload/${runGuid}`;
  const response = await axiosInstance.get(endpoint);
  const { data } = response;
  return data;
}

export default {
  findAgents,
  findEvents,
  getAgentRegistrationUrl,
  restoreAgent,
  deleteAgent,
  deleteAgentBot,
  saveAgentBotConfiguration,
  fetchBots,
  addAgentBot,
  loadBotEvents,
  loadBotEventAttachments,
  getAgents,
  getBots,
  loadRunCombinedDataPayload,
};
