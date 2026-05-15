import { setupServer } from 'msw/node'
import { handlers } from './handlers'

/**
 * MSW server instance for Vitest tests
 * Intercepts network requests and returns mock responses
 */
export const server = setupServer(...handlers)
