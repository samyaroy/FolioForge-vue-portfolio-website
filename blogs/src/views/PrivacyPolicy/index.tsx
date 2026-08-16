import { PRIVACY_SECTION } from '../../content/sections'
import { PAGE_DESCRIPTIONS } from '../../content/descriptions'
import { SITE_PROFILE } from '../../content/site'
import { usePageTitle } from '../../lib/usePageTitle'

const POLICY_SECTIONS = [
  {
    title: 'Information you provide',
    body: (
      <p>
        This blog does not provide user accounts, comments, newsletter signup,
        or contact forms. Information is only received when you choose to
        contact the author by email or through a linked external service.
      </p>
    ),
  },
  {
    title: 'Hosting and visit data',
    body: (
      <p>
        The blog is hosted on{' '}
        <a
          href="https://www.cloudflare.com/policies/privacy/"
          target="_blank"
          rel="noreferrer"
        >
          Cloudflare
        </a>
        . Hosting infrastructure may process standard request data such as IP
        address, browser type, requested page, referring page, and request time
        to deliver and protect the site. The footer also loads Flag Counter, a
        third-party visit counter that may receive request and device
        information when its image is displayed.
      </p>
    ),
  },
  {
    title: 'Local storage and travel maps',
    body: (
      <p>
        Travel-map features cache geocoding and route results in your browser&apos;s
        local storage to reduce repeated network requests. This cache stays on
        your device and can be removed through your browser&apos;s site-data
        controls. Map views may request data from geocoding, map-data, and
        routing providers, which receive the technical information needed to
        answer those requests.
      </p>
    ),
  },
  {
    title: 'Remote content and external services',
    body: (
      <p>
        Pages may load{' '}
        <a
          href="https://developers.google.com/fonts/faq/privacy"
          target="_blank"
          rel="noreferrer"
        >
          Google Fonts
        </a>
        , book covers, photographs, maps, or other media from third-party
        hosts. Links and share actions can take you to social networks, video
        platforms, reference sites, and other services. Those providers operate
        under their own privacy policies and may collect data independently of
        this blog.
      </p>
    ),
  },
  {
    title: 'Cookies and advertising',
    body: (
      <p>
        The blog does not intentionally set advertising cookies or create
        behavioural advertising profiles. Third-party resources opened or
        loaded from this blog may use their own storage or tracking technologies
        according to their policies and your browser settings.
      </p>
    ),
  },
] as const

export function PrivacyPolicyPage() {
  usePageTitle(PRIVACY_SECTION.title)

  return (
    <article className="mx-auto w-full max-w-6xl pb-8">
      <header className="mb-8 border-b border-border pb-8 text-center">
        <h1 className="text-4xl leading-tight font-black text-ink">
          {PRIVACY_SECTION.title}
        </h1>
        <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-muted">
          {PAGE_DESCRIPTIONS.privacy}
        </p>
        <p className="mt-3 text-sm text-faint">
          {PRIVACY_SECTION.lastUpdatedLabel}: {PRIVACY_SECTION.lastUpdated}
        </p>
      </header>

      <div className="grid grid-cols-1 border-t border-border lg:grid-cols-2">
        {POLICY_SECTIONS.map((section, index) => (
          <section
            key={section.title}
            className={`border-b border-border py-6 lg:py-8 ${
              index % 2 === 0 ? 'lg:border-r lg:pr-8' : 'lg:pl-8'
            }`}
          >
            <h2 className="mb-2 text-lg leading-7 font-bold text-ink">
              {section.title}
            </h2>
            <div className="text-justify text-base leading-7 text-muted">
              {section.body}
            </div>
          </section>
        ))}

        <section className="border-b border-border py-6 lg:py-8 lg:pl-8">
          <h2 className="mb-2 text-lg leading-7 font-bold text-ink">Contact</h2>
          <p className="text-justify text-base leading-7 text-muted">
            For privacy questions, corrections, or removal requests, email{' '}
            <a className="font-semibold" href={`mailto:${SITE_PROFILE.email}`}>
              {SITE_PROFILE.email}
            </a>
            .
          </p>
        </section>
      </div>
    </article>
  )
}
