import axiosInstance from "axios";

async function findContacts(payload) {
  const endpoint = `${import.meta.env.VITE_BASE_URL}/contact/contacts`;

  const response = await axiosInstance.post(endpoint, payload);
  const { data } = response;
  return data;
};

async function findContactCount() {
  const endpoint = `${import.meta.env.VITE_BASE_URL}/contact/contact-count`;

  const response = await axiosInstance.post(endpoint);
  const { data } = response;
  return data || 0;
}

async function findGroups() {
  const endpoint = `${import.meta.env.VITE_BASE_URL}/contact/groups`;

  const response = await axiosInstance.get(endpoint);
  const { data } = response;
  return data;
}

async function saveGroups(payload) {
  const endpoint = `${import.meta.env.VITE_BASE_URL}/contact/update-groups`;

  const response = await axiosInstance.post(endpoint, payload);
  const { data } = response;
  return data;
}

async function saveContact(payload) {
  const endpoint = `${import.meta.env.VITE_BASE_URL}/contact/add-contact`;

  const response = await axiosInstance.post(endpoint, payload);
  const { data } = response;
  return data;
};

async function deleteContact (contactId) {
  const endpoint = `${import.meta.env.VITE_BASE_URL}/contact/delete-contact/${contactId}`;

  const response = await axiosInstance.post(endpoint);
  const { data } = response;
  return data;
};

async function exportContacts () {
  const endpoint = `${import.meta.env.VITE_BASE_URL}/contact/export-contacts`;
  const options = { responseType: "blob", headers: { Accept: "application/vnd.ms-excel" } };

  const response = await axiosInstance.get(endpoint, options);
  const { data } = response;
  return data;
}

async function importContacts (payload) {
  const endpoint = `${import.meta.env.VITE_BASE_URL}/contact/import-contacts`;
  const options = { headers: {"Content-Type": "multipart/form-data"} };

  const response = await axiosInstance.post(endpoint, payload, options);
  const { data } = response;
  return data;
};

export default {
  findContacts,
  findContactCount,
  findGroups,
  saveContact,
  saveGroups,
  deleteContact,
  importContacts,
  exportContacts,
};