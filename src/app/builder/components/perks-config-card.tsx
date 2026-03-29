'use client';

import { useState, useMemo } from 'react';
import { useBuilderDashboard } from '../contexts/builder-dashboard-context';

// Matches the 4 Exclusive Pass perks shown to backers on the Skills page
const PASS_PERK_TEMPLATES = [
  {
    id: 'priority-rewards',
    title: 'Priority Rewards',
    desc: 'First in line for project drops and updates',
    placeholder: 'e.g. First 50 backers get 2x airdrop allocation',
  },
  {
    id: 'founding-status',
    title: 'Founding Status',
    desc: 'Recognized as an early backer',
    placeholder: 'e.g. "Founding Supporter" badge on your profile',
  },
  {
    id: 'early-pricing',
    title: 'Early Pricing',
    desc: 'Discounted or free access',
    placeholder: 'e.g. Lifetime 50% discount on premium tier',
  },
  {
    id: 'exclusive-skills',
    title: 'Exclusive Skills',
    desc: 'Premium access and limited editions',
    placeholder: 'e.g. Private beta access to v2 agent features',
  },
] as const;

export default function PerksConfigCard() {
  const { claimedSkills } = useBuilderDashboard();

  // Only show for approved claims
  const approvedSkills = useMemo(
    () => claimedSkills.filter(s => s.claimStatus === 'approved'),
    [claimedSkills]
  );

  const [selectedSkill, setSelectedSkill] = useState<string | null>(
    approvedSkills.length === 1 ? approvedSkills[0].slug : null
  );
  const [perkDetails, setPerkDetails] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<string | null>(null);

  if (approvedSkills.length === 0) return null;

  const handleSave = async () => {
    if (!selectedSkill) return;

    setIsSaving(true);
    setSaveResult(null);

    try {
      // Build perks array from filled-in templates
      const perks = PASS_PERK_TEMPLATES
        .filter(t => perkDetails[t.id]?.trim())
        .map(t => `${t.title}: ${perkDetails[t.id]!.trim()}`);

      if (perks.length === 0) {
        setSaveResult('Add at least one perk detail.');
        setIsSaving(false);
        return;
      }

      const { builderService } = await import('@/lib/api/services/builderService');
      await builderService.submitClaimRequest({
        skillSlug: selectedSkill,
        githubUsername: '', // Not needed for perk update
        perks,
      });

      setSaveResult('Perks saved successfully!');
      setTimeout(() => setSaveResult(null), 3000);
    } catch {
      setSaveResult('Failed to save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="rounded-[20px] p-6"
      style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(245,240,255,0.35) 100%)',
        border: '1px solid rgba(255,255,255,0.6)',
        boxShadow: '0 4px 24px rgba(100,80,150,0.08), inset 0 1px 0 rgba(255,255,255,0.7), inset 0 -1px 0 rgba(150,130,200,0.06)',
        backdropFilter: 'blur(24px) saturate(1.2)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.2)',
      }}
    >
      {/* Header */}
      <div className="mb-4">
        <h3
          className="text-[15px] font-semibold text-[#1a1228] mb-1"
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          EXCLUSIVE PASS PERKS
        </h3>
        <p
          className="text-[11px] text-[#9ca3af]"
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          Configure what your early backers receive with their Exclusive Pass.
        </p>
      </div>

      {/* Skill selector (if multiple approved) */}
      {approvedSkills.length > 1 && (
        <div className="mb-4">
          <select
            value={selectedSkill || ''}
            onChange={e => setSelectedSkill(e.target.value || null)}
            className="w-full px-3 py-2 text-[13px] border border-white/60 bg-white/50 rounded-xl focus:outline-none focus:border-[#8478e0] text-[#393f49]"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            <option value="">Choose a skill...</option>
            {approvedSkills.map(s => (
              <option key={s.slug} value={s.slug}>{s.name || s.slug}</option>
            ))}
          </select>
        </div>
      )}

      {/* Perk templates */}
      <div className="space-y-3">
        {PASS_PERK_TEMPLATES.map(template => (
          <div key={template.id} className="p-3 bg-white/40 rounded-xl">
            <div className="flex items-start justify-between mb-1.5">
              <div>
                <p
                  className="text-[13px] font-medium text-[#393f49]"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  {template.title}
                </p>
                <p
                  className="text-[11px] text-[#9ca3af]"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  {template.desc}
                </p>
              </div>
            </div>
            <input
              type="text"
              value={perkDetails[template.id] || ''}
              onChange={e => setPerkDetails(prev => ({ ...prev, [template.id]: e.target.value }))}
              placeholder={template.placeholder}
              className="w-full px-3 py-1.5 text-[12px] border border-white/60 bg-white/50 rounded-lg focus:outline-none focus:border-[#8478e0] text-[#393f49] placeholder-[#c0c5d0]"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            />
          </div>
        ))}
      </div>

      {/* Save result */}
      {saveResult && (
        <p
          className={`mt-3 text-[12px] ${saveResult.includes('success') ? 'text-emerald-600' : 'text-amber-600'}`}
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          {saveResult}
        </p>
      )}

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={!selectedSkill || isSaving}
        className="w-full mt-4 py-2.5 rounded-xl font-['Outfit'] font-semibold text-[13px] text-white bg-[#8478e0] hover:bg-[#6c5ecc] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isSaving ? 'Saving...' : 'Save Perks'}
      </button>

      {/* Hint */}
      <p
        className="mt-2 text-[10px] text-[#b0b5c0] leading-relaxed"
        style={{ fontFamily: 'Outfit, sans-serif' }}
      >
        Backers see these perks on your skill&apos;s Exclusive Pass. Be specific — concrete perks attract more backers.
      </p>
    </div>
  );
}
