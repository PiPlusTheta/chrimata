const puppeteer=require('../brag-output-v2/work/node_modules/puppeteer');
const fs=require('fs'),path=require('path');
const root=__dirname,work=path.join(root,'work','frames');fs.mkdirSync(work,{recursive:true});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function render(name,seconds=31.52){
 const dir=path.join(work,name);fs.mkdirSync(dir,{recursive:true});for(const f of fs.readdirSync(dir))fs.unlinkSync(path.join(dir,f));
 const browser=await puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-setuid-sandbox','--force-device-scale-factor=1']});
 const page=await browser.newPage();await page.setViewport({width:1920,height:1080,deviceScaleFactor:1});
 await page.goto(`file://${path.join(root,name+'.html')}`,{waitUntil:'networkidle0'});
 await page.evaluate(()=>Promise.all([...document.images].map(i=>i.decode().catch(()=>{}))));
 const fps=12.5,count=Math.round(seconds*fps),start=Date.now();
 for(let i=0;i<count;i++){
  await page.screenshot({path:path.join(dir,`f${String(i).padStart(5,'0')}.png`)});
  const target=start+(i+1)*1000/fps;await sleep(Math.max(0,target-Date.now()));
 }
 await browser.close();console.log(`${name}: ${count} frames, ${(count/fps).toFixed(2)}s`);
}
(async()=>{
 const browser=await puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-setuid-sandbox','--force-device-scale-factor=1']});
 const page=await browser.newPage();await page.setViewport({width:1600,height:900,deviceScaleFactor:1});
 await page.goto(`file://${path.join(root,'assets','architecture-diagram.svg')}`,{waitUntil:'networkidle0'});
 await page.screenshot({path:path.join(root,'assets','architecture-diagram.png')});await browser.close();
 await render('intro');await render('takeaway',30.0);
})().catch(e=>{console.error(e.message);process.exit(1)});
