import axiosInstance from "axios";

const baseurl = `${import.meta.env.VITE_BASE_URL}/hires`;
export async function getHires(payload) {
  const endpoint = `${baseurl}/search`;
  const response = await axiosInstance.post(endpoint, payload);
  const { data } = response;

  return data || {};
}

export async function getHire(id) {
  const endpoint = `${baseurl}/${id}`;
  const response = await axiosInstance.get(endpoint);
  const { data } = response;

  return data || {};
}

export async function getLogo(tenantId) {
  const endpoint = `${baseurl}/logo/${tenantId}`;
  const response = await axiosInstance.get(endpoint);
  const { data } = response;

  return data || {};
}

export async function createHire(payload = {}) {
  const endpoint = `${baseurl}`;
  const response = await axiosInstance.post(endpoint, payload);
  const { data } = response;

  return data || {};
}

export async function updateHire(payload) {
  const endpoint = `${baseurl}`;
  const response = await axiosInstance.put(endpoint, payload);
  const { data } = response;

  return data || {};
}

export async function getDocuments(hireId) {
  const endpoint = `${baseurl}/documents/${hireId}`;
  const response = await axiosInstance.get(endpoint);
  const { data } = response;

  return data || "";
}

export async function getDocumentDownloadUrl(id) {
  const endpoint = `${baseurl}/documents/downloadUrl/${id}`;
  const response = await axiosInstance.get(endpoint);
  const { data } = response;

  return data || "";
}

export async function uploadDocument(payload) {
  const endpoint = `${baseurl}/documents/upload`;
  const response = await axiosInstance({
    method: "post",
    url: endpoint,
    data: payload,
    headers: { "Content-Type": "multipart/form-data" }
  });
  const { data } = response;

  return data || {};
}

export async function deleteDocument(id) {
  const endpoint = `${baseurl}/documents/${id}`;
  const response = await axiosInstance.delete(endpoint);
  const { data } = response;

  return data || {};
}

export async function getCrafts(tenantId) {
  const endpoint = `${baseurl}/crafts/${tenantId}`;
  const response = await axiosInstance.get(endpoint);
  const { data } = response;

  return data || {};
}

export async function exportNewHirePackage(id) {
  const endpoint = `${baseurl}/report/${id}`;
  const config = { responseType: "blob" };
  const response = await axiosInstance.get(endpoint, config);
  const { data } = response;

  return { file: data };
}

export async function getTenantIdByName(name) {
  const endpoint = `${baseurl}/tenant-id-by-name`;
  const response = await axiosInstance.post(endpoint, { name });
  const { data } = response;

  return data;
}

export async function findHireCount() {
  const endpoint = `${baseurl}/hire-count`;
  const response = await axiosInstance.get(endpoint);
  const { data } = response;

  return data;
}

export default {
  getHires,
  getHire,
  getLogo,
  createHire,
  updateHire,
  getDocuments,
  getDocumentDownloadUrl,
  uploadDocument,
  deleteDocument,
  getCrafts,
  exportNewHirePackage,
  getTenantIdByName,
  findHireCount
};
