import axios from "axios";

const API = "http://localhost:5000/api/rooms";

const roomService = {
  // ================= ROOM =================
  getRooms: () => axios.get(API),

  getRoom: (id) => axios.get(`${API}/${id}`),

  createRoom: (data) => axios.post(API, data),

  updateRoom: (id, data) => axios.put(`${API}/${id}`, data),

  archiveRoom: (id) => axios.patch(`${API}/${id}/archive`),

  // ================= BEDS =================
  addBed: (id, data) =>
    axios.post(`${API}/${id}/beds`, data),

  updateBed: (id, bedId, data) =>
    axios.put(`${API}/${id}/beds/${bedId}`, data),

  deleteBed: (id, bedId) =>
    axios.patch(`${API}/${id}/beds/${bedId}/archive`),

  // ================= IMAGES =================
  uploadImage: (formData) =>
    axios.post(`${API}/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  deleteImage: (id, public_id) =>
    axios.delete(`${API}/${id}/images/${public_id}`),
};

export default roomService;