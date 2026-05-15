import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { ProspectInputSchema } from '@/types/prospect'
import { errorResponse, zodErrorToFields } from '@/types/api'
import { ClaudeClient } from '@/lib/ai/client'
import { checkRateLimit } from '@/lib/rate-limit/limiter'

// Configure Vercel Function timeout (Fluid Compute) - 60s for web search
export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    // Extract IP for rate limiting
    const headersList = await headers()
    const forwardedFor = headersList.get('x-forwarded-for')
    const ip = forwardedFor?.split(',')[0] || '127.0.0.1'

    // Check rate limit
    const { success, limit, remaining, reset } = await checkRateLimit(ip)

    if (!success) {
      const resetMinutes = Math.ceil((reset - Date.now()) / 1000 / 60)
      return NextResponse.json(
        errorResponse(
          `Rate limit exceeded. You can make ${limit} requests per hour. Try again in ${resetMinutes} minutes.`
        ),
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': new Date(reset).toISOString(),
          },
        }
      )
    }

    // Parse and validate input
    const body = await request.json()
    const parseResult = ProspectInputSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        errorResponse('Invalid input. Please check your form.', zodErrorToFields(parseResult.error)),
        { status: 400 }
      )
    }

    const input = parseResult.data

    // Generate openers using Claude
    const client = new ClaudeClient()
    const output = await client.generateOpeners(input)

    // Return success response
    return NextResponse.json(
      {
        success: true,
        data: output,
      },
      {
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': (remaining - 1).toString(),
          'X-RateLimit-Reset': new Date(reset).toISOString(),
        },
      }
    )
  } catch (error) {
    console.error('API route error:', error)

    // Handle specific error types
    if (error instanceof Error) {
      // Claude API errors (from ClaudeClient)
      if (error.message.includes('rate limited')) {
        return NextResponse.json(
          errorResponse('AI service temporarily rate limited. Please try again in a moment.'),
          { status: 503 }
        )
      }

      if (error.message.includes('temporarily unavailable')) {
        return NextResponse.json(
          errorResponse('AI service temporarily unavailable. Please try again shortly.'),
          { status: 503 }
        )
      }

      if (error.message.includes('timed out')) {
        return NextResponse.json(
          errorResponse(
            'Request timed out. This usually happens with complex queries. Try simplifying your product description.'
          ),
          { status: 504 }
        )
      }
    }

    // Generic server error
    return NextResponse.json(
      errorResponse('An unexpected error occurred. Please try again.'),
      { status: 500 }
    )
  }
}
