import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

    console.log('Navigating to blog...');
    try {
        await page.goto('http://localhost:3000/blog', { waitUntil: 'networkidle0' });
        console.log('Navigation complete.');
    } catch(err) {
        console.log('Navigation error:', err.message);
    }
    
    await browser.close();
})();
