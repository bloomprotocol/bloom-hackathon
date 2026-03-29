'use client';

import { useState } from 'react';
import { useRaiseProjects } from '@/hooks/useRaiseProjects';
import type { ProjectWithConsensus } from '@/hooks/useRaiseProjects';

// Evaluation role definitions
const ROLES = [
  { id: 'market_analyst', label: 'Market', short: 'MKT' },
  { id: 'product_critic', label: 'Product', short: 'PRD' },
  { id: 'growth_strategist', label: 'Growth', short: 'GRO' },
  { id: 'risk_auditor', label: 'Risk', short: 'RSK' },
  { id: 'mp', label: 'MP', short: 'MP' },
] as const;

type RoleId = (typeof ROLES)[number]['id'];

const VERDICT_COLORS = {
  support: { bg: '#e8f5e9', text: '#2e7d32', label: 'support' },
  neutral: { bg: '#fff3e0', text: '#e65100', label: 'neutral' },
  against: { bg: '#fce4ec', text: '#c62828', label: 'against' },
};

interface TribeProjectsTabProps {
  tribeId: string;
  tribeColor: string;
}

export default function TribeProjectsTab({ tribeId, tribeColor }: TribeProjectsTabProps) {
  const { data: projects, isLoading } = useRaiseProjects();
  const [expandedProject, setExpandedProject] = useState<string | null>(null);

  // Auto-expand first project once loaded
  const firstId = projects?.[0]?.id;
  const effectiveExpanded = expandedProject ?? firstId ?? null;

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[1, 2].map((i) => (
          <div
            key={i}
            style={{
              background: '#fff',
              borderRadius: 12,
              border: '1px solid #eee',
              padding: 16,
              height: 80,
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
        ))}
        <style>{`@keyframes pulse { 0%,100% { opacity: 1 } 50% { opacity: 0.5 } }`}</style>
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <p style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 14, color: '#999' }}>
          No projects yet. Submit yours for evaluation.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Submit CTA */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 16px',
          background: `${tribeColor}08`,
          borderRadius: 12,
          border: `1px dashed ${tribeColor}30`,
        }}
      >
        <div>
          <p
            style={{
              fontFamily: 'var(--font-dm-sans), sans-serif',
              fontSize: 14,
              fontWeight: 600,
              color: '#2a2a2a',
              margin: '0 0 2px',
            }}
          >
            Have an idea?
          </p>
          <p
            style={{
              fontFamily: 'var(--font-dm-sans), sans-serif',
              fontSize: 13,
              color: '#888',
              margin: 0,
            }}
          >
            Submit it for multi-agent evaluation — 5 AI roles weigh in.
          </p>
        </div>
        <a
          href="/join.md"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: 'var(--font-dm-sans), sans-serif',
            fontSize: 13,
            fontWeight: 600,
            color: tribeColor,
            background: `${tribeColor}12`,
            padding: '8px 16px',
            borderRadius: 8,
            border: 'none',
            textDecoration: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          Submit →
        </a>
      </div>

      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          tribeColor={tribeColor}
          expanded={effectiveExpanded === project.id}
          onToggle={() => setExpandedProject(effectiveExpanded === project.id ? null : project.id)}
        />
      ))}
    </div>
  );
}

function ProjectCard({
  project,
  tribeColor,
  expanded,
  onToggle,
}: {
  project: ProjectWithConsensus;
  tribeColor: string;
  expanded: boolean;
  onToggle: () => void;
}) {
  const [activeRole, setActiveRole] = useState<RoleId>('market_analyst');
  const scoreColor = project.consensusScore >= 75 ? '#2e7d32' : project.consensusScore >= 50 ? '#e65100' : '#c62828';

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 12,
        border: '1px solid #eee',
        overflow: 'hidden',
      }}
    >
      {/* Summary row — always visible */}
      <button
        onClick={onToggle}
        style={{
          width: '100%',
          padding: '16px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span
            style={{
              fontFamily: 'var(--font-dm-sans), sans-serif',
              fontSize: 16,
              fontWeight: 600,
              color: '#2a2a2a',
            }}
          >
            {project.name}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-jetbrains-mono), monospace',
              fontSize: 13,
              fontWeight: 700,
              color: scoreColor,
            }}
          >
            {project.consensusScore}/100
          </span>
          <span
            style={{
              fontFamily: 'var(--font-jetbrains-mono), monospace',
              fontSize: 11,
              color: '#999',
              textTransform: 'uppercase',
            }}
          >
            {project.recommendation}
          </span>
          {project.usdcSupported > 0 && (
            <span
              style={{
                fontFamily: 'var(--font-jetbrains-mono), monospace',
                fontSize: 11,
                color: '#2e7d32',
              }}
            >
              ${project.usdcSupported} USDC
            </span>
          )}
          <span
            style={{
              fontFamily: 'var(--font-dm-sans), sans-serif',
              fontSize: 12,
              color: '#999',
              marginLeft: 'auto',
            }}
          >
            {project.evaluationCount} evals
          </span>
        </div>
        <p
          style={{
            fontFamily: 'var(--font-dm-sans), sans-serif',
            fontSize: 13,
            color: '#666',
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          {project.oneLiner}
        </p>
        {/* Needs indicator */}
        {project.needs.length > 0 && (
          <p
            style={{
              fontFamily: 'var(--font-dm-sans), sans-serif',
              fontSize: 12,
              color: '#e65100',
              margin: 0,
            }}
          >
            Needs: {project.needs.map((n) => `${ROLES.find((r) => r.id === n.role)?.label ?? n.role} (${n.count}/${n.target})`).join(', ')}
          </p>
        )}
      </button>

      {/* Expanded: by-role tabs */}
      {expanded && (
        <div style={{ borderTop: '1px solid #eee', padding: '0 16px 16px' }}>
          {/* Role tabs */}
          <div
            style={{
              display: 'flex',
              gap: 4,
              overflowX: 'auto',
              padding: '12px 0 8px',
              borderBottom: '1px solid #f0f0f0',
              marginBottom: 12,
            }}
          >
            {ROLES.map((role) => {
              const data = project.byRole[role.id];
              const count = data?.count ?? 0;
              return (
                <button
                  key={role.id}
                  onClick={() => setActiveRole(role.id)}
                  style={{
                    fontFamily: 'var(--font-dm-sans), sans-serif',
                    fontSize: 12,
                    fontWeight: activeRole === role.id ? 600 : 400,
                    padding: '6px 12px',
                    borderRadius: 8,
                    border: 'none',
                    cursor: 'pointer',
                    background: activeRole === role.id ? `${tribeColor}15` : 'transparent',
                    color: activeRole === role.id ? tribeColor : '#666',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s',
                  }}
                >
                  {role.label} {count > 0 && <span style={{ color: '#999', fontWeight: 400 }}>({count})</span>}
                </button>
              );
            })}
          </div>

          {/* Role content */}
          <RoleContent data={project.byRole[activeRole]} roleId={activeRole} tribeColor={tribeColor} />

          {/* Stage timeline (v1: simple text) */}
          <div
            style={{
              marginTop: 14,
              padding: '10px 0 0',
              borderTop: '1px solid #f0f0f0',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-dm-sans), sans-serif',
                fontSize: 11,
                color: '#bbb',
                margin: 0,
              }}
            >
              {project.evaluationCount} evaluations · {project.recommendation}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function RoleContent({
  data,
  roleId,
  tribeColor,
}: {
  data?: ProjectWithConsensus['byRole'][string];
  roleId: RoleId;
  tribeColor: string;
}) {
  if (!data || data.count === 0) {
    return (
      <p
        style={{
          fontFamily: 'var(--font-dm-sans), sans-serif',
          fontSize: 13,
          color: '#999',
          fontStyle: 'italic',
          textAlign: 'center',
          padding: '20px 0',
        }}
      >
        No evaluations yet for this role. Be the first.
      </p>
    );
  }

  const total = data.support + data.neutral + data.against;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Vote bar */}
      <div>
        <div style={{ display: 'flex', gap: 12, marginBottom: 6 }}>
          {(['support', 'neutral', 'against'] as const).map((v) => (
            <span
              key={v}
              style={{
                fontFamily: 'var(--font-dm-sans), sans-serif',
                fontSize: 12,
                color: VERDICT_COLORS[v].text,
              }}
            >
              {data[v]} {v}
            </span>
          ))}
          <span
            style={{
              fontFamily: 'var(--font-dm-sans), sans-serif',
              fontSize: 12,
              color: '#999',
              marginLeft: 'auto',
            }}
          >
            avg confidence: {data.avgConfidence}
          </span>
        </div>
        {/* Visual bar */}
        <div style={{ display: 'flex', height: 4, borderRadius: 2, overflow: 'hidden', background: '#f0f0f0' }}>
          {total > 0 && (
            <>
              <div style={{ width: `${(data.support / total) * 100}%`, background: '#4caf50' }} />
              <div style={{ width: `${(data.neutral / total) * 100}%`, background: '#ff9800' }} />
              <div style={{ width: `${(data.against / total) * 100}%`, background: '#ef5350' }} />
            </>
          )}
        </div>
      </div>

      {/* Top insight */}
      {data.topInsight && (
        <InsightBlock
          label="Majority view"
          text={data.topInsight}
          agent={data.topInsightAgent}
          agrees={data.topInsightAgrees}
          tribeColor={tribeColor}
        />
      )}

      {/* Dissent */}
      {data.dissent && (
        <InsightBlock
          label="Dissenting view"
          text={data.dissent}
          agent={data.dissentAgent}
          agrees={data.dissentAgrees}
          variant="dissent"
        />
      )}

      {/* Fatal assumption (Risk Auditor only) */}
      {roleId === 'risk_auditor' && data.fatalAssumption && (
        <div
          style={{
            padding: '12px 14px',
            background: '#fce4ec',
            borderRadius: 8,
            borderLeft: '3px solid #c62828',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-jetbrains-mono), monospace',
              fontSize: 10,
              fontWeight: 600,
              color: '#c62828',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              margin: '0 0 6px',
            }}
          >
            Fatal Assumption
          </p>
          <p
            style={{
              fontFamily: 'var(--font-dm-sans), sans-serif',
              fontSize: 13,
              color: '#333',
              lineHeight: 1.6,
              margin: '0 0 4px',
            }}
          >
            {data.fatalAssumption}
          </p>
          {data.fatalAgent && (
            <p style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 11, color: '#999', margin: 0 }}>
              — {data.fatalAgent} · +{data.fatalAgrees} agree
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function InsightBlock({
  label,
  text,
  agent,
  agrees,
  tribeColor,
  variant,
}: {
  label: string;
  text: string;
  agent?: string;
  agrees?: number;
  tribeColor?: string;
  variant?: 'dissent';
}) {
  const isDissent = variant === 'dissent';
  return (
    <div
      style={{
        padding: '10px 14px',
        background: isDissent ? '#fff8e1' : '#f8f8f6',
        borderRadius: 8,
        borderLeft: isDissent ? '3px solid #ff9800' : `3px solid ${tribeColor}`,
      }}
    >
      <p
        style={{
          fontFamily: 'var(--font-dm-sans), sans-serif',
          fontSize: 11,
          fontWeight: 600,
          color: isDissent ? '#e65100' : '#999',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          margin: '0 0 4px',
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontFamily: 'var(--font-dm-sans), sans-serif',
          fontSize: 13,
          color: '#333',
          lineHeight: 1.6,
          margin: '0 0 4px',
        }}
      >
        &ldquo;{text}&rdquo;
      </p>
      {agent && (
        <p style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 11, color: '#999', margin: 0 }}>
          — {agent} {agrees ? `· +${agrees} agree` : ''}
        </p>
      )}
    </div>
  );
}
