const fs = require('fs');
const path = require('path');

const manifest = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'manifest.json'), 'utf8'));
const OPEN = { name: 's01_open', frames: Math.round(4.6 * 30), fps: 30, seconds: 4.6 };
const CLOSE = { name: 's12_close', frames: Math.round(5.6 * 30), fps: 30, seconds: 5.6 };

const scenes = [OPEN, ...manifest, CLOSE];
let t = 0;
const timeline = scenes.map((s) => {
  const entry = { name: s.name, start: +t.toFixed(2), duration: s.seconds, fps: s.fps, frames: s.frames };
  t += s.seconds;
  return entry;
});

const out = { total: +t.toFixed(2), scenes: timeline };
fs.writeFileSync(path.resolve(__dirname, 'timeline.json'), JSON.stringify(out, null, 2));
console.log(`Total duration: ${out.total}s`);
for (const s of timeline) console.log(`${s.name.padEnd(20)} start=${s.start.toFixed(1)}s dur=${s.duration.toFixed(1)}s`);
