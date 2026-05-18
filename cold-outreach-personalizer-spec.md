# AI Cold Outreach Personalizer — Build Spec
> Week 2 (Pivot) — Vibe Built Series | Hand this document to Claude Code to begin the build.

---

## Project Overview

**What it is:** A web app that generates three hyper-personalized cold outreach openers for any prospect — each using a different angle — powered by live web search and Claude AI. One form, one output, immediately usable.

**Why it exists:** Sales reps spend 20-30 minutes researching a prospect before writing a single cold email or LinkedIn message. Most still end up with something generic. This tool collapses that research and writing into 60 seconds and produces openers that actually sound like they came from a human who did their homework.

**Who uses it:** SDRs, AEs, founders doing their own outreach, recruiters, anyone sending cold messages professionally.

**The demo moment:** User types in a name, title, and company — hits Generate — and within seconds has three completely different, highly specific openers ready to copy and send. Each one has its own angle, its own strategy, and a follow-up line to keep the message going.

---

## Recommended Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Language:** TypeScript
- **AI Intelligence Layer:** Anthropic Claude API (`claude-sonnet-4-20250514`) with web search tool enabled
- **Deployment Target:** Vercel
- **No database required** — fully stateless, no user accounts

---

## Core Features — v1 Scope

### Input Form
Five fields — keep it lean. The lighter the lift, the more people use it.

| Field | Type | Required | Notes |
|---|---|---|---|
| Prospect First Name | Text | Yes | Used to personalize the openers naturally |
| Prospect Title | Text | Yes | e.g. "VP of Sales" |
| Prospect Company | Text | Yes | e.g. "HubSpot" |
| Your Product / Service | Text area | Yes | 1-2 sentences on what you sell |
| Channel | Dropdown | Yes | Cold Email / LinkedIn DM / Cold Call Opener |

**Channel options matter** — the tone and length of an opener changes significantly between a cold email, a LinkedIn DM, and a cold call. Claude should calibrate accordingly.

---

### Output — Three Personalized Openers

Each opener is presented as its own card. Clean, scannable, copy-ready.

---

#### Opener 1 — The Trigger Angle
*Lead with something that just happened at their company.*

- **The Hook:** A 1-2 sentence opening line referencing a recent company event — funding round, product launch, leadership change, press coverage, job posting trend, or expansion
- **Why This Works:** A one-line explanation of the strategic angle (e.g. "They just raised a Series B — growth means hiring, hiring means process gaps")
- **Follow-Up Line:** A second sentence that bridges from the trigger to your product without being salesy
- **Best For:** Badge showing the ideal channel for this angle
- **[Copy] button** — copies the hook + follow-up line together

---

#### Opener 2 — The Pain Angle
*Lead with the problem they're most likely sitting with right now.*

- **The Hook:** A 1-2 sentence opening line that names a specific, relevant pain point for their role and company stage — without being presumptuous or generic
- **Why This Works:** Brief explanation of why this pain is likely for this specific person/company
- **Follow-Up Line:** Transition line that connects the pain to what you do
- **Best For:** Badge showing ideal channel
- **[Copy] button**

---

#### Opener 3 — The Curiosity / Insight Angle
*Lead with something that makes them think, not just react.*

- **The Hook:** A 1-2 sentence opener that shares a counterintuitive insight, asks a sharp question, or references something specific the prospect has said or written publicly (LinkedIn post, interview, company blog)
- **Why This Works:** Brief explanation of the psychology — why this angle creates curiosity and earns a response
- **Follow-Up Line:** Soft bridge into your product or ask
- **Best For:** Badge showing ideal channel
- **[Copy] button**

---

#### Bonus Element — Quick Intel Summary
Below the three openers, show a collapsed "What we found" section. When expanded, it shows 3-4 bullet points of the raw research Claude pulled — recent news, company info, relevant context. This builds trust in the output and makes the tool feel like it actually did the work.

---

## UI/UX Direction

**Same aesthetic as Week 1** — clean and minimal, Notion meets Linear. Consistency across the series matters for brand recognition.

**Design Principles:**
- White space first — let the output breathe
- Each opener card has a subtle left border accent in a different muted color (slate, sage, amber) to visually differentiate the three angles
- Angle label ("Trigger," "Pain," "Curiosity") as a small badge/tag at the top of each card
- "Why This Works" section in a lighter type weight — supporting info, not the headline
- Copy button is always visible, not hidden behind hover
- No gradients, no loud colors, no AI clichés

**Layout:**

```
[Header — App name + tagline]
[Input Form — centered card, five fields, clean]
         ↓ [Generate Openers button]
[Loading state — animated status messages]
[Output — three opener cards stacked vertically]
[Collapsed "What we found" intel summary]
[Footer — "Built with Claude AI + Web Search"]
```

**Loading State — Same approach as Week 1:**
Staggered status messages while generating:
1. `Searching for recent news on [Company]...`
2. `Researching [First Name]'s background...`
3. `Identifying pain points for a [Title]...`
4. `Writing your three openers...`

**Channel Badge Colors:**
- Cold Email — slate blue
- LinkedIn DM — muted indigo
- Cold Call — warm amber

---

## API Integration

Use the Anthropic Claude API with web search enabled. Same pattern as Week 1.

### API Call Structure

```typescript
const response = await anthropic.messages.create({
  model: "claude-sonnet-4-20250514",
  max_tokens: 3000,
  tools: [
    {
      type: "web_search_20250305",
      name: "web_search"
    }
  ],
  system: `You are an elite sales copywriter and prospect researcher. Your job is to generate cold outreach openers that are so specific and relevant that prospects think the sender spent hours on them.

You have access to web search. Use it to find:
- Recent news about the company (last 90 days preferred)
- Anything public about the prospect — LinkedIn activity, press mentions, interviews, company blog posts
- Industry context that makes the pain angle credible and specific

Return your response as a structured JSON object. Every opener must be specific to this person and company. Nothing generic. If someone removed the prospect's name, the opener should still be obviously written for them.`,
  messages: [
    {
      role: "user",
      content: `Generate three personalized cold outreach openers for the following prospect.

Prospect: ${firstName} — ${title} at ${company}
My Product/Service: ${productDescription}
Channel: ${channel}

Search the web for recent news about ${company} and anything public about ${firstName} in their role as ${title}.

Return ONLY valid JSON matching this exact schema — no markdown, no preamble:

{
  "intelSummary": [
    "string — specific fact found about the company or prospect",
    "string",
    "string"
  ],
  "triggerAngle": {
    "hook": "string — 1-2 sentence opener referencing a recent company trigger",
    "whyThisWorks": "string — brief explanation of the strategic angle",
    "followUpLine": "string — bridge from trigger to product",
    "bestFor": "string — ideal channel for this angle"
  },
  "painAngle": {
    "hook": "string — 1-2 sentence opener naming a specific relevant pain",
    "whyThisWorks": "string — why this pain is likely for this specific person",
    "followUpLine": "string — connect pain to product",
    "bestFor": "string — ideal channel"
  },
  "curiosityAngle": {
    "hook": "string — insight, sharp question, or reference to something they said/wrote",
    "whyThisWorks": "string — the psychology behind why this earns a response",
    "followUpLine": "string — soft bridge to product or ask",
    "bestFor": "string — ideal channel"
  }
}

Calibrate length and tone to the channel: Cold Email = slightly more formal, 2 sentences max per section. LinkedIn DM = conversational, punchy. Cold Call Opener = spoken-word natural, short and snappy.`
    }
  ]
});
```

### Response Handling
Parse the JSON and map each field to its corresponding UI card. Handle partial web search results gracefully — Claude will still generate strong openers using reasoning if live data is limited. Always show the intel summary even if it's thin — transparency builds trust.

---

## File Structure

```
/cold-outreach-personalizer
├── app/
│   ├── page.tsx                    # Main page — form + output
│   ├── layout.tsx                  # Root layout, fonts, metadata
│   └── api/
│       └── generate/
│           └── route.ts           # API route — calls Anthropic, returns JSON
├── components/
│   ├── InputForm.tsx              # Five-field input form
│   ├── LoadingState.tsx           # Animated status message sequence
│   ├── OpenerCard.tsx             # Reusable card for each angle
│   ├── IntelSummary.tsx           # Collapsible "What we found" section
│   └── CopyButton.tsx             # Copy hook + follow-up to clipboard
├── lib/
│   └── anthropic.ts               # Anthropic client setup
├── types/
│   └── openers.ts                 # TypeScript types for the output schema
├── .env.local                     # ANTHROPIC_API_KEY
└── package.json
```

---

## Environment Setup

```
ANTHROPIC_API_KEY=your_key_here
```

Server-side only. Never expose to the client.

---

## Build Phases — Follow This Order

This is a 3-day build. Phases are designed so something is testable at the end of each day.

---

### Phase 1 — Scaffold & API Route (Day 1, First Half)
- Initialize Next.js 14 project with Tailwind + TypeScript
- Set up Anthropic client in `lib/anthropic.ts`
- Create `/api/generate` route
- Wire up Claude API call with web search tool
- Test with hardcoded inputs — confirm JSON returns correctly with all fields populated
- **Checkpoint:** Raw JSON response in the console with all three openers and intel summary

---

### Phase 2 — Input Form + Basic Output (Day 1, Second Half)
- Build `InputForm.tsx` with all five fields including channel dropdown
- Connect form to `/api/generate` route
- Render raw output on page (doesn't need to look good yet)
- Basic loading state (even just "Generating..." for now)
- **Checkpoint:** Full working loop — fill form, hit generate, see all three openers on screen

---

### Phase 3 — Opener Cards + Copy Functionality (Day 2, First Half)
- Build `OpenerCard.tsx` component with all fields:
  - Angle badge (Trigger / Pain / Curiosity)
  - Hook text
  - Why This Works (lighter weight)
  - Follow-Up Line
  - Best For badge
  - Copy button
- Build `CopyButton.tsx` — copies hook + follow-up line together to clipboard
- Build `IntelSummary.tsx` — collapsible section showing raw intel bullets
- **Checkpoint:** All three cards render correctly with real API data and copy works

---

### Phase 4 — Loading State + UI Polish (Day 2, Second Half)
- Build `LoadingState.tsx` with staggered status messages
- Apply full UI polish:
  - Card left border accent colors per angle
  - Typography hierarchy
  - Spacing and white space
  - Channel badge styling
  - Mobile responsiveness
- **Checkpoint:** Tool looks as good as it works — demo-ready visually

---

### Phase 5 — Testing & Demo Prep (Day 3)
- Run at least 5 real test cases:
  - A Fortune 500 VP (lots of news available)
  - A startup founder (limited public data)
  - A mid-market Director (typical use case)
  - Test each channel option (email, LinkedIn, cold call)
  - Test with your own product/service as the input
- Fix any edge cases — empty intel, long hook lines breaking layout, copy button feedback
- Record demo using a recognizable prospect/company
- **Checkpoint:** Five clean test runs, demo recorded, ready to post

---

## Error Handling & Edge Cases

- **Limited public data on prospect:** Intel summary notes "Limited public info found — openers based on role and industry context." Openers still generate.
- **Company not in recent news:** Trigger angle shifts to a hiring trend or industry pattern instead of a specific event — Claude should handle this automatically.
- **API timeout:** Friendly error message with retry button. Never show raw error output.
- **Copy button feedback:** Button text changes to "Copied!" for 2 seconds after click, then resets.

---

## LinkedIn Demo Checklist

Before recording:
- [ ] Use a well-known company for the demo (Salesforce, HubSpot, Gong, etc.)
- [ ] Use a real title that your target audience holds (VP of Sales, Head of Revenue, etc.)
- [ ] Show the loading sequence — don't cut it out
- [ ] Expand the intel summary in the video — proves it's doing real research
- [ ] Show the copy button working — paste one opener into a blank email draft
- [ ] Record on Chrome, 1080p minimum

---

## Post Hook for Week 2

> *"I just wrote a cold opener in 12 seconds that would have taken me 30 minutes to research and write. Here's the tool I built..."*

---

## v2 Ideas (Not This Week)

- Bulk mode — upload a CSV of prospects, generate openers for all of them
- Save and history — store past generated openers
- A/B variant generator — multiple versions of the same angle
- Email sequence builder — extend from opener to full 3-touch sequence
- Chrome extension — generate openers directly from a LinkedIn profile page

---

*Built by Brian | Week 2 — Vibe Built Series*
