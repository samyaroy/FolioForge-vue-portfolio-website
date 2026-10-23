// A credit request: a student who worked on a project mentored here asks for
// their name to be linked on it. It goes out as an email from the student's
// own account, so the site stores nothing and the request arrives from an
// address that can be checked against the project report.

export type CreditRequest = {
  project: string
  semester: string
  name: string
  /** LinkedIn profile or personal website, already normalised. */
  profileUrl: string
  message: string
}

/** The longest message the dialog accepts, so the compose URL stays well within what browsers open. */
export const CREDIT_MESSAGE_LIMIT = 1000

/**
 * A profile address as typed, made absolute: `linkedin.com/in/x` becomes
 * `https://linkedin.com/in/x`. Anything that is not a web address with a
 * proper host comes back null.
 */
export function normaliseProfileUrl(value: string): string | null {
  const text = value.trim()
  if (!text) return null
  try {
    const url = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(text) ? text : `https://${text}`)
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null
    if (!url.hostname.includes('.') || url.username || url.password) return null
    return url.href
  } catch {
    return null
  }
}

export function creditRequestEmail(request: CreditRequest, mentorName: string): { subject: string; body: string } {
  const greeting = mentorName.trim().split(/\s+/)[0] || 'there'
  const lines = [
    `Hi ${greeting},`,
    '',
    'I worked on a project you mentored and would like to be credited on your portfolio.',
    '',
    `Project: ${request.project}`,
    `Semester: ${request.semester}`,
    `Name: ${request.name}`,
    `LinkedIn / website: ${request.profileUrl}`,
  ]
  const message = request.message.trim()
  if (message) lines.push('', message)
  lines.push('', 'Thanks,', request.name)
  return { subject: `Credit request: ${request.project} (${request.semester})`, body: lines.join('\n') }
}

/** Gmail's compose window with the email filled in, as the hero's "Get In Touch" opens it. */
export function gmailComposeUrl(to: string, subject: string, body: string): string {
  const params = new URLSearchParams({ view: 'cm', fs: '1', to, su: subject, body })
  return `https://mail.google.com/mail/?${params.toString()}`
}

/** The same email for whatever mail app the device uses. */
export function mailtoUrl(to: string, subject: string, body: string): string {
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}
