import puppeteer from 'puppeteer'

async function run() {
  const browser = await puppeteer.launch({ headless: false, defaultViewport: { width: 1280, height: 900 } })
  const page = await browser.newPage()

  // Login
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' })
  const btns = await page.$$('button')
  for (const b of btns) {
    const t = await b.evaluate(el => el.textContent)
    if (t === 'Log In') { await b.click(); break }
  }
  await new Promise(r => setTimeout(r, 300))

  const emailInput = await page.$('input[type="email"]')
  await emailInput.type('test@caqli.ai')
  const passInput = await page.$('input[type="password"]')
  await passInput.type('test123456')
  await page.click('button[type="submit"]')
  await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 })

  await new Promise(r => setTimeout(r, 2000))
  await page.screenshot({ path: 'test-screenshots/dashboard-final.png', fullPage: true })
  console.log('Screenshot saved')

  await new Promise(r => setTimeout(r, 2000))
  await browser.close()
}

run().catch(e => { console.error(e); process.exit(1) })
