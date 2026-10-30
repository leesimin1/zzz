import { z } from 'zod';

export const demoUserSchema = z.object({
  id: z.uuid().optional(),
  name: z.string().trim().min(1).max(40),
  email: z.email().trim().toLowerCase().max(254),
  address: z.string().trim().max(200).default(''),
});
export type DemoUser = z.infer<typeof demoUserSchema>;
export const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(10).max(128),
});
export const profileSchema = z.object({
  name: demoUserSchema.shape.name,
  address: z.string().trim().min(5).max(200),
});
export const registrationSchema = profileSchema.extend(credentialsSchema.shape);
