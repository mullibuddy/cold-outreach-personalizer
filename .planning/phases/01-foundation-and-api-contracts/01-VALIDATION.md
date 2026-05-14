---
phase: 01
slug: foundation-and-api-contracts
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-05-14
---

# Phase 01 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1 with @testing-library/react |
| **Config file** | vitest.config.mts (Wave 0 creates) |
| **Quick run command** | `pnpm test` |
| **Full suite command** | `pnpm test --run` |
| **Estimated runtime** | ~2 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm test`
- **After every plan wave:** Run `pnpm test --run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 2 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-00-01 | 00 | 0 | INFRA-03 | unit | `pnpm vitest --version` | ✅ W0 | ⬜ pending |
| 01-00-02 | 00 | 0 | INFRA-01 | unit | `pnpm test --run` | ✅ W0 | ⬜ pending |
| 01-01-01 | 01 | 1 | INFRA-01 | unit | `pnpm run build && pnpm test --run` | ✅ W0 | ⬜ pending |
| 01-02-01 | 02 | 2 | INPUT-06 | unit | `pnpm test tests/validation.test.ts --run` | ✅ W0 | ⬜ pending |
| 01-02-02 | 02 | 2 | INFRA-03 | unit | `pnpm test tests/env.test.ts --run` | ✅ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] `tests/env.test.ts` — stubs for INFRA-03 (env validation at startup)
- [x] `tests/validation.test.ts` — stubs for INPUT-06 (Zod schema validation)
- [x] `tests/api.test.ts` — stubs for INFRA-01 (stateless architecture verification)
- [x] `vitest.config.mts` — Vitest configuration with jsdom environment
- [x] Framework install: `pnpm add -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom vite-tsconfig-paths`
- [x] Wave 0 plan created: 01-00-PLAN.md

---

## Manual-Only Verifications

All phase behaviors have automated verification.

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 2s
- [x] `nyquist_compliant: true` set in frontmatter
- [x] Wave 0 plan (01-00-PLAN.md) exists with wave: 0
- [x] Wave 1+ plans depend on 01-00

**Approval:** ready for execution
