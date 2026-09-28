import json, os, subprocess, pathlib, shlex
ROOT=pathlib.Path(__file__).resolve().parents[1]
BRAG=ROOT/'brag-output-v2'
WORK=BRAG/'work'
SUB=ROOT/'submission'
PARTS=SUB/'video_parts'; PARTS.mkdir(exist_ok=True)

def run(args):
    print('+', ' '.join(map(str,args)), flush=True)
    subprocess.run(list(map(str,args)), check=True)
def probe(path):
    return float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',str(path)],text=True).strip())
# Encode generated branded title cards and live no-memory replay at 30fps.
for name in ('intro','problem','takeaway'):
    frames=(SUB/'work'/'memory_problem' if name=='problem' else SUB/'work'/'frames'/name)
    out=PARTS/f'{name}.mp4'
    fps='12.5'
    run(['ffmpeg','-y','-framerate',fps,'-i',frames/'f%05d.png','-vf','fps=30,format=yuv420p','-c:v','libx264','-crf','16','-preset','veryfast','-an',out])
# Keep the original opening and walkthrough after your intro; place the
# no-memory comparison after Hindsight and before Ask/Architecture.
timeline=json.loads((WORK/'architecture_timeline.json').read_text())
scenes=timeline['scenes']
problem_split=next(s['start'] for s in scenes if s['name']=='s09_ask')
opening_scenes=[s for s in scenes if s['start']<problem_split]
main_scenes=[s for s in scenes if s['start']>=problem_split and s['name']!='s12_close']
opening_list=PARTS/'original-opening.txt'
opening_list.write_text(''.join("file '"+s['clip'].replace("'","'\\''")+"'\n" for s in opening_scenes))
opening=PARTS/'original-opening.mp4'
run(['ffmpeg','-y','-f','concat','-safe','0','-i',opening_list,'-c','copy',opening])
main_list=PARTS/'original-main.txt'
main_list.write_text(''.join("file '"+s['clip'].replace("'","'\\''")+"'\n" for s in main_scenes))
original=PARTS/'original-main.mp4'
run(['ffmpeg','-y','-f','concat','-safe','0','-i',main_list,'-c','copy',original])
close=pathlib.Path(scenes[-1]['clip'])
order=[PARTS/'intro.mp4',opening,PARTS/'problem.mp4',original,PARTS/'takeaway.mp4',close]
concat=PARTS/'picture-concat.txt'
concat.write_text(''.join("file '"+str(p).replace("'","'\\''")+"'\n" for p in order))
picture=PARTS/'submission-picture.mp4'
# Re-encode once to normalize timestamps and picture stream parameters at hard scene transitions.
run(['ffmpeg','-y','-f','concat','-safe','0','-i',concat,'-an','-c:v','libx264','-preset','slow','-crf','17','-pix_fmt','yuv420p','-r','30','-movflags','+faststart',picture])
# Schedule scene-bound voice clips. Original vo01/02 belong to removed splash/landing visuals.
video_durations=[probe(p) for p in order]
intro_dur,opening_dur,problem_dur,main_dur,takeaway_dur,close_dur=video_durations
intro_start=0.5
problem_start=intro_dur+opening_dur+0.45
main_start=intro_dur+opening_dur+problem_dur
main_offset=main_start-problem_split
# Original vo01–vo05 accompany the opening pages; later segments follow the resumed walkthrough.
segments=json.loads((WORK/'voiceover_segments.json').read_text())
selected=[]
for seg in segments:
    sid=seg['id']
    if sid in ('vo_intro','vo_problem','vo_takeaway'):
        continue
    if float(seg['start'])<problem_split:
        when=float(seg['start'])+intro_dur
    else:
        when=float(seg['start'])+main_offset
    if sid=='vo11_close':
        when=main_start+main_dur+takeaway_dur+(float(seg['start'])-(timeline['total']-close_dur))
    selected.append((sid,when))
selected += [('vo_intro',intro_start),('vo_problem',problem_start),('vo_takeaway',main_start+main_dur+0.5)]
# Generate one continuous audio stream: welcoming bed, auto-ducked beneath all voice segments.
duration=sum(video_durations)
music_bed=PARTS/'welcoming-music-bed.wav'
if not music_bed.exists():
    run(['ffmpeg','-y','-i',WORK/'welcoming_music.mp3','-i',WORK/'welcoming_music.mp3','-i',WORK/'welcoming_music.mp3',
         '-filter_complex',f'[0:a][1:a]acrossfade=d=4:c1=tri:c2=tri[x];[x][2:a]acrossfade=d=4:c1=tri:c2=tri,atrim=0:{duration:.3f},asetpts=PTS-STARTPTS[out]',
         '-map','[out]','-ar','44100','-ac','2',music_bed])
inputs=[music_bed]+[WORK/f'{sid}.mp3' for sid,_ in selected]
args=['ffmpeg','-y','-i',inputs[0]]
for p in inputs[1:]: args+=['-i',p]
filters=[f'[0:a]volume=0.23,atrim=0:{duration:.3f}[bg]']
labels=[]
for ix,(sid,when) in enumerate(selected,1):
    delay=round(when*1000)
    label=f'v{ix}'
    filters.append(f'[{ix}:a]volume=1.08,adelay={delay}|{delay}[{label}]')
    labels.append(f'[{label}]')
filters.append(''.join(labels)+f'amix=inputs={len(labels)}:duration=longest:normalize=0,apad,atrim=0:{duration:.3f},asplit=3[voice_duck][voice_mix][voice_export]')
filters.append('[bg][voice_duck]sidechaincompress=threshold=0.018:ratio=9:attack=18:release=420[ducked]')
filters.append(f'[ducked][voice_mix]amix=inputs=2:duration=first:normalize=0,alimiter=limit=0.93,afade=t=in:st=0:d=1.2,afade=t=out:st={max(0,duration-1.8):.3f}:d=1.8[a]')
audio=PARTS/'submission-audio.m4a'
voice_only=BRAG/'brag_submission_voiceover.mp3'
args+=['-filter_complex',';'.join(filters),'-map','[a]','-t',f'{duration:.3f}','-c:a','aac','-b:a','192k','-movflags','+faststart',audio]
args+=['-map','[voice_export]','-t',f'{duration:.3f}','-c:a','libmp3lame','-b:a','192k',voice_only]
run(args)
out=BRAG/'brag_submission.mp4'
run(['ffmpeg','-y','-i',picture,'-i',audio,'-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','copy','-shortest','-movflags','+faststart',out])
print('\nVIDEO PARTS')
for p,d in zip(order,video_durations): print(f'{p.name}: {d:.3f}s')
print(f'TOTAL: {sum(video_durations):.3f}s ({sum(video_durations)/60:.2f} min)')
print('VOICE STARTS')
for sid,t in selected: print(f'{sid}: {t:.2f}s')
print('OUT:',out)
