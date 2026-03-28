#!/usr/bin/env node
// bundle-size.mjs — Snapshot bundle sizes after each build
// Usage: node scripts/bundle-size.mjs [--label "my feature"]
//
// Reads dist/ after `npm run build` and appends a snapshot to bundle-sizes.log.
// No build config changes needed.

import { readdirSync, statSync, readFileSync, appendFileSync, existsSync } from 'fs'
import { join } from 'path'
import { createGzip } from 'zlib'
import { pipeline } from 'stream/promises'
import { Readable } from 'stream'
import { createWriteStream } from 'fs'
import os from 'os'

const DIST = 'dist'
const LOG = 'bundle-sizes.log'

async function gzipSize(filePath) {
  const content = readFileSync(filePath)
  const tmpPath = join(os.tmpdir(), `_bundle_size_tmp_${Date.now()}`)
  await pipeline(Readable.from(content), createGzip(), createWriteStream(tmpPath))
  const size = statSync(tmpPath).size
  return size
}

function raw(filePath) {
  return statSync(filePath).size
}

function fmt(bytes) {
  return (bytes / 1024).toFixed(2) + ' KB'
}

const labelArg = process.argv.indexOf('--label')
const label = labelArg !== -1 ? process.argv[labelArg + 1] : ''
const date = new Date().toISOString().slice(0, 16).replace('T', ' ')
const header = `\n--- ${date}${label ? ' | ' + label : ''} ---`

if (!existsSync(DIST)) {
  console.error('dist/ not found — run `npm run build` first')
  process.exit(1)
}

// Collect all JS files
const entry = readdirSync(DIST).filter(f => f.endsWith('.js')).map(f => join(DIST, f))
const chunks = readdirSync(join(DIST, 'chunks')).filter(f => f.endsWith('.js')).map(f => join(DIST, 'chunks', f))
const allJs = [...entry, ...chunks]

// Categorize by mode based on chunk name patterns
const CONFIGURATOR_PATTERNS = ['bootstrap-configurator', 'Model-', 'ModelContent-', 'rtr-test', 'caretaker-', 'originator-', 'load-state-']
const WIZARD_PATTERNS = ['bootstrap-wizard', 'WizardStep']

function categorize(name) {
  if (CONFIGURATOR_PATTERNS.some(p => name.includes(p))) return 'configurator'
  if (WIZARD_PATTERNS.some(p => name.includes(p))) return 'wizard'
  return 'shared'
}

const rows = []
for (const file of allJs) {
  const name = file.split('/').pop()
  const rawBytes = raw(file)
  const gzBytes = await gzipSize(file)
  const category = categorize(name)
  rows.push({ name, raw: rawBytes, gz: gzBytes, category })
}

rows.sort((a, b) => b.raw - a.raw)

let output = header + '\n'
output += `${'CHUNK'.padEnd(55)} ${'CATEGORY'.padEnd(14)} ${'RAW'.padStart(10)} ${'GZIP'.padStart(10)}\n`
output += '-'.repeat(93) + '\n'

let totals = { shared: { raw: 0, gz: 0 }, configurator: { raw: 0, gz: 0 }, wizard: { raw: 0, gz: 0 } }

for (const r of rows) {
  output += `${r.name.padEnd(55)} ${r.category.padEnd(14)} ${fmt(r.raw).padStart(10)} ${fmt(r.gz).padStart(10)}\n`
  totals[r.category].raw += r.raw
  totals[r.category].gz += r.gz
}

output += '-'.repeat(93) + '\n'
const cfgTotal = totals.shared.raw + totals.configurator.raw
const cfgTotalGz = totals.shared.gz + totals.configurator.gz
const wzTotal = totals.shared.raw + totals.wizard.raw
const wzTotalGz = totals.shared.gz + totals.wizard.gz

output += `CONFIGURATOR total (shared + configurator)${' '.repeat(13)} ${fmt(cfgTotal).padStart(10)} ${fmt(cfgTotalGz).padStart(10)}\n`
output += `WIZARD total       (shared + wizard)       ${' '.repeat(13)} ${fmt(wzTotal).padStart(10)} ${fmt(wzTotalGz).padStart(10)}\n`

console.log(output)
appendFileSync(LOG, output)
console.log(`Appended to ${LOG}`)
