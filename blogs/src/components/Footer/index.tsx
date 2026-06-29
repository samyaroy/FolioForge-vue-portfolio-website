import { MAIN_SITE_URL } from '../../content/navigation'
import { FOOTER_CONTENT, SITE_PROFILE } from '../../content/site'

export function Footer() {
  return (
    <>
      <hr className="footer-divider" />
      <footer className="site-footer">
        <div className="footer-container">
          <a className="site-footer__name" href={MAIN_SITE_URL}>
            <span>{SITE_PROFILE.name}</span>
            <span className="mdi mdi-open-in-new" aria-hidden="true" />
          </a>

          <div className="site-footer__topline">
            <a href={`${MAIN_SITE_URL}${FOOTER_CONTENT.privacyPath}`}>
              {FOOTER_CONTENT.privacyLabel}
            </a>
          </div>

          <div className="site-footer__meta">
            <div>
              <p>
                {FOOTER_CONTENT.iconAttributionIntro}{' '}
                <a
                  href={FOOTER_CONTENT.iconAttributionLinks[0].href}
                  target="_blank"
                  rel="noreferrer"
                >
                  {FOOTER_CONTENT.iconAttributionLinks[0].label}
                </a>{' '}
                &amp;{' '}
                <a
                  href={FOOTER_CONTENT.iconAttributionLinks[1].href}
                  target="_blank"
                  rel="noreferrer"
                >
                  {FOOTER_CONTENT.iconAttributionLinks[1].label}
                </a>{' '}
                {FOOTER_CONTENT.iconAttributionSource}{' '}
                <a
                  href={FOOTER_CONTENT.iconAttributionLinks[2].href}
                  target="_blank"
                  rel="noreferrer"
                >
                  {FOOTER_CONTENT.iconAttributionLinks[2].label}
                </a>
              </p>
              <p>
                {FOOTER_CONTENT.designCreditIntro}{' '}
                <a
                  href={FOOTER_CONTENT.designCreditHref}
                  target="_blank"
                  rel="noreferrer"
                >
                  {FOOTER_CONTENT.designCreditName}
                </a>
                {FOOTER_CONTENT.designCreditOutro}
              </p>
            </div>
            <div className="site-footer__right-meta">
              <p>
                © {new Date().getFullYear()} {SITE_PROFILE.name}.{' '}
                {FOOTER_CONTENT.rightsText}
              </p>
              <p>
                ✶ {FOOTER_CONTENT.lastUpdatedLabel}: {FOOTER_CONTENT.lastUpdated}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
