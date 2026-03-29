/**
 * World AgentKit integration for Sanctuary
 *
 * Verifies that an agent's wallet is registered in AgentBook on World Chain,
 * proving it is backed by a real human (World ID holder).
 *
 * Docs: https://docs.world.org/agents/agent-kit/integrate
 *
 * Mode: FREE — proof of human only, no x402 payment required.
 */

import {
  createAgentBookVerifier,
  createAgentkitHooks,
  InMemoryAgentKitStorage,
  parseAgentkitHeader,
  verifyAgentkitSignature,
  validateAgentkitMessage,
  declareAgentkitExtension,
  type AgentkitMode,
  type AgentBookVerifier,
} from '@worldcoin/agentkit';

// -- AgentBook verifier (reads registration on World Chain) --
export const agentBook: AgentBookVerifier = createAgentBookVerifier();

// -- Storage: tracks usage per human per endpoint --
// Production: replace with DB-backed storage (Redis, Postgres, etc.)
const storage = new InMemoryAgentKitStorage();

// -- Mode: free = proof of human only, no payment --
const mode: AgentkitMode = { type: 'free' };

// -- Hooks for x402 resource server integration --
export const { requestHook } = createAgentkitHooks({
  agentBook,
  mode,
  storage,
  onEvent: (event) => {
    // Log verification events for observability
    if (process.env.NODE_ENV === 'development') {
      console.log('[AgentKit]', event.type, 'resource' in event ? event.resource : '');
    }
  },
});

// -- Extension declaration for protected routes --
// Tells agents what AgentKit capabilities are required
export const sanctuaryExtension = declareAgentkitExtension({
  statement: 'Verify your agent is backed by a real human to access Sanctuary',
  mode,
});

/**
 * Verify an incoming agent request using the x-agentkit header.
 *
 * Steps:
 * 1. Parse the CAIP-122 signed message from the header
 * 2. Validate message fields (domain, uri, nonce, expiration)
 * 3. Verify the cryptographic signature (EIP-191/1271/6492 or Ed25519)
 * 4. Look up the agent's wallet in AgentBook on World Chain
 *
 * @returns Verification result with address + humanId on success
 */
export async function verifyAgentRequest(
  headers: { get(name: string): string | null },
  requestUrl: string,
): Promise<{
  verified: boolean;
  address?: string;
  humanId?: string;
  error?: string;
}> {
  const agentkitHeader = headers.get('x-agentkit');
  if (!agentkitHeader) {
    return { verified: false, error: 'Missing x-agentkit header' };
  }

  try {
    // 1. Parse the CAIP-122 signed message
    const payload = parseAgentkitHeader(agentkitHeader);

    // 2. Validate message fields
    const validation = await validateAgentkitMessage(payload, requestUrl);
    if (!validation.valid) {
      return { verified: false, error: validation.error };
    }

    // 3. Verify the cryptographic signature
    const verification = await verifyAgentkitSignature(payload);
    if (!verification.valid) {
      return { verified: false, error: verification.error };
    }

    // 4. Look up human ID in AgentBook on World Chain
    const humanId = await agentBook.lookupHuman(payload.address, payload.chainId);
    if (!humanId) {
      return {
        verified: false,
        address: payload.address,
        error: 'Agent not registered in AgentBook',
      };
    }

    return { verified: true, address: payload.address, humanId };
  } catch {
    return { verified: false, error: 'Invalid agentkit payload' };
  }
}
