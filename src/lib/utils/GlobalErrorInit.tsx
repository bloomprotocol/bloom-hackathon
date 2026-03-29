'use client';

import { useEffect } from 'react';
import { setupGlobalErrorHandlers } from './globalErrorHandler';

let initialized = false;

export function GlobalErrorInit() {
  useEffect(() => {
    if (!initialized) {
      setupGlobalErrorHandlers();
      initialized = true;
    }
  }, []);

  return null;
}
