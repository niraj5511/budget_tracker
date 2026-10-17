/**
 * Fixed rotation of colours for chart slices. Categories are user-driven and
 * open-ended, so there's no fixed mapping - each chart just walks this array
 * by index as it renders its rows.
 */
export const CHART_COLORS = [
  '#2f6fed',
  '#0f7a52',
  '#d97706',
  '#7c3aed',
  '#0891b2',
  '#db2777',
  '#65a30d',
  '#cf3232',
  '#64748b',
  '#ea580c',
]

export function colorFor(index) {
  // Double modulo so a negative index still wraps into range instead of
  // producing a negative array index (and `undefined`).
  const safeIndex = ((index % CHART_COLORS.length) + CHART_COLORS.length) % CHART_COLORS.length
  return CHART_COLORS[safeIndex]
}