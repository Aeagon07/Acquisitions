import  { z } from 'zod';

export const signUpSchema = z.object({
    name: z.string().min(2, 'Name is required').max(50).trim(),
    email: z.email().max(50).toLowerCase().trim(),
    password: z.string().min(6, 'Password must be at least 6 characters').max(100),
    role: z.enum(['user', 'admin']).default('user'),
})

export const signInSchema = z.object({
    email: z.email().toLowerCase().trim(),
    password: z.string().min(1),
})