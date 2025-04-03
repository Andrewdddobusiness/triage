// schemas/inquiry.ts
import { z } from "zod";

export const inquirySchema = z.object({
  id: z.string(), // or z.number() if you store numeric IDs
  name: z.string(),
  phone: z.string(),
  email: z.string().nullable().optional(),
  inquiry_date: z.string().nullable().optional(),
  service_date: z.string().nullable().optional(),
  estimated_completion: z.string().nullable().optional(),
  budget: z.number().nullable().optional(),
  status: z.enum(["new", "contacted", "scheduled", "completed", "cancelled"]),
});

export type Inquiry = z.infer<typeof inquirySchema>;
