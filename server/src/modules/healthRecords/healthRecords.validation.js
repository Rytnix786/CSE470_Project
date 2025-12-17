const { z } = require('zod');

const createHealthRecordSchema = z.object({
  date: z.string().optional(),
  bloodPressure: z.object({
    systolic: z.union([z.number(), z.string()]).optional().transform(val => val === '' || val === null || val === undefined ? undefined : Number(val)),
    diastolic: z.union([z.number(), z.string()]).optional().transform(val => val === '' || val === null || val === undefined ? undefined : Number(val)),
  }).optional(),
  bloodSugar: z.union([z.number(), z.string()]).optional().transform(val => val === '' || val === null || val === undefined ? undefined : Number(val)),
  weight: z.union([z.number(), z.string()]).optional().transform(val => val === '' || val === null || val === undefined ? undefined : Number(val)),
  height: z.union([z.number(), z.string()]).optional().transform(val => val === '' || val === null || val === undefined ? undefined : Number(val)),
  notes: z.string().optional(),
});

module.exports = {
  createHealthRecordSchema,
};
