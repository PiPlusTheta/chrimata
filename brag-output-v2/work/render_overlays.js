const puppeteer = require('puppeteer');
const path = require('path');

const LINES = [
  'TRACE CONCLUSIONS BACK TO EVIDENCE.',
  'WHAT CHANGED?',
  'MEMORY THAT SURVIVES THE CONVERSATION.',
  'ASK WITH CONTEXT.',
  'EVIDENCE. CONTEXT. MEMORY.',
];

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
  for (let i = 0; i < LINES.length; i++) {
    const url = `file://${path.resolve(__dirname, 'overlay_text.html')}?t=${encodeURIComponent(LINES[i])}`;
    await page.goto(url, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 300));
    await page.screenshot({ path: path.resolve(__dirname, `overlay_${i}.png`), omitBackground: true });
    console.log(`overlay_${i}.png -> "${LINES[i]}"`);
  }
  await browser.close();
})();
