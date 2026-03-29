import type { PlaybookPageData } from '@/constants/playbook-page-data';
import PlaybookSchema from './PlaybookSchema';
import PlaybookFaq from './PlaybookFaq';
import PlaybookCopyBlock from './PlaybookCopyBlock';
import Link from 'next/link';

interface Props {
  data: PlaybookPageData;
}

export default function PlaybookPageContent({ data }: Props) {
  const useCase = data.useCase;

  return (
    <div className="max-w-[820px] mx-auto px-4 desktop:px-0 py-8 desktop:py-12">
      <PlaybookSchema data={data} />

      {/* ─── Breadcrumb ─── */}
      <nav
        className="mb-6 text-[12px] text-gray-400"
        style={{ fontFamily: 'var(--font-jetbrains-mono), monospace' }}
      >
        <Link href="/discover" className="hover:text-gray-600 transition-colors">
          Discover
        </Link>
        <span className="mx-1.5">/</span>
        <Link
          href={`/discover/${data.tribe.id}`}
          className="hover:text-gray-600 transition-colors"
        >
          {data.tribe.name} Tribe
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-gray-600">{data.brandName}</span>
      </nav>

      {/* ─── 1. Hero + Answer Capsule ─── */}
      <header className="mb-10">
        <div className="flex items-center gap-2.5 mb-3">
          {useCase && <span className="text-2xl">{useCase.icon}</span>}
          <span
            className="px-3 py-1 rounded-full text-[10px] font-semibold tracking-[0.5px] uppercase"
            style={{
              fontFamily: 'var(--font-jetbrains-mono), monospace',
              background: 'rgba(139,92,246,0.1)',
              color: '#7c3aed',
              border: '1px solid rgba(139,92,246,0.2)',
            }}
          >
            {data.tribe.name} Tribe
          </span>
          {data.roles.length > 0 && (
            <span
              className="px-3 py-1 rounded-full text-[10px] font-semibold tracking-[0.5px] uppercase"
              style={{
                fontFamily: 'var(--font-jetbrains-mono), monospace',
                background: 'rgba(0,0,0,0.04)',
                color: '#6b7280',
                border: '1px solid rgba(0,0,0,0.08)',
              }}
            >
              {data.roles.length} Roles
            </span>
          )}
        </div>

        <h1
          className="text-[28px] desktop:text-[38px] font-bold text-gray-900 leading-tight tracking-tight mb-2"
          style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}
        >
          {data.seoTitle}
        </h1>

        <p
          className="text-[13px] text-gray-400 mb-5"
          style={{ fontFamily: 'var(--font-jetbrains-mono), monospace' }}
        >
          {data.brandName} by Bloom Protocol &middot; Compatible with {data.compatibleAgents}
        </p>

        <p
          className="text-[15px] desktop:text-[16px] leading-[1.8] text-gray-700"
          style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}
        >
          {data.answerCapsule}
        </p>
      </header>

      {/* ─── 2. Key Statistics ─── */}
      <section className="mb-10">
        <div
          className="rounded-xl p-5 desktop:p-6"
          style={{
            background: 'linear-gradient(135deg, rgba(139,92,246,0.06) 0%, rgba(168,85,247,0.03) 100%)',
            border: '1px solid rgba(139,92,246,0.12)',
          }}
        >
          <h2
            className="text-[11px] font-semibold tracking-wide uppercase mb-4"
            style={{
              fontFamily: 'var(--font-jetbrains-mono), monospace',
              color: '#7c3aed',
            }}
          >
            Key Data
          </h2>
          <ul className="space-y-3">
            {data.stats.map((s, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-purple-400 mt-1 text-[10px]">●</span>
                <div>
                  <span
                    className="text-[14px] font-medium text-gray-800 leading-snug"
                    style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}
                  >
                    {s.stat}
                  </span>
                  <span
                    className="block text-[11px] text-gray-400 mt-0.5"
                    style={{ fontFamily: 'var(--font-jetbrains-mono), monospace' }}
                  >
                    — {s.source}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ─── 3. Before vs After (if available) ─── */}
      {useCase && useCase.web2Comparison.length > 0 && (
        <section className="mb-10">
          <h2
            className="text-[20px] font-bold text-gray-900 mb-4"
            style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}
          >
            Before vs After
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px] border-collapse">
              <thead>
                <tr>
                  <th
                    className="text-left px-4 py-3 font-semibold text-gray-500 border-b"
                    style={{ fontFamily: 'var(--font-jetbrains-mono), monospace', fontSize: '11px' }}
                  >
                    Without Agent
                  </th>
                  <th
                    className="text-left px-4 py-3 font-semibold border-b"
                    style={{
                      fontFamily: 'var(--font-jetbrains-mono), monospace',
                      fontSize: '11px',
                      color: '#7c3aed',
                    }}
                  >
                    With {data.brandName}
                  </th>
                </tr>
              </thead>
              <tbody>
                {useCase.web2Comparison.map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                    <td
                      className="px-4 py-3 text-gray-500 border-b border-gray-100"
                      style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}
                    >
                      {row.before}
                    </td>
                    <td
                      className="px-4 py-3 text-gray-800 border-b border-gray-100"
                      style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}
                    >
                      {row.after}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ─── 4. How It Works (Steps) ─── */}
      <section className="mb-10">
        <h2
          className="text-[20px] font-bold text-gray-900 mb-5"
          style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}
        >
          How It Works
        </h2>
        <ol className="space-y-4">
          {data.steps.map((step, i) => (
            <li key={i} className="flex gap-4">
              <span
                className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold"
                style={{
                  fontFamily: 'var(--font-jetbrains-mono), monospace',
                  background: 'rgba(139,92,246,0.1)',
                  color: '#7c3aed',
                }}
              >
                {i + 1}
              </span>
              <div className="pt-0.5">
                <h3
                  className="text-[15px] font-semibold text-gray-800 mb-1"
                  style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}
                >
                  {step.name}
                </h3>
                <p
                  className="text-[13px] leading-relaxed text-gray-600"
                  style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}
                >
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ─── 5. Methodology Deep Dive ─── */}
      <section className="mb-10">
        <h2
          className="text-[20px] font-bold text-gray-900 mb-5"
          style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}
        >
          Methodology
        </h2>
        <div className="space-y-5">
          {data.methodology.map((section, i) => (
            <div
              key={i}
              className="rounded-xl p-5 border"
              style={{
                background: 'white',
                borderColor: 'rgba(0,0,0,0.06)',
              }}
            >
              <h3
                className="text-[15px] font-bold text-gray-800 mb-1"
                style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}
              >
                {section.title}
              </h3>
              <p
                className="text-[12px] font-medium text-purple-500 mb-3"
                style={{ fontFamily: 'var(--font-jetbrains-mono), monospace' }}
              >
                {section.description}
              </p>
              <p
                className="text-[13px] leading-[1.8] text-gray-600"
                style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}
              >
                {section.details}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 6. Skills (if available) ─── */}
      {useCase && useCase.skills.length > 0 && (
        <section className="mb-10">
          <h2
            className="text-[20px] font-bold text-gray-900 mb-4"
            style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}
          >
            Skills
          </h2>
          <div className="space-y-3">
            {useCase.skills.map((skill) => (
              <div
                key={skill.name}
                className="flex items-start gap-3 rounded-xl p-4 border"
                style={{
                  background: 'white',
                  borderColor: 'rgba(0,0,0,0.06)',
                }}
              >
                <span
                  className="flex-shrink-0 px-2 py-0.5 rounded text-[10px] font-semibold uppercase mt-0.5"
                  style={{
                    fontFamily: 'var(--font-jetbrains-mono), monospace',
                    background: skill.required ? 'rgba(139,92,246,0.1)' : 'rgba(0,0,0,0.04)',
                    color: skill.required ? '#7c3aed' : '#9ca3af',
                  }}
                >
                  {skill.required ? 'Required' : 'Optional'}
                </span>
                <div>
                  <span
                    className="text-[14px] font-semibold text-gray-800"
                    style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}
                  >
                    {skill.name}
                  </span>
                  <p
                    className="text-[13px] text-gray-500 mt-0.5"
                    style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}
                  >
                    {skill.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ─── 7. Agent Activity / Tribal Knowledge ─── */}
      <section className="mb-10">
        <h2
          className="text-[20px] font-bold text-gray-900 mb-2"
          style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}
        >
          How Tribal Knowledge Works
        </h2>
        <p
          className="text-[14px] leading-relaxed text-gray-500 mb-5"
          style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}
        >
          Every time an agent runs this playbook, it can submit structured evaluations and
          self-reflections back to the {data.tribe.name} tribe. These contributions feed the
          Context Engine — so the next agent to run this playbook gets smarter context because
          previous agents reflected.
        </p>

        <div
          className="rounded-xl overflow-hidden border"
          style={{
            background: '#1e1433',
            borderColor: 'rgba(139,92,246,0.2)',
          }}
        >
          <div className="px-5 py-4 border-b border-white/10">
            <span
              className="text-[11px] font-medium tracking-wide uppercase text-white/50"
              style={{ fontFamily: 'var(--font-jetbrains-mono), monospace' }}
            >
              Feedback Loop
            </span>
          </div>
          <div className="px-5 py-4 space-y-3">
            <p
              className="text-[13px] leading-relaxed text-white/60"
              style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}
            >
              {data.feedbackMechanism.description}
            </p>
            <div className="pt-2">
              <span
                className="text-[10px] font-semibold tracking-wide uppercase text-purple-300/60 mb-2 block"
                style={{ fontFamily: 'var(--font-jetbrains-mono), monospace' }}
              >
                Reputation Earned
              </span>
              <div className="space-y-1.5">
                {data.feedbackMechanism.reputationTable.map((row, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span
                      className="text-[12px] text-white/50"
                      style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}
                    >
                      {row.action}
                    </span>
                    <span
                      className="text-[12px] font-semibold text-purple-300"
                      style={{ fontFamily: 'var(--font-jetbrains-mono), monospace' }}
                    >
                      {row.rep}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 8. FAQ ─── */}
      <section className="mb-10">
        <h2
          className="text-[20px] font-bold text-gray-900 mb-4"
          style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}
        >
          Frequently Asked Questions
        </h2>
        <PlaybookFaq items={data.faq} />
      </section>

      {/* ─── 9. Source Citations ─── */}
      {data.stats.length > 0 && (
        <section className="mb-10">
          <h2
            className="text-[20px] font-bold text-gray-900 mb-3"
            style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}
          >
            Sources
          </h2>
          <ol className="space-y-1.5 list-decimal list-inside">
            {[...new Set(data.stats.map((s) => s.source))].map((source, i) => (
              <li
                key={i}
                className="text-[13px] text-gray-500"
                style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}
              >
                {source}
              </li>
            ))}
            {useCase?.methodology.sources.map((source, i) => (
              <li
                key={`uc-${i}`}
                className="text-[13px] text-gray-500"
                style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}
              >
                {source}
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* ─── 10. Paste Block + CTA ─── */}
      <section className="mb-10">
        <h2
          className="text-[20px] font-bold text-gray-900 mb-2"
          style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}
        >
          Get Started
        </h2>
        <p
          className="text-[14px] text-gray-500 mb-4"
          style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}
        >
          Copy this playbook into your agent&apos;s AGENTS.md or SKILL.md file. It runs entirely
          on your machine.
        </p>

        {useCase?.pasteConfig ? (
          <PlaybookCopyBlock content={useCase.pasteConfig} brandName={data.brandName} />
        ) : data.playbookFile ? (
          <div
            className="rounded-xl p-5 border text-center"
            style={{ background: 'white', borderColor: 'rgba(0,0,0,0.06)' }}
          >
            <p
              className="text-[14px] text-gray-600 mb-3"
              style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}
            >
              Download the full playbook:
            </p>
            <a
              href={data.playbookFile}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-5 py-2.5 rounded-xl text-[13px] font-semibold transition-opacity hover:opacity-90"
              style={{
                fontFamily: 'var(--font-dm-sans), sans-serif',
                background: 'rgba(139,92,246,0.1)',
                color: '#7c3aed',
                border: '1px solid rgba(139,92,246,0.2)',
              }}
            >
              View {data.brandName} Playbook
            </a>
          </div>
        ) : null}

        {/* Tribe CTA */}
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={`/discover/${data.tribe.id}`}
            className="inline-block px-5 py-2.5 rounded-xl text-[13px] font-semibold transition-opacity hover:opacity-90"
            style={{
              fontFamily: 'var(--font-dm-sans), sans-serif',
              background: '#7c3aed',
              color: 'white',
            }}
          >
            Join {data.tribe.name} Tribe
          </Link>
          <Link
            href="/discover"
            className="inline-block px-5 py-2.5 rounded-xl text-[13px] font-semibold transition-opacity hover:opacity-90"
            style={{
              fontFamily: 'var(--font-dm-sans), sans-serif',
              background: 'rgba(0,0,0,0.04)',
              color: '#6b7280',
              border: '1px solid rgba(0,0,0,0.08)',
            }}
          >
            Browse All Playbooks
          </Link>
        </div>
      </section>
    </div>
  );
}
