const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE = 'http://localhost:3000';
const FRAMES = path.resolve(__dirname, 'frames');
const MANIFEST = path.resolve(__dirname, 'manifest.json');
const manifest = [];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

function newScene(name) {
  const dir = path.join(FRAMES, name);
  fs.mkdirSync(dir, { recursive: true });
  return { dir, i: 0, name };
}
async function shoot(page, ctx) {
  await page.screenshot({ path: path.join(ctx.dir, `f${String(ctx.i++).padStart(5, '0')}.png`) });
}
function finish(ctx, fps = 12.5) {
  manifest.push({ name: ctx.name, frames: ctx.i, fps, seconds: +(ctx.i / fps).toFixed(2) });
  console.log(`[${ctx.name}] ${ctx.i} frames (~${(ctx.i / fps).toFixed(1)}s)`);
}

const CURSOR_INIT = `
(function(){
  function ensure(){
    if (document.getElementById('__cur')) return;
    var s = document.createElement('style');
    s.textContent = '#__cur{position:fixed;z-index:2147483647;width:22px;height:22px;border-radius:50%;' +
      'background:radial-gradient(circle at 35% 35%, #E5C79E, #C5A880 55%, #8A7456);' +
      'box-shadow:0 0 14px 3px rgba(197,168,128,.55),0 2px 6px rgba(0,0,0,.6);' +
      'border:1.5px solid rgba(7,12,20,.6);pointer-events:none;transform:translate(-50%,-50%) scale(1);' +
      'transition:transform 90ms ease-out;left:-100px;top:-100px}' +
      '#__cur.click{transform:translate(-50%,-50%) scale(0.62)}';
    document.head.appendChild(s);
    var el = document.createElement('div');
    el.id = '__cur';
    document.body.appendChild(el);
  }
  if (document.body) ensure(); else document.addEventListener('DOMContentLoaded', ensure);
  window.__curTo = function(x,y){ ensure(); var el=document.getElementById('__cur'); if(el){el.style.left=x+'px';el.style.top=y+'px';} };
  window.__curClick = function(down){ var el=document.getElementById('__cur'); if(el) el.classList.toggle('click', !!down); };
})();
`;

async function curTo(page, x, y) { try { await page.evaluate((x, y) => window.__curTo && window.__curTo(x, y), x, y); } catch (e) {} }
async function curClick(page, down) { try { await page.evaluate((d) => window.__curClick && window.__curClick(d), down); } catch (e) {} }

async function moveCursor(page, ctx, x1, y1, x2, y2, seconds = 0.6, fps = 18) {
  const steps = Math.max(2, Math.round(seconds * fps));
  for (let s = 1; s <= steps; s++) {
    const t = ease(s / steps);
    const x = x1 + (x2 - x1) * t;
    const y = y1 + (y2 - y1) * t;
    await page.mouse.move(x, y);
    await curTo(page, x, y);
    await shoot(page, ctx);
    await sleep(1000 / fps);
  }
  return [x2, y2];
}

async function hold(page, ctx, seconds, fps = 10) {
  const n = Math.max(1, Math.round(seconds * fps));
  for (let i = 0; i < n; i++) { await shoot(page, ctx); await sleep(1000 / fps); }
}

async function clickAt(page, ctx, x, y) {
  await curClick(page, true);
  await page.mouse.move(x, y);
  await page.mouse.down();
  await shoot(page, ctx); await sleep(70); await shoot(page, ctx);
  await page.mouse.up();
  await curClick(page, false);
  await sleep(80);
  await shoot(page, ctx);
}

async function typeText(page, ctx, text, cps = 13) {
  for (const ch of text) {
    await page.keyboard.type(ch, { delay: 0 });
    await shoot(page, ctx);
    await sleep(1000 / cps);
  }
}

async function scrollBy(page, ctx, deltaY, seconds = 1.0, fps = 15) {
  const steps = Math.max(2, Math.round(seconds * fps));
  let last = 0;
  for (let s = 1; s <= steps; s++) {
    const t = ease(s / steps);
    const target = deltaY * t;
    const inc = target - last;
    last = target;
    await page.evaluate((dy) => window.scrollBy(0, dy), inc);
    await shoot(page, ctx);
    await sleep(1000 / fps);
  }
}

async function bboxByText(page, text, tagFilter = '*') {
  try {
    const handle = await page.evaluateHandle((text, tagFilter) => {
      const q = JSON.stringify(text);
      const walker = document.evaluate(
        `.//${tagFilter}[contains(normalize-space(string(.)), ${q}) or contains(@placeholder, ${q}) or contains(@value, ${q}) or contains(@aria-label, ${q})]`,
        document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null
      );
      let best = null, bestLen = Infinity;
      for (let i = 0; i < walker.snapshotLength; i++) {
        const el = walker.snapshotItem(i);
        const len = el.textContent.length;
        if (len < bestLen) { bestLen = len; best = el; }
      }
      return best;
    }, text, tagFilter);
    const el = handle.asElement();
    if (!el) return null;
    await page.evaluate((el) => el.scrollIntoView({ block: 'center', inline: 'center' }), el);
    await sleep(250);
    const box = await el.boundingBox();
    if (box && (box.y < 0 || box.y > 1080 || box.x < 0 || box.x > 1920)) return null;
    return box;
  } catch (e) { return null; }
}
function center(box) { return [box.x + box.width / 2, box.y + box.height / 2]; }

async function waitAndCapture(page, ctx, checkFn, maxSeconds, fps = 6) {
  const n = Math.max(1, Math.round(maxSeconds * fps));
  for (let i = 0; i < n; i++) {
    await shoot(page, ctx);
    try { if (await checkFn(page)) break; } catch (e) {}
    await sleep(1000 / fps);
  }
}

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox', '--force-device-scale-factor=1'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
  await page.evaluateOnNewDocument(CURSOR_INIT);

  let cx = 960, cy = 540; // virtual cursor position tracker

  // -------- SCENE 02: LANDING --------
  {
    if (process.env.SKIP_INTRO) { manifest.push({ name: 's02_landing', frames: 0, fps: 12.5, seconds: 0, skipped: true }); }
    else {
    const ctx = newScene('s02_landing');
    await page.goto(BASE + '/', { waitUntil: 'networkidle0' });
    await sleep(600);
    await hold(page, ctx, 1.2, 10);
    [cx, cy] = await moveCursor(page, ctx, cx, cy, 1400, 640, 0.8);
    await scrollBy(page, ctx, 780, 1.1, 15);
    await hold(page, ctx, 1.6, 10);
    [cx, cy] = await moveCursor(page, ctx, cx, cy, 900, 700, 0.6);
    await scrollBy(page, ctx, 900, 1.0, 15);
    await hold(page, ctx, 1.4, 10);
    await scrollBy(page, ctx, 700, 0.9, 15);
    await hold(page, ctx, 1.2, 10);
    finish(ctx);
    }
  }

  // -------- SCENE 03: ENTER PLATFORM --------
  if (process.env.SKIP_INTRO) {
    manifest.push({ name: 's03_enter', frames: 0, fps: 12.5, seconds: 0, skipped: true });
    await page.goto(BASE + '/dashboard', { waitUntil: 'networkidle0' });
    await sleep(500);
  } else {
    const ctx = newScene('s03_enter');
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await sleep(300);
    await hold(page, ctx, 0.4, 10);
    const box = await bboxByText(page, 'Inspect Verification Terminal', 'a');
    if (box) {
      const [tx, ty] = center(box);
      [cx, cy] = await moveCursor(page, ctx, cx, cy, tx, ty, 0.9);
      await hold(page, ctx, 0.4, 12);
      await clickAt(page, ctx, tx, ty);
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 15000 }).catch(() => {}),
      ]);
    } else {
      await page.goto(BASE + '/dashboard', { waitUntil: 'networkidle0' });
    }
    await sleep(700);
    await hold(page, ctx, 0.6, 10);
    if (!page.url().includes('/dashboard')) {
      await page.goto(BASE + '/dashboard', { waitUntil: 'networkidle0' });
      await sleep(500);
    }
    finish(ctx);
    cx = 960; cy = 540;
  }

  // -------- SCENE 04: DASHBOARD OVERVIEW --------
  {
    const ctx = newScene('s04_dashboard');
    await hold(page, ctx, 1.0, 10);
    [cx, cy] = await moveCursor(page, ctx, cx, cy, 500, 420, 0.7);
    await hold(page, ctx, 0.3, 10);
    // Northstar Ops is the one deal with the deterministic, hand-authored diligence
    // scenario (README dataset); other cards are randomly-seeded filler companies.
    // We target it explicitly and re-confirm after navigation since the portfolio
    // grid re-flows during its entrance stagger animation.
    const box = await bboxByText(page, 'Northstar Ops', 'h2');
    let tx = 960, ty = 500;
    if (box) { [tx, ty] = center(box); }
    [cx, cy] = await moveCursor(page, ctx, cx, cy, tx, ty, 0.8);
    await hold(page, ctx, 0.8, 12);
    // re-measure right before clicking: framer-motion's staggered card entrance can
    // still be shifting layout for a few hundred ms after the initial measurement.
    const box2 = await bboxByText(page, 'Northstar Ops', 'h2');
    if (box2) { [tx, ty] = center(box2); await curTo(page, tx, ty); }
    await clickAt(page, ctx, tx, ty);
    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 15000 }).catch(() => {});
    await sleep(600);
    if (!page.url().includes('/northstar/')) {
      await page.goto(BASE + '/dashboard/northstar/queue', { waitUntil: 'networkidle0' });
      await sleep(500);
    }
    await hold(page, ctx, 0.6, 10);
    finish(ctx);
    cx = tx; cy = ty;
  }

  // -------- SCENE 05: QUEUE --------
  {
    const ctx = newScene('s05_queue');
    await hold(page, ctx, 1.0, 10);
    const stat = await bboxByText(page, 'Live Annualised ARR', 'div');
    if (stat) { const [tx, ty] = center(stat); [cx, cy] = await moveCursor(page, ctx, cx, cy, tx, ty, 0.7); await hold(page, ctx, 0.8, 10); }
    const issue = await bboxByText(page, 'March deck states', 'p');
    if (issue) { const [tx, ty] = center(issue); [cx, cy] = await moveCursor(page, ctx, cx, cy, tx, ty, 0.7); await hold(page, ctx, 1.2, 10); }
    await scrollBy(page, ctx, 420, 0.8, 14);
    await hold(page, ctx, 0.8, 10);
    finish(ctx);
  }

  // -------- SCENE 06: DILIGENCE / EVIDENCE --------
  {
    const ctx = newScene('s06_diligence');
    const nav = await bboxByText(page, 'Diligence Matrix', 'a');
    if (nav) {
      const [tx, ty] = center(nav);
      [cx, cy] = await moveCursor(page, ctx, cx, cy, tx, ty, 0.7);
      await clickAt(page, ctx, tx, ty);
      await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 15000 }).catch(() => {});
    }
    await sleep(700);
    await hold(page, ctx, 1.0, 10);
    // expand a metric card
    const metric = await bboxByText(page, 'live annualised arr', 'div');
    if (metric) {
      const [tx, ty] = center(metric);
      [cx, cy] = await moveCursor(page, ctx, cx, cy, tx, ty, 0.6);
      await clickAt(page, ctx, tx, ty);
      await hold(page, ctx, 1.2, 10);
      const src = await bboxByText(page, 'northstar-doc-ledger-apr', 'button');
      if (src) {
        const [sx, sy] = center(src);
        [cx, cy] = await moveCursor(page, ctx, cx, cy, sx, sy, 0.6);
        await clickAt(page, ctx, sx, sy);
        await hold(page, ctx, 1.6, 10);
        const close = await bboxByText(page, 'Close', 'button').catch(() => null);
        await page.mouse.click(1650, 260);
        await hold(page, ctx, 0.4, 10);
      }
    }
    // scroll to claimed vs calculated bar chart
    await scrollBy(page, ctx, 420, 0.8, 14);
    await hold(page, ctx, 1.4, 10);
    // scroll to issue card, open an evidence chip
    await scrollBy(page, ctx, 380, 0.8, 14);
    const chip = await bboxByText(page, 'against:', 'button');
    if (chip) {
      const [tx, ty] = center(chip);
      [cx, cy] = await moveCursor(page, ctx, cx, cy, tx, ty, 0.6);
      await clickAt(page, ctx, tx, ty);
      await hold(page, ctx, 1.4, 10);
      await page.mouse.click(1650, 260);
      await hold(page, ctx, 0.4, 10);
    }
    finish(ctx);
  }

  // -------- SCENE 07: WHAT CHANGED --------
  {
    const ctx = newScene('s07_whatchanged');
    const btn = await bboxByText(page, 'Add July Evidence', 'button');
    if (btn) {
      const [tx, ty] = center(btn);
      [cx, cy] = await moveCursor(page, ctx, cx, cy, tx, ty, 0.7);
      await clickAt(page, ctx, tx, ty);
      await waitAndCapture(page, ctx, async (p) => {
        return await p.evaluate(() => document.body.innerText.includes("What Changed"));
      }, 14, 6);
    }
    await scrollBy(page, ctx, 500, 0.9, 14);
    // hover the newly-added July document row to reveal its "Analyze Impact" action,
    // then trigger the AI-authored change review that populates Investigation History.
    const julyRow = await bboxByText(page, 'Investor Update', 'div');
    if (julyRow) {
      const [rx, ry] = center(julyRow);
      [cx, cy] = await moveCursor(page, ctx, cx, cy, rx, ry, 0.6);
      await hold(page, ctx, 0.4, 10);
      const analyze = await bboxByText(page, 'Analyze Impact', 'button');
      if (analyze) {
        const [ax, ay] = center(analyze);
        [cx, cy] = await moveCursor(page, ctx, cx, cy, ax, ay, 0.4);
        await clickAt(page, ctx, ax, ay);
        await waitAndCapture(page, ctx, async (p) => p.evaluate(() => document.body.innerText.includes('Investigation History')), 16, 5);
      }
    }
    const panel = await bboxByText(page, 'Investigation History', 'h2');
    if (panel && panel.y > 760) {
      await scrollBy(page, ctx, panel.y - 300, 0.7, 12);
    }
    await hold(page, ctx, 2.4, 10);
    finish(ctx);
  }

  // -------- SCENE 08: HINDSIGHT MEMORY --------
  {
    const ctx = newScene('s08_hindsight');
    // scroll up to Analyst Judgment form on the open issue
    const judgment = await bboxByText(page, 'Analyst Judgment', 'h4');
    if (judgment) {
      await page.evaluate(() => window.scrollBy(0, -1));
    }
    await scrollBy(page, ctx, -260, 0.7, 12);
    await hold(page, ctx, 0.6, 10);
    const input = await bboxByText(page, 'Explanation...', 'input');
    if (input) {
      const [tx, ty] = center(input);
      [cx, cy] = await moveCursor(page, ctx, cx, cy, tx, ty, 0.6);
      await clickAt(page, ctx, tx, ty);
      await typeText(page, ctx, 'Confirmed with founder: deck combined signed pipeline with active revenue.', 16);
    }
    const save = await bboxByText(page, 'Save', 'button');
    if (save) {
      const [tx, ty] = center(save);
      [cx, cy] = await moveCursor(page, ctx, cx, cy, tx, ty, 0.6);
      await clickAt(page, ctx, tx, ty);
      await waitAndCapture(page, ctx, async (p) => p.evaluate(() => document.body.innerText.includes('Decision Receipt')), 10, 6);
    }
    await hold(page, ctx, 1.0, 10);
    const replay = await bboxByText(page, 'Test Memory Replay', 'button');
    if (replay) {
      const [tx, ty] = center(replay);
      [cx, cy] = await moveCursor(page, ctx, cx, cy, tx, ty, 0.6);
      await clickAt(page, ctx, tx, ty);
      await waitAndCapture(page, ctx, async (p) => p.evaluate(() => document.body.innerText.includes('Without memory')), 10, 6);
    }
    await hold(page, ctx, 2.2, 10);
    finish(ctx);
  }

  // -------- SCENE 09: ASK CHRIMATA --------
  {
    const ctx = newScene('s09_ask');
    const nav = await bboxByText(page, 'Ask Chrimata', 'a');
    if (nav) {
      const [tx, ty] = center(nav);
      [cx, cy] = await moveCursor(page, ctx, cx, cy, tx, ty, 0.6);
      await clickAt(page, ctx, tx, ty);
      await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 15000 }).catch(() => {});
    }
    await sleep(700);
    await hold(page, ctx, 1.4, 10);
    const box = await page.$('textarea');
    if (box) {
      const bb = await box.boundingBox();
      const [tx, ty] = center(bb);
      [cx, cy] = await moveCursor(page, ctx, cx, cy, tx, ty, 0.6);
      await clickAt(page, ctx, tx, ty);
      await typeText(page, ctx, 'What changed since my last review, and which evidence should I reconsider?', 15);
      await hold(page, ctx, 0.5, 10);
      await page.keyboard.press('Enter');
      await waitAndCapture(page, ctx, async (p) => p.evaluate(() => {
        const t = document.body.innerText;
        return t.includes('verify against cited source') || t.includes('AI interpretation');
      }), 40, 5);
    }
    await hold(page, ctx, 1.8, 10);
    const details = await page.$('details');
    if (details) {
      const bb = await details.boundingBox();
      if (bb) {
        const [tx, ty] = center(bb);
        [cx, cy] = await moveCursor(page, ctx, cx, cy, tx, ty, 0.6);
        await clickAt(page, ctx, tx, ty);
        await hold(page, ctx, 1.6, 10);
      }
    }
    finish(ctx);
  }

  // -------- SCENE 10: PLATFORM BREADTH --------
  {
    const ctx = newScene('s10_breadth');
    const nav = await bboxByText(page, 'Evidence Vault', 'a');
    if (nav) {
      const [tx, ty] = center(nav);
      [cx, cy] = await moveCursor(page, ctx, cx, cy, tx, ty, 0.5);
      await clickAt(page, ctx, tx, ty);
      await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 15000 }).catch(() => {});
    }
    await sleep(500);
    await hold(page, ctx, 0.8, 10);
    const doc = await bboxByText(page, 'Open', 'button');
    const link = doc || await bboxByText(page, 'northstar-doc', 'div');
    if (link) {
      const [tx, ty] = center(link);
      [cx, cy] = await moveCursor(page, ctx, cx, cy, tx, ty, 0.5);
      await clickAt(page, ctx, tx, ty);
      await hold(page, ctx, 1.4, 10);
    }
    finish(ctx);
  }

  // -------- SCENE 11: RETURN TO BIG PICTURE --------
  {
    const ctx = newScene('s11_return');
    await page.goto(BASE + '/dashboard', { waitUntil: 'networkidle0' });
    await sleep(700);
    await hold(page, ctx, 2.2, 10);
    finish(ctx);
  }

  await browser.close();
  fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));
  console.log('DONE. Manifest written to', MANIFEST);
})();
