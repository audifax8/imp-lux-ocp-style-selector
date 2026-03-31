#!/usr/bin/env node
// =============================================================================
// audit.mjs — post-build auditor
// =============================================================================
// Three checks:
//   1. CHUNKS   — critical chunks exist in dist/
//   2. SIZES    — chunks stay under defined thresholds
//   3. BLOCKING — static analysis for main-thread blocking patterns in src/
//
// Usage:
//   npm run audit                  (requires a prior `npm run build`)
//   npm run build && npm run audit
//
// Exit codes:
//   0 — all checks passed (warnings allowed)
//   1 — one or more FAIL conditions found
// =============================================================================

import { existsSync, readdirSync, statSync, readFileSync } from 'fs'
import { join, resolve } from 'path'
import { createGzip } from 'zlib'
import { pipeline } from 'stream/promises'
import { Readable } from 'stream'
import { createWriteStream } from 'fs'
import os from 'os'

// ─── Colours ─────────────────────────────────────────────────────────────────
const C = {
  reset:  '\x1b[0m',
  bold:   '\x1b[1m',
  red:    '\x1b[31m',
  yellow: '\x1b[33m',
  green:  '\x1b[32m',
  cyan:   '\x1b[36m',
  gray:   '\x1b[90m',
}
const ok   = (msg) => console.log(`  ${C.green}✔${C.reset}  ${msg}`)
const warn = (msg) => console.log(`  ${C.yellow}⚠${C.reset}  ${C.yellow}${msg}${C.reset}`)
const fail = (msg) => console.log(`  ${C.red}✖${C.reset}  ${C.red}${msg}${C.reset}`)
const info = (msg) => console.log(`  ${C.gray}   ${msg}${C.reset}`)
const head = (msg) => console.log(`\n${C.bold}${C.cyan}${msg}${C.reset}`)

// ─── Helpers ─────────────────────────────────────────────────────────────────
async function gzipSize(filePath) {
  const content = readFileSync(filePath)
  const tmp = join(os.tmpdir(), `_audit_gz_${Date.now()}`)
  await pipeline(Readable.from(content), createGzip(), createWriteStream(tmp))
  return statSync(tmp).size
}

function kb(bytes) { return (bytes / 1024).toFixed(1) + ' KB' }

function scanFiles(dir, ext = ['.ts', '.tsx']) {
  const results = []
  if (!existsSync(dir)) return results
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) results.push(...scanFiles(full, ext))
    else if (ext.some(e => entry.name.endsWith(e))) results.push(full)
  }
  return results
}

// ─── Config ──────────────────────────────────────────────────────────────────
const DIST = 'dist'
const SRC  = 'src'

// Critical chunks that MUST exist after every build
const CRITICAL_CHUNKS = [
  'imp-lux-ocp-style-selector.js',         // entry
  'imp-lux-ocp-style-selector.css',        // css bundle
  'chunks/bootstrap-configurator.js',
  'chunks/bootstrap-wizard.js',
  'chunks/bootstrap-index.js',
  'chunks/configurator-init.js',
]

// Size thresholds per chunk  [warn KB, fail KB]
// Tune these as the project grows to prevent silent bloat.
const SIZE_THRESHOLDS = {
  'imp-lux-ocp-style-selector.js':  { warnKB: 10,  failKB: 20  },
  'bootstrap-configurator.js':      { warnKB: 35,  failKB: 70  },
  'bootstrap-wizard.js':            { warnKB: 35,  failKB: 70  },
  'bootstrap-index.js':             { warnKB: 35,  failKB: 70  },
  'configurator-init.js':           { warnKB: 15,  failKB: 30  },
}

// Static analysis: patterns known to block the main thread or silently swallow errors.
// Each rule: { name, pattern, files (glob pattern under src/), severity, hint }
const BLOCKING_PATTERNS = [
  {
    name: 'Hanging promise — missing reject',
    // new Promise((resolve) =>  or  new Promise((resolve,  but no reject param
    // Matches: new Promise((resolve) or new Promise<T>((resolve)
    // Does NOT match: new Promise((resolve, reject)
    pattern: /new Promise[^(]*\(\s*\(\s*resolve\s*\)/,
    severity: 'fail',
    hint: 'A Promise with only `resolve` has no error path. Rejections are silently swallowed and the Promise hangs. Add `reject` or use `schedule()`.',
    dirs: ['configurator/model/strategy', 'configurator/bootstrap/state'],
  },
  {
    name: 'try/catch around a Promise (async error not caught)',
    // try { ... import( or .then( — classic mistake: try/catch won't catch rejected promises
    pattern: /try\s*\{[^}]{0,120}(import\s*\(|\.then\s*\()/,
    severity: 'warn',
    hint: '`try/catch` does not catch rejected Promises. Use `.catch()` or `await` inside the try block.',
    dirs: ['configurator/model/strategy'],
    multiline: true,
  },
  {
    name: 'Direct fetch() on critical path (not wrapped in runIdle/runAnimation)',
    // await fetch( appearing in a strategy file — may block LCP if not deferred
    pattern: /await\s+fetch\s*\(/,
    severity: 'warn',
    hint: 'Direct `await fetch()` in a strategy file may block the LCP critical path. Wrap in `this.runIdle()` unless it IS the critical data.',
    dirs: ['configurator/model/strategy'],
  },
  {
    name: 'Direct Function.name assignment (fails in ESM strict mode)',
    // methodName.name = something — the fluid-product-urls bug
    pattern: /\.\s*name\s*=\s*[a-zA-Z_$]/,
    severity: 'warn',
    hint: 'Direct `.name =` on a function throws in ESM strict mode. Use `Object.defineProperty(..., "name", { value, configurable: true })` instead.',
    dirs: ['src'],
  },
  {
    name: 'Synchronous XMLHttpRequest',
    // .open( with false as third argument = synchronous
    pattern: /\.open\s*\([^)]+,\s*false\s*\)/,
    severity: 'fail',
    hint: 'Synchronous XHR blocks the main thread entirely. Use async fetch() instead.',
    dirs: ['configurator', 'style-selector', 'products-index'],
  },
]

// ─── State ───────────────────────────────────────────────────────────────────
let failures = 0
let warnings = 0

// =============================================================================
// Section 1: Critical chunks presence
// =============================================================================
head('1/3  CRITICAL CHUNKS — presence check')

for (const chunk of CRITICAL_CHUNKS) {
  const path = join(DIST, chunk)
  if (existsSync(path)) {
    ok(chunk)
  } else {
    fail(`MISSING: ${chunk}`)
    failures++
  }
}

// Cross-check modulepreload hrefs in public/index.html vs actual dist/ files
const htmlPath = join('public', 'index.html')
if (existsSync(htmlPath)) {
  const html = readFileSync(htmlPath, 'utf-8')
  const preloads = [...html.matchAll(/modulepreload[^>]+href="([^"]+)"/g)].map(m => m[1])
  for (const href of preloads) {
    const exists = existsSync(join(DIST, href))
    if (!exists) {
      warn(`modulepreload href not found in dist/: ${href}`)
      warnings++
    }
  }
}

// =============================================================================
// Section 2: Size thresholds
// =============================================================================
head('2/3  CHUNK SIZES — threshold check')

const allChunks = [
  ...readdirSync(DIST).filter(f => f.endsWith('.js') || f.endsWith('.css')).map(f => ({ name: f, path: join(DIST, f) })),
  ...(existsSync(join(DIST, 'chunks'))
    ? readdirSync(join(DIST, 'chunks')).filter(f => f.endsWith('.js')).map(f => ({ name: f, path: join(DIST, 'chunks', f) }))
    : [])
]

for (const { name, path } of allChunks) {
  const thresholds = SIZE_THRESHOLDS[name]
  if (!thresholds) continue // only check chunks with explicit thresholds

  const rawKB = statSync(path).size / 1024
  const gzKB = (await gzipSize(path)) / 1024

  if (rawKB >= thresholds.failKB) {
    fail(`${name}: ${kb(statSync(path).size)} raw — exceeds FAIL threshold of ${thresholds.failKB} KB`)
    failures++
  } else if (rawKB >= thresholds.warnKB) {
    warn(`${name}: ${kb(statSync(path).size)} raw — exceeds WARN threshold of ${thresholds.warnKB} KB`)
    warnings++
  } else {
    ok(`${name}: ${rawKB.toFixed(1)} KB raw / ${gzKB.toFixed(1)} KB gz`)
  }
}

// =============================================================================
// Section 3: Static analysis — main-thread blocking patterns
// =============================================================================
head('3/3  BLOCKING PATTERNS — static analysis')

for (const rule of BLOCKING_PATTERNS) {
  const dirsToScan = rule.dirs.map(d => d === 'src' ? SRC : join(SRC, d))
  const files = dirsToScan.flatMap(d => scanFiles(d))

  const hits = []

  for (const file of files) {
    const content = readFileSync(file, 'utf-8')
    const lines = content.split('\n')

    if (rule.multiline) {
      // Check the whole file content as a single string
      if (rule.pattern.test(content)) {
        // Find approximate line number
        const match = content.match(rule.pattern)
        if (match) {
          const lineNum = content.slice(0, match.index).split('\n').length
          hits.push({ file, line: lineNum })
        }
      }
    } else {
      lines.forEach((line, i) => {
        if (rule.pattern.test(line)) {
          hits.push({ file, line: i + 1 })
        }
      })
    }
  }

  if (hits.length === 0) {
    ok(rule.name)
  } else {
    const log = rule.severity === 'fail' ? fail : warn
    log(`${rule.name} (${hits.length} occurrence${hits.length > 1 ? 's' : ''})`)
    info(rule.hint)
    for (const h of hits) {
      info(`  ${h.file}:${h.line}`)
    }
    if (rule.severity === 'fail') failures++
    else warnings++
  }
}

// =============================================================================
// Summary
// =============================================================================
console.log('')
console.log('─'.repeat(60))
if (failures > 0) {
  console.log(`${C.bold}${C.red}  AUDIT FAILED — ${failures} failure(s), ${warnings} warning(s)${C.reset}`)
  process.exit(1)
} else if (warnings > 0) {
  console.log(`${C.bold}${C.yellow}  AUDIT PASSED with ${warnings} warning(s)${C.reset}`)
} else {
  console.log(`${C.bold}${C.green}  AUDIT PASSED — all checks clean${C.reset}`)
}
console.log('')
