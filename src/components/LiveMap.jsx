import {useEffect,useRef} from 'react';import L from 'leaflet';import 'leaflet/dist/leaflet.css';import {CENTER,RAVI} from '../geo';
const col={alert:'#E5393B',shelter:'#F5A524',relief:'#2EA44F'};
// Real OpenStreetMap tiles (needs internet). Offline: the Ravi river line and markers still draw on a blue-grey base.
export default function LiveMap({markers=[],onPick,height=320}){const el=useRef(),lay=useRef(),pick=useRef();pick.current=onPick;
 useEffect(()=>{const m=L.map(el.current,{center:CENTER,zoom:12,scrollWheelZoom:false});L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:'© OpenStreetMap contributors'}).addTo(m);
  L.polyline(RAVI,{color:'#258BCB',weight:28,opacity:.18,lineCap:'round'}).addTo(m);L.polyline(RAVI,{color:'#1769AA',weight:5,opacity:.85}).bindTooltip('Approximate Ravi River path; not a flood-risk boundary').addTo(m);
  lay.current=L.layerGroup().addTo(m);m.on('click',e=>pick.current&&pick.current(e.latlng));setTimeout(()=>m.invalidateSize(),100);return()=>m.remove()},[]);
 useEffect(()=>{lay.current.clearLayers();markers.forEach(k=>{const c=col[k.kind||'alert'];L.marker([k.lat,k.lng],{icon:L.divIcon({className:'',iconSize:[14,14],html:`<span class="pin" style="background:${c};color:${c}"></span>`})}).bindTooltip(k.label||'').on('click',()=>k.onClick&&k.onClick()).addTo(lay.current)})});
 return<div ref={el} style={{height,borderRadius:12,background:'#cfe0f5'}} role="application" aria-label="Map of Lahore, Ravi side"/>}
