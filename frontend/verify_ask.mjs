import { chromium } from 'playwright';

const SHOT_DIR = '/Users/piplustheta/Documents/Github/chrimata/frontend';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
const errors = [];
page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
page.on('pageerror', err => errors.push('pageerror: ' + err.message));

await page.goto('http://localhost:3000/dashboard/ask', { waitUntil: 'networkidle' });
await page.waitForSelector('text=Ask Chrimata', { timeout: 15000 });
await page.screenshot({ path: `${SHOT_DIR}/ask-01-empty.png` });

// Click a suggestion chip (real, from actual open issues)
const chip = page.locator('button:has-text("March deck")');
if (await chip.count() === 0) {
  console.log('No suggestion chip matched "March deck" - listing available chips:');
  const chips = await page.locator('div.flex.flex-col.gap-2 button').allTextContents();
  console.log(chips);
}
await page.locator('div.flex.flex-col.gap-2.w-full.max-w-lg button').first().click();
await page.waitForTimeout(600);
await page.screenshot({ path: `${SHOT_DIR}/ask-02-searching.png` });
await page.waitForTimeout(1500);
await page.screenshot({ path: `${SHOT_DIR}/ask-03-streaming.png` });
await page.waitForSelector('button:has-text("Regenerate")', { timeout: 20000 });
await page.screenshot({ path: `${SHOT_DIR}/ask-04-done.png`, fullPage: true });

// New chat
await page.locator('button:has-text("New chat")').click();
await page.waitForTimeout(500);
await page.screenshot({ path: `${SHOT_DIR}/ask-05-newchat.png` });

// Type and send via Enter, then Stop mid-stream
await page.locator('textarea').fill('What is the cash runway?');
await page.keyboard.press('Enter');
await page.waitForTimeout(400);
const stopBtn = page.locator('button[title="Stop (Esc)"]');
await stopBtn.click();
await page.waitForTimeout(500);
await page.screenshot({ path: `${SHOT_DIR}/ask-06-stopped.png` });

// Session rename
const sessionRow = page.locator('aside div.group\\/item').first();
await sessionRow.hover();
await page.waitForTimeout(200);
await sessionRow.locator('button').first().click(); // pencil
await page.waitForTimeout(200);
await page.keyboard.press('Control+a');
await page.keyboard.type('Renamed Test Session');
await page.keyboard.press('Enter');
await page.waitForTimeout(400);
await page.screenshot({ path: `${SHOT_DIR}/ask-07-renamed.png` });

console.log('CONSOLE_ERRORS:', JSON.stringify(errors));
await browser.close();
