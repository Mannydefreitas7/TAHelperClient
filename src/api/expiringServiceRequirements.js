import { axiosInstance } from "@/boot/axios";

const baseurl = `${import.meta.env.root.BASE_URL}/expiring-service-requirements`;

async function getPageData(surveyId) {
  const endpoint = `${baseurl}/page-data/${surveyId}`;
  const response = await axiosInstance.get(endpoint);
  const { data } = response;

  return data || {};
}

async function getExpiringServiceRequirements(payload) {
  const endpoint = `${baseurl}/list`;
  const response = await axiosInstance.post(endpoint, payload);
  const { data } = response;

  return data || {};
}

async function findResponses(payload) {
  const endpoint = `${baseurl}/search`;
  const response = await axiosInstance.post(endpoint, payload);
  const { data } = response;
  return data;
}

async function downloadForm(id, type) {
  const endpoint = `${baseurl}/download-form/${id}?documentType=${type}`;
  const config = { responseType: "blob" };
  const response = await axiosInstance.get(endpoint, config);
  const { data, headers } = response;

  const contentDisposition = headers["content-disposition"];
  const fileName = contentDisposition
    .split(";")[1]
    .split("=")[1]
    .replace(/['"]+/g, "");

  return { fileName, file: data };
}

async function fetchSessions(payload) {
  const endpoint = `${baseurl}/fetch-sessions/${payload.id}?deliveryMethod=${payload.deliveryMethod}`;
  const response = await axiosInstance.post(endpoint, payload);
  const { data } = response;
  return data;
}

async function fetchEmployeeProgress(payload) {
  const endpoint = `${baseurl}/fetch-employee-progress/${payload.id}?deliveryMethod=${payload.deliveryMethod}`;
  const response = await axiosInstance.post(endpoint, payload);
  const { data } = response;
  return data;
}

async function getEmployees(payPeriod) {
  const endpoint = `${baseurl}/employees/list-by-pay-period`;
  const response = await axiosInstance.post(endpoint, { payPeriod });
  const { data } = response;

  return data || [];
}

async function downloadTrainingReport(payPeriod) {
  const endpoint = `${baseurl}/download-training-report`;
  axiosInstance
    .post(
      endpoint,
      { payPeriod },
      {
        responseType: "blob",
        headers: { Accept: "application/vnd.ms-excel"
      }
    })
    .then((response) => {
      if (response.data) {
        const url = window.URL.createObjectURL(response.data);
        const link = document.createElement("a");
        link.href = url;
        const formattedPayPeriod = payPeriod.replace(/\//g, '-');
        link.setAttribute("download", `Training Report - ${formattedPayPeriod}.xlsx`);
        document.body.appendChild(link);
        link.click();
      }
    });
}

export async function sendFeedback(payload) {
  const endpoint = `${baseurl}/send-feedback`;

  const response = await axiosInstance.post(endpoint, payload);
  const { data } = response;
  return data;
}

export async function markFeedback(id, status) {
  const endpoint = `${baseurl}/mark-feedback/${id}/${status}`;

  const response = await axiosInstance.put(endpoint);
  const { data } = response;
  return data;
}

export async function addMessageQueueId(surveyId, id) {
  const endpoint = `${baseurl}/add-message-queue/${surveyId}/${id}`;

  const response = await axiosInstance.put(endpoint);
  const { data } = response;
  return data;
}

export default {
  getPageData,
  getExpiringServiceRequirements,
  findResponses,
  downloadForm,
  fetchSessions,
  fetchEmployeeProgress,
  getEmployees,
  downloadTrainingReport,
  sendFeedback,
  markFeedback,
  addMessageQueueId,
};
