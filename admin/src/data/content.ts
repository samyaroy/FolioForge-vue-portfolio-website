export const posts = [
  {
    title: 'Hello, world',
    description: 'First post on the new blog - what it runs on and why.',
    file: '2026-06-18-hello-world.md',
    date: '18 Jun 2026',
    status: 'Published',
  },
  {
    title: 'Markdown features',
    description: 'Tables, task lists, code blocks, and other GFM niceties.',
    file: '2026-06-10-markdown-features.md',
    date: '10 Jun 2026',
    status: 'Published',
  },
] as const

export const careerUnlocks = [
  { id: 'new_role-101', title: 'New Transition, New Journey', date: '15 Aug 2026', type: 'LinkedIn', featured: true },
  { id: 'intern-project-02', title: 'Mentored 9 amazing Summer Interns at IDEAS-TIH', date: '05 Aug 2026', type: 'Gallery', featured: false },
  { id: 'workshop-07', title: 'Took the first conventional step towards Theoretical Computer Science', date: '27 Jun 2026', type: 'Gallery', featured: false },
  { id: 'guest_event-10', title: 'Hosted Stats based Technical Event at Paradox 2026, IIT Madras', date: '12 Jun 2026', type: 'LinkedIn', featured: true },
] as const

export const blogPages = [
  { title: 'Site identity', source: 'site.yml', description: 'Footer, profile, social links, and shared site metadata.' },
  { title: 'Navigation', source: 'navigation.yml', description: 'Header destinations and labels.' },
  { title: 'Page descriptions', source: 'descriptions.yml', description: 'Subtitle copy shown on each blog section.' },
  { title: 'Section copy', source: 'sections.yml', description: 'Headings, labels, empty states, and reusable text.' },
] as const
