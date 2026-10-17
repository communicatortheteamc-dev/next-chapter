import {notFound} from 'next/navigation';
import {Suspense} from 'react';
import {readState} from '@/lib/store';
import {brand} from '@/lib/catalog';
import {ProductDetail} from '@/components/product';
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const p=(await readState()).products.find(p=>p.slug===slug&&!p.archived);return {title:p?.name||'Product unavailable',alternates:{canonical:'/products/'+slug},description:p?.description};}
export default async function Page({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const p=(await readState()).products.find(p=>p.slug===slug&&!p.archived);if(!p)notFound();const json={ '@context':'https://schema.org','@type':'Product',name:p.name,description:p.description,image:p.images,brand:{'@type':'Brand',name:brand},offers:{'@type':'Offer',priceCurrency:'INR',price:p.price/100,availability:p.variants.some(v=>v.stock>0)?'https://schema.org/InStock':'https://schema.org/OutOfStock',url:`${process.env.NEXT_PUBLIC_SITE_URL||'http://localhost:3000'}/products/${p.slug}`}};return <><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(json).replaceAll('<','\\u003c')}}/><Suspense><ProductDetail product={p}/></Suspense></>;}
