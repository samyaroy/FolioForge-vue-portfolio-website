import assert from 'node:assert/strict'
import { test } from 'node:test'
import { parse } from 'yaml'
import { z } from 'zod'
import { buildInputSchema, parseLibrary, parsePresets } from '../../src/cv/schema.ts'
import { resolveTemplateOptions, resumeV1, templates } from '../../src/cv/templates/index.ts'
import { validateCv } from '../../src/cv/validate.ts'

const library = `
entries:
  - ref: projects-publications/research#messymashup
    tech: Python, Deep Learning, Audio Processing (Librosa), CNN
    context: BS in Data Science and Applications, DLGenAI - Diploma project, \`IIT Madras\`
  - id: ideas-mentor
    title: IDEAS-TIH, Indian Statistical Institute Kolkata
    subtitle: Project Mentor, Spring and Summer (Data Science) Internship Programs
    location: Kolkata, WB
    period: 2026
bullets:
  - id: npcyf-lead
    ref: home/experience#ideas-tih-asd
    kind: lead
    text: Developed core components of **NPCYF** as a part of **FASAL 2.0**
    research: Developed core components of **NPCYF**
  - id: npcyf-models
    ref: home/experience#ideas-tih-asd
    text: Integrated **TabPFN**, **Panel Regression** and **Random Forest**-based forecasting workflows, improving forecast accuracy by 30%
    tags: [statistics, forecasting]
  - id: mentor-interns
    ref: ideas-mentor
    text: Mentored 13 interns across Spring and Summer internship programs
summaries:
  - id: profile
    text: Statistics postgraduate student with a background in data science
    research: M.Sc. Statistics student with experience in applied statistical modelling
    data:
skills:
  - id: languages
    label: Languages
    text: Python, R, JavaScript, TypeScript
    research: Python, R, JavaScript
interests:
  - id: bayesian
    text: Bayesian Inference
`

const presets = `
presets:
  - id: consolidated
    name: Consolidated CV
    filename: SamyabrataRoy_Resume_Consolidated
    template: resume-v1
    pages: 2
    header: [phone, gmail, website, linkedin, github]
    sections:
      - kind: summary
        items: [profile]
      - kind: experience
        items:
          - ref: home/experience#ideas-tih-asd
            bullets: [npcyf-lead, npcyf-models]
      - kind: projects
        title: Selected Projects
        items:
          - projects-publications/research#messymashup
          - ref: projects-publications/technical#quiz-pilot
            style: compact
      - kind: skills
        items: [languages]
      - kind: positions
        items:
          - ref: ideas-mentor
            bullets: [mentor-interns]
      - kind: interests
        items: [bayesian]
  - id: research-stats
    name: Research CV (Statistics)
    filename: SamyabrataRoy_Resume_Research_Stats
    template: resume-v1
    template_options:
      bullet_size: small
    prefer: [research]
    sections:
      - kind: education
      - kind: summary
        items: [profile]
`

const portfolio = new Map([
  ['home/experience', new Set(['ideas-tih-asd'])],
  ['projects-publications/research', new Set(['messymashup'])],
  ['projects-publications/technical', new Set(['quiz-pilot'])],
])

function fixture() {
  const parsedLibrary = parseLibrary(parse(library))
  const parsedPresets = parsePresets(parse(presets))
  assert.ok(parsedLibrary.ok, JSON.stringify(parsedLibrary.issues))
  assert.ok(parsedPresets.ok, JSON.stringify(parsedPresets.issues))
  return { library: parsedLibrary.value, presets: parsedPresets.value, templates, portfolio }
}

function issuesOf(result) {
  assert.equal(result.ok, false, 'expected the parse to fail')
  return result.issues
}

test('zod runs without compiling code, which the admin CSP and Workers both forbid', () => {
  assert.equal(z.config().jitless, true)
})

test('the Consolidated fixture parses and validates cleanly', () => {
  assert.deepEqual(validateCv(fixture()), [])
})

test('flat YAML rows become the model', () => {
  const { library, presets } = fixture()
  const lead = library.bullets.find(bullet => bullet.id === 'npcyf-lead')
  assert.deepEqual(lead, {
    id: 'npcyf-lead', ref: 'home/experience#ideas-tih-asd', kind: 'lead', tags: [],
    text: 'Developed core components of **NPCYF** as a part of **FASAL 2.0**',
    variants: { research: 'Developed core components of **NPCYF**' },
  })
  // A bullet without a kind is an ordinary bullet.
  assert.equal(library.bullets.find(bullet => bullet.id === 'npcyf-models').kind, 'item')
  // YAML reads `period: 2026` as a number; it is text here.
  assert.equal(library.entries.find(entry => entry.id === 'ideas-mentor').period, '2026')
  // A cleared variant (`data:` with nothing after it) is absent, not empty.
  assert.deepEqual(library.summaries[0].variants, { research: 'M.Sc. Statistics student with experience in applied statistical modelling' })

  const [consolidated, research] = presets
  assert.deepEqual(consolidated.sections[2].items, [
    { ref: 'projects-publications/research#messymashup', style: 'full' },
    { ref: 'projects-publications/technical#quiz-pilot', style: 'compact' },
  ])
  assert.deepEqual(consolidated.variants, {})
  assert.deepEqual(consolidated.template_options, {})
  assert.deepEqual(research.header, [])
  assert.deepEqual(research.sections[0], { kind: 'education', items: [] })
})

test('a blank file is an empty library or preset list', () => {
  assert.deepEqual(parseLibrary(null), { ok: true, value: { entries: [], bullets: [], summaries: [], skills: [], interests: [] } })
  assert.deepEqual(parsePresets(''), { ok: true, value: [] })
})

test('every problem in a row is reported, each at its path', () => {
  const issues = issuesOf(parseLibrary({
    bullets: [{ id: 'Bad Id', ref: 'home/experience#x', text: '', Research: 'x' }],
    entries: [{ subtitle: 'no ref, no id' }, { id: 'cv-only' }, { ref: 'nope' }, { ref: 'home/education#msc', link: 'http://insecure.example' }],
  }))
  const at = path => issues.filter(issue => issue.path === path).map(issue => issue.message)
  assert.deepEqual(at('library.yml/bullets/0/id'), ['Use lowercase words joined by hyphens.'])
  assert.deepEqual(at('library.yml/bullets/0/text'), ['Missing.'])
  assert.match(at('library.yml/bullets/0/variants/Research')[0], /not a field here, nor a variant key/)
  assert.match(at('library.yml/entries/0')[0], /Needs a ref to a portfolio entry, or an id/)
  assert.deepEqual(at('library.yml/entries/1/title'), ['An entry only the CV has needs a title.'])
  assert.match(at('library.yml/entries/2/ref')[0], /not a portfolio reference/)
  assert.deepEqual(at('library.yml/entries/3/link'), ['Must be an https:// address.'])
})

test('presets reject unknown fields, kinds and values', () => {
  const issues = issuesOf(parsePresets({
    presets: [{
      id: 'x', name: 'X', filename: 'has space', template: 'resume-v1', pages: 0, colour: 'red',
      header: ['fax'], sections: [{ kind: 'hobbies' }, { kind: 'projects', items: [{ ref: 'a-b', style: 'tiny' }] }],
    }],
  }))
  const messages = issues.map(issue => `${issue.path}: ${issue.message}`)
  assert.ok(messages.some(message => message.startsWith('presets.yml/presets/0: Unrecognized key') && message.includes('colour')), messages.join('\n'))
  assert.ok(messages.includes('presets.yml/presets/0/filename: Use letters, digits, dots, hyphens and underscores.'))
  assert.ok(messages.some(message => message.startsWith('presets.yml/presets/0/pages:')))
  assert.ok(messages.some(message => message.startsWith('presets.yml/presets/0/header/0: A header field is one of')))
  assert.ok(messages.some(message => message.startsWith('presets.yml/presets/0/sections/0/kind: The kind is one of')))
  assert.ok(messages.includes('presets.yml/presets/0/sections/1/items/0/style: Style is "full" or "compact".'))
})

test('validation follows references across files', () => {
  const content = fixture()
  const [consolidated] = content.presets
  const experience = consolidated.sections[1].items[0]
  experience.bullets = ['npcyf-models', 'mentor-interns', 'npcyf-lead', 'missing-bullet']
  consolidated.sections[0].items.push({ ref: 'profile', style: 'full' })
  consolidated.sections.push({ kind: 'education', items: [{ ref: 'home/experience#ideas-tih-asd', style: 'full' }] })
  consolidated.sections[2].items.push({ ref: 'projects-publications/research#gone', style: 'full' })

  const messages = validateCv(content).map(issue => `${issue.path}: ${issue.message}`)
  assert.deepEqual(messages, [
    'presets.yml/presets/consolidated/sections/0: A summary section shows exactly one summary.',
    'presets.yml/presets/consolidated/sections/0/items/1: profile is already in this section.',
    'presets.yml/presets/consolidated/sections/1/items/0/bullets: mentor-interns belongs to ideas-mentor, not home/experience#ideas-tih-asd.',
    'presets.yml/presets/consolidated/sections/1/items/0/bullets: No bullet "missing-bullet".',
    'presets.yml/presets/consolidated/sections/2/items/2: No portfolio entry "projects-publications/research#gone".',
    'presets.yml/presets/consolidated/sections/6/items/0: home/experience entries cannot appear in education sections.',
  ])
})

test('each preset is checked against the template it names', () => {
  const content = fixture()
  const [consolidated, research] = content.presets
  consolidated.template_options = { bullet_size: 'huge', accent: '#ff0000' }
  consolidated.sections[1].items[0].style = 'compact'
  research.template = 'modern-cv'

  const messages = validateCv(content).map(issue => `${issue.path}: ${issue.message}`)
  assert.deepEqual(messages, [
    'presets.yml/presets/consolidated/template_options/bullet_size: One of: footnotesize, small.',
    'presets.yml/presets/consolidated/template_options/accent: The Resume template has no option "accent".',
    'presets.yml/presets/consolidated/sections/1/items/0/style: The Resume template has no compact style for experience.',
    'presets.yml/presets/research-stats/template: No template "modern-cv". Templates: resume-v1.',
  ])
})

test('a variant nobody prefers is reported, as are ids used twice', () => {
  const content = fixture()
  content.library.summaries[0].variants = { ...content.library.summaries[0].variants, reseach: 'typo' }
  content.library.interests.push({ id: 'profile', text: 'Clash', variants: {} })
  content.library.bullets.push({ id: 'second-lead', ref: 'home/experience#ideas-tih-asd', kind: 'lead', text: 'x', tags: [], variants: {} })
  content.presets[0].variants = { 'npcyf-models': 'industry' }

  const messages = validateCv(content).map(issue => `${issue.path}: ${issue.message}`)
  assert.deepEqual(messages, [
    'library.yml/interests/profile: The id "profile" is already used by another row.',
    'library.yml/bullets/second-lead: home/experience#ideas-tih-asd already has a lead.',
    'presets.yml/presets/consolidated/variants/npcyf-models: "npcyf-models" has no industry wording.',
    'library.yml/summaries/profile/reseach: No preset prefers "reseach". Check the spelling, or add it to a preset\'s prefer list.',
  ])
})

test('a template supplies defaults for options a preset leaves out', () => {
  assert.deepEqual(resolveTemplateOptions(resumeV1, {}), { bullet_size: 'footnotesize', body_size: 'small' })
  assert.deepEqual(resolveTemplateOptions(resumeV1, { bullet_size: 'small' }), { bullet_size: 'small', body_size: 'small' })
})

test('a build input parses to exactly what was sent, so its hash is unchanged', () => {
  const input = {
    rendererVersion: 1,
    template: { id: 'resume-v1', version: 1, sha256: 'a'.repeat(64), options: { bullet_size: 'footnotesize' } },
    preset: { id: 'consolidated', name: 'Consolidated CV', filename: 'SamyabrataRoy_Resume_Consolidated', pages: 2 },
    header: { name: 'Samyabrata Roy', fields: [{ key: 'gmail', label: 'samyaroy00@gmail.com', href: 'mailto:samyaroy00@gmail.com' }] },
    sections: [
      { kind: 'summary', title: 'Profile Summary', text: 'Statistics postgraduate student' },
      { kind: 'projects', title: 'Selected Projects', items: [{ key: 'projects-publications/research#messymashup', style: 'full', title: 'MessyMashup', bullets: ['Built CNN classifiers'] }] },
    ],
    source: { v1Sha: '0'.repeat(40), pending: false },
  }
  assert.deepEqual(buildInputSchema.parse(input), input)
  assert.equal(buildInputSchema.safeParse({ ...input, extra: true }).success, false)
  assert.equal(buildInputSchema.safeParse({ ...input, sections: [{ kind: 'summary', title: 'x', items: [] }] }).success, false)
})
