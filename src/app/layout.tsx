import type {Metadata} from 'next';
import './globals.css';
import {readState} from '@/lib/store';
import {isDemo} from '@/lib/db';
import {brand,rankedProducts} from '@/lib/catalog';
import {StoreProvider} from '@/components/store-provider';
import {Header,Footer} from '@/components/shell';
export const dynamic='force-dynamic';
export const metadata:Metadata={metadataBase:new URL(process.env.NEXT_PUBLIC_SITE_URL||'http://localhost:3000'),title:{default:`${brand} — A considered wardrobe.`,template:`%s · ${brand}`},icons:{icon:[{url:'/brand/next-chapter-icon-v2.svg',type:'image/svg+xml'}],shortcut:'/brand/next-chapter-icon-v2.svg'},description:'Modern menswear. Refined knitwear, considered tailoring and everyday essentials, selected for a wardrobe with intention.'};
export default async function RootLayout({children}:{children:React.ReactNode}){const state=await readState();return <html lang="en"><body><a className="skip-link" href="#main">Skip to content</a><StoreProvider catalog={{products:rankedProducts(state),settings:state.settings,collections:state.collections,reviews:state.reviews.filter(r=>r.status==='Published'),demo:isDemo}}><Header/><main id="main">{children}</main><Footer/></StoreProvider></body></html>;}
