import Image from 'next/image';
import {brand} from '@/lib/catalog';

export function BrandLogo({mark=false}:{mark?:boolean}){
 return <span className={`brand-logo ${mark?'brand-logo--mark':'brand-logo--full'}`}><Image src={mark?'/brand/next-chapter-monogram.svg':'/brand/next-chapter-wordmark.svg'} alt={brand} width={mark?64:408} height={mark?64:56} unoptimized/></span>;
}
