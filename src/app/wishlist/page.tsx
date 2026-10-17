import {Suspense} from 'react';
import {Shop} from '@/components/shop';
export const metadata={title:'Wishlist'};
export default function Page(){return <Suspense><Shop wishlist/></Suspense>;}
