// The Projects tab groups by an exact `type` match, so a project whose type is
// not one of these lands in no group and never appears on the page.
export const projectTypeLabels = {
  research: 'Research Project',
  technical: 'Technical Project',
  minor: 'Minor Project',
  other: 'Other Project',
} as const

export const projectTypes = Object.values(projectTypeLabels)

export type ProjectType = typeof projectTypes[number]
