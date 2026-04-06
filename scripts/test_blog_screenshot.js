import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch({ headless: true, defaultViewport: { width: 1280, height: 900 } });
    const page = await browser.newPage();
    
    page.on('console', msg => {
        if (msg.type() === 'error') console.log('CONSOLE_ERROR:', msg.text());
    });
    page.on('pageerror', error => console.log('PAGE_ERROR:', error.message, error.stack));

    try {
        await page.goto('http://localhost:3000/blog', { waitUntil: 'networkidle2' });
        
        // Check what posts are in the DOM
        const postsInfo = await page.evaluate(() => {
            const header = document.querySelector('.sticky');
            const heroSection = document.querySelector('.relative.w-full.h-\\[60vh\\]');
            const heroImg = document.querySelector('.relative.w-full img');
            const grid = document.querySelector('.grid');
            const gridItems = document.querySelectorAll('.grid a');
            const noDispatches = document.querySelector('h3');
            
            return {
                hasHeader: !!header,
                hasHeroSection: !!heroSection,
                heroImgSrc: heroImg ? heroImg.src.substring(0, 100) : null,
                hasGrid: !!grid,
                gridItemCount: gridItems.length,
                noDispatchesText: noDispatches?.textContent,
                bodyHeight: document.body.scrollHeight,
            };
        });
        
        console.log('\nPage Analysis:', JSON.stringify(postsInfo, null, 2));
        await page.screenshot({ path: 'blog_screenshot.png', fullPage: false });
        console.log('\nSaved viewport screenshot');
    } catch(err) {
        console.log('Exception:', err.message);
    }
    
    await browser.close();
})();
