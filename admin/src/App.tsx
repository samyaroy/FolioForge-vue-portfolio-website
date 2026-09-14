import { ArrowUpRight, BookOpen, Images, PanelsTopLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const sites = [
  {
    id: 'blog',
    label: 'Blog',
    url: 'https://blogs.samyabrata.codeium.xyz',
    collections: [
      { name: 'Posts', icon: BookOpen },
      { name: 'Gallery', icon: Images },
      { name: 'Pages', icon: PanelsTopLeft },
    ],
  },
  {
    id: 'portfolio',
    label: 'Portfolio',
    url: 'https://samyabrata.codeium.xyz',
    collections: [{ name: 'Career Unlocks', icon: Images }],
  },
]

export default function App() {
  return (
    <div className="min-h-svh">
      <header className="sticky top-0 z-50 border-b border-header-border bg-background">
        <div className="flex min-h-16 items-center justify-between gap-4 px-4 py-4 sm:px-6 md:px-10">
          <a href="/" className="flex min-w-0 items-center gap-2 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring sm:gap-4">
            <img src="/profile-icon.png" alt="" width="16" height="16" className="size-4 shrink-0 rounded-full object-cover" />
            <span className="truncate text-base font-bold leading-tight sm:text-lg">Samyabrata Roy</span>
          </a>
          <span className="text-sm font-semibold text-primary-700">Admin</span>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-8 sm:py-12">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <h1 className="text-2xl font-bold leading-tight">Content</h1>
          <span className="text-xs text-muted-foreground">Local workspace</span>
        </div>
        <Tabs defaultValue="blog">
          <TabsList aria-label="Website" variant="line" className="w-full justify-start gap-6 border-b p-0">
            {sites.map(site => (
              <TabsTrigger
                key={site.id}
                value={site.id}
                className="h-10 flex-none rounded-none px-0 pb-3 data-[state=active]:text-primary-700 after:bg-primary group-data-[orientation=horizontal]/tabs:after:bottom-0"
              >
                {site.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {sites.map(site => (
            <TabsContent key={site.id} value={site.id} className="mt-6 sm:mt-8">
              <div className="mb-5 flex items-center justify-between gap-4">
                <h2 className="text-lg font-semibold">{site.label}</h2>
                <Button variant="ghost" size="sm" className="text-primary-700 hover:text-primary-700" asChild>
                  <a href={site.url} target="_blank" rel="noopener noreferrer">
                    View site <ArrowUpRight aria-hidden="true" />
                  </a>
                </Button>
              </div>
              <ul className="divide-y border-y bg-background">
                {site.collections.map(({ name, icon: Icon }) => (
                  <li key={name} className="flex min-h-20 items-center justify-between gap-4 px-4 py-4 sm:px-5">
                    <span className="flex items-center gap-3 text-sm font-medium">
                      <Icon className="size-4 text-primary" aria-hidden="true" />
                      {name}
                    </span>
                    <span className="text-right text-xs text-muted-foreground">Not connected</span>
                  </li>
                ))}
              </ul>
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  )
}
