// src/modules/admin/participant-registry/components/pccTheme.js
/**
 * Shared theme tokens + reusable atoms for all PCC components.
 * Import from this file to keep all 5 components visually consistent.
 */

export const T = {
  accent:    "#D97706",
  accentShadow: "0 4px 14px rgba(217,119,6,0.28)",
  ink:       "#1C1409",
  muted:     "#78716C",
  border:    "#E7E5E4",
  surface:   "#FAFAF9",
  pageBg:    "#F7F5F2",
};

export const STATUS_MAP = {
  active:    "bg-emerald-50 text-emerald-700 ring-emerald-200",
  pending:   "bg-amber-50 text-amber-700 ring-amber-200",
  inactive:  "bg-stone-100 text-stone-500 ring-stone-200",
  suspended: "bg-rose-50 text-rose-600 ring-rose-200",
  draft:     "bg-sky-50 text-sky-600 ring-sky-200",
  approved:  "bg-emerald-50 text-emerald-700 ring-emerald-200",
  rejected:  "bg-rose-50 text-rose-600 ring-rose-200",
  intransit: "bg-violet-50 text-violet-700 ring-violet-200",
  "in transit": "bg-violet-50 text-violet-700 ring-violet-200",
  received:  "bg-emerald-50 text-emerald-700 ring-emerald-200",
  exception: "bg-red-50 text-red-700 ring-red-200",
  assigned:  "bg-blue-50 text-blue-700 ring-blue-200",
};