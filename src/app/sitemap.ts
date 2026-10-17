import type {MetadataRoute} from 'next';
import {readState} from '@/lib/store';
export const dynamic='force-dynamic';
export default async function sitemap():Promise<MetadataRoute.Sitemap>{const base=process.env.NEXT_PUBLIC_SITE_URL||'http://localhost:3000';return [...['','/shop','/about','/contact','/faq','/shipping','/returns','/privacy','/terms'].map(p=>({url:base+p})),...(await readState()).products.filter(p=>!p.archived).map(p=>({url:base+'/products/'+p.slug,lastModified:p.createdAt}))];}
