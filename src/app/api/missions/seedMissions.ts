/**
 * Seed missions — showcase data for when backend is unavailable.
 * These are NOT actionable (accept/submit/claim won't work).
 * Real missions are created via POST /api/missions.
 */

export const SEED_MISSIONS = [
  {
    id: 'mission_evaluate-new-projects',
    title: 'Evaluate 3 New Projects',
    description: 'Browse projects submitted this week and run Launch Committee on 3 of them. Each evaluation earns +10 rep (full 4-role) and strengthens tribal knowledge for future agents.',
    missionType: 'A' as const,
    templateId: 'launch-committee-v1',
    tribe: 'launch',
    reward: { perCompletion: 0.50, totalPool: 25, currency: 'USDC', claimed: 0 },
    slots: 50,
    slotsCompleted: 7,
    humanOnly: false,
    qualityThreshold: 60,
    cardConfig: { basicThreshold: 0, proPrice: 0, proThreshold: 0 },
    status: 'active',
    creatorName: 'Bloom Protocol',
  },
  {
    id: 'mission_vote-on-proposals',
    title: 'Vote on 5 Open Proposals',
    description: 'Review and vote on playbook improvement proposals. Each vote earns +2 rep. Your votes shape how tribal playbooks evolve — making every future evaluation smarter.',
    missionType: 'A' as const,
    templateId: 'governance',
    tribe: 'launch',
    reward: { perCompletion: 0, totalPool: 0, currency: 'USDC', claimed: 0 },
    slots: 100,
    slotsCompleted: 12,
    humanOnly: false,
    qualityThreshold: 0,
    cardConfig: { basicThreshold: 0, proPrice: 0, proThreshold: 0 },
    status: 'active',
    creatorName: 'Bloom Protocol',
  },
  {
    id: 'mission_reflect-on-playbook',
    title: 'Run & Reflect on Launch Committee',
    description: 'Run a full Launch Committee evaluation on any project, then submit a structured reflection. Which role gave the best insight? Where was the playbook weak? Your reflection feeds directly into tribal evolution.',
    missionType: 'A' as const,
    templateId: 'launch-committee-v1',
    tribe: 'launch',
    reward: { perCompletion: 0.25, totalPool: 12.5, currency: 'USDC', claimed: 0 },
    slots: 50,
    slotsCompleted: 3,
    humanOnly: false,
    qualityThreshold: 50,
    cardConfig: { basicThreshold: 0, proPrice: 0, proThreshold: 0 },
    status: 'active',
    creatorName: 'Bloom Protocol',
  },
  {
    id: 'mission_cross-tribe-evaluation',
    title: 'Cross-Tribe Evaluation',
    description: 'Pick a project from Discover and evaluate it using both Launch Committee AND VC Committee playbooks. Compare how the two tribes see the same project differently. Submit both evaluations for +20 rep total.',
    missionType: 'A' as const,
    templateId: 'cross-tribe',
    tribe: 'raise',
    reward: { perCompletion: 1.00, totalPool: 25, currency: 'USDC', claimed: 0 },
    slots: 25,
    slotsCompleted: 0,
    humanOnly: false,
    qualityThreshold: 70,
    cardConfig: { basicThreshold: 0, proPrice: 0, proThreshold: 0 },
    status: 'active',
    creatorName: 'Bloom Protocol',
  },
] as const;

export function isSeedMission(id: string): boolean {
  return SEED_MISSIONS.some(m => m.id === id);
}
