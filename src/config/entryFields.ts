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
 * a credential holder, or a list of gallery image keys. The first sub-field or
 * column is the head — the rest mean nothing without it.
 */
export type EntryField =
  | string
  | { key: string; object: readonly string[] }
  | { key: string; list: readonly string[] }
  | { key: string; credentials: 'documents' | 'categories' | 'mentoredCategories' | 'ongoingCategories' }
  | { key: string; images: 'gallery' }

export const entryFields = {
  experience: ['job_role', 'type', 'company', 'department', 'location', 'time_period', 'supervisor', 'projects', 'description', { key: 'cred_link', credentials: 'documents' }],
  education: ['type', 'degree', 'field', 'sub_field', 'institution', 'campus', 'location', 'time_period', 'current_level', 'gpa', 'category', { key: 'cred_link', credentials: 'documents' }],
  researchInterests: ['key'],
  announcements: ['message', 'icon'],
  // Achievements carry no `prize`; they share the set and leave it blank, as
  // an education entry without a GPA does.
  awards: ['title', 'id', 'year', 'organization', 'category', 'prize', 'description', 'cred_link'],

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
  certifications: ['title', { key: 'issuer', object: ['institution', 'platform', 'location'] }, 'instructor', 'date', 'duration', 'tag', 'logo', 'cred_link'],

  conferences: ['title', 'organizer', 'institution', 'location', 'date', 'link', 'cred_link'],
  fdps: ['title', 'institution', 'date', 'duration', 'mode', 'cred_link'],
  workshops: ['title', 'instructor', 'institution', 'date', 'duration', 'mode', 'cred_link', 'details_cred'],
  bootcamps: ['title', 'instructor', 'institution', 'location', 'date', 'duration', 'cirriculum', 'link', 'cred_link'],
  otherLearning: ['title', 'type', 'speaker', 'host', 'date', 'mode', 'link', 'cred_link'],

  // One leadership entry can hold several roles, each at its own organisation,
  // with its own host and period. `cred_link` on an affiliation may be a list
  // of labelled documents, which is preserved rather than edited here.
  //
  // In both co-curricular collections a role carries either `cred_link` (a
  // document, opened in the viewer) or `ext_link` (a site, opened in a new
  // tab) -- never both; the card shows the credential if both are set. Where
  // the two sit side by side, the admin edits them as one choice. `ext_link`
  // belongs to the role, unlike `organization.web_link`, which is the
  // organisation's own site.
  leadership: ['role', { key: 'affiliation', list: ['role', 'organization.name', 'organization.web_link', 'host.name', 'host.web_link', 'institute', 'time_period', 'cred_link', 'ext_link'] }, 'description', 'cred_link', 'ext_link'],
  // A volunteering entry is either a single role or a `roles` list of them. The
  // per-role `field` list is preserved rather than edited here.
  volunteering: ['role', 'organization', { key: 'roles', list: ['role', 'organization', 'time_period', 'skills', 'cred_link', 'ext_link'] }, { key: 'field', list: ['sub_field', 'time_period', 'skills'] }, 'time_period', 'cred_link', 'ext_link'],
  hostedEvents: ['title', 'event_type', 'guest_speakers', 'institution', 'date', 'mode'],

  facts: ['title', 'description', 'icon'],
  // `source` is where the line is from -- a book, a film -- and is optional.
  pageQuotes: ['text', 'author', 'source'],

  // The CV library (src/content/cv/library.yml). A row's keys beyond these are
  // wording variants, which the editor shows as columns of their own; `tags`
  // is left to the YAML.
  cvEntries: ['ref', 'id', 'title', 'subtitle', 'tech', 'context', 'link', 'link_label', 'location', 'period', 'coursework', 'short_title', 'short_context'],
  cvBullets: ['id', 'ref', 'kind', 'text'],
  cvSummaries: ['id', 'text'],
  cvSkills: ['id', 'label', 'text'],
  cvInterests: ['id', 'text'],
  galleryItems: ['id', 'title', 'type', 'event', 'location', 'date', 'caption', 'tags', 'featured', { key: 'images', images: 'gallery' }, 'manifestDescription', 'externalUrl'],
  studyMaterial: ['title', { key: 'materials', list: ['title', 'meta', 'instructor', 'distributor', 'logo', 'link', 'paid'] }],
  worthExploring: ['group', 'links'],
  worthSubscribing: ['group', 'icon', 'cta', { key: 'links', list: ['label', 'url', 'subscribe_url', 'cadence', 'speciality', 'description', 'incharge'] }],

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

/** The key that lists gallery image keys, if the collection has one. */
export function galleryImagesKeyOf(fields: readonly EntryField[]): string | undefined {
  const field = fields.find(item => typeof item !== 'string' && 'images' in item)
  return field && typeof field !== 'string' ? field.key : undefined
}

/** How this collection's `cred_link` is shaped, if it holds credentials. */
export function credentialStyleOf(fields: readonly EntryField[]): 'documents' | 'categories' | 'mentoredCategories' | 'ongoingCategories' | undefined {
  const field = fields.find(item => typeof item !== 'string' && 'credentials' in item)
  return field && typeof field !== 'string' && 'credentials' in field ? field.credentials : undefined
}

export type EntryCollection = keyof typeof entryFields
