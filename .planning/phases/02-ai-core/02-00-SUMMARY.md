---
phase: 02-ai-core
plan: 00
subsystem: testing
tags: [msw, vitest, api-mocking, test-infrastructure, tdd]

# Dependency graph
requires:
  - phase: 01-foundation-and-api-contracts
    provides: "Type definitions (ProspectInput, OpenerOutput), Vitest configuration"
provides:
  - "MSW 2.x configured for Claude API mocking"
  - "Test scaffolds for all 13 Phase 2 requirements (GEN-01-05, OPENER-01-06, INFRA-02, INFRA-04)"
  - "Test infrastructure ready for Wave 1+ TDD implementation"
affects: [02-01, 02-02, wave-1, wave-2]

# Tech tracking
tech-stack:
  added: [msw@2.14.6]
  patterns:
    - "MSW for API mocking in tests (no real Claude API calls)"
    - "Placeholder tests with it.todo() for Wave 0 scaffolding"
    - "Centralized MSW server setup in tests/setup.ts"
    - "Mock handlers in tests/mocks/handlers.ts"

key-files:
  created:
    - tests/mocks/handlers.ts
    - tests/mocks/server.ts
    - tests/setup.ts
    - tests/lib/ai/generator.test.ts
    - tests/lib/ai/timeout.test.ts
    - tests/lib/ai/web-search.test.ts
    - tests/lib/ai/citations.test.ts
    - tests/lib/ai/voice.test.ts
    - tests/lib/ai/schema-validation.test.ts
    - tests/lib/ai/channel-calibration.test.ts
    - tests/api/rate-limit.test.ts
    - tests/api/error-handling.test.ts
  modified:
    - vitest.config.mts
    - package.json
    - pnpm-lock.yaml

key-decisions:
  - "Use MSW 2.x for API mocking to avoid hitting real Claude API during tests"
  - "Create placeholder tests (it.todo) in Wave 0, populate with real tests in Wave 1+"
  - "Mock Claude API responses with valid OpenerOutput structure (3 openers)"
  - "Centralize MSW lifecycle management in tests/setup.ts for all tests"

patterns-established:
  - "MSW Pattern: http.post handler for https://api.anthropic.com/v1/messages returns mock OpenerOutput"
  - "Test Scaffold Pattern: Each requirement gets test file with it.todo() placeholders"
  - "MSW Lifecycle: beforeAll starts server, afterEach resets handlers, afterAll closes server"

requirements-completed: [GEN-01, GEN-02, GEN-03, GEN-04, GEN-05, OPENER-01, OPENER-02, OPENER-03, OPENER-04, OPENER-05, OPENER-06, INFRA-02, INFRA-04]

# Metrics
duration: 389s
completed: 2026-05-15
---

# Phase 2 Plan 0: AI Core Test Infrastructure Summary

**MSW 2.x API mocking configured with 9 test scaffolds (18 placeholder tests) covering all 13 Phase 2 requirements for TDD workflow**

## Performance

- **Duration:** 6 min 29 sec (389s)
- **Started:** 2026-05-15T00:29:08Z
- **Completed:** 2026-05-15T00:35:37Z
- **Tasks:** 3/3 completed
- **Files modified:** 15 files (12 created, 3 modified)

## Accomplishments
- MSW 2.14.6 installed and configured for Claude API mocking without hitting real API
- 7 AI core test scaffolds created in tests/lib/ai/ with 18 placeholder tests
- 2 API route test scaffolds created in tests/api/ with 8 placeholder tests (total 26 placeholder tests across Wave 0)
- Test infrastructure enables fast test execution (<30s) and Nyquist compliance (every Wave 1+ task has test file)
- Phase 1 tests (18 passing) remain green, no regressions

## Task Commits

Each task was committed atomically:

1. **Task 1: Install MSW and Configure Test Infrastructure** - `462184b` (chore)
2. **Task 2: Create AI Core Test Scaffolds** - `2b34cc4` (test)
3. **Task 3: Create API Route Test Scaffolds** - `27b60fa` (test)

## Files Created/Modified

**MSW Infrastructure:**
- `tests/mocks/handlers.ts` - MSW request handler for Claude API, returns mock OpenerOutput with 3 openers
- `tests/mocks/server.ts` - MSW server setup with handlers
- `tests/setup.ts` - MSW lifecycle management (beforeAll/afterEach/afterAll)
- `vitest.config.mts` - Added setupFiles: ['./tests/setup.ts']

**AI Core Test Scaffolds (tests/lib/ai/):**
- `generator.test.ts` - GEN-01, OPENER-01-03 (4 placeholder tests)
- `timeout.test.ts` - GEN-02 (2 placeholder tests)
- `web-search.test.ts` - GEN-03 (2 placeholder tests)
- `citations.test.ts` - GEN-04 (2 placeholder tests)
- `voice.test.ts` - GEN-05 (2 placeholder tests)
- `schema-validation.test.ts` - OPENER-04-05 (3 placeholder tests)
- `channel-calibration.test.ts` - OPENER-06 (3 placeholder tests)

**API Route Test Scaffolds (tests/api/):**
- `rate-limit.test.ts` - INFRA-02 (4 placeholder tests)
- `error-handling.test.ts` - INFRA-04 (4 placeholder tests)

## Decisions Made

**1. MSW for API Mocking**
- **Decision:** Use MSW 2.x to intercept Claude API requests during tests
- **Rationale:** Avoids hitting real API (cost, latency, reliability), enables deterministic testing, follows Pattern 5 from 02-RESEARCH.md
- **Impact:** Tests run fast (<2s), no API key needed for test execution, no unbounded costs

**2. Placeholder Tests (it.todo) in Wave 0**
- **Decision:** Create test scaffolds with it.todo() placeholders, populate with real tests in Wave 1+
- **Rationale:** Follows TDD principles - establish test structure before implementation, enables Nyquist compliance
- **Impact:** Every Wave 1+ task can reference its test file, test-first workflow enabled

**3. Mock OpenerOutput Structure**
- **Decision:** Mock Claude API response includes valid OpenerOutput (3 openers: trigger, pain, curiosity)
- **Rationale:** Tests need realistic API response structure to validate parsing/validation logic
- **Impact:** Mock response mirrors real Claude API format, tests can validate OpenerOutputSchema

**4. Centralized MSW Setup**
- **Decision:** Single tests/setup.ts file manages MSW lifecycle for all tests
- **Rationale:** Avoids duplication, ensures consistent MSW behavior across test suites
- **Impact:** Any test can rely on MSW being active, handlers reset after each test

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - MSW installation and test scaffold creation completed without issues.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for Wave 1 Implementation:**
- Test infrastructure operational - MSW configured and verified
- 9 test scaffolds ready for Wave 1+ to populate with real test logic
- Phase 1 tests still passing (18/18) - no regressions
- Fast test execution baseline established (2s for full suite with placeholder tests)

**Wave 1 Tasks Can:**
- Reference test scaffolds by requirement ID (e.g., tests/lib/ai/generator.test.ts for GEN-01)
- Replace it.todo() with real test implementations following TDD flow
- Use MSW handlers for Claude API mocking (no real API calls needed)
- Maintain fast test execution (<30s target per 02-VALIDATION.md)

**No Blockers:**
- All 13 Phase 2 requirements have test scaffolds
- MSW operational and verified
- Ready for Wave 1 planning and execution

## Self-Check: PASSED

**Files Verification:**
- FOUND: tests/mocks/handlers.ts
- FOUND: tests/mocks/server.ts
- FOUND: tests/setup.ts
- FOUND: tests/lib/ai/generator.test.ts
- FOUND: tests/api/rate-limit.test.ts
- (All 15 files verified)

**Commits Verification:**
- FOUND: 462184b (Task 1: MSW infrastructure)
- FOUND: 2b34cc4 (Task 2: AI core test scaffolds)
- FOUND: 27b60fa (Task 3: API route test scaffolds)

All claimed files and commits exist. Summary verified.

---
*Phase: 02-ai-core*
*Completed: 2026-05-15*
