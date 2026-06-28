// const GITHUB_REPO =
//   'https://github.com/samyaroy/FolioForge-vue-portfolio-website/tree/V1_template'
const MAIN_SITE = 'https://samyabrata.codeium.xyz'

const profile = {
  name: 'Samyabrata Roy',
}

export function Footer() {
  return (
    <>
      <hr className="footer-divider" />
      <footer className="site-footer">
        <div className="footer-container">
          <a className="site-footer__name" href={MAIN_SITE}>
            <span>{profile.name}</span>
            <span className="mdi mdi-open-in-new" aria-hidden="true" />
          </a>

          <div className="site-footer__topline">
            <a href={`${MAIN_SITE}/#/privacy-policy`}>Privacy Policy</a>
          </div>

          <div className="site-footer__meta">
            <div>
              {/* <p>
                Source code available at{' '}
                <a href={GITHUB_REPO} target="_blank" rel="noreferrer">
                  GitHub Repo
                </a>
                <br />
                Please fork/clone from there - not directly from the site's source
              </p> */}
              <p>
                ⓘ Some icons used are made by{' '}
                <a href="https://www.flaticon.com/authors/freepik" target="_blank" rel="noreferrer">
                  Freepik
                </a>{' '}
                &amp;{' '}
                <a href="https://www.flaticon.com/authors/smashicons" target="_blank" rel="noreferrer">
                  Smashicons
                </a>{' '}
                from{' '}
                <a href="https://www.flaticon.com/free-icons/class" target="_blank" rel="noreferrer">
                  Flaticon
                </a>
              </p>
            </div>
            <div className="site-footer__right-meta">
              <p>© {new Date().getFullYear()} {profile.name}. Rights Reserved</p>
              <p>✶ Last updated: June 2026</p>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
