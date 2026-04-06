const puppeteer = require('puppeteer');

(async () => {
    try {
        console.log("Launching browser...");
        const browser = await puppeteer.launch({ headless: "new" });
        const page = await browser.newPage();
        
        // Capture console messages
        page.on('console', msg => console.log('PAGE LOG:', msg.text()));
        page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
        page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure()?.errorText));

        console.log("Navigating to http://localhost:3000/blog");
        const response = await page.goto('http://localhost:3000/blog', { waitUntil: 'networkidle2', timeout: 15000 });
        console.log("HTTP Status:", response ? response.status() : 'Unknown');
        
        await page.screenshot({ path: 'tmp/debug_blog.png' });
        console.log("Screenshot saved.");
        
        await browser.close();
    } catch (e) {
        console.error("Puppeteer Script Error:", e.message);
    }
})();
