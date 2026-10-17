'use client';
import Link from 'next/link';
import {ArrowUpRight,ArrowRight} from 'lucide-react';
import {useStore} from './store-provider';
import {ProductCard,Photo} from './ui';
import {HeroCarousel} from './hero-carousel';
import {BrandLogo} from './brand-logo';
import {editorial} from '@/lib/catalog';

export function Home(){
 const {products}=useStore();
 const categories=[{name:'The essentials',category:'T-shirts',caption:'Weight. Structure. Ease.',id:'p1'},{name:'Shirting',category:'Shirts',caption:'A study in proportion.',id:'p2'},{name:'Trousers',category:'Bottomwear',caption:'A considered silhouette.',id:'p3'},{name:'Outerwear',category:'Outerwear',caption:'The finishing layer.',id:'p7'}];
 return <>
  <HeroCarousel/>
  <div className="collection-note"><span>A STUDY IN EVERYDAY DRESSING.</span><span>FORM. TEXTURE. INTENTION.<ArrowUpRight size={15}/></span></div>
  <section id="discover" className="section category-section">
   <div className="section-heading"><div><span className="eyebrow">THE WARDROBE, EDITED</span><h2>Considered from the start.</h2></div><Link href="/shop" className="text-link">Explore the collection<ArrowUpRight size={16}/></Link></div>
   <div className="category-grid">{categories.map((c,i)=>{const p=products.find(p=>p.id===c.id);return <Link className="category-card" href={'/shop?category='+c.category} key={c.id}><div><Photo src={p?.images[0]||editorial} alt={c.name}/><span className="category-number">0{i+1}</span></div><h3>{c.name}<ArrowUpRight size={19}/></h3><p>{c.caption}</p></Link>;})}</div>
  </section>
  <section className="section arrivals-section">
   <div className="section-heading"><div><span className="eyebrow">THE LATEST CHAPTER</span><h2>New pieces. Lasting perspective.</h2></div><Link href="/shop?sort=newest" className="text-link">View new arrivals<ArrowRight size={16}/></Link></div>
   <div className="product-grid">{products.slice(4,8).map(p=><ProductCard key={p.id} product={p}/>)}</div>
  </section>
  <section className="editorial-section">
   <div className="editorial-image"><Photo src={editorial} alt="An editorial study of ivory knitwear and charcoal wool on pale limestone" sizes="(max-width: 700px) 100vw, 55vw"/><span>AN EXERCISE IN RESTRAINT.</span></div>
   <div className="editorial-copy"><span className="eyebrow">THE TEXTURE EDIT</span><h2>The details<br/>make the <em>difference.</em></h2><p>A softer knit. A cleaner line. A little more thought in the things you wear every day. Discover pieces with presence, without the noise.</p><Link href="/shop?category=Knitwear" className="btn">Explore knitwear<ArrowUpRight size={17}/></Link><span className="editorial-footnote">QUIET BY DESIGN. DISTINCT BY NATURE.</span></div>
  </section>
  <section className="section">
   <div className="section-heading"><div><span className="eyebrow">LESS, WITH MORE INTENTION</span><h2>The quieter essentials.</h2></div><Link href="/shop?collection=Slow+days" className="text-link">Discover the edit<ArrowUpRight size={16}/></Link></div>
   <div className="product-grid">{products.slice(8,12).map(p=><ProductCard key={p.id} product={p}/>)}</div>
  </section>
  {products.some(p=>(p.sold||0)>0)&&<section className="section"><div className="section-heading"><div><span className="eyebrow">THE WELL-WORN FAVOURITES</span><h2>Chosen, time and again.</h2></div><Link href="/shop?sort=best-selling" className="text-link">View best sellers<ArrowRight size={16}/></Link></div><div className="product-grid">{products.filter(p=>(p.sold||0)>0).sort((a,b)=>(b.sold||0)-(a.sold||0)).slice(0,4).map(p=><ProductCard key={p.id} product={p}/>)}</div></section>}
  <section className="brand-story"><span className="eyebrow">THE NEXT CHAPTER PHILOSOPHY</span><h2>A wardrobe with intention.<br/><em>A style that is your own.</em></h2><p>We are drawn to the things that feel quietly right.<br/>Honest textures. Thoughtful proportions. Pieces that come together, naturally.</p><Link href="/about" className="text-link">Our point of view<ArrowUpRight size={16}/></Link><div className="story-mark"><BrandLogo mark/><span>Considered, always.</span></div></section>
 </>;
}
