import type {NextConfig} from 'next';import path from 'node:path';
const config:NextConfig={poweredByHeader:false,outputFileTracingRoot:path.resolve(process.cwd(),'..'),turbopack:{root:path.resolve(process.cwd(),'..')},reactStrictMode:true,output:'standalone',experimental:{cpus:2},async headers(){return [{source:'/:path*',headers:[{key:'X-Content-Type-Options',value:'nosniff'},{key:'Referrer-Policy',value:'no-referrer'},{key:'X-Frame-Options',value:'DENY'}]}];}};
export default config;
