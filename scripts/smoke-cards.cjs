// Quick headless smoke test for both sites. Run with:
//   node scripts/smoke-cards.cjs
// Loads the city listing page on each port, reports the H1 + any console
// or page errors. Useful after editing BusinessCard.tsx or related.

const puppeteer = require("puppeteer");

async function check(port, label, path) {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(`console: ${m.text()}`);
    });

    await page.goto(`http://127.0.0.1:${port}${path}`, {
      waitUntil: "networkidle2",
      timeout: 30000,
    });
    await new Promise((r) => setTimeout(r, 2000));

    const title = await page.title();
    const h1 = await page
      .$eval("h1", (el) => el.innerText)
      .catch(() => "(no h1)");
    const wanted = await page
      .evaluate(() => {
        const els = Array.from(document.querySelectorAll("p"));
        const hit = els.find((e) => /^WANTED$/i.test(e.textContent || ""));
        return hit ? hit.textContent : null;
      })
      .catch(() => null);

    console.log(`\n=== ${label} :${port}${path} ===`);
    console.log(`title:  ${title}`);
    console.log(`h1:     ${h1.replace(/\n/g, " | ").slice(0, 200)}`);
    console.log(`WANTED: ${wanted ?? "(not rendered yet)"}`);
    if (errors.length) {
      console.log("--- errors ---");
      errors.slice(0, 5).forEach((e) => console.log(e.slice(0, 240)));
    } else {
      console.log("no errors");
    }
  } catch (e) {
    console.log(`${label} failed: ${e.message}`);
  } finally {
    await browser.close();
  }
}

(async () => {
  await check(3000, "UK home", "/");
  await check(3000, "UK city", "/emergency-plumber/manchester");
  await check(3001, "US home", "/");
  await check(3001, "US city", "/emergency-plumber/dallas");
})();
