# Phase 1: Foundation & API Contracts - Research

**Researched:** 2026-05-14
**Domain:** TypeScript validation architecture, Next.js project initialization, API contracts
**Confidence:** HIGH

## Summary

Phase 1 establishes type-safe API contracts using TypeScript, Zod validation schemas, and Next.js environment configuration. The foundation layer defines data structures, validation rules at both client and server boundaries, and secure configuration patterns that prevent runtime errors.

The modern 2026 stack leverages Next.js 16.2.6 with built-in Turbopack, TypeScript 6.x with strict mode, and Zod 4.4.3 for runtime validation. The architectural pattern centers on colocated schemas (TypeScript types + Zod schemas in the same file) organized in a centralized `types/` directory with barrel exports for clean imports.

**Primary recommendation:** Initialize with `pnpm create next-app`, enable TypeScript strict mode from day one, colocate Zod schemas with type definitions, validate environment variables at startup, and establish dual-layer validation (client for UX, server for security) using shared schemas.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Project Initialization:**
- Next.js version: Use Next.js 16.2.6 (current stable, May 2026) - 400% faster dev startup, Turbopack stable by default, React 19 bundled
- Package manager: Use pnpm - 53% faster than npm, <50% disk space, 2025-2026 standard for Next.js projects
- Tailwind version: Use Tailwind v4.3 - complete overhaul with zero config, 5x faster builds, @theme directive in CSS (breaking from v3)
- Initialization method: Use create-next-app CLI - official tool sets up Next.js 16 + TypeScript + Tailwind + ESLint in seconds

**Type Organization:**
- File structure: Centralized types/ directory - types/prospect.ts, types/opener.ts, types/api.ts for easy discovery
- Naming convention: Domain names - ProspectInput, OpenerOutput, GenerationResponse (clear and readable, not Request/Response suffix style)
- Export strategy: Barrel exports - types/index.ts re-exports everything, allowing `import from '@/types'`
- Zod schemas: Colocated in types/ - each types/[domain].ts file contains both TypeScript type and Zod schema for single source of truth

**Validation Strategy:**
- Validation layers: Both client and server - client for UX (instant feedback), server for security (never trust client)
- Error message style: User-friendly - "Please enter a company name" (clear, conversational, helpful vs technical/terse)
- Client validation timing: On blur - validate when user leaves field (balance between immediate feedback and not being annoying)
- API error format: Structured responses - `{success: false, error: {message, fields}}` for both machine and human readability

**Environment Variables:**
- Phase 1 scope: Define only ANTHROPIC_API_KEY - add others (UPSTASH_REDIS_*, rate limit config) in later phases when needed
- Documentation: Commit .env.example with placeholder values to git - documents required env vars for developers
- Startup validation: Validate env vars at application startup - fail fast if ANTHROPIC_API_KEY missing to prevent runtime errors
- Naming convention: Follow Next.js convention - ANTHROPIC_API_KEY (server-only), NEXT_PUBLIC_* prefix for client-exposed vars

### Claude's Discretion

- Specific folder structure within types/ directory (can organize by feature if needed)
- TypeScript compiler options and tsconfig.json strictness settings
- ESLint and Prettier configuration details
- Exact Zod validation rules and constraints (beyond basic required/optional)
- Error message specific wording (as long as user-friendly tone maintained)

### Deferred Ideas (OUT OF SCOPE)

None - discussion stayed within phase scope. All decisions relate directly to establishing foundation and API contracts for Phase 1.

</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| INFRA-01 | Application is fully stateless (no database) | Next.js 16 Server Components, no session/auth config needed, pure function API routes |
| INFRA-03 | Environment variables are properly secured | Zod startup validation, server-only vars (no NEXT_PUBLIC_), .env.example pattern |
| INPUT-06 | Form validates all required fields before submission | Zod schemas + react-hook-form integration, dual-layer client/server validation |

</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.2.6 | Full-stack React framework | Latest stable (May 2026). 400% faster dev startup, Turbopack stable by default, React 19.2 bundled. App Router is 2026 standard. Official CLI setup in seconds. |
| TypeScript | 6.0.3 | Type safety | Latest stable. Essential for API contracts. Improved error reporting for uninitialized variables, ECMAScript 2024 support, V8 compile caching. |
| Zod | 4.4.3 | Runtime validation | Latest v4 stable (faster, slimmer than v3). TypeScript-first with automatic type inference. Eliminates type/validation duplication. Standard for Next.js Server Actions. |
| pnpm | Latest | Package manager | 53% faster than npm, <50% disk space. 2025-2026 Next.js standard. Prevents phantom dependencies via non-flat node_modules. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @hookform/resolvers | 5.2.2 | Zod + react-hook-form bridge | Connects Zod schemas to react-hook-form via `zodResolver()`. Required for client-side validation. |
| zod-validation-error | Latest | User-friendly Zod errors | Optional. Wraps Zod errors in readable messages like "Company name is required" instead of technical paths. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Zod | Yup, Joi | Zod has best TypeScript inference, smallest bundle, native Next.js integration. Yup/Joi are legacy. |
| Colocated schemas | Separate types/ and schemas/ | Duplication risk. Colocated = single source of truth, easier refactoring. |
| pnpm | npm | npm is slower, more disk space, but 100% compatible. pnpm has minor hoisting quirks (fixable with public-hoist-pattern). |
| TypeScript strict mode | Loose mode | Loose mode allows runtime errors. Strict catches 40%+ bugs at compile time. No excuse in 2026. |

**Installation:**
```bash
# Initialize project (if starting from scratch)
pnpm create next-app@latest . --yes

# Add validation libraries
pnpm install zod@4.4.3
pnpm install @hookform/resolvers@5.2.2

# Optional: user-friendly error messages
pnpm install zod-validation-error
```

## Architecture Patterns

### Recommended Project Structure
```
project-root/
├── app/                       # Next.js App Router
│   ├── api/                   # API routes (Phase 2)
│   ├── page.tsx               # Homepage (Phase 3)
│   └── layout.tsx             # Root layout
├── types/                     # TypeScript types + Zod schemas (THIS PHASE)
│   ├── prospect.ts            # ProspectInput + schema
│   ├── opener.ts              # OpenerOutput + schema
│   ├── api.ts                 # API request/response types
│   ├── env.ts                 # Environment variable validation
│   └── index.ts               # Barrel export
├── lib/                       # Utilities (Phase 2+)
├── .env.local                 # Local secrets (gitignored)
├── .env.example               # Template (committed)
├── tsconfig.json              # TypeScript config
└── next.config.ts             # Next.js config
```

### Pattern 1: Colocated Type + Schema

**What:** Define TypeScript type and Zod schema together, infer type from schema

**When to use:** Always. Single source of truth prevents drift between types and validation.

**Example:**
```typescript
// types/prospect.ts
import { z } from 'zod'

// Source: Zod official docs + Next.js patterns (2026)
export const ProspectInputSchema = z.object({
  firstName: z.string().min(1, "Please enter a first name"),
  jobTitle: z.string().min(1, "Please enter a job title"),
  company: z.string().min(1, "Please enter a company name"),
  productDescription: z.string().min(10, "Please describe your product (at least 10 characters)"),
  channel: z.enum(["cold_email", "linkedin_dm", "cold_call"], {
    message: "Please select a valid outreach channel"
  })
})

// Infer TypeScript type from Zod schema
export type ProspectInput = z.infer<typeof ProspectInputSchema>
```

**Why this works:**
- Schema is single source of truth
- TypeScript type automatically syncs with validation rules
- Refactor once, both type and validation update
- No duplication = no drift

### Pattern 2: Startup Environment Validation

**What:** Validate environment variables when app starts, fail fast if missing

**When to use:** Always. Prevents cryptic "undefined" errors in production.

**Example:**
```typescript
// types/env.ts
// Source: Next.js env best practices + Zod validation (2026)
import { z } from 'zod'

const envSchema = z.object({
  ANTHROPIC_API_KEY: z.string().startsWith('sk-ant-', {
    message: "ANTHROPIC_API_KEY must start with 'sk-ant-'"
  })
})

// Validate at module load time (startup)
export const env = envSchema.parse({
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY
})

// Usage in API routes: import { env } from '@/types/env'
```

**Why this works:**
- Fails immediately at startup if key is missing
- Clear error message points to problem
- Typed `env` object gives autocomplete
- No possibility of runtime undefined errors

### Pattern 3: Dual-Layer Validation (Client + Server)

**What:** Validate on client for UX, validate again on server for security

**When to use:** Always. Never trust client-side validation alone.

**Example:**
```typescript
// Client-side (Phase 3)
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { ProspectInputSchema } from '@/types/prospect'

const form = useForm({
  resolver: zodResolver(ProspectInputSchema),
  mode: 'onBlur' // User decision: validate on blur
})

// Server-side (Phase 2)
import { ProspectInputSchema } from '@/types/prospect'

export async function POST(request: Request) {
  const body = await request.json()

  // Parse with Zod - throws if invalid
  const validated = ProspectInputSchema.parse(body)

  // Now validated is type-safe and guaranteed valid
}
```

**Why this works:**
- Same schema used on both client and server
- Client validation = instant feedback (good UX)
- Server validation = security boundary (never trust client)
- No duplication, no drift

### Pattern 4: Structured API Error Responses

**What:** Consistent error format for all API routes

**When to use:** All API routes in Phase 2+

**Example:**
```typescript
// types/api.ts
// Source: Next.js API error handling best practices (2026)
import { z } from 'zod'

export interface ApiErrorResponse {
  success: false
  error: {
    message: string
    fields?: Record<string, string[]> // Field-level errors
  }
}

export interface ApiSuccessResponse<T> {
  success: true
  data: T
}

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

// Zod error to structured format
import { ZodError } from 'zod'

export function zodErrorToFields(error: ZodError): Record<string, string[]> {
  const fields: Record<string, string[]> = {}

  error.issues.forEach(issue => {
    const path = issue.path.join('.')
    if (!fields[path]) fields[path] = []
    fields[path].push(issue.message)
  })

  return fields
}
```

**Why this works:**
- Consistent structure for all errors
- Machines can parse `success` field
- Humans can read `error.message`
- Field-level errors map to form inputs

### Pattern 5: Barrel Exports for Clean Imports

**What:** Single index.ts re-exports all types for clean imports

**When to use:** Always. Prevents `../../../` hell.

**Example:**
```typescript
// types/index.ts
// Source: TypeScript project structure best practices (2026)
export * from './prospect'
export * from './opener'
export * from './api'
export * from './env'

// Usage throughout app
import { ProspectInput, OpenerOutput, env } from '@/types'
```

**Why this works:**
- Single import path for all types
- Easy to discover what's available
- Refactor file names without breaking imports
- Standard TypeScript pattern

### Anti-Patterns to Avoid

- **Separate types and schemas:** Leads to drift. Colocate and infer type from schema.
- **Client-only validation:** Insecure. Always validate on server.
- **Runtime env access without validation:** Crashes in production. Validate at startup.
- **Technical error messages:** Poor UX. Use conversational language: "Please enter a company name" not "company: required".
- **NEXT_PUBLIC_ for secrets:** Exposes to client. Only use for truly public values like API URLs.
- **Loose TypeScript mode:** Allows bugs. Enable strict: true from day one.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Runtime validation | Custom validators, manual type guards | Zod schemas with `.parse()` | Edge cases (nested objects, arrays, unions, transforms). Zod handles all cases, gives great errors, infers types. |
| Error message formatting | String concatenation, custom error classes | Zod custom messages + `zod-validation-error` | I18n, field paths, nested errors. Libraries handle complex cases. |
| Environment variable typing | Manual `process.env` casts | Zod schema with startup validation | Type safety, runtime validation, clear errors. Manual casts hide undefined bugs. |
| Form validation state | Custom useState, manual error tracking | react-hook-form + zodResolver | Re-render optimization, field-level errors, touched state, async validation. Solved problem. |

**Key insight:** Validation is deceptively complex. Manual solutions miss edge cases (nested validation, async rules, error formatting, type inference). Zod + react-hook-form are battle-tested for these problems.

## Common Pitfalls

### Pitfall 1: Environment Variables Not Available in Browser

**What goes wrong:** Accessing `process.env.ANTHROPIC_API_KEY` in client component returns undefined

**Why it happens:** Next.js only bundles `NEXT_PUBLIC_*` vars into client code. Server-only vars are stripped.

**How to avoid:**
- Never use secrets in client components
- Only `NEXT_PUBLIC_*` vars are available in browser
- API keys, database URLs = server-only (API routes, Server Components)
- Create `types/env.ts` with separate client/server schemas

**Warning signs:**
- Environment variable is undefined in browser console
- API calls work in Server Components but fail in Client Components
- Secrets showing up in browser Network tab

### Pitfall 2: No Server Restart After Adding .env Variables

**What goes wrong:** New environment variable is undefined even though it's in .env.local

**Why it happens:** Next.js loads environment variables at startup. Changes require restart.

**How to avoid:**
- Always restart dev server after modifying .env files
- Use `pnpm dev` to start fresh
- Redeploy to Vercel after changing environment variables in dashboard

**Warning signs:**
- Variable exists in .env.local but `process.env.VAR` is undefined
- Works on colleague's machine but not yours
- Production works but local dev doesn't

### Pitfall 3: Type Drift Between Schema and Type

**What goes wrong:** TypeScript type says field is required, but Zod schema allows optional. Or vice versa.

**Why it happens:** Maintaining two separate definitions (type + schema) leads to drift during refactoring.

**How to avoid:**
- Always infer type from Zod schema: `type T = z.infer<typeof schema>`
- Never define both separately
- Schema is source of truth

**Warning signs:**
- Validation errors for "valid" data
- TypeScript happy but runtime errors
- Refactored schema but forgot to update type

### Pitfall 4: Zod Parse Throws, Doesn't Return Error

**What goes wrong:** `.parse()` throws error instead of returning, crashes API route

**Why it happens:** Zod's `.parse()` throws on invalid data. Developers expect return value.

**How to avoid:**
- Use try/catch around `.parse()` in API routes
- OR use `.safeParse()` which returns `{success: boolean, data?, error?}`
- Never use `.parse()` without error handling

**Example:**
```typescript
// BAD: Uncaught error crashes route
const validated = ProspectInputSchema.parse(body)

// GOOD: Error handled
try {
  const validated = ProspectInputSchema.parse(body)
} catch (error) {
  if (error instanceof ZodError) {
    return errorResponse("Validation failed", zodErrorToFields(error))
  }
}

// ALSO GOOD: Safe parse
const result = ProspectInputSchema.safeParse(body)
if (!result.success) {
  return errorResponse("Validation failed", zodErrorToFields(result.error))
}
```

**Warning signs:**
- API route returns 500 instead of 400 for invalid input
- Error logs show uncaught ZodError
- No validation error details in response

### Pitfall 5: TypeScript Strict Mode Disabled

**What goes wrong:** Runtime errors from undefined, null, type mismatches that TypeScript missed

**Why it happens:** Loose mode allows dangerous patterns. Developers disable strict to "fix" errors quickly.

**How to avoid:**
- Enable `strict: true` in tsconfig.json from day one
- Enable `noUncheckedIndexedAccess` (catches array access bugs)
- Fix type errors properly, don't disable strict

**Warning signs:**
- Frequent "Cannot read property of undefined" errors
- Type assertions everywhere (`as any`)
- Production bugs that "should have been caught"

### Pitfall 6: Validating FormData vs JSON Body

**What goes wrong:** Server Action receives FormData, but schema expects JSON object. Validation fails.

**Why it happens:** Next.js Server Actions use FormData by default. Zod schema expects `{ field: value }` not FormData.

**How to avoid:**
- Use `Object.fromEntries(formData)` to convert FormData to object
- OR use form's `action` prop with JSON serialization
- Ensure schema matches data format

**Example:**
```typescript
// Server Action receives FormData
export async function submitForm(formData: FormData) {
  // Convert to object first
  const data = Object.fromEntries(formData)

  // Now parse
  const validated = ProspectInputSchema.parse(data)
}
```

**Warning signs:**
- FormData values are all strings, not types (numbers, booleans)
- Zod schema fails on valid form submission
- Checkbox values are "on" instead of boolean

## Code Examples

Verified patterns from official sources and 2026 best practices:

### Complete Type Definition with Validation

```typescript
// types/prospect.ts
// Source: Zod docs + Next.js App Router patterns (2026)
import { z } from 'zod'

// Define schema first
export const ProspectInputSchema = z.object({
  firstName: z.string().min(1, "Please enter a first name"),
  jobTitle: z.string().min(1, "Please enter a job title"),
  company: z.string().min(1, "Please enter a company name"),
  productDescription: z.string().min(10, "Please describe your product (at least 10 characters)"),
  channel: z.enum(["cold_email", "linkedin_dm", "cold_call"], {
    message: "Please select a valid outreach channel"
  })
})

// Infer type from schema
export type ProspectInput = z.infer<typeof ProspectInputSchema>
```

### Environment Variable Validation

```typescript
// types/env.ts
// Source: Next.js env best practices + Zod (2026)
import { z } from 'zod'

const serverEnvSchema = z.object({
  ANTHROPIC_API_KEY: z.string().startsWith('sk-ant-', {
    message: "ANTHROPIC_API_KEY must be a valid Anthropic API key starting with 'sk-ant-'"
  })
})

// Validate at module load (startup)
// This will throw and prevent app from starting if invalid
export const env = serverEnvSchema.parse({
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY
})

// Usage: import { env } from '@/types/env'
// env.ANTHROPIC_API_KEY is typed and validated
```

### TypeScript Configuration

```json
// tsconfig.json
// Source: Next.js + TypeScript best practices (2026)
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "preserve",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowJs": true,
    "checkJs": false,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "incremental": true,
    "isolatedModules": true,
    "paths": {
      "@/*": ["./*"]
    },
    "plugins": [
      {
        "name": "next"
      }
    ]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

**Key settings:**
- `strict: true` - Enable all strict checks (2026 standard)
- `noUncheckedIndexedAccess: true` - Catches array access bugs
- `moduleResolution: "bundler"` - Correct for Next.js 16
- `paths: {"@/*": ["./*"]}` - Path aliases for clean imports

### Environment File Template

```bash
# .env.example
# Source: Next.js env documentation (2026)
# Commit this file to git to document required variables

# Anthropic API Key (required)
# Get from: https://console.anthropic.com/
# Format: sk-ant-...
ANTHROPIC_API_KEY=

# Phase 2+ will add:
# UPSTASH_REDIS_REST_URL=
# UPSTASH_REDIS_REST_TOKEN=
```

### Barrel Export Pattern

```typescript
// types/index.ts
// Source: TypeScript project organization best practices (2026)

// Re-export all types from centralized location
export * from './prospect'
export * from './opener'
export * from './api'
export * from './env'

// Usage throughout app:
// import { ProspectInput, OpenerOutput, env } from '@/types'
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Separate type + validator | Infer type from Zod schema | Zod v3 (2022) | Single source of truth, no drift |
| Manual env type casts | Zod startup validation | 2024-2025 | Runtime safety, clear errors |
| Pages Router | App Router | Next.js 13 (2023) | Server Components, better DX |
| Webpack | Turbopack | Next.js 16 (2026) | 400% faster dev, default in 16 |
| Tailwind v3 config file | Tailwind v4 @theme directive | Tailwind v4 (2025) | Zero config, 5x faster builds |
| npm/yarn | pnpm | 2025-2026 | 53% faster, 50% less disk |
| Jest | Vitest | 2025-2026 | 10-20x faster startup, native TS |

**Deprecated/outdated:**
- **Pages Router:** Use App Router for all new projects (Server Components, better streaming)
- **tailwind.config.js:** Use `@theme` directive in CSS (Tailwind v4 pattern)
- **Manual .env typing:** Use Zod schemas with startup validation
- **Separate validator libraries (Yup, Joi):** Use Zod (best TypeScript inference)

## Open Questions

1. **Should error messages be more technical for developers vs end users?**
   - What we know: User decision is "user-friendly, conversational"
   - What's unclear: Does this apply to API errors developers will see, or just form validation?
   - Recommendation: Keep form validation user-friendly, API route errors can be more technical (include field paths)

2. **Should we validate on every keystroke, on blur, or on submit?**
   - What we know: User decision is "on blur" (balance between feedback and annoying)
   - What's unclear: None - clear decision
   - Recommendation: Implement onBlur validation via react-hook-form `mode: 'onBlur'`

3. **Should types/ directory have subdirectories or be flat?**
   - What we know: Centralized types/ directory, Claude's discretion on internal structure
   - What's unclear: With only 4 files (prospect, opener, api, env), is flat better?
   - Recommendation: Start flat. If it grows beyond 10 files in future phases, add subdirectories

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1 with @testing-library/react |
| Config file | vitest.config.mts |
| Quick run command | `pnpm test` |
| Full suite command | `pnpm test --run` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| INFRA-01 | Application has no database/session dependencies | unit | `pnpm test tests/api.test.ts -t "stateless" -x` | ❌ Wave 0 |
| INFRA-03 | Environment variables validated at startup | unit | `pnpm test tests/env.test.ts -x` | ❌ Wave 0 |
| INPUT-06 | Form validates all required fields | unit | `pnpm test tests/validation.test.ts -x` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `pnpm test` (watch mode during development)
- **Per wave merge:** `pnpm test --run` (full suite, CI mode)
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/env.test.ts` — covers INFRA-03 (env validation at startup)
- [ ] `tests/validation.test.ts` — covers INPUT-06 (Zod schema validation)
- [ ] `tests/api.test.ts` — covers INFRA-01 (stateless architecture)
- [ ] `vitest.config.mts` — Vitest configuration with jsdom environment
- [ ] Framework install: `pnpm add -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom vite-tsconfig-paths`

## Sources

### Primary (HIGH confidence)
- Next.js official docs - Installation: https://nextjs.org/docs/app/getting-started/installation (verified May 2026)
- Next.js official docs - Environment Variables: https://nextjs.org/docs/pages/guides/environment-variables
- Next.js official docs - Vitest Testing: https://nextjs.org/docs/app/guides/testing/vitest
- Zod official docs - Main: https://zod.dev/ (v4.4.3 current)
- Zod official docs - Error Customization: https://zod.dev/error-customization

### Secondary (MEDIUM confidence)
- Next.js 16 TypeScript setup guides (WebSearch, January 2026) - multiple sources agree on strict mode + path aliases
- Vitest vs Jest comparisons (WebSearch, 2026) - performance benchmarks from multiple sources
- TypeScript project structure guides (WebSearch, 2026) - barrel export patterns verified across sources
- React Hook Form + Zod + Next.js (WebSearch, 2025-2026) - integration patterns verified with official examples

### Tertiary (LOW confidence)
- None - all findings verified with official docs or multiple sources

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All versions verified from official sources/npm registry as of May 2026
- Architecture patterns: HIGH - Patterns from official Next.js/Zod docs, verified with 2026 sources
- Pitfalls: HIGH - Documented in official guides and verified through 2026 developer experiences
- Validation architecture: HIGH - Official Next.js Vitest guide, standard testing patterns

**Research date:** 2026-05-14
**Valid until:** 2026-06-14 (30 days for stable frameworks - Next.js, TypeScript, Zod are mature)

---

*Research for Phase 1: Foundation & API Contracts*
*Ready for planning*
