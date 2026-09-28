#!/bin/bash
cd /Users/piplustheta/Documents/Github/chrimata/brag-output/work

# Generate audio files for each line using a professional-sounding voice (e.g., Alex or Samantha or Daniel)
VOICE="Daniel"

say -v $VOICE "Every decision has a history. Welcome to Chrimata." -o vo1.aiff
say -v $VOICE "Chrimata is a Hindsight-powered financial due diligence tool that preserves source evidence." -o vo2.aiff
say -v $VOICE "Track all diligence in one unified deal room." -o vo3.aiff
say -v $VOICE "Investigate the underlying information architecture of any deal." -o vo4.aiff
say -v $VOICE "Trace every conclusion back to raw evidence, like actual ledger data." -o vo5.aiff
say -v $VOICE "When new data arrives, Chrimata instantly tracks discrepancies and asks: What changed?" -o vo6.aiff
say -v $VOICE "Thanks to Hindsight memory, it recalls past context to update its review automatically." -o vo7.aiff
say -v $VOICE "Ask questions with context, knowing your memory survives the conversation." -o vo8.aiff
say -v $VOICE "Chrimata. Due diligence with hindsight." -o vo9.aiff

# Use ffmpeg to place them at specific times
ffmpeg -y -i vo1.aiff -i vo2.aiff -i vo3.aiff -i vo4.aiff -i vo5.aiff -i vo6.aiff -i vo7.aiff -i vo8.aiff -i vo9.aiff \
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

# Merge with the video
ffmpeg -y -i ../brag.mp4 -i voiceover.aac -c:v copy -c:a aac -map 0:v:0 -map 1:a:0 -shortest ../brag_with_vo.mp4

echo "Voiceover added. Output saved to brag_with_vo.mp4"
