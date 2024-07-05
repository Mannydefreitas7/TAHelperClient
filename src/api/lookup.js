import * as axiosInstance from "axios";

const baseurl = `${import.meta.env.VITE_BASE_URL}/lookup`;

async function campaignsLookup() {
  const endpoint = `${baseurl}/campaigns`;
  const response = await axiosInstance.get(endpoint);
  const { data } = response;
  return data || [];
}

export default {
  campaignsLookup
}