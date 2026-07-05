import { MAIN_SITE_URL } from '../../content/navigation'
import { FOOTER_CONTENT, SITE_PROFILE } from '../../content/site'

const META_TEXT_CLASS = 'text-sm leading-5 text-[#6b7280]'
const META_LINK_CLASS =
  'font-medium text-[#6b7280] underline transition-colors duration-200 hover:text-[#646cff]'

export function Footer() {
  return (
    <>
      <hr className="mx-auto mb-2 block h-0.75 w-full rounded-[5px] border-0 bg-[#f8fafc]" />
      <footer className="border-t border-[#cbd5e1] bg-[#f1f5f9] py-4 text-sm leading-normal text-black">
        <div className="mx-auto w-full px-1 sm:max-w-160 md:max-w-3xl md:px-2 lg:max-w-5xl xl:max-w-7xl 2xl:max-w-384">
          <a
            className="mb-2 inline-flex items-center gap-[0.3rem] text-xl leading-7 font-medium text-black transition-colors duration-200 hover:text-black"
            href={MAIN_SITE_URL}
          >
            <span>{SITE_PROFILE.name}</span>
            <span
              className="mdi mdi-open-in-new text-[0.95rem] leading-none"
              aria-hidden="true"
            />
          </a>

          <div className="mb-2 flex justify-end">
            <a
              className="font-medium text-[#646cff] transition-colors duration-200 hover:text-[#646cff]"
              href={`${MAIN_SITE_URL}${FOOTER_CONTENT.privacyPath}`}
            >
              {FOOTER_CONTENT.privacyLabel}
            </a>
          </div>

          <div className="flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
            <div>
              <p className={`ml-5 ${META_TEXT_CLASS}`}>
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
              <p className={`mt-1 ml-5 ${META_TEXT_CLASS}`}>
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
            <div className="text-right">
              <p className={META_TEXT_CLASS}>
                © {new Date().getFullYear()} {SITE_PROFILE.name}.{' '}
                {FOOTER_CONTENT.rightsText}
              </p>
              <p className={`mt-1 ${META_TEXT_CLASS}`}>
                ✶ {FOOTER_CONTENT.lastUpdatedLabel}: {FOOTER_CONTENT.lastUpdated}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
