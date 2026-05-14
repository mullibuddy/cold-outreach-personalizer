import { z } from 'zod'

// Source: REQUIREMENTS.md INPUT-01 to INPUT-06, CONTEXT.md user-friendly errors
export const ProspectInputSchema = z.object({
  firstName: z.string().min(1, "Please enter a first name"),
  jobTitle: z.string().min(1, "Please enter a job title"),
  company: z.string().min(1, "Please enter a company name"),
  productDescription: z.string().min(10, "Please describe your product (at least 10 characters)"),
  channel: z.enum(["cold_email", "linkedin_dm", "cold_call"], {
    message: "Please select a valid outreach channel"
  })
})

// Infer type from schema (per RESEARCH.md Pattern 1)
export type ProspectInput = z.infer<typeof ProspectInputSchema>
