// `npm run deploy` runs this first, because `wrangler deploy` uploads whatever is
// checked out. The admin site only deploys from one branch, so anything else,
// including a detached HEAD or a failed git call, is refused.
import { execFileSync } from 'node:child_process'

const DEPLOY_BRANCH = 'V1'

let branch = ''
try {
  branch = execFileSync('git', ['branch', '--show-current'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  }).trim()
} catch {
  // Left empty, which fails the check below.
}

if (branch !== DEPLOY_BRANCH) {
  const current = branch ? `branch "${branch}"` : 'a detached or unknown checkout'
  console.error(`Refusing to deploy the admin site from ${current}: it only deploys from ${DEPLOY_BRANCH}.`)
  process.exit(1)
}
