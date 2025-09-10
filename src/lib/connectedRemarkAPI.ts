import { api } from "./api"; // assuming same axios instance as before

export const connectedRemarkAPI = {
  getAllRemarks: async () => {

    const response = await api.get("/connected-remarks/get-all");

    return response.data;
  },
  createRemark: async (data: any) => {

    const response = await api.post("/connected-remarks/create", data);

    return response.data;
  },


  getRemarkById: async (id: string) => {

    const response = await api.get(`/connected-remarks/getById/${id}`);

    return response.data;
  },

  updateRemark: async (id: string, data: any) => {

    const response = await api.put(`/connected-remarks/update/${id}`, data);

    return response.data;
  },

  deleteRemark: async (id: string) => {

    const response = await api.delete(`/connected-remarks/delete/${id}`);

    return response.data;
  },
  getRemarksByTabId: async (tabId: string) => {

    const response = await api.get(`/connected-remarks/by-tab/${tabId}`);

    return response.data;
  },

};
