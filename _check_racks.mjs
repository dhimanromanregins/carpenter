import { chromium } from "playwright";

const browser = await chromium.launch({ args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1500, height: 950 } });
const errors = [];
page.on("pageerror", (err) => errors.push(err.message));
page.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text()); });

await page.goto("http://localhost:5173/kitchen-studio.html", { waitUntil: "load" });
await page.locator("#loading-veil").waitFor({ state: "hidden", timeout: 20000 });
await page.waitForTimeout(1000);

const info = await page.evaluate(() => {
  return window.__ksDebug.placed.map(p => ({ id: p.id, type: p.type, doors: (p.group.userData.doors||[]).length }));
});
console.log(JSON.stringify(info));

// Open every door on every base cabinet
const doorState = await page.evaluate(() => {
  var dbg = window.__ksDebug;
  var out = [];
  dbg.placed.filter(p => p.type === 'base').forEach(function(basePiece){
    (basePiece.group.userData.doors || []).forEach(function(d){
      dbg.toggleDoor(d);
      out.push({ id: basePiece.id, isOpen: d.userData.isOpen, axis: d.userData.axis, openRot: d.userData.openRot, pos: basePiece.group.position });
    });
  });
  return out;
});
console.log("doorState:", JSON.stringify(doorState));
await page.waitForTimeout(700);
const rotAfter = await page.evaluate(() => {
  var dbg = window.__ksDebug;
  var out = [];
  dbg.placed.filter(p => p.type === 'base').forEach(function(basePiece){
    (basePiece.group.userData.doors || []).forEach(function(d){
      out.push(d.rotation[d.userData.axis]);
    });
  });
  return out;
});
console.log("rotAfter:", JSON.stringify(rotAfter));
console.log("errors:", errors.length ? errors.join(" | ") : "(none)");

await page.screenshot({ path: "D:/carpenter/_racks-check.png" });

// Front view should look straight at the back-wall cabinet (id=1), whose door is now open.
await page.locator('.top-btn[data-view="front"]').click();
await page.waitForTimeout(400);
await page.screenshot({ path: "D:/carpenter/_racks-check-front.png" });

// Zoom in closer with scroll for a tight crop
const box = await page.locator("#canvas-holder canvas").boundingBox();
await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
for (let i = 0; i < 12; i++) {
  await page.mouse.wheel(0, -100);
  await page.waitForTimeout(30);
}
await page.waitForTimeout(300);
await page.screenshot({ path: "D:/carpenter/_racks-check-front-zoom.png" });

await browser.close();
