'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

/**
 * For Agents Page - REORGANIZED with Marketing & Product Branding
 *
 * Marketing Funnel Structure (AIDA):
 * 1. Attention (Hero)
 * 2. Interest (How It Works - Quick Visual)
 * 3. Desire (Dimensions + Agent vs Web + Value)
 * 4. Action (Installation CTA)
 * 5. Trust (Privacy at Bottom)
 */

export default function ForAgentsPage() {
  const [activeTab, setActiveTab] = useState<'clawhub' | 'manual'>('clawhub');
  const [copiedCommand, setCopiedCommand] = useState(false);

  const skillUrl = 'https://gitlab.com/bloom-protocol/bloom-discovery-skill';
  const manualCommand = `curl -s ${skillUrl}`;
  const clawhubCommand = 'npx clawhub@latest install bloom-discovery';

  const copyCommand = () => {
    const command = activeTab === 'manual' ? manualCommand : clawhubCommand;
    navigator.clipboard.writeText(command);
    setCopiedCommand(true);
    setTimeout(() => setCopiedCommand(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F5F0EB]">
      <div className="mx-auto max-w-[1200px] px-4 py-16">

        {/* ======================================
            1. ATTENTION: Hero Section
            ====================================== */}
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-purple-100 rounded-full text-purple-700 text-sm font-semibold mb-6">
            🦞 Builder Quest 2026
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'DM Serif Text, serif' }}>
            You, Through Your Agent's Eyes
          </h1>
          <p className="text-xl text-gray-600 max-w-[700px] mx-auto mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Discover AI skills personalized for you. Your agent analyzes your behavior to unlock your identity card and recommend tools you'll love
          </p>
          <p className="text-base text-gray-500 max-w-[600px] mx-auto" style={{ fontFamily: 'Outfit, sans-serif' }}>
            OpenClaw • Privacy-First • Skill Discovery • Soulbound
          </p>
        </div>

        {/* ======================================
            2. INTEREST: How It Works (Simplified)
            Quick visual explanation first
            ====================================== */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-6" style={{ fontFamily: 'DM Serif Text, serif' }}>
            How It Works
          </h2>
          <p className="text-center text-gray-600 max-w-[700px] mx-auto mb-12" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Three simple steps to discover your identity card
          </p>

          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-white/80 shadow-lg">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-xl mb-4 mx-auto">
                1
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-3" style={{ fontFamily: 'DM Serif Text, serif' }}>
                Agent Analyzes You
              </h3>
              <p className="text-sm text-gray-600 text-center" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Conversations + wallet activity + social behavior
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-white/80 shadow-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl mb-4 mx-auto">
                2
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-3" style={{ fontFamily: 'DM Serif Text, serif' }}>
                Generates Your Card
              </h3>
              <p className="text-sm text-gray-600 text-center" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Personality type + tagline + dimension scores
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-white/80 shadow-lg">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-xl mb-4 mx-auto">
                3
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-3" style={{ fontFamily: 'DM Serif Text, serif' }}>
                Recommends Skills
              </h3>
              <p className="text-sm text-gray-600 text-center" style={{ fontFamily: 'Outfit, sans-serif' }}>
                AI tools matched to your personality
              </p>
            </div>
          </div>

          {/* Quick Privacy Note */}
          <div className="max-w-2xl mx-auto mt-8 text-center">
            <p className="text-sm text-gray-500" style={{ fontFamily: 'Outfit, sans-serif' }}>
              🔒 <strong>Privacy-first:</strong> All analysis happens locally in your agent. We only save your final personality result.
            </p>
          </div>
        </div>

        {/* ======================================
            3. INTEREST: Personality Types (2x2 Grid)
            Show what they'll get
            ====================================== */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-6" style={{ fontFamily: 'DM Serif Text, serif' }}>
            Your Identity, Through Data
          </h2>
          <p className="text-center text-gray-600 max-w-[700px] mx-auto mb-12" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Five personality types based on how you think and what you support
          </p>

          {/* 2x2 Quadrant System */}
          <div className="max-w-6xl mx-auto">
            <div className="relative bg-white/40 backdrop-blur-sm rounded-2xl p-12 border-2 border-gray-300">
              {/* Axes labels */}
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-center">
                <p className="text-sm font-semibold text-purple-700 flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  <span className="text-xl">↑</span>
                  <span>⚡ Intuition (Vision-driven)</span>
                </p>
              </div>

              <div className="absolute -right-40 top-1/2 -translate-y-1/2 text-center">
                <p className="text-sm font-semibold text-purple-700 flex items-center gap-2 rotate-90 origin-center whitespace-nowrap" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  <span className="text-xl">→</span>
                  <span>💪 Conviction (Focused)</span>
                </p>
              </div>

              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-center">
                <p className="text-sm font-semibold text-purple-700 flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  <span className="text-xl">↓</span>
                  <span>📊 Analysis (Data-driven)</span>
                </p>
              </div>

              <div className="absolute -left-40 top-1/2 -translate-y-1/2 text-center">
                <p className="text-sm font-semibold text-purple-700 flex items-center gap-2 -rotate-90 origin-center whitespace-nowrap" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  <span className="text-xl">←</span>
                  <span>🔍 Curiosity (Explorer)</span>
                </p>
              </div>

              {/* Axis lines */}
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-purple-300 via-purple-400 to-purple-300"></div>
              <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-purple-300 via-purple-400 to-purple-300"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-purple-500 rounded-full border-2 border-white shadow-lg z-10"></div>

              {/* 2x2 Grid */}
              <div className="grid grid-cols-2 gap-6 relative z-0">
                {/* Top Left: Explorer */}
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl overflow-hidden border-2 border-green-200 hover:shadow-xl transition-shadow">
                  <div className="relative h-32 bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
                    <Image src="/identity/explorer-agent.png" alt="The Explorer" width={200} height={200} className="object-cover w-full h-full" />
                  </div>
                  <div className="p-4">
                    <h4 className="text-lg font-semibold text-gray-900 mb-1" style={{ fontFamily: 'DM Serif Text, serif' }}>
                      The Explorer
                    </h4>
                    <p className="text-xs text-gray-600 italic mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                      "Never stop discovering"
                    </p>
                    <p className="text-xs text-gray-600" style={{ fontFamily: 'Outfit, sans-serif' }}>
                      Curious + Vision-driven
                    </p>
                  </div>
                </div>

                {/* Top Right: Visionary */}
                <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl overflow-hidden border-2 border-purple-200 hover:shadow-xl transition-shadow">
                  <div className="relative h-32 bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
                    <Image src="/identity/visionary-agent.png" alt="The Visionary" width={200} height={200} className="object-cover w-full h-full" />
                  </div>
                  <div className="p-4">
                    <h4 className="text-lg font-semibold text-gray-900 mb-1" style={{ fontFamily: 'DM Serif Text, serif' }}>
                      The Visionary
                    </h4>
                    <p className="text-xs text-gray-600 italic mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                      "See beyond the hype"
                    </p>
                    <p className="text-xs text-gray-600" style={{ fontFamily: 'Outfit, sans-serif' }}>
                      Focused + Vision-driven
                    </p>
                  </div>
                </div>

                {/* Bottom Left: Innovator */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl overflow-hidden border-2 border-blue-200 hover:shadow-xl transition-shadow">
                  <div className="relative h-32 bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
                    <Image src="/identity/innovator-agent.png" alt="The Innovator" width={200} height={200} className="object-cover w-full h-full" />
                  </div>
                  <div className="p-4">
                    <h4 className="text-lg font-semibold text-gray-900 mb-1" style={{ fontFamily: 'DM Serif Text, serif' }}>
                      The Innovator
                    </h4>
                    <p className="text-xs text-gray-600 italic mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                      "First to back new tech"
                    </p>
                    <p className="text-xs text-gray-600" style={{ fontFamily: 'Outfit, sans-serif' }}>
                      Curious + Data-driven
                    </p>
                  </div>
                </div>

                {/* Bottom Right: Optimizer */}
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl overflow-hidden border-2 border-orange-200 hover:shadow-xl transition-shadow">
                  <div className="relative h-32 bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
                    <Image src="/identity/optimizer-agent.png" alt="The Optimizer" width={200} height={200} className="object-cover w-full h-full" />
                  </div>
                  <div className="p-4">
                    <h4 className="text-lg font-semibold text-gray-900 mb-1" style={{ fontFamily: 'DM Serif Text, serif' }}>
                      The Optimizer
                    </h4>
                    <p className="text-xs text-gray-600 italic mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                      "Always leveling up"
                    </p>
                    <p className="text-xs text-gray-600" style={{ fontFamily: 'Outfit, sans-serif' }}>
                      Focused + Data-driven
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Cultivator - Special Case */}
            <div className="mt-12 max-w-2xl mx-auto">
              <div className="bg-gradient-to-br from-cyan-50 to-teal-50 rounded-xl overflow-hidden border-2 border-cyan-200 hover:shadow-xl transition-shadow">
                <div className="relative h-40 bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
                  <Image src="/identity/cultivator-agent.png" alt="The Cultivator" width={300} height={300} className="object-cover w-full h-full" />
                </div>
                <div className="p-6 text-center">
                  <h4 className="text-xl font-semibold text-gray-900 mb-2" style={{ fontFamily: 'DM Serif Text, serif' }}>
                    The Cultivator
                  </h4>
                  <p className="text-sm text-gray-600 italic mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    "Growing together"
                  </p>
                  <p className="text-sm text-gray-600" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    <strong>Special case:</strong> High contribution score ({'>'}65) — community builders who help projects grow
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================
            4. DESIRE: Agent vs Web Comparison
            Why agents are better
            ====================================== */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-6" style={{ fontFamily: 'DM Serif Text, serif' }}>
            Why Generate Through an Agent?
          </h2>
          <p className="text-center text-gray-600 max-w-[700px] mx-auto mb-12" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Your agent knows you better than any form can capture
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Web Version - Downplayed */}
            <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-8 border border-gray-300">
              <h3 className="text-xl font-semibold text-gray-700 mb-4" style={{ fontFamily: 'DM Serif Text, serif' }}>
                🌐 Web Version
              </h3>
              <ul className="space-y-3 text-gray-600" style={{ fontFamily: 'Outfit, sans-serif' }}>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span>You pick categories from a list</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span>Static personality templates</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span>No dimension scores</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span>Manual minting process</span>
                </li>
              </ul>
            </div>

            {/* Agent Version - Highlighted */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-8 border-2 border-purple-200 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-xl font-semibold text-gray-900" style={{ fontFamily: 'DM Serif Text, serif' }}>
                  🦞 Agent Version
                </h3>
                <span className="px-2 py-1 bg-purple-600 text-white text-xs font-semibold rounded">BETTER</span>
              </div>
              <ul className="space-y-3 text-gray-700" style={{ fontFamily: 'Outfit, sans-serif' }}>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-1">✓</span>
                  <span>AI analyzes your conversations + on-chain + social</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-1">✓</span>
                  <span>Dynamic taglines: "The DeFi Pioneer"</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-1">✓</span>
                  <span>Dimension scores (Conviction, Intuition, Contribution)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-1">✓</span>
                  <span>Autonomous Soulbound Token minting + auto-share</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* ======================================
            5. DESIRE: Skill Recommendations
            Show the value
            ====================================== */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-6" style={{ fontFamily: 'DM Serif Text, serif' }}>
            Skills Recommended For You
          </h2>
          <p className="text-center text-gray-600 max-w-[700px] mx-auto mb-12" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Based on your personality type, your agent suggests skills you might enjoy
          </p>

          <div className="max-w-5xl mx-auto">
            {/* Example: Visionary */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-8 border-2 border-purple-200 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center text-2xl">🔮</div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'DM Serif Text, serif' }}>For "The Visionary"</h3>
                  <p className="text-sm text-gray-600" style={{ fontFamily: 'Outfit, sans-serif' }}>Focused + Vision-driven personalities</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-5 border border-purple-200">
                  <h4 className="font-semibold text-gray-900 mb-2" style={{ fontFamily: 'DM Serif Text, serif' }}>🎯 Trend Analysis</h4>
                  <p className="text-sm text-gray-600 mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>Spot emerging patterns before they're obvious</p>
                  <span className="text-xs text-purple-600 font-medium" style={{ fontFamily: 'Outfit, sans-serif' }}>Perfect for conviction-driven thinkers</span>
                </div>
                <div className="bg-white rounded-xl p-5 border border-purple-200">
                  <h4 className="font-semibold text-gray-900 mb-2" style={{ fontFamily: 'DM Serif Text, serif' }}>💡 Strategic Advisor</h4>
                  <p className="text-sm text-gray-600 mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>Get high-level insights for bold decisions</p>
                  <span className="text-xs text-purple-600 font-medium" style={{ fontFamily: 'Outfit, sans-serif' }}>Matches your big-picture thinking</span>
                </div>
              </div>
            </div>

            {/* Example: Explorer */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border-2 border-green-200 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-2xl">🧭</div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'DM Serif Text, serif' }}>For "The Explorer"</h3>
                  <p className="text-sm text-gray-600" style={{ fontFamily: 'Outfit, sans-serif' }}>Curious + Vision-driven personalities</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-5 border border-green-200">
                  <h4 className="font-semibold text-gray-900 mb-2" style={{ fontFamily: 'DM Serif Text, serif' }}>🔍 Research Assistant</h4>
                  <p className="text-sm text-gray-600 mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>Deep dive into any topic with AI-powered research</p>
                  <span className="text-xs text-green-600 font-medium" style={{ fontFamily: 'Outfit, sans-serif' }}>Feeds your curiosity</span>
                </div>
                <div className="bg-white rounded-xl p-5 border border-green-200">
                  <h4 className="font-semibold text-gray-900 mb-2" style={{ fontFamily: 'DM Serif Text, serif' }}>📚 Content Curator</h4>
                  <p className="text-sm text-gray-600 mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>Discover hidden gems across the web</p>
                  <span className="text-xs text-green-600 font-medium" style={{ fontFamily: 'Outfit, sans-serif' }}>Matches your explorer mindset</span>
                </div>
              </div>
            </div>

            {/* Coming Soon */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full">
                <span className="text-2xl">🚀</span>
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'DM Serif Text, serif' }}>More coming soon</p>
                  <p className="text-xs text-gray-600" style={{ fontFamily: 'Outfit, sans-serif' }}>Web2 apps, AI tools, and Base projects</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================
            6. ACTION: Installation CTA
            Reduce friction - make it easy
            ====================================== */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4" style={{ fontFamily: 'DM Serif Text, serif' }}>
            Add to Your Agent
          </h2>
          <p className="text-center text-gray-600 max-w-[700px] mx-auto mb-12" style={{ fontFamily: 'Outfit, sans-serif' }}>
            One command to enable identity card generation for your OpenClaw agent
          </p>

          {/* Installation Box */}
          <div className="max-w-4xl mx-auto border-4 border-purple-400 rounded-2xl p-10 bg-gradient-to-br from-gray-900 to-gray-800 text-white shadow-2xl">
            {/* Tab Switcher */}
            <div className="flex gap-4 mb-6 justify-center">
              <button
                onClick={() => setActiveTab('clawhub')}
                className={`px-8 py-3 rounded-lg font-semibold text-base transition-all ${
                  activeTab === 'clawhub'
                    ? 'bg-green-400 text-gray-900'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                clawhub (recommended)
              </button>
              <button
                onClick={() => setActiveTab('manual')}
                className={`px-8 py-3 rounded-lg font-semibold text-base transition-all ${
                  activeTab === 'manual'
                    ? 'bg-green-400 text-gray-900'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                manual
              </button>
            </div>

            {/* Command Box */}
            <div className="bg-gray-950 rounded-lg p-5 mb-6 font-mono text-sm text-green-400 flex items-center justify-between">
              <code className="flex-1">
                {activeTab === 'manual' ? manualCommand : clawhubCommand}
              </code>
              <button
                onClick={copyCommand}
                className="ml-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white text-xs transition-colors"
              >
                {copiedCommand ? '✓ Copied!' : 'Copy'}
              </button>
            </div>

            {/* Steps */}
            <div className="space-y-3 text-gray-300" style={{ fontFamily: 'Outfit, sans-serif' }}>
              <div className="flex gap-3">
                <span className="text-green-400 font-bold">1.</span>
                <span>Run the command above to install</span>
              </div>
              <div className="flex gap-3">
                <span className="text-green-400 font-bold">2.</span>
                <span>Say: "Generate my Bloom Identity Card"</span>
              </div>
              <div className="flex gap-3">
                <span className="text-green-400 font-bold">3.</span>
                <span>Agent analyzes and mints your Soulbound Token!</span>
              </div>
            </div>
          </div>

          {/* Info Below */}
          <div className="max-w-4xl mx-auto mt-8 text-center">
            <p className="text-sm text-gray-500 mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
              🤖 Don't have an AI agent? <Link href="https://openclaw.ai" target="_blank" className="text-purple-600 hover:underline font-semibold">Get OpenClaw →</Link>
            </p>
            <p className="text-xs text-gray-400" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Works with OpenClaw agents • Takes ~30 seconds • Free to use
            </p>
          </div>
        </div>

        {/* ======================================
            7. ASPIRATION: Beyond Skills
            Future vision
            ====================================== */}
        <div className="mb-20">
          <div className="max-w-3xl mx-auto bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-12 border-2 border-purple-200 shadow-lg text-center">
            <div className="text-4xl mb-4">🔮</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'DM Serif Text, serif' }}>
              Beyond Skills: Full Discovery Engine
            </h2>
            <p className="text-lg text-gray-700 mb-6" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Soon your agent will recommend not just skills, but also:
            </p>
            <ul className="text-left max-w-md mx-auto space-y-3 mb-6" style={{ fontFamily: 'Outfit, sans-serif' }}>
              <li className="flex items-start gap-3 text-gray-700">
                <span className="text-xl">📱</span>
                <div><strong>Web2 Apps</strong> — Tools that match your workflow</div>
              </li>
              <li className="flex items-start gap-3 text-gray-700">
                <span className="text-xl">🚀</span>
                <div><strong>Base Projects</strong> — DApps aligned with your values</div>
              </li>
              <li className="flex items-start gap-3 text-gray-700">
                <span className="text-xl">🎯</span>
                <div><strong>Content</strong> — Articles and resources you'll love</div>
              </li>
            </ul>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full text-purple-700 text-sm font-semibold">
              <span>✨</span>
              <span>Coming Soon</span>
            </div>
          </div>
        </div>

        {/* ======================================
            8. TRUST: Privacy & Security (BOTTOM)
            Build trust at the end
            ====================================== */}
        <div className="mb-16 max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border-2 border-green-300 shadow-lg">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">
                🔒
              </div>
              <h3 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'DM Serif Text, serif' }}>
                Privacy-First Design
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <div className="text-3xl mb-2">💬</div>
                <p className="font-semibold text-gray-900 mb-1" style={{ fontFamily: 'DM Serif Text, serif' }}>
                  Zero Storage
                </p>
                <p className="text-sm text-gray-600" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  We don't store your conversation history or personal data
                </p>
              </div>

              <div className="text-center">
                <div className="text-3xl mb-2">🔐</div>
                <p className="font-semibold text-gray-900 mb-1" style={{ fontFamily: 'DM Serif Text, serif' }}>
                  Local Processing
                </p>
                <p className="text-sm text-gray-600" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  All analysis happens in your agent, not our servers
                </p>
              </div>

              <div className="text-center">
                <div className="text-3xl mb-2">⛓️</div>
                <p className="font-semibold text-gray-900 mb-1" style={{ fontFamily: 'DM Serif Text, serif' }}>
                  On-Chain Only
                </p>
                <p className="text-sm text-gray-600" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Only your personality result is saved as a Soulbound Token
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-green-200 text-center">
              <p className="text-sm text-gray-700 mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
                🛡️ <strong>Your agent can't access your wallet</strong> — it only reads public on-chain data
              </p>
              <p className="text-xs text-gray-600 italic" style={{ fontFamily: 'Outfit, sans-serif' }}>
                💬 Want proof? Ask your agent: <strong>"What data does Bloom Protocol store about me?"</strong>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
