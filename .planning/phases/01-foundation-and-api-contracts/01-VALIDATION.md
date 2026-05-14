---
phase: 01
slug: foundation-and-api-contracts
status: draft
nyquist_compliant: false
wave_0_complete: false
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
| 01-01-01 | 01 | 1 | INFRA-01 | unit | `pnpm test tests/api.test.ts -t "stateless" -x` | ❌ W0 | ⬜ pending |
| 01-01-02 | 01 | 1 | INFRA-03 | unit | `pnpm test tests/env.test.ts -x` | ❌ W0 | ⬜ pending |
| 01-01-03 | 01 | 1 | INPUT-06 | unit | `pnpm test tests/validation.test.ts -x` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/env.test.ts` — stubs for INFRA-03 (env validation at startup)
- [ ] `tests/validation.test.ts` — stubs for INPUT-06 (Zod schema validation)
- [ ] `tests/api.test.ts` — stubs for INFRA-01 (stateless architecture verification)
- [ ] `vitest.config.mts` — Vitest configuration with jsdom environment
- [ ] Framework install: `pnpm add -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom vite-tsconfig-paths`

---

## Manual-Only Verifications

All phase behaviors have automated verification.

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 2s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
