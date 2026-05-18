# AI Cold Outreach Personalizer

> Generate three hyper-personalized cold outreach openers in 60 seconds — powered by Claude AI and live web search.

Built as part of the **Vibe Built Series** (Week 2) to solve a real problem: sales reps spend 20-30 minutes researching a prospect before writing a single cold email, and most still end up with something generic.

This tool collapses that research and writing into 60 seconds and produces openers that actually sound like they came from a human who did their homework.

---

## 🎯 The Problem

- **SDRs and AEs** waste hours researching prospects manually
- Most cold emails still sound generic and templated
- No easy way to find recent company news + prospect context quickly
- Balancing personalization with volume is nearly impossible

## ✨ The Solution

One simple form → Three completely different, highly specific openers ready to copy and send.

Each opener uses a different strategic angle:
- **Trigger Angle** - References recent company news (funding, launches, press)
- **Pain Angle** - Names a specific, relevant pain point for their role
- **Curiosity Angle** - Shares an insight or references something they said/wrote

### What Makes This Different

- **Live web search** - Finds recent news, company info, and prospect activity in real-time
- **No AI clichés** - No "I hope this finds you well" or "reaching out" garbage
- **Channel-calibrated** - Tone adjusts for cold email, LinkedIn DM, or cold call
- **Copy-ready** - Each opener comes with a follow-up line and strategy explanation

---

## 🚀 Demo

<!-- TODO: Add screenshot of the input form -->
<!-- TODO: Add screenshot of loading state -->
<!-- TODO: Add screenshot of results with three openers -->
<!-- TODO: Add GIF of full flow (optional) -->

### Example Output

**Input:**
- Prospect: Sarah, VP of Sales at Stripe
- Product: AI-powered sales outreach automation
- Channel: Cold Email

**Generated Opener (Trigger Angle):**
> "Sarah — Stripe just dropped 288 product launches at Sessions on May 7th, and your 2025 annual letter showed $1.9T in payment volume with 34% YoY growth. That kind of momentum means your sales team is probably onboarding faster than they can personalize outreach at scale. Mind if I share how other fintech VP Sales leaders handled exactly that inflection point?"

**Why This Works:** References specific event date and metrics (288 launches, $1.9T volume) - proves real research, not a template.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router) with TypeScript
- **Styling:** Tailwind CSS
- **AI Engine:** Anthropic Claude API (`claude-sonnet-4-6`) with web search
- **Rate Limiting:** Upstash Redis (optional)
- **Deployment:** Vercel-ready

### Why This Stack?

- **Next.js 14** - Server-side API routes keep API keys secure
- **Claude with web search** - Live research capabilities built-in
- **Stateless design** - No database needed, fully scalable
- **TypeScript + Zod** - Type-safe from input to output

---

## 📦 Installation

### Prerequisites

- Node.js 18+ and pnpm
- Anthropic API key ([get one here](https://console.anthropic.com/settings/keys))

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/cold-outreach-personalizer.git
   cd cold-outreach-personalizer
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your Anthropic API key:
   ```
   ANTHROPIC_API_KEY=your_key_here
   ```

4. **Run the development server**
   ```bash
   pnpm dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)**

---

## 🏗️ Project Structure

```
/cold-outreach-personalizer
├── app/
│   ├── page.tsx                 # Main page with form + results
│   ├── layout.tsx               # Root layout
│   └── api/
│       └── generate/
│           └── route.ts        # API endpoint (calls Claude)
├── components/
│   ├── InputForm.tsx           # 5-field prospect input form
│   ├── LoadingState.tsx        # Animated status messages
│   ├── OpenerCard.tsx          # Reusable card for each angle
│   ├── IntelSummary.tsx        # Collapsible research findings
│   └── CopyButton.tsx          # One-click copy to clipboard
├── lib/
│   ├── ai/
│   │   ├── client.ts           # Claude API wrapper
│   │   └── prompts.ts          # Prompt engineering
│   └── rate-limit/
│       └── limiter.ts          # Rate limiting logic
├── types/
│   ├── prospect.ts             # Input validation schemas
│   ├── opener.ts               # Output validation schemas
│   └── api.ts                  # API response types
└── tests/                      # Unit & integration tests
```

---

## 🧠 How It Works

### 1. Input Collection
User provides 5 pieces of info:
- Prospect first name
- Job title
- Company name
- Your product/service (1-2 sentences)
- Channel (email/LinkedIn/call)

### 2. Live Web Research
Claude uses the `web_search_20250305` tool to find:
- Recent company news (last 90 days preferred)
- Prospect's public activity (LinkedIn, interviews, blog posts)
- Industry context for credible pain points

### 3. AI Generation
Claude generates three openers using distinct strategies:
- **Trigger:** Recent event-based hook
- **Pain:** Role-specific pain point
- **Curiosity:** Insight or reference to their content

### 4. JSON Response Handling
Custom `extractJSON()` method handles:
- Markdown code block wrapping
- Preamble text before JSON
- Nested object parsing

### 5. UI Display
Three cards with:
- Color-coded left borders (slate/sage/amber)
- Angle badges
- Copy-to-clipboard functionality
- Collapsible research summary with citations

---

## 🎨 Design Principles

Built with a **Notion meets Linear** aesthetic:

- White space first - let the output breathe
- No gradients, no loud colors, no AI clichés
- Subtle color accents to differentiate angles
- Clean typography hierarchy
- Always-visible copy buttons (not hidden on hover)
- Mobile-responsive from the start

---

## 🔧 Key Technical Decisions

### Why Claude Sonnet 4?
- Best-in-class reasoning for strategic angle selection
- Web search tool integration (not all models support this)
- Reliable JSON output with proper extraction handling

### Why No Database?
- Stateless = infinitely scalable
- No user accounts = zero friction to try
- Privacy-first (we don't store prospect data)

### JSON Extraction Strategy
Claude sometimes wraps JSON in markdown or adds explanatory text. The `extractJSON()` method:
1. Checks for markdown code blocks first
2. Falls back to brace-matching algorithm
3. Handles nested objects correctly

See `lib/ai/client.ts:18-50` for implementation.

### Rate Limiting
Simple IP-based rate limiting (10 requests/hour) to prevent abuse without requiring auth.

---

## 🚢 Deployment

### Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repo
   - Add `ANTHROPIC_API_KEY` to environment variables
   - Deploy

3. **Configure Function Timeout**
   - API route uses `maxDuration = 60` (already set in code)
   - Requires Vercel Pro plan for 60s timeout (Hobby plan = 10s max)

---

## 📊 What I Learned Building This

### 1. Prompt Engineering for JSON
Getting Claude to return **only** JSON (no markdown, no preamble) required:
- Explicit "Return ONLY valid JSON" instructions
- Fallback extraction logic for when it doesn't listen
- Schema validation with Zod for safety

### 2. Web Search Timing
- Web search adds 20-40 seconds to response time
- Users need **visible progress indicators** or they'll bounce
- Staggered status messages build trust during the wait

### 3. Channel Calibration Matters
The same opener for a cold email vs. LinkedIn DM vs. cold call needs different:
- **Length** (email = 2-3 sentences, call = shorter)
- **Tone** (email = formal, LinkedIn = conversational)
- **Structure** (call = assume interruption)

### 4. Copy UX
Small detail, big impact:
- "Copy" button changes to "✓ Copied!" for 2 seconds
- Copies hook + follow-up together (not just the hook)
- Users reported this saved them from having to manually combine text

---

## 🎯 Future Ideas (Not in v1)

- **Bulk mode** - Upload CSV, generate openers for 100 prospects
- **Email sequence builder** - Extend from opener to full 3-touch sequence
- **A/B variant generator** - Multiple versions of the same angle
- **Chrome extension** - Generate directly from LinkedIn profile page
- **Save history** - Local storage of past generated openers

---

## 🤝 Contributing

This is a personal showcase project, but feel free to:
- Fork it and build your own version
- Open issues for bugs or suggestions
- Share what you learned if you remix it

---

## 📝 License

MIT License - see LICENSE file for details

---

## 🙏 Acknowledgments

- Built with [Claude Code](https://claude.com/claude-code) - Anthropic's CLI tool
- Part of the **Vibe Built Series** (Week 2)
- Spec-driven development FTW

---

## 📬 Connect

Built by **Brian Saporito**

- LinkedIn: [Your LinkedIn URL]
- GitHub: [Your GitHub username]
- Twitter/X: [Your handle]

---

**Built in 3 days. Saves 30 minutes per prospect. That's the vibe.**
