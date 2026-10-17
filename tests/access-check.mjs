import {request} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url),{encode}=require('next-auth/jwt');
const secret=process.env.NEXTAUTH_SECRET||(await readFile('.env.local','utf8')).match(/^NEXTAUTH_SECRET=(.+)$/m)?.[1];
if(!secret)throw Error('Configure NEXTAUTH_SECRET for access tests.');
for(const role of ['CUSTOMER','SUPPORT','MANAGER','OWNER']){
 const token=await encode({secret,token:{id:'qa-'+role,email:role.toLowerCase()+'@example.com',name:'QA '+role,role},maxAge:120});
 const context=await request.newContext({baseURL:'http://localhost:3000',extraHTTPHeaders:{Cookie:`next-auth.session-token=${token}`}});
 const state=await context.get('/api/admin');assert.equal(state.status(),role==='CUSTOMER'?401:200,role+' read');
 const exportResponse=await context.get('/api/admin/export');assert.equal(exportResponse.status(),role==='CUSTOMER'?401:role==='SUPPORT'?403:200,role+' export');
 const staff=await context.get('/api/admin/staff');assert.equal(staff.status(),role==='OWNER'?200:role==='CUSTOMER'?401:403,role+' staff');
 const inventory=await context.post('/api/admin',{data:{action:'inventory',data:{variantId:'missing',delta:1,reason:'QA permission check'}}});assert.equal(inventory.status(),role==='CUSTOMER'?401:role==='SUPPORT'?403:400,role+' inventory');
 if(role!=='CUSTOMER'){const s=await state.json();const settings=await context.post('/api/admin',{data:{action:'settings',data:s.settings}});assert.equal(settings.status(),role==='OWNER'?200:403,role+' settings');}
 console.log(role+': server read, CSV export, inventory, settings, and staff permissions pass');await context.dispose();
}
