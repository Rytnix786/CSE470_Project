import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle responses
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  verifyEmail: (token) => api.post('/auth/verify-email', { token }),
};

// Doctor API
export const doctorAPI = {
  getVerifiedDoctors: (params) => api.get('/doctors', { params }),
  getDoctorById: (id) => api.get(`/doctors/${id}`),
  getMyProfile: () => api.get('/doctor/me/profile'),
  createProfile: (data) => api.post('/doctor/me/profile', data),
  requestReverification: () => api.post('/doctor/me/request-reverification'),
  getDoctorSlots: (doctorId, params) => api.get(`/doctors/${doctorId}/slots`, { params }),
};

// Admin API
export const adminAPI = {
  getPendingDoctors: () => api.get('/admin/doctors/pending'),
  verifyDoctor: (doctorUserId, data) => api.patch(`/admin/doctors/${doctorUserId}/verify`, data),
  // Admin Profile API
  getMe: () => api.get('/admin/me'),
  updateMe: (data) => api.patch('/admin/me', data),
  changePassword: (data) => api.patch('/admin/me/password', data),
  getAuditLogs: (params) => api.get('/admin/audit-logs', { params }),
  getStats: () => api.get('/admin/stats'),
  getAllDoctors: (params) => api.get('/admin/doctors', { params }),
  getDoctorById: (doctorUserId) => api.get(`/admin/doctors/${doctorUserId}`),
  // Doctor Management
  suspendDoctor: (doctorUserId, data) => api.patch(`/admin/doctors/${doctorUserId}/suspend`, data),
  unsuspendDoctor: (doctorUserId, data) => api.patch(`/admin/doctors/${doctorUserId}/unsuspend`, data),
  deleteDoctor: (doctorUserId, data) => api.delete(`/admin/doctors/${doctorUserId}`, data),
  updateDoctorProfile: (doctorUserId, data) => api.patch(`/admin/doctors/${doctorUserId}/profile`, data),
  // Doctor Evidence
  getDoctorReviews: (doctorUserId) => api.get(`/admin/doctors/${doctorUserId}/reviews`),
  getDoctorReports: (doctorUserId) => api.get(`/admin/doctors/${doctorUserId}/reports`),
};

// Slots API
export const slotsAPI = {
  createSlot: (data) => api.post('/doctor/me/slots', data),
  getMySlots: (params) => api.get('/doctor/me/slots', { params }),
  updateSlot: (slotId, data) => api.patch(`/doctor/me/slots/${slotId}`, data),
  deleteSlot: (slotId) => api.delete(`/doctor/me/slots/${slotId}`),
};

// Appointments API
export const appointmentsAPI = {
  bookAppointment: (data) => api.post('/appointments', data),
  getMyAppointments: () => api.get('/appointments/me'),
  getAppointmentById: (id) => api.get(`/appointments/${id}`),
  cancelAppointment: (id, data) => api.patch(`/appointments/${id}/cancel`, data),
  rescheduleAppointment: (id, data) => api.patch(`/appointments/${id}/reschedule`, data),
  getDoctorAppointments: () => api.get('/doctor/appointments/me'),
};

// Payments API
export const paymentsAPI = {
  initPayment: (appointmentId) => api.post('/payments/init', { appointmentId }),
  confirmPayment: (txnRef) => api.post('/payments/confirm', { txnRef }),
  getPaymentByAppointment: (appointmentId) => api.get(`/payments/appointment/${appointmentId}`),
};

// Chat API
export const chatAPI = {
  getMessages: (appointmentId) => api.get(`/chat/${appointmentId}/messages`),
  endConsultation: (appointmentId) => api.post(`/chat/${appointmentId}/end`),
};

// Prescriptions API
export const prescriptionsAPI = {
  createPrescription: (data) => api.post('/prescriptions', data),
  getPrescriptionByAppointment: (appointmentId) => api.get(`/prescriptions/appointment/${appointmentId}`),
  getMyPrescriptions: () => api.get('/prescriptions/me'),
  getMyDoctorPrescriptions: () => api.get('/prescriptions/doctor/me'),
  getPatientPrescriptions: (patientId) => api.get(`/prescriptions/patient/${patientId}`),
};

// Reviews API
export const reviewsAPI = {
  createReview: (data) => api.post('/reviews', data),
  getDoctorReviews: (doctorId) => api.get(`/reviews/doctor/${doctorId}`),
  getMyReviews: () => api.get('/reviews/me'),
  getReviewByAppointment: (appointmentId) => api.get(`/reviews/appointment/${appointmentId}`),
};

// Health Records API
export const healthRecordsAPI = {
  createRecord: (data) => api.post('/health-records', data),
  getMyRecords: () => api.get('/health-records/me'),
  getPatientRecords: (patientId) => api.get(`/health-records/patient/${patientId}`),
  getRecordById: (id) => api.get(`/health-records/${id}`),
  updateRecord: (id, data) => api.patch(`/health-records/${id}`, data),
  deleteRecord: (id) => api.delete(`/health-records/${id}`),
};

// Notifications API
export const notificationsAPI = {
  getMyNotifications: () => api.get('/notifications'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
};

// Reports API
export const reportsAPI = {
  createReport: (data) => api.post('/reports', data),
};

// Admin Reports API
export const adminReportsAPI = {
  getReports: (params) => api.get('/reports', { params }),
  getReportById: (id) => api.get(`/reports/${id}`),
  updateReport: (id, data) => api.patch(`/reports/${id}`, data),
};

// Upload API
export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const token = localStorage.getItem('token');
  
  const response = await axios.post(`${API_URL}/api/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export default api;
