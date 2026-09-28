#!/bin/bash
cd /Users/piplustheta/Documents/Github/chrimata/brag-output-v2
export PATH="/Users/piplustheta/Documents/Github/chrimata/backend/venv/bin:$PATH"

# GuyNeural is very energetic, cinematic, and human-sounding. 
# We'll use SSML-like pitch and rate via Edge TTS to make it punchier if needed, but the default Neural is incredibly realistic.
VOICE="en-US-GuyNeural"

edge-tts --voice $VOICE --rate="-5%" --text "Every. Single. Decision... has a history." --write-media vo1.mp3
edge-tts --voice $VOICE --rate="+5%" --pitch="+5Hz" --text "Stop trusting outdated decks. Chrimata is the ultimate Hindsight-powered engine for financial due diligence." --write-media vo2.mp3
edge-tts --voice $VOICE --text "Command your entire deal room from one, unified, god-view dashboard." --write-media vo3.mp3
edge-tts --voice $VOICE --text "Tear down the information architecture of any deal and expose the truth." --write-media vo4.mp3
edge-tts --voice $VOICE --rate="+5%" --pitch="+2Hz" --text "Don't just believe the claims... trace every single conclusion back to the raw, undeniable evidence." --write-media vo5.mp3
edge-tts --voice $VOICE --rate="+10%" --pitch="+10Hz" --text "When new data drops? Chrimata instantly hunts down discrepancies and demands to know... What changed?!" --write-media vo6.mp3
edge-tts --voice $VOICE --text "Powered by Hindsight memory, it never forgets. It recalls past context to update reviews... automatically." --write-media vo7.mp3
edge-tts --voice $VOICE --text "Ask anything. And get answers backed by memory that survives the conversation." --write-media vo8.mp3
edge-tts --voice $VOICE --rate="-10%" --pitch="-5Hz" --text "Chrimata. Due diligence... with hindsight." --write-media vo9.mp3

# Merge the voiceover clips at the exact timestamps to match the scenes perfectly
ffmpeg -y -i vo1.mp3 -i vo2.mp3 -i vo3.mp3 -i vo4.mp3 -i vo5.mp3 -i vo6.mp3 -i vo7.mp3 -i vo8.mp3 -i vo9.mp3 \
  -filter_complex "
    [0:a]adelay=1000|1000[a0];
    [1:a]adelay=6000|6000[a1];
    [2:a]adelay=18000|18000[a2];
    [3:a]adelay=30000|30000[a3];
    [4:a]adelay=42000|42000[a4];
    [5:a]adelay=54000|54000[a5];
    [6:a]adelay=68000|68000[a6];
    [7:a]adelay=78000|78000[a7];
    [8:a]adelay=90000|90000[a8];
    [a0][a1][a2][a3][a4][a5][a6][a7][a8]amix=inputs=9:dropout_transition=0:normalize=0[aout]
  " -map "[aout]" voiceover.aac

# Merge with the video (mixing with any existing audio in brag.mp4)
ffmpeg -y -i brag.mp4 -i voiceover.aac -filter_complex "[0:a][1:a]amix=inputs=2:duration=first:dropout_transition=2:normalize=0[aout]" -map 0:v:0 -map "[aout]" -c:v copy -c:a aac -shortest brag_with_vo.mp4

echo "Voiceover added. Output saved to brag_with_vo.mp4"
