import libraryYaml from '../../../src/content/cv/library.yml'
import presetsYaml from '../../../src/content/cv/presets.yml'
import awardsYaml from '../../../src/content/profile_info/awards.yml'
import certificationsYaml from '../../../src/content/profile_info/certifications.yml'
import cocurricularYaml from '../../../src/content/profile_info/cocurricular.yml'
import educationYaml from '../../../src/content/profile_info/education.yml'
import experienceYaml from '../../../src/content/profile_info/experience.yml'
import internshipsYaml from '../../../src/content/profile_info/internships.yml'
import ongoingProjectsYaml from '../../../src/content/profile_info/ongoing_projects.yml'
import profileYaml from '../../../src/content/profile_info/profile.yml'
import projectsYaml from '../../../src/content/profile_info/projects.yml'
import publicationsYaml from '../../../src/content/profile_info/publications.yml'
import teachingYaml from '../../../src/content/profile_info/teaching.yml'
import { collectionEntries } from '@/cv/collections'
import { contentSource } from '../../worker/content/registry.ts'

/**
 * The CV content this build of the admin was made from, read at build time
 * like the rest of the admin's bundled content. The CV pages use it when the
 * Worker cannot read V1, and the CV Library lists it.
 */

const files: Readonly<Record<string, unknown>> = {
  'src/content/cv/library.yml': libraryYaml,
  'src/content/cv/presets.yml': presetsYaml,
  'src/content/profile_info/awards.yml': awardsYaml,
  'src/content/profile_info/certifications.yml': certificationsYaml,
  'src/content/profile_info/cocurricular.yml': cocurricularYaml,
  'src/content/profile_info/education.yml': educationYaml,
  'src/content/profile_info/experience.yml': experienceYaml,
  'src/content/profile_info/internships.yml': internshipsYaml,
  'src/content/profile_info/ongoing_projects.yml': ongoingProjectsYaml,
  'src/content/profile_info/projects.yml': projectsYaml,
  'src/content/profile_info/publications.yml': publicationsYaml,
  'src/content/profile_info/teaching.yml': teachingYaml,
}

/** A collection's entries as bundled, addressed by its registry id. */
export function bundledCollection(collection: string): unknown[] {
  const source = contentSource(collection)
  return source && Object.hasOwn(files, source.path) ? collectionEntries(files[source.path], source.arrayKeys) : []
}

export const bundledProfile: unknown = profileYaml
