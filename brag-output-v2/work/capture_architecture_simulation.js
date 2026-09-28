const puppeteer=require('puppeteer'),fs=require('fs'),path=require('path');
const out=path.join(__dirname,'frames','architecture_simulation');fs.mkdirSync(out,{recursive:true});
for(const f of fs.readdirSync(out))fs.unlinkSync(path.join(out,f));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
const cursor=`(()=>{const s=document.createElement('style');s.textContent='#__cur{position:fixed;z-index:2147483647;width:22px;height:22px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#E5C79E,#C5A880 55%,#8A7456);box-shadow:0 0 14px 3px rgba(197,168,128,.55),0 2px 6px rgba(0,0,0,.6);border:1.5px solid rgba(7,12,20,.6);pointer-events:none;transform:translate(-50%,-50%);left:-100px;top:-100px}#__cur.down{transform:translate(-50%,-50%) scale(.62)}';document.head.appendChild(s);let e=document.createElement('div');e.id='__cur';document.body.appendChild(e);window.__cur=(x,y,d)=>{e.style.left=x+'px';e.style.top=y+'px';e.classList.toggle('down',!!d)}})()`;
(async()=>{
 const b=await puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-setuid-sandbox','--force-device-scale-factor=1']});
 const p=await b.newPage();await p.setViewport({width:1920,height:1080,deviceScaleFactor:1});
 await p.goto('http://localhost:3000/dashboard/architecture',{waitUntil:'networkidle0'});await sleep(700);await p.evaluate(cursor);
 let x=960,y=540,i=0;const fps=12.5,start=Date.now();let recording=true;
 const rec=(async()=>{while(recording){const target=start+i*1000/fps;await p.screenshot({path:path.join(out,`f${String(i++).padStart(5,'0')}.png`)});await sleep(Math.max(0,target+1000/fps-Date.now()))}})();
 const box=await p.evaluate(()=>{const e=[...document.querySelectorAll('button')].find(x=>x.innerText.includes('Simulate Analyst Workflow'));if(!e)return null;const r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}});
 if(!box)throw new Error('Simulation control is missing.');
 await sleep(850);
 const n=14;for(let j=1;j<=n;j++){let t=ease(j/n);x=960+(box.x-960)*t;y=540+(box.y-540)*t;await p.mouse.move(x,y);await p.evaluate(([a,c])=>window.__cur?.(a,c,false),[x,y]);await sleep(55)}
 await p.evaluate(([a,c])=>window.__cur?.(a,c,true),[box.x,box.y]);await p.mouse.click(box.x,box.y);await sleep(100);await p.evaluate(([a,c])=>window.__cur?.(a,c,false),[box.x,box.y]);
 await sleep(20000);recording=false;await rec;await b.close();
 console.log(`Captured ${i} frames (${(i/fps).toFixed(2)}s); Simulation clicked and ran.`);
})().catch(e=>{console.error(e.message);process.exit(1)});
