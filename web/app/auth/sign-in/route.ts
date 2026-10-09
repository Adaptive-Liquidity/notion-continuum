import {NextResponse} from 'next/server';import {configuredAuth} from '@/lib/server/session';
export async function GET(){if(!configuredAuth())return NextResponse.redirect(new URL('/sign-in',process.env.CT_CONSOLE_ORIGIN??'http://127.0.0.1:5661'));const {getSignInUrl}=await import('@workos-inc/authkit-nextjs');return NextResponse.redirect(await getSignInUrl({returnTo:'/console/work'}));}
