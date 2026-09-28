const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const FPS = 30;
const JOBS = [
  { mode: 'open', duration: 4.6, dir: 's01_open' },
  { mode: 'close', duration: 5.6, dir: 's12_close' },
];

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
  for (const job of JOBS) {
    const url = `file://${path.resolve(__dirname, 'brand.html')}?mode=${job.mode}`;
    await page.goto(url, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 400));
    const dir = path.resolve(__dirname, 'frames', job.dir);
    fs.mkdirSync(dir, { recursive: true });
    const total = Math.round(job.duration * FPS);
    for (let i = 0; i < total; i++) {
      const t = i / FPS;
      await page.evaluate((t) => window.seek(t), t);
      await page.screenshot({ path: path.join(dir, `f${String(i).padStart(5, '0')}.png`) });
    }
    console.log(`${job.dir}: ${total} frames`);
    if (job.mode === 'open') {
      const posterIdx = Math.min(total - 1, Math.round(4.0 * FPS));
      const posterPath = path.join(dir, `f${String(posterIdx).padStart(5, '0')}.png`);
      fs.copyFileSync(posterPath, path.resolve(__dirname, 'poster.png'));
      fs.copyFileSync(posterPath, path.join(dir, 'f00000.png'));
      console.log('poster frame captured from', posterPath);
    }
  }
  await browser.close();
})();
