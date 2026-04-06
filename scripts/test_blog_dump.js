import puppeteer from 'puppeteer';
import fs from 'fs';

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    let errorLog = '';

    page.on('pageerror', error => {
        errorLog += `PAGE_ERROR: ${error.message}\n${error.stack}\n`;
    });

    try {
        await page.goto('http://localhost:3000/blog', { waitUntil: 'networkidle2' });
        await new Promise(r => setTimeout(r, 2000));
        
        const html = await page.evaluate(() => document.body.innerHTML);
        fs.writeFileSync('blog_html.txt', html);
        fs.writeFileSync('blog_error.txt', errorLog);
        console.log('Successfully wrote blog_html.txt and blog_error.txt');
    } catch(err) {
        console.log('Exception:', err);
    }
    
    await browser.close();
})();
