---
phase: 02
slug: ai-core
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-05-14
---

# Phase 02 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.6 (installed in Phase 1) |
| **Config file** | vitest.config.mts |
| **Quick run command** | `pnpm test` |
| **Full suite command** | `pnpm test:run` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm test {module}.test.ts` (unit tests for modified modules, < 5s)
- **After every plan wave:** Run `pnpm test tests/lib/ai tests/api` (integration tests with MSW mocks, < 30s)
- **Before `/gsd:verify-work`:** Full suite must be green (`pnpm test:run`)
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-00-01 | 00 | 0 | ALL | unit | `pnpm test tests/mocks tests/setup.ts --run` | ❌ W0 | ⬜ pending |
| 02-01-01 | 01 | 1 | GEN-01,OPENER-01,OPENER-02,OPENER-03 | integration | `pnpm test tests/lib/ai/generator.test.ts --run` | ❌ W0 | ⬜ pending |
| 02-01-02 | 01 | 1 | INFRA-02 | integration | `pnpm test tests/api/rate-limit.test.ts --run` | ❌ W0 | ⬜ pending |
| 02-02-01 | 02 | 2 | GEN-02 | integration | `pnpm test tests/lib/ai/timeout.test.ts --run` | ❌ W0 | ⬜ pending |
| 02-02-02 | 02 | 2 | GEN-03 | integration | `pnpm test tests/lib/ai/web-search.test.ts --run` | ❌ W0 | ⬜ pending |
| 02-03-01 | 03 | 3 | GEN-04 | unit | `pnpm test tests/lib/ai/citations.test.ts --run` | ❌ W0 | ⬜ pending |
| 02-03-02 | 03 | 3 | GEN-05 | unit | `pnpm test tests/lib/ai/voice.test.ts --run` | ❌ W0 | ⬜ pending |
| 02-04-01 | 04 | 4 | OPENER-04,OPENER-05 | unit | `pnpm test tests/lib/ai/schema-validation.test.ts --run` | ❌ W0 | ⬜ pending |
| 02-04-02 | 04 | 4 | OPENER-06 | integration | `pnpm test tests/lib/ai/channel-calibration.test.ts --run` | ❌ W0 | ⬜ pending |
| 02-05-01 | 05 | 5 | INFRA-04 | integration | `pnpm test tests/api/error-handling.test.ts --run` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/lib/ai/generator.test.ts` — stubs for GEN-01, OPENER-01, OPENER-02, OPENER-03 (Claude API with 3 angles)
- [ ] `tests/lib/ai/timeout.test.ts` — stubs for GEN-02 (30-second completion time)
- [ ] `tests/lib/ai/web-search.test.ts` — stubs for GEN-03 (web search invocation)
- [ ] `tests/lib/ai/citations.test.ts` — stubs for GEN-04 (citation URL validation)
- [ ] `tests/lib/ai/voice.test.ts` — stubs for GEN-05 (AI cliché detection)
- [ ] `tests/lib/ai/schema-validation.test.ts` — stubs for OPENER-04, OPENER-05 (Zod schema validation)
- [ ] `tests/lib/ai/channel-calibration.test.ts` — stubs for OPENER-06 (channel-specific content)
- [ ] `tests/api/rate-limit.test.ts` — stubs for INFRA-02 (10 req/hour/IP enforcement)
- [ ] `tests/api/error-handling.test.ts` — stubs for INFRA-04 (timeout handling)
- [ ] `tests/mocks/handlers.ts` — MSW request handlers for Claude API
- [ ] `tests/mocks/server.ts` — MSW server setup
- [ ] `tests/setup.ts` — MSW lifecycle (beforeAll/afterEach/afterAll)
- [ ] Update `vitest.config.mts` setupFiles: add `'./tests/setup.ts'`
- [ ] Install MSW: `pnpm add -D msw`
- [ ] Wave 0 plan created: 02-00-PLAN.md

---

## Manual-Only Verifications

All phase behaviors have automated verification.

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter
- [ ] Wave 0 plan (02-00-PLAN.md) exists with wave: 0
- [ ] Wave 1+ plans depend on 02-00

**Approval:** pending
