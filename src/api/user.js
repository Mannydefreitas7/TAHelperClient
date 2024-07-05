import { axiosInstance } from "@/boot/axios";

const baseurl = `${import.meta.env.root.BASE_URL}/admin`;

async function findUsers(payload) {
  const endpoint = `${baseurl}/users`;

  const response = await axiosInstance.post(endpoint, payload);
  const { data } = response;
  return data;
};

async function findUserTenants(email, isPending) {
  const endpoint = `${baseurl}/users/tenants/${email}/${isPending}`;

  const response = await axiosInstance.get(endpoint);
  const { data } = response;
  return data;
};

async function updateUser(payload) {
  const endpoint = `${baseurl}/user`;

  const response = await axiosInstance.put(endpoint, payload);
  const { data } = response;
  return data;
};

async function deleteUser(id, tenantId) {
  const endpoint = `${baseurl}/user/${id}/${tenantId}`;

  const response = await axiosInstance.delete(endpoint);
  const { data } = response;
  return data;
}

async function deletePendingUser(email, tid) {
  const endpoint = `${baseurl}/pending-user/${email}/${tid}`;

  const response = await axiosInstance.delete(endpoint);
  const { data } = response;
  return data;
}

async function inviteUser(email, tenantIds) {
  const endpoint = `${baseurl}/invite`;

  const payload = {email, tenantIds}
  const response = await axiosInstance.post(endpoint, payload);
  const { data } = response;
  return data;
}

async function resendUserInvite(email, tenantId) {
  const endpoint = `${baseurl}/reinvite`;

  const payload = {email, tenantId}
  const response = await axiosInstance.post(endpoint, payload);
  const { data } = response;
  return data;
}

export default {
  findUsers,
  findUserTenants,
  updateUser,
  deletePendingUser,
  deleteUser,
  inviteUser,
  resendUserInvite
};