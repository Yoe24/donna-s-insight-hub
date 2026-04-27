/**
 * donna-theme.ts — Centralized palette constants for Donna Legal.
 *
 * These values mirror the inlined constants in src/pages/DemoWow.tsx.
 * DO NOT modify DemoWow.tsx — it keeps its own copies per Yoel's instruction.
 */

export const BG = '#FFFFFF';
export const SIDEBAR_BG = '#F9FAFB';
export const TEXT = '#0D0D0D';
export const TEXT_MUTED = '#737373';
export const TEXT_LIGHT = '#A0A0A0';
export const ACCENT = '#0D0D0D';
export const ACCENT_BG = '#F5F5F5';
export const INITIALS_BG = '#E5E5E5';

/**
 * 6 unique dossier colours — keys d1..d6.
 * Real dossier_ids are UUIDs; use colorFor() in CalendarPage for stable mapping.
 */
export const DOSSIER_COLORS: Record<string, string> = {
  d1: '#2563EB', // bleu
  d2: '#9333EA', // violet
  d3: '#0891B2', // teal
  d4: '#E11D48', // rose
  d5: '#D97706', // ambre
  d6: '#059669', // vert émeraude
};
