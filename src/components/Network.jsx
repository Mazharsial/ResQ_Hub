export default function Network({label='Animated map showing a community report being verified and connected to relief teams'}){
 return <svg className="network-visual" viewBox="0 0 520 340" role="img" aria-label={label}>
  <rect className="network-map" x="8" y="8" width="504" height="324" rx="20"/>
  <text className="network-map-title" x="28" y="34">COMMUNITY RESPONSE MAP</text>
  <text className="network-map-label" x="370" y="34">REPORT · VERIFY · RELIEF</text>
  <path className="network-road" d="M22 78H498M24 176H496M28 257H495M70 48V268M179 54V270M316 52V268M455 50V270"/>
  <path className="network-river" d="M274 44C236 78 290 111 258 145S287 207 245 264"/>
  <text className="network-river-label" x="282" y="90">RIVER</text>
  <path className="network-flood-zone" d="M49 85Q80 66 116 89L124 131Q86 151 51 130Z"/>

  <path className="network-link network-link-report" d="M88 107Q166 111 245 160"/>
  <path className="network-link network-link-verify" d="M260 153Q315 105 359 93"/>
  <path className="network-link network-link-relief" d="M270 172Q343 205 413 225"/>
  <path className="network-link network-link-delivery" d="M401 236Q264 281 111 123"/>

  <g className="network-community">
   <circle className="network-community-ring" cx="87" cy="107" r="22"/>
   <circle cx="87" cy="107" r="11" fill="#E5393B"/>
   <path d="M81 107l6-6 6 6v7H81z" fill="#fff"/>
   <text className="network-node-label" x="46" y="145">COMMUNITY</text>
  </g>
  <g className="network-community-node">
   <circle cx="107" cy="225" r="8" fill="#4DA3FF"/>
   <path d="M103 225l4-4 4 4v5h-8z" fill="#fff"/>
   <text className="network-map-label" x="55" y="245">Residents</text>
  </g>
  <g className="network-community-node">
   <circle cx="421" cy="82" r="8" fill="#4DA3FF"/>
   <path d="M417 82l4-4 4 4v5h-8z" fill="#fff"/>
   <text className="network-map-label" x="385" y="105">Field team</text>
  </g>

  <g className="network-verification">
   <circle cx="258" cy="162" r="25" fill="#1558D6" stroke="#fff" strokeWidth="2"/>
   <path d="M251 162l5 5 10-11" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
   <text className="network-node-label" x="222" y="198">VERIFIED</text>
  </g>
  <g className="network-relief-node">
   <circle cx="414" cy="228" r="20" fill="#2EA44F" stroke="#fff" strokeWidth="2"/>
   <path d="M404 228h12v8h-12zM416 231h5l4 4v1h-9z" fill="#fff"/>
   <circle cx="408" cy="238" r="2" fill="#1558D6"/>
   <circle cx="420" cy="238" r="2" fill="#1558D6"/>
   <text className="network-node-label" x="380" y="259">RELIEF PARTNER</text>
  </g>
  <g className="network-delivery-point">
   <circle cx="104" cy="121" r="5" fill="#F5A524"/>
   <path d="M104 121Q245 279 414 228" fill="none" stroke="#F5A524" strokeWidth="2" strokeDasharray="4 7"/>
  </g>

  <rect className="network-step-panel" x="20" y="278" width="480" height="42" rx="12"/>
  <g className="network-step network-step-one">
   <circle cx="43" cy="299" r="12" fill="#E5393B"/><text className="network-step-number" x="43" y="303">1</text>
   <text className="network-step-copy" x="64" y="304">Map a local flood report</text>
  </g>
  <g className="network-step network-step-two">
   <circle cx="43" cy="299" r="12" fill="#1558D6"/><text className="network-step-number" x="43" y="303">2</text>
   <text className="network-step-copy" x="64" y="304">Community teams verify the signal</text>
  </g>
  <g className="network-step network-step-three">
   <circle cx="43" cy="299" r="12" fill="#2EA44F"/><text className="network-step-number" x="43" y="303">3</text>
   <text className="network-step-copy" x="64" y="304">Match verified needs with relief partners</text>
  </g>
  <g className="network-step network-step-four">
   <circle cx="43" cy="299" r="12" fill="#F5A524"/><text className="network-step-number" x="43" y="303">4</text>
   <text className="network-step-copy" x="64" y="304">Track support through delivery</text>
  </g>
 </svg>
}
