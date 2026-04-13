import puppeteer from 'puppeteer'
import fs from 'fs'
import path from 'path'

const BASE = 'http://localhost:3000'
const SCREENSHOT_DIR = path.join(process.cwd(), 'test-screenshots')
const results = []

// Ensure screenshot dir exists
if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR)

function log(test, pass, detail = '') {
  const status = pass ? 'PASS' : 'FAIL'
  results.push({ test, status, detail })
  console.log(`[${status}] ${test}${detail ? ' — ' + detail : ''}`)
}

async function screenshot(page, name) {
  const filepath = path.join(SCREENSHOT_DIR, `${name}.png`)
  await page.screenshot({ path: filepath, fullPage: true })
  console.log(`  -> Screenshot: ${filepath}`)
  return filepath
}

async function run() {
  console.log('='.repeat(60))
  console.log('CAQLI AI — FULL BROWSER STRESS TEST')
  console.log('='.repeat(60))
  console.log('')

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1280, height: 800 },
    args: ['--no-sandbox']
  })
  const page = await browser.newPage()

  // Collect console errors
  const consoleErrors = []
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })
  const networkErrors = []
  page.on('requestfailed', req => {
    networkErrors.push(`${req.method()} ${req.url()} — ${req.failure()?.errorText}`)
  })

  // ============================================
  // SECTION 1: LANDING PAGE
  // ============================================
  console.log('\n--- LANDING PAGE ---')

  try {
    const res = await page.goto(BASE, { waitUntil: 'networkidle2', timeout: 10000 })
    log('Landing page HTTP status', res.status() === 200, `status=${res.status()}`)
  } catch (e) {
    log('Landing page loads', false, e.message)
  }

  // Check title
  try {
    const title = await page.title()
    log('Page title contains "Caqli"', title.includes('Caqli'), `"${title}"`)
  } catch (e) {
    log('Page title', false, e.message)
  }

  // Check hero section
  try {
    const h1 = await page.$eval('h1', el => el.textContent)
    log('Hero heading exists', h1.length > 0, `"${h1}"`)
  } catch (e) {
    log('Hero heading', false, e.message)
  }

  // Check CTA button
  try {
    const ctaLinks = await page.$$('a[href="/login"]')
    log('CTA links to /login exist', ctaLinks.length > 0, `count=${ctaLinks.length}`)
  } catch (e) {
    log('CTA links', false, e.message)
  }

  // Check feature cards
  try {
    const cards = await page.$$eval('h3', els => els.map(e => e.textContent))
    log('Feature cards render', cards.length >= 3, `cards=${JSON.stringify(cards)}`)
  } catch (e) {
    log('Feature cards', false, e.message)
  }

  // Check footer
  try {
    const footer = await page.$eval('footer', el => el.textContent)
    log('Footer renders', footer.includes('Caqli'), `"${footer.trim()}"`)
  } catch (e) {
    log('Footer', false, e.message)
  }

  // Dark theme
  try {
    const bg = await page.$eval('body', el => getComputedStyle(el).backgroundColor)
    log('Dark background applied', bg !== 'rgb(255, 255, 255)', `bg=${bg}`)
  } catch (e) {
    log('Dark theme', false, e.message)
  }

  // Navigation bar
  try {
    const nav = await page.$('nav')
    log('Navigation bar exists', !!nav)
  } catch (e) {
    log('Nav bar', false, e.message)
  }

  await screenshot(page, '01-landing-page')

  // Click CTA button — navigate like a real user
  try {
    await page.click('a[href="/login"]')
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 5000 })
    log('CTA click navigates to /login', page.url().includes('/login'), `url=${page.url()}`)
  } catch (e) {
    log('CTA navigation', false, e.message)
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle2' })
  }

  // ============================================
  // SECTION 2: LOGIN PAGE
  // ============================================
  console.log('\n--- LOGIN PAGE ---')

  await screenshot(page, '02-login-page')

  // Check login page elements
  try {
    const heading = await page.$eval('h1', el => el.textContent)
    log('Login heading shows "Caqli AI"', heading.includes('Caqli'), `"${heading}"`)
  } catch (e) {
    log('Login heading', false, e.message)
  }

  try {
    const emailInput = await page.$('input[type="email"]')
    log('Email input exists', !!emailInput)
  } catch (e) {
    log('Email input', false, e.message)
  }

  try {
    const submitBtn = await page.$('button[type="submit"]')
    const btnText = await page.$eval('button[type="submit"]', el => el.textContent)
    log('Submit button exists', !!submitBtn, `text="${btnText}"`)
  } catch (e) {
    log('Submit button', false, e.message)
  }

  // No password field should exist
  try {
    const pwInput = await page.$('input[type="password"]')
    log('No password field (magic link only)', !pwInput)
  } catch (e) {
    log('No password field', false, e.message)
  }

  // Type email like a human (character by character)
  try {
    const emailInput = await page.$('input[type="email"]')
    await emailInput.click()
    await page.keyboard.type('test@caqli.ai', { delay: 50 })
    const value = await page.$eval('input[type="email"]', el => el.value)
    log('Email typing works', value === 'test@caqli.ai', `typed="${value}"`)
  } catch (e) {
    log('Email typing', false, e.message)
  }

  await screenshot(page, '03-login-email-typed')

  // Submit the form — expect either success or rate limit (both are valid)
  try {
    await page.click('button[type="submit"]')
    await new Promise(r => setTimeout(r, 3000))

    const pageContent = await page.$eval('body', el => el.textContent)
    const sent = pageContent.includes('Check your email')
    const rateLimited = pageContent.includes('rate limit') || pageContent.includes('Rate limit')
    const hasError = pageContent.includes('error') || pageContent.includes('Error')

    if (sent) {
      log('Magic link submission', true, 'Shows "Check your email" confirmation')
    } else if (rateLimited) {
      log('Magic link submission', true, 'Rate limited (expected — Supabase throttle)')
    } else {
      log('Magic link submission', false, `Unexpected state. Has error: ${hasError}`)
    }
  } catch (e) {
    log('Magic link submission', false, e.message)
  }

  await screenshot(page, '04-login-after-submit')

  // ============================================
  // SECTION 3: AUTH PROTECTION
  // ============================================
  console.log('\n--- AUTH PROTECTION ---')

  // /editor should redirect to /login
  try {
    await page.goto(`${BASE}/editor`, { waitUntil: 'networkidle2', timeout: 10000 })
    const url = page.url()
    log('/editor redirects to /login when unauthenticated', url.includes('/login'), `url=${url}`)
  } catch (e) {
    log('/editor redirect', false, e.message)
  }

  await screenshot(page, '05-editor-redirect')

  // /dashboard should redirect to /login
  try {
    await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle2', timeout: 10000 })
    const url = page.url()
    log('/dashboard redirects to /login when unauthenticated', url.includes('/login'), `url=${url}`)
  } catch (e) {
    log('/dashboard redirect', false, e.message)
  }

  // ============================================
  // SECTION 4: API ENDPOINTS
  // ============================================
  console.log('\n--- API ENDPOINTS ---')

  // Credits API — unauthenticated
  try {
    const res = await page.goto(`${BASE}/api/credits`, { waitUntil: 'networkidle2', timeout: 5000 })
    log('GET /api/credits rejects unauthenticated', res.status() === 401, `status=${res.status()}`)
  } catch (e) {
    log('GET /api/credits', false, e.message)
  }

  // Chat API — unauthenticated POST
  try {
    const chatRes = await page.evaluate(async (base) => {
      const res = await fetch(`${base}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: 'hello' }], code: '', tier: 'free' })
      })
      return { status: res.status, body: await res.text() }
    }, BASE)
    log('POST /api/chat rejects unauthenticated', chatRes.status === 401, `status=${chatRes.status}`)
  } catch (e) {
    log('POST /api/chat', false, e.message)
  }

  // Proxy endpoint — no API key
  try {
    const proxyRes = await page.evaluate(async (base) => {
      const res = await fetch(`${base}/api/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'meta-llama/llama-3.1-8b-instruct:free', messages: [{ role: 'user', content: 'hi' }] })
      })
      return { status: res.status, body: await res.json() }
    }, BASE)
    log('Proxy rejects request without API key', proxyRes.status === 401, `status=${proxyRes.status}`)
  } catch (e) {
    log('Proxy no-key test', false, e.message)
  }

  // Proxy endpoint — fake API key
  try {
    const proxyRes = await page.evaluate(async (base) => {
      const res = await fetch(`${base}/api/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer caqli_fakekeyhere123' },
        body: JSON.stringify({ model: 'meta-llama/llama-3.1-8b-instruct:free', messages: [{ role: 'user', content: 'hi' }] })
      })
      return { status: res.status, body: await res.json() }
    }, BASE)
    log('Proxy rejects fake API key', proxyRes.status === 401, `status=${proxyRes.status}, msg=${proxyRes.body?.error?.message}`)
  } catch (e) {
    log('Proxy fake-key test', false, e.message)
  }

  // Proxy endpoint — non-caqli key format
  try {
    const proxyRes = await page.evaluate(async (base) => {
      const res = await fetch(`${base}/api/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer sk-some-other-key' },
        body: JSON.stringify({ model: 'test', messages: [{ role: 'user', content: 'hi' }] })
      })
      return { status: res.status }
    }, BASE)
    log('Proxy rejects non-caqli key format', proxyRes.status === 401, `status=${proxyRes.status}`)
  } catch (e) {
    log('Proxy wrong-format test', false, e.message)
  }

  // Chat API — invalid request (missing fields)
  try {
    const badRes = await page.evaluate(async (base) => {
      const res = await fetch(`${base}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })
      return { status: res.status }
    }, BASE)
    log('POST /api/chat rejects invalid body', badRes.status === 400 || badRes.status === 401, `status=${badRes.status}`)
  } catch (e) {
    log('POST /api/chat invalid', false, e.message)
  }

  // ============================================
  // SECTION 5: RESPONSIVE / MOBILE
  // ============================================
  console.log('\n--- MOBILE VIEW ---')

  try {
    await page.setViewport({ width: 375, height: 812 })
    await page.goto(BASE, { waitUntil: 'networkidle2', timeout: 10000 })
    const h1 = await page.$eval('h1', el => el.textContent)
    log('Landing page renders on mobile (375px)', h1.length > 0)
    await screenshot(page, '06-mobile-landing')
  } catch (e) {
    log('Mobile landing', false, e.message)
  }

  try {
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle2', timeout: 10000 })
    const emailInput = await page.$('input[type="email"]')
    log('Login page renders on mobile', !!emailInput)
    await screenshot(page, '07-mobile-login')
  } catch (e) {
    log('Mobile login', false, e.message)
  }

  // Reset viewport
  await page.setViewport({ width: 1280, height: 800 })

  // ============================================
  // SECTION 6: PERFORMANCE
  // ============================================
  console.log('\n--- PERFORMANCE ---')

  try {
    const start = Date.now()
    await page.goto(BASE, { waitUntil: 'networkidle2', timeout: 10000 })
    const loadTime = Date.now() - start
    log('Landing page load time', loadTime < 3000, `${loadTime}ms`)
  } catch (e) {
    log('Landing page load time', false, e.message)
  }

  try {
    const start = Date.now()
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle2', timeout: 10000 })
    const loadTime = Date.now() - start
    log('Login page load time', loadTime < 3000, `${loadTime}ms`)
  } catch (e) {
    log('Login page load time', false, e.message)
  }

  // ============================================
  // SECTION 7: CONSOLE & NETWORK ERRORS
  // ============================================
  console.log('\n--- ERROR CHECK ---')

  const criticalConsoleErrors = consoleErrors.filter(e =>
    !e.includes('favicon') && !e.includes('DevTools') &&
    !e.includes('401') && !e.includes('429') && !e.includes('ERR_ABORTED')
  )
  log('No critical console errors', criticalConsoleErrors.length === 0,
    criticalConsoleErrors.length > 0 ? criticalConsoleErrors.join(' | ') : 'clean')

  const criticalNetworkErrors = networkErrors.filter(e =>
    !e.includes('favicon') && !e.includes('ERR_ABORTED')
  )
  log('No network failures', criticalNetworkErrors.length === 0,
    criticalNetworkErrors.length > 0 ? criticalNetworkErrors.join(' | ') : 'clean')

  // ============================================
  // SUMMARY
  // ============================================
  console.log('\n' + '='.repeat(60))
  console.log('STRESS TEST SUMMARY')
  console.log('='.repeat(60))
  const passed = results.filter(r => r.status === 'PASS').length
  const failed = results.filter(r => r.status === 'FAIL').length
  console.log(`Total: ${results.length} | PASSED: ${passed} | FAILED: ${failed}`)

  if (failed > 0) {
    console.log('\nFAILED TESTS:')
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`  ✗ ${r.test}: ${r.detail}`)
    })
  }

  console.log(`\nScreenshots saved to: ${SCREENSHOT_DIR}`)
  console.log('='.repeat(60))

  await new Promise(r => setTimeout(r, 2000))
  await browser.close()
  process.exit(failed > 0 ? 1 : 0)
}

run().catch(e => { console.error(e); process.exit(1) })
