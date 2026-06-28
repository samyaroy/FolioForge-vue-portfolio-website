export type ReadingItem = {
  id: string
  title: string
  author: string
  genre: string
  date: string
  description: string
}

export const READINGS: ReadingItem[] = [
  {
    id: 'deep-work',
    title: 'Deep Work',
    author: 'Cal Newport',
    genre: 'Productivity',
    date: '2026-06-20',
    description:
      'Notes on focus, context switching, and protecting long stretches of attention.',
  },
  {
    id: 'design-of-everyday-things',
    title: 'The Design of Everyday Things',
    author: 'Don Norman',
    genre: 'Design',
    date: '2026-06-21',
    description:
      'A reminder that good interfaces make the next action feel visible, natural, and forgiving.',
  },
  {
    id: 'thinking-in-systems',
    title: 'Thinking in Systems',
    author: 'Donella H. Meadows',
    genre: 'Systems',
    date: '2026-06-22',
    description:
      'Notes on feedback loops, delays, leverage points, and why simple causes rarely explain complex outcomes.',
  },
].sort((a, b) => b.date.localeCompare(a.date))
