// Mock service. Swap internals for fetch() calls to the real backend in Stage 5; the UI only calls these functions.
const call=async(u,b)=>{let r;try{r=await fetch(u,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)})}catch{throw new Error('Cannot reach the server. Please try again shortly.')}const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.error||'Request failed.');return j};
export const contact=b=>call('/api/contact',b);
const wait=ms=>new Promise(r=>setTimeout(r,ms));
export const api={
 async login(email,pw){return (await call('/api/auth/login',{email,password:pw})).user},
 async register({name,email,role,pw}){const r=await call('/api/auth/register',{name,email,role,password:pw});return{...r.user,pending:!r.user.approved}},
 async kpis(){await wait(600);return{alerts:12,affected:24000,delivered:850+db.pledges.filter(p=>p.status==='Delivered').reduce((a,p)=>a+p.amount,0),volunteers:150}},
 async feed(){const n=Date.now();return[{t:'New flood report received',s:'Citizen',k:'report',area:'Shahdara',at:n-12e4},{t:'Report cross-checked by a field volunteer',s:'Volunteer',k:'verify',area:'Rana Town',at:n-42e4},{t:'Food packs pledged to a verified need',s:'Relief partner',k:'relief',area:'Ravi Road',at:n-9e5},{t:'Authorized source confirmed rising water',s:'Authorized',k:'alert',area:'Park View',at:n-15e5},{t:'Clean water delivery dispatched',s:'Relief partner',k:'relief',area:'Manga',at:n-24e5}]},
};
export const PINS=AREAS;
import {km,assess,can,priority,tryPledge,remaining} from './core.js';
export const xy=(lat,lng)=>[50+(lng-61)/16*190,15+(37-lat)/13*270];
import {AREAS} from './geo.js';export const DISTRICTS=AREAS;
export const nearest=(lat,lng)=>DISTRICTS.map(d=>[d[0],(d[1]-lat)**2+(d[2]-lng)**2]).sort((a,b)=>a[1]-b[1])[0][0];
const T0=Date.now();
export const db={reports:[{id:'RQ-1001',hazard:'Flood',district:'Shahdara',lat:31.62,lng:74.3,time:T0-72e5,source:'citizen',status:'Verified',confidence:.75,public:true,sample:true,srcs:['citizen','volunteer','authorized']},{id:'RQ-1002',hazard:'Flood',district:'Ravi Road',lat:31.6,lng:74.3,time:T0-3e6,source:'volunteer',status:'Verified',confidence:.5,public:true,sample:true,srcs:['volunteer','ngo']},{id:'RQ-1003',hazard:'Flood',district:'Bund Road',lat:31.57,lng:74.26,time:T0-9e5,source:'citizen',status:'Pending',confidence:.25,public:false,sample:true,srcs:['citizen']}],
 needs:[{id:'food',cat:'Food',needed:12500,delivered:0,priority:95},{id:'water',cat:'Clean Water',needed:8200,delivered:0,priority:90},{id:'shelter',cat:'Shelter',needed:3750,delivered:0,priority:78},{id:'medical',cat:'Medical Aid',needed:2100,delivered:0,priority:70}],
 pledges:[{id:'P0',needId:'food',ngo:'Relief Partner A',amount:4000,status:'Dispatched'}],
 areas:[{n:'Shahdara',affected:120000,vul:.45,unmet:.85,age:6},{n:'Ravi Road',affected:60000,vul:.4,unmet:.7,age:4},{n:'Bund Road',affected:40000,vul:.3,unmet:.6,age:2},{n:'Rana Town',affected:55000,vul:.42,unmet:.65,age:3},{n:'Park View',affected:30000,vul:.35,unmet:.5,age:2},{n:'Manga',affected:22000,vul:.38,unmet:.55,age:1}],
 alerts:[{id:1,hazard:'Flood',sev:'High',district:'Shahdara',en:'Flood alert: Ravi river water is rising near Shahdara. Move to higher ground and avoid crossing flooded roads.',simple:'Flood is coming. Go to high ground. Do not walk in water.',ur:'شاہدرہ کے قریب دریائے راوی کا پانی بڑھ رہا ہے۔ بلند جگہ پر جائیں۔',icons:'🌊⬆️🚫'},{id:2,hazard:'Flood',sev:'Medium',district:'Ravi Road',en:'Water level rising along Ravi Road. Prepare to move family and documents to safety.',simple:'Water is rising. Get ready to move.',ur:'راوی روڈ پر پانی کی سطح بڑھ رہی ہے۔ تیار رہیں۔',icons:'🌊🎒'},{id:3,hazard:'Flood',sev:'Low',district:'Bund Road',en:'Water level stable near Bund Road. Stay informed.',simple:'Water is steady. Stay alert.',ur:'بند روڈ کے قریب پانی کی سطح مستحکم ہے۔',icons:'🌊✅'}],
 queue:[],stamps:[]};
const clean=s=>String(s||'').replace(/<[^>]*>/g,'').trim().slice(0,500);
export function submitReport(user,r){if(!can(user.role,'report'))throw new Error('Not allowed.');const now=Date.now();db.stamps=db.stamps.filter(t=>now-t<6e4);if(db.stamps.length>=5)throw new Error('Rate limit: max 5 reports per minute.');
 if(r.img&&(!/^image\/(png|jpeg)$/.test(r.img.type)||r.img.size>2e6))throw new Error('Image must be PNG/JPEG under 2 MB.');if(!r.pin)throw new Error('Drop a pin first.');if(km(r.pin,{lat:31.55,lng:74.25})>45)throw new Error('ResQ Hub currently covers the Ravi river side of Lahore only.');
 db.stamps.push(now);const lat=+r.pin.lat.toFixed(2),lng=+r.pin.lng.toFixed(2);const base={hazard:r.type,lat,lng,time:now,source:user.role==='Volunteer'?'volunteer':user.role==='NGO'?'ngo':'citizen'};
 const a=assess(base,db.reports);const rep={...base,...a,id:'RQ-'+(1004+db.reports.length),district:nearest(lat,lng),desc:clean(r.desc),people:Math.max(0,+r.people||0),public:false,srcs:[base.source]};
 if(!navigator.onLine){db.queue.push(rep);return{...rep,queued:true}}db.reports.push(rep);return rep}
addEventListener('online',()=>{db.reports.push(...db.queue.splice(0))});
export function pledge(user,needId,amount){if(!can(user.role,'pledge'))throw new Error('Only approved NGOs can pledge.');const need=db.needs.find(n=>n.id===needId);const r=tryPledge(need,db.pledges,user.name,+amount,db.needs);if(r.ok)db.pledges.push(r.pledge);return r}
export function advance(user,id){if(!can(user.role,'delivery'))throw new Error('Not allowed.');const p=db.pledges.find(x=>x.id===id);const o=['Committed','Dispatched','Delivered'];const i=o.indexOf(p.status);if(i>=0){p.status=o[i+1];if(p.status==='Delivered')db.needs.find(n=>n.id===p.needId).delivered+=p.amount}}
export const areaScores=()=>{const m=Math.max(...db.areas.map(a=>a.affected));return db.areas.map(a=>({...a,score:priority(a,m)})).sort((a,b)=>b.score-a.score)};
export {remaining};
