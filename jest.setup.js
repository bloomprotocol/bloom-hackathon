// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Polyfills for Node.js environment
import { TextDecoder, TextEncoder } from 'util'
Object.assign(global, { TextDecoder, TextEncoder })

// Fetch polyfill for tests
import 'whatwg-fetch'

// MSW will be imported in individual tests that need it

// Mock environment variables
process.env.NEXT_PUBLIC_API_BASE_URL = 'http://localhost:3005'
process.env.NEXT_PUBLIC_PRIVY_APP_ID = 'test-privy-app-id'
process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = 'test-turnstile-key'

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
  takeRecords() {
    return []
  }
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
  useParams() {
    return {}
  },
}))

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }) => {
    // eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element
    return <img src={src} alt={alt} {...props} />
  },
}))

// Mock cookies-next
jest.mock('cookies-next', () => ({
  getCookie: jest.fn(),
  setCookie: jest.fn(),
  deleteCookie: jest.fn(),
  hasCookie: jest.fn(),
}))

// Mock OKX Connect to avoid ESM issues
jest.mock('@okxconnect/universal-provider', () => ({
  OKXUniversalProvider: jest.fn(() => ({
    connect: jest.fn(),
    disconnect: jest.fn(),
    signMessage: jest.fn(),
    request: jest.fn(),
  })),
}))

// Mock useOKXApp hook
jest.mock('@/hooks/auth-providers/useOKXApp', () => ({
  useOKXApp: () => ({
    connect: jest.fn().mockResolvedValue({ publicKey: 'test-public-key' }),
    disconnect: jest.fn().mockResolvedValue(undefined),
    signMessage: jest.fn().mockResolvedValue('test-signature'),
    publicKey: null,
    isConnecting: false,
    isSigning: false,
    lastSignature: null,
    error: null,
  }),
}))

// Suppress console errors in tests (optional)
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render')
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})

// Global test utilities
global.sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// Mock fetch globally
global.fetch = jest.fn()

// Reset mocks after each test
afterEach(() => {
  jest.clearAllMocks()
})