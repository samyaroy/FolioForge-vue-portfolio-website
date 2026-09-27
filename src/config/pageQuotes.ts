/**
 * The pages a quote can be written for.
 *
 * `id` is the router's route name, not a slug: QuoteDiv looks a quote up with
 * `page_quotes[route.name]`, so a key that is not a route name is a quote that
 * never shows and silently falls back to `default`. Two of these carry the
 * spelling the routes themselves use -- `Affilications`, `ProfessionalAcitivity`
 * -- and have to keep it until the routes are renamed.
 *
 * A group here needs a matching entry in the Worker's content registry and a
 * key in page_quotes.yml; the registry stays an explicit allowlist, so adding a
 * page means adding it in both. A test holds the two together.
 */
export const pageQuoteGroups = [
  { id: 'default', label: 'Every page (fallback)' },
  { id: 'Home', label: 'Home' },
  { id: 'ProjectsPublications', label: 'Projects & Publications' },
  { id: 'Teachings', label: 'Teaching' },
  { id: 'OngoingProjects', label: 'Ongoing Projects' },
  { id: 'Affilications', label: 'Affiliations' },
  { id: 'InternshipCertification', label: 'Internships & Certifications' },
  { id: 'Workshops', label: 'Conferences & Workshops' },
  { id: 'Cocurricular', label: 'Volunteering & Co-curricular' },
  { id: 'ProfessionalAcitivity', label: 'Professional Activity' },
  { id: 'Gallery', label: 'Career Unlocks' },
  { id: 'Resources', label: 'Resources' },
  { id: 'Contact', label: 'Contact' },
  { id: 'PrivacyPolicy', label: 'Privacy Policy' },
] as const

export type PageQuoteGroup = typeof pageQuoteGroups[number]['id']
