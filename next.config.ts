import type {NextConfig} from 'next';
const imageHosts=['images.unsplash.com'];
if(process.env.S3_PUBLIC_URL) imageHosts.push(new URL(process.env.S3_PUBLIC_URL).hostname);
const config:NextConfig={poweredByHeader:false,devIndicators:false,images:{remotePatterns:imageHosts.map(hostname=>({protocol:'https' as const,hostname}))},async headers(){return [{source:'/(.*)',headers:[{key:'X-Content-Type-Options',value:'nosniff'},{key:'Referrer-Policy',value:'strict-origin-when-cross-origin'},{key:'X-Frame-Options',value:'DENY'}]}]}};
export default config;
