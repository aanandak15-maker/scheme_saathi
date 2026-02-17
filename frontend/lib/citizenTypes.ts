
// Re-export CitizenProfile from the canonical types to avoid duplicate definitions.
// The eligibility engine and AI reasoning modules should use this single source of truth.
export type { CitizenProfile } from '@/types';
