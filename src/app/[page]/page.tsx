import {notFound} from 'next/navigation';
import {Suspense} from 'react';
import {SupportPage} from '@/components/support-pages';
const pages=['about','contact','faq','shipping','returns','privacy','terms'];
export async function generateMetadata({params}:{params:Promise<{page:string}>}){const {page}=await params;return {title:page.charAt(0).toUpperCase()+page.slice(1),alternates:{canonical:'/'+page}};}
export default async function Page({params}:{params:Promise<{page:string}>}){const {page}=await params;if(!pages.includes(page))notFound();return <Suspense><SupportPage page={page}/></Suspense>;}
