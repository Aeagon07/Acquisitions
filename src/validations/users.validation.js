import { z } from 'zod';

export const updateUserSchema = z
  .object({
    name: z.string().min(2, 'Name is required').max(50).trim().optional(),
    email: z.email().max(50).toLowerCase().trim().optional(),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .max(100)
      .optional(),
    role: z.enum(['user', 'admin']).optional(),
  })
  .refine(data => Object.keys(data).length > 0, {
    message: 'At least one field is required for update',
  });

export const userIdSchema = z.object({
  id: z.coerce.number().int().positive('Valid user id is required'),
});
