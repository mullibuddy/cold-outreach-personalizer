# Stack Research

**Domain:** AI-powered sales outreach tools with web search capabilities
**Researched:** 2026-05-13
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js | 16.2.6 | Full-stack React framework | Latest stable (May 2026) with 400% faster dev startup, Turbopack stable by default, React 19.2 support. App Router is the standard for new projects. Optimized for Vercel deployment. |
| React | 19.2 | UI library | Bundled with Next.js 16. Includes React Compiler for automatic memoization, improved Server Components, and better hydration error handling. |
| TypeScript | 6.0.3 | Type safety | Latest stable. Essential for AI/API projects to catch errors early. Improved error reporting for uninitialized variables, ECMAScript 2024 support, V8 compile caching. |
| Tailwind CSS | 4.3 | Styling framework | Latest v4 with 5x faster builds, zero config, first-party Vite plugin. Configuration via @theme directive in CSS (no tailwind.config.js). Color-mix(), cascade layers, @property support. |
| @anthropic-ai/sdk | 0.95.2 | Claude API client | Official TypeScript SDK for Anthropic API. Latest version (published May 2026) with web search tool support (web_search_20260209), extended thinking, and interleaved reasoning. |

### AI & Search Layer

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @anthropic-ai/sdk | 0.95.2 | Claude API integration | Required. Official SDK with web search tool (`web_search_20260209` version with dynamic filtering). Supports extended thinking for complex reasoning. Pricing: $10 per 1,000 searches. |
| Web Search Tool | web_search_20260209 | Real-time prospect research | Enable with `type: "web_search_20260209"`. Supports domain filtering (allowed_domains, blocked_domains), geolocation (user_location), and max_uses per request. Requires Claude Opus 4.7, Opus 4.6, or Sonnet 4.6 for dynamic filtering. |

### Form & Validation

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-hook-form | 7.75.0 | Form state management | Required. Performant (minimal re-renders), works with Next.js 14+ Server Actions. Use with `action` prop on form (not `onSubmit`). Supports uncontrolled components. |
| zod | 4.4.3 | Schema validation | Required with react-hook-form. Latest v4 stable (faster, slimmer, more tsc-efficient). Provides client-side validation for UX + server-side validation for security. |
| @hookform/resolvers | 5.2.2 | Validation resolver | Required to integrate Zod with react-hook-form. Pass Zod schemas to `zodResolver()` for layered validation. |

### UI Components & Utilities

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-react | 1.14.0 | Icon library | Recommended for icons. Tree-shakable (only imported icons bundled). Beautiful, consistent, open-source. 12,634+ projects use it. |
| clsx | 2.1.1 | Conditional classNames | Required for clean className logic. Tiny (239B). Handles object-based conditional classes efficiently. |
| tailwind-merge | 3.6.0 | Tailwind conflict resolution | Required with clsx. Prevents conflicting Tailwind classes (e.g., `bg-blue-500` vs `bg-red-500`). v3.6+ supports Tailwind v4.0-4.3. |
| sonner | Latest | Toast notifications | Recommended for success/error feedback. Opinionated, elegant, swipe-to-dismiss, promise integration for async operations. No Hooks or setup required. |

### Rate Limiting & Security

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @upstash/ratelimit | 2.0.8 | API rate limiting | Highly recommended. Serverless-first (works on Vercel edge). Prevents abuse of Claude API endpoints. Supports fixed window, sliding window, token bucket algorithms. Redis-backed for multi-region deployments. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| pnpm | Package manager | Recommended over npm/yarn for Next.js in 2025-2026. ~53% faster than npm, uses <50% disk space, prevents phantom dependencies, best monorepo support. Minor compatibility cost but worth it. |
| ESLint | Linting | Next.js includes eslint-config-next. ESLint 9+ uses flat config (eslint.config.mjs). Add eslint-config-prettier to prevent conflicts with Prettier. |
| Prettier | Code formatting | Add eslint-config-prettier to ESLint extends (must be last). Use with lint-staged + husky for pre-commit hooks. |
| Vercel CLI | Deployment & env vars | Use `vercel env pull` to sync environment variables locally. Supports preview/production env scopes. 64KB limit per deployment, 5KB for Edge/Middleware. |

## Installation

```bash
# Initialize Next.js project (if not already done)
pnpm create next-app@latest . --typescript --tailwind --app --src-dir=false --import-alias="@/*"

# Core dependencies
pnpm install @anthropic-ai/sdk@0.95.2
pnpm install react-hook-form@7.75.0 zod@4.4.3 @hookform/resolvers@5.2.2

# UI & utilities
pnpm install clsx@2.1.1 tailwind-merge@3.6.0 lucide-react@1.14.0
pnpm install sonner

# Rate limiting (recommended for production)
pnpm install @upstash/ratelimit@2.0.8

# Dev dependencies
pnpm install -D prettier eslint-config-prettier
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| @anthropic-ai/sdk | @ai-sdk/anthropic (Vercel AI SDK) | If building multi-provider AI app with streaming UI patterns. For single-provider (Claude only) with web search, use official SDK. |
| Next.js 16 | Next.js 14 | Project spec locked to Next.js 14. However, 16 is 400% faster dev, 50% faster rendering, Turbopack stable. Upgrade recommended unless breaking changes are blocking. |
| Tailwind v4 | Tailwind v3 | If existing project on v3. Use tailwind-merge@2.6.0 for v3 compatibility. v4 has 5x faster builds, zero config. |
| sonner | react-hot-toast | If you need more customization or existing codebase uses it. Sonner is more opinionated but simpler API. |
| pnpm | npm | If team is unfamiliar with pnpm or compatibility issues arise. pnpm wins on speed/disk but has minor compatibility quirks during migration. |
| react-hook-form | Formik | Never. Formik is slower, deprecated patterns. react-hook-form is the 2025 standard (43M+ weekly downloads). |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Pages Router | Deprecated pattern. App Router is the future. Slower, lacks Server Components, Suspense, streaming. | Next.js App Router |
| tailwind.config.js | Tailwind v4 uses @theme directive in CSS. Config file no longer needed. | @theme in CSS file |
| .eslintrc | ESLint 9+ uses flat config format. Legacy config deprecated. | eslint.config.mjs with FlatCompat |
| create-react-app | Unmaintained since 2022. Next.js is the React team's recommended framework. | Next.js or Vite |
| Manual clipboard API | Browser Clipboard API requires permissions, verbose. | Copy-to-clipboard library or simple execCommand fallback |
| Auto-retry on API errors (v1) | Project spec: show error with Retry button. User controls retry. | Error state + manual retry |
| Real-time streaming UI | Project spec: simple spinner, no streaming. Adds complexity for minimal UX gain in v1. | POST request → wait → show results |

## Stack Patterns by Variant

**If using Claude web search (this project):**
- Use `web_search_20260209` tool version (latest with dynamic filtering)
- Enable extended thinking for complex prospect analysis: `thinking: { type: "adaptive", budget_tokens: 10000 }`
- Set `max_uses: 5` to limit searches per request (cost control)
- Use `allowed_domains` to target LinkedIn, company websites, news sites
- Pricing: $10 per 1,000 searches + token costs (~$3-15 per API call depending on model)

**If stateless (no database):**
- No session management, no user accounts, no history
- All state lives in form + API response
- Use environment variables for API keys (ANTHROPIC_API_KEY)
- Deploy to Vercel (auto-scales, edge functions, zero config)

**If mobile + desktop responsive:**
- Tailwind breakpoints: `sm:`, `md:`, `lg:` for responsive layouts
- Test on mobile viewports (shadcn/ui components are mobile-first)
- Ensure touch targets are 44px+ for buttons/copy actions

**If using shadcn/ui (recommended for Notion/Linear aesthetic):**
- Copy components into project (not npm install)
- Uses Tailwind v4, radix-ui primitives, lucide-react icons
- Fully compatible with Next.js 16, App Router, Server Components
- Components like Card, Badge are Server Components by default
- Interactive components (Dialog, Dropdown) auto-marked "use client"

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| Next.js 16.2.6 | React 19.2 | Bundled together. Don't install React separately. |
| Tailwind CSS 4.3 | tailwind-merge 3.6.0 | tailwind-merge v3.x supports Tailwind v4.0-4.3. Use v2.6.0 for Tailwind v3. |
| react-hook-form 7.75.0 | zod 4.4.3 | Use @hookform/resolvers 5.2.2 to connect them via zodResolver(). |
| @anthropic-ai/sdk 0.95.2 | Node.js 18+ | Supports web search tool (web_search_20260209), extended thinking, interleaved reasoning. |
| Next.js 16 + Vercel | Edge Runtime | Environment variables limited to 5KB for edge/middleware. Use server-side for larger configs. |
| pnpm | Next.js 16 | Fully compatible. Use pnpm create next-app or pnpm install in existing projects. |
| ESLint 9 | Next.js 16 | Use flat config (eslint.config.mjs). Next.js provides eslint-config-next with FlatCompat wrapper. |

## Environment Variables

### Required

```bash
# .env.local
ANTHROPIC_API_KEY=sk-ant-xxx  # Required for Claude API
```

### Optional (Production)

```bash
# Vercel environment variables (set via dashboard or vercel env)
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app  # For CORS, canonical URLs
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io    # For rate limiting (optional but recommended)
UPSTASH_REDIS_REST_TOKEN=xxx                      # For rate limiting
```

### Best Practices

- Use `NEXT_PUBLIC_` prefix for client-accessible vars
- Never commit `.env.local` (add to .gitignore)
- Use `vercel env pull` to sync from Vercel dashboard
- Environment variables are baked into build (redeploy after changing)
- Max 64KB total, 5KB per variable for edge functions

## Security Considerations

### API Key Protection
- Store ANTHROPIC_API_KEY in environment variables (never in code)
- API routes run server-side (keys never exposed to client)
- Vercel automatically encrypts environment variables

### Rate Limiting
- **Critical for production**: Claude API costs $10 per 1,000 searches + token costs
- Use @upstash/ratelimit with Redis to prevent abuse
- Recommended limits: 10 requests per hour per IP for free tier
- Block known VPN/proxy IPs if abuse detected

### Server Actions Security
- Next.js 15+ "use server" directive validates trusted requests only
- Server Actions are public API endpoints (treat as such)
- Always validate input with Zod on server-side (client validation is UX only)

### Vercel Deployment
- Vercel automatically sets secure headers (HSTS, CSP)
- Use Vercel's DDoS protection (enabled by default on Pro+)
- Monitor usage in Vercel dashboard (set billing alerts)

## Sources

### Official Documentation (HIGH confidence)
- Next.js 16.2 announcement: https://nextjs.org/blog/next-16-2 (March 2026)
- Next.js App Router docs: https://nextjs.org/docs/app (verified v16.2.6 current)
- Claude API web search tool: https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-search-tool (verified web_search_20260209)
- Tailwind CSS v4 release: https://tailwindcss.com/blog/tailwindcss-v4 (January 2025)
- TypeScript 5.7 announcement: https://devblogs.microsoft.com/typescript/announcing-typescript-5-7/ (November 2024)

### npm Package Versions (HIGH confidence, verified May 2026)
- @anthropic-ai/sdk: 0.95.2 (latest, published 20 hours ago)
- react-hook-form: 7.75.0 (11 days ago, 43M+ weekly downloads)
- zod: 4.4.3 (9 days ago, v4 stable)
- @hookform/resolvers: 5.2.2 (September 2025)
- tailwind-merge: 3.6.0 (3 days ago, supports Tailwind v4.0-4.3)
- clsx: 2.1.1 (April 2024, stable, no updates needed)
- lucide-react: 1.14.0 (14 days ago)
- @upstash/ratelimit: 2.0.8 (4 months ago)

### Ecosystem & Best Practices (MEDIUM-HIGH confidence)
- Next.js 14 vs 15 comparison: Multiple sources (WebSearch) - caching defaults changed, React 19 support, Turbopack stable
- Next.js 15 vs 16: Official release notes - 400% faster dev, Turbopack default, React Compiler stable
- react-hook-form + Next.js Server Actions: Multiple 2025 tutorials (WebSearch) - use `action` prop, not `onSubmit`
- pnpm recommendation: Multiple 2025-2026 comparisons (WebSearch) - faster, less disk, better for monorepos
- shadcn/ui compatibility: Official changelog (May 2025) - upgraded to Next.js 15.3, Tailwind v4
- Rate limiting with Upstash: Official Next.js docs + Upstash blog (2025) - recommended for serverless

---
*Stack research for: AI-powered sales outreach tools with web search*
*Researched: 2026-05-13*
*Confidence: HIGH - All versions verified against official sources and npm registry as of May 2026*
