/**
 * Agent Authentication via Short Code
 *
 * Exchanges short code for JWT token and authenticates agent
 */

import { Suspense } from 'react';
import AgentAuthContent from './AgentAuthContent';

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Loading...</h1>
          <p className="text-gray-600">Please wait</p>
        </div>
      </div>
    </div>
  );
}

export default function AgentAuthPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AgentAuthContent />
    </Suspense>
  );
}
