import {randomUUID} from 'node:crypto';
import {mutateState} from './store';
import type {Order} from './types';
export function paymentConfigured(){return Boolean(process.env.RAZORPAY_KEY_ID&&process.env.RAZORPAY_KEY_SECRET&&process.env.RAZORPAY_WEBHOOK_SECRET);}
export async function prepareRazorpay(order:Order):Promise<Order>{
 if(!paymentConfigured())throw Error('Online payments are not configured.');
 const lease=randomUUID();
 const claimed=await mutateState(s=>{const current=s.orders.find(o=>o.id===order.id);if(!current||current.status!=='Awaiting payment')throw Error('This order is not awaiting payment.');if(current.razorpayOrderId)return {...current};if(current.paymentAttempt&&Date.now()-new Date(current.paymentAttempt.at).getTime()<60000)throw Error('Your payment is being prepared. Please retry shortly.');current.paymentAttempt={id:lease,at:new Date().toISOString()};return {...current};});
 if(claimed.razorpayOrderId)return claimed;
 try{const response=await fetch('https://api.razorpay.com/v1/orders',{method:'POST',headers:{Authorization:'Basic '+Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64'),'Content-Type':'application/json'},body:JSON.stringify({amount:claimed.total,currency:'INR',receipt:claimed.id}),signal:AbortSignal.timeout(20000)});if(!response.ok)throw Error('Payment provider is unavailable. Retry your checkout.');const remote=await response.json();return await mutateState(s=>{const current=s.orders.find(o=>o.id===order.id)!;if(current.paymentAttempt?.id!==lease)throw Error('Payment preparation expired. Please retry.');current.razorpayOrderId=remote.id;delete current.paymentAttempt;return {...current};});}
 catch(e){await mutateState(s=>{const current=s.orders.find(o=>o.id===order.id);if(current?.paymentAttempt?.id===lease)delete current.paymentAttempt;});throw e;}
}
