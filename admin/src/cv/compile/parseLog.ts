/**
 * A pdfTeX log, read into what the build console shows. Line numbers are the
 * `.tex` line TeX was reading, so an error can be jumped to in the source.
 *
 * Any error fails the build, even though pdfTeX in nonstop mode recovers and
 * writes a PDF anyway; recovered errors are how the defects in the old CVs went
 * unseen (cv_architecture.md §7.3, §18).
 */
export type LogEntry = { message: string; line: number | null; context?: string }

export type CompileLog = {
  errors: LogEntry[]
  /** LaTeX, package, class, font and pdfTeX warnings. */
  warnings: LogEntry[]
  /** Overfull and underfull boxes, kept apart because they are about layout. */
  boxes: LogEntry[]
  /** From "Output written on …"; 0 for "No pages of output", null when the run never got that far. */
  pages: number | null
  bytes: number | null
  /** The log asks for another pass, as hyperref does when the outlines changed. */
  rerun: boolean
}

// pdfTeX breaks log lines at max_print_line, 79 characters, so a line of
// exactly that length continues on the next one.
const MAX_PRINT_LINE = 79

function unwrap(log: string): string[] {
  const lines: string[] = []
  let carry = ''
  for (const line of log.split(/\r?\n/)) {
    if (line.length === MAX_PRINT_LINE) {
      carry += line
      continue
    }
    lines.push(carry + line)
    carry = ''
  }
  if (carry) lines.push(carry)
  return lines
}

const ERROR = /^! (.+)$/
const ERROR_LINE = /^l\.(\d+) ?(.*)$/
const WARNING = /^((?:LaTeX|Package (\S+)|Class (\S+))(?: Font)? Warning|pdfTeX warning(?: \([^)]*\))?): (.*)$/
const INPUT_LINE = /on input line (\d+)/
const BOX = /^((?:Over|Under)full \\[hv]box \([^)]*\)) (?:in paragraph at lines (\d+)--\d+|in alignment at lines (\d+)--\d+|detected at line (\d+)|has occurred while \\output is active)/
const OUTPUT = /^Output written on .*\((\d+) pages?, (\d+) bytes\)\./
const RERUN = /Rerun to get|Label\(s\) may have changed/

export function parseLog(log: string): CompileLog {
  const lines = unwrap(log)
  const result: CompileLog = { errors: [], warnings: [], boxes: [], pages: null, bytes: null, rerun: RERUN.test(lines.join(' ')) }

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index]

    const error = line.match(ERROR)
    // "!  ==> Fatal error occurred" only repeats that the run stopped.
    if (error && !line.startsWith('!  ==>')) {
      let at: RegExpMatchArray | null = null
      for (let next = index + 1; next < lines.length && next <= index + 12 && !ERROR.test(lines[next]); next++) {
        at = lines[next].match(ERROR_LINE)
        if (at) break
      }
      const entry: LogEntry = { message: error[1].trim(), line: at ? Number(at[1]) : null }
      if (at?.[2].trim()) entry.context = at[2].trim()
      // A missing file is reported first and only then stops the run; the stop
      // is the same problem, so it lends its line to the report instead.
      const previous = result.errors.at(-1)
      if (entry.message === 'Emergency stop.' && previous && previous.line === null) {
        previous.line = entry.line
        if (entry.context) previous.context = entry.context
      } else {
        result.errors.push(entry)
      }
      continue
    }

    const warning = line.match(WARNING)
    if (warning) {
      const owner = warning[2] ?? warning[3] ?? (warning[1].includes('Font') ? 'Font' : null)
      let message = warning[4].trim()
      // Package and font warnings continue on lines prefixed "(owner)"; a
      // LaTeX warning runs on until the blank line that ends it.
      const prefix = owner && `(${owner})`
      for (let next = index + 1; next < lines.length && lines[next].trim() !== ''; next++) {
        if (prefix && !lines[next].startsWith(prefix)) break
        message += ` ${lines[next].slice(prefix ? prefix.length : 0).trim()}`
        index = next
      }
      const input = message.match(INPUT_LINE)
      result.warnings.push({ message, line: input ? Number(input[1]) : null })
      continue
    }

    const box = line.match(BOX)
    if (box) {
      const at = box[2] ?? box[3] ?? box[4]
      result.boxes.push({ message: line.trim(), line: at ? Number(at) : null })
      continue
    }

    const output = line.match(OUTPUT)
    if (output) {
      result.pages = Number(output[1])
      result.bytes = Number(output[2])
    } else if (line.startsWith('No pages of output.')) {
      result.pages = 0
    }
  }

  return result
}
