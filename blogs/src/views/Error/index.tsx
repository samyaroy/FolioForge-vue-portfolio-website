import { Link } from 'react-router-dom'
import { isReloadingForNewBuild } from '@shared/reloadForNewBuild'
import { usePageTitle } from '../../lib/usePageTitle'

// The routes' errorElement (App.tsx): shown when a page throws while rendering
// or one of its lazy chunks fails to load, in place of React Router's built-in
// developer screen. React Router has already logged the error to the console.
export function ErrorPage() {
  usePageTitle('Something went wrong')

  // A tab that outlived a deploy is already reloading onto the new build
  // (main.tsx); stay blank rather than flash this screen first.
  if (isReloadingForNewBuild()) return null

  return (
    <section className="mx-auto max-w-xl py-16 text-center">
      <h1 className="text-4xl font-black tracking-[-0.033em] text-ink">
        Something went wrong
      </h1>
      <p className="mt-4 text-muted">
        This page broke while loading. Reloading usually fixes it.
      </p>
      <div className="mt-6 flex justify-center gap-6">
        <button
          type="button"
          onClick={() => location.reload()}
          className="cursor-pointer font-medium text-primary hover:text-primary-hover"
        >
          Reload the page
        </button>
        <Link to="/">Back to all posts</Link>
      </div>
    </section>
  )
}
