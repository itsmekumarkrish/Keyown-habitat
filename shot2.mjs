import puppeteer from '/Users/shiv/Downloads/Keyown habitat/node_modules/puppeteer/lib/puppeteer/puppeteer.js';
const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 412, height: 915 });
await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 1200));
await page.screenshot({ 
  path: '/Users/shiv/.gemini/antigravity-ide/brain/92e5fd35-66b8-401e-b667-dc8938c42e3a/badge_close_headline.png', 
  clip: { x: 0, y: 0, width: 412, height: 915 } 
});
await browser.close();
console.log('done');
