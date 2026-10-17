import { prisma, isDemo } from './db';
import { initialState,upgradePremiumDemo } from './catalog';
import type { State } from './types';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { Prisma } from '@prisma/client';
const file=path.join(process.cwd(),'.data','demo.json');
let queue:Promise<unknown>=Promise.resolve();
export async function readState():Promise<State>{
 if(!isDemo){const row=await prisma.commerceState.findUnique({where:{id:'main'}});if(!row)throw new Error('Database is not seeded. Run npm run db:seed.');return row.data as unknown as State;}
 if(process.env.NODE_ENV==='production' && process.env.ALLOW_DEMO!=='true')throw new Error('Configure PostgreSQL for production, or explicitly set ALLOW_DEMO=true for a disposable preview.');
 try{return upgradePremiumDemo(JSON.parse(await fs.readFile(file,'utf8')));}catch(e){if((e as NodeJS.ErrnoException).code!=='ENOENT')throw e;return initialState();}
}
export async function mutateState<T>(fn:(state:State)=>T):Promise<T>{
 if(!isDemo){for(let i=0;i<5;i++){try{return await prisma.$transaction(async tx=>{const row=await tx.commerceState.findUniqueOrThrow({where:{id:'main'}});const state=row.data as unknown as State;const result=fn(state);const updated=await tx.commerceState.updateMany({where:{id:'main',version:row.version},data:{data:state as unknown as Prisma.InputJsonValue,version:{increment:1}}});if(updated.count!==1)throw new Error('RETRY');return result;},{isolationLevel:'Serializable'});}catch(e){if(i===4||!((e as {code?:string}).code==='P2034'||(e as Error).message==='RETRY'))throw e;}}throw new Error('Please retry.');}
 const op=queue.then(async()=>{const state=await readState();const result=fn(state);await fs.mkdir(path.dirname(file),{recursive:true});const temp=file+'.tmp';await fs.writeFile(temp,JSON.stringify(state));await fs.rename(temp,file);return result;});queue=op.catch(()=>{});return op;
}
