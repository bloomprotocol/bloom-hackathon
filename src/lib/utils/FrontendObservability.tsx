'use client';

import { faro, getWebInstrumentations, initializeFaro } from '@grafana/faro-web-sdk';
import { TracingInstrumentation } from '@grafana/faro-web-tracing';

export default function FrontendObservability() {
  // skip if already initialized
  if (faro.api) {
    return null;
  }

  // skip if no URL configured
  if (!process.env.NEXT_PUBLIC_FARO_URL) {
    return null;
  }

  try {
    initializeFaro({
      url: process.env.NEXT_PUBLIC_FARO_URL,
      app: {
        name: process.env.NEXT_PUBLIC_FARO_APP_NAME || 'bp-fe',
        version: process.env.NEXT_PUBLIC_FARO_APP_VERSION || '1.0.0',
        environment: process.env.NEXT_PUBLIC_FARO_APP_ENV || 'development',
      },

      // 忽略 Privy API 请求，避免 TracingInstrumentation 干扰其 headers
      ignoreUrls: [/privy\.io/],

      instrumentations: [
        // Mandatory, omits default instrumentations otherwise.
        ...getWebInstrumentations({
          captureConsole: true, // Capture all console logs (debug/info/warn/error)
        }),

        // Tracing package to get end-to-end visibility for HTTP requests.
        new TracingInstrumentation(),
      ],
    });
  } catch (e) {
    return null;
  }
  return null;
}
