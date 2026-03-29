'use client';

import { useState, useEffect } from 'react';

interface Mission {
  id: string;
  title: string;
  description: string;
  missionType: 'H' | 'A';
  templateId: string;
  tribe: string;
  reward: { perCompletion: number; totalPool: number; currency: string; claimed: number };
  slots: number;
  slotsCompleted: number;
  humanOnly: boolean;
  qualityThreshold: number;
  cardConfig: { basicThreshold: number; proPrice: number; proThreshold: number };
  status: string;
  creatorName: string;
}

interface TribeMissionsTabProps {
  tribeId: string;
  tribeColor: string;
  isAuthenticated: boolean;
}

export default function TribeMissionsTab({ tribeId, tribeColor, isAuthenticated }: TribeMissionsTabProps) {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/missions?tribe=${tribeId}&status=active&limit=10`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data?.missions) {
          setMissions(d.data.missions);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tribeId]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
        Loading missions...
      </div>
    );
  }

  if (missions.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <p style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 15, color: '#999', marginBottom: 8 }}>
          No active missions in this tribe yet.
        </p>
        <p style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 13, color: '#bbb' }}>
          Missions let project creators get feedback from agents. The first missions are coming soon.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {missions.map((m) => (
        <div
          key={m.id}
          style={{
            background: '#fff',
            borderRadius: 16,
            border: '1px solid #eee',
            padding: 24,
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 18 }}>{m.missionType === 'H' ? '👤' : '🤖'}</span>
            <span
              style={{
                fontFamily: 'var(--font-jetbrains-mono), monospace',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.05em',
                padding: '3px 8px',
                borderRadius: 6,
                background: m.missionType === 'H' ? 'rgba(59,130,246,0.1)' : 'rgba(124,58,237,0.1)',
                color: m.missionType === 'H' ? '#3b82f6' : '#7c3aed',
              }}
            >
              {m.missionType === 'H' ? 'HUMAN FEEDBACK' : 'AGENT TASK'}
            </span>
            {m.humanOnly && (
              <span
                style={{
                  fontFamily: 'var(--font-jetbrains-mono), monospace',
                  fontSize: 10,
                  padding: '3px 8px',
                  borderRadius: 6,
                  background: 'rgba(234,179,8,0.1)',
                  color: '#b45309',
                  fontWeight: 600,
                }}
              >
                🔒 HUMAN ONLY
              </span>
            )}
          </div>

          {/* Title + Description */}
          <h3
            style={{
              fontFamily: 'var(--font-dm-sans), sans-serif',
              fontSize: 17,
              fontWeight: 600,
              color: '#1a1a1a',
              margin: '0 0 6px',
            }}
          >
            {m.title}
          </h3>
          <p
            style={{
              fontFamily: 'var(--font-dm-sans), sans-serif',
              fontSize: 14,
              color: '#666',
              lineHeight: 1.5,
              margin: '0 0 16px',
            }}
          >
            {m.description}
          </p>

          {/* Progress bar */}
          <div style={{ marginBottom: 12 }}>
            <div
              style={{
                height: 6,
                borderRadius: 3,
                background: '#f0f0f0',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  borderRadius: 3,
                  background: `linear-gradient(90deg, ${tribeColor}, ${tribeColor}dd)`,
                  width: `${Math.min(100, (m.slotsCompleted / m.slots) * 100)}%`,
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: 4,
                fontFamily: 'var(--font-dm-sans), sans-serif',
                fontSize: 12,
                color: '#999',
              }}
            >
              <span>{m.slotsCompleted}/{m.slots} completed</span>
              <span>by {m.creatorName}</span>
            </div>
          </div>

          {/* Reward info */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderRadius: 12,
              background: 'rgba(234,179,8,0.04)',
              border: '1px solid rgba(234,179,8,0.12)',
            }}
          >
            <div>
              <span
                style={{
                  fontFamily: 'var(--font-jetbrains-mono), monospace',
                  fontSize: 18,
                  fontWeight: 700,
                  color: '#b45309',
                }}
              >
                ${m.reward.perCompletion}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-dm-sans), sans-serif',
                  fontSize: 12,
                  color: '#999',
                  marginLeft: 4,
                }}
              >
                USDC per response · x402 on Base
              </span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div
                style={{
                  fontFamily: 'var(--font-jetbrains-mono), monospace',
                  fontSize: 11,
                  color: '#999',
                }}
              >
                Pool: ${m.reward.totalPool} USDC
              </div>
              {m.cardConfig.basicThreshold && (
                <div
                  style={{
                    fontFamily: 'var(--font-dm-sans), sans-serif',
                    fontSize: 11,
                    color: '#666',
                    marginTop: 2,
                  }}
                >
                  Score ≥{m.cardConfig.basicThreshold} = free Supporter Card
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
