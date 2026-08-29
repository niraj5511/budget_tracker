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
  '#475569',
  '#ea580c',
]

export function colorFor(index) {
  return CHART_COLORS[index % CHART_COLORS.length]
}