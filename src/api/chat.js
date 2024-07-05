import { axiosInstance } from "@/boot/axios";

async function findChats(payload) {
  const endpoint = `${import.meta.env.root.BASE_URL}/chat/chats`;

  const response = await axiosInstance.post(endpoint, payload);
  const { data } = response;
  return data || [];
}

async function findChatMessages(payload) {
  const endpoint = `${import.meta.env.root.BASE_URL}/chat/chat-messages`;

  const response = await axiosInstance.post(endpoint, payload);
  const { data } = response;
  return data || [];
};

async function addChat(payload) {
  const endpoint = `${import.meta.env.root.BASE_URL}/chat/add-chat`;

  const response = await axiosInstance.post(endpoint, payload);
  const { data } = response;
  return data || [];
};

async function archiveToggle(payload) {
  const endpoint = `${import.meta.env.root.BASE_URL}/chat/archive-toggle`;

  const response = await axiosInstance.post(`${endpoint}/${payload}`);
  const { data } = response;
  return data || [];
};

async function addChatMessage(payload) {
  const endpoint = `${import.meta.env.root.BASE_URL}/chat/add-chat-message`;

  const response = await axiosInstance.post(endpoint, payload);
  const { data } = response;
  return data || [];
};

async function markChatSeen(payload) {
  const endpoint = `${import.meta.env.root.BASE_URL}/chat/mark-chat-messages-seen`;

  const response = await axiosInstance.post(`${endpoint}/${payload.chatId}/${payload.messageId}`);
  const { data } = response;
  return data || [];
};

async function markChatMessageSeen(payload) {
  const endpoint = `${import.meta.env.root.BASE_URL}/chat/mark-chat-message-seen`;

  const response = await axiosInstance.post(`${endpoint}/${payload}`);
  const { data } = response;
  return data || [];
};

async function toggleChatFlagged(payload) {
  const endpoint = `${import.meta.env.root.BASE_URL}/chat/toggle-chat-flagged`;

  const response = await axiosInstance.put(`${endpoint}`, payload);
  const { data } = response;
  return data || [];
}

async function lookupRecipient(payload) {
  const endpoint = `${import.meta.env.root.BASE_URL}/chat/lookup-recipient`;

  const response = await axiosInstance.post(endpoint, {value: payload});
  const { data } = response;
  return data || [];
};

async function getImage(payload) {
  const endpoint = `${import.meta.env.root.BASE_URL}/chat/download-image`;
  const headers = { responseType: "blob" };

  const response = await axiosInstance.post(endpoint, payload, headers);
  const { data } = response;
  return data || {};
};

async function getTags() {
  const endpoint = `${import.meta.env.root.BASE_URL}/chat/chat-tags`;

  const response = await axiosInstance.get(endpoint);
  const { data } = response;
  return data || [];
}

async function saveTags(payload) {
  const endpoint = `${import.meta.env.root.BASE_URL}/chat/update-tags`;

  const response = await axiosInstance.post(endpoint, payload);
  const { data } = response;
  return data || [];
}

async function saveMessageTemplate(payload) {
  const endpoint = `${import.meta.env.root.BASE_URL}/chat/save-message-template`;

  const response = await axiosInstance.post(endpoint, payload);
  const {data} = response;
  return data || [];
}

async function getMessageTemplates() {
  const endpoint = `${import.meta.env.root.BASE_URL}/chat/get-message-templates`;

  const response = await axiosInstance.get(endpoint);
  const {data} = response;
  return data || [];
}

async function deleteMessageTemplate(id) {
  const endpoint = `${import.meta.env.root.BASE_URL}/chat/delete-message-template/${id}`;

  const response = await axiosInstance.delete(endpoint);
  const {data} = response;
  return data || [];
}

async function saveChatTags(payload) {
  const endpoint = `${import.meta.env.root.BASE_URL}/chat/save-chat-tags`;

  const response = await axiosInstance.put(endpoint, payload);
  const { data } = response;
  return data || [];
}

async function getSurveys() {
  const endpoint = `${import.meta.env.root.BASE_URL}/chat/get-surveys`;

  const response = await axiosInstance.get(endpoint);
  const { data } = response;
  return data;
}

async function getMediaLinks() {
  const endpoint = `${import.meta.env.root.BASE_URL}/chat/get-media-links`;

  const response = await axiosInstance.get(endpoint);
  const { data } = response;
  return data;
}

async function getComplianceLinks() {
  const endpoint = `${import.meta.env.root.BASE_URL}/chat/get-compliance-links`;

  const response = await axiosInstance.get(endpoint);
  const { data } = response;
  return data;
}

async function getFormLinks() {
  const endpoint = `${import.meta.env.root.BASE_URL}/chat/get-form-links`;

  const response = await axiosInstance.get(endpoint);
  const { data } = response;
  return data;
}

async function getTimekeepingCampaigns() {
  const endpoint = `${import.meta.env.root.BASE_URL}/chat/get-timekeeping-campaigns`;

  const response = await axiosInstance.get(endpoint);
  const { data } = response;
  return data;
}

async function getActivitySheetCampaigns() {
  const endpoint = `${import.meta.env.root.BASE_URL}/chat/get-activity-sheet-campaigns`;

  const response = await axiosInstance.get(endpoint);
  const { data } = response;
  return data;
}

async function getMessageDetails(id) {
  const endpoint = `${import.meta.env.root.BASE_URL}/chat/message-details/${id}`;

  const response = await axiosInstance.get(endpoint);
  const { data } = response;
  return data;
}

async function getSettings(tenantId = null) {
  const endpoint = `${import.meta.env.root.BASE_URL}/chat/settings` + (tenantId ? `/${tenantId}` : "");

  const response = await axiosInstance.get(endpoint);
  const { data } = response;
  return data;
}

export default {
  addChat,
  addChatMessage,
  findChats,
  findChatMessages,
  archiveToggle,
  markChatSeen,
  markChatMessageSeen,
  toggleChatFlagged,
  lookupRecipient,
  getImage,
  getTags,
  saveTags,
  saveChatTags,
  getSurveys,
  getMediaLinks,
  getSettings,
  getTimekeepingCampaigns,
  saveMessageTemplate,
  getMessageTemplates,
  deleteMessageTemplate,
  getComplianceLinks,
  getFormLinks,
  getMessageDetails,
  getActivitySheetCampaigns,
};
