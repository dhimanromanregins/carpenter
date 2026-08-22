import { chromium } from "playwright";
import fs from "node:fs";

const OUT_DIR = "d:/carpenter/src/assets/projects";
fs.mkdirSync(OUT_DIR, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1800, height: 1100 }, deviceScaleFactor: 1.5 });

page.on("pageerror", (err) => console.log("pageerror:", err.message));

await page.goto("http://localhost:5173", { waitUntil: "networkidle" });
await page.waitForTimeout(2500);

await page.evaluate(() => {
  const el = document.getElementById("showcase");
  if (el) window.scrollTo(0, el.offsetTop - 40);
});

// wait for Lenis smooth-scroll easing to fully settle
let lastY = -1;
for (let i = 0; i < 20; i++) {
  await page.waitForTimeout(150);
  const y = await page.evaluate(() => window.scrollY);
  if (Math.abs(y - lastY) < 0.5) break;
  lastY = y;
}

async function hideOverlays(hide) {
  await page.evaluate((h) => {
    document.querySelectorAll("[data-capture-ui]").forEach((el) => {
      el.style.visibility = h ? "hidden" : "visible";
    });
    const cursor = document.querySelector(".mix-blend-difference");
    if (cursor) cursor.style.visibility = h ? "hidden" : "visible";
  }, hide);
}

const canvas = page.locator("#showcase canvas");
await canvas.waitFor({ state: "visible" });
const box = await canvas.boundingBox();
if (!box) throw new Error("canvas not found");

async function dragRotate(deltaX) {
  const startX = box.x + box.width / 2;
  const startY = box.y + box.height / 2;
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(startX + deltaX, startY, { steps: 20 });
  await page.mouse.up();
  await page.waitForTimeout(1000);
}

async function setFinish(label) {
  await page.locator(`button[aria-label="${label}"]`).click({ force: true });
  await page.waitForTimeout(700);
}

const shots = [
  { file: "p1-kitchen.jpg", finish: "Honey Oak", rotate: -140 },
  { file: "p2-wardrobe.jpg", finish: "Walnut", rotate: 60 },
  { file: "p3-living.jpg", finish: "Ivory Ash", rotate: -60 },
  { file: "p4-bedroom.jpg", finish: "Honey Oak", rotate: 120 },
  { file: "p5-office.jpg", finish: "Espresso", rotate: -20 },
  { file: "p6-kitchen-dark.jpg", finish: "Espresso", rotate: -220 },
];

for (const shot of shots) {
  await hideOverlays(false);
  await setFinish(shot.finish);
  await dragRotate(shot.rotate);
  await page.waitForTimeout(500);
  await hideOverlays(true);
  await page.waitForTimeout(100);
  await page.screenshot({
    path: `${OUT_DIR}/${shot.file}`,
    quality: 92,
    type: "jpeg",
    clip: box,
  });
  console.log("saved", shot.file);
}

await browser.close();
