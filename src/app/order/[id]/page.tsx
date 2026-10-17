import {Suspense} from 'react';
import {OrderConfirmation} from '@/components/checkout';
export const metadata={title:'Order confirmation',robots:{index:false,follow:false}};
export default async function Page({params}:{params:Promise<{id:string}>}){return <Suspense><OrderConfirmation id={(await params).id}/></Suspense>;}
