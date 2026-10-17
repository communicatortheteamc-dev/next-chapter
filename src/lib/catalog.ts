import type { Product, State } from './types';
export const brand = process.env.NEXT_PUBLIC_BRAND_NAME || 'Next chapter';
export const money=(n:number)=>new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',minimumFractionDigits:n%100===0?0:2,maximumFractionDigits:2}).format(n/100);
const photo=(name:string)=>`/images/premium/${name}.png`;
export const campaign='/images/menswear/hero-wide.png';
export const editorial=photo('editorial');
const seeds = [
 ['The heavyweight tee','T-shirts',1499,'Relaxed','Heavyweight cotton jersey','tee','Chalk','#e9e6dc'],
 ['The linen shirt','Shirts',2499,'Relaxed','Linen weave','linen','Oat','#c9bda8'],
 ['The pleated trouser','Bottomwear',4499,'Straight','Wool-blend tailoring','trousers','Taupe','#756c5e'],
 ['The merino zip neck','Knitwear',3999,'Relaxed','Fine-gauge merino knit','zip-knit','Espresso','#4a382d'],
 ['The striped poplin shirt','Shirts',2999,'Regular','Cotton poplin','poplin','Sky','#a9bdca'],
 ['The leather weekender','Accessories',6499,'One size','Smooth leather','weekender','Chocolate','#49342b'],
 ['The wool blouson','Outerwear',7999,'Relaxed','Wool-blend outerwear','blouson','Charcoal','#3b3c3b'],
 ['The straight selvedge jean','Bottomwear',3999,'Straight','Cotton selvedge denim','denim','Indigo','#303d50'],
 ['The tailored chino','Bottomwear',3499,'Straight','Cotton twill','chinos','Stone','#c6bba5'],
 ['The ribbed knit polo','Knitwear',2499,'Regular','Ribbed cotton knit','polo','Olive','#515844'],
 ['The textured crewneck','Knitwear',4999,'Relaxed','Soft textured knit','crewneck','Oat','#d4c9b6'],
 ['The leather cardholder','Accessories',1999,'One size','Pebbled leather','cardholder','Ink','#252625'],
];
export const seedProducts:Product[]=seeds.map((r,i)=>({id:`p${i+1}`,slug:String(r[0]).toLowerCase().replaceAll(' ','-'),name:String(r[0]),category:String(r[1]),price:Number(r[2])*100,taxRate:5,fit:String(r[3]),material:String(r[4]),description:`${String(r[4])}. Considered proportions and a ${String(r[3]).toLowerCase()} silhouette. A quiet addition to a well-considered wardrobe, designed to pair with the pieces you already reach for.`,images:[photo(String(r[5]))],variants:(r[3]==='One size'?['One size']:['XS','S','M','L','XL','XXL']).flatMap((size,j)=>[{id:`v${i+1}-${j}-0`,size,color:String(r[6]),hex:String(r[7]),stock:j===5?0:8+i,sku:`BR-${i+1}-${size}-A`},...(r[3]==='One size'?[]:[{id:`v${i+1}-${j}-1`,size,color:'Ink',hex:'#292b2b',stock:j===0?0:5+i,sku:`BR-${i+1}-${size}-B`}])]),createdAt:new Date(Date.UTC(2026,9,16-i)).toISOString(),archived:false,collection:i<4?'New arrivals':i<8?'Everyday essentials':'Slow days'}));
export function initialState():State {return {products:structuredClone(seedProducts),orders:[],customers:[],tickets:[],coupons:[{id:'welcome',code:'WELCOME10',percent:10,minimum:150000,limit:1000,used:0,starts:'2026-01-01',ends:'2027-12-31',categories:[]}],collections:[{id:'everyday',name:'Everyday essentials',rule:'',productIds:['p5','p6','p7','p8']},{id:'new',name:'New arrivals',rule:'newest',productIds:[]}],reviews:[],settings:{announcement:'Complimentary shipping on orders over {freeShipping}.',freeShipping:199900,shippingFee:9900,returnDays:7,cod:false,codPostcodes:[],bannerTitle:'The considered\nwardrobe.',bannerText:'Modern essentials. Exceptional textures. A wardrobe with intention.',faqs:[{q:'How does sizing work?',a:'Check the size guide on each product page. Measurements are garment measurements; choose a little room for a relaxed fit.'},{q:'When will my order arrive?',a:'Dispatch and delivery estimates depend on your postcode. In this demo, delivery is simulated and no parcels are shipped.'}],policies:{shipping:'Orders ship within 2–3 business days after confirmation. Delivery typically takes 4–7 business days. Delivery dates require confirmation by a configured shipping provider.',returns:'Items must be unworn, unwashed, and have their original tags. Submit a request from your account. Approved refunds return to the original payment method after inspection.',privacy:'We use account and order details to fulfil purchases and provide support. Marketing requires your separate consent. Contact us to request access or deletion. Replace this draft with your approved business policy before launch.',terms:'This is a demonstration store. No real purchases or shipping are available without configured services. Product images are illustrative. Replace these draft terms with approved terms before launch.'}},audit:[],inventory:[],webhookIds:[],subscribers:[]};}

export function rankedProducts(state:State){return state.products.filter(p=>!p.archived).map(p=>({...p,sold:state.orders.filter(o=>o.payment!=='sandbox'&&['Paid','Processing','Shipped','Delivered'].includes(o.status)).reduce((n,o)=>n+o.items.filter(i=>p.variants.some(v=>v.id===i.variantId)).reduce((q,i)=>q+i.quantity,0),0)}));}

// Upgrade only the original local demo catalogue; merchant photography and
// customised prices are retained. Inventory and historical orders are untouched.
const oldDemoPhotos=['photo-1521572163474-6864f9cf17ab','photo-1598033129183-c4f50c736f10','photo-1473966968600-fa801b869a1a','photo-1556821840-3a63f95609a7','photo-1602810318383-e386cc2a3ccf','photo-1544816155-12df9643f363','photo-1591047139829-d91aecb6caea','photo-1542272604-787c3835535d','photo-1515372039744-b8f02a3ae446','photo-1503342217505-b0a15ec3261c','photo-1434389677669-e08b4cac3105','photo-1553062407-98eeb64c6a62'];
const oldDemoPrices=[89900,169900,219900,189900,149900,69900,249900,229900,249900,79900,279900,129900];
export function upgradePremiumDemo(state:State):State{
 for(const product of state.products){const index=seedProducts.findIndex(p=>p.id===product.id);if(index<0||!product.images.some(src=>src.startsWith(`https://images.unsplash.com/${oldDemoPhotos[index]}`)))continue;const replacement=seedProducts[index];product.images=[...replacement.images];product.name=replacement.name;product.slug=replacement.slug;product.category=replacement.category;product.fit=replacement.fit;product.material=replacement.material;product.description=replacement.description;if(product.price===oldDemoPrices[index])product.price=replacement.price;delete product.compareAt;for(const variant of product.variants){const updated=replacement.variants.find(v=>v.id===variant.id);if(updated){variant.size=updated.size;variant.color=updated.color;variant.hex=updated.hex;}}}
 if(state.settings.bannerTitle==='Good clothes.\nGreat everyday.')state.settings.bannerTitle='The considered\nwardrobe.';
 if(state.settings.bannerText==='Easy silhouettes. Considered details. Pieces that feel like you.')state.settings.bannerText='Modern essentials. Exceptional textures. A wardrobe with intention.';
 if(state.settings.announcement==='Made for the everyday. Free shipping on orders over {freeShipping}.')state.settings.announcement='Complimentary shipping on orders over {freeShipping}.';
 return state;
}
