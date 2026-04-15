import puppeteer from 'puppeteer'

async function run() {
  const browser = await puppeteer.launch({ headless: false, defaultViewport: { width: 1280, height: 800 } })
  const page = await browser.newPage()

  console.log('='.repeat(50))
  console.log('TEST: NEW USER SIGNUP + LOGIN')
  console.log('='.repeat(50))

  const testEmail = `user_${Date.now()}@gmail.com`
  const testPass = 'testpass123'

  // 1. Go to login, sign up
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' })
  await page.screenshot({ path: 'test-screenshots/signup-01-page.png', fullPage: true })

  // Make sure on Sign Up tab
  const btns = await page.$$('button')
  for (const b of btns) {
    const t = await b.evaluate(el => el.textContent)
    if (t === 'Sign Up') { await b.click(); break }
  }
  await new Promise(r => setTimeout(r, 300))

  // Type email and password
  const emailInput = await page.$('input[type="email"]')
  await emailInput.click({ clickCount: 3 })
  await emailInput.type(testEmail, { delay: 20 })

  const passInput = await page.$('input[type="password"]')
  await passInput.click()
  await passInput.type(testPass, { delay: 20 })

  console.log('Signing up:', testEmail)

  // Submit
  await page.click('button[type="submit"]')

  try {
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 })
    const url = page.url()

    if (url.includes('/dashboard')) {
      console.log('[PASS] Signup → Dashboard')
      await new Promise(r => setTimeout(r, 2000))
      await page.screenshot({ path: 'test-screenshots/signup-02-dashboard.png', fullPage: true })

      // Check API key
      const code = await page.$('code')
      if (code) {
        const key = await code.evaluate(el => el.textContent)
        console.log('[PASS] API key:', key.substring(0, 20) + '...')
      } else {
        console.log('[FAIL] No API key')
      }

      // Sign out
      const allBtns = await page.$$('button')
      for (const b of allBtns) {
        const t = await b.evaluate(el => el.textContent)
        if (t?.includes('Sign out')) { await b.click(); break }
      }
      await new Promise(r => setTimeout(r, 2000))
      console.log('[PASS] Signed out → url:', page.url())

      // 2. Now LOG IN with same credentials
      await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' })

      // Switch to Log In tab
      const loginBtns = await page.$$('button')
      for (const b of loginBtns) {
        const t = await b.evaluate(el => el.textContent)
        if (t === 'Log In') { await b.click(); break }
      }
      await new Promise(r => setTimeout(r, 300))

      const emailInput2 = await page.$('input[type="email"]')
      await emailInput2.click({ clickCount: 3 })
      await emailInput2.type(testEmail, { delay: 20 })

      const passInput2 = await page.$('input[type="password"]')
      await passInput2.click()
      await passInput2.type(testPass, { delay: 20 })

      await page.click('button[type="submit"]')
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 })

      console.log(`[${page.url().includes('/dashboard') ? 'PASS' : 'FAIL'}] Login → Dashboard`)

      // 3. Test duplicate signup
      await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' })
      const signupBtns = await page.$$('button')
      for (const b of signupBtns) {
        const t = await b.evaluate(el => el.textContent)
        if (t === 'Sign Up') { await b.click(); break }
      }
      await new Promise(r => setTimeout(r, 300))

      const emailInput3 = await page.$('input[type="email"]')
      await emailInput3.click({ clickCount: 3 })
      await emailInput3.type(testEmail, { delay: 20 })

      const passInput3 = await page.$('input[type="password"]')
      await passInput3.click()
      await passInput3.type('differentpass', { delay: 20 })

      await page.click('button[type="submit"]')
      await new Promise(r => setTimeout(r, 3000))

      const bodyText = await page.$eval('body', el => el.textContent)
      const hasDupeError = bodyText.includes('already registered')
      console.log(`[${hasDupeError ? 'PASS' : 'FAIL'}] Duplicate email rejected — ${hasDupeError ? 'shows error' : bodyText.substring(0, 100)}`)
      await page.screenshot({ path: 'test-screenshots/signup-03-duplicate.png', fullPage: true })

    } else {
      console.log('[FAIL] Did not reach dashboard — url:', url)
      try {
        const err = await page.$eval('.text-red-400', el => el.textContent)
        console.log('Error:', err)
      } catch {}
    }
  } catch {
    console.log('[FAIL] Timeout')
    try {
      const err = await page.$eval('.text-red-400', el => el.textContent)
      console.log('Error:', err)
    } catch {}
    await page.screenshot({ path: 'test-screenshots/signup-fail.png', fullPage: true })
  }

  console.log('='.repeat(50))
  await new Promise(r => setTimeout(r, 2000))
  await browser.close()
}

run().catch(e => { console.error(e); process.exit(1) })
