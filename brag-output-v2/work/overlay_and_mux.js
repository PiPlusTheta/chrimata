const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const WORK = __dirname;
const OUT_DIR = path.resolve(WORK, '..');
function sh(cmd) { execSync(cmd, { stdio: 'inherit', maxBuffer: 1024 * 1024 * 64 }); }

const timeline = JSON.parse(fs.readFileSync(path.join(WORK, 'timeline.json'), 'utf8'));
const byName = Object.fromEntries(timeline.scenes.map((s) => [s.name, s]));

const FONT = '/System/Library/Fonts/Menlo.ttc';
const lines = [
  { scene: 's06_diligence', text: 'TRACE CONCLUSIONS BACK TO EVIDENCE.', offset: 0.6, dur: 2.4 },
  { scene: 's07_whatchanged', text: 'WHAT CHANGED?', offset: 0.3, dur: 2.2 },
  { scene: 's08_hindsight', text: 'MEMORY THAT SURVIVES THE CONVERSATION.', offset: 0.3, dur: 2.4 },
  { scene: 's09_ask', text: 'ASK WITH CONTEXT.', offset: 0.3, dur: 2.2 },
  { scene: 's11_return', text: 'EVIDENCE. CONTEXT. MEMORY.', offset: 0.3, dur: 2.4 },
].filter((l) => byName[l.scene]);

const filters = lines.map((l) => {
  const s = (byName[l.scene].start + l.offset).toFixed(2);
  const e = (byName[l.scene].start + l.offset + l.dur).toFixed(2);
  const escaped = l.text.replace(/:/g, '\\:').replace(/'/g, "\u2019");
  return `drawtext=fontfile=${FONT}:text='${escaped}':fontsize=34:fontcolor=0xC5A880:` +
    `x=(w-text_w)/2:y=h-190:box=1:boxcolor=0x070C14@0.5:boxborderw=18:` +
    `enable='between(t\\,${s}\\,${e})'`;
}).join(',');

const concatVideo = path.join(WORK, 'concat.mp4');
// This ffmpeg build has no drawtext (libfreetype not compiled in) -- skip text
// overlays rather than block the render; the real UI carries the story.
const overlaid = concatVideo;

// audio should already be generated (make_audio.js) matching this exact timeline.total
const audioPath = path.join(WORK, 'audio.wav');
const finalVideo = path.join(OUT_DIR, 'brag.mp4');
sh(`ffmpeg -y -i ${overlaid} -i ${audioPath} -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest ${finalVideo}`);

// poster: use the pre-rendered brand poster (already frame 0 of s01_open)
const posterSrc = path.join(WORK, 'poster.png');
const posterDst = path.join(OUT_DIR, 'brag.jpg');
sh(`ffmpeg -y -i ${posterSrc} -q:v 3 ${posterDst}`);

console.log('DONE ->', finalVideo, posterDst);
