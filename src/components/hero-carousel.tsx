'use client';

import {useCallback,useEffect,useRef,useState} from 'react';
import type {CSSProperties} from 'react';
import Image,{getImageProps} from 'next/image';
import Link from 'next/link';
import {ArrowDown,ArrowUpRight} from 'lucide-react';
import {useStore} from './store-provider';

const INTERVAL=6500;
const campaigns=[
 {id:'everyday',label:'COLLECTION 01 — MODERN ESSENTIALS',title:['The considered','wardrobe.'],description:'Modern essentials. Exceptional textures. A wardrobe with intention.',cta:'Explore the collection',href:'/shop?sort=newest',image:'/images/menswear/hero-wide.png',portrait:'/images/menswear/denim.jpg',portraitPosition:'50% 50%',alt:'Man wearing a dark jacket and caramel chinos in sunlit modern architecture',note:'FORM. TEXTURE. INTENTION.',color:'#cec9b8',position:'50% 50%'},
 {id:'city',label:'THE CITY UNIFORM',title:['Go your','own way.'],description:'A fresh perspective on denim. Layers with character. Made for wherever you’re headed.',cta:'Find your next layer',href:'/shop?category=Outerwear',image:'/images/menswear/city-wide.png',portrait:'/images/menswear/city-wide.png',portraitPosition:'80% 50%',alt:'Male model wearing an indigo denim jacket, ivory tee and dark trousers beside a limestone doorway',note:'THE ART OF EVERYDAY DRESSING.',color:'#d9cebb',position:'50% 50%'},
 {id:'off-duty',label:'THE OFF-DUTY EDIT',title:['Less rush.','More you.'],description:'Relaxed proportions. Soft textures. Your everyday favourites, on your own terms.',cta:'Discover slow days',href:'/shop?collection=Slow+days',image:'/images/menswear/slow-wide.png',portrait:'/images/menswear/slow-wide.png',portraitPosition:'80% 50%',alt:'Male model in a sage green sweatshirt and ecru trousers seated on sunlit stone steps',note:'FOR THE PLANS. AND THE NO PLANS.',color:'#d8cbb6',position:'50% 50%'},
];
const portraits=campaigns.map(slide=>getImageProps({src:slide.portrait,alt:'',fill:true,sizes:'100vw'}).props);

export function HeroCarousel(){
 const {settings}=useStore();
 const [active,setActive]=useState(0),[focused,setFocused]=useState(false),[visible,setVisible]=useState(true),[inView,setInView]=useState(true),[reduced,setReduced]=useState(false);
 const region=useRef<HTMLElement>(null),touch=useRef<{x:number;y:number}|null>(null);
 const go=useCallback((index:number)=>setActive((index+campaigns.length)%campaigns.length),[]);
 useEffect(()=>{
  const media=window.matchMedia('(prefers-reduced-motion: reduce)');const motion=()=>setReduced(media.matches);motion();media.addEventListener('change',motion);
  const visibility=()=>setVisible(!document.hidden);document.addEventListener('visibilitychange',visibility);
  const observer=new IntersectionObserver(([entry])=>setInView(entry.isIntersecting),{threshold:.25});if(region.current)observer.observe(region.current);
  const chrome=new ResizeObserver(()=>{const header=document.querySelector('.header'),announcement=document.querySelector('.announcement');region.current?.style.setProperty('--storefront-chrome',`${(header?.getBoundingClientRect().height||0)+(announcement?.getBoundingClientRect().height||0)}px`);});
  for(const selector of ['.header','.announcement']){const element=document.querySelector(selector);if(element)chrome.observe(element);}
  return()=>{media.removeEventListener('change',motion);document.removeEventListener('visibilitychange',visibility);observer.disconnect();chrome.disconnect();};
 },[]);
 const playing=!focused&&visible&&inView&&!reduced;
 useEffect(()=>{if(!playing)return;const timer=window.setTimeout(()=>setActive(i=>(i+1)%campaigns.length),INTERVAL);return()=>window.clearTimeout(timer);},[active,playing]);
 const firstTitle=settings.bannerTitle.split('\n').filter(Boolean);
 return <section ref={region} className="hero-carousel" role="region" aria-roledescription="carousel" aria-label="Men’s fashion campaigns" tabIndex={0} data-active-slide={active} data-playing={playing} onFocusCapture={()=>setFocused(true)} onBlurCapture={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node|null))setFocused(false);}} onKeyDown={e=>{if(e.target!==e.currentTarget)return;if(e.key==='ArrowRight'){e.preventDefault();go(active+1);}if(e.key==='ArrowLeft'){e.preventDefault();go(active-1);}}} onTouchStart={e=>{touch.current={x:e.touches[0].clientX,y:e.touches[0].clientY};}} onTouchEnd={e=>{const start=touch.current;touch.current=null;if(!start)return;const dx=e.changedTouches[0].clientX-start.x,dy=e.changedTouches[0].clientY-start.y;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.3)go(active+(dx<0?1:-1));}}>
  <div className="campaign-slides" aria-live="off">
   {campaigns.map((slide,i)=>{
    const title=i===0&&firstTitle.length?firstTitle:slide.title;
    return <article key={slide.id} className={`campaign-slide campaign-${slide.id}${i===active?' is-active':''}`} style={{'--campaign-color':slide.color,'--image-position':slide.position,'--portrait-position':slide.portraitPosition} as CSSProperties} role="group" aria-roledescription="slide" aria-label={`${i+1} of ${campaigns.length}: ${slide.label}`} aria-hidden={i!==active} inert={i!==active}>
     <picture className="campaign-image"><source media="(max-aspect-ratio: 1/1)" srcSet={portraits[i].srcSet} sizes={i===0?'100vw':'350vw'}/><Image src={slide.image} alt={slide.alt} fill sizes="100vw" fetchPriority={i===0?'high':'low'} loading="eager"/></picture>
     <div className="campaign-shade"/>
     <div className="campaign-content"><span className="campaign-eyebrow"><span/>{slide.label}<span className="campaign-edition"> / 0{i+1}</span></span><h1>{title.map((line,n)=><span key={n}>{line}</span>)}</h1><p>{i===0?settings.bannerText:slide.description}</p><Link className="btn campaign-cta" href={slide.href}>{slide.cta}<ArrowUpRight size={19}/></Link></div>
     <span className="campaign-side-note">{slide.note}</span>
    </article>;
   })}
  </div>
  <div className="campaign-bottom"><a href="#discover" className="campaign-scroll" onClick={e=>{const target=document.getElementById('discover');if(target){e.preventDefault();target.scrollIntoView({behavior:reduced?'auto':'smooth'});}}}><ArrowDown size={18}/><span>A GOOD PLACE TO START</span></a></div>
  <span className="sr-only" aria-live={playing?'off':'polite'} aria-atomic="true">Campaign {active+1} of {campaigns.length}: {campaigns[active].label}</span>
 </section>;
}
