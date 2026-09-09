import assert from 'node:assert/strict'
import { test } from 'node:test'
import { runInNewContext } from 'node:vm'
import { build } from 'esbuild'

const cases = [
  ['main localhost', 'localhost', 'main', '', 'stable'],
  ['main loopback', '127.0.0.1', 'main', '', 'stable'],
  ['main IPv6', '[::1]', 'main', '', 'stable'],
  ['V1 localhost', 'localhost', 'V1', '', 'beta'],
  ['main preview', 'preview.example.com', 'main', '', 'stable'],
  ['V1 preview', 'preview.example.com', 'V1', '', 'beta'],
  ['stable host', 'samyabrata.codeium.xyz', 'V1', '', 'stable'],
  ['beta host', 'beta.samyabrata.codeium.xyz', 'main', '', 'beta'],
  ['explicit beta', 'localhost', 'main', 'beta', 'beta'],
  ['explicit stable', 'localhost', 'V1', 'stable', 'stable'],
  ['invalid override', 'localhost', 'main', 'invalid', 'stable'],
  ['unknown preview', 'preview.example.com', '', '', null],
]

for (const [name, host, branch, declared, expected] of cases) {
  test(name, async () => {
    const { outputFiles } = await build({
      entryPoints: ['src/config/siteEnvironment.ts'],
      bundle: true,
      write: false,
      format: 'cjs',
      define: {
        'import.meta.env': JSON.stringify({
          VITE_SITE_ENV: declared,
          VITE_SITE_BRANCH: branch,
          VITE_ENABLE_BETA_ROUTES: branch === 'V1' && declared !== 'stable',
        }),
      },
      plugins: [{
        name: 'site-content-fixtures',
        setup(builder) {
          builder.onResolve({ filter: /^@\// }, ({ path }) => ({ path, namespace: 'fixture' }))
          builder.onLoad({ filter: /.*/, namespace: 'fixture' }, ({ path }) => ({
            contents: path.includes('profile_info')
              ? 'export default { profile: { betaVersionUrl: "https://beta.samyabrata.codeium.xyz" } }'
              : 'export const SITE_URL = "https://samyabrata.codeium.xyz"',
          }))
        },
      }],
    })
    const context = { module: { exports: {} }, window: { location: { hostname: host } }, URL }
    runInNewContext(outputFiles[0].text, context)
    const { isBetaSite, isStableSite, areBetaRoutesEnabled } = context.module.exports
    assert.equal(isBetaSite(), expected === 'beta')
    assert.equal(isStableSite(), expected === 'stable')
    assert.equal(areBetaRoutesEnabled(), branch === 'V1' && expected === 'beta')
  })
}
