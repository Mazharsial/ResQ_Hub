// Signature motif: Alert (pulse) -> Verify (ring fills with check) -> Connect (flowing lines to NGO nodes)
export default function Network({label='Animation: a flood alert is verified, then connected to NGOs and relief centers'}){
 const ngo=[[260,40],[270,130],[230,215]];
 return(<svg viewBox="0 0 300 260" role="img" aria-label={label} style={{width:'100%',maxWidth:420}}>
  <path d="M140 10C90 60 130 100 110 130S120 230 95 255" fill="none" stroke="#4DA3FF" strokeWidth="14" opacity=".35" strokeLinecap="round"/><text x="150" y="30" fontSize="9" fill="#fff">Ravi River</text>
  {ngo.map(([x,y],i)=><g key={i}><path className="flow" d={`M110 110Q${(110+x)/2} ${y-40} ${x} ${y}`} fill="none" stroke="var(--primary)" strokeWidth="2" style={{animationDelay:i*.3+'s'}}/><circle cx={x} cy={y} r="12" fill="var(--green)"/><text x={x} y={y+4} fontSize="10" textAnchor="middle" fill="#fff">NGO</text></g>)}
  <circle className="ripple" cx="110" cy="110" r="8" fill="var(--red)"/><circle cx="110" cy="110" r="8" fill="var(--red)"/>
  <circle className="ringdraw" cx="110" cy="110" r="16" pathLength="100" fill="none" stroke="var(--green)" strokeWidth="3"/>
 </svg>)}
