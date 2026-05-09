import api from "./axios";

export const getMyPrescriptions = () => api.get("/prescriptions/my");
export const getAllPrescriptions = () => api.get("/prescriptions/all");
export const getByAppointment = (id) =>
  api.get(`/prescriptions/appointment/${id}`);
export const createPrescription = (data) => api.post("/prescriptions", data);
export const updatePrescription = (id, data) =>
  api.put(`/prescriptions/${id}`, data);
export const deletePrescription = (id) => api.delete(`/prescriptions/${id}`);
