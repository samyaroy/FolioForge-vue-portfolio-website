import assert from 'node:assert/strict'
import { test } from 'node:test'
import { parseLog } from '../../src/cv/compile/parseLog.ts'

// Excerpts of real pdfTeX logs (TeX Live 2024), from the Consolidated CV with
// one fault added to each. Kept line for line, wrapping included.
const log = (...lines) => lines.join('\n')

const CLEAN = log(
  '',
  "LaTeX Font Warning: Font shape `OT1/cmr/bx/sc' undefined",
  "(Font)              using `OT1/cmr/bx/n' instead on input line 142.",
  '',
  "LaTeX Font Info:    External font `cmex10' loaded for size",
  '2024/texmf-dist/fonts/type1/public/amsfonts/cm/cmti10.pfb></usr/local/texlive/2',
  '024/texmf-dist/fonts/type1/public/amsfonts/cm/cmti9.pfb></usr/local/texlive/202',
  '4/texmf-dist/fonts/type1/public/cm-super/sfrm1000.pfb>',
  'Output written on main.pdf (2 pages, 218612 bytes).',
)

const UNDEFINED = log(
  '(Font)              <6> on input line 154.',
  '',
  '! Undefined control sequence.',
  'l.161 \\resumeFooBar',
  '                   ',
  'The control sequence at the end of the top line',
  "of your error message was never \\def'ed. If you have",
  "misspelled it (e.g., `\\hobx'), type `I' and the correct",
  "spelling (e.g., `I\\hbox'). Otherwise just continue,",
  "and I'll forget about whatever was undefined.",
  '',
  '',
  "Package rerunfilecheck Warning: File `main.out' has changed.",
  '(rerunfilecheck)                Rerun to get outlines right',
  "(rerunfilecheck)                or use package `bookmark'.",
  '',
  'Output written on main.pdf (2 pages, 218134 bytes).',
)

const MISSING = log(
  ')',
  '',
  "! LaTeX Error: File `nosuchpackage.sty' not found.",
  '',
  'Type X to quit or <RETURN> to proceed,',
  'or enter new name. (Default extension: sty)',
  '',
  'Enter file name: ',
  '! Emergency stop.',
  '<read *> ',
  '         ',
  'l.141 \\begin',
  '            {document}^^M',
  '*** (cannot \\read from terminal in nonstop modes)',
  '',
  ' 75i,0n,79p,251b,103s stack positions out of 10000i,1000n,20000p,200000b,200000s',
  '!  ==> Fatal error occurred, no output PDF file produced!',
)

const WARNINGS = log(
  '',
  "LaTeX Warning: Reference `nolabel' on page 1 undefined on input line 163.",
  '',
  'Overfull \\hbox (162.60915pt too wide) in paragraph at lines 161--161',
  '[]  ',
  ' []',
  '',
  'LaTeX Warning: There were undefined references.',
  '',
)

test('a clean build reports its pages and keeps font substitutions as warnings', () => {
  const parsed = parseLog(CLEAN)
  assert.deepEqual(parsed.errors, [])
  assert.equal(parsed.pages, 2)
  assert.equal(parsed.bytes, 218612)
  assert.equal(parsed.rerun, false)
  assert.deepEqual(parsed.warnings, [
    { message: "Font shape `OT1/cmr/bx/sc' undefined using `OT1/cmr/bx/n' instead on input line 142.", line: 142 },
  ])
})

test('an error carries the line TeX was reading, even though a PDF was written', () => {
  const parsed = parseLog(UNDEFINED)
  assert.deepEqual(parsed.errors, [{ message: 'Undefined control sequence.', line: 161, context: '\\resumeFooBar' }])
  assert.equal(parsed.pages, 2)
})

test('a package warning gathers its continuation lines and asks for another pass', () => {
  const parsed = parseLog(UNDEFINED)
  assert.deepEqual(parsed.warnings, [
    { message: "File `main.out' has changed. Rerun to get outlines right or use package `bookmark'.", line: null },
  ])
  assert.equal(parsed.rerun, true)
})

test('a missing file is one error, at the line that stopped the run, and there is no PDF', () => {
  const parsed = parseLog(MISSING)
  assert.deepEqual(parsed.errors, [{ message: "LaTeX Error: File `nosuchpackage.sty' not found.", line: 141, context: '\\begin' }])
  assert.equal(parsed.pages, null)
})

test('LaTeX warnings and boxes are kept apart, each with its line', () => {
  const parsed = parseLog(WARNINGS)
  assert.deepEqual(parsed.warnings, [
    { message: "Reference `nolabel' on page 1 undefined on input line 163.", line: 163 },
    { message: 'There were undefined references.', line: null },
  ])
  assert.deepEqual(parsed.boxes, [
    { message: 'Overfull \\hbox (162.60915pt too wide) in paragraph at lines 161--161', line: 161 },
  ])
})

test('lines pdfTeX broke at 79 characters are read as one', () => {
  const full = `Output written on ${'/very/long/output/path/'.repeat(4)}main.pdf (3 pages, 123456 bytes).`
  const wrapped = log(full.slice(0, 79), full.slice(79))
  assert.equal(parseLog(wrapped).pages, 3)
  assert.equal(parseLog('No pages of output.').pages, 0)
})
