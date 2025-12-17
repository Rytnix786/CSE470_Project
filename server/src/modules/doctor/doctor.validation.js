const { z } = require('zod');

const createProfileSchema = z.object({
  specialization: z.string().min(2, 'Specialization is required'),
  experienceYears: z.number().min(0, 'Experience years must be positive'),
  fee: z.number().min(0, 'Fee must be positive'),
  bio: z.string().min(10, 'Bio must be at least 10 characters').max(1000),
  licenseNo: z.string().min(3, 'License number is required'),
  docUploadUrl: z.string().optional(),
});

const verifyDoctorSchema = z.object({
  status: z.enum(['VERIFIED', 'REJECTED']),
  rejectionReason: z.string().optional(),
});

module.exports = {
  createProfileSchema,
  verifyDoctorSchema,
};
