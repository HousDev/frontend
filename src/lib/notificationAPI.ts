import { api } from "./api";

export const notificationAPI = {
  // ✅ Create Notification
  createNotification: async (data: {
    leadId: number | string;
    userId: number | string;
    message: string;
    type?: string;
    link?: string;
  }) => {
    const response = await api.post("/client-lead-notifications/create", data);
    return response.data;
  },

  // ✅ Get Notifications by User
  getUserNotifications: async (userId: number) => {
    const response = await api.get(`/client-lead-notifications/getallbyuserid/${userId}`);
    return response.data;
  },

  // ✅ Mark Notification as Read
  markAsRead: async (id: number) => {
    const response = await api.put(`/client-lead-notifications/markasread/${id}/read`);
    return response.data;
  },

  markAllAsRead: async (userId: number) => {
  const response = await api.put(`/client-lead-notifications/markallasread/${userId}`);
  return response.data;
},

 // ✅ Update or Create Notification (fallback)
updateNotification: async (
  id: number | null,
  data: {
    leadId: string | number;
    userId: String | number;
    message: string;
    type?: string;
    link?: string;
  }
) => {
  try {
    if (id) {
      // 🔹 Try update first
      const response = await api.put(`/client-lead-notifications/update/${id}`, data);
      return response.data;
    } else {
      // 🔹 If no id provided, directly create
      const createRes = await api.post("/client-lead-notifications/create", data);
      return createRes.data;
    }
  } catch (err: any) {
    if (err.response && err.response.status === 404) {
      console.warn("⚠️ Notification not found, creating new one...");
      const createRes = await api.post("/client-lead-notifications/create", data);
      return createRes.data;
    }
    console.error("❌ Error in updateNotification:", err);
    throw err;
  }
},
 delete: async (id: number) => {
    const res = await api.delete(`client-lead-notifications/${id}`);
    return res.data;
  },
  deleteAllForUser: async (userId: number) => {
    const res = await api.delete(`/client-lead-notifications/user/${userId}/all`);
    return res.data;
  },
  deleteReadForUser: async (userId: number) => {
    const res = await api.delete(`/client-lead-notifications/user/${userId}/read`);
    return res.data;
  },

};
