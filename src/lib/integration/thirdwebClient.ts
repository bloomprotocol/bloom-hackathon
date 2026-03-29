import { createThirdwebClient } from 'thirdweb';
import type { ThirdwebClient } from 'thirdweb';

const THIRDWEB_CLIENT_ID = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || '';

// Lazy-init to avoid crashing SSR/prerender when env var is missing
let _client: ThirdwebClient | null = null;

export const thirdwebClient: ThirdwebClient = new Proxy({} as ThirdwebClient, {
  get(_target, prop) {
    if (!_client) {
      if (!THIRDWEB_CLIENT_ID) {
        throw new Error('NEXT_PUBLIC_THIRDWEB_CLIENT_ID is not configured');
      }
      _client = createThirdwebClient({ clientId: THIRDWEB_CLIENT_ID });
    }
    return (_client as any)[prop];
  },
});
