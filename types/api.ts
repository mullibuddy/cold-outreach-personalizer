import { z, ZodError } from 'zod'

// Source: RESEARCH.md Pattern 4 (Structured API Error Responses)
export interface ApiErrorResponse {
  success: false
  error: {
    message: string
    fields?: Record<string, string[]> // Field-level validation errors
  }
}

export interface ApiSuccessResponse<T> {
  success: true
  data: T
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse

// Helper function for API routes
export function errorResponse(
  message: string,
  fields?: Record<string, string[]>
): ApiErrorResponse {
  return {
    success: false,
    error: { message, fields }
  }
}

// Convert Zod validation errors to structured field errors
export function zodErrorToFields(error: ZodError): Record<string, string[]> {
  const fields: Record<string, string[]> = {}

  error.issues.forEach(issue => {
    const path = issue.path.join('.')
    if (!fields[path]) fields[path] = []
    fields[path].push(issue.message)
  })

  return fields
}
