import json, os, re, sys, time
from pathlib import Path
import requests

ROOT = Path(__file__).resolve().parents[2]
ENV_FILE = ROOT / 'backend' / '.env'
WORK = Path(__file__).resolve().parent
segments = json.loads((WORK / 'voiceover_segments.json').read_text())
if len(sys.argv) > 1:
    requested = set(sys.argv[1:])
    segments = [segment for segment in segments if segment['id'] in requested]
api_key = os.environ.get('ELEVENLABS_API_KEY')
if not api_key:
    for line in ENV_FILE.read_text().splitlines():
        m = re.match(r'\s*ELEVENLABS_API_KEY\s*=\s*(.*?)\s*$', line)
        if m:
            api_key = m.group(1).strip().strip('"\'')
            break
if not api_key:
    raise SystemExit('ElevenLabs credential is not configured.')
voice_id = 'IKne3meq5aSn9XLyUdCD'  # Charlie: deep, confident, energetic
url = f'https://api.elevenlabs.io/v1/text-to-speech/{voice_id}?output_format=mp3_44100_128'
headers = {'xi-api-key': api_key, 'Content-Type': 'application/json'}
for segment in segments:
    target = WORK / f"{segment['id']}.mp3"
    if target.exists():
        target.unlink()
    text = f"{segment['emotion']} {segment['text']}"
    response = requests.post(url, headers=headers, json={
        'text': text,
        'model_id': 'eleven_v3',
        'apply_text_normalization': 'on',
    }, timeout=90)
    if not response.ok:
        raise SystemExit(f"ElevenLabs rejected {segment['id']} (HTTP {response.status_code}); response body withheld.")
    if not response.headers.get('content-type', '').startswith('audio/'):
        raise SystemExit(f"ElevenLabs returned a non-audio response for {segment['id']}.")
    target.write_bytes(response.content)
    print(f"Generated {segment['id']} ({len(response.content)} bytes).")
    time.sleep(0.25)
