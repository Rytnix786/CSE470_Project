const { z } = require('zod');

// Update admin profile schema
const updateAdminProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  phone: z.string().nullable().optional(),
  email: z.string().email('Invalid email format').optional(),
  role: z.enum(['PATIENT', 'DOCTOR', 'ADMIN']).optional(),
}).partial().strict(); // Partial mode to allow partial updates, strict mode to reject unexpected fields

// Change password schema
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(1, 'New password is required'),
}).strict(); // Strict mode to reject unexpected fields

// Suspend doctor schema
const suspendDoctorSchema = z.object({
  reason: z.string().min(1, 'Reason is required'),
  note: z.string().optional(),
}).strict();

// Unsuspend doctor schema
const unsuspendDoctorSchema = z.object({
  note: z.string().optional(),
}).strict();

// Edit doctor profile schema
const editDoctorProfileSchema = z.object({
  specialization: z.string().optional(),
  experienceYears: z.number().min(0).optional(),
  fee: z.number().min(0).optional(),
  bio: z.string().max(1000).optional(),
  licenseNo: z.string().optional(),
}).partial();

module.exports = {
  updateAdminProfileSchema,
  changePasswordSchema,
  suspendDoctorSchema,
  unsuspendDoctorSchema,
  editDoctorProfileSchema,
};