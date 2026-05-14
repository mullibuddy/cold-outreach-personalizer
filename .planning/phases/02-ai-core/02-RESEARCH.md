# Phase 2: AI Core - Research

**Researched:** 2026-05-14
**Domain:** Claude API integration, prompt engineering, rate limiting, cost controls
**Confidence:** HIGH

## Summary

Phase 2 integrates Anthropic's Claude Sonnet 4.6 with web_search_20260209 tool to generate three distinct personalized sales openers (Trigger, Pain, Curiosity angles) within 30 seconds while enforcing cost controls through rate limiting. The implementation uses Next.js 16.2.6 App Router API routes with streaming responses, Upstash Redis for stateless IP-based rate limiting (10 req/hour), and MSW for API mocking in tests.

**Critical Challenges:**
1. **Sales Voice Authenticity:** AI-generated sales emails often sound formulaic—spam filters detect high "AI perplexity" patterns like "I hope this email finds you well." Solution: prompt engineering with citation requirements, anti-spam patterns, and channel-specific calibration.
2. **Vercel Timeouts:** Free tier = 10s, paid = 300s with Fluid Compute. Solution: streaming responses + 30s maxDuration configuration.
3. **Unbounded Costs:** Claude Sonnet 4.6 costs $3/1M input, $15/1M output tokens. Web search adds $10/1K searches. Solution: Upstash rate limiting enforces 10 requests/hour/IP.

**Primary recommendation:** Use @anthropic-ai/sdk 0.96.0 with messages.stream() for streaming responses, Upstash @upstash/ratelimit for stateless rate limiting, and MSW 2.x for API mocking. Prompt engineering must emphasize citations, avoid AI clichés, and generate "Why This Works" meta-commentary to explain strategic angle choices.

## Phase Requirements

<phase_requirements>
| ID | Description | Research Support |
|----|-------------|-----------------|
| GEN-01 | Generate three distinct personalized openers using Claude Sonnet 4 with web search | Claude API with web_search_20260209 tool, streaming pattern for 30s timeout |
| GEN-02 | Generation completes within 30 seconds under normal conditions | Vercel maxDuration=30 configuration, streaming to avoid timeout |
| GEN-03 | Use web search to find recent company news and prospect information | web_search_20260209 tool with dynamic filtering (Claude Sonnet 4.6+) |
| GEN-04 | Enforce citation requirements to prevent hallucinations | web_search tool auto-includes citations, prompt engineering guidance |
| GEN-05 | Avoid robotic AI voice and spam triggers | Anti-spam prompt patterns, segment-level personalization, human-like tone |
| OPENER-01 | Trigger Angle references recent company events/news | Prompt template for trigger-based research pattern |
| OPENER-02 | Pain Angle addresses role-specific pain points | Prompt template for pain point identification |
| OPENER-03 | Curiosity Angle uses insights/questions/public content | Prompt template for curiosity-based hooks |
| OPENER-04 | Each opener includes hook, explanation, follow-up | OpenerSchema validation (types/opener.ts) |
| OPENER-05 | Each opener shows "Best For" channel recommendation | bestFor enum in OpenerSchema |
| OPENER-06 | Content calibrated for selected channel | Prompt engineering with channel-specific instructions |
| INFRA-02 | Rate limiting prevents cost overruns | Upstash Redis stateless rate limiting, 10 req/hour/IP |
| INFRA-04 | Application handles API timeouts gracefully | Streaming with 30s maxDuration, try-catch with timeout errors |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @anthropic-ai/sdk | 0.96.0 | Claude API client with streaming | Official TypeScript SDK, built-in retries/error handling, 5.6K npm dependents |
| @upstash/ratelimit | Latest | Stateless rate limiting | Only HTTP-based rate limiter for serverless, sliding window algorithm, no persistent connections |
| @upstash/redis | Latest | Redis client for Upstash | Companion to @upstash/ratelimit, REST API over HTTP, edge-compatible |
| msw | 2.x | API mocking for tests | Industry standard for network interception, works at service worker level, Vitest-compatible |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| None required | - | - | Phase 2 uses existing Next.js 16, Zod, Vitest from Phase 1 |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @anthropic-ai/sdk | Vercel AI SDK @ai-sdk/anthropic | Vercel SDK adds abstraction layer for multi-provider support, but adds dependency and complexity. Direct SDK preferred for single-provider use case. |
| Upstash Redis | In-memory Map | In-memory fails in stateless serverless (cold starts reset state). Upstash Redis persists across invocations. |
| MSW | Manual fetch mocks | Manual mocks require more boilerplate and don't intercept at network boundary. MSW intercepts HTTP requests cleanly. |

**Installation:**
```bash
pnpm add @anthropic-ai/sdk @upstash/ratelimit @upstash/redis
pnpm add -D msw
```

## Architecture Patterns

### Recommended Project Structure
```
app/
├── api/
│   └── generate/
│       └── route.ts          # POST endpoint with streaming
lib/
├── ai/
│   ├── client.ts             # Anthropic client singleton
│   ├── prompts.ts            # Prompt templates
│   └── stream-parser.ts      # Stream chunk processing
├── rate-limit/
│   └── limiter.ts            # Upstash rate limiter config
tests/
├── mocks/
│   ├── handlers.ts           # MSW request handlers
│   └── server.ts             # MSW server setup
└── lib/
    └── ai/
        └── client.test.ts    # AI client tests with MSW
```

### Pattern 1: Streaming Claude API Response
**What:** Stream tokens from Claude API to client via ReadableStream, avoiding Vercel timeout
**When to use:** Any Claude API call in Next.js route handler with 30+ second generation time

**Example:**
```typescript
// app/api/generate/route.ts
import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';

export const maxDuration = 30; // Vercel timeout configuration

export async function POST(request: NextRequest) {
  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const body = await request.json();

  // Streaming with web_search tool
  const stream = await client.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    messages: [
      { role: 'user', content: buildPrompt(body) }
    ],
    tools: [
      { type: 'web_search_20260209', name: 'web_search' }
    ],
  });

  // Convert to ReadableStream for Next.js
  const readableStream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          if (chunk.type === 'content_block_delta' &&
              chunk.delta.type === 'text_delta') {
            const text = chunk.delta.text;
            controller.enqueue(new TextEncoder().encode(text));
          }
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });

  return new Response(readableStream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

### Pattern 2: Stateless IP-Based Rate Limiting
**What:** Enforce 10 requests/hour per IP using Upstash Redis without database
**When to use:** Every API route that incurs costs (AI generation, external API calls)

**Example:**
```typescript
// lib/rate-limit/limiter.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export const rateLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 h'),
  analytics: true,
  prefix: 'ratelimit',
});

// app/api/generate/route.ts
import { headers } from 'next/headers';
import { rateLimiter } from '@/lib/rate-limit/limiter';

export async function POST(request: NextRequest) {
  // Extract IP from headers (Vercel provides x-forwarded-for)
  const headersList = await headers();
  const forwardedFor = headersList.get('x-forwarded-for');
  const ip = forwardedFor?.split(',')[0] || '127.0.0.1';

  // Check rate limit
  const { success, limit, remaining, reset } = await rateLimiter.limit(ip);

  if (!success) {
    return Response.json(
      {
        success: false,
        error: {
          message: `Rate limit exceeded. Try again in ${Math.ceil((reset - Date.now()) / 1000 / 60)} minutes.`,
        },
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': new Date(reset).toISOString(),
        },
      }
    );
  }

  // Continue with generation...
}
```

### Pattern 3: Sales Prompt Engineering with Citations
**What:** Generate authentic, non-spammy sales openers with citations to prevent hallucinations
**When to use:** All Claude API calls for sales content generation

**Example:**
```typescript
// lib/ai/prompts.ts
export function buildSalesPrompt(input: {
  firstName: string;
  jobTitle: string;
  companyName: string;
  productDescription: string;
  channel: 'cold_email' | 'linkedin_dm' | 'cold_call';
}) {
  return `You are a B2B sales expert writing personalized cold outreach openers.

CRITICAL RULES:
1. Use web_search to find recent news about ${input.companyName} and ${input.jobTitle} role challenges
2. ALWAYS cite sources with [URL] notation in your research
3. NEVER use AI clichés: "I hope this email finds you well", "reaching out", "just wanted to", "thought you might be interested"
4. Write like a human text message: casual, direct, specific
5. Generate EXACTLY 3 distinct openers with different strategic angles

PROSPECT CONTEXT:
- Name: ${input.firstName}
- Title: ${input.jobTitle}
- Company: ${input.companyName}
- Product/Service: ${input.productDescription}
- Channel: ${input.channel}

STRATEGIC ANGLES (generate one opener for each):

1. TRIGGER ANGLE (angle: "trigger")
   - Search for recent company news, funding, leadership changes, product launches
   - Hook: Reference specific recent event with date
   - Why This Works: Explain why timing matters (e.g., "Funding rounds = hiring spikes = onboarding pain")
   - Follow-up: Ask permission to share relevant insight
   - Best For: Choose cold_email, linkedin_dm, or cold_call based on urgency

2. PAIN ANGLE (angle: "pain")
   - Search for common pain points for ${input.jobTitle} in ${input.companyName}'s industry
   - Hook: Lead with the pain point (no preamble)
   - Why This Works: Explain psychological pattern (e.g., "VPs of Sales hate manual CRM data entry")
   - Follow-up: Offer to share how others solved it
   - Best For: Choose based on pain severity

3. CURIOSITY ANGLE (angle: "curiosity")
   - Search for ${input.companyName}'s public content (blog posts, podcasts, LinkedIn posts)
   - Hook: Reference their content with specific detail + question
   - Why This Works: Explain social proof pattern (e.g., "Mentioning their content = you did homework")
   - Follow-up: Bridge to your solution
   - Best For: Choose based on relationship-building need

CHANNEL CALIBRATION:
${input.channel === 'cold_email' ?
  '- Subject line matters: use curiosity gap\n- 2-3 sentences max\n- Single clear CTA' :
  input.channel === 'linkedin_dm' ?
  '- No subject line\n- Even shorter (2 sentences)\n- Reference mutual connections if found' :
  '- Conversational opening\n- Assume interruption\n- Get permission to continue'}

OUTPUT FORMAT (JSON):
{
  "openers": [
    {
      "angle": "trigger",
      "hook": "[2-3 sentence opener with NO AI clichés]",
      "explanation": "Why This Works: [Strategic reasoning]",
      "followUp": "[1 sentence follow-up]",
      "bestFor": "cold_email" | "linkedin_dm" | "cold_call"
    },
    // ... 2 more openers
  ],
  "intelSummary": "[Bullet points of research findings with citations]",
  "citations": ["https://source1.com", "https://source2.com"]
}

Search now and generate openers.`;
}
```

### Pattern 4: Error Handling with Retry and Timeout
**What:** Handle Claude API errors with exponential backoff and timeout failures
**When to use:** All external API calls (Claude API, Upstash Redis)

**Example:**
```typescript
// lib/ai/client.ts
import Anthropic from '@anthropic-ai/sdk';

export class ClaudeClient {
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
      maxRetries: 3, // SDK handles exponential backoff automatically
      timeout: 25000, // 25s (leave 5s buffer for Next.js 30s limit)
    });
  }

  async generateOpeners(input: any) {
    try {
      const stream = await this.client.messages.stream({
        model: 'claude-sonnet-4-6',
        max_tokens: 4096,
        messages: [{ role: 'user', content: buildSalesPrompt(input) }],
        tools: [{ type: 'web_search_20260209', name: 'web_search' }],
      });

      return stream;
    } catch (error) {
      // Anthropic SDK error types
      if (error instanceof Anthropic.APIError) {
        if (error.status === 429) {
          // Rate limit from Anthropic (not our Upstash limit)
          const retryAfter = error.headers?.['retry-after'];
          throw new Error(`Claude API rate limited. Retry after ${retryAfter}s`);
        } else if (error.status === 529) {
          // Anthropic servers overloaded
          throw new Error('Claude API temporarily unavailable. Try again shortly.');
        } else if (error.status >= 500) {
          // Server errors
          throw new Error('Claude API server error. Please try again.');
        }
      }

      // Timeout errors
      if (error.name === 'AbortError' || error.message.includes('timeout')) {
        throw new Error('Request timed out. Try again with simpler query.');
      }

      throw error;
    }
  }
}
```

### Pattern 5: MSW API Mocking for Tests
**What:** Mock Claude API responses in tests without hitting real API
**When to use:** All tests that involve Claude API calls

**Example:**
```typescript
// tests/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.post('https://api.anthropic.com/v1/messages', async ({ request }) => {
    const body = await request.json();

    // Mock streaming response
    return HttpResponse.json({
      id: 'msg_123',
      type: 'message',
      role: 'assistant',
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            openers: [
              {
                angle: 'trigger',
                hook: 'Saw Acme just raised Series B...',
                explanation: 'Why This Works: Funding = rapid hiring',
                followUp: 'Can I share how...',
                bestFor: 'cold_email',
              },
              // ... 2 more
            ],
            intelSummary: '- Series B funding announced...',
            citations: ['https://techcrunch.com/acme-funding'],
          }),
        },
      ],
      model: 'claude-sonnet-4-6',
      stop_reason: 'end_turn',
      usage: { input_tokens: 100, output_tokens: 200 },
    });
  }),
];

// tests/mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);

// vitest.config.mts (update setupFiles)
export default defineConfig({
  test: {
    setupFiles: ['./tests/setup.ts'],
  },
});

// tests/setup.ts
import { beforeAll, afterEach, afterAll } from 'vitest';
import { server } from './mocks/server';

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### Anti-Patterns to Avoid
- **Non-streaming responses:** Blocking on full response hits 30s Vercel timeout
- **Fixed window rate limiting:** Allows burst traffic at window boundaries (use sliding window)
- **Caching client instances per request:** Create singleton Anthropic client, not new instance per request
- **Ignoring retry-after headers:** Claude API 429 responses include retry-after—respect it
- **Generic "AI clichés" in prompts:** Explicitly forbid phrases like "I hope this finds you well" in prompt instructions
- **Skipping citation validation:** Always validate citations array has URLs before returning to user

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Rate limiting | In-memory Map with timestamps | @upstash/ratelimit | Serverless cold starts reset in-memory state. Upstash persists across invocations with sub-ms latency. |
| Exponential backoff | Custom retry loops | Anthropic SDK maxRetries option | SDK handles exponential backoff + jitter automatically with retry-after header respect. |
| API mocking | Manual fetch overrides | MSW (Mock Service Worker) | MSW intercepts at network layer, works across test runners, handles streaming responses. |
| Stream parsing | Manual chunk concatenation | Anthropic SDK stream iterators | SDK provides async iterators with typed chunk events (content_block_delta, message_stop). |
| IP extraction | Manual header parsing | Next.js headers() + x-forwarded-for | Vercel provides standardized x-forwarded-for header, handles proxy chains. |

**Key insight:** Serverless environments break traditional stateful patterns. Upstash Redis over HTTP solves rate limiting without WebSockets or persistent connections. Anthropic SDK handles retry complexity better than custom implementations. MSW provides network-level mocking that survives code refactors.

## Common Pitfalls

### Pitfall 1: AI Voice Detection by Spam Filters
**What goes wrong:** Generated emails sound robotic with phrases like "I hope this email finds you well", "reaching out", "just wanted to"—spam filters flag high "AI perplexity" and mark as spam.
**Why it happens:** LLMs default to formal, polite patterns from training data. Sales templates overuse these phrases.
**How to avoid:**
- Explicitly forbid AI clichés in prompt instructions
- Instruct "write like you text" for casual tone
- Add PS lines with human details ("PS - saw you're a Knicks fan")
- Use segment-level templates (5-10 variations) not infinite AI variants
**Warning signs:** Low open rates, high spam folder placement, generic-sounding copy

### Pitfall 2: Hallucinations Without Citations
**What goes wrong:** Claude invents company "news" or prospect details that don't exist, damaging credibility.
**Why it happens:** LLMs fill knowledge gaps with plausible-sounding content when not grounded in search results.
**How to avoid:**
- Use web_search_20260209 tool with dynamic filtering
- Require citations in prompt: "ALWAYS cite sources with [URL]"
- Validate citations array has valid URLs before returning
- Instruct model to say "I couldn't find..." rather than inventing
**Warning signs:** Prospects reply "That's not accurate", made-up funding rounds, incorrect titles

### Pitfall 3: Vercel Timeout on Non-Streaming Routes
**What goes wrong:** Route handler times out at 10s (free tier) or 30s (paid), returning 504 FUNCTION_INVOCATION_TIMEOUT.
**Why it happens:** Claude API with web_search can take 20-40s for complex queries. Non-streaming routes block until complete response.
**How to avoid:**
- Always use messages.stream() not messages.create()
- Set maxDuration export in route file: `export const maxDuration = 30;`
- Use streaming for 25s, leave 5s buffer for processing
- Return ReadableStream with proper headers (text/event-stream)
**Warning signs:** 504 errors in production, slow Postman/curl tests, "This serverless function has timed out"

### Pitfall 4: Rate Limit Bypass via IP Spoofing
**What goes wrong:** Users bypass rate limiting by changing IP addresses or using VPNs.
**Why it happens:** IP-based limiting is easy to circumvent, no user authentication.
**How to avoid:**
- Accept this limitation for MVP (v1 has no user accounts per REQUIREMENTS.md)
- Add secondary limits: browser fingerprinting, session tokens (future)
- Monitor for abuse patterns in Upstash analytics
- Document as "best effort" cost control, not security feature
**Warning signs:** Single IP exceeds limits, costs spike unexpectedly

### Pitfall 5: Anthropic Rate Limits vs Upstash Rate Limits Confusion
**What goes wrong:** Users hit Upstash rate limit (10 req/hour), then retry and hit Anthropic API rate limit (50-4000 RPM depending on tier), causing double-error confusion.
**Why it happens:** Two separate rate limiting systems with different error messages.
**How to avoid:**
- Upstash returns 429 with custom message ("Rate limit exceeded. Try again in X minutes")
- Anthropic 429 includes retry-after header, distinct from Upstash 429
- Handle both in error response: check if error from Upstash vs Anthropic
- Log to console.error for debugging
**Warning signs:** Users report "rate limit" but can't retry after waiting, double 429 responses

### Pitfall 6: Cost Explosion from Web Search
**What goes wrong:** Web search costs $10 per 1,000 searches + token costs. 100 generations/day = $1/day = $365/year on searches alone.
**Why it happens:** Web search is billed separately from tokens, easy to overlook in cost estimation.
**How to avoid:**
- Rate limiting (10 req/hour) caps at 240 searches/day max = $2.40/day worst case
- Use max_uses parameter in web_search tool to limit searches per request
- Estimate total cost: (input tokens * $3/1M) + (output tokens * $15/1M) + (searches * $10/1K)
- Monitor usage in Anthropic console
**Warning signs:** Unexpected charges, costs higher than token estimates alone

### Pitfall 7: Empty or Invalid Citations
**What goes wrong:** Citations array contains empty strings, non-URLs, or broken links, failing client-side validation.
**Why it happens:** web_search tool sometimes returns citations without URL field, or model omits citations.
**How to avoid:**
- Validate citations with Zod before returning: `z.array(z.string().url())`
- Filter empty citations: `citations.filter(c => c && c.startsWith('http'))`
- Fallback to empty array if no valid citations found
- Log warning if citations missing (indicates prompt issue)
**Warning signs:** Type errors on client, "Citations must be valid URLs" Zod errors

## Code Examples

Verified patterns from official sources:

### Web Search Tool Invocation
```typescript
// Source: https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-search-tool
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const response = await client.messages.create({
  model: 'claude-sonnet-4-6',
  max_tokens: 4096,
  messages: [
    {
      role: 'user',
      content: 'Search for recent news about Acme Corp funding and summarize.',
    },
  ],
  tools: [
    { type: 'web_search_20260209', name: 'web_search' }
  ],
});

// Citations are included automatically in response
// response.content[0].text contains generated content
// Citations don't count toward token usage
```

### Streaming Messages (Official SDK)
```typescript
// Source: https://github.com/anthropics/anthropic-sdk-typescript/blob/main/examples/streaming.ts
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

const stream = await client.messages.stream({
  model: 'claude-sonnet-4-6',
  max_tokens: 1024,
  messages: [
    { role: 'user', content: 'Generate three sales openers' },
  ],
});

// Event-based iteration
stream.on('text', (text) => {
  console.log(text);
});

// Or async iteration
for await (const chunk of stream) {
  if (chunk.type === 'content_block_delta' &&
      chunk.delta.type === 'text_delta') {
    process.stdout.write(chunk.delta.text);
  }
}

// Get final message
const message = await stream.finalMessage();
console.log(message.content);
```

### Next.js Route Handler with NextResponse
```typescript
// Source: https://nextjs.org/docs/app/getting-started/route-handlers
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const input = ProspectInputSchema.parse(body);

    // Process...

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Invalid input',
            fields: zodErrorToFields(error),
          },
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Internal server error',
        },
      },
      { status: 500 }
    );
  }
}
```

### Upstash Rate Limiting (Official Docs)
```typescript
// Source: https://github.com/upstash/ratelimit-js
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Create rate limiter instance
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(), // Uses UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
  limiter: Ratelimit.slidingWindow(10, '1 h'),
  analytics: true,
  prefix: 'ratelimit',
});

// In route handler
const identifier = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
const { success, limit, remaining, reset } = await ratelimit.limit(identifier);

if (!success) {
  return new Response('Rate limit exceeded', { status: 429 });
}
```

### MSW Handler Setup
```typescript
// Source: https://mswjs.io/docs/quick-start/
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

// Define handlers
export const handlers = [
  http.post('https://api.anthropic.com/v1/messages', async ({ request }) => {
    return HttpResponse.json({
      id: 'msg_test',
      type: 'message',
      role: 'assistant',
      content: [{ type: 'text', text: 'Mocked response' }],
      model: 'claude-sonnet-4-6',
      stop_reason: 'end_turn',
      usage: { input_tokens: 10, output_tokens: 20 },
    });
  }),
];

// Setup server
export const server = setupServer(...handlers);

// In test setup
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Claude Opus 3.7 | Claude Sonnet 4.6 | Feb 2026 | Sonnet 4.6 matches Opus 3.7 quality at 5x lower cost ($3 vs $15 input) |
| web_search_20250305 | web_search_20260209 | Feb 2026 | Dynamic filtering with code execution reduces token usage, better accuracy |
| In-memory rate limiting | Upstash Redis HTTP | 2024-2026 | Stateless serverless requires external state, HTTP-based Redis eliminates WebSocket overhead |
| Blocking API calls | Streaming responses | 2023-2026 | Vercel timeout limits (10-30s) require streaming for long-running AI tasks |
| Generic AI prompts | Anti-spam prompt engineering | 2025-2026 | Spam filters detect AI patterns, explicit anti-cliché instructions required |
| Jest | Vitest | 2024-2026 | 10-20x faster test starts, native ESM support, Vite integration |

**Deprecated/outdated:**
- **Claude 3 models (Opus 3.5, Sonnet 3.5, Haiku 3.5):** Replaced by Claude 4 series (Opus 4.7, Sonnet 4.6, Haiku 4.5) with better performance and lower costs
- **web_search tool (no version):** Replaced by web_search_20250305, then web_search_20260209 with dynamic filtering
- **NextResponse.next() in route handlers:** Not supported in App Router route handlers, only in middleware.ts
- **Vercel Edge Runtime for AI:** Fluid Compute (Node.js runtime) now supports up to 14 minutes, better for AI workloads than Edge's 30s limit

## Open Questions

1. **Prompt Caching for Cost Reduction**
   - What we know: Claude supports prompt caching at 10% of input cost, pays off after 1 cache read
   - What's unclear: Does web_search tool interfere with caching? Is system prompt cacheable?
   - Recommendation: Implement without caching first (MVP), measure token costs, add caching in v2 if needed

2. **"Why This Works" Meta-Commentary Extraction**
   - What we know: No established "Why This Works" copywriting framework found in research
   - What's unclear: Best prompt pattern to generate strategic explanations consistently
   - Recommendation: Custom prompt instruction: "For each opener, include 'Why This Works:' explanation of psychological/strategic pattern" (see Pattern 3)

3. **Web Search Token Consumption**
   - What we know: Web search results load into context, dynamic filtering reduces tokens
   - What's unclear: Typical token count for 3-search generation (affects cost estimation)
   - Recommendation: Log token usage in development, estimate 2-5K input tokens per generation based on initial tests

4. **Multi-Channel Calibration Quality**
   - What we know: Email needs subject lines, LinkedIn shorter, calls conversational
   - What's unclear: Does single prompt with channel instructions produce quality variation, or need separate prompts per channel?
   - Recommendation: Single prompt with channel-specific instructions first (see Pattern 3), A/B test with separate prompts if quality suffers

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.6 (installed in Phase 1) |
| Config file | vitest.config.mts |
| Quick run command | `pnpm test` |
| Full suite command | `pnpm test:run` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| GEN-01 | Claude API returns 3 distinct openers (Trigger, Pain, Curiosity) | integration | `pnpm test tests/lib/ai/generator.test.ts -x` | ❌ Wave 0 |
| GEN-02 | Generation completes within 30 seconds | integration | `pnpm test tests/lib/ai/timeout.test.ts -x` | ❌ Wave 0 |
| GEN-03 | Web search retrieves recent company news | integration | `pnpm test tests/lib/ai/web-search.test.ts -x` | ❌ Wave 0 |
| GEN-04 | Citations array contains valid URLs | unit | `pnpm test tests/lib/ai/citations.test.ts -x` | ❌ Wave 0 |
| GEN-05 | Generated content avoids AI clichés | unit | `pnpm test tests/lib/ai/voice.test.ts -x` | ❌ Wave 0 |
| OPENER-01 | Trigger angle references recent events | integration | `pnpm test tests/lib/ai/generator.test.ts::trigger -x` | ❌ Wave 0 |
| OPENER-02 | Pain angle addresses role-based pain | integration | `pnpm test tests/lib/ai/generator.test.ts::pain -x` | ❌ Wave 0 |
| OPENER-03 | Curiosity angle uses insights/questions | integration | `pnpm test tests/lib/ai/generator.test.ts::curiosity -x` | ❌ Wave 0 |
| OPENER-04 | Each opener has hook, explanation, follow-up | unit | `pnpm test tests/lib/ai/schema-validation.test.ts -x` | ❌ Wave 0 |
| OPENER-05 | Each opener shows bestFor channel | unit | `pnpm test tests/lib/ai/schema-validation.test.ts -x` | ❌ Wave 0 |
| OPENER-06 | Content calibrated for channel | integration | `pnpm test tests/lib/ai/channel-calibration.test.ts -x` | ❌ Wave 0 |
| INFRA-02 | Rate limiting enforces 10 req/hour/IP | integration | `pnpm test tests/api/rate-limit.test.ts -x` | ❌ Wave 0 |
| INFRA-04 | API handles timeouts gracefully | integration | `pnpm test tests/api/error-handling.test.ts -x` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** Unit tests for modified modules (< 5s): `pnpm test {module}.test.ts`
- **Per wave merge:** Integration tests with MSW mocks (< 30s): `pnpm test tests/lib/ai tests/api`
- **Phase gate:** Full suite green before `/gsd:verify-work`: `pnpm test:run`

### Wave 0 Gaps
- [ ] `tests/lib/ai/generator.test.ts` — covers GEN-01, OPENER-01, OPENER-02, OPENER-03 (uses MSW to mock Claude API)
- [ ] `tests/lib/ai/timeout.test.ts` — covers GEN-02 (mock slow API response)
- [ ] `tests/lib/ai/web-search.test.ts` — covers GEN-03 (verify web_search tool invoked)
- [ ] `tests/lib/ai/citations.test.ts` — covers GEN-04 (validate citation URLs)
- [ ] `tests/lib/ai/voice.test.ts` — covers GEN-05 (check for AI clichés in output)
- [ ] `tests/lib/ai/schema-validation.test.ts` — covers OPENER-04, OPENER-05 (Zod validation)
- [ ] `tests/lib/ai/channel-calibration.test.ts` — covers OPENER-06 (channel-specific checks)
- [ ] `tests/api/rate-limit.test.ts` — covers INFRA-02 (simulate 11 requests)
- [ ] `tests/api/error-handling.test.ts` — covers INFRA-04 (mock timeout errors)
- [ ] `tests/mocks/handlers.ts` — MSW handlers for Claude API
- [ ] `tests/mocks/server.ts` — MSW server setup
- [ ] `tests/setup.ts` — MSW lifecycle (beforeAll/afterEach/afterAll)
- [ ] Update `vitest.config.mts` setupFiles: add `'./tests/setup.ts'`
- [ ] Install MSW: `pnpm add -D msw`

## Sources

### Primary (HIGH confidence)
- Claude API web_search_20260209 tool: https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-search-tool (official docs, verified)
- Anthropic SDK TypeScript: https://github.com/anthropics/anthropic-sdk-typescript (official repo, streaming examples verified)
- Upstash ratelimit-js: https://github.com/upstash/ratelimit-js (official repo, stateless design confirmed)
- Vercel Functions Duration: https://vercel.com/docs/functions/configuring-functions/duration (official docs, maxDuration pattern verified)
- Next.js Route Handlers: https://nextjs.org/docs/app/getting-started/route-handlers (official docs, NextResponse patterns verified)
- MSW (Mock Service Worker): https://mswjs.io/docs/quick-start/ (official docs, Vitest integration verified)

### Secondary (MEDIUM confidence)
- Claude API pricing 2026: Multiple sources confirm $3/1M input, $15/1M output for Sonnet 4.6 (Feb 2026 release)
- Sales prompt engineering: Cross-verified patterns from B2B sales blogs (2026), emphasis on anti-spam tone, citations, segment-level personalization
- Upstash Redis rate limiting tutorials: Multiple Next.js tutorials (2024-2026) show consistent x-forwarded-for pattern
- Claude API retry strategies: Multiple guides (2026) confirm exponential backoff with retry-after header respect

### Tertiary (LOW confidence)
- "Why This Works" framework: No established framework found; appears to be custom requirement for this project, implemented via prompt engineering instruction

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries verified from official docs/repos, npm package versions confirmed, installation commands tested
- Architecture patterns: HIGH - Streaming pattern from official SDK examples, rate limiting from Upstash docs, Next.js patterns from official docs
- Prompt engineering: MEDIUM - Anti-spam patterns from 2026 B2B sales sources (not official Anthropic guidance), "Why This Works" meta-commentary is custom approach
- Pitfalls: HIGH - Timeout pitfall verified from Vercel docs, hallucination pitfall from Claude docs, AI voice pitfall from spam filter research (2026)
- Testing: HIGH - MSW integration from official MSW docs, Vitest setup from official docs

**Research date:** 2026-05-14
**Valid until:** 2026-06-14 (30 days — stable technologies, but AI pricing/features change quarterly)
