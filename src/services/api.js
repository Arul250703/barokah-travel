import axios from "axios";

// Base URL backend kamu
const API = axios.create({
  baseURL: "http://localhost:5000/api", // sesuaikan dengan BE-mu
});

// ==================== BOOKINGS ====================
export const createBooking = (data) => API.post("/bookings", data);
export const getBookings = () => API.get("/bookings");
export const getBookingById = (id) => API.get(`/bookings/${id}`);
export const getTicketByBookingId = (id) => API.get(`/bookings/${id}/ticket`);
export const updateBookingStatus = (id, status) =>
  API.put(`/bookings/${id}/status`, { status });
export const deleteBooking = (id) => API.delete(`/bookings/${id}`);
export const scanTicket = (participantId) =>
  API.post("/bookings/scan", { participantId });

export const getCities = () => API.get("/cities");
export const getPackages = (city) => API.get(`/packages?city=${city}`);

// ✅ Perbaikan: gunakan API (axios instance) bukan axios langsung
export const getPackagesByCity = (city) => API.get(`/packages?city=${city}`);

// ==================== TRANSACTIONS ====================
export const createTransaction = (data) => API.post("/transactions", data);

// ==================== USERS ====================
export const getUsers = () => API.get("/users");
export const createUser = (data) => API.post("/users", data);
export const loginUser = (data) => API.post("/users/login", data);

// ==================== PESERTA ====================
export const createPeserta = (data) => API.post("/peserta", data);
export const getPeserta = (page = 1) => API.get(`/peserta?page=${page}`);

// ==================== MARKETING ====================
export const createMarketing = (formData) =>
  API.post("/marketing", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const getMarketing = (page = 1) => API.get(`/marketing?page=${page}`);

// ==================== STATISTIK ====================
export const getStatsPeserta = () => API.get("/stats/peserta");
export const getStatsMarketing = () => API.get("/stats/marketing");

// ==================== ADMIN ====================
export const getAdminPeserta = () => API.get("/admin/peserta");
export const deleteAdminPeserta = (id) => API.delete(`/admin/peserta/${id}`);
export const updateAdminPeserta = (id, data) =>
  API.put(`/admin/peserta/${id}`, data);

export const getAdminMarketing = () => API.get("/admin/marketing");
export const deleteAdminMarketing = (id) =>
  API.delete(`/admin/marketing/${id}`);
export const updateAdminMarketing = (id, formData) =>
  API.put(`/admin/marketing/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
