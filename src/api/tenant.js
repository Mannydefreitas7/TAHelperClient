import { axiosInstance } from "@/boot/axios";

const baseurl = `${import.meta.env.root.BASE_URL}/admin`;

async function findTenants(payload) {
  const endpoint = `${baseurl}/tenants`;

  const response = await axiosInstance.post(endpoint, payload);
  const { data } = response;
  return data;
};

async function findAllActiveTenants() {
  const endpoint = `${baseurl}/active-tenants`;

  const response = await axiosInstance.get(endpoint);
  const { data } = response;
  return data;
};

async function updateTenant(payload) {
  const endpoint = `${baseurl}/tenant`;

  const response = await axiosInstance.put(endpoint, payload);
  const { data } = response;
  return data;
}

async function insertTenant(payload) {
  const endpoint = `${baseurl}/tenant`;

  const response = await axiosInstance.post(endpoint, payload);
  const { data } = response;
  return data;
}

async function toggleTenantOwner(userId, tenantId) {
  const endpoint = `${baseurl}/tenant/toggle-owner/${userId}/${tenantId}`;

  const response = await axiosInstance.put(endpoint);
  const { data } = response;
  return data;
}

export default {
  findTenants,
  findAllActiveTenants,
  insertTenant,
  updateTenant,
  toggleTenantOwner
};