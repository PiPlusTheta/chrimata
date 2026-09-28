const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const WORK = __dirname;
function sh(cmd) { execSync(cmd, { stdio: 'inherit', maxBuffer: 1024 * 1024 * 64 }); }
function dur(file) {
  return parseFloat(execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 "${file}"`).toString().trim());
}

const LINES = [
  { name: 'vo0', start: 0.3 }, { name: 'vo1', start: 5.5 }, { name: 'vo2', start: 17.5 },
  { name: 'vo3', start: 27.5 }, { name: 'vo4', start: 40.0 }, { name: 'vo5', start: 52.2 },
  { name: 'vo6', start: 68.0 }, { name: 'vo7', start: 87.5 },
];

const totalDur = dur(path.join(WORK, 'boosted_audio.wav'));
const windows = LINES.map((l) => ({ ...l, end: l.start + dur(path.join(WORK, `${l.name}.wav`)) }));

// duck the music under each voice window
const duckFilters = windows.map((w) => `volume=0.32:enable='between(t\\,${w.start.toFixed(2)}\\,${w.end.toFixed(2)})'`);
const musicChain = `[0:a]${duckFilters.join(',')}[music]`;

const delayInputs = windows.map((w, i) => {
  const ms = Math.round(w.start * 1000);
  return `[${i + 1}:a]adelay=${ms}|${ms},volume=1.6[vo${i}]`;
});

const mixLabels = ['[music]', ...windows.map((_, i) => `[vo${i}]`)].join('');
const filter = `${musicChain};${delayInputs.join(';')};${mixLabels}amix=inputs=${windows.length + 1}:duration=first:normalize=0,alimiter=limit=0.95,atrim=0:${totalDur.toFixed(3)}[out]`;

const inputs = [`-i ${path.join(WORK, 'boosted_audio.wav')}`, ...windows.map((w) => `-i ${path.join(WORK, w.name + '.wav')}`)].join(' ');
const outAudio = path.join(WORK, 'final_audio.wav');
sh(`ffmpeg -y ${inputs} -filter_complex "${filter}" -map "[out]" -ac 2 -ar 44100 ${outAudio}`);

const video = path.join(WORK, 'overlaid.mp4');
const finalOut = path.resolve(WORK, '..', 'brag.mp4');
sh(`ffmpeg -y -i ${video} -i ${outAudio} -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest ${finalOut}`);
console.log('Final mixed video with voiceover ->', finalOut);
console.log('Voice windows:', windows.map((w) => `${w.name} ${w.start.toFixed(1)}-${w.end.toFixed(1)}s`).join(', '));
