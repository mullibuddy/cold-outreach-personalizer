# AI Cold Outreach Personalizer

## What This Is

A web app that generates three hyper-personalized cold outreach openers for any prospect — each using a different angle — powered by live web search and Claude AI. One form, one output, immediately usable for cold emails, LinkedIn DMs, or cold calls.

## Core Value

Collapse 20-30 minutes of prospect research and message writing into 60 seconds while producing openers that sound authentically human and well-researched.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] User can enter prospect details (first name, title, company, product/service description, channel)
- [ ] System generates three distinct personalized openers using Claude AI with web search
- [ ] Trigger Angle opener references recent company events/news
- [ ] Pain Angle opener addresses specific, relevant pain points for the prospect's role
- [ ] Curiosity Angle opener provides insights, asks sharp questions, or references prospect's public content
- [ ] Each opener includes hook, "Why This Works" explanation, follow-up line, and best channel recommendation
- [ ] User can copy hook + follow-up (formatted as two paragraphs) to clipboard with one click
- [ ] Copy button shows "Copied!" feedback for 2 seconds
- [ ] Intel summary shows 3-4 research bullet points in collapsible section
- [ ] Loading state shows simple spinner with "Generating..." message
- [ ] Error states show friendly message with "Try Again" button
- [ ] UI is clean and minimal (Notion/Linear aesthetic) with proper spacing
- [ ] Each opener card has distinct visual accent (slate, sage, amber borders)
- [ ] Channel badges show cold email, LinkedIn DM, or cold call recommendation
- [ ] Tool is fully stateless (no database, no user accounts)
- [ ] Works on mobile and desktop (responsive design)

### Out of Scope

- Bulk mode (CSV upload for multiple prospects) — v2
- Save/history functionality — v2
- A/B variant generator — v2
- Email sequence builder — v2
- Chrome extension — v2
- User accounts or authentication
- Database storage
- Real-time API streaming

## Context

**Problem**: Sales reps spend 20-30 minutes researching a prospect before writing a single cold message. Most still produce generic outreach that gets ignored. This tool is built for SDRs, AEs, founders doing outreach, and recruiters who need to send personalized cold messages at scale.

**Demo moment**: User types in a name, title, and company — hits Generate — and within seconds has three completely different, highly specific openers ready to copy and send. Each one has its own angle and strategy.

**Build philosophy**: This is Week 2 of the "Vibe Built Series" — a 3-day build following the same clean aesthetic as Week 1. Focus is on shipping fast while maintaining high UX quality.

## Constraints

- **Tech Stack**: Next.js 14 (App Router), Tailwind CSS, TypeScript — locked per spec
- **AI Layer**: Anthropic Claude API (`claude-sonnet-4-20250514`) with web search tool enabled — required
- **Timeline**: 3-day build (5 phases) — aggressive but achievable
- **Deployment**: Vercel — optimized for this stack
- **No Database**: Fully stateless design — simplifies deployment and reduces cost
- **Performance**: Output must arrive within reasonable time (under 30 seconds typical)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Simple spinner for loading (not staggered status messages) | Keep it minimal and clean - don't overcomplicate v1 | — Pending |
| Copy format: Hook + `\n\n` + Follow-up | Proper paragraph breaks for email/LinkedIn pasting | — Pending |
| Error handling: Show error with Retry button | Let user control retry - no auto-retry or graceful degradation in v1 | — Pending |

---
*Last updated: 2026-05-13 after initialization*
