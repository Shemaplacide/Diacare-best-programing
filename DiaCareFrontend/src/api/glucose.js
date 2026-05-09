import api from "./axios";

export const getMyReadings = () => api.get("/glucose/my");
export const getMyTrend = () => api.get("/glucose/my/trend");
export const logReading = (data) => api.post("/glucose", data);
export const deleteReading = (id) => api.delete(`/glucose/${id}`);
export const getInRange = (from, to) =>
  api.get("/glucose/my/range", { params: { from, to } });
export const getAllReadings = () => api.get("/glucose/all");
