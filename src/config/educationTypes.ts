// Education `type` values the timeline renders, each with its milestone icon.
// The admin editor offers exactly these keys, so add a type here to support it.
export const educationTypeIcons = {
  School: 'mdi-town-hall',
  Diploma: 'mdi-certificate',
  College: 'mdi-school',
  University: 'mdi-school',
} as const

export type EducationType = keyof typeof educationTypeIcons
