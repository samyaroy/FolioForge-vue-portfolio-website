import {
  BadgeCheck,
  BookMarked,
  BookOpenCheck,
  Clapperboard,
  BriefcaseBusiness,
  Contact,
  FolderKanban,
  GalleryHorizontalEnd,
  GraduationCap,
  HandHeart,
  House,
  Lightbulb,
  LibraryBig,
  Network,
  MapPinned,
  Palette,
  Presentation,
  Sparkles,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { educationTypeIcons } from '../../../src/config/educationTypes.ts'
import { experienceTypeIcons } from '../../../src/config/experienceTypes.ts'
import { projectTypes } from '../../../src/config/projectTypes.ts'
import { entryFields } from '../../../src/config/entryFields.ts'
import type { EntryField } from '../../../src/config/entryFields.ts'
import { articleTypes } from '../../../src/config/articleTypes.ts'

export type PortfolioSection = {
  id: string
  title: string
  sources: string[]
  fields: string[]
  /**
   * Entry keys the section cannot be published without, because the Vue
   * component that renders them declares the prop as required. The editor
   * stars these and refuses to save while one is blank. Add a key here to
   * make a field mandatory; leave the list off for sections with none.
   */
  requiredFields?: string[]
  /**
   * Values offered for the entry's `type` field, which the editor shows as a
   * dropdown instead of a text box. Each list comes from the site, where an
   * unrecognised type changes how the entry renders or hides it altogether.
   */
  typeOptions?: readonly string[]
  /**
   * Every key an entry in this section carries, in editor order. The editor
   * shows them all whether or not an entry has them, and writes the full set
   * back on save, so one entry missing `doi` cannot hide the field from the
   * others. See src/config/entryFields.ts.
   */
  entryFields?: readonly EntryField[]
}

export type PortfolioPage = {
  id: string
  title: string
  publicPath: string
  icon: LucideIcon
  description: string
  sections: PortfolioSection[]
  /** Which site the page belongs to; decides where "View beta page" points. */
  site?: 'portfolio' | 'blog'
  /** Admin URL prefix, so blog collections live under /blog rather than /portfolio. */
  basePath?: string
}

export const portfolioPages: PortfolioPage[] = [
  {
    id: 'home', title: 'Home', publicPath: '/', icon: House,
    description: 'Homepage identity, biography, primary experience, education, and announcements.',
    sections: [
      { id: 'profile', title: 'Profile & Hero', sources: ['profile.yml', 'meta.yml'], fields: ['Name and biography', 'Hero heading and portrait', 'Contact and social links', 'CV and footer copy'], requiredFields: ['name', 'heading', 'about', 'gmail'] },
      { id: 'research-interests', title: 'Research Interests', sources: ['research_interests.yml'], fields: ['Interest title', 'Stable key', 'Display order'], requiredFields: ['title'], entryFields: entryFields.researchInterests },
      { id: 'experience', title: 'Experience', sources: ['experience.yml'], fields: ['Role and organisation', 'Dates and location', 'Description and links', 'Logo'], requiredFields: ['job_role', 'company', 'location', 'time_period'], typeOptions: Object.keys(experienceTypeIcons), entryFields: entryFields.experience },
      { id: 'education', title: 'Education', sources: ['education.yml'], fields: ['Institution and programme', 'Dates and grades', 'Coursework and details', 'Links and logos'], requiredFields: ['degree', 'institution', 'location', 'time_period'], typeOptions: Object.keys(educationTypeIcons), entryFields: entryFields.education },
      { id: 'awards', title: 'Awards & Achievements', sources: ['awards.yml (planned)'], fields: ['Awards', 'Achievements', 'Images and credentials', 'Display order'] },
      { id: 'announcements', title: 'Announcements', sources: ['ribbon.yml'], fields: ['Ribbon messages', 'Icons', 'Caption markup', 'Message order'], requiredFields: ['message'], entryFields: entryFields.announcements },
    ],
  },
  {
    id: 'projects-publications', title: 'Projects & Publications', publicPath: '/projects-publications', icon: LibraryBig,
    description: 'Projects, articles, formal publications, and poster records.',
    sections: [
      { id: 'projects', title: 'Projects', sources: ['projects.yml'], fields: ['Research projects', 'Technical projects', 'Minor projects', 'Other projects'], requiredFields: ['title'], typeOptions: projectTypes, entryFields: entryFields.projects },
      { id: 'articles', title: 'Articles', sources: ['publications.yml'], fields: ['Journal articles', 'General articles and blog posts', 'Authors and links'], requiredFields: ['title'], typeOptions: articleTypes, entryFields: entryFields.articles },
      { id: 'publications', title: 'Publications', sources: ['publications.yml'], fields: ['Research publications', 'Authors and venues', 'DOI and credentials'], requiredFields: ['title'] },
      { id: 'posters', title: 'Posters', sources: ['publications.yml'], fields: ['Poster title', 'Event and date', 'Poster image and link'], requiredFields: ['title'] },
    ],
  },
  {
    id: 'teaching', title: 'Teaching', publicPath: '/teachings', icon: GraduationCap,
    description: 'Courses taught, mentored projects, and other teaching contributions.',
    sections: [
      { id: 'courses', title: 'Courses Taught', sources: ['teaching.yml'], fields: ['Course and institution', 'Term and registration', 'Description and links'], requiredFields: ['title'] },
      { id: 'projects', title: 'Projects Mentored', sources: ['teaching.yml'], fields: ['Semester groups', 'Projects and students', 'Descriptions and project links'], requiredFields: ['title'], entryFields: entryFields.mentoredProjects },
      { id: 'others', title: 'Other Teaching', sources: ['teaching.yml'], fields: ['Activity title', 'Affiliation and date', 'Description and credential'], requiredFields: ['title'], entryFields: entryFields.otherTeaching },
    ],
  },
  {
    id: 'ongoing-projects', title: 'Ongoing Projects', publicPath: '/ongoing-projects', icon: FolderKanban,
    description: 'Current personal, academic, and collaborative work.',
    sections: [{ id: 'projects', title: 'Current Projects', sources: ['ongoing_projects.yml'], fields: ['Title and status', 'Description', 'Collaborators', 'Repository and website links'], requiredFields: ['title'] }],
  },
  {
    id: 'affiliations', title: 'Affiliations, Collaborators & Memberships', publicPath: '/affiliation-memberships', icon: Network,
    description: 'Professional affiliations, collaborators, and society memberships.',
    sections: [
      { id: 'affiliations', title: 'Affiliations', sources: ['affiliations.yml'], fields: ['Organisation and role', 'Dates', 'Description and logo', 'Website'], requiredFields: ['organization'] },
      { id: 'collaborators', title: 'Collaborators', sources: ['affiliations.yml'], fields: ['Person and affiliation', 'Collaboration period', 'Profile and image'], requiredFields: ['name'] },
      { id: 'memberships', title: 'Memberships', sources: ['affiliations.yml'], fields: ['Society', 'Membership type and ID', 'Dates and credential'], requiredFields: ['organization'], entryFields: entryFields.memberships },
    ],
  },
  {
    id: 'internships-certifications', title: 'Internships & Certifications', publicPath: '/internships-certifications', icon: BadgeCheck,
    description: 'Training internships and professional certification records.',
    sections: [
      { id: 'internships', title: 'Training Internships', sources: ['internships.yml'], fields: ['Role and organisation', 'Dates and location', 'Description and credential', 'Links and logos'], requiredFields: ['role'], entryFields: entryFields.internships },
      { id: 'certifications', title: 'Certifications', sources: ['certifications.yml'], fields: ['Credential and issuer', 'Date and credential ID', 'Verification link and logo'], requiredFields: ['title'], entryFields: entryFields.certifications },
    ],
  },
  {
    id: 'workshops', title: 'Conferences, Workshops & Bootcamps', publicPath: '/workshops-bootcamps-attended', icon: Presentation,
    description: 'Conferences, FDPs, workshops, bootcamps, and other learning engagements.',
    sections: [
      { id: 'conferences', title: 'Conferences', sources: ['workshops.yml'], fields: ['Conference title', 'Institution and date', 'Mode, location, and credential'], requiredFields: ['title'], entryFields: entryFields.conferences },
      { id: 'fdps', title: 'FDPs', sources: ['workshops.yml'], fields: ['Programme title', 'Institution and duration', 'Credential'], requiredFields: ['title'], entryFields: entryFields.fdps },
      { id: 'workshops', title: 'Workshops', sources: ['workshops.yml'], fields: ['Workshop title', 'Institution and date', 'Mode and credential'], requiredFields: ['title'], entryFields: entryFields.workshops },
      { id: 'bootcamps', title: 'Bootcamps', sources: ['workshops.yml'], fields: ['Bootcamp title', 'Curriculum', 'Grade and credential'], requiredFields: ['title'], entryFields: entryFields.bootcamps },
      { id: 'other', title: 'Other Learning', sources: ['workshops.yml'], fields: ['Engagement title', 'Type and year', 'Institution and credential'], requiredFields: ['title'], entryFields: entryFields.otherLearning },
    ],
  },
  {
    id: 'cocurricular', title: 'Volunteering & Co-curricular', publicPath: '/cocurricular', icon: HandHeart,
    description: 'Leadership, organisations, volunteering, and related activities.',
    sections: [
      { id: 'leadership', title: 'Leadership & Organizations', sources: ['cocurricular.yml'], fields: ['Role and organisation', 'Dates', 'Description and website'], requiredFields: ['role'], entryFields: entryFields.leadership },
      { id: 'volunteering', title: 'Volunteering', sources: ['cocurricular.yml'], fields: ['Role and organisation', 'Dates', 'Description and credential'], requiredFields: ['role', 'organization'], entryFields: entryFields.volunteering },
    ],
  },
  {
    id: 'professional-activity', title: 'Professional Activity', publicPath: '/professional-activity', icon: BriefcaseBusiness,
    description: 'Invited talks and hosted or convened events.',
    sections: [
      { id: 'invited-talks', title: 'Invited Talks', sources: ['professional_activity.yml'], fields: ['Talk title', 'Host and date', 'Location, links, and credential'], requiredFields: ['title'] },
      { id: 'hosted-events', title: 'Hosted Events', sources: ['professional_activity.yml'], fields: ['Event title and role', 'Dates and location', 'Other hosted events', 'Links and credential'], requiredFields: ['title'], entryFields: entryFields.hostedEvents },
    ],
  },
  {
    id: 'gallery', title: 'Career Unlocks', publicPath: '/gallery', icon: GalleryHorizontalEnd,
    description: 'Visual timeline of milestones, events, and professional moments.',
    sections: [{ id: 'career-unlocks', title: 'Gallery Entries', sources: ['gallery.yml', 'galleryTags.yml'], fields: ['Title, date, type, and featured state', 'Captions and smart links', 'Tags, event, and location', 'Images and external link'], requiredFields: ['title'], entryFields: entryFields.galleryItems }],
  },
  {
    id: 'resources', title: 'Resources', publicPath: '/resources', icon: BookOpenCheck,
    description: 'Study materials, external links, and curated recommendations.',
    sections: [
      { id: 'study-material', title: 'Study Material', sources: ['resources.yml'], fields: ['Subjects', 'Materials and descriptions', 'Files and external links'], requiredFields: ['title'], entryFields: entryFields.studyMaterial },
      { id: 'worth-exploring', title: 'Worth Exploring', sources: ['resources.yml'], fields: ['Groups and labels', 'Recommended links', 'People and logos'], requiredFields: ['group'], entryFields: entryFields.worthExploring },
    ],
  },
  {
    id: 'contact', title: 'Contact', publicPath: '/contact', icon: Contact,
    description: 'Public contact details and social destinations.',
    sections: [{ id: 'details', title: 'Contact Details', sources: ['profile.yml'], fields: ['Email addresses', 'Phone and location', 'Social and profile URLs', 'Blog URL'], requiredFields: ['gmail'] }],
  },
  {
    id: 'facts', title: 'Did You Know?', publicPath: '/facts', icon: Lightbulb,
    description: 'Short facts and explanatory details about the portfolio.',
    sections: [{ id: 'facts', title: 'Facts', sources: ['facts.yml'], fields: ['Fact title', 'Description', 'MDI icon', 'Display order'], requiredFields: ['title'], entryFields: entryFields.facts }],
  },
]

// The blog app keeps its own content collections. Each blog page is its own
// entry here, as portfolio pages are, so the navigation mirrors the site.
export const blogPages: PortfolioPage[] = [
  {
    id: 'recommended', title: 'Worth Your Time', publicPath: '/recommended', icon: Sparkles, site: 'blog', basePath: '/blog/pages',
    description: 'Articles and talks worth someone else\u2019s time.',
    sections: [{ id: 'items', title: 'Recommendations', sources: ['recommended/data.yml'], fields: ['Title and author', 'Source and year', 'Link and note'], requiredFields: ['title', 'url'], entryFields: entryFields.blogRecommended }],
  },
  {
    id: 'readings', title: 'What I Read', publicPath: '/readings', icon: BookMarked, site: 'blog', basePath: '/blog/pages',
    description: 'Books and long reads with covers and notes.',
    sections: [{ id: 'items', title: 'Readings', sources: ['readings/data.yml'], fields: ['Title and author', 'Genre and description', 'Cover image and link'], requiredFields: ['title'], entryFields: entryFields.blogReadings }],
  },
  {
    id: 'movies', title: 'Worth Binge-watching', publicPath: '/movies', icon: Clapperboard, site: 'blog', basePath: '/blog/pages',
    description: 'Films and series with directors, genres and posters.',
    sections: [{ id: 'items', title: 'Watchlist', sources: ['movies/data.yml'], fields: ['Title and director', 'Genre and year', 'Poster image and link'], requiredFields: ['title'], entryFields: entryFields.blogMovies }],
  },
  {
    id: 'travel', title: 'TravelBook', publicPath: '/travel', icon: MapPinned, site: 'blog', basePath: '/blog/pages',
    description: 'States visited, why, and the cities within them.',
    sections: [{ id: 'states', title: 'States', sources: ['travel/data.yml'], fields: ['State and purpose', 'Cities and visits'], requiredFields: ['state'], entryFields: entryFields.blogTravel }],
  },
  {
    id: 'hobbies', title: 'Hobby Lobby', publicPath: '/hobbies', icon: Palette, site: 'blog', basePath: '/blog/pages',
    description: 'Hobby tiles and the icons that represent them.',
    sections: [{ id: 'tiles', title: 'Tiles', sources: ['hobbies/data.yml'], fields: ['Tile label', 'MDI icon'], requiredFields: ['label'], entryFields: entryFields.blogHobbies }],
  },
]

export const contentPages = [...portfolioPages, ...blogPages]

export function portfolioAdminPath(page: PortfolioPage, section: PortfolioSection = page.sections[0]) {
  return `${page.basePath ?? '/portfolio/pages'}/${page.id}/${section.id}`
}

export function findPortfolioPage(pageId?: string) {
  return contentPages.find(page => page.id === pageId)
}
