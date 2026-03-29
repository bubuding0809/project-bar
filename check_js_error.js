/* eslint-disable */
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  
  await page.goto('https://project-bar-henna.vercel.app/table/4', { waitUntil: 'networkidle2' });
  const html = await page.content();
  console.log('HTML SNIPPET:', html.substring(0, 500));
  if (html.includes('Application error')) {
    console.log('FOUND APPLICATION ERROR BANNER');
  }
  await browser.close();
})();
