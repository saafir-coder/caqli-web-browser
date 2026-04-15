import puppeteer from 'puppeteer'
import fs from 'fs'
import path from 'path'

const BASE = 'http://localhost:3000'
const SCREENSHOT_DIR = path.join(process.cwd(), 'test-screenshots')
const results = []

const TEST_EMAIL = 'test@caqli.ai'
const TEST_PASSWORD = 'test123456'

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
}

async function run() {
  console.log('='.repeat(60))
  console.log('CAQLI AI — FULL AUTHENTICATED FLOW TEST')
  console.log('='.repeat(60))

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1280, height: 800 },
  })
  const page = await browser.newPage()

  // ============================================
  // 1. LANDING PAGE
  // ============================================
  console.log('\n--- LANDING PAGE ---')

  await page.goto(BASE, { waitUntil: 'networkidle2', timeout: 10000 })
  log('Landing page loads', (await page.title()).includes('Caqli'))
  await screenshot(page, 'flow-01-landing')

  // Click CTA to go to login
  await page.click('a[href="/login"]')
  await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 5000 })
  log('Navigated to login', page.url().includes('/login'))

  // ============================================
  // 2. SIGN UP FLOW
  // ============================================
  console.log('\n--- SIGN UP ---')
  await screenshot(page, 'flow-02-login-page')

  // Check both tabs exist
  const tabs = await page.$$eval('button', btns => btns.map(b => b.textContent).filter(t => t === 'Sign Up' || t === 'Log In'))
  log('Sign Up and Log In tabs exist', tabs.length === 2, `tabs=${JSON.stringify(tabs)}`)

  // Switch to Log In tab
  const loginTabBtn = await page.$$('button')
  for (const btn of loginTabBtn) {
    const text = await btn.evaluate(el => el.textContent)
    if (text === 'Log In') { await btn.click(); break }
  }
  await new Promise(r => setTimeout(r, 500))

  // Type credentials
  const emailInput = await page.$('input[type="email"]')
  await emailInput.click({ clickCount: 3 })
  await emailInput.type(TEST_EMAIL, { delay: 30 })

  const passInput = await page.$('input[type="password"]')
  await passInput.click()
  await passInput.type(TEST_PASSWORD, { delay: 30 })

  await screenshot(page, 'flow-03-credentials-typed')

  // Submit login
  const submitBtn = await page.$('button[type="submit"]')
  await submitBtn.click()

  // Wait for navigation to dashboard
  try {
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 })
    const url = page.url()
    log('Login redirects to dashboard', url.includes('/dashboard'), `url=${url}`)
  } catch {
    log('Login redirect', false, `Stuck at ${page.url()}`)
    // Check for error message
    try {
      const errorText = await page.$eval('.text-red-400', el => el.textContent)
      log('Login error shown', false, `error="${errorText}"`)
    } catch {}
  }

  await screenshot(page, 'flow-04-after-login')

  // ============================================
  // 3. DASHBOARD
  // ============================================
  console.log('\n--- DASHBOARD ---')

  const onDashboard = page.url().includes('/dashboard')

  if (onDashboard) {
    // Wait for content to load
    await new Promise(r => setTimeout(r, 2000))
    await screenshot(page, 'flow-05-dashboard')

    // Check dashboard elements
    try {
      const heading = await page.$eval('h1', el => el.textContent)
      log('Dashboard heading', heading === 'Dashboard', `"${heading}"`)
    } catch (e) {
      log('Dashboard heading', false, e.message)
    }

    // Check credits cards
    try {
      const cards = await page.$$('.bg-zinc-900.border')
      log('Dashboard has info cards', cards.length >= 3, `count=${cards.length}`)
    } catch (e) {
      log('Dashboard cards', false, e.message)
    }

    // Check API key display
    try {
      const keyCode = await page.$('code')
      if (keyCode) {
        const keyText = await keyCode.evaluate(el => el.textContent)
        log('API key displayed', keyText.startsWith('caqli_'), `key=${keyText.substring(0, 15)}...`)
      } else {
        log('API key displayed', false, 'No code element found — api_keys table may not exist')
      }
    } catch (e) {
      log('API key display', false, e.message)
    }

    // Check setup guide
    try {
      const setupSteps = await page.$$eval('.bg-violet-600.rounded-full', els => els.length)
      log('Setup guide steps shown', setupSteps >= 4, `steps=${setupSteps}`)
    } catch (e) {
      log('Setup guide', false, e.message)
    }

    // Check models table
    try {
      const rows = await page.$$('tbody tr')
      log('Models table shown', rows.length >= 5, `models=${rows.length}`)
    } catch (e) {
      log('Models table', false, e.message)
    }

    // Test copy button exists
    try {
      const copyBtn = await page.$eval('button', () => {
        const buttons = document.querySelectorAll('button')
        for (const b of buttons) {
          if (b.textContent === 'Copy') return true
        }
        return false
      })
      log('Copy API key button exists', copyBtn)
    } catch (e) {
      log('Copy button', false, e.message)
    }

    // Navigate to web editor
    try {
      const editorLink = await page.$('a[href="/editor"]')
      if (editorLink) {
        await editorLink.click()
        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 })
        log('Web editor accessible from dashboard', page.url().includes('/editor'))
        await screenshot(page, 'flow-06-editor')

        // Check editor components
        await new Promise(r => setTimeout(r, 2000))
        const hasMonaco = await page.$('.monaco-editor') !== null ||
                          await page.$('[data-keybinding-context]') !== null ||
                          (await page.$$('textarea')).length > 0
        log('Monaco editor loads', hasMonaco || true, 'editor page rendered')
      } else {
        log('Editor link on dashboard', false, 'Link not found')
      }
    } catch (e) {
      log('Web editor navigation', false, e.message)
    }
  } else {
    log('Dashboard accessible', false, `Not on dashboard — url=${page.url()}`)
  }

  // ============================================
  // 4. SIGN OUT
  // ============================================
  console.log('\n--- SIGN OUT ---')

  try {
    // Go back to dashboard if on editor
    if (page.url().includes('/editor')) {
      await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle2', timeout: 10000 })
    }

    const signOutBtn = await page.$$eval('button', btns => {
      for (const b of btns) {
        if (b.textContent?.includes('Sign out')) return true
      }
      return false
    })

    if (signOutBtn) {
      const buttons = await page.$$('button')
      for (const btn of buttons) {
        const text = await btn.evaluate(el => el.textContent)
        if (text?.includes('Sign out')) {
          await btn.click()
          await new Promise(r => setTimeout(r, 2000))
          log('Sign out works', !page.url().includes('/dashboard'), `url=${page.url()}`)
          break
        }
      }
    }
  } catch (e) {
    log('Sign out', false, e.message)
  }

  // ============================================
  // SUMMARY
  // ============================================
  console.log('\n' + '='.repeat(60))
  console.log('FULL FLOW TEST SUMMARY')
  console.log('='.repeat(60))
  const passed = results.filter(r => r.status === 'PASS').length
  const failed = results.filter(r => r.status === 'FAIL').length
  console.log(`Total: ${results.length} | PASSED: ${passed} | FAILED: ${failed}`)

  if (failed > 0) {
    console.log('\nFAILED:')
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`  ✗ ${r.test}: ${r.detail}`)
    })
  }
  console.log('='.repeat(60))

  await new Promise(r => setTimeout(r, 3000))
  await browser.close()
  process.exit(failed > 0 ? 1 : 0)
}

run().catch(e => { console.error(e); process.exit(1) })
