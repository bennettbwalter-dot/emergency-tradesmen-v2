import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE_ERROR:', error));
    page.on('requestfailed', request => console.log('REQ_FAILED:', request.url(), request.failure() ? request.failure().errorText : 'none'));

    try {
        await page.goto('http://localhost:3000/blog', { waitUntil: 'networkidle2' });
        // wait to see if empty or error shown
        await new Promise(r => setTimeout(r, 2000));
        const html = await page.evaluate(() => document.body.innerHTML);
        
        if (html.includes('LocalErrorBoundary') || html.includes('An unexpected error has occurred')) {
            console.log('\n\nError boundary is visible.');
            // extract the text content
            const text = await page.evaluate(() => document.body.innerText);
            console.log(text);
        } else if (html.trim() === '' || html.includes('<noscript>') && !html.includes('<div id="root"')) {
            console.log('\n\nScreen is literally blank or just noscript');
        } else {
            console.log('\n\nPage has content. Length:', html.length);
            // Dump the first 500 chars to see what rendered
            console.log(html.substring(0, 500));
        }
    } catch(err) {
        console.log('Exception:', err);
    }
    
    await browser.close();
})();
