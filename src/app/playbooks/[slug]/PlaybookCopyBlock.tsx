'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

interface Props {
  content: string;
  brandName: string;
}

export default function PlaybookCopyBlock({ content, brandName }: Props) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = content;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopied(false), 2000);
  }, [content]);

  const lines = content.split('\n');
  const preview = lines.slice(0, 8).join('\n') + (lines.length > 8 ? '\n...' : '');

  return (
    <div
      className="rounded-xl overflow-hidden border"
      style={{
        background: '#1e1433',
        borderColor: 'rgba(139,92,246,0.2)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <span
          className="text-[11px] font-medium tracking-wide uppercase text-white/50"
          style={{ fontFamily: 'var(--font-jetbrains-mono), monospace' }}
        >
          {brandName} — Paste Block
        </span>
        <button
          onClick={handleCopy}
          className="px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
          style={{
            fontFamily: 'var(--font-jetbrains-mono), monospace',
            background: copied ? 'rgba(34,197,94,0.2)' : 'rgba(167,139,250,0.15)',
            color: copied ? '#22c55e' : '#a78bfa',
            border: `1px solid ${copied ? 'rgba(34,197,94,0.3)' : 'rgba(167,139,250,0.25)'}`,
          }}
        >
          {copied ? '✓ Copied' : 'Copy to clipboard'}
        </button>
      </div>

      {/* Content */}
      <pre
        className="px-4 py-3 text-[12px] leading-relaxed overflow-x-auto"
        style={{
          fontFamily: 'var(--font-jetbrains-mono), monospace',
          color: 'rgba(255,255,255,0.65)',
          maxHeight: expanded ? 'none' : '220px',
        }}
      >
        {expanded ? content : preview}
      </pre>

      {/* Expand toggle */}
      {lines.length > 8 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full px-4 py-2.5 text-[11px] font-medium text-purple-300/70 hover:text-purple-300 transition-colors border-t border-white/5"
          style={{ fontFamily: 'var(--font-jetbrains-mono), monospace' }}
        >
          {expanded ? '▲ Collapse' : `▼ Show full playbook (${lines.length} lines)`}
        </button>
      )}
    </div>
  );
}
