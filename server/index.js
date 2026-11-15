// ResQ Hub API: Express + JWT + role checks, using local JSON or Vercel PostgreSQL storage.
import 'dotenv/config';
import express from 'express';import jwt from 'jsonwebtoken';import crypto from 'node:crypto';import fs from 'node:fs';
import {AsyncLocalStorage} from 'node:async_hooks';import pg from 'pg';
import {assess,can,tryPledge} from '../src/core.js';
import {AREA_NAMES} from '../src/geo.js';
const SECRET=process.env.JWT_SECRET,PORT=process.env.PORT||4000,FILE=process.env.VERCEL?'/tmp/resq-hub-data.json':new URL('./data.json',import.meta.url);
if(!SECRET||Buffer.byteLength(SECRET)<32)throw new Error('Set JWT_SECRET to a random value of at least 32 bytes before starting the API.');
const usePostgres=Boolean(process.env.VERCEL),databaseUrl=process.env.POSTGRES_URL||process.env.DATABASE_URL;
if(usePostgres&&!databaseUrl)throw new Error('Set POSTGRES_URL in Vercel project environment variables.');
const pool=usePostgres?new pg.Pool({connectionString:databaseUrl,max:1}):null,requestContext=new AsyncLocalStorage();
const hashPassword=password=>{const salt=crypto.randomBytes(16).toString('hex');return salt+':'+crypto.scryptSync(password,salt,32).toString('hex')};
const verifyPassword=(password,stored)=>{const [salt,hash]=stored.includes(':')?stored.split(':'):['resq-salt',stored];const actual=crypto.scryptSync(password,salt,32);const expected=Buffer.from(hash,'hex');return actual.length===expected.length&&crypto.timingSafeEqual(actual,expected)};
const seed=()=>({users:[],needs:[],reports:[],pledges:[],alerts:[],refresh:[],activity:[]});
let db=fs.existsSync(FILE)?JSON.parse(fs.readFileSync(FILE)):seed();
db.activity ||= [];db.users ||= [];db.reports ||= [];db.needs ||= [];db.pledges ||= [];db.alerts ||= [];db.refresh ||= [];
const removedDemoUsers=db.users.filter(u=>/@demo\.pk$/i.test(u.email));if(removedDemoUsers.length){db.users=db.users.filter(u=>!/@demo\.pk$/i.test(u.email));db.reports=db.reports.filter(r=>!r.sample);db.alerts=db.alerts.filter(a=>!a.sample);db.needs=[];db.pledges=db.pledges.filter(p=>!/sample/i.test(p.ngo||''));}
const save=()=>fs.writeFileSync(FILE,JSON.stringify(db));
if(removedDemoUsers.length||!fs.existsSync(FILE))save();
let databaseReady;
if(usePostgres){
 const initialState=JSON.parse(JSON.stringify(db));
 db=new Proxy({},{
  get:(_,key)=>{const state=requestContext.getStore()?.state||initialState;if(key==='toJSON')return()=>state;return state[key]},
  set:(_,key,value)=>{const state=requestContext.getStore()?.state||initialState;state[key]=value;return true},
  ownKeys:()=>Reflect.ownKeys(requestContext.getStore()?.state||initialState),
  getOwnPropertyDescriptor:(_,key)=>({enumerable:true,configurable:true,value:(requestContext.getStore()?.state||initialState)[key],writable:true})
 });
 databaseReady=(async()=>{
  await pool.query('CREATE TABLE IF NOT EXISTS resq_hub_state (id SMALLINT PRIMARY KEY CHECK (id = 1), state JSONB NOT NULL)');
  await pool.query('INSERT INTO resq_hub_state (id,state) VALUES (1,$1::jsonb) ON CONFLICT (id) DO NOTHING',[JSON.stringify(initialState)]);
  const client=await pool.connect();
  try{
   await client.query('BEGIN');
   const result=await client.query('SELECT state FROM resq_hub_state WHERE id=1 FOR UPDATE');
   const state=result.rows[0].state;
   if(process.env.ADMIN_EMAIL&&process.env.ADMIN_PASSWORD&&!state.users.some(u=>u.role==='Admin')){
    const email=process.env.ADMIN_EMAIL.trim().toLowerCase(),password=process.env.ADMIN_PASSWORD,name=String(process.env.ADMIN_NAME||'ResQ Hub Administrator').trim();
    if(!/^\S+@\S+\.\S+$/.test(email)||password.length<16||password.length>128)throw new Error('ADMIN_EMAIL must be valid and ADMIN_PASSWORD must be 16 to 128 characters.');
    state.users.push({id:crypto.randomUUID(),email,name,role:'Admin',pw:hashPassword(password),approved:true});
    await client.query('UPDATE resq_hub_state SET state=$1::jsonb WHERE id=1',[JSON.stringify(state)]);
   }
   await client.query('COMMIT');
  }catch(error){await client.query('ROLLBACK');throw error}finally{client.release()}
 })();
}
const clean=s=>String(s||'').replace(/<[^>]*>/g,'').trim().slice(0,500);
const app=express();app.use(express.json({limit:'10kb'}));
app.use((q,s,n)=>{s.set({'Access-Control-Allow-Origin':process.env.ORIGIN||'http://localhost:5173','Access-Control-Allow-Headers':'Content-Type,Authorization','Access-Control-Allow-Methods':'GET,POST,OPTIONS'});q.method==='OPTIONS'?s.sendStatus(204):n()});
if(usePostgres)app.use(async(q,s,n)=>{
 if(q.path==='/api/events')return n();
 let client,transaction=q.method!=='GET'&&q.method!=='HEAD';
 try{
  await databaseReady;
  client=await pool.connect();
  if(transaction)await client.query('BEGIN');
  const result=await client.query(`SELECT state FROM resq_hub_state WHERE id=1${transaction?' FOR UPDATE':''}`);
  const context={state:result.rows[0].state,dirty:false,responseStarted:false,released:false};
  const release=()=>{if(!context.released){context.released=true;client.release()}};
  s.once('close',()=>{if(!context.responseStarted){if(transaction)client.query('ROLLBACK').catch(error=>console.error('Database rollback failed:',error.message)).finally(release);else release()}});
  const send=s.send.bind(s);
  s.send=function(body){
   if(context.responseStarted)return send(body);
   context.responseStarted=true;
   return (async()=>{
    try{
     if(transaction)await client.query('UPDATE resq_hub_state SET state=$1::jsonb WHERE id=1',[JSON.stringify(context.state)]);
     if(transaction)await client.query('COMMIT');
     release();
     return send(body);
    }catch(error){
     if(transaction)await client.query('ROLLBACK').catch(rollbackError=>console.error('Database rollback failed:',rollbackError.message));
     release();
     console.error('Database request failed:',error.message);
     s.statusCode=500;s.removeHeader('Content-Length');s.setHeader('Content-Type','application/json; charset=utf-8');
     return send(JSON.stringify({error:'Could not save this request. Please try again.'}));
    }
   })();
  };
  requestContext.run(context,n);
 }catch(error){
  if(client)client.release();
  console.error('Database connection failed:',error.message);
  s.status(503).json({error:'Persistent database is unavailable.'});
 }
});
const auth=act=>(q,s,n)=>{try{q.user=jwt.verify((q.headers.authorization||'').slice(7),SECRET)}catch{return s.status(401).json({error:'Login required'})}if(act&&!can(q.user.role,act))return s.status(403).json({error:'Forbidden for your role'});n()};
const hits=new Map();const limit=(q,s,n)=>{const now=Date.now(),a=(hits.get(q.user.id)||[]).filter(t=>now-t<6e4);if(a.length>=5)return s.status(429).json({error:'Rate limit: 5 reports per minute'});a.push(now);hits.set(q.user.id,a);n()};
const clients=new Set();
const addActivity=entry=>{const item={id:crypto.randomUUID(),...entry,createdAt:new Date().toISOString()};db.activity.unshift(item);db.activity=db.activity.slice(0,100);save();clients.forEach(c=>c.write(`data: ${JSON.stringify(item)}\n\n`));return item};
const pub=u=>({id:u.id,email:u.email,name:u.name,role:u.role,approved:u.approved});
const tokens=u=>{const access=jwt.sign({id:u.id,role:u.role,name:u.name},SECRET,{expiresIn:'15m'}),refresh=crypto.randomUUID();db.refresh.push({t:refresh,id:u.id});save();return{access,refresh,user:pub(u)}};
if(process.env.ADMIN_EMAIL&&process.env.ADMIN_PASSWORD&&!db.users.some(u=>u.role==='Admin')){const email=process.env.ADMIN_EMAIL.trim().toLowerCase(),password=process.env.ADMIN_PASSWORD,name=clean(process.env.ADMIN_NAME||'ResQ Hub Administrator');if(!/^\S+@\S+\.\S+$/.test(email)||password.length<16||password.length>128)throw new Error('ADMIN_EMAIL must be valid and ADMIN_PASSWORD must be 16 to 128 characters.');db.users.push({id:crypto.randomUUID(),email,name,role:'Admin',pw:hashPassword(password),approved:true});save();console.log('Initial administrator provisioned from environment configuration.')}
app.post('/api/auth/login',(q,s)=>{const email=String(q.body?.email||'').trim().toLowerCase(),password=String(q.body?.password||''),u=db.users.find(x=>x.email===email);if(!u||!verifyPassword(password,u.pw))return s.status(401).json({error:'Invalid email or password'});if(!u.pw.includes(':')){u.pw=hashPassword(password);save()}s.json(tokens(u))});
app.post('/api/auth/register',(q,s)=>{const name=clean(q.body?.name),email=String(q.body?.email||'').trim().toLowerCase(),password=String(q.body?.password||''),role=q.body?.role;if(!/^\S+@\S+\.\S+$/.test(email)||password.length<8||password.length>128||name.length<2)return s.status(400).json({error:'Enter a valid name, email and password of 8 to 128 characters.'});if(!['Citizen','Volunteer','NGO'].includes(role))return s.status(400).json({error:'Role not allowed'});if(db.users.some(x=>x.email===email))return s.status(409).json({error:'An account with this email already exists.'});
 const u={id:crypto.randomUUID(),email,name,role,pw:hashPassword(password),approved:role!=='NGO'};db.users.push(u);save();if(role==='NGO')return s.status(201).json({pending:true});s.status(201).json(tokens(u))});
app.post('/api/auth/refresh',(q,s)=>{const r=db.refresh.find(x=>x.t===q.body?.refresh);if(!r)return s.status(401).json({error:'Invalid refresh token'});const u=db.users.find(user=>user.id===r.id);if(!u)return s.status(401).json({error:'Account no longer exists'});db.refresh=db.refresh.filter(x=>x!==r);s.json(tokens(u))});
app.post('/api/auth/logout',(q,s)=>{const token=q.body?.refresh;db.refresh=db.refresh.filter(x=>x.t!==token);save();s.sendStatus(204)});
app.get('/api/dashboard',(q,s)=>{const publicReports=db.reports.filter(r=>r.public),committed=db.pledges.filter(p=>['Committed','Dispatched'].includes(p.status));s.json({reports:publicReports.length,verified:publicReports.filter(r=>r.status==='Verified').length,openNeeds:db.needs.filter(n=>n.needed-(n.delivered||0)-committed.filter(p=>p.needId===n.id).reduce((total,p)=>total+p.amount,0)>0).length,deliveries:db.pledges.filter(p=>p.status==='Delivered').length})});
app.get('/api/activity',(q,s)=>s.json(db.activity));
app.get('/api/alerts',(q,s)=>s.json(db.alerts));
app.get('/api/needs',(q,s)=>s.json(db.needs.map(n=>({...n,pledged:db.pledges.filter(p=>p.needId===n.id&&!['Delivered','Cancelled'].includes(p.status)).reduce((a,p)=>a+p.amount,0)}))));
app.post('/api/needs',auth('moderate'),(q,s)=>{const cat=clean(q.body?.cat),needed=Number(q.body?.needed),priority=Number(q.body?.priority),area=clean(q.body?.area);if(!cat||!Number.isInteger(needed)||needed<1||needed>100000000||!Number.isInteger(priority)||priority<1||priority>100||!AREA_NAMES.includes(area))return s.status(400).json({error:'Enter a valid need category, amount, priority and area.'});const n={id:crypto.randomUUID(),cat,needed,delivered:0,priority,area};db.needs.push(n);addActivity({type:'need',title:'A verified community need was published',description:`A ${cat.toLowerCase()} need is open in ${area}.`,area});s.status(201).json(n)});
app.get('/api/pledges',auth(),(q,s)=>s.json(db.pledges));
app.get('/api/reports',auth(),(q,s)=>s.json(db.reports.filter(r=>r.public||q.user.role==='Admin')));
app.post('/api/reports',auth('report'),limit,(q,s)=>{const {hazard,lat,lng,desc,people,district}=q.body;if(hazard!=='Flood'||!Number.isFinite(+lat)||Math.abs(+lat)>90||!Number.isFinite(+lng)||Math.abs(+lng)>180||clean(desc).length<5||!Number.isFinite(+people)||+people<0||!AREA_NAMES.includes(district))return s.status(400).json({error:'Enter a valid flood report, location, description, affected-person count and Ravi-side area.'});
 const base={hazard,lat:+(+lat).toFixed(2),lng:+(+lng).toFixed(2),time:Date.now(),source:{Volunteer:'volunteer',NGO:'ngo',Admin:'authorized'}[q.user.role]||'citizen'};const r={...base,...assess(base,db.reports),id:'RQ-'+crypto.randomUUID().slice(0,8).toUpperCase(),district,desc:clean(desc),people:+people,public:false,srcs:[base.source]};db.reports.push(r);save();s.status(201).json(r)});
app.post('/api/reports/:id/moderate',auth('moderate'),(q,s)=>{const r=db.reports.find(x=>x.id===q.params.id);if(!r)return s.sendStatus(404);const a=q.body.action;if(a==='approve')r.public=true;else if(a==='reject')r.status='Rejected';else if(a==='duplicate')r.status='Duplicate';else return s.status(400).json({error:'Bad action'});save();if(a==='approve')addActivity({type:'report',title:'A community report was verified',description:`A ${r.hazard.toLowerCase()} report was verified for ${r.district}.`,area:r.district});s.json(r)});
app.post('/api/pledges',auth('pledge'),(q,s)=>{const u=db.users.find(x=>x.id===q.user.id);if(!u.approved)return s.status(403).json({error:'NGO pending admin approval'});const need=db.needs.find(n=>n.id===q.body.needId);if(!need)return s.sendStatus(404);
 const r=tryPledge(need,db.pledges,u.name,+q.body.amount,db.needs);if(!r.ok)return s.status(409).json(r);db.pledges.push(r.pledge);save();s.status(201).json(r)});
app.post('/api/pledges/:id/advance',auth('delivery'),(q,s)=>{const p=db.pledges.find(x=>x.id===q.params.id);if(!p)return s.sendStatus(404);const o=['Committed','Dispatched','Delivered'],i=o.indexOf(p.status);if(i<0)return s.status(409).json({error:'Already final'});p.status=o[i+1];if(p.status==='Delivered')db.needs.find(n=>n.id===p.needId).delivered+=p.amount;save();s.json(p)});
app.get('/api/events',(q,s)=>{s.set({'Content-Type':'text/event-stream','Cache-Control':'no-cache',Connection:'keep-alive'});s.write(': ok\n\n');clients.add(s);const hb=setInterval(()=>s.write(': hb\n\n'),25e3);q.on('close',()=>{clearInterval(hb);clients.delete(s)})});
app.post('/api/alerts',auth('broadcast'),(q,s)=>{const a={id:Date.now(),hazard:clean(q.body.hazard),sev:clean(q.body.sev),district:clean(q.body.district),en:clean(q.body.en)};if(!a.en||!['High','Medium','Low'].includes(a.sev)||!AREA_NAMES.includes(a.district)||a.hazard!=='Flood')return s.status(400).json({error:'Enter a valid flood update, severity and area.'});db.alerts.unshift(a);save();const item=addActivity({type:'alert',title:`${a.sev} flood update published`,description:a.en,area:a.district});s.status(201).json({...a,activityId:item.id})});
app.get('/api/users',auth('moderate'),(q,s)=>s.json(db.users.map(pub)));
app.post('/api/users/:id/approve',auth('moderate'),(q,s)=>{const u=db.users.find(x=>x.id==q.params.id);if(!u)return s.sendStatus(404);u.approved=true;save();s.json(pub(u))});
app.use((q,s)=>s.sendStatus(404));
if(!usePostgres)app.listen(PORT,()=>console.log('ResQ Hub API on http://localhost:'+PORT));
export default app;
