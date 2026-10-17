import {identity} from '@/lib/auth';
import {redirect,notFound} from 'next/navigation';
import {Admin} from '@/components/admin';
export const metadata={title:'Studio dashboard',robots:{index:false,follow:false}};
export default async function Page({params}:{params:Promise<{section?:string[]}>}){const user=await identity();if(!user||user.role==='CUSTOMER')redirect('/account');const section=(await params).section?.[0]||'overview';if(!['overview','products','collections','inventory','orders','customers','enquiries','support','promotions','content','reviews','settings','staff','audit'].includes(section))notFound();return <Admin section={section} name={user.name}/>;}
