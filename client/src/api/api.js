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
  getDoctorSlots: (doctorId, params) => api.get(`/doctors/${doctorId}/slots`, { params }),
};

// Admin API
export const adminAPI = {
  getPendingDoctors: () => api.get('/admin/doctors/pending'),
  verifyDoctor: (doctorUserId, data) => api.patch(`/admin/doctors/${doctorUserId}/verify`, data),
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
  getPatientPrescriptions: (patientId) => api.get(`/prescriptions/patient/${patientId}`),
};

// Health Records API
export const healthRecordsAPI = {
  createRecord: (data) => api.post('/health-records', data),
  getMyRecords: () => api.get('/health-records/me'),
  getRecordById: (id) => api.get(`/health-records/${id}`),
  updateRecord: (id, data) => api.patch(`/health-records/${id}`, data),
  deleteRecord: (id) => api.delete(`/health-records/${id}`),
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
