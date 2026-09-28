const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
  
  const htmlPath = path.resolve(__dirname, 'video.html');
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });

  const fps = 30;
  const duration = 95; // 95 seconds
  const totalFrames = fps * duration;

  const framesDir = path.resolve(__dirname, 'frames');
  if (!fs.existsSync(framesDir)) {
    fs.mkdirSync(framesDir);
  }

  console.log("Generating frames for 95 seconds...");
  for (let i = 0; i <= totalFrames; i++) {
    const t = i / fps;
    await page.evaluate((time) => {
      window.seek(time);
    }, t);
    
    // Screenshot
    const num = String(i).padStart(4, '0');
    await page.screenshot({ path: path.join(framesDir, `frame_${num}.png`) });
    
    if (i % 30 === 0) {
      console.log(`Rendered second ${i/30} / ${duration}`);
    }
  }

  await browser.close();

  // Create the final video
  console.log("Encoding video with ffmpeg...");
  const outPath = path.resolve(__dirname, '..', 'brag.mp4');
  execSync(`ffmpeg -y -framerate 30 -i ${framesDir}/frame_%04d.png -c:v libx264 -pix_fmt yuv420p ${outPath}`);

  // Create poster image (settled frame from Scene 3 - second 25)
  console.log("Extracting poster...");
  const posterPath = path.resolve(__dirname, '..', 'brag.jpg');
  execSync(`ffmpeg -y -i ${framesDir}/frame_0750.png -vframes 1 ${posterPath}`);
  
  // Replace frame 0
  fs.copyFileSync(path.join(framesDir, `frame_0750.png`), path.join(framesDir, `frame_0000.png`));
  
  // Re-encode
  console.log("Re-encoding video with new poster as frame 0...");
  execSync(`ffmpeg -y -framerate 30 -i ${framesDir}/frame_%04d.png -c:v libx264 -pix_fmt yuv420p ${outPath}`);

  console.log("Done!");
})();
