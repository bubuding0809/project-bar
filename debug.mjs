import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  
  await page.goto('https://project-bar-henna.vercel.app/table/4');
  await new Promise(r => setTimeout(r, 2000)); // Wait 2s to see if it crashes
  
  const content = await page.content();
  if (content.includes('Application error')) {
    console.log('CRASHED WITH APPLICATION ERROR');
  } else {
    console.log('RENDERED SUCCESSFULLY');
  }
  
  await browser.close();
})();
