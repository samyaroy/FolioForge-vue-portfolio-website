import { readFileSync, writeFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import process from 'node:process'

const outputDir = './src/bones'
const defaultTargetUrls = [
  'http://127.0.0.1:5173/#/',
  'http://127.0.0.1:5173/#/gallery',
]
const targetUrls = process.argv.length > 2
  ? process.argv.slice(2)
  : process.env.BONEYARD_URLS
    ? process.env.BONEYARD_URLS.split(',').map(url => url.trim()).filter(Boolean)
    : defaultTargetUrls
const cliPath = './node_modules/boneyard-js/bin/cli.js'
const registryPath = `${outputDir}/registry.js`

const cliResult = spawnSync(process.execPath, [cliPath, 'build', ...targetUrls, '--out', outputDir], {
  stdio: 'inherit',
  env: process.env,
})

if (cliResult.status !== 0) {
  process.exit(cliResult.status || 1)
}

const registrySource = readFileSync(registryPath, 'utf8')

const patchedRegistrySource = registrySource
  .replace(/^"use client"\s*\n/, '')
  .replace("from 'boneyard-js/react'", "from 'boneyard-js/vue'")

if (patchedRegistrySource === registrySource) {
  throw new Error('Expected to patch a React-based boneyard registry, but the generated file did not match.')
}

writeFileSync(registryPath, patchedRegistrySource)

process.stdout.write('Patched src/bones/registry.js for the Vue adapter.\n')
