import {Suspense} from 'react';
import {Shop} from '@/components/shop';
export const metadata={title:'The collection',alternates:{canonical:'/shop'}};
export default function Page(){return <Suspense><Shop/></Suspense>;}
