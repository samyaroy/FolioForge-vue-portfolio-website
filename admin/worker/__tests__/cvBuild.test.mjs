import assert from 'node:assert/strict'
import { test } from 'node:test'
import { loadCvContent } from '../../scripts/cvContent.mjs'
import { canonicalJson, inputHash } from '../../src/cv/hash.ts'
import { UnsupportedCharacterError, escapeText, hrefTarget } from '../../src/cv/latex/escape.ts'
import { markupToLatex, periodToLatex } from '../../src/cv/latex/markup.ts'
import { renderTex } from '../../src/cv/render.ts'
import { applyApplication, linkLabel, resolvePreset } from '../../src/cv/resolve.ts'
import { buildInputSchema } from '../../src/cv/schema.ts'

const content = await loadCvContent()

function build(id, edit = preset => preset) {
  const preset = edit(structuredClone(content.presets.find(entry => entry.id === id)))
  const input = resolvePreset(preset, content.context)
  return { input, tex: renderTex(input) }
}

test('every LaTeX special character is escaped, so authored text never becomes a command', () => {
  assert.equal(escapeText('100% & #1 $5 a_b {x} ~ ^ \\input'), '100\\% \\& \\#1 \\$5 a\\_b \\{x\\} \\textasciitilde{} \\textasciicircum{} \\textbackslash{}input')
  assert.equal(escapeText('18–25, Kolkata’s, R², “q”…'), "18--25, Kolkata's, R\\textsuperscript{2}, ``q''\\ldots{}")
  assert.equal(escapeText('Café Müller'), 'Café Müller')
  assert.throws(() => escapeText('naïve 😀'), UnsupportedCharacterError)
  assert.throws(() => escapeText('শ'), /U\+09B6/)
})

test('only https and mailto become links, with what hyperref needs escaped', () => {
  assert.equal(hrefTarget('https://scholar.google.com/citations?user=x&hl=en'), 'https://scholar.google.com/citations?user=x\\&hl=en')
  assert.equal(hrefTarget('https://github.com/a/MLP_P-t1_2026'), 'https://github.com/a/MLP\\_P-t1\\_2026')
  assert.equal(hrefTarget('https://example.com/a b#c'), 'https://example.com/a\\%20b\\#c')
  assert.equal(hrefTarget('mailto:someone@example.com'), 'mailto:someone@example.com')
  for (const unsafe of ['javascript:alert(1)', 'http://example.com', 'file:///etc/passwd', 'not a url']) {
    assert.equal(hrefTarget(unsafe), undefined, unsafe)
  }
})

test('site markup becomes LaTeX, read by the site\'s own parsers', () => {
  assert.equal(markupToLatex('Built **FastAPI** and *fast* __APIs__ ***both***'), 'Built \\textbf{FastAPI} and \\textit{fast} \\underline{APIs} \\textbf{\\textit{both}}')
  assert.equal(markupToLatex('at `IIT Madras`'), 'at \\textbf{IIT Madras}')
  assert.equal(markupToLatex('[Upatto](https://ideas-tih.org/x) and [bad](javascript:void)'), '\\href{https://ideas-tih.org/x}{Upatto} and bad')
  assert.equal(markupToLatex('Mentored 13 interns @see[See the projects](/teachings?tab=projects)'), 'Mentored 13 interns')
  assert.equal(markupToLatex('Met [[Prof. X|Person]]<br>later'), 'Met Prof. X later')
  assert.equal(periodToLatex('Oct 2025 - Aug 2026'), 'Oct 2025 -- Aug 2026')
})

test('a link is labelled by what it points at', () => {
  assert.equal(linkLabel('https://github.com/22f2001443/MessyMashup-dl-genai-peoject'), 'Repo: MessyMashup-dl-genai-peoject')
  assert.equal(linkLabel('https://doi.org/10.13140/RG.2.2.16657.13926'), 'DOI: 10.13140/RG.2.2.16657.13926')
  assert.equal(linkLabel('https://www.example.com/x'), 'example.com')
})

test('the committed CV content parses and validates against the portfolio', () => {
  assert.deepEqual(content.issues, [])
  assert.deepEqual(content.presets.map(preset => preset.id), ['consolidated', 'academic', 'corporate-da', 'corporate-fs', 'corporate-ml', 'research-ml', 'research-stats'])
})

test('every preset resolves to a build input the Worker would accept unchanged', () => {
  for (const preset of content.presets) {
    const input = resolvePreset(preset, content.context)
    assert.deepEqual(buildInputSchema.parse(input), input, preset.id)
  }
})

test('facts come from the portfolio, so the CV and the site cannot disagree', () => {
  const { input, tex } = build('consolidated')
  const experience = input.sections.find(section => section.kind === 'experience').items[0]
  assert.equal(experience.title, 'Institute of Data Engineering, Analytics and Science Foundation - Technology Innovation Hub, Indian Statistical Institute')
  assert.equal(experience.period, 'Oct 2025 - Aug 2026')
  const mashup = input.sections.find(section => section.kind === 'projects').items[0]
  assert.deepEqual([mashup.title, mashup.subtitle], ['Messy Mashup', 'Robust Music Genre Classification under Noisy Mashup Conditions'])
  // The repository that exists, not the 404 four of the old files linked.
  assert.equal(mashup.link.url, 'https://github.com/22f2001443/MessyMashup-dl-genai-peoject')
  // The facts the owner settled on 2026-10-04.
  assert.match(tex, /forecast accuracy by 30\\%/)
  assert.match(tex, /API calls by 60\\%/)
  assert.match(tex, /Mentored 13 interns/)
  assert.doesNotMatch(tex, /40\\%|70\\%|15 interns/)
})

test('a preset prints the wording it prefers, and text where a row has none', () => {
  const summary = name => build(name).input.sections.find(section => section.kind === 'summary').text
  assert.match(summary('consolidated'), /^Statistics postgraduate student/)
  assert.match(summary('academic'), /^M\.Sc\. Statistics student/)
  assert.match(summary('research-stats'), /^Statistics graduate with experience in statistical modelling/)
  const languages = name => build(name).input.sections.find(section => section.kind === 'skills').rows.find(row => row.label === 'Languages').text
  assert.equal(languages('corporate-ml'), 'Python, R, JavaScript, C++')
  assert.equal(languages('corporate-da'), 'Python, R, JavaScript, TypeScript')
})

test('compact projects use their short forms; full ones split "Name: what it is"', () => {
  const projects = build('consolidated').input.sections.find(section => section.kind === 'projects').items
  const quizPilot = projects.find(item => item.key.endsWith('#quiz-pilot'))
  assert.deepEqual([quizPilot.style, quizPilot.title, quizPilot.context], ['compact', 'Quiz Pilot', 'Diploma Proj., BS in DS and App., `IIT Madras`'])
  assert.equal(quizPilot.subtitle, undefined)
  const wine = projects.find(item => item.key.endsWith('#wine-quality'))
  assert.equal(wine.title, 'Predicting Wine Quality')
})

test('two roles at one employer share its heading', () => {
  const { tex } = build('academic')
  assert.equal((tex.match(/\\cvHeading\{Institute of Data Engineering/g) ?? []).length, 1)
  assert.match(tex, /\\cvSubHeading\{Student Intern\}\{Feb 2025 -- Oct 2025\}/)
})

test('rendering is deterministic and the hash ignores where content came from', async () => {
  const first = build('research-stats')
  const second = build('research-stats')
  assert.equal(first.tex, second.tex)
  const moved = { ...first.input, source: { v1Sha: 'f'.repeat(40), pending: true } }
  assert.equal(await inputHash(moved), await inputHash(first.input))
  const reordered = JSON.parse(canonicalJson(first.input))
  assert.equal(await inputHash(reordered), await inputHash(first.input))
  const edited = build('research-stats', preset => ({ ...preset, prefer: [] }))
  assert.notEqual(await inputHash(edited.input), await inputHash(first.input))
})

test('authored LaTeX is printed, never run', () => {
  const library = structuredClone(content.context.library)
  library.summaries[0].text = 'Ran \\input{/etc/passwd} & $x$ at 100%'
  const input = resolvePreset(content.presets[0], { ...content.context, library })
  assert.match(renderTex(input), /\\cvSummary\{Ran \\textbackslash\{\}input\\\{\/etc\/passwd\\\} \\& \\\$x\\\$ at 100\\%\}/)
})

test('template options reach the document, with defaults for any left out', () => {
  assert.match(build('consolidated').tex, /\\newcommand\{\\cvBulletSize\}\{\\footnotesize\}\n\\newcommand\{\\cvBodySize\}\{\\small\}/)
  assert.match(build('academic').tex, /\\newcommand\{\\cvBulletSize\}\{\\small\}\n\\newcommand\{\\cvBodySize\}\{\\normalsize\}/)
})

test('an application build lays its patch over the base preset', () => {
  const base = content.presets.find(preset => preset.id === 'academic')
  const application = {
    id: '01J9XYZ0000000000000000000', base: 'academic', organization: 'IISER Kolkata', purpose: 'Research internship',
    patch: { variants: { languages: 'ml' } }, createdAt: '2026-10-04T00:42:13+05:30',
  }
  const patched = applyApplication(base, application)
  assert.deepEqual(patched.variants, { languages: 'ml' })
  assert.equal(patched.template_options, base.template_options)
  const input = resolvePreset(base, content.context, application)
  assert.deepEqual(input.application, { organization: 'IISER Kolkata', purpose: 'Research internship' })
  assert.equal(input.sections.find(section => section.kind === 'skills').rows[0].text, 'Python, R, JavaScript, C++')
})
