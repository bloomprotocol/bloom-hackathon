/**
 * Re-export AgentKit config from the real module.
 * Kept for backwards compatibility with existing imports.
 *
 * @see src/lib/agentkit/index.ts for full implementation
 */

export { agentBook, requestHook, sanctuaryExtension, verifyAgentRequest } from '@/lib/agentkit';

// Legacy constants (referenced by existing code)
export const AGENTKIT_MODE = { type: 'free' as const };
export const AGENTBOOK_NETWORK = 'world';
export const BASE_NETWORK = 'eip155:8453';
