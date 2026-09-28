const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const WORK = __dirname;
const OUT_DIR = path.resolve(WORK, '..');
const CLIPS = path.join(WORK, 'clips');
fs.mkdirSync(CLIPS, { recursive: true });

function sh(cmd) { execSync(cmd, { stdio: 'inherit', maxBuffer: 1024 * 1024 * 64 }); }
function ffprobeDuration(file) {
  const out = execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 "${file}"`).toString().trim();
  return parseFloat(out);
}

// Scene sources: some frames live in frames/ (this run), some in frames_prevrun/ (reused landing+enter)
function framesDirFor(name) {
  const a = path.join(WORK, 'frames', name);
  const b = path.join(WORK, 'frames_prevrun', name);
  if (fs.existsSync(a) && fs.readdirSync(a).length > 0) return a;
  if (fs.existsSync(b) && fs.readdirSync(b).length > 0) return b;
  return null;
}

// speed profile: array of {start,end,speed} fractions of the scene's own timeline; gaps default speed=1
const SPEED_PROFILES = {
  s07_whatchanged: [{ start: 0.28, end: 0.85, speed: 2.2 }],
  s08_hindsight: [{ start: 0.35, end: 0.8, speed: 2.0 }],
  s09_ask: [{ start: 0.18, end: 0.78, speed: 3.2 }],
  s02_landing: [{ start: 0, end: 1, speed: 1.15 }],
};

const SCENES = [
  's01_open', 's02_landing', 's03_enter', 's04_dashboard', 's05_queue',
  's06_diligence', 's07_whatchanged', 's08_hindsight', 's09_ask', 's10_breadth',
  's11_return', 's12_close',
];

const timeline = [];
let t = 0;

for (const name of SCENES) {
  const dir = framesDirFor(name);
  if (!dir) { console.log(`SKIP ${name}: no frames`); continue; }
  const nFrames = fs.readdirSync(dir).filter((f) => f.endsWith('.png')).length;
  const isSynthetic = name === 's01_open' || name === 's12_close';
  const srcFps = isSynthetic ? 30 : 12.5;
  const baseClip = path.join(CLIPS, `${name}_base.mp4`);
  sh(`ffmpeg -y -framerate ${srcFps} -i ${dir}/f%05d.png -vf "fps=30,format=yuv420p" -c:v libx264 -crf 16 -preset veryfast ${baseClip}`);

  let finalClip = baseClip;
  const profile = SPEED_PROFILES[name];
  if (profile && profile.length) {
    const dur = ffprobeDuration(baseClip);
    // build ordered segment list covering [0,1] with speed=1 in the gaps
    const points = [0, ...profile.flatMap((p) => [p.start, p.end]), 1].sort((a, b) => a - b);
    const segs = [];
    for (let i = 0; i < points.length - 1; i++) {
      const s = points[i], e = points[i + 1];
      if (e - s < 0.001) continue;
      const match = profile.find((p) => Math.abs(p.start - s) < 1e-6 && Math.abs(p.end - e) < 1e-6);
      segs.push({ s, e, speed: match ? match.speed : 1 });
    }
    const segFiles = [];
    segs.forEach((seg, i) => {
      const ss = (seg.s * dur).toFixed(3);
      const to = (seg.e * dur).toFixed(3);
      const segFile = path.join(CLIPS, `${name}_seg${i}.mp4`);
      sh(`ffmpeg -y -i ${baseClip} -ss ${ss} -to ${to} -vf "setpts=PTS/${seg.speed}" -an -c:v libx264 -crf 16 -preset veryfast ${segFile}`);
      segFiles.push(segFile);
    });
    const listFile = path.join(CLIPS, `${name}_list.txt`);
    fs.writeFileSync(listFile, segFiles.map((f) => `file '${f}'`).join('\n'));
    finalClip = path.join(CLIPS, `${name}_ramped.mp4`);
    sh(`ffmpeg -y -f concat -safe 0 -i ${listFile} -c copy ${finalClip}`);
  }

  const finalDur = ffprobeDuration(finalClip);
  timeline.push({ name, clip: finalClip, start: +t.toFixed(3), duration: +finalDur.toFixed(3) });
  t += finalDur;
  console.log(`${name}: ${nFrames} src frames -> ${finalDur.toFixed(2)}s (start ${timeline[timeline.length - 1].start}s)`);
}

fs.writeFileSync(path.join(WORK, 'timeline.json'), JSON.stringify({ total: t, scenes: timeline }, null, 2));
console.log(`\nTotal timeline: ${t.toFixed(1)}s`);

// concat all final clips
const concatList = path.join(WORK, 'concat_list.txt');
fs.writeFileSync(concatList, timeline.map((s) => `file '${s.clip}'`).join('\n'));
const concatVideo = path.join(WORK, 'concat.mp4');
sh(`ffmpeg -y -f concat -safe 0 -i ${concatList} -c copy ${concatVideo}`);
console.log('Concat done:', concatVideo);
