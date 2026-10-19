import assert from 'node:assert/strict'
import { test } from 'node:test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { writeSeoOutput } from './seo-build.ts'

function fixture(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'folioforge-seo-'))
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }))
  fs.writeFileSync(path.join(dir, 'index.html'), '<html><head></head><body></body></html>')
  return dir
}

const pages = [
  { path: '/', title: 'Home', description: 'Portfolio' },
  { path: '/credentials-dashboard', title: 'Credentials', description: 'Beta dashboard' },
  { path: '/excluded', title: 'Excluded', description: 'Excluded', noindex: true },
]

test('beta sitemap uses its origin and includes beta routes while HTML stays noindex', t => {
  const dir = fixture(t)
  writeSeoOutput(dir, {
    siteName: 'Portfolio', siteUrl: 'https://beta.example.com', pages,
    noindex: true, sitemap: true, sitemapOnNoindex: true,
    notFound: { path: '/404', title: 'Not found', description: 'Not found', noindex: true },
  })
  const xml = fs.readFileSync(path.join(dir, 'sitemap.xml'), 'utf8')
  assert.match(xml, /<loc>https:\/\/beta\.example\.com\/<\/loc>/)
  assert.match(xml, /<loc>https:\/\/beta\.example\.com\/credentials-dashboard<\/loc>/)
  assert.doesNotMatch(xml, /excluded|404/)
  for (const file of ['index.html', 'credentials-dashboard.html', '404.html']) {
    assert.match(fs.readFileSync(path.join(dir, file), 'utf8'), /name="robots" content="noindex, follow"/)
  }
  assert.match(fs.readFileSync(path.join(dir, 'robots.txt'), 'utf8'), /Sitemap: https:\/\/beta\.example\.com\/sitemap\.xml/)
})

test('other noindex deployments still omit sitemaps without explicit opt-in', t => {
  const dir = fixture(t)
  fs.writeFileSync(path.join(dir, 'sitemap.xml'), 'stale sitemap')
  writeSeoOutput(dir, { siteName: 'Preview', siteUrl: 'https://preview.example.com', pages, noindex: true, sitemap: true })
  assert.equal(fs.existsSync(path.join(dir, 'sitemap.xml')), false)
  assert.doesNotMatch(fs.readFileSync(path.join(dir, 'robots.txt'), 'utf8'), /Sitemap:/)
})

test('production sitemap excludes per-page noindex entries', t => {
  const dir = fixture(t)
  writeSeoOutput(dir, { siteName: 'Portfolio', siteUrl: 'https://example.com', pages: [pages[0], pages[2]], sitemap: true })
  const xml = fs.readFileSync(path.join(dir, 'sitemap.xml'), 'utf8')
  assert.match(xml, /<loc>https:\/\/example\.com\/<\/loc>/)
  assert.doesNotMatch(xml, /excluded|beta\./)
  assert.doesNotMatch(fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), /name="robots" content="noindex/)
})
