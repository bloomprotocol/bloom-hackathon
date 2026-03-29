/**
 * useAgentSession Hook
 *
 * Manages Agent session state
 */

import { useState, useEffect } from 'react';

export interface AgentIdentityData {
  address: string;
  agentUserId?: number; // Optional: only available for registered agents
  identity: {
    personalityType: string;
    tagline: string;
    description: string;
    mainCategories: string[];
    subCategories: string[];
    confidence: number;
    mode: 'data' | 'manual';
    dimensions?: {
      conviction: number;
      intuition: number;
      contribution: number;
    };
    tasteSpectrums?: {
      learning: number;
      decision: number;
      novelty: number;
      risk: number;
    };
    strengths?: string[];
  };
  recommendations: Array<{
    skillId: string;
    skillName: string;
    description: string;
    matchScore: number;
    categories: string[];
    url: string;
    creator?: string;
  }>;
  wallet: {
    address: string;
    network: string;
    x402Endpoint: string;
    balance?: string;
  };
  createdAt: number;
  updatedAt: number;
}

export function useAgentSession() {
  const [agentData, setAgentData] = useState<AgentIdentityData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Try to load from localStorage on mount
    const cached = localStorage.getItem('agent-data');
    if (cached) {
      try {
        setAgentData(JSON.parse(cached));
      } catch (err) {
        console.error('Failed to parse cached agent data:', err);
      }
    }
  }, []);

  const authenticateWithToken = async (token: string) => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/agent/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Authentication failed');
      }

      // Save to state and localStorage
      if (data.agentData) {
        setAgentData(data.agentData);
        localStorage.setItem('agent-data', JSON.stringify(data.agentData));
      }

      return data.agentData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearSession = () => {
    setAgentData(null);
    localStorage.removeItem('agent-data');
  };

  return {
    agentData,
    loading,
    error,
    authenticateWithToken,
    clearSession,
  };
}
