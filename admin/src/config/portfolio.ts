import {
  BadgeCheck,
  BookOpenCheck,
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
  Presentation,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { educationTypeIcons } from '../../../src/config/educationTypes.ts'
import { experienceTypeIcons } from '../../../src/config/experienceTypes.ts'
import { projectTypes } from '../../../src/config/projectTypes.ts'
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
   * Shape of the entry's `cred_link`: 'documents' is a list of labelled files
   * shown as viewer tabs, 'categories' is one link per project link category.
   * Without it the field is edited as plain text.
   */
  credentialStyle?: 'documents' | 'categories'
  /**
   * Entry keys that hold a small object, mapped to the sub-fields to edit them
   * by, in the order the card prints them. The first is the head: the others
   * mean nothing without it. Without this the value is edited as raw JSON.
   */
  objectFields?: Record<string, readonly string[]>
  /**
   * Entry keys holding a list of small objects, mapped to the columns each row
   * is edited by. Same head rule as objectFields: the first column carries the
   * row.
   */
  listFields?: Record<string, readonly string[]>
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
      { id: 'research-interests', title: 'Research Interests', sources: ['research_interests.yml'], fields: ['Interest title', 'Stable key', 'Display order'], requiredFields: ['title'] },
      { id: 'experience', title: 'Experience', sources: ['experience.yml'], fields: ['Role and organisation', 'Dates and location', 'Description and links', 'Logo'], requiredFields: ['job_role', 'company', 'location', 'time_period'], typeOptions: Object.keys(experienceTypeIcons), credentialStyle: 'documents' },
      { id: 'education', title: 'Education', sources: ['education.yml'], fields: ['Institution and programme', 'Dates and grades', 'Coursework and details', 'Links and logos'], requiredFields: ['degree', 'institution', 'location', 'time_period'], typeOptions: Object.keys(educationTypeIcons) },
      { id: 'awards', title: 'Awards & Achievements', sources: ['awards.yml (planned)'], fields: ['Awards', 'Achievements', 'Images and credentials', 'Display order'] },
      { id: 'announcements', title: 'Announcements', sources: ['ribbon.yml'], fields: ['Ribbon messages', 'Icons', 'Caption markup', 'Message order'], requiredFields: ['message'] },
    ],
  },
  {
    id: 'projects-publications', title: 'Projects & Publications', publicPath: '/projects-publications', icon: LibraryBig,
    description: 'Projects, articles, formal publications, and poster records.',
    sections: [
      { id: 'projects', title: 'Projects', sources: ['projects.yml'], fields: ['Research projects', 'Technical projects', 'Minor projects', 'Other projects'], requiredFields: ['title'], typeOptions: projectTypes, credentialStyle: 'categories', objectFields: { guide: ['name', 'title', 'department', 'institution'] } },
      { id: 'articles', title: 'Articles', sources: ['publications.yml'], fields: ['Journal articles', 'General articles and blog posts', 'Authors and links'], requiredFields: ['title'], typeOptions: articleTypes, objectFields: { publication: ['name', 'host'] } },
      { id: 'publications', title: 'Publications', sources: ['publications.yml'], fields: ['Research publications', 'Authors and venues', 'DOI and credentials'], requiredFields: ['title'] },
      { id: 'posters', title: 'Posters', sources: ['publications.yml'], fields: ['Poster title', 'Event and date', 'Poster image and link'], requiredFields: ['title'] },
    ],
  },
  {
    id: 'teaching', title: 'Teaching', publicPath: '/teachings', icon: GraduationCap,
    description: 'Courses taught, mentored projects, and other teaching contributions.',
    sections: [
      { id: 'courses', title: 'Courses Taught', sources: ['teaching.yml'], fields: ['Course and institution', 'Term and registration', 'Description and links'], requiredFields: ['title'] },
      { id: 'projects', title: 'Projects Mentored', sources: ['teaching.yml'], fields: ['Semester groups', 'Projects and students', 'Descriptions and project links'], requiredFields: ['title'], listFields: { students: ['name', 'email', 'Linkedin'] } },
      { id: 'others', title: 'Other Teaching', sources: ['teaching.yml'], fields: ['Activity title', 'Affiliation and date', 'Description and credential'], requiredFields: ['title'] },
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
      { id: 'memberships', title: 'Memberships', sources: ['affiliations.yml'], fields: ['Society', 'Membership type and ID', 'Dates and credential'], requiredFields: ['organization'] },
    ],
  },
  {
    id: 'internships-certifications', title: 'Internships & Certifications', publicPath: '/internships-certifications', icon: BadgeCheck,
    description: 'Training internships and professional certification records.',
    sections: [
      { id: 'internships', title: 'Training Internships', sources: ['internships.yml'], fields: ['Role and organisation', 'Dates and location', 'Description and credential', 'Links and logos'], requiredFields: ['role'] },
      { id: 'certifications', title: 'Certifications', sources: ['certifications.yml'], fields: ['Credential and issuer', 'Date and credential ID', 'Verification link and logo'], requiredFields: ['title'] },
    ],
  },
  {
    id: 'workshops', title: 'Conferences, Workshops & Bootcamps', publicPath: '/workshops-bootcamps-attended', icon: Presentation,
    description: 'Conferences, FDPs, workshops, bootcamps, and other learning engagements.',
    sections: [
      { id: 'conferences', title: 'Conferences', sources: ['workshops.yml'], fields: ['Conference title', 'Institution and date', 'Mode, location, and credential'], requiredFields: ['title'] },
      { id: 'fdps', title: 'FDPs', sources: ['workshops.yml'], fields: ['Programme title', 'Institution and duration', 'Credential'], requiredFields: ['title'] },
      { id: 'workshops', title: 'Workshops', sources: ['workshops.yml'], fields: ['Workshop title', 'Institution and date', 'Mode and credential'], requiredFields: ['title'] },
      { id: 'bootcamps', title: 'Bootcamps', sources: ['workshops.yml'], fields: ['Bootcamp title', 'Curriculum', 'Grade and credential'], requiredFields: ['title'] },
      { id: 'other', title: 'Other Learning', sources: ['workshops.yml'], fields: ['Engagement title', 'Type and year', 'Institution and credential'], requiredFields: ['title'] },
    ],
  },
  {
    id: 'cocurricular', title: 'Volunteering & Co-curricular', publicPath: '/cocurricular', icon: HandHeart,
    description: 'Leadership, organisations, volunteering, and related activities.',
    sections: [
      { id: 'leadership', title: 'Leadership & Organizations', sources: ['cocurricular.yml'], fields: ['Role and organisation', 'Dates', 'Description and website'], requiredFields: ['role'] },
      { id: 'volunteering', title: 'Volunteering', sources: ['cocurricular.yml'], fields: ['Role and organisation', 'Dates', 'Description and credential'], requiredFields: ['role', 'organization'] },
    ],
  },
  {
    id: 'professional-activity', title: 'Professional Activity', publicPath: '/professional-activity', icon: BriefcaseBusiness,
    description: 'Invited talks and hosted or convened events.',
    sections: [
      { id: 'invited-talks', title: 'Invited Talks', sources: ['professional_activity.yml'], fields: ['Talk title', 'Host and date', 'Location, links, and credential'], requiredFields: ['title'] },
      { id: 'hosted-events', title: 'Hosted Events', sources: ['professional_activity.yml'], fields: ['Event title and role', 'Dates and location', 'Other hosted events', 'Links and credential'], requiredFields: ['title'] },
    ],
  },
  {
    id: 'gallery', title: 'Career Unlocks', publicPath: '/gallery', icon: GalleryHorizontalEnd,
    description: 'Visual timeline of milestones, events, and professional moments.',
    sections: [{ id: 'career-unlocks', title: 'Gallery Entries', sources: ['gallery.yml', 'galleryTags.yml'], fields: ['Title, date, type, and featured state', 'Captions and smart links', 'Tags, event, and location', 'Images and external link'], requiredFields: ['title'] }],
  },
  {
    id: 'resources', title: 'Resources', publicPath: '/resources', icon: BookOpenCheck,
    description: 'Study materials, external links, and curated recommendations.',
    sections: [
      { id: 'study-material', title: 'Study Material', sources: ['resources.yml'], fields: ['Subjects', 'Materials and descriptions', 'Files and external links'], requiredFields: ['title'] },
      { id: 'worth-exploring', title: 'Worth Exploring', sources: ['resources.yml'], fields: ['Groups and labels', 'Recommended links', 'People and logos'], requiredFields: ['group'] },
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
    sections: [{ id: 'facts', title: 'Facts', sources: ['facts.yml'], fields: ['Fact title', 'Description', 'MDI icon', 'Display order'], requiredFields: ['title'] }],
  },
]

// The blog app keeps its own content collections; they are edited here the
// same way, under the Blog section of the navigation.
export const blogPages: PortfolioPage[] = [
  {
    id: 'blog', title: 'Blog Collections', publicPath: '/', icon: BookOpenCheck, site: 'blog', basePath: '/blog/pages',
    description: 'Reading, watching and travel collections behind the blog site.',
    sections: [
      { id: 'recommended', title: 'Worth Your Time', sources: ['recommended/data.yml'], fields: ['Title and author', 'Source and year', 'Link and note'], requiredFields: ['title', 'url'] },
      { id: 'readings', title: 'What I Read', sources: ['readings/data.yml'], fields: ['Title and author', 'Genre and description', 'Cover image and link'], requiredFields: ['title'] },
      { id: 'movies', title: 'Worth Binge-watching', sources: ['movies/data.yml'], fields: ['Title and director', 'Genre and year', 'Poster image and link'], requiredFields: ['title'] },
      { id: 'travel', title: 'TravelBook', sources: ['travel/data.yml'], fields: ['State and purpose', 'Cities and visits'], requiredFields: ['state'] },
      { id: 'hobbies', title: 'Hobby Lobby', sources: ['hobbies/data.yml'], fields: ['Tile label', 'MDI icon'], requiredFields: ['label'] },
    ],
  },
]

export const contentPages = [...portfolioPages, ...blogPages]

export function portfolioAdminPath(page: PortfolioPage, section: PortfolioSection = page.sections[0]) {
  return `${page.basePath ?? '/portfolio/pages'}/${page.id}/${section.id}`
}

export function findPortfolioPage(pageId?: string) {
  return contentPages.find(page => page.id === pageId)
}
