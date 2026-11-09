// Usage: node scripts/require-deploy-branch.mjs <branch>
//
// Deploy scripts run this first, because `wrangler deploy` uploads whatever is
// checked out. Each site deploys from one branch only, so anything else,
// including a detached HEAD or a failed git call, is refused. Cloudflare's builds
// name their branch in WORKERS_CI_BRANCH, which is trusted over the checkout.
import { execFileSync } from 'node:child_process'
import process from 'node:process'

const required = process.argv[2]
if (!required) {
  console.error('Usage: node scripts/require-deploy-branch.mjs <branch>')
  process.exit(1)
}

function currentBranch() {
  if (process.env.WORKERS_CI_BRANCH) return process.env.WORKERS_CI_BRANCH
  try {
    return execFileSync('git', ['branch', '--show-current'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
  } catch {
    return ''
  }
}

const branch = currentBranch()
if (branch !== required) {
  const current = branch ? `branch "${branch}"` : 'a detached or unknown checkout'
  console.error(`Refusing to deploy from ${current}: this site only deploys from ${required}.`)
  process.exit(1)
}
