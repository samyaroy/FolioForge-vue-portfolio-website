// Route metadata shared by the runtime router (src/router/index.ts) and the
// build (vite.config.ts), which derives the sitemap from it and prerenders one
// HTML file per route. A single table is what makes those safe to derive: a
// route added here is routed, listed in the sitemap, and prerendered together,
// so the three can no longer drift apart.
//
// `description` is written for search-result snippets — roughly 155 characters,
// leading with what the page actually holds. It is deliberately separate from
// the on-page subtitles in src/content/profile_info/description.yml, which are
// UI copy, are feature-flag gated, and run far longer than a snippet allows.

export interface RouteMetadata {
  path: string
  /** Matches the route `name` the app links to (e.g. `{ name: 'Contact' }`). */
  name: string
  /** Page title, or null on Home, which uses the site title on its own. */
  title: string | null
  description: string
  flagPath?: string | string[]
  flagMode?: 'all' | 'any'
}

export const SITE_URL = 'https://samyabrata.codeium.xyz'
export const SITE_NAME = 'Samyabrata Roy'
export const BASE_TITLE = 'Samyabrata Roy - Portfolio'
export const BLOG_URL = 'https://blogs.samyabrata.codeium.xyz'

/** 1200x630 card image; regenerate with scripts/generate-og-image.sh. */
export const OG_IMAGE_PATH = '/og-image.jpg'

export const routeMetadata: RouteMetadata[] = [
  {
    path: '/',
    name: 'Home',
    title: null,
    description:
      'Samyabrata Roy — statistics and data science. Associate Software Developer at IDEAS-TIH, ISI Kolkata, and BS Data Science student at IIT Madras.',
  },
  {
    path: '/projects-publications',
    name: 'ProjectsPublications',
    title: 'Projects & Publications',
    description:
      'Research publications, technical and research projects, posters, and articles by Samyabrata Roy across statistics, data science, and machine learning.',
    flagPath: 'showProjectsPublications',
    flagMode: 'any',
  },
  {
    path: '/affiliation-memberships',
    name: 'Affilications',
    title: 'Affiliations & Memberships',
    description:
      'Professional bodies, research networks, and academic communities Samyabrata Roy is affiliated with.',
    flagPath: 'showAffiliations',
    flagMode: 'any',
  },
  {
    path: '/ongoing-projects',
    name: 'OngoingProjects',
    title: 'Ongoing Projects',
    description:
      'Work Samyabrata Roy is currently building — personal, academic, and collaborative projects in statistics, data science, and software development.',
    flagPath: 'showOngoingProjects',
  },
  {
    path: '/cocurricular',
    name: 'Cocurricular',
    title: 'Co-curricular',
    description:
      'Leadership roles, volunteering, and co-curricular work Samyabrata Roy takes on alongside academics and research.',
    flagPath: 'showCocurricular',
    flagMode: 'any',
  },
  {
    path: '/workshops-bootcamps-attended',
    name: 'Workshops',
    title: 'Workshops & Bootcamps',
    description:
      'Conferences, workshops, and intensive bootcamps in statistics, data science, and AI attended by Samyabrata Roy.',
    flagPath: 'showWorkshopsAttended',
    flagMode: 'any',
  },
  {
    path: '/teachings',
    name: 'Teachings',
    title: 'Teaching',
    description:
      'Courses taught, projects mentored, and academic teaching contributions by Samyabrata Roy.',
    flagPath: 'showTeachings',
    flagMode: 'any',
  },
  {
    path: '/internships-certifications',
    name: 'InternshipCertification',
    title: 'Internships & Certifications',
    description:
      'Internships and professional certifications completed by Samyabrata Roy in data science, statistics, and software development.',
    flagPath: 'showInternshipCertifications',
    flagMode: 'any',
  },
  {
    path: '/professional-activity',
    name: 'ProfessionalAcitivity',
    title: 'Professional Activity',
    description:
      'Invited talks, events hosted or convened, and professional service by Samyabrata Roy.',
    flagPath: 'showProfessionalActivity',
    flagMode: 'any',
  },
  {
    path: '/gallery',
    name: 'Gallery',
    title: 'Gallery',
    description:
      "A visual timeline of milestones, events, and memorable moments from Samyabrata Roy's academic and professional journey.",
    flagPath: 'showGallery',
  },
  {
    path: '/contact',
    name: 'Contact',
    title: 'Contact',
    description:
      'Get in touch with Samyabrata Roy about projects, research collaborations, and opportunities.',
  },
  {
    path: '/privacy-policy',
    name: 'PrivacyPolicy',
    title: 'Privacy Policy',
    description:
      'How this site handles visitor data, analytics, and third-party content.',
  },
  {
    path: '/resources',
    name: 'Resources',
    title: 'Resources',
    description:
      'A curated collection of links, materials, and references on statistics, data science, and machine learning, shared by Samyabrata Roy.',
    flagPath: 'showResources.main',
  },
  {
    path: '/facts',
    name: 'Facts',
    title: 'Did You Know?',
    description:
      'A few quick things you might not know about Samyabrata Roy and how this site is put together.',
    flagPath: 'showFacts',
  },
]

/** Title shown in the tab and in search results for a given route. */
export function pageTitle(title: string | null): string {
  return title ? `${title} · ${SITE_NAME}` : BASE_TITLE
}
