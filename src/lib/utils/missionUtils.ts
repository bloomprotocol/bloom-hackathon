/** Default mission image URL when API doesn't provide imageUrl */
export const DEFAULT_MISSION_IMAGE = "https://statics.bloomprotocol.ai/missions/default-image-for-mission.jpg";

export function generateMissionSlug(title: string): string {
  if (!title) return '';
  
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')         // Replace spaces with hyphens
    .replace(/-+/g, '-')          // Replace multiple hyphens with single hyphen
    .trim();
}

export function getMissionIdFromSlug(slug: string, missions: Array<{ id: string; title: string }> | null | undefined): string | null {
  if (!missions || !Array.isArray(missions)) {
    return null;
  }
  const mission = missions.find(m => generateMissionSlug(m.title) === slug);
  return mission?.id || null;
}

/**
 * Check if a mission is expired based on its endTime
 * @param endTime - The mission end time (ISO string or null)
 * @returns true if the mission has expired, false otherwise
 */
export function isMissionExpired(endTime: string | null | undefined): boolean {
  if (!endTime) return false;
  return new Date(endTime) < new Date();
}