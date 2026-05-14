import { z } from 'zod'

// Source: REQUIREMENTS.md OPENER-01 to OPENER-06
export const OpenerSchema = z.object({
  angle: z.enum(["trigger", "pain", "curiosity"]),
  hook: z.string().min(20, "Hook must be at least 20 characters"),
  explanation: z.string().min(10, "Explanation must be at least 10 characters"),
  followUp: z.string().min(10, "Follow-up must be at least 10 characters"),
  bestFor: z.enum(["cold_email", "linkedin_dm", "cold_call"]),
})

export type Opener = z.infer<typeof OpenerSchema>

export const OpenerOutputSchema = z.object({
  openers: z.array(OpenerSchema).length(3, "Must return exactly 3 openers"),
  intelSummary: z.string().min(20, "Intel summary must be at least 20 characters"),
  citations: z.array(z.string().url("Citations must be valid URLs"))
})

export type OpenerOutput = z.infer<typeof OpenerOutputSchema>
