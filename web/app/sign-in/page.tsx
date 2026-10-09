import {configuredAuth} from '@/lib/server/session';import {SignIn} from '@/components/SignIn';export const dynamic='force-dynamic';
export default function Page(){return <SignIn local={process.env.CT_CONSOLE_MODE==='LOCAL_FIXTURE'} configured={configuredAuth()}/>;}
