# Requirements: AI Cold Outreach Personalizer

**Defined:** 2026-05-13
**Core Value:** Collapse 20-30 minutes of prospect research and message writing into 60 seconds while producing openers that sound authentically human and well-researched.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Input & Form

- [ ] **INPUT-01**: User can enter prospect first name
- [ ] **INPUT-02**: User can enter prospect job title
- [ ] **INPUT-03**: User can enter prospect company name
- [ ] **INPUT-04**: User can describe their product/service (text area)
- [ ] **INPUT-05**: User can select outreach channel (Cold Email / LinkedIn DM / Cold Call)
- [x] **INPUT-06**: Form validates all required fields before submission (Zod schemas complete)

### AI Generation

- [x] **GEN-01**: System generates three distinct personalized openers using Claude Sonnet 4 with web search
- [x] **GEN-02**: Generation completes within 30 seconds under normal conditions
- [x] **GEN-03**: System uses web search to find recent company news and prospect information
- [x] **GEN-04**: System enforces citation requirements to prevent hallucinations
- [x] **GEN-05**: Generated content avoids AI detection patterns (robotic voice, spam triggers)

### Opener Content

- [x] **OPENER-01**: Trigger Angle opener references recent company events/news
- [x] **OPENER-02**: Pain Angle opener addresses specific role-based pain points
- [x] **OPENER-03**: Curiosity Angle opener uses insights, questions, or public content references
- [x] **OPENER-04**: Each opener includes hook, "Why This Works" explanation, and follow-up line
- [x] **OPENER-05**: Each opener shows "Best For" channel recommendation
- [x] **OPENER-06**: Content is calibrated for selected channel (email/LinkedIn/call)

### User Actions

- [ ] **ACTION-01**: User can copy hook + follow-up to clipboard (formatted as two paragraphs)
- [ ] **ACTION-02**: Copy button shows "Copied!" feedback for 2 seconds
- [ ] **ACTION-03**: User can view collapsible intel summary showing research findings
- [ ] **ACTION-04**: User can retry generation after errors

### UI/UX

- [ ] **UI-01**: Form and results are mobile responsive
- [ ] **UI-02**: Clean, minimal aesthetic (Notion/Linear style) with proper spacing
- [ ] **UI-03**: Each opener card has distinct visual accent (slate/sage/amber borders)
- [ ] **UI-04**: Loading state shows simple spinner with "Generating..." message
- [ ] **UI-05**: Error states show friendly, specific messages with retry option
- [ ] **UI-06**: Channel badges visually distinguish Cold Email, LinkedIn DM, Cold Call

### Infrastructure

- [x] **INFRA-01**: Application is fully stateless (no database) (verified by test)
- [x] **INFRA-02**: API route implements rate limiting to prevent cost overruns
- [x] **INFRA-03**: Environment variables are properly secured (startup validation complete)
- [x] **INFRA-04**: Application handles API timeouts gracefully (streaming or timeout extension)
- [ ] **INFRA-05**: Deployment to Vercel succeeds with zero config

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Bulk Features

- **BULK-01**: User can upload CSV of multiple prospects
- **BULK-02**: System generates openers for all prospects in batch
- **BULK-03**: User can download results as CSV

### History & Personalization

- **HIST-01**: User can save generated openers
- **HIST-02**: User can view history of past generations
- **HIST-03**: User can select tone (formal/casual/direct)
- **HIST-04**: User can regenerate variations of same opener (A/B testing)

### Sequences & Integration

- **SEQ-01**: User can extend opener into full 3-touch email sequence
- **SEQ-02**: User can integrate with CRM (Salesforce, HubSpot)
- **SEQ-03**: Chrome extension generates openers from LinkedIn profile page

### User Accounts

- **AUTH-01**: User can create account with email/password
- **AUTH-02**: User can log in and access saved history
- **AUTH-03**: Usage is tracked per user for rate limiting

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Real-time streaming UI | Adds significant complexity; simple spinner sufficient for v1 |
| OAuth/Social login | No user accounts needed for stateless MVP |
| Database storage | Stateless by design; reduces infrastructure complexity |
| Email sending | Output only; users send via their own email client |
| Analytics/tracking | Privacy-first approach; no user behavior tracking |
| Multi-language support | English only for v1; validate demand first |
| Custom branding | Single tool design; no white-label needs |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| INPUT-01 | Phase 3 | Pending |
| INPUT-02 | Phase 3 | Pending |
| INPUT-03 | Phase 3 | Pending |
| INPUT-04 | Phase 3 | Pending |
| INPUT-05 | Phase 3 | Pending |
| INPUT-06 | Phase 1 | Complete (Zod schemas implemented with user-friendly errors) |
| GEN-01 | Phase 2 | Complete |
| GEN-02 | Phase 2 | Complete |
| GEN-03 | Phase 2 | Complete |
| GEN-04 | Phase 2 | Complete |
| GEN-05 | Phase 2 | Complete |
| OPENER-01 | Phase 2 | Complete |
| OPENER-02 | Phase 2 | Complete |
| OPENER-03 | Phase 2 | Complete |
| OPENER-04 | Phase 2 | Complete |
| OPENER-05 | Phase 2 | Complete |
| OPENER-06 | Phase 2 | Complete |
| ACTION-01 | Phase 3 | Pending |
| ACTION-02 | Phase 3 | Pending |
| ACTION-03 | Phase 3 | Pending |
| ACTION-04 | Phase 4 | Pending |
| UI-01 | Phase 3 | Pending |
| UI-02 | Phase 3 | Pending |
| UI-03 | Phase 3 | Pending |
| UI-04 | Phase 3 | Pending |
| UI-05 | Phase 4 | Pending |
| UI-06 | Phase 3 | Pending |
| INFRA-01 | Phase 1 | Complete (verified by test) |
| INFRA-02 | Phase 2 | Complete |
| INFRA-03 | Phase 1 | Complete (environment validated at startup with fail-fast) |
| INFRA-04 | Phase 2 | Complete |
| INFRA-05 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 32 total
- Mapped to phases: 32 (100% coverage)
- Unmapped: 0

---
*Requirements defined: 2026-05-13*
*Last updated: 2026-05-14T16:48:24Z after Plan 01-01 completion*
