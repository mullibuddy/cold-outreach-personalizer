# Architecture Research

**Domain:** AI-Powered Sales Outreach Tools with Web Search
**Researched:** 2026-05-13
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      PRESENTATION LAYER                      │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │  Form   │  │ Loading │  │ Results │  │  Copy   │        │
│  │  Input  │  │  State  │  │  Cards  │  │ Actions │        │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘        │
│       │            │            │            │              │
│       └────────────┴────────────┴────────────┘              │
│                      │                                       │
│              React Components                                │
│              (Client Components)                             │
│                                                              │
├──────────────────────┬───────────────────────────────────────┤
│                 API LAYER                                    │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐    │
│  │            Route Handler (POST /api/generate)       │    │
│  │                                                      │    │
│  │  ┌───────────┐  ┌───────────┐  ┌──────────────┐    │    │
│  │  │ Validate  │→ │ Transform │→ │   Execute    │    │    │
│  │  │  Input    │  │  Request  │  │   AI Call    │    │    │
│  │  └───────────┘  └───────────┘  └──────┬───────┘    │    │
│  │                                        │            │    │
│  │  ┌───────────┐  ┌───────────┐        │            │    │
│  │  │  Format   │← │   Parse   │←───────┘            │    │
│  │  │ Response  │  │  AI Output│                      │    │
│  │  └─────┬─────┘  └───────────┘                      │    │
│  └────────┼────────────────────────────────────────────┘    │
│           │                                                  │
├───────────┴──────────────────────────────────────────────────┤
│                    SERVICE LAYER                             │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │    Prompt    │  │   Claude     │  │   Response   │      │
│  │  Generator   │  │   Client     │  │   Parser     │      │
│  └──────────────┘  └──────┬───────┘  └──────────────┘      │
│                           │                                  │
├───────────────────────────┴──────────────────────────────────┤
│                   EXTERNAL SERVICES                          │
│  ┌────────────────────────────────────────────────────┐     │
│  │              Anthropic Claude API                   │     │
│  │         (claude-sonnet-4-20250514)                 │     │
│  │                                                     │     │
│  │   ┌─────────────────┐   ┌──────────────────┐      │     │
│  │   │  Messages API   │   │   web_search     │      │     │
│  │   │                 │───│   (Server Tool)  │      │     │
│  │   └─────────────────┘   └──────────────────┘      │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| **Form Input** | Capture prospect details (name, title, company, product, channel) | React controlled components with Tailwind styling |
| **Route Handler** | Validate request, orchestrate AI call, format response | Next.js Route Handler (`app/api/generate/route.ts`) |
| **Prompt Generator** | Construct system and user prompts for Claude with angle-specific instructions | TypeScript service with template literals |
| **Claude Client** | Manage API connection, handle web search tool, process responses | Anthropic SDK with tool use configuration |
| **Response Parser** | Extract structured output (3 angles with hooks, explanations, follow-ups) | TypeScript with type-safe parsing |
| **Results Display** | Render 3 personalized openers with copy functionality | React components with clipboard API |

## Recommended Project Structure

```
app/
├── api/
│   └── generate/
│       └── route.ts           # POST handler for AI generation
├── components/
│   ├── form/
│   │   ├── ProspectForm.tsx   # Main input form
│   │   └── ChannelSelect.tsx  # Channel picker (Email/LinkedIn/Call)
│   ├── results/
│   │   ├── OpenerCard.tsx     # Individual angle card
│   │   ├── CopyButton.tsx     # Copy to clipboard with feedback
│   │   └── IntelSummary.tsx   # Collapsible research bullets
│   └── ui/
│       ├── LoadingSpinner.tsx # Simple spinner + "Generating..."
│       └── ErrorMessage.tsx   # Error display with retry
├── lib/
│   ├── ai/
│   │   ├── claude-client.ts   # Claude API configuration
│   │   ├── prompts.ts         # Prompt templates
│   │   └── types.ts           # TypeScript types for AI I/O
│   ├── validation/
│   │   └── schemas.ts         # Zod schemas for input validation
│   └── utils/
│       └── formatters.ts      # Text formatting utilities
├── types/
│   └── index.ts               # Shared TypeScript types
└── page.tsx                   # Main landing page
```

### Structure Rationale

- **`api/generate/`:** Single Route Handler follows Next.js App Router convention for API endpoints. Stateless design means no database layer needed.
- **`components/`:** Organized by feature (form, results, ui) rather than by type. Aligns with domain concepts (prospect input vs. generated output).
- **`lib/ai/`:** Isolates all AI-specific logic. Makes it easy to swap providers or add additional AI features later. Prompt engineering logic separate from API client.
- **`lib/validation/`:** Centralizes Zod schemas used in both client-side and server-side validation. Security-first approach validates all inputs at API boundary.
- **`types/`:** Shared types ensure consistency between client components, API handlers, and AI service layer.

## Architectural Patterns

### Pattern 1: Stateless Request-Response with Server-Side AI

**What:** Client submits form → API Route Handler validates → calls Claude with web search → returns complete response → client renders. No database, no sessions, no state persistence.

**When to use:** MVP products, tools where each request is independent, when you want zero infrastructure overhead and instant deployment.

**Trade-offs:**
- **Pros:** Simplest architecture, no database costs, easy to deploy on Vercel, scales automatically, no user management complexity
- **Cons:** No history/analytics without external logging, users lose data on refresh, can't implement features like "save favorites" without adding storage later

**Example:**
```typescript
// app/api/generate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generateOpeners } from '@/lib/ai/claude-client';
import { prospectInputSchema } from '@/lib/validation/schemas';

export async function POST(request: NextRequest) {
  try {
    // Parse and validate input
    const body = await request.json();
    const input = prospectInputSchema.parse(body);

    // Call AI service (this is where web search happens)
    const result = await generateOpeners(input);

    // Return formatted response
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    // Return errors as data, not thrown exceptions
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Generation failed' },
      { status: 500 }
    );
  }
}
```

### Pattern 2: Server-Side Tool Use (Claude Web Search)

**What:** Claude API executes web search as a server-side tool. Your application doesn't handle search API calls—Anthropic's infrastructure does. You configure tool parameters and receive enriched results with citations.

**When to use:** When AI needs current information (company news, recent events, prospect's public content). Standard pattern for RAG-enhanced generation without building your own retrieval system.

**Trade-offs:**
- **Pros:** No need to integrate Google/Bing APIs, automatic citation handling, Anthropic handles search quality and filtering, single API call handles both search and generation
- **Cons:** Less control over search providers, costs $10/1000 requests (on top of message API costs), can't customize ranking algorithms, search results are opaque (encrypted content in response)

**Example:**
```typescript
// lib/ai/claude-client.ts
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function generateOpeners(input: ProspectInput) {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    tools: [
      {
        type: 'web_search_20260209', // Latest version with dynamic filtering
        max_uses: 5, // Limit searches to control costs
        allowed_domains: [], // Optional: restrict to specific sources
        blocked_domains: [], // Optional: exclude domains
      }
    ],
    messages: [
      {
        role: 'user',
        content: buildPrompt(input),
      }
    ],
  });

  return parseResponse(response);
}
```

### Pattern 3: Structured Output with Type-Safe Parsing

**What:** Use TypeScript types + Zod schemas to enforce structure from user input through AI response parsing. Validate at every boundary: client → API, API → AI service, AI response → client.

**When to use:** Always. Production apps need predictable data shapes. Prevents runtime errors from malformed AI outputs or user inputs.

**Trade-offs:**
- **Pros:** Catch errors early, better IDE autocomplete, self-documenting code, easier refactoring, production-ready error handling
- **Cons:** More upfront code, need to maintain types alongside schemas (can be mitigated with Zod inference)

**Example:**
```typescript
// lib/validation/schemas.ts
import { z } from 'zod';

export const prospectInputSchema = z.object({
  firstName: z.string().min(1, 'First name required'),
  title: z.string().min(1, 'Title required'),
  company: z.string().min(1, 'Company required'),
  productDescription: z.string().min(10, 'Describe your product (min 10 chars)'),
  channel: z.enum(['email', 'linkedin', 'call']),
});

export type ProspectInput = z.infer<typeof prospectInputSchema>;

export const openerSchema = z.object({
  angle: z.enum(['trigger', 'pain', 'curiosity']),
  hook: z.string(),
  whyThisWorks: z.string(),
  followUp: z.string(),
  recommendedChannel: z.enum(['email', 'linkedin', 'call']),
});

export const generationResultSchema = z.object({
  openers: z.array(openerSchema).length(3),
  intelSummary: z.array(z.string()).min(3).max(4),
  citations: z.array(z.object({
    url: z.string().url(),
    title: z.string(),
  })).optional(),
});

export type GenerationResult = z.infer<typeof generationResultSchema>;
```

### Pattern 4: Error-as-Data (Not Exceptions)

**What:** API handlers return structured error objects in responses rather than throwing exceptions. Client components check `success` flag and handle errors in UI.

**When to use:** All Next.js Route Handlers and Server Actions. React 19's `useActionState` hook is designed for this pattern.

**Trade-offs:**
- **Pros:** More predictable error handling, better UX (can show field-level errors), easier to test, aligns with React 19 patterns
- **Cons:** Slightly more verbose than try/catch everywhere, requires disciplined return type design

**Example:**
```typescript
// lib/ai/claude-client.ts
type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string };

export async function generateOpeners(
  input: ProspectInput
): Promise<Result<GenerationResult>> {
  try {
    const response = await client.messages.create({...});
    const parsed = generationResultSchema.parse(parseResponse(response));
    return { success: true, data: parsed };
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      return {
        success: false,
        error: 'AI service unavailable',
        code: 'AI_ERROR'
      };
    }
    return {
      success: false,
      error: 'Generation failed',
      code: 'UNKNOWN_ERROR'
    };
  }
}

// app/api/generate/route.ts
export async function POST(request: NextRequest) {
  const body = await request.json();
  const input = prospectInputSchema.safeParse(body);

  if (!input.success) {
    return NextResponse.json(
      { success: false, error: 'Invalid input', details: input.error.errors },
      { status: 400 }
    );
  }

  const result = await generateOpeners(input.data);

  if (!result.success) {
    return NextResponse.json(result, { status: 500 });
  }

  return NextResponse.json(result, { status: 200 });
}
```

## Data Flow

### Request Flow

```
User fills form
    ↓
Client validates (basic)
    ↓
POST /api/generate
    ↓
Route Handler: Validate with Zod schema
    ↓
Service Layer: Build prompt with prospect context
    ↓
Claude API: Messages API + web_search tool
    ↓
    ├→ Claude decides: "I need current company news"
    ├→ Server-side search executes (Anthropic infrastructure)
    ├→ Results returned to Claude's context
    └→ Claude generates 3 openers using search intel
    ↓
Service Layer: Parse and validate AI response
    ↓
Route Handler: Return formatted JSON
    ↓
Client: Render results, enable copy actions
```

### AI Generation Flow (Detailed)

```
Prospect Input (name, title, company, product, channel)
    ↓
Prompt Generator constructs:
    ├─ System prompt: "You are a sales copywriter specializing in cold outreach..."
    ├─ User prompt: "Generate 3 openers for [prospect] at [company]..."
    └─ Instructions: Trigger/Pain/Curiosity angles, format requirements
    ↓
Claude API receives:
    ├─ messages: [{ role: 'user', content: prompt }]
    ├─ tools: [{ type: 'web_search_20260209', max_uses: 5 }]
    └─ model: 'claude-sonnet-4-20250514'
    ↓
Claude reasoning:
    ├─ "I need recent news about [company]" → invokes web_search
    ├─ Receives search results with URLs, titles, encrypted_content
    ├─ "I need info about [prospect's role]" → invokes web_search
    ├─ Receives role-specific pain points and trends
    └─ Synthesizes 3 distinct openers using found intel
    ↓
API Response contains:
    ├─ content: [{ type: 'text', text: '...' }]
    ├─ citations: [{ url, title, cited_text }]
    └─ stop_reason: 'end_turn'
    ↓
Response Parser extracts:
    ├─ 3 openers (hook, explanation, follow-up per angle)
    ├─ Intel summary bullets
    └─ Citation links
    ↓
Validation: Zod schema ensures structure
    ↓
Return to client → Render
```

### State Management

This application uses **minimal client state** since it's stateless:

```
Form State (Client Component)
    ├─ Controlled inputs (firstName, title, company, etc.)
    ├─ Loading boolean (true during API call)
    └─ Error state (null | { message: string })
    ↓
Submit → API Call → Response
    ↓
Results State (Client Component)
    ├─ Openers array (3 items)
    ├─ Intel summary
    ├─ Citations
    └─ Copy feedback ("Copied!" per card)
```

**No global state management needed.** React's `useState` at component level is sufficient because:
- No multi-page navigation with shared state
- No real-time updates
- No collaborative features
- Each session is independent

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| **0-1k users/month** | Current architecture is perfect. Vercel serverless functions handle this easily. No changes needed. |
| **1k-10k users/month** | Add basic monitoring (Vercel Analytics or Sentry). Consider caching common prompts if patterns emerge. Monitor Claude API costs ($10/1000 web search requests + message costs). |
| **10k-100k users/month** | Implement rate limiting per IP to prevent abuse. Add request logging to identify expensive queries. Consider prompt optimization to reduce token usage. May need database for analytics (but keep core flow stateless). |
| **100k+ users/month** | Add Redis for rate limiting. Implement request queuing if API limits are hit. Consider caching search results for identical company/prospect combos (24-hour TTL). Add CDN caching for static assets. Monitor and optimize prompt token usage aggressively. |

### Scaling Priorities

1. **First bottleneck: Claude API costs**
   - **What breaks:** At scale, web search costs ($10/1000) + message costs add up quickly
   - **How to fix:**
     - Optimize prompts to reduce tokens
     - Cache search results for identical company queries (short TTL)
     - Reduce `max_uses` for web search tool if overkill
     - Consider tiered access (free users get 1 angle, paid users get 3)

2. **Second bottleneck: Rate limiting**
   - **What breaks:** Anthropic API has rate limits. Spam/abuse can exhaust limits.
   - **How to fix:**
     - Implement per-IP rate limiting (10 requests/hour for free tier)
     - Add CAPTCHA or turnstile for suspicious patterns
     - Queue requests if approaching limits
     - Monitor with observability tools (Vercel Analytics, Sentry)

3. **Third bottleneck: Response time**
   - **What breaks:** Claude + web search can take 10-30 seconds. Users drop off.
   - **How to fix:**
     - Add streaming responses (show progress as AI generates)
     - Optimize prompt to request fewer searches
     - Show "Researching [company]..." status updates
     - Pre-fetch common company data if patterns emerge

## Anti-Patterns

### Anti-Pattern 1: Throwing Errors in Route Handlers

**What people do:** Use try/catch and throw errors, relying on Next.js error boundaries or generic 500 responses.

**Why it's wrong:**
- Loses context about what failed (validation vs. AI vs. network)
- Can't show field-specific errors in UI
- Makes retry logic harder
- Doesn't align with React 19's `useActionState` pattern

**Do this instead:** Return errors as data with structured responses.

```typescript
// ❌ BAD: Throwing errors
export async function POST(request: NextRequest) {
  const body = await request.json();
  const input = prospectInputSchema.parse(body); // Throws on failure
  const result = await generateOpeners(input); // Throws on failure
  return NextResponse.json(result);
}

// ✅ GOOD: Errors as data
export async function POST(request: NextRequest) {
  const body = await request.json();
  const inputResult = prospectInputSchema.safeParse(body);

  if (!inputResult.success) {
    return NextResponse.json(
      { success: false, error: 'Invalid input', details: inputResult.error },
      { status: 400 }
    );
  }

  const result = await generateOpeners(inputResult.data);

  if (!result.success) {
    return NextResponse.json(result, { status: 500 });
  }

  return NextResponse.json(result);
}
```

### Anti-Pattern 2: Client-Side Prompt Construction

**What people do:** Build prompts in React components and send them to Claude API from the client.

**Why it's wrong:**
- Exposes API keys in browser
- Can't protect prompt engineering IP
- Makes prompt optimization impossible without redeployment
- Security risk (users can manipulate prompts)

**Do this instead:** Always construct prompts server-side. Client sends only validated input parameters.

```typescript
// ❌ BAD: Client builds prompt
// app/components/form/ProspectForm.tsx
const handleSubmit = async (data) => {
  const prompt = `Generate outreach for ${data.firstName}...`; // Exposed
  await fetch('https://api.anthropic.com/...', {
    headers: { 'x-api-key': process.env.NEXT_PUBLIC_CLAUDE_KEY }, // Leaked!
    body: JSON.stringify({ prompt }),
  });
};

// ✅ GOOD: Server builds prompt
// app/components/form/ProspectForm.tsx
const handleSubmit = async (data) => {
  await fetch('/api/generate', {
    method: 'POST',
    body: JSON.stringify(data), // Just the input parameters
  });
};

// app/api/generate/route.ts
export async function POST(request: NextRequest) {
  const input = await parseAndValidate(request);
  const prompt = buildPrompt(input); // Server-side, secure
  const result = await callClaude(prompt);
  return NextResponse.json(result);
}
```

### Anti-Pattern 3: Over-Architecting for Future Features

**What people do:** Add database, auth, user accounts, and complex state management "because we'll need it later."

**Why it's wrong:**
- Violates YAGNI (You Aren't Gonna Need It)
- Slows down initial shipping
- May optimize for wrong assumptions
- Adds infrastructure costs before validation

**Do this instead:** Ship stateless MVP. Add persistence only when validated need emerges.

```typescript
// ❌ BAD: Premature database
// app/api/generate/route.ts
export async function POST(request: NextRequest) {
  const session = await getSession(request); // Auth not needed yet
  const input = await validateInput(request);

  // Save to database for "history feature"
  await db.requests.create({
    userId: session.userId,
    input: input,
    timestamp: Date.now(),
  });

  const result = await generateOpeners(input);

  // Save results to database
  await db.results.create({
    userId: session.userId,
    openers: result.openers,
  });

  return NextResponse.json(result);
}

// ✅ GOOD: Stateless until proven necessary
export async function POST(request: NextRequest) {
  const input = await validateInput(request);
  const result = await generateOpeners(input);
  return NextResponse.json(result);
}
// Add database later IF users request history feature
```

### Anti-Pattern 4: Not Validating AI Outputs

**What people do:** Trust Claude to always return properly formatted data. Directly render AI responses without parsing.

**Why it's wrong:**
- AI can hallucinate or return unexpected formats
- Runtime errors crash the app
- No type safety
- Debugging is nightmarish

**Do this instead:** Always validate AI responses with Zod schemas before using data.

```typescript
// ❌ BAD: Trusting AI output blindly
export async function generateOpeners(input: ProspectInput) {
  const response = await client.messages.create({...});
  const text = response.content[0].text;
  const parsed = JSON.parse(text); // Assumes valid JSON
  return parsed; // No validation
}

// ✅ GOOD: Validate with schema
export async function generateOpeners(input: ProspectInput) {
  const response = await client.messages.create({...});
  const text = response.content[0].text;

  try {
    const parsed = JSON.parse(text);
    const validated = generationResultSchema.parse(parsed); // Zod validation
    return { success: true, data: validated };
  } catch (error) {
    return {
      success: false,
      error: 'AI returned invalid format',
      code: 'PARSE_ERROR'
    };
  }
}
```

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| **Anthropic Claude API** | Server-side SDK in Route Handler | Store API key in `.env.local` (never commit). Use `ANTHROPIC_API_KEY` environment variable. |
| **Claude Web Search Tool** | Enabled via `tools` parameter in Messages API | Server-side tool executed by Anthropic. Costs $10/1000 requests. Configure `max_uses`, `allowed_domains`, `blocked_domains`. |
| **Vercel Deployment** | Git push triggers deploy | Environment variables in Vercel dashboard. Automatic HTTPS, CDN, serverless functions. |
| **Vercel Analytics (optional)** | Add `@vercel/analytics` package | Track page views, API route performance. Helps identify bottlenecks. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| **Client ↔ API Route** | HTTP POST with JSON | Client sends `ProspectInput`, receives `GenerationResult`. Use `fetch` with error handling. |
| **API Route ↔ AI Service** | Direct function call | Route Handler imports and calls service layer functions. No network boundary—same process. |
| **AI Service ↔ Claude API** | HTTPS via Anthropic SDK | SDK handles retries, rate limiting, error codes. Service layer wraps in Result type. |
| **Components ↔ Components** | React props | Parent form component passes data down to child input components. Results component receives generated data as props. |

## Build Order Implications

Based on architecture dependencies, recommended build sequence:

### Phase 1: Foundation (API contracts first)
1. Define TypeScript types and Zod schemas (`lib/validation/schemas.ts`)
2. Create Route Handler skeleton with validation (`app/api/generate/route.ts`)
3. Implement basic error responses

**Why this order:** API contract defines everything else. Components can't be built until we know request/response shape.

### Phase 2: AI Integration (Core value delivery)
1. Set up Claude client (`lib/ai/claude-client.ts`)
2. Build prompt templates (`lib/ai/prompts.ts`)
3. Implement web search tool configuration
4. Add response parsing and validation

**Why this order:** Need working AI generation before UI is useful. Can test with cURL/Postman before building UI.

### Phase 3: UI Components (Outside-in)
1. Build form components (`components/form/*`)
2. Connect form to API route
3. Add loading states
4. Build results display (`components/results/*`)
5. Implement copy-to-clipboard

**Why this order:** Form must submit before results matter. Loading states prevent bad UX during testing.

### Phase 4: Polish (User experience)
1. Add error handling UI
2. Implement copy feedback ("Copied!")
3. Add Intel Summary collapsible section
4. Responsive design adjustments

**Why this order:** Core functionality works before polish. Easier to test UX flows when data is real.

### Phase 5: Deployment (Ship it)
1. Environment variable setup in Vercel
2. Test production build locally
3. Deploy to Vercel
4. Smoke test in production

**Why this order:** Deploy only when feature-complete. Testing in production environment catches config issues.

## Sources

**HIGH CONFIDENCE:**
- Next.js Route Handlers (Official): https://nextjs.org/docs/app/getting-started/route-handlers
- Claude Web Search Tool (Official): https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-search-tool
- Next.js AI Agents Guide (Official): https://nextjs.org/docs/app/guides/ai-agents
- Anthropic Tool Use (Official): https://www.anthropic.com/engineering/advanced-tool-use
- Next.js Error Handling (Official): https://nextjs.org/docs/app/getting-started/error-handling

**MEDIUM CONFIDENCE:**
- Next.js Server Actions Error Handling: Medium article (Dec 2025) - https://medium.com/@pawantripathi648/next-js-server-actions-error-handling-the-pattern-i-wish-i-knew-earlier-e717f28f2f75
- AI Search Architecture Deep Dive: iPullRank analysis - https://ipullrank.com/ai-search-manual/search-architecture
- Vercel AI Chatbot Templates: https://vercel.com/templates/next.js/nextjs-ai-chatbot

**LOW CONFIDENCE:**
- WebSearch findings about stateless chatbot patterns (ChatBotKit examples, not official Next.js patterns)

---
*Architecture research for: AI-Powered Sales Outreach Tools with Web Search*
*Researched: 2026-05-13*
