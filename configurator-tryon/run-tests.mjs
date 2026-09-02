// Resolve playwright from the working directory, not from this file, so the
// runner can live here while the dependency lives in another repo.
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'

const requireFromCwd = createRequire(pathToFileURL(`${process.cwd()}/`))
const { chromium } = requireFromCwd('playwright')

const BASE = process.env.TRYON_TEST_URL ?? 'http://127.0.0.1:8777/index.html'
const SHOT = process.env.TRYON_TEST_SHOTS ?? '.'

const browser = await chromium.launch({
  headless: true,
  channel: 'chrome',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
})

async function run(query, label, shot) {
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } })
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message.slice(0, 200)))

  await page.goto(BASE + query, { waitUntil: 'load', timeout: 60000 })
  await page.waitForFunction(
    () => document.querySelectorAll('#checks li').length >= 13,
    { timeout: 150000 },
  )
  await page.waitForTimeout(2500)

  const res = await page.evaluate(() => ({
    checks: [...document.querySelectorAll('#checks li')].map((li) => ({
      ok: li.className === 'pass',
      label: li.textContent,
    })),
    buttons: window.__viewerButtonCount,
    choices: [...document.querySelectorAll('#ring-choices .choice')].map((d) => d.textContent),
  }))

  if (shot) await page.screenshot({ path: `${SHOT}/${shot}` })
  await page.close()
  return { label, ...res, errors }
}

console.log('=== A: hideTryOn: false (documented setup) ===')
const a = await run('', 'hideTryOn=false', 'tryon-shown.png')
for (const c of a.checks) console.log(`${c.ok ? 'PASS' : 'FAIL'}  ${c.label}`)
console.log('ring choices:', JSON.stringify(a.choices))
if (a.errors.length) console.log('page errors:', a.errors)

// C: the documented custom-button flow. There is no camera here, so start()
// must fail — and the session must put the configurator back on its own.
console.log('\n=== C: custom button with no camera (restore-on-failure) ===')
{
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } })
  await page.goto(BASE, { waitUntil: 'load', timeout: 60000 })
  await page.waitForFunction(() => document.querySelectorAll('#checks li').length >= 13, { timeout: 150000 })
  await page.waitForTimeout(2000)

  const before = await page.evaluate(() => viewerApp.scene.modelRoot.children.length)
  await page.click('#tryon-button')
  await page.waitForTimeout(12000)

  const after = await page.evaluate(() => ({
    children: viewerApp.scene.modelRoot.children.length,
    scale: viewerApp.scene.modelRoot.scale.toArray().join(','),
    log: document.getElementById('log').textContent.split('\n').slice(-4).join(' | '),
  }))
  console.log(`children before=${before} after=${after.children}  scale=${after.scale}`)
  console.log('tail:', after.log.trim())
  console.log(`${after.children === before ? 'PASS' : 'FAIL'}  Configurator restored after a failed start()`)
  globalThis.__restoreOk = after.children === before
  await page.close()
}

console.log('\n=== B: hideTryOn: true (control) ===')
const b = await run('?hideTryOn=1', 'hideTryOn=true', 'tryon-hidden.png')
console.log(`control buttons: A=${a.buttons}  B=${b.buttons}`)

const delta = a.buttons - b.buttons
const buttonProven = delta === 1
console.log(
  `${buttonProven ? 'PASS' : 'FAIL'}  Try-On adds exactly one control button when enabled (delta ${delta})`,
)

const failed = a.checks.filter((c) => !c.ok)
console.log(`\n${a.checks.length} in-page checks, ${failed.length} failed`)
for (const f of failed) console.log('  FAILED:', f.label)

await browser.close()
process.exit(failed.length === 0 && buttonProven && globalThis.__restoreOk ? 0 : 1)
