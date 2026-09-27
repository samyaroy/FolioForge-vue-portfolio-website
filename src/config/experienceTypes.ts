// Experience `type` values the timeline renders, each with its default icon.
// The admin editor offers exactly these keys, so add a type here to support it.
export const experienceTypeIcons = {
  Employment: 'mdi-chair-rolling',
  Internship: 'mdi-laptop',
  Freelance: 'mdi-laptop-account',
} as const

export type ExperienceType = keyof typeof experienceTypeIcons

const FALLBACK_ICON = 'mdi-laptop-account'

// Employment narrows further by role, which is why this is a function rather
// than the plain map that education uses.
export function experienceIcon(type: string | undefined, jobRole = ''): string {
  if (type === 'Employment') {
    if (jobRole.includes('Developer')) return 'mdi-briefcase'
    if (jobRole.includes('Research')) return 'mdi-chart-scatter-plot-hexbin'
  }
  return experienceTypeIcons[type as ExperienceType] ?? FALLBACK_ICON
}
