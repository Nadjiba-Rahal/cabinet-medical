import { z } from "zod";

export const appointmentInputSchema = z.object({
  serviceId: z.string().min(1),
  startAt: z.string().min(1),
  fullName: z.string().trim().min(2).max(120),
  phone: z
    .string()
    .trim()
    .min(8, "invalid")
    .max(20)
    .regex(/^[\d\s+()-]+$/, "invalid"),
  email: z.string().trim().email(),
  message: z.string().trim().max(500).optional().or(z.literal("")),
});

export type AppointmentInput = z.infer<typeof appointmentInputSchema>;
