import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto('http://localhost:3000',{waitUntil:'networkidle'});
 const hero=page.getByRole('region',{name:'Men’s fashion campaigns'});
 await expect(page.locator('.campaign-navigation,.campaign-controls,.campaign-pagination')).toHaveCount(0);
 await hero.hover();
 await expect(hero).toHaveAttribute('data-playing','true');
 await expect(hero).toHaveAttribute('data-active-slide','1',{timeout:10000});
 await expect(hero).toHaveAttribute('data-active-slide','2',{timeout:10000});
 console.log('Automatic carousel advances while hovered; control bar absent.');
 await hero.focus();await page.keyboard.press('ArrowRight');await expect(hero).toHaveAttribute('data-active-slide','0');
 for(const viewport of [{width:360,height:800},{width:390,height:844},{width:768,height:1024},{width:1024,height:768},{width:1440,height:1000}]){
  await page.setViewportSize(viewport);await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await page.screenshot({path:`artifacts/auto-hero-${viewport.width}.png`});
 }
 await page.emulateMedia({reducedMotion:'reduce'});await expect(hero).toHaveAttribute('data-playing','false');
 await expect(page.locator('.wordmark img')).toHaveAttribute('alt','Next chapter');
 const sources=await page.locator('.campaign-image img').evaluateAll(imgs=>imgs.map(i=>i.src));assert.equal(new Set(sources).size,3);
 const catalog=await (await page.request.get('http://localhost:3000/api/catalog')).json();assert.equal(catalog.products.find(p=>p.id==='p9').name,'The tailored chino');assert.ok(catalog.products.every(p=>p.images[0].startsWith('/images/premium/')));
 assert.deepEqual(errors,[]);console.log('Responsive layout, keyboard navigation, reduced motion, branding and premium catalogue checks pass.');
}finally{await browser.close();}
