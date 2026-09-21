/**
 * The canonical field list for each content collection, in the order the editor
 * shows them.
 *
 * Every entry in a collection carries every key, blank where it does not apply,
 * so a field is never missing just because one entry never used it: a project
 * without a DOI still offers the `doi` box. The editor writes the full set back
 * when an entry is saved.
 *
 * The lists come from the keys the content already uses, plus keys the site
 * renders but no entry happens to fill in yet. A collection with no entries to
 * learn from is left out until its shape is settled.
 */
/**
 * A field is either a plain key, or a key with the shape of what sits inside
 * it: an object edited as named sub-fields, a list edited as rows of columns,
 * or a credential holder. The first sub-field or column is the head — the rest
 * mean nothing without it.
 */
export type EntryField =
  | string
  | { key: string; object: readonly string[] }
  | { key: string; list: readonly string[] }
  | { key: string; credentials: 'documents' | 'categories' | 'mentoredCategories' | 'ongoingCategories' }

export const entryFields = {
  experience: ['job_role', 'type', 'company', 'department', 'location', 'time_period', 'supervisor', 'projects', 'description', { key: 'cred_link', credentials: 'documents' }],
  education: ['type', 'degree', 'field', 'sub_field', 'institution', 'campus', 'location', 'time_period', 'current_level', 'gpa', 'category', 'cred_link'],
  researchInterests: ['key'],
  announcements: ['message', 'icon'],

  projects: ['title', 'type', 'description', 'affiliation', 'tech_stack', 'time_period', { key: 'guide', object: ['name', 'title', 'department', 'institution'] }, { key: 'collaborators', list: ['name', 'link'] }, 'doi', 'logo', { key: 'cred_link', credentials: 'categories' }],
  articles: ['title', { key: 'publication', object: ['name', 'host'] }, 'field', 'article_type', 'type', 'date', 'link', 'cred_link'],

  // The card renders `instructor`, `institution` and `duration` although no
  // entry fills them in yet; they are declared so one can be, without hand
  // editing the YAML. `guide` is the same role under the older name.
  ongoingProjects: ['title', 'type', 'description', 'affiliation', 'tech_stack', 'time_period', 'instructor', 'institution', 'duration', { key: 'guide', object: ['name', 'title', 'department', 'institution'] }, { key: 'collaborators', list: ['name', 'link'] }, { key: 'cred_link', credentials: 'ongoingCategories' }],

  // A mentoring engagement: one internship programme, mentored once. The
  // projects it produced are their own collection.
  mentoringEngagements: ['semester', 'role', 'programme', 'time_period', 'focus', { key: 'institution', object: ['name', 'location'] }],
  otherTeaching: ['title', 'role', { key: 'institution', object: ['name', 'location'] }, 'duration', 'audience', 'students', 'description', 'link'],
  mentoredProjects: ['title', 'course', { key: 'students', list: ['name', 'email', 'Linkedin'] }, 'registration_number', { key: 'affiliation', object: ['name', 'location'] }, 'description', { key: 'cred_link', credentials: 'mentoredCategories' }],

  memberships: ['organization', 'chapter', 'role', 'membership_id', 'period', 'location', 'cred_link'],
  internships: ['role', 'type', 'company', 'department', 'location', 'time_period', { key: 'guide', object: ['name', 'title', 'institution'] }, 'project', 'description', 'cred_link'],
  certifications: ['title', 'issuer', 'instructor', 'date', 'duration', 'tag', 'logo', 'cred_link'],

  conferences: ['title', 'organizer', 'institution', 'location', 'date', 'link', 'cred_link'],
  fdps: ['title', 'institution', 'date', 'duration', 'mode', 'cred_link'],
  workshops: ['title', 'instructor', 'institution', 'date', 'duration', 'mode', 'cred_link', 'details_cred'],
  bootcamps: ['title', 'instructor', 'institution', 'location', 'date', 'duration', 'cirriculum', 'link', 'cred_link'],
  otherLearning: ['title', 'type', 'speaker', 'host', 'date', 'mode', 'link', 'cred_link'],

  // One leadership entry can hold several roles, each at its own organisation,
  // with its own host and period. `cred_link` on an affiliation is a list of
  // labelled documents and is preserved rather than edited here.
  leadership: ['role', { key: 'affiliation', list: ['role', 'organization.name', 'organization.web_link', 'host.name', 'host.web_link', 'institute', 'time_period'] }, 'description', 'cred_link'],
  // A volunteering entry is either a single role or a `roles` list of them. The
  // per-role `field` list is preserved rather than edited here.
  volunteering: ['role', 'organization', { key: 'roles', list: ['role', 'organization', 'time_period', 'skills'] }, { key: 'field', list: ['sub_field', 'time_period', 'skills'] }, 'time_period', 'cred_link'],
  hostedEvents: ['title', 'event_type', 'guest_speakers', 'institution', 'date', 'mode'],

  facts: ['title', 'description', 'icon'],
  galleryItems: ['id', 'title', 'type', 'event', 'location', 'date', 'caption', 'tags', 'featured', 'images', 'manifestDescription', 'externalUrl'],
  studyMaterial: ['title', { key: 'materials', list: ['title', 'meta', 'instructor', 'distributor', 'logo', 'link'] }],
  worthExploring: ['group', 'links'],

  // Blog collections.
  blogRecommended: ['id', 'title', 'author', 'source', 'year', 'url', 'note'],
  blogReadings: ['id', 'title', 'author', 'genre', 'description', 'image', 'link'],
  blogMovies: ['id', 'title', 'director', 'genre', 'year', 'description', 'image', 'link'],
  blogTravel: ['state', 'purpose', 'cities'],
  blogHobbies: ['label', 'icon'],
} as const satisfies Record<string, readonly EntryField[]>

/** Just the keys, in order. */
export function fieldKeys(fields: readonly EntryField[]): string[] {
  return fields.map(field => typeof field === 'string' ? field : field.key)
}

/** Keys edited as named sub-fields, mapped to those sub-fields. */
export function objectFieldsOf(fields: readonly EntryField[]): Record<string, readonly string[]> {
  return Object.fromEntries(fields.flatMap(field => typeof field !== 'string' && 'object' in field ? [[field.key, field.object]] : []))
}

/** Keys edited as rows, mapped to their columns. */
export function listFieldsOf(fields: readonly EntryField[]): Record<string, readonly string[]> {
  return Object.fromEntries(fields.flatMap(field => typeof field !== 'string' && 'list' in field ? [[field.key, field.list]] : []))
}

/** How this collection's `cred_link` is shaped, if it holds credentials. */
export function credentialStyleOf(fields: readonly EntryField[]): 'documents' | 'categories' | 'mentoredCategories' | 'ongoingCategories' | undefined {
  const field = fields.find(item => typeof item !== 'string' && 'credentials' in item)
  return field && typeof field !== 'string' && 'credentials' in field ? field.credentials : undefined
}

export type EntryCollection = keyof typeof entryFields
