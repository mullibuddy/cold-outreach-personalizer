import { beforeAll, afterEach, afterAll } from 'vitest'
import { server } from './mocks/server'

/**
 * MSW lifecycle management for test suite
 * Starts server before tests, resets handlers after each test, closes after all tests
 */

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' })
})

afterEach(() => {
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})
