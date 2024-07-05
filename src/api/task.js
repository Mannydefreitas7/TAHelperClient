import { axiosInstance } from "@/boot/axios";
async function getTasks(payload) {
    const endpoint = `${import.meta.env.root.BASE_URL}/taskTracker/tasks`;
  
    const response = await axiosInstance.post(endpoint, payload);
    const { data } = response;
    return data;
  }
  
  async function sendRejectedFeedBack(payload){
    const endpoint = `${import.meta.env.root.BASE_URL}/taskTracker/send-rejected-feedback`;

    const response = await axiosInstance.post(endpoint, payload);
    const { data } = response;
    return data;
  }

  export async function markCompleted(id) {
    const endpoint = `${import.meta.env.root.BASE_URL}/taskTracker/mark-completed/${id}`;
  
    const response = await axiosInstance.put(endpoint);
    const { data } = response;
    return data;
  }

  async function deleteTask(id){
    const endpoint = `${import.meta.env.root.BASE_URL}/taskTracker/delete-task/${id}`;

    const response = await axiosInstance.delete(endpoint);
    const {data} = response;
    return data;
  }
  async function markRejected(id){
    const endpoint = `${import.meta.env.root.BASE_URL}/taskTracker/mark-rejected/${id}`;

    const response = await axiosInstance.put(endpoint);
    const{data} = response;
    return data
  }

  async function getTasksSettings(){
    const endpoint = `${import.meta.env.root.BASE_URL}/taskTracker/settings`;

    const response = await axiosInstance.get(endpoint);
    const {data} = response;
    return data;
  }
  
  export default {
    getTasks,
    markCompleted,
    deleteTask,
    getTasksSettings,
    markRejected,
    sendRejectedFeedBack,
  };