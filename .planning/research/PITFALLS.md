# Pitfalls Research

**Domain:** AI-Powered Sales Outreach Tools
**Researched:** 2026-05-13
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: The "Robotic Voice" Problem — AI-Generated Text Sounds Generic

**What goes wrong:**
The generated openers sound stiff, formulaic, or obviously AI-written, causing prospects to immediately dismiss them as spam. Common tells include overused phrases like "Hope this email finds you well," "I was impressed by," consistent sentence lengths, overly formal tone, and predictable structural patterns. Modern spam filters and human recipients can both detect these patterns, with 47% of B2B professionals saying they'd be less likely to reply if they thought an email was AI-written.

**Why it happens:**
Developers treat AI output as ready-to-send without review or customization. Using generic prompts without tone specifications causes LLMs to default to formal, business-writing patterns. The same model with similar prompts produces similar outputs across all users, creating a "sea of lookalikes" in prospect inboxes. AI phrase overuse ("impressed," "excited," "reach out") triggers both algorithmic and human detection.

**How to avoid:**
- Write highly specific system prompts that define tone (conversational, brief, direct)
- Include anti-patterns in prompts ("Do NOT use phrases like 'hope this finds you well'")
- Instruct Claude to vary sentence structure and length
- Request specific writing style ("Write like a peer reaching out, not a salesperson pitching")
- Consider brief post-processing to inject natural variation
- Test outputs with spam filter checkers before launch

**Warning signs:**
- Generated outputs consistently start with the same openings
- Phrases like "impressed," "excited," "reach out" appear in >30% of outputs
- All outputs have similar paragraph lengths
- Test users immediately identify output as "AI-written"
- Formal language ("Dear," "I am writing to," "I would love to")

**Phase to address:**
Phase 2 (Prompt Engineering) — This is where system prompts are designed and tested. Include extensive tone and anti-pattern specifications.

---

### Pitfall 2: Hallucination — AI Invents Facts About Prospects or Companies

**What goes wrong:**
Claude generates factually incorrect information about the prospect's company, role, recent news, or achievements. Examples include fabricated product features, invented executive names, false partnerships, wrong founding dates, or non-existent recent news. When a prospect receives a message referencing something that never happened, trust is immediately destroyed and the sender looks incompetent. This is particularly damaging in B2B sales where credibility is everything.

**Why it happens:**
Web search returns outdated, incomplete, or incorrect information, but Claude presents it confidently. Claude fills gaps in research with plausible-sounding but invented details when web search yields poor results. The model lacks awareness that information is uncertain and presents guesses as facts. Stale data in search results (discussed in BBC February 2025 reporting) causes Claude to reference outdated claims.

**How to avoid:**
- Use Claude's web_search tool (returns encrypted_content with automatic citations)
- Require citations in system prompt: "Only include facts you can cite from web search results"
- Design prompts to acknowledge uncertainty: "If you cannot find recent news, say so rather than speculate"
- Implement response validation: parse output for citation markers
- Add user-facing disclaimer: "Research powered by web search — verify critical details"
- Consider human review for high-value prospects (v2 feature)
- Test with known prospects where you can verify facts

**Warning signs:**
- Outputs reference specific details but lack citations
- Generated "recent news" that's vague or generic ("recent growth," "expanding team")
- Inconsistent facts between regenerations for same prospect
- User testing reveals factual errors
- Web search returns zero results but output includes specific claims

**Phase to address:**
Phase 2 (Prompt Engineering) + Phase 4 (Testing with Real Data) — Prompt design should enforce citations, and real-world testing will surface hallucination patterns.

---

### Pitfall 3: Vercel Serverless Function Timeout — Requests Exceed 10-Second Limit

**What goes wrong:**
The API route takes longer than 10 seconds to respond (Vercel Hobby plan limit), causing a 504 Gateway Timeout error. Users see a broken experience, form submission appears to hang, and generated openers never arrive. This is especially likely when Claude's web_search tool performs multiple searches, processes lengthy content, or hits rate limits (which still return 200 status but delay response).

**Why it happens:**
Web search + AI generation is inherently slow (search can take 5-10 seconds alone, Claude generation adds 5-15 seconds). Vercel Hobby plan enforces a strict 10-second timeout for serverless functions. Developers test locally (no timeout) and assume production will match. Claude API rate limiting or degraded performance adds unpredictable latency. Complex prompts with multiple web searches compound delays.

**How to avoid:**
- **Architecture decision:** Use streaming response pattern (Server-Sent Events) so partial results arrive before timeout
- Set explicit `maxDuration` in route config if using Pro plan (60s max)
- Implement aggressive timeout on API route (8 seconds) to fail fast before Vercel kills it
- Show loading state immediately with realistic time estimate ("This usually takes 15-20 seconds")
- Consider splitting into two requests: (1) research, (2) generation (if streaming not feasible)
- Monitor response times in production; set alerts for >8-second p95
- Test with slow network conditions and cold starts

**Warning signs:**
- Local testing works but production deployments timeout
- API logs show requests taking >8 seconds regularly
- User reports of "loading forever" or error screens
- Vercel function logs show 504 errors
- Response times increase as web search returns more results

**Phase to address:**
Phase 3 (API Integration) — This is where API routes are built. Timeout handling, streaming responses, and error boundaries must be designed from the start, not retrofitted.

---

### Pitfall 4: Claude API Rate Limiting — 429 Errors Without Graceful Handling

**What goes wrong:**
The application hits Claude API rate limits (requests per minute, tokens per minute), returns a 429 error, and either crashes the user experience or retries immediately, compounding the problem. Users see generic error messages or infinite loading states. Without proper handling, early users may encounter frequent failures, damaging trust in the product.

**Why it happens:**
Claude API uses token bucket rate limiting with limits on requests per minute (RPM), input tokens per minute (ITPM), and output tokens per minute (OTPM). Rate limits are relatively low on new accounts and require gradual ramping. Developers don't implement exponential backoff with jitter for retry logic. The 429 response includes a `retry-after` header that's ignored. Burst traffic (e.g., first launch, Product Hunt) triggers acceleration limits.

**How to avoid:**
- **Implement exponential backoff with jitter** for all API calls (standard retry pattern)
- **Read and respect `retry-after` header** in 429 responses
- Display user-friendly error: "High traffic right now — retrying in X seconds"
- Monitor `anthropic-ratelimit-*` headers on responses to detect approaching limits
- Set up queue system if expecting high burst traffic (defer requests rather than fail)
- Request higher rate limits from Anthropic before launch if expecting volume
- Test with rate limit simulation (artificially trigger 429s in staging)

**Warning signs:**
- 429 errors appear in production logs
- API calls retry immediately without delay
- Error rate spikes during peak usage
- Users report "try again" loop without resolution
- Response headers show rate limit capacity approaching 100%

**Phase to address:**
Phase 3 (API Integration) — Retry logic with exponential backoff should be part of the base API client implementation.

---

### Pitfall 5: The "Creepy Uncanny Valley" — Over-Personalization Backfires

**What goes wrong:**
The AI references obscure personal details, old social media posts, or information that feels invasive, triggering the "uncanny valley of mind" effect. Recipients feel surveilled rather than impressed. Messages that feel "almost human but not quite" create discomfort. While 71% of consumers expect personalization, 75% find many personalization tactics "creepy." Over-personalization can perform worse than generic outreach.

**Why it happens:**
Developers assume more personalization = better results without testing the threshold. Web search returns personal information (social posts, photos, hobbies) and prompts don't filter for appropriateness. The AI doesn't understand social context of what's "too personal" for a cold message. Referencing old content (e.g., 2019 blog post) signals deep stalking rather than timely research.

**How to avoid:**
- **Design prompt guardrails:** "Focus on professional information only (role, company, recent business news). Avoid personal hobbies, family, or social media posts."
- **Recency filter:** "Only reference information from the past 6 months"
- **Relevance test:** Information should relate to business value proposition, not prove research depth
- **User testing:** Show generated openers to target persona and ask "Would this feel creepy?"
- Consider a "personalization intensity" setting (v2): let users choose depth
- Default to Trigger Angle (news/events) rather than deep personal research

**Warning signs:**
- Generated openers reference personal hobbies, family, or old social posts
- Outputs mention information unrelated to business context
- Test users react with "How did you find that?" rather than "This is relevant"
- Personalization feels like proof of research rather than relevant context
- Recipients report feeling "creeped out" (user feedback)

**Phase to address:**
Phase 2 (Prompt Engineering) + Phase 4 (Testing with Real Data) — Guardrails go in prompts; testing with real personas surfaces the "creepy" threshold.

---

### Pitfall 6: Unvalidated Environment Variables — API Keys Exposed or Missing

**What goes wrong:**
The application deploys to Vercel without the `ANTHROPIC_API_KEY` environment variable, crashes on first request, or worse, the key is accidentally committed to the repository or exposed in client-side code via `NEXT_PUBLIC_` prefix. In April 2026, a Vercel breach exposed environment variables not marked as "sensitive," highlighting the risk of insufficiently protected secrets.

**Why it happens:**
Developers test locally with `.env.local` but forget to add keys to Vercel dashboard. The "sensitive" flag is OFF by default in Vercel; keys are stored unencrypted unless explicitly marked. Misuse of `NEXT_PUBLIC_` prefix (which inlines values into client bundles) exposes server-only secrets. Preview deployments use production keys, creating unnecessary exposure surface.

**How to avoid:**
- **Never commit `.env` files** to git (add to `.gitignore`)
- **Mark all API keys as "Sensitive"** in Vercel environment variable settings
- **Never use `NEXT_PUBLIC_` prefix** for API keys (this embeds them in client JavaScript)
- Validate environment variables at application startup (throw error if missing)
- Use separate keys for Preview vs Production environments
- Implement API key rotation plan (keys should be rotatable without code changes)
- Add detection for accidentally committed secrets (GitHub secret scanning, pre-commit hooks)

**Warning signs:**
- Application crashes in production with "API key missing" error
- Environment variables not marked "Sensitive" in Vercel dashboard
- `.env` files tracked in git (check `git log --all --full-history -- .env`)
- API key visible in client-side network requests or page source
- Same API key used for preview and production

**Phase to address:**
Phase 1 (Project Setup) — Environment variable strategy should be established before any code is written. Add validation in Phase 3 (API Integration).

---

### Pitfall 7: Clipboard API Fails on Non-HTTPS or Unfocused Tabs

**What goes wrong:**
The "Copy" button silently fails or throws errors because `navigator.clipboard` is undefined (non-HTTPS context) or requires user permission (browser security). Users click "Copy," see "Copied!" feedback, but nothing is actually copied to clipboard. This destroys trust in the product immediately.

**Why it happens:**
`navigator.clipboard` requires HTTPS (secure context) to function; doesn't work on localhost IP addresses (e.g., `192.168.x.x`) or custom domains without SSL. Clipboard access requires the page to be the active tab; fails if user switches tabs during generation. Developers test on `localhost` (which bypasses HTTPS requirement) and assume production will work. Content Security Policy headers can block clipboard access if missing `clipboard-write` permissions.

**How to avoid:**
- **Implement fallback strategy:** Try `navigator.clipboard.writeText()` first, fall back to `document.execCommand('copy')` for insecure contexts
- **Check for clipboard availability** before rendering copy button: `typeof window !== 'undefined' && navigator.clipboard`
- **Test on deployed preview URL** (Vercel auto-provisions HTTPS, but test to confirm)
- Handle permission errors gracefully: show "Allow clipboard access" prompt if needed
- Verify CSP headers include clipboard permissions
- Show error state if copy fails: "Copy failed — please select and copy manually"

**Warning signs:**
- "Copy" functionality works locally but fails in production
- `navigator.clipboard` is undefined in browser console (production)
- Users report "Copy button doesn't work"
- Browser console shows "Clipboard API requires secure context"
- Copy works sometimes but not consistently (tab focus issue)

**Phase to address:**
Phase 3 (API Integration) or Phase 5 (Polish & Deploy) — Clipboard functionality is part of the UI/UX layer; should be tested during deployment testing.

---

### Pitfall 8: Unbounded Token Costs — API Bills Skyrocket Unexpectedly

**What goes wrong:**
Claude API costs exceed budget due to unbounded token consumption. At $3/million input tokens and $15/million output tokens (Sonnet 4.6), even moderate usage can generate $500-2000/month bills. Developers discovered $350 overages in a single week in documented cases. The project becomes financially unsustainable before product-market fit.

**Why it happens:**
No usage monitoring or alerts configured; costs are invisible until the bill arrives. Web search results bloat context windows with irrelevant content (encrypted_content field can be large). Long user inputs (detailed product descriptions) multiply token costs. No per-user or per-request rate limiting allows abuse or runaway usage. Developers test extensively in production without realizing token costs accumulate.

**How to avoid:**
- **Set up usage monitoring** in Anthropic Console; configure alerts for daily spend thresholds
- **Implement rate limiting:** Max 10 requests per IP per hour (adjust based on expected usage)
- **Add cost estimation** before API call: calculate approximate tokens, abort if excessive
- **Truncate inputs:** Limit product description to 500 chars, company description to 300 chars
- **Monitor context size:** Log input/output token counts for each request
- Set up Anthropic spend limits (if available) or build kill switch for runaway costs
- Use prompt caching for system prompts (reduces input token costs by ~90% for repeated content)
- Test in development environment (Anthropic supports separate dev keys with lower limits)

**Warning signs:**
- No usage dashboard or monitoring configured
- No per-user or per-IP rate limiting implemented
- API calls succeed with no cost visibility
- Input token counts regularly exceed 10k (indicates bloated context)
- Testing in production without tracking token consumption

**Phase to address:**
Phase 3 (API Integration) — Rate limiting and cost monitoring should be designed into the API architecture from the start.

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Using simple spinner instead of streaming response | Faster to implement (1 hour vs. 4 hours) | Users experience 10s timeout errors on Vercel Hobby plan; can't scale to longer generations | Only if deploying to Pro plan (60s timeout) AND confident generation completes in <8s |
| Skipping exponential backoff for API retries | Works fine during low-traffic testing | 429 errors compound under load; users see failures during traffic spikes | Never — retry logic is <50 lines and prevents production fires |
| Same API key for preview and production | One key to manage instead of two | Security breach or leaked preview URL exposes production key | Never — separate keys cost nothing and limit blast radius |
| No rate limiting on API routes | Deploy faster without building queue/throttle | Open to abuse; single user can drain API budget in hours | MVP only if usage is gated (waitlist, personal use) AND monitoring configured |
| Generic error messages ("Something went wrong") | Simpler error handling code | Impossible to debug user-reported issues; poor UX | Never — specific errors (rate limit, timeout, API error) are trivial to implement |
| Using `document.execCommand('copy')` only (deprecated) | Works everywhere without HTTPS | Deprecated API; browsers may remove support; fails on modern mobile browsers | Never — implement clipboard API with execCommand fallback (best of both) |

---

## Integration Gotchas

Common mistakes when connecting to external services.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Claude API | Treating web_search responses as plain text | Web search returns `encrypted_content` field that must be passed back to Claude for citation generation; never directly parse this field |
| Claude API | Ignoring `retry-after` header in 429 responses | Read `retry-after` header and wait that exact duration before retrying; prevents compounding rate limit issues |
| Claude API | Not using prompt caching | System prompts are repeated on every request; enable prompt caching to reduce input token costs by ~90% for static prompt portions |
| Vercel Deployment | Assuming local timeouts match production | Vercel enforces 10s (Hobby) or 60s (Pro) timeouts; test with realistic network latency and configure `maxDuration` explicitly |
| Vercel Environment Variables | Not marking API keys as "Sensitive" | All secrets should be marked "Sensitive" in Vercel dashboard; default is unencrypted storage |
| Web Search (Claude) | Expecting real-time data | Search results can be stale (days to weeks old); always include date context in prompts and verify recency of results |
| Clipboard API | Only testing on localhost | `navigator.clipboard` requires HTTPS; localhost bypasses this but production doesn't; test on deployed preview URLs |

---

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| No caching of web search results for identical queries | Every duplicate prospect search costs $0.01 web search fee + tokens | Implement simple in-memory cache (LRU, 1-hour TTL) for search results by company name | >100 users/day or >10% duplicate searches |
| Loading all generated openers into DOM at once | Page feels sluggish after generation; mobile browsers struggle | Stream or progressively render openers as they generate | Output >2000 characters or mobile users report lag |
| No timeout on Claude API calls | Requests hang indefinitely if Claude API degrades | Set explicit timeout (20 seconds) and fail gracefully | First production incident when API is slow |
| Synchronous API route (no streaming) | User sees blank screen for 10-20 seconds | Implement SSE streaming or chunked responses to show progress | User testing shows >5s feels "broken" |
| Unlimited concurrent API requests per user | Single user submits 10 forms rapidly, draining quota | Add client-side debounce (1 request per 5 seconds) + server-side queue | First malicious/accidental abuse |

---

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Accepting unbounded user input (company name, product description) | Prompt injection attacks; users craft inputs that manipulate system prompt behavior | Validate and sanitize inputs; limit length (500 chars); escape special characters; use Claude's prompt injection defenses |
| Not validating web search results before display | XSS attacks if search results contain malicious scripts; reputation damage if displaying misinformation | Parse and sanitize any displayed search content; use React's built-in XSS protection; never render raw HTML from search |
| Exposing full API error messages to users | Leaks internal architecture, API keys (partial), rate limit details to potential attackers | Log full errors server-side; return generic user-facing messages ("Unable to generate. Please try again.") |
| No CORS configuration on API routes | API can be called from any origin; enables abuse, quota theft, unauthorized usage | Configure CORS to allow only your domain; add origin validation in API middleware |
| Storing generated outputs without user consent | GDPR/privacy violations if storing prospect names, companies, research data | Keep application stateless (per spec); if adding storage (v2), require explicit consent and data retention policy |

---

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| No loading time estimate | Users don't know if 15 seconds is normal or broken; abandon before completion | Show realistic estimate: "This usually takes 15-20 seconds" with progress indicator |
| "Copied!" feedback disappears too quickly (<1 second) | Users unsure if copy actually worked; may copy again or paste to verify | 2-second "Copied!" state (per project spec) with clear visual confirmation |
| Displaying all three openers equally | Cognitive overload; users unsure which to use first | Rank or label by use case: "Best for LinkedIn," "Best for cold email," "Best for cold call" |
| Generic error message with no guidance | Users don't know if they should retry, change input, or give up | Specific errors: "Rate limit reached — try again in 30 seconds" with retry timer or button |
| No preview of what will be copied | Users copy blindly and paste into email, then realize formatting is wrong | Show preview of copied format: "Hook + follow-up (2 paragraphs)" with example |
| Empty state when form is untouched | Page feels unfinished or broken on first load | Add example/demo openers or "Try it with these example inputs" placeholder |
| No indication of required fields | Users submit incomplete form, see validation errors, feel frustrated | Mark required fields clearly; disable submit until required fields complete |

---

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Clipboard Copy:** Often missing fallback for non-HTTPS contexts — verify works on deployed preview URL, not just localhost
- [ ] **Error Handling:** Often missing specific error types (timeout, rate limit, API error) — verify all error paths return user-friendly messages with actionable guidance
- [ ] **Loading States:** Often missing realistic time estimates — verify users see "15-20 seconds" not just generic spinner
- [ ] **Environment Variables:** Often missing "Sensitive" flag in Vercel — verify all API keys marked sensitive in dashboard
- [ ] **Rate Limiting:** Often missing per-IP or per-user throttling — verify single user can't make >10 requests in 60 seconds
- [ ] **API Retry Logic:** Often missing exponential backoff — verify 429 errors trigger increasing delays, not immediate retry
- [ ] **Timeout Handling:** Often missing explicit timeout config — verify API routes have `maxDuration` set or stream responses
- [ ] **Input Validation:** Often missing length limits on text fields — verify product description truncates at 500 chars
- [ ] **Citation Display:** Often missing source attribution — verify generated openers include "Based on web search" or citation links (if displaying research)
- [ ] **Mobile Responsiveness:** Often looks fine on desktop but breaks on mobile — verify form, openers, copy buttons work on 375px width

---

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Robotic AI voice detected by users | LOW | Update system prompt with anti-patterns and tone specs; regenerate test outputs; compare before/after |
| Hallucination damages credibility | HIGH | Immediate: Pull product offline if widespread. Add citation requirements to prompts. Test with known prospects. Relaunch with disclaimer. |
| Vercel timeout errors | MEDIUM | Upgrade to Pro plan ($20/month for 60s timeout) OR implement streaming response (4-8 hours dev time) |
| Rate limit errors in production | LOW | Implement exponential backoff (2 hours dev time); request higher limits from Anthropic (1-2 day approval) |
| Over-personalization creeps users out | MEDIUM | Add prompt guardrails for professional context only; re-test with target personas; may need to retrain user expectations |
| API keys exposed in commit history | CRITICAL | Immediately rotate keys in Anthropic dashboard; audit Vercel deployments for key usage; scan commit history and rewrite if public repo |
| Clipboard copy fails on production | LOW | Add fallback to `document.execCommand('copy')`; test on deployed URL (1 hour fix) |
| Unbounded API costs | MEDIUM | Set Anthropic spend limits; add rate limiting and cost monitoring (4 hours); audit recent usage for abuse patterns |

---

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Robotic AI Voice | Phase 2: Prompt Engineering | Generate 20 test openers; ask 5 target personas "Does this sound AI-written?" — <20% "yes" is acceptable |
| Hallucination | Phase 2: Prompt Engineering + Phase 4: Testing | Test with 10 known prospects where facts are verifiable; 100% accuracy required |
| Vercel Timeout | Phase 3: API Integration | Load test with realistic prompts; p95 response time <8 seconds |
| Rate Limiting | Phase 3: API Integration | Trigger 429 error intentionally; verify exponential backoff and user-facing retry message |
| Uncanny Valley | Phase 2: Prompt Engineering + Phase 4: Testing | User testing with 10 prospects; ask "Does this feel creepy?" — 0% "yes" required |
| Environment Variables | Phase 1: Project Setup | Verify `.env` in `.gitignore`; deploy to Vercel and confirm keys marked "Sensitive" |
| Clipboard Failure | Phase 5: Polish & Deploy | Test copy button on deployed preview URL (HTTPS); verify fallback works on HTTP |
| Unbounded Costs | Phase 3: API Integration | Configure Anthropic alerts; implement rate limiting; test with 100 simulated requests and verify cost <$1 |

---

## Sources

**AI Sales Outreach Quality & Detection:**
- La Growth Machine: "AI in Sales Outreach: 5 Mistakes to Avoid" (2025)
- HubSpot: "What Sales Reps Get Wrong When Leveraging AI for Sales Outreach" (2025)
- Hunter.io: "How To Use AI For Cold Email In 2025" (2025)
- Composio: "Why most AI agents fail at sales automation: 9 CRM integration failures" (2025)

**Claude API & Web Search:**
- Anthropic: "Web search tool - Claude API Docs" (official documentation)
- Anthropic: "Rate limits - Claude API Docs" (official documentation)
- Anthropic: "Errors - Claude API Docs" (official documentation)
- Apiyi.com: "Claude API web search complete tutorial" (2026)

**Vercel & Next.js Performance:**
- Inngest: "How to solve Next.js timeouts" (2025)
- OneUpTime: "How to Fix 'API Route' Timeout Errors in Next.js" (2026)
- Vercel: "Sensitive environment variables" (official documentation)
- GitGuardian: "Vercel April 2026 Incident: Non-Sensitive Environment Variables" (2026)

**AI Hallucinations & Data Quality:**
- IntuitionLabs: "AI Hallucinations in Business: Causes and Prevention" (2025)
- Spotlight.ai: "AI Hallucinations in Enterprise Sales: The Hidden Cost" (2025)
- TNW: "AI agents, outdated training and live search grounding" (2025)

**Security & Prompt Injection:**
- Oasis Security: "Claude.ai Prompt Injection Vulnerability" (2026)
- Cymulate: "InversePrompt: CVE-2025-54794 & CVE-2025-54795" (2026)
- Check Point: "RCE and API Token Exfiltration Through Claude Code" (2026)

**UX & Loading States:**
- Telerik: "Loading UI/UX Patterns for AI Applications" (2025)
- Vibe Coder: "Empty States, Loading States, Error States: The UX AI Forgets" (2025)
- eesel.ai: "A deep dive into the Slack AI loading states UX" (2025)

**Spam Filters & AI Detection:**
- TextPolish: "Cold Email in 2026: The Spam Filters Are Watching" (2026)
- Sales So: "Avoid Spam Filters with AI: Your Complete 2025 Guide" (2025)
- ScienceDirect: "Evaluating spam filters and Stylometric Detection of AI-generated phishing emails" (2025)

**Personalization & Trust:**
- ResearchGate: "That uncanny valley of mind: when anthropomorphic AI agents disrupt personalized advertising" (2024)
- Warm Revenue: "The Uncanny Valley of Personalization" (2025)
- ALM Corp: "LinkedIn Is the #2 Most Cited Source in AI Search" (2026)

**API Costs & Token Management:**
- IntuitionLabs: "LLM API Pricing Comparison (2025)" (2025)
- Morph: "The Real Cost of AI Coding in 2026: Pricing, Token Waste" (2026)
- CloudZero: "LLM API Pricing Comparison In 2026" (2026)

---
*Pitfalls research for: AI-Powered Sales Outreach Tools*
*Researched: 2026-05-13*
