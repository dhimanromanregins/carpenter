import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1800, height: 1100 } });
page.on("pageerror", (err) => console.log("[pageerror]", err.message));

await page.goto("http://localhost:5173", { waitUntil: "networkidle" });
await page.waitForTimeout(2500);

await page.evaluate(() => {
  const el = document.getElementById("showcase");
  if (el) window.scrollTo(0, el.offsetTop - 40);
});
await page.waitForTimeout(2000);

const canvas = page.locator("#showcase canvas");
const box = await canvas.boundingBox();
console.log("box:", JSON.stringify(box));

await page.locator('button[aria-label="Honey Oak"]').click();
await page.waitForTimeout(700);

const startX = box.x + box.width / 2;
const startY = box.y + box.height / 2;
await page.mouse.move(startX, startY);
await page.mouse.down();
await page.mouse.move(startX - 140, startY, { steps: 20 });
await page.mouse.up();
await page.waitForTimeout(1000);

await page.evaluate(() => {
  document.querySelectorAll("[data-capture-ui]").forEach((el) => {
    el.style.visibility = "hidden";
  });
  const cursor = document.querySelector(".mix-blend-difference");
  if (cursor) cursor.style.visibility = "hidden";
});
await page.waitForTimeout(200);

// Test A: clipped jpeg screenshot (same as the real script)
await page.screenshot({
  path: "d:/carpenter/scripts/debug-clip.jpg",
  quality: 92,
  type: "jpeg",
  clip: box,
});
console.log("saved debug-clip.jpg");

// Test B: full page png at the same moment, for comparison
await page.screenshot({ path: "d:/carpenter/scripts/debug-nofull.png" });
console.log("saved debug-nofull.png");

await browser.close();
