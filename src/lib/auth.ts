import { getServerSession, type NextAuthOptions } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { timingSafeEqual, createHash } from 'node:crypto';
import { prisma,isDemo } from './db';
import type { Role } from './types';
const attempts=new Map<string,{count:number;at:number}>();
export const authOptions:NextAuthOptions={
 secret:process.env.NEXTAUTH_SECRET || (process.env.NODE_ENV!=='production'?'local-development-only-change-before-deploy':undefined),
 session:{strategy:'jwt',maxAge:60*60*8},pages:{signIn:'/account'},
 providers:[Credentials({name:'Email and password',credentials:{email:{label:'Email',type:'email'},password:{label:'Password',type:'password'}},async authorize(c){
 const email=c?.email?.toLowerCase().trim();if(!email||!c?.password)return null;const a=attempts.get(email);if(a&&Date.now()-a.at<900000&&a.count>=10)return null;attempts.set(email,{count:a&&Date.now()-a.at<900000?a.count+1:1,at:Date.now()});
 if(isDemo){const password=process.env.DEMO_ADMIN_PASSWORD;if(process.env.NODE_ENV!=='production'&&email==='admin@example.com'&&password&&password.length>=12&&timingSafeEqual(createHash('sha256').update(c.password).digest(),createHash('sha256').update(password).digest())){attempts.delete(email);return {id:'demo-owner',name:'Demo owner',email,role:'OWNER'};}return null;}
 const user=await prisma.user.findUnique({where:{email}});if(!user||!await compare(c.password,user.passwordHash))return null;attempts.delete(email);return {id:user.id,name:user.name,email:user.email,role:user.role};
 }})],callbacks:{async jwt({token,user}){if(user){token.role=(user as unknown as {role:Role}).role;token.id=user.id;}return token;},async session({session,token}){if(session.user){Object.assign(session.user,{id:token.id,role:token.role});}return session;}}
};
export async function identity(){const session=await getServerSession(authOptions);if(!session?.user?.email)return null;const u=session.user as {id:string;email:string;name:string;role:Role};if(!isDemo){const fresh=await prisma.user.findUnique({where:{id:u.id}});if(!fresh)return null;return {...u,role:fresh.role};}return u;}
export async function requireStaff(write=false,owner=false){const user=await identity();if(!user||user.role==='CUSTOMER')throw Error('UNAUTHORIZED');if(owner&&user.role!=='OWNER')throw Error('FORBIDDEN');if(write&&user.role==='SUPPORT')throw Error('FORBIDDEN');return user;}
export function canManage(role:Role){return role==='OWNER'||role==='MANAGER';}
