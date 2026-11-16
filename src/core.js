// Core logic (section 5). Pure functions, tested in test/core.test.js
export const km=(a,b)=>{const r=x=>x*Math.PI/180,h=Math.sin(r(b.lat-a.lat)/2)**2+Math.cos(r(a.lat))*Math.cos(r(b.lat))*Math.sin(r(b.lng-a.lng)/2)**2;return 12742*Math.asin(Math.sqrt(h))};
const live=x=>x.status!=='Rejected'&&x.status!=='Duplicate';
export function assess(r,existing){const same=existing.filter(e=>live(e)&&e.hazard===r.hazard);
 if(same.some(e=>km(r,e)<=.5&&Math.abs(r.time-e.time)<=36e5))return{status:'Duplicate',confidence:0};
 const near=same.filter(e=>km(r,e)<=5&&Math.abs(r.time-e.time)<=216e5);const types=new Set([r.source,...near.map(e=>e.source)]);const auth=types.has('authorized');
 const confidence=Math.min(1,types.size/4+(auth?.5:0));
 return{status:auth||types.size>=2?'Verified':near.length?'Cross-checking':'Pending',confidence}}
export const PRIORITY_FORMULA='Priority = 40% verified affected (vs max) + 25% vulnerable share + 25% unmet-need ratio + 10% age of oldest unmet need (7 days = max)';
export const priority=(a,maxAffected)=>Math.round(100*(.4*Math.min(1,a.affected/maxAffected)+.25*a.vul+.25*a.unmet+.1*Math.min(1,a.age/7)));
export const remaining=(need,pledges)=>need.needed-pledges.filter(p=>p.needId===need.id&&p.status!=='Cancelled').reduce((s,p)=>s+p.amount,0);
export function tryPledge(need,pledges,ngo,amount,needs){const rem=remaining(need,pledges);
 if(!(amount>0))return{ok:false,error:'Enter a positive amount.'};if(amount>rem)return{ok:false,error:`Over-pledge blocked: only ${rem} remaining.`};
 const dup=pledges.some(p=>p.needId===need.id&&p.ngo!==ngo&&p.status!=='Cancelled');
 const next=needs.filter(n=>n.id!==need.id&&remaining(n,pledges)>0).sort((a,b)=>b.priority-a.priority)[0];
 return{ok:true,pledge:{id:'P'+(pledges.length+1),needId:need.id,ngo,amount,status:'Committed'},warning:dup?'Another NGO already covers this need.':null,suggestion:dup&&next?next.id:null}}
const PERM={report:['Citizen','Volunteer','NGO','Admin'],feedback:['Citizen','Volunteer','NGO','Admin'],task:['Volunteer','Admin'],pledge:['NGO','Admin'],delivery:['NGO','Admin'],moderate:['Admin'],broadcast:['Admin']};
export const can=(role,action)=>(PERM[action]||[]).includes(role);
