import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,upgradePremiumDemo} from '../src/lib/catalog';
import {createOrder} from '../src/lib/commerce';

test('premium demo upgrade preserves stock, custom prices and historical orders',()=>{
 const state=initialState();
 createOrder(state,{items:[{variantId:'v1-0-0',quantity:1}],address:{name:'Demo Buyer',email:'demo@example.com',phone:'9876543210',line1:'12 Demo Street',city:'Bengaluru',state:'Karnataka',postcode:'560001'},payment:'sandbox',requestId:'21dc8438-0555-469f-a8e3-7289570823bd'});
 const p=state.products[0];p.images=['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format'];p.price=234567;p.name='Original seed name';
 const stock=p.variants.map(v=>({id:v.id,stock:v.stock}));const orders=structuredClone(state.orders),customers=structuredClone(state.customers);
 upgradePremiumDemo(state);
 assert.equal(p.price,234567);assert.equal(p.name,'The heavyweight tee');assert.equal(p.images[0],'/images/premium/tee.png');assert.deepEqual(p.variants.map(v=>({id:v.id,stock:v.stock})),stock);assert.deepEqual(state.orders,orders);assert.deepEqual(state.customers,customers);
 const once=structuredClone(state);upgradePremiumDemo(state);assert.deepEqual(state,once);
});
test('premium demo upgrade leaves merchant-owned catalogue photos unchanged',()=>{const state=initialState();state.products[0].images=['https://merchant.example.com/tee.jpg'];state.products[0].name='Merchant collection';const before=structuredClone(state);upgradePremiumDemo(state);assert.deepEqual(state,before);});
