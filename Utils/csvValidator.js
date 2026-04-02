import { z } from 'zod';

export const userRowSchema = z.object({
    name: z.string().trim().min(1, "Name is required"),
    email: z.string().trim().email("Invalid email format"),
    phone: z.string().trim().regex(/^\d{10}$/, "Phone must be exactly 10 digits").optional().or(z.literal('')),
    age: z.preprocess((val) => (val ? Number(val) : undefined), z.number().positive().optional()),
    city: z.string().trim().optional(),
});