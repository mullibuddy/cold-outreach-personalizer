# Roadmap: AI Cold Outreach Personalizer

**Created:** 2026-05-13
**Granularity:** Coarse (aggressive compression for 3-day build)
**Total Phases:** 4
**Requirements Coverage:** 32/32 (100%)

## Phases

- [ ] **Phase 1: Foundation & API Contracts** - Project setup, TypeScript schemas, environment config
- [ ] **Phase 2: AI Core** - Claude integration, prompt engineering, API routes with cost controls
- [ ] **Phase 3: User Interface** - Form input, results display, copy functionality, loading states
- [ ] **Phase 4: Production Ready** - Error handling, mobile polish, Vercel deployment

## Phase Details

### Phase 1: Foundation & API Contracts
**Goal**: Establish type-safe API contracts and environment configuration before any implementation

**Depends on**: Nothing (first phase)

**Requirements**: INFRA-01, INFRA-03, INPUT-06

**Success Criteria** (what must be TRUE):
1. TypeScript types and Zod schemas define all data structures (prospect input, generation output, error responses)
2. Next.js Route Handler skeleton exists with validation logic
3. Environment variables are configured securely (no API keys in git)
4. API contract documentation allows parallel frontend/backend development

**Plans**: TBD

---

### Phase 2: AI Core
**Goal**: Deliver working AI generation engine with cost controls and HTTP endpoints

**Depends on**: Phase 1 (needs schemas and environment config)

**Requirements**: GEN-01, GEN-02, GEN-03, GEN-04, GEN-05, OPENER-01, OPENER-02, OPENER-03, OPENER-04, OPENER-05, OPENER-06, INFRA-02, INFRA-04

**Success Criteria** (what must be TRUE):
1. Claude API with web_search tool returns three distinct personalized openers (Trigger, Pain, Curiosity angles) for any prospect
2. Each opener includes hook, "Why This Works" explanation, follow-up line, and channel recommendation
3. Generation completes within 30 seconds and handles timeouts gracefully
4. Rate limiting prevents cost overruns (10 requests/hour/IP enforced)
5. Content avoids robotic AI voice and includes citations to prevent hallucinations
6. API routes return structured JSON responses with proper error handling

**Plans**: TBD

---

### Phase 3: User Interface
**Goal**: Users can input prospect details, see loading state, and interact with generated openers

**Depends on**: Phase 2 (needs working API endpoints)

**Requirements**: INPUT-01, INPUT-02, INPUT-03, INPUT-04, INPUT-05, ACTION-01, ACTION-02, ACTION-03, UI-01, UI-02, UI-03, UI-04, UI-06

**Success Criteria** (what must be TRUE):
1. User can fill out prospect form (name, title, company, product description, channel) with validation
2. User can submit form and see loading state with "Generating..." message
3. User can view three distinct opener cards with visual accents (slate, sage, amber borders)
4. User can copy hook + follow-up to clipboard with one click and see "Copied!" feedback
5. User can view collapsible intel summary showing research findings
6. User can see channel badges distinguishing email/LinkedIn/call recommendations
7. UI works on mobile (375px width) and desktop with clean Notion/Linear aesthetic

**Plans**: TBD

---

### Phase 4: Production Ready
**Goal**: Application handles edge cases gracefully and is deployed to production

**Depends on**: Phase 3 (needs complete UI)

**Requirements**: ACTION-04, UI-05, INFRA-05

**Success Criteria** (what must be TRUE):
1. User sees specific, actionable error messages (rate limit, timeout, API failure, validation error)
2. User can retry generation after errors with clear guidance
3. Application is deployed to Vercel with HTTPS working (clipboard API functional)
4. Mobile responsiveness verified at 375px, 768px, 1024px breakpoints
5. Production smoke test passes with real prospects (no hallucinations, proper formatting)

**Plans**: TBD

---

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & API Contracts | 0/? | Not started | - |
| 2. AI Core | 0/? | Not started | - |
| 3. User Interface | 0/? | Not started | - |
| 4. Production Ready | 0/? | Not started | - |

## Dependencies

```
Phase 1 (Foundation)
    ↓
Phase 2 (AI Core)
    ↓
Phase 3 (User Interface)
    ↓
Phase 4 (Production Ready)
```

## Research Flags

**Phase 2 (AI Core)** - NEEDS RESEARCH
- Prompt engineering for sales outreach is domain-specific
- Research effective cold email structures, B2B tone calibration, spam filter avoidance
- Understand strategic angle differentiation (Trigger vs Pain vs Curiosity)
- Consider `/gsd:research-phase 2` before planning

**All other phases** - Standard patterns, no additional research needed

---
*Last updated: 2026-05-13 after roadmap creation*
