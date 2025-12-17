const { z } = require('zod');

const prescriptionItemSchema = z.object({
  drugName: z.string().min(1, 'Drug name is required'),
  dosage: z.string().min(1, 'Dosage is required'),
  frequency: z.string().min(1, 'Frequency is required'),
  duration: z.string().min(1, 'Duration is required'),
  notes: z.string().optional(),
});

const createPrescriptionSchema = z.object({
  appointmentId: z.string().min(1, 'Appointment ID is required'),
  patientId: z.string().min(1, 'Patient ID is required'),
  items: z.array(prescriptionItemSchema).min(1, 'At least one item is required'),
  diagnosis: z.string().optional(),
  additionalNotes: z.string().optional(),
});

module.exports = {
  createPrescriptionSchema,
};
