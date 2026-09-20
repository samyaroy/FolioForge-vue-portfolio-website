/**
 * The only files this admin may write, and where each collection lives inside
 * them. The browser sends a collection id; the Worker decides which path that
 * means. No request carries a path, so no request can reach a file that is not
 * named here — and Contents write is repository-wide, so this table is the
 * thing standing between the admin and every other file in the repository.
 *
 * `arrayKeys` lists the sequences a collection is drawn from, in the order the
 * editor concatenates them, each as a dotted path — projects.yml keeps all four
 * of its sequences under one `projects:` key. An index counts across them in
 * that same order, so entry 5 of a two-array collection lands in whichever array
 * really holds it rather than being moved into the first.
 */
export type ContentSource = { path: string; arrayKeys: readonly string[] }

const PORTFOLIO = 'src/content/profile_info'
const BLOG = 'blogs/src/content'
const METADATA = 'src/metadata'

export const contentSources = {
  'home/education': { path: `${PORTFOLIO}/education.yml`, arrayKeys: ['education'] },
  'home/experience': { path: `${PORTFOLIO}/experience.yml`, arrayKeys: ['experience'] },
  'home/research-interests': { path: `${PORTFOLIO}/research_interests.yml`, arrayKeys: ['research_interests'] },
  'home/announcements': { path: `${PORTFOLIO}/ribbon.yml`, arrayKeys: ['ribbon'] },

  // One adapter per group, so a new entry joins the group being edited.
  'projects-publications/research': { path: `${PORTFOLIO}/projects.yml`, arrayKeys: ['projects.research_projects'] },
  'projects-publications/technical': { path: `${PORTFOLIO}/projects.yml`, arrayKeys: ['projects.technical_projects'] },
  'projects-publications/minor': { path: `${PORTFOLIO}/projects.yml`, arrayKeys: ['projects.minor_projects'] },
  'projects-publications/other': { path: `${PORTFOLIO}/projects.yml`, arrayKeys: ['projects.other_projects'] },
  'projects-publications/articles': { path: `${PORTFOLIO}/publications.yml`, arrayKeys: ['articles'] },
  'projects-publications/publications': { path: `${PORTFOLIO}/publications.yml`, arrayKeys: ['publications'] },
  'projects-publications/posters': { path: `${PORTFOLIO}/publications.yml`, arrayKeys: ['posters'] },

  'teaching/courses': { path: `${PORTFOLIO}/teaching.yml`, arrayKeys: ['courses_taught'] },
  // Mentored projects are grouped by semester and shown as one list.
  'teaching/projects': { path: `${PORTFOLIO}/teaching.yml`, arrayKeys: ['projects_mentored.*.projects'] },
  // The groups themselves: each one is a mentoring engagement.
  'teaching/mentoring': { path: `${PORTFOLIO}/teaching.yml`, arrayKeys: ['projects_mentored'] },
  'teaching/others': { path: `${PORTFOLIO}/teaching.yml`, arrayKeys: ['other_teachings'] },
  'ongoing-projects/projects': { path: `${PORTFOLIO}/ongoing_projects.yml`, arrayKeys: ['ongoing_projects'] },

  'affiliations/affiliations': { path: `${PORTFOLIO}/affiliations.yml`, arrayKeys: ['affiliations'] },
  'affiliations/collaborators': { path: `${PORTFOLIO}/affiliations.yml`, arrayKeys: ['collaborators'] },
  'affiliations/memberships': { path: `${PORTFOLIO}/affiliations.yml`, arrayKeys: ['memberships'] },

  'internships-certifications/internships': { path: `${PORTFOLIO}/internships.yml`, arrayKeys: ['internships'] },
  'internships-certifications/certifications': { path: `${PORTFOLIO}/certifications.yml`, arrayKeys: ['certifications', 'more_certifications'] },

  'workshops/conferences': { path: `${PORTFOLIO}/workshops.yml`, arrayKeys: ['attended_conferences'] },
  'workshops/fdps': { path: `${PORTFOLIO}/workshops.yml`, arrayKeys: ['attended_fdps'] },
  // Two sequences, so which one an entry joins is a choice rather than a
  // consequence of being last in the file.
  'workshops/main': { path: `${PORTFOLIO}/workshops.yml`, arrayKeys: ['attended_workshops'] },
  'workshops/additional': { path: `${PORTFOLIO}/workshops.yml`, arrayKeys: ['attended_other_workshops'] },
  'workshops/bootcamps': { path: `${PORTFOLIO}/workshops.yml`, arrayKeys: ['attended_bootcamps'] },
  'workshops/other': { path: `${PORTFOLIO}/workshops.yml`, arrayKeys: ['attended_webinars_n_others'] },

  // Co-curricular groups are named rather than positional, so reordering them
  // in the file does not change which list an edit reaches.
  'cocurricular/leadership': { path: `${PORTFOLIO}/cocurricular.yml`, arrayKeys: ['co_curriculars[title=leadership_roles].entries'] },
  'cocurricular/volunteering': { path: `${PORTFOLIO}/cocurricular.yml`, arrayKeys: ['co_curriculars[title=volunteering_roles].entries'] },

  'professional-activity/invited-talks': { path: `${PORTFOLIO}/professional_activity.yml`, arrayKeys: ['invited_talks'] },
  'professional-activity/hosted-events': { path: `${PORTFOLIO}/professional_activity.yml`, arrayKeys: ['hosted_events', 'other_hosted_events'] },

  'gallery/career-unlocks': { path: `${PORTFOLIO}/gallery.yml`, arrayKeys: ['items'] },
  'resources/study-material': { path: `${PORTFOLIO}/resources.yml`, arrayKeys: ['subjects'] },
  'resources/worth-exploring': { path: `${PORTFOLIO}/resources.yml`, arrayKeys: ['explore'] },
  'facts/facts': { path: `${PORTFOLIO}/facts.yml`, arrayKeys: ['facts'] },

  // SmartLink resolves a name or alias to a URL through this file; both groups
  // are top-level sequences in the same document.
  'metadata/institutes': { path: `${METADATA}/hyperlinkMetadata.yml`, arrayKeys: ['Institute'] },
  'metadata/people': { path: `${METADATA}/hyperlinkMetadata.yml`, arrayKeys: ['Person'] },

  'recommended/items': { path: `${BLOG}/recommended/data.yml`, arrayKeys: ['items'] },
  'readings/items': { path: `${BLOG}/readings/data.yml`, arrayKeys: ['items'] },
  'movies/items': { path: `${BLOG}/movies/data.yml`, arrayKeys: ['items'] },
  'travel/states': { path: `${BLOG}/travel/data.yml`, arrayKeys: ['states'] },
  'hobbies/tiles': { path: `${BLOG}/hobbies/data.yml`, arrayKeys: ['tiles'] },
} as const satisfies Record<string, ContentSource>

export type CollectionId = keyof typeof contentSources

export function contentSource(id: string): ContentSource | undefined {
  return Object.prototype.hasOwnProperty.call(contentSources, id) ? contentSources[id as CollectionId] : undefined
}

/** Every path the admin is allowed to write, for the guard and for tests. */
export const writablePaths: readonly string[] = [...new Set(Object.values(contentSources).map(source => source.path))]

export function isWritablePath(path: string): boolean {
  return writablePaths.includes(path)
}
