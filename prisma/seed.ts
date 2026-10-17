import { PrismaClient, Prisma } from '@prisma/client';
import { hash } from 'bcryptjs';
import { initialState } from '../src/lib/catalog';
const db=new PrismaClient();
async function main(){await db.commerceState.upsert({where:{id:'main'},create:{id:'main',data:initialState() as unknown as Prisma.InputJsonValue},update:{}});if(process.env.OWNER_EMAIL&&process.env.OWNER_PASSWORD){if(process.env.OWNER_PASSWORD.length<12)throw Error('Owner password must be at least 12 characters');await db.user.upsert({where:{email:process.env.OWNER_EMAIL.toLowerCase()},create:{email:process.env.OWNER_EMAIL.toLowerCase(),name:'Store owner',role:'OWNER',passwordHash:await hash(process.env.OWNER_PASSWORD,12)},update:{}});}}
main().finally(()=>db.$disconnect());
