# Research collaboration: where it goes

For a remote, informal research collaboration with an outside lab (e.g. FACTS-H Lab, IIIT Kottayam, under Dr. Ebin Deni Raj). I'm not in their formal internship programme and have no affiliation there; my affiliation stays University of Calcutta. Everything on the site should say "collaboration", never "affiliation" or "internship".

## Add
- Ongoing Projects — `ongoing_projects.yml` (while the work runs)
- Collaborators tab — `affiliations.yml` → `collaborators`
- Research Projects — `projects.yml` → `research_projects` (move here from Ongoing when it ends)
- Experience timeline + completion letter — `experience.yml` (needs `Research` type in `src/config/experienceTypes.ts`)
- Publications — `publications.yml` → `publications` (once accepted; a preprint only if labelled)
- Posters (if presented) — `publications.yml` → `posters`
- CV — `src/content/cv/presets.yml`
- Names for links — `src/metadata/hyperlinkMetadata.yml`

## Logos
- Research Project card — `logo: [ IIITK, FACTSH ]`, until the work becomes a publication. The affiliation line ("Remote research collaboration") keeps it accurate.
- Publication card — once published, the entry moves here and leaves Research Projects. The existing `logo:` (left side) stays the venue's (journal or conference).
- Publication card, new feature — `collaborator_logo: [ IIITK, FACTSH ]`, drawn small in the bottom-right corner, for the collaborating lab and institute. Needs adding to `src/views/ProjectsPublications/components/PublicationsTab.vue` and the admin editor.
- Ongoing Projects, Experience timeline — no logo slot.
- Collaborators card — shows a photo, not a logo (`src/metadata/people/dr-ebin-deni-raj.png`, optional).
- Setup — upload `IIITK.png` and `FACTSH.png` to the logo store, and list them in `src/metadata/logoMetadata.yml`.

## Don't add
- Affiliations tab — `affiliations.yml` → `affiliations` (not my affiliation)
- Internships page — `internships.yml` (not their formal programme)
- Footer logos — `src/components/Footer/index.vue` (only places I studied or worked)
- Recommendation letter — nowhere (confidential; share privately on request)
