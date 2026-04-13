import puppeteer from 'puppeteer'

const BASE = 'http://localhost:3000'
const TEST_EMAIL = `demo_${Date.now()}@caqli.test`
const TEST_PASSWORD = 'demo123456'

let passed = 0
let failed = 0

function log(ok, msg) {
  if (ok) { console.log(`  [PASS] ${msg}`); passed++ }
  else     { console.log(`  [FAIL] ${msg}`); failed++ }
}

async function wait(ms) {
  return new Promise(r => setTimeout(r, ms))
}

async function run() {
  console.log('\n============================================================')
  console.log('  CAQLI AI — DEMO READINESS TEST')
  console.log(`  Email: ${TEST_EMAIL}`)
  console.log('============================================================\n')

  const browser = await puppeteer.launch({ headless: false, slowMo: 40, args: ['--window-size=1280,800'] })
  const page = await browser.newPage()
  await page.setViewport({ width: 1280, height: 800 })

  try {
    // ── 1. LANDING PAGE ────────────────────────────────────────────
    console.log('--- LANDING PAGE ---')
    await page.goto(BASE, { waitUntil: 'networkidle2' })
    log(page.url().includes('localhost:3000'), 'Landing page loads')
    log(await page.$('text/100 messages') !== null || await page.content().then(c => c.includes('100')), 'Shows 100 messages/day')

    // ── 2. SIGNUP ─────────────────────────────────────────────────
    console.log('\n--- SIGNUP ---')
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle2' })
    await wait(500)

    await page.type('input[type="email"]', TEST_EMAIL)
    await page.type('input[type="password"]', TEST_PASSWORD)
    await page.click('button[type="submit"]')

    // Wait for navigation to dashboard
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {})
    await wait(1000)

    const afterSignup = page.url()
    log(afterSignup.includes('/dashboard'), `Redirected to dashboard (${afterSignup})`)

    // ── 3. DASHBOARD ──────────────────────────────────────────────
    console.log('\n--- DASHBOARD ---')
    await wait(1500)
    const dashContent = await page.content()
    log(dashContent.includes('Dashboard'), 'Dashboard page loaded')
    log(dashContent.includes('caqli_'), 'API key is visible')
    log(dashContent.includes('100'), 'Shows 100 free messages')
    log(dashContent.includes('Copy Setup Command') || dashContent.includes('Setup'), 'Setup wizard present')

    // ── 4. EDITOR ─────────────────────────────────────────────────
    console.log('\n--- EDITOR ---')
    await page.goto(`${BASE}/editor`, { waitUntil: 'networkidle2' })
    await wait(2000)
    const editorContent = await page.content()
    log(page.url().includes('/editor'), 'Editor page loads')
    log(editorContent.includes('Free') || editorContent.includes('Claude'), 'Tier toggle visible')

    // ── 5. SEND A CHAT MESSAGE ────────────────────────────────────
    console.log('\n--- CHAT (Free Model) ---')
    try {
      // Find the chat textarea
      await page.waitForSelector('textarea', { timeout: 5000 })
      await page.type('textarea', 'Say hello in one word')

      // Press Enter to send (Shift+Enter = newline, Enter = send)
      await page.keyboard.press('Enter')

      // Wait for response (up to 20s)
      await wait(20000)
      const chatContent = await page.content()
      const hasResponse = chatContent.includes('assistant') || chatContent.includes('Hello') || chatContent.includes('Hi')
      log(hasResponse, 'AI responded to chat message')
    } catch (e) {
      log(false, `Chat failed: ${e.message}`)
    }

    // ── 6. SIGN OUT ───────────────────────────────────────────────
    console.log('\n--- SIGN OUT ---')
    await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle2' })
    await wait(500)
    const signOutBtn = await page.$('button')
    const buttons = await page.$$('button')
    for (const btn of buttons) {
      const text = await btn.evaluate(el => el.textContent)
      if (text?.includes('Sign out')) {
        await btn.click()
        break
      }
    }
    await wait(2000)
    log(page.url() === `${BASE}/` || page.url().includes('/login') || page.url() === `${BASE}`, 'Sign out works')

  } catch (err) {
    console.log(`\n[ERROR] ${err.message}`)
  }

  await browser.close()

  console.log('\n============================================================')
  console.log(`  RESULTS: ${passed} passed, ${failed} failed`)
  if (failed === 0) {
    console.log('  ✓ READY TO RECORD — everything works')
  } else {
    console.log('  ✗ FIX ISSUES ABOVE BEFORE RECORDING')
  }
  console.log('============================================================\n')

  process.exit(failed > 0 ? 1 : 0)
}

run().catch(e => { console.error(e); process.exit(1) })
