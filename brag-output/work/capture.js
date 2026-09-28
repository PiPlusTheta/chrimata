const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  console.log("Starting browser...");
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  
  const screensDir = path.resolve(__dirname, 'screens');
  if (!fs.existsSync(screensDir)) fs.mkdirSync(screensDir);

  // Landing page
  console.log("Screenshotting landing page...");
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: path.join(screensDir, 'landing.png') });

  // Dashboard demo
  console.log("Screenshotting dashboard...");
  await page.goto('http://localhost:3000/dashboard/demo', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: path.join(screensDir, 'dashboard.png') });

  // Evidence
  console.log("Screenshotting evidence...");
  await page.goto('http://localhost:3000/dashboard/demo/evidence', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: path.join(screensDir, 'evidence.png') });

  // Diligence
  console.log("Screenshotting diligence...");
  await page.goto('http://localhost:3000/dashboard/demo/diligence', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: path.join(screensDir, 'diligence.png') });

  await browser.close();
  console.log("Screenshots done!");
})();
