const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  console.log("Starting browser for full-page captures...");
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  
  const screensDir = path.resolve(__dirname, 'screens_full');
  if (!fs.existsSync(screensDir)) fs.mkdirSync(screensDir);

  const capture = async (name, url, wait = 2000) => {
    console.log(`Capturing ${name}...`);
    await page.goto(url, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, wait)); // let animations settle
    await page.screenshot({ path: path.join(screensDir, `${name}.png`), fullPage: true });
  };

  await capture('landing', 'http://localhost:3000/');
  await capture('dashboard', 'http://localhost:3000/dashboard');
  await capture('diligence', 'http://localhost:3000/dashboard/demo/diligence');
  await capture('evidence', 'http://localhost:3000/dashboard/demo/evidence');
  await capture('queue', 'http://localhost:3000/dashboard/demo/queue');
  await capture('ask', 'http://localhost:3000/dashboard/demo/ask');

  await browser.close();
  console.log("Screenshots done!");
})();
