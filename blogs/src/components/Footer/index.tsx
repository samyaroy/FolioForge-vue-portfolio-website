import { MAIN_SITE_URL } from '../../content/navigation'
import { FOOTER_CONTENT, SITE_PROFILE } from '../../content/site'

const META_TEXT_CLASS = 'text-sm leading-5 text-[#6b7280]'
// Matches the root site's global anchor style (font-weight 500, #646cff,
// no underline, #535bf2 on hover) used by its attribution lines.
const META_LINK_CLASS =
  'font-medium text-[#646cff] transition-colors duration-200 hover:text-[#535bf2]'

// Row arrangement mirrors the root site's footer bottom section:
// © + privacy on one row, attributions + last-updated on the next.
export function Footer() {
  return (
    <>
      <hr className="mx-auto mb-2 block h-0.75 w-full rounded-[5px] border-0 bg-[#f8fafc]" />
      {/* px-4 replicates v-footer's built-in 16px inset on the root site. */}
      <footer className="border-t border-[#cbd5e1] bg-[#f1f5f9] px-4 py-4 text-sm leading-normal text-black">
        <div className="mx-auto w-full px-1 sm:max-w-160 md:max-w-3xl md:px-2 lg:max-w-5xl xl:max-w-7xl 2xl:max-w-384">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-start">
            <div>
              <a
                className="mb-2 inline-flex items-center gap-[0.3rem] text-xl leading-7 font-bold text-black transition-colors duration-200 hover:text-black"
                href={MAIN_SITE_URL}
              >
                <span>{SITE_PROFILE.name}</span>
                <span
                  className="mdi mdi-open-in-new text-sm leading-none"
                  aria-hidden="true"
                />
              </a>
              <p className={META_TEXT_CLASS}>
                {FOOTER_CONTENT.iconAttributionIntro}{' '}
                <a
                  className={META_LINK_CLASS}
                  href={FOOTER_CONTENT.iconAttributionLinks[0].href}
                  target="_blank"
                  rel="noreferrer"
                >
                  {FOOTER_CONTENT.iconAttributionLinks[0].label}
                </a>{' '}
                &amp;{' '}
                <a
                  className={META_LINK_CLASS}
                  href={FOOTER_CONTENT.iconAttributionLinks[1].href}
                  target="_blank"
                  rel="noreferrer"
                >
                  {FOOTER_CONTENT.iconAttributionLinks[1].label}
                </a>{' '}
                {FOOTER_CONTENT.iconAttributionSource}{' '}
                <a
                  className={META_LINK_CLASS}
                  href={FOOTER_CONTENT.iconAttributionLinks[2].href}
                  target="_blank"
                  rel="noreferrer"
                >
                  {FOOTER_CONTENT.iconAttributionLinks[2].label}
                </a>
              </p>
              <p className={`mt-1 ${META_TEXT_CLASS}`}>
                {FOOTER_CONTENT.designCreditIntro}{' '}
                <a
                  className={META_LINK_CLASS}
                  href={FOOTER_CONTENT.designCreditHref}
                  target="_blank"
                  rel="noreferrer"
                >
                  {FOOTER_CONTENT.designCreditName}
                </a>
                {FOOTER_CONTENT.designCreditOutro}
              </p>
            </div>
            <div className="flex min-w-0 flex-col items-start gap-4 md:flex-row md:items-start">
              <div className="text-right">
                <p className={META_TEXT_CLASS}>
                  © {new Date().getFullYear()}{' '}
                  <span className="font-bold">{SITE_PROFILE.name}</span>.{' '}
                  {FOOTER_CONTENT.rightsText}
                </p>
                <p className={`mt-1 ${META_TEXT_CLASS}`}>
                  ✶ {FOOTER_CONTENT.lastUpdatedLabel}: {FOOTER_CONTENT.lastUpdated}
                </p>
                <p className="mt-1">
                  <a
                    className={`text-sm ${META_LINK_CLASS}`}
                    href={`${MAIN_SITE_URL}${FOOTER_CONTENT.privacyPath}`}
                  >
                    {FOOTER_CONTENT.privacyLabel}
                  </a>
                </p>
              </div>
              <div className="flex min-w-0 justify-end">
                <a
                  href="https://www.flagcounter.me/details/hCW"
                  target="_blank"
                  rel="noreferrer"
                >
                  <img
                    className="inline-block h-auto w-[350px] max-w-full"
                    src="https://www.flagcounter.me/hCW/"
                    alt="Flag Counter"
                  />
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
