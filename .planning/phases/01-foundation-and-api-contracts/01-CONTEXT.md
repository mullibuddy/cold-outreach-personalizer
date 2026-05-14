# Phase 1: Foundation & API Contracts - Context

**Gathered:** 2026-05-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Establish type-safe API contracts, TypeScript schemas, Zod validation, and environment configuration before any feature implementation begins. This phase creates the foundation that all subsequent phases build upon - defining data structures, validation rules, and secure configuration patterns.

</domain>

<decisions>
## Implementation Decisions

### Project Initialization
- **Next.js version**: Use Next.js 16.2.6 (current stable, May 2026) - 400% faster dev startup, Turbopack stable by default, React 19 bundled
- **Package manager**: Use pnpm - 53% faster than npm, <50% disk space, 2025-2026 standard for Next.js projects
- **Tailwind version**: Use Tailwind v4.3 - complete overhaul with zero config, 5x faster builds, @theme directive in CSS (breaking from v3)
- **Initialization method**: Use create-next-app CLI - official tool sets up Next.js 16 + TypeScript + Tailwind + ESLint in seconds

### Type Organization
- **File structure**: Centralized types/ directory - types/prospect.ts, types/opener.ts, types/api.ts for easy discovery
- **Naming convention**: Domain names - ProspectInput, OpenerOutput, GenerationResponse (clear and readable, not Request/Response suffix style)
- **Export strategy**: Barrel exports - types/index.ts re-exports everything, allowing `import from '@/types'`
- **Zod schemas**: Colocated in types/ - each types/[domain].ts file contains both TypeScript type and Zod schema for single source of truth

### Validation Strategy
- **Validation layers**: Both client and server - client for UX (instant feedback), server for security (never trust client)
- **Error message style**: User-friendly - "Please enter a company name" (clear, conversational, helpful vs technical/terse)
- **Client validation timing**: On blur - validate when user leaves field (balance between immediate feedback and not being annoying)
- **API error format**: Structured responses - `{success: false, error: {message, fields}}` for both machine and human readability

### Environment Variables
- **Phase 1 scope**: Define only ANTHROPIC_API_KEY - add others (UPSTASH_REDIS_*, rate limit config) in later phases when needed
- **Documentation**: Commit .env.example with placeholder values to git - documents required env vars for developers
- **Startup validation**: Validate env vars at application startup - fail fast if ANTHROPIC_API_KEY missing to prevent runtime errors
- **Naming convention**: Follow Next.js convention - ANTHROPIC_API_KEY (server-only), NEXT_PUBLIC_* prefix for client-exposed vars

### Claude's Discretion
- Specific folder structure within types/ directory (can organize by feature if needed)
- TypeScript compiler options and tsconfig.json strictness settings
- ESLint and Prettier configuration details
- Exact Zod validation rules and constraints (beyond basic required/optional)
- Error message specific wording (as long as user-friendly tone maintained)

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
(None - greenfield project starting from scratch)

### Established Patterns
(None yet - Phase 1 will establish the patterns)

### Integration Points
- Next.js 16 App Router structure (`app/` directory)
- API routes will live in `app/api/` directory
- Types will be imported throughout application via `@/types` path alias

</code_context>

<specifics>
## Specific Ideas

**Tech stack locked from research:**
- Next.js 16.2.6 (upgrade from original spec's Next.js 14)
- TypeScript 6.x
- Tailwind v4.3 (upgrade from v3)
- pnpm as package manager
- Anthropic SDK 0.95.2 with web_search_20260209 tool
- Zod 4.4.3 for validation
- react-hook-form 7.75.0 for form handling

**Key principles from PROJECT.md:**
- Clean, minimal aesthetic (Notion/Linear style)
- Stateless design (no database)
- 3-day build timeline (aggressive but achievable)
- Mobile responsive from the start

</specifics>

<deferred>
## Deferred Ideas

None - discussion stayed within phase scope. All decisions relate directly to establishing foundation and API contracts for Phase 1.

</deferred>

---

*Phase: 01-foundation-and-api-contracts*
*Context gathered: 2026-05-14*
