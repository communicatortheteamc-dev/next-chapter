import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
const page=await browser.newPage({reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
 for(const width of [360,390,768,1024,1440]){
  await page.setViewportSize({width,height:900});await page.goto('http://localhost:3000',{waitUntil:'networkidle'});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'Home overflows at '+width);
  await expect(page.locator('.wordmark img')).toHaveAttribute('src','/brand/next-chapter-wordmark.svg');
  await expect(page.locator('.campaign-navigation')).toHaveCount(0);
  for(let y=0;y<await page.evaluate(()=>document.body.scrollHeight);y+=650){await page.evaluate(y=>scrollTo(0,y),y);await page.waitForTimeout(80);}
  await page.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth>0));
  await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
  if([390,1440].includes(width))await page.screenshot({path:`artifacts/premium-home-${width}.png`,fullPage:true});
  await page.goto('http://localhost:3000/shop',{waitUntil:'networkidle'});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'Shop overflows at '+width);
  if(width===1440)await page.screenshot({path:'artifacts/premium-shop-desktop.png',fullPage:true});
  console.log('Home / collection / images verified:',width);
 }
 await page.setViewportSize({width:390,height:900});await page.goto('http://localhost:3000/products/the-linen-shirt',{waitUntil:'networkidle'});await page.getByRole('button',{name:'M',exact:true}).click();await page.getByRole('button',{name:'Add to bag',exact:true}).first().click();await page.getByRole('dialog').waitFor();await expect(page.getByRole('dialog')).toContainText('The linen shirt');await page.getByRole('button',{name:'Close',exact:true}).click();
 await page.goto('http://localhost:3000/cart',{waitUntil:'networkidle'});await expect(page.locator('.cart-items')).toContainText('The linen shirt');
 const data=await (await page.request.get('http://localhost:3000/api/catalog')).json();assert.equal(data.products.length,12);assert.equal(new Set(data.products.map(p=>p.images[0])).size,12);assert.ok(data.products.every(p=>p.images[0].startsWith('/images/premium/')));assert.ok(!data.products.some(p=>p.category==='Dresses'));assert.deepEqual(errors,[]);
 console.log('Distinct premium catalogue, size selection and bag integration pass. No browser errors.');
 await page.setViewportSize({width:1200,height:600});await page.goto('http://localhost:3000');await page.setContent('<body style="margin:0;padding:70px;background:#f7f6f2"><img src="http://localhost:3000/brand/next-chapter-wordmark.svg" width="850"><div style="display:flex;align-items:center;gap:40px;margin-top:65px"><img src="http://localhost:3000/brand/next-chapter-wordmark.svg" width="210"><img src="http://localhost:3000/brand/next-chapter-icon-v2.svg" width="52"></div><div style="padding:40px;background:#202520;margin-top:60px"><img src="http://localhost:3000/brand/next-chapter-wordmark-light.svg" width="480"></div></body>');await page.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth>0));await page.screenshot({path:'artifacts/premium-wordmark.png'});
}finally{await browser.close();}
