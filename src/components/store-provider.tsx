'use client';
import {createContext,useContext,useEffect,useState,type ReactNode} from 'react';
import {SessionProvider} from 'next-auth/react';
import type {Product,CartLine,Settings,Collection,Review} from '@/lib/types';
export type Catalog={products:Product[];settings:Settings;collections:Collection[];reviews:Review[];demo:boolean};
type Context=Catalog&{cart:CartLine[];wishlist:string[];add:(id:string,q?:number)=>void;quantity:(id:string,n:number)=>void;wish:(id:string)=>void;cartOpen:boolean;setCartOpen:(v:boolean)=>void;notify:(v:string)=>void;clear:()=>void;ready:boolean};
const Store=createContext<Context|null>(null);
export function useStore(){return useContext(Store)!;}
export async function api(path:string,data?:unknown){const r=await fetch('/api/'+path,{method:data===undefined?'GET':'POST',headers:data===undefined?{}:{'Content-Type':'application/json'},body:data===undefined?undefined:JSON.stringify(data),cache:'no-store'});const j=await r.json();if(!r.ok)throw Error(j.error||'Please try again.');return j;}
export function StoreProvider({children,catalog}:{children:ReactNode;catalog:Catalog}){const [cart,setCart]=useState<CartLine[]>([]),[wishlist,setWishlist]=useState<string[]>([]),[ready,setReady]=useState(false),[cartOpen,setCartOpen]=useState(false),[notice,notify]=useState('');
useEffect(()=>{try{const c=JSON.parse(localStorage.getItem('brand-cart')||'[]');setCart(Array.isArray(c)?c.filter(l=>typeof l.variantId==='string'&&Number.isInteger(l.quantity)&&l.quantity>0&&l.quantity<=10):[]);const w=JSON.parse(localStorage.getItem('brand-wishlist')||'[]');setWishlist(Array.isArray(w)?w.filter(x=>typeof x==='string'):[]);}catch{}setReady(true);},[]);
useEffect(()=>{if(ready){localStorage.setItem('brand-cart',JSON.stringify(cart));localStorage.setItem('brand-wishlist',JSON.stringify(wishlist));}},[cart,wishlist,ready]);useEffect(()=>{if(notice){const t=setTimeout(()=>notify(''),5000);return()=>clearTimeout(t);}},[notice]);
const quantity=(id:string,n:number)=>setCart(c=>n<=0?c.filter(l=>l.variantId!==id):c.map(l=>l.variantId===id?{...l,quantity:Math.min(10,n)}:l));
const add=(id:string,q=1)=>{const v=catalog.products.flatMap(p=>p.variants).find(v=>v.id===id);if(!v||v.stock<q){notify('This size is out of stock.');return;}setCart(c=>c.some(l=>l.variantId===id)?c.map(l=>l.variantId===id?{...l,quantity:Math.min(10,v.stock,l.quantity+q)}:l):[...c,{variantId:id,quantity:q}]);setCartOpen(true);};
return <SessionProvider><Store.Provider value={{...catalog,cart,wishlist,ready,add,quantity,wish:id=>setWishlist(w=>w.includes(id)?w.filter(x=>x!==id):[...w,id]),cartOpen,setCartOpen,notify,clear:()=>setCart([])}}>{children}{notice&&<div className="toast" role="status">{notice}<button aria-label="Dismiss" onClick={()=>notify('')}>×</button></div>}</Store.Provider></SessionProvider>;}
