export type VisibilityFlag = { path: string; label: string }

/**
 * Whether a section's visibility is something you can actually change. Most are;
 * a handful are always on, and for those the pane has nothing to offer, so the
 * editor gives the space back to the entry list rather than showing an empty
 * panel that says so.
 */
export function hasSectionVisibility(pageId: string, sectionId: string): boolean {
  return Boolean(sectionVisibility[`${pageId}/${sectionId}`]?.length)
}

export const sectionVisibility: Record<string, VisibilityFlag[]> = {
  'home/profile': [{ path: 'showHome.showHeroSection', label: 'Profile & Hero' }],
  'home/research-interests': [{ path: 'showHome.showResearchInterests', label: 'Research Interests' }],
  'home/experience': [{ path: 'showHome.showExperience', label: 'Experience' }],
  'home/education': [
    { path: 'showHome.showEducation.main', label: 'Education' },
    { path: 'showHome.showEducation.showCourseDetailsInfo', label: 'Course details' },
  ],
  'home/awards': [
    { path: 'showHome.showAwards', label: 'Awards' },
    { path: 'showHome.showAchivement', label: 'Achievements' },
  ],
  'home/announcements': [{ path: 'showHome.showRibbon', label: 'Announcements' }],
  'projects-publications/projects': [
    { path: 'showProjectsPublications.showProjects.showResearchProjects', label: 'Research projects' },
    { path: 'showProjectsPublications.showProjects.showTechnicalProjects', label: 'Technical projects' },
    { path: 'showProjectsPublications.showProjects.showMinorProjects', label: 'Minor projects' },
    { path: 'showProjectsPublications.showProjects.showOtherProjects', label: 'Other projects' },
  ],
  'projects-publications/articles': [
    { path: 'showProjectsPublications.showArticles.showGeneralArticles', label: 'General articles' },
    { path: 'showProjectsPublications.showArticles.showJournalArticles', label: 'Journal articles' },
  ],
  'projects-publications/publications': [{ path: 'showProjectsPublications.showPublications', label: 'Publications' }],
  'projects-publications/posters': [{ path: 'showProjectsPublications.showPosters', label: 'Posters' }],
  'teaching/courses': [{ path: 'showTeachings.showCoursesTaught', label: 'Courses Taught' }],
  'teaching/projects': [{ path: 'showTeachings.showProjectsMentored', label: 'Projects Mentored' }],
  'teaching/others': [{ path: 'showTeachings.showOtherTeachings', label: 'Other Teaching' }],
  'ongoing-projects/projects': [{ path: 'showOngoingProjects', label: 'Ongoing Projects' }],
  'affiliations/affiliations': [{ path: 'showAffiliations.showAffiliations', label: 'Affiliations' }],
  'affiliations/collaborators': [{ path: 'showAffiliations.showCollaborators', label: 'Collaborators' }],
  'affiliations/memberships': [{ path: 'showAffiliations.showMemberships', label: 'Memberships' }],
  'internships-certifications/internships': [{ path: 'showInternshipCertifications.showInternships', label: 'Internships' }],
  'internships-certifications/certifications': [{ path: 'showInternshipCertifications.showCertifications', label: 'Certifications' }],
  'workshops/conferences': [{ path: 'showWorkshopsAttended.showConferences', label: 'Conferences' }],
  'workshops/fdps': [{ path: 'showWorkshopsAttended.showFDPs', label: 'FDPs' }],
  'workshops/workshops': [
    { path: 'showWorkshopsAttended.showWorkshops.main', label: 'Workshops' },
    { path: 'showWorkshopsAttended.showWorkshops.others', label: 'Additional workshops' },
  ],
  'workshops/bootcamps': [{ path: 'showWorkshopsAttended.showBootcamps', label: 'Bootcamps' }],
  'workshops/other': [{ path: 'showWorkshopsAttended.showOther', label: 'Other Learning' }],
  'cocurricular/leadership': [{ path: 'showCocurricular.showLeadershipOrganizations', label: 'Leadership & Organizations' }],
  'cocurricular/volunteering': [{ path: 'showCocurricular.showVolunteering', label: 'Volunteering' }],
  'professional-activity/invited-talks': [{ path: 'showProfessionalActivity.showInvitedTalks', label: 'Invited Talks' }],
  'professional-activity/hosted-events': [
    { path: 'showProfessionalActivity.showHostedEvents.main', label: 'Hosted events' },
    { path: 'showProfessionalActivity.showHostedEvents.others', label: 'Other hosted events' },
  ],
  // The Contact page has no collection of its own — its values live in
  // profile.yml, edited under Home. What it owns is which tiles it shows.
  'contact/details': [
    { path: 'showContact.showPhone', label: 'Phone' },
    { path: 'showContact.showGmail', label: 'Gmail' },
    { path: 'showContact.showStudentEmail', label: 'Student email' },
    { path: 'showContact.showLinkedIn', label: 'LinkedIn' },
    { path: 'showContact.showGitHub', label: 'GitHub' },
    { path: 'showContact.showStudentGitHub', label: 'Student GitHub' },
    { path: 'showContact.showKaggle', label: 'Kaggle' },
    { path: 'showContact.showGoogleScholar', label: 'Google Scholar' },
    { path: 'showContact.showResearchGate', label: 'ResearchGate' },
    { path: 'showContact.showOrcid', label: 'ORCID iD' },
  ],
  'gallery/career-unlocks': [{ path: 'showGallery', label: 'Career Unlocks' }],
  'resources/study-material': [{ path: 'showResources.main', label: 'Resources page' }],
  'resources/worth-exploring': [{ path: 'showResources.main', label: 'Resources page' }],
  'facts/facts': [{ path: 'showFacts', label: 'Did You Know?' }],
}

export const globalVisibility: VisibilityFlag[] = [
  { path: 'showBlog', label: 'Portfolio blog link' },
  { path: 'showPageQuotePane', label: 'Page quotes' },
  { path: 'showPageDescriptions.enabled', label: 'Page descriptions' },
  { path: 'showResources.showRibbon', label: 'Resources announcements' },
]
