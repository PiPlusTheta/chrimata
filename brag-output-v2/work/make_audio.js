const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const timeline = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'timeline.json'), 'utf8'));
const byName = Object.fromEntries(timeline.scenes.map((s) => [s.name, s]));
const total = timeline.total;

function run(cmd) { execSync(cmd, { stdio: 'inherit' }); }

const TMP = path.resolve(__dirname, 'audio_tmp');
fs.mkdirSync(TMP, { recursive: true });

// four musical segments, each a soft sustained pad, boundaries tied to the story beats
const s06 = byName['s06_diligence']?.start ?? total * 0.35;
const s09 = byName['s09_ask']?.start ?? total * 0.65;
const s11 = byName['s11_return']?.start ?? total * 0.88;

const segments = [
  { start: 0, end: s06, tones: [110.0, 164.81, 220.0] },        // A2 E3 A3 — grounded intro/dashboard
  { start: s06, end: s09, tones: [174.61, 220.0, 261.63] },      // F3 A3 C4 — evidence/what-changed/hindsight lift
  { start: s09, end: s11, tones: [110.0, 130.81, 164.81, 220.0] }, // full Am — ask/breadth confidence
  { start: s11, end: total, tones: [130.81, 164.81, 196.0, 261.63] }, // C major — resolve/close
];

segments.forEach((seg, i) => {
  const dur = Math.max(0.6, seg.end - seg.start);
  const n = seg.tones.length;
  const inputs = seg.tones.map((f, j) => `sine=f=${f}:d=${dur.toFixed(3)}:sample_rate=44100[t${j}]`).join(';');
  const vols = seg.tones.map((_, j) => `[t${j}]volume=${(0.85 / n).toFixed(3)}[v${j}]`).join(';');
  const mixIn = seg.tones.map((_, j) => `[v${j}]`).join('');
  const fadeOutStart = Math.max(0, dur - 0.9);
  const filter = `${inputs};${vols};${mixIn}amix=inputs=${n}:duration=first:normalize=0,` +
    `lowpass=f=2600,tremolo=f=0.12:d=0.18,` +
    `afade=t=in:st=0:d=0.9,afade=t=out:st=${fadeOutStart.toFixed(3)}:d=0.9[out]`;
  run(`ffmpeg -y -filter_complex "${filter}" -map "[out]" -ac 2 -ar 44100 ${TMP}/seg${i}.wav`);
});

// concat the 4 segments
run(`ffmpeg -y -i ${TMP}/seg0.wav -i ${TMP}/seg1.wav -i ${TMP}/seg2.wav -i ${TMP}/seg3.wav ` +
  `-filter_complex "[0:a][1:a][2:a][3:a]concat=n=4:v=0:a=1[a]" -map "[a]" ${TMP}/pad.wav`);

// sparse bell-like accent pings at key story beats
const accentTimes = [
  byName['s03_enter']?.start ?? 0,
  byName['s07_whatchanged']?.start ?? 0,
  byName['s08_hindsight']?.start ?? 0,
  (byName['s11_return']?.start ?? total - 6) - 0.2,
].filter((t) => t > 0.2 && t < total - 0.3);

let pingInputs = '';
let pingFilters = '';
let pingLabels = '';
accentTimes.forEach((t, i) => {
  const ms = Math.round(t * 1000);
  pingFilters += `sine=f=880:d=0.5:sample_rate=44100[p${i}a];sine=f=1318.5:d=0.5:sample_rate=44100[p${i}b];` +
    `[p${i}a][p${i}b]amix=inputs=2:duration=first:normalize=0,volume=0.09,afade=t=out:st=0.03:d=0.47:curve=exp,` +
    `adelay=${ms}|${ms}[ping${i}];`;
  pingLabels += `[ping${i}]`;
});

const padDurSec = total.toFixed(3);
run(`ffmpeg -y -i ${TMP}/pad.wav -filter_complex ` +
  `"${pingFilters}[0:a]${pingLabels}amix=inputs=${accentTimes.length + 1}:duration=first:normalize=0,` +
  `alimiter=limit=0.9,volume=0.85,atrim=0:${padDurSec},apad,atrim=0:${padDurSec}[out]" ` +
  `-map "[out]" -ac 2 -ar 44100 ${path.resolve(__dirname, 'audio.wav')}`);

console.log('audio.wav written, duration target', total);
