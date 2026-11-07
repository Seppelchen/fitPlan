// FitPlan – Kalender aus FamilyWall übernehmen (iCal-Link, .ics-Datei, Text)
/* ---------- Kalender aus FamilyWall übernehmen: iCal-Link, Kalenderdatei (.ics) oder kopierter Text ---------- */
const icsUn=v=>String(v||"").replace(/\\n/gi,"\n").replace(/\\([,;:\\])/g,"$1").trim();
function icsDt(x){if(!x)return null;const m=String(x.v).match(/^(\d{4})(\d\d)(\d\d)(?:T(\d\d)(\d\d)(?:\d\d)?(Z)?)?/);if(!m)return null;
  const d=ymd(+m[1],+m[2],+m[3]);if(!d)return null;
  if(!m[4]||/VALUE=DATE(;|$)/.test(x.p))return{d,all:true};
  if(m[6]){const D=new Date(Date.UTC(+m[1],m[2]-1,+m[3],+m[4],+m[5]));return{d:iso(D),s:p2(D.getHours())+":"+p2(D.getMinutes())}}  // UTC → Ortszeit
  return{d,s:m[4]+":"+m[5]}}
const ICD={MO:0,TU:1,WE:2,TH:3,FR:4,SA:5,SU:6};
function icsRule(v,st){const P={};String(v).split(";").forEach(kv=>{const i=kv.indexOf("=");if(i>0)P[kv.slice(0,i).toUpperCase()]=kv.slice(i+1).toUpperCase()});
  const f={DAILY:"d",WEEKLY:"w",MONTHLY:"m",YEARLY:"y"}[P.FREQ];if(!f)return null;const r={f},i=parseInt(P.INTERVAL);if(i>1)r.i=Math.min(i,99);
  if(P.UNTIL){const u=icsDt({p:"",v:P.UNTIL});if(u)r.u=u.d}else if(+P.COUNT>0)r.c=Math.min(+P.COUNT,9999);
  if(P.BYDAY){const L=P.BYDAY.split(",").map(x=>x.match(/^([+-]?\d{1,2})?(MO|TU|WE|TH|FR|SA|SU)$/)).filter(Boolean);
    if(f==="w"){const W=L.map(m=>ICD[m[2]]);if(W.length&&!(W.length===1&&W[0]===wdi(st)))r.wd=W}
    else if((f==="m"||f==="y")&&L.length===1&&L[0][1]){const n=+L[0][1];if(n>=-1&&n!==0&&n<=5)r.nth=[n,ICD[L[0][2]]]}}
  return r}
const bdName=n=>String(n).replace(/[🎂🎉🎈🥳]/gu,"").replace(/\(\s*\d{1,3}\s*\)/g,"").replace(/\b(geburtstag|birthday)(\s+(von|of))?\b|\bb-?day\b/gi,"").replace(/[’']s\b/g,"").replace(/^[\s:,–—-]+|[\s:,–—-]+$/g,"").replace(/\s{2,}/g," ").trim().slice(0,60);
const BDRX=/geburtstag|birthday|\bb-?day\b|🎂/i;
function icsParse(txt){const V=[];let cur=null,dep=0;
  String(txt).replace(/\r\n?/g,"\n").replace(/\n[ \t]/g,"").split("\n").forEach(l=>{
    if(/^BEGIN:VEVENT\s*$/i.test(l)){cur={};dep=0;return}if(!cur)return;
    if(/^END:VEVENT\s*$/i.test(l)){V.push(cur);cur=null;return}
    if(/^BEGIN:/i.test(l)){dep++;return}if(/^END:/i.test(l)){dep--;return}if(dep>0)return;  // z. B. Erinnerungen (VALARM)
    const m=l.match(/^([A-Za-z0-9-]+)((?:;(?:[^:;"]|"[^"]*")*)*):(.*)$/);if(!m)return;const k=m[1].toUpperCase(),x={p:m[2].toUpperCase(),v:m[3]};
    if(k==="EXDATE")(cur.EX=cur.EX||[]).push(...x.v.split(",").map(v=>({p:x.p,v})));else if(!cur[k])cur[k]=x});
  const evs=[],bds=[],xs={},yr=new Date().getFullYear();
  V.forEach(e=>{const st=icsDt(e.DTSTART);if(!st)return;const uid=e.UID?e.UID.v:"",rid=e["RECURRENCE-ID"]?icsDt(e["RECURRENCE-ID"]):null;
    if(rid&&uid)(xs[uid]=xs[uid]||[]).push(rid.d);  // geänderter Einzeltermin einer Serie: in der Serie auslassen
    if(e.STATUS&&/CANCELLED/i.test(e.STATUS.v))return;
    const n=icsUn(e.SUMMARY&&e.SUMMARY.v).slice(0,120)||"(ohne Titel)",ev={n,d:st.d},en=icsDt(e.DTEND);
    if(st.all){if(en&&en.all){const l=addDays(en.d,-1);if(l>st.d)ev.e=l}}
    else{ev.s=st.s;if(en&&!en.all&&en.d>=st.d){if(en.s==="00:00"&&en.d>st.d){const l=addDays(en.d,-1);if(l>st.d)ev.e=l}else{if(en.d>st.d)ev.e=en.d;if(en.d>st.d||en.s>st.s)ev.z=en.s}}}
    const o=icsUn(e.LOCATION&&e.LOCATION.v);if(o)ev.o=o.slice(0,120);const no=icsUn(e.DESCRIPTION&&e.DESCRIPTION.v);if(no)ev.no=no.slice(0,500);
    if(e.RRULE&&!rid){const r=icsRule(e.RRULE.v,st.d);if(r)ev.r=r}
    if(e.EX&&ev.r){const x=e.EX.map(icsDt).filter(Boolean).map(x=>x.d);if(x.length)ev.x=[...new Set(x)].slice(0,200)}
    // Geburtstag: ganztägig, jährlich (oder als Geburtstag markiert) und so benannt
    const cat=e.CATEGORIES?e.CATEGORIES.v:"";
    if(st.all&&!rid&&BDRX.test(n+" "+cat)&&(ev.r&&ev.r.f==="y"||/birthday|geburtstag/i.test(cat))){const nm=bdName(n),y=+st.d.slice(0,4);
      if(nm){bds.push({id:"g"+syHash(nm.toLowerCase()+"|"+st.d.slice(5)),v:{n:nm,d:st.d.slice(5),y:y>=1900&&y<=yr?y:undefined}});return}}
    evs.push({id:"c"+syHash((uid||n+"|"+st.d+"|"+(st.s||""))+"|"+(rid?rid.d:"")),v:ev,u:uid})});
  evs.forEach(o=>{if(o.v.r&&o.u&&xs[o.u])o.v.x=[...new Set([...(o.v.x||[]),...xs[o.u]])].slice(0,300);delete o.u});
  return{evs,bds}}
// Freier Text (aus FamilyWall geteilt oder kopiert): Zeilen mit Datum, Uhrzeit und Titel – auch Datum als Überschrift
const TMO={jan:1,feb:2,"mär":3,mae:3,mar:3,apr:4,mai:5,may:5,jun:6,jul:7,aug:8,sep:9,okt:10,oct:10,nov:11,dez:12,dec:12};
const txtYear=(m,d)=>{const t=todayK(),y=+t.slice(0,4);let k=ymd(y,m,d);if(k&&dayDiff(k,t)>60)k=ymd(y+1,m,d);return k||ymd(y+1,m,d)};
function txtDate(l){let m=l.match(/(\d{4})-(\d\d)-(\d\d)/);if(m)return{k:ymd(+m[1],+m[2],+m[3]),m:m[0]};
  m=l.match(/(?:^|[^\d])(\d{1,2})\.(\d{1,2})\.(\d{4}|\d\d(?!\d))?/);if(m){const y=m[3]?(m[3].length===2?2000+ +m[3]:+m[3]):0;return{k:y?ymd(y,+m[2],+m[1]):txtYear(+m[2],+m[1]),m:m[0]}}
  m=l.match(/(\d{1,2})\.?\s*(januar|jan|februar|feb|märz|maerz|mär|march|mar|april|apr|mai|may|juni|june|jun|juli|july|jul|august|aug|september|sept|sep|oktober|october|okt|oct|november|nov|dezember|december|dez|dec)\.?(?![a-zäöü])(?:,?\s+(\d{4}))?/i);if(m){const mo=TMO[m[2].toLowerCase().slice(0,3)];return{k:m[3]?ymd(+m[3],mo,+m[1]):txtYear(mo,+m[1]),m:m[0]}}
  m=l.match(/^\s*(heute|morgen|übermorgen)\b/i);if(m)return{k:addDays(todayK(),{heute:0,morgen:1,"übermorgen":2}[m[1].toLowerCase()]),m:m[0]};
  return null}
function txtTime(l){let m=l.match(/(\d{1,2})[:.](\d{2})\s*(?:uhr)?(?:\s*(?:-|–|—|bis)\s*(\d{1,2})[:.](\d{2})\s*(?:uhr)?)?/i);
  if(m&&+m[1]<24&&+m[2]<60)return{s:p2(+m[1])+":"+m[2],z:m[3]&&+m[3]<24&&+m[4]<60?p2(+m[3])+":"+m[4]:undefined,m:m[0]};
  m=l.match(/\b(?:um\s+)?(\d{1,2})\s*uhr\b/i);if(m&&+m[1]<24)return{s:p2(+m[1])+":00",m:m[0]};return null}
const txtClean=l=>l.replace(/\b(montag|dienstag|mittwoch|donnerstag|freitag|samstag|sonntag)\b,?/gi,"").replace(/(^|\s)(mo|di|mi|do|fr|sa|so)\.?,?(?=\s|$)/gi,"$1")
  .replace(/\bganzt[äa]gig\b|\bden ganzen tag\b|\buhr\b/gi,"").replace(/\s{2,}/g," ").replace(/^[\s,;:·|•\-–—]+|[\s,;:·|•\-–—]+$/g,"").trim();
function txtParse(t){const out=[];let pend="",hdr=null,last=null;const mk=(n,d,T)=>{last={n:n.slice(0,120),d,s:T?T.s:undefined,z:T&&T.z||undefined};out.push(last)};
  String(t||"").split(/\r?\n/).forEach(raw=>{const l=raw.replace(/️/g,"").trim();if(!l||/familywall|gesendet mit|kostenlos verfügbar|https?:\/\/|webcal:|BEGIN:|END:/i.test(l))return;
    const D=txtDate(l);let rest=D?l.replace(D.m," "):l;const T=txtTime(rest);if(T)rest=rest.replace(T.m," ");rest=txtClean(rest);
    const okT=rest.length>=2&&!/^\d+$/.test(rest);
    if(D){if(!D.k)return;if(okT){mk(rest,D.k,T);hdr=null}else if(pend){mk(pend,D.k,T);hdr=null}else{hdr={k:D.k,T};last=null}pend="";return}
    if(!okT){if(T){if(last&&!last.s){last.s=T.s;if(T.z)last.z=T.z}else if(hdr)hdr.T=T}return}
    if(hdr){mk(rest,hdr.k,T||hdr.T);hdr.T=null}else pend=rest});
  return out}
const looksCal=t=>/BEGIN:V(CALENDAR|EVENT)/i.test(t)||/^\s*webcal:\/\//i.test(t)||!/[❏❑☐□▢◻⬜☑☒✓✔✅]/u.test(t)&&txtParse(t).length>0;
async function calFetch(u){const url=String(u).trim().replace(/^webcal:\/\//i,"https://");if(!/^https:\/\//i.test(url))throw new Error("Der Link muss mit https:// oder webcal:// beginnen.");
  let r;try{r=await fetch(url,{cache:"no-store",credentials:"omit"})}
  catch(e){throw new Error(navigator.onLine===false?"Kein Internet.":"Der Link lässt sich von FitPlan aus nicht direkt laden (der Anbieter erlaubt das nicht). Öffne den Link am PC im Browser, speichere die Kalenderdatei (.ics) und schick sie dir aufs Handy (z. B. per Mail oder in die Dateien-App). Dann hier „Kalenderdatei wählen“.")}
  if(!r.ok)throw new Error("Der Link funktioniert nicht (Fehler "+r.status+"). Erzeuge in FamilyWall einen neuen iCal-Link.");
  const t=await r.text();if(!/BEGIN:VCALENDAR/i.test(t))throw new Error("Unter dem Link steht kein Kalender.");return t}
// Übernehmen: gleiche Termine (gleiche ID) werden aktualisiert, nicht verdoppelt. src "fw" = aus verknüpftem Link.
function calApply(P,o){o=o||{};const t=todayK(),C=famMap("cal"),G=famMap("bd"),src=o.src||"";
  let E=P.evs.filter(x=>!(o.drop&&!x.v.r&&(x.v.e||x.v.d)<t));
  const fresh=E.filter(x=>!C[x.id]),room=Math.max(0,FAM_MAX.cal-Object.keys(C).length);let cut=0;
  if(fresh.length>room){const key=x=>x.v.r?"9999":x.v.e||x.v.d,keep=new Set(fresh.sort((a,b)=>key(b).localeCompare(key(a))).slice(0,room).map(x=>x.id));cut=fresh.length-room;E=E.filter(x=>C[x.id]||keep.has(x.id))}
  const bak={cal:{},bd:{}},LE=[],LB=[],same=(a,b)=>JSON.stringify({...a,t:0})===JSON.stringify({...b,t:0});
  E.forEach(x=>{const old=C[x.id],v={...x.v,src:src||undefined,dv:old?old.dv:undefined,b:old?old.b:undefined};if(old&&same(old,{...v,t:old.t}))return;bak.cal[x.id]=old||null;LE.push([x.id,JSON.parse(JSON.stringify(v))])});
  if(src){const ids=new Set(E.map(x=>x.id));Object.entries(C).forEach(([id,x])=>{if(x.src===src&&famMine(x)&&!ids.has(id)){bak.cal[id]=x;LE.push([id,null])}})}  // im Link gelöschte Termine
  if(o.bd!==false){const have=new Set(Object.values(G).filter(bdOk).map(x=>x.n.toLowerCase()+"|"+x.d));
    P.bds.forEach(x=>{if(G[x.id]||have.has(x.v.n.toLowerCase()+"|"+x.v.d)||Object.keys(G).length+LB.length>=FAM_MAX.bd)return;have.add(x.v.n.toLowerCase()+"|"+x.v.d);bak.bd[x.id]=null;LB.push([x.id,JSON.parse(JSON.stringify(x.v))])})}
  famSetN("cal",LE);famSetN("bd",LB);
  return{n:LE.filter(x=>x[1]).length,b:LB.length,cut,undo:()=>{famSetN("cal",Object.entries(bak.cal));famSetN("bd",Object.entries(bak.bd));renderFam()}}}
async function calSubRefresh(force){const c=S.icu;if(!c||calSubBusy||!force&&Date.now()-c.at<3*36e5)return;calSubBusy=true;
  try{const P=icsParse(await calFetch(c.u));calApply(P,{src:"fw",drop:c.old,bd:c.bd});c.err="";if(force)toast("FamilyWall-Kalender aktualisiert")}
  catch(e){c.err=e.message;if(force)toast("Aktualisieren hat nicht geklappt")}finally{c.at=Date.now();calSubBusy=false;save();renderFam()}}
function calImport(pre){const canRead=!!(navigator.clipboard&&navigator.clipboard.readText);let P={evs:[],bds:[]},src="",url="";
  openSheet("Kalender aus FamilyWall",
  '<div class="sm" style="margin:0 0 10px;padding:10px;border-radius:10px;background:var(--accbg);color:var(--text)"><b>So kommen die Termine rüber:</b><ol style="margin:6px 0 0;padding-left:20px">'+
  '<li><b>iCal-Link:</b> In FamilyWall den Kalender öffnen → Kalender-Details → <b>„iCal-URL generieren“</b> → Link kopieren und unten einfügen. Klappt das Laden, holt FitPlan die Termine danach regelmäßig neu.</li>'+
  '<li style="margin-top:4px"><b>Kalenderdatei (.ics):</b> z. B. über den iCal-Link am PC heruntergeladen oder aus Google Kalender exportiert → unten auswählen.</li>'+
  '<li style="margin-top:4px"><b>Text:</b> Termine in FamilyWall teilen bzw. kopieren und unten einfügen.</li></ol></div>'+
  '<label class="f">iCal-Link</label><div style="display:flex;gap:8px"><input id="ciu" inputmode="url" autocapitalize="off" autocorrect="off" placeholder="https://… oder webcal://…"><button class="pri" id="ciul">Laden</button></div>'+
  '<button class="full" id="cif" style="margin-top:10px">📄 Kalenderdatei (.ics) wählen</button><input type="file" id="ciff" style="display:none">'+
  '<label class="f">Oder Text einfügen</label>'+(canRead?'<button class="full" id="cip" style="margin-bottom:6px">📋 Aus Zwischenablage einfügen</button>':'')+
  '<textarea id="cit" rows="5" placeholder="z. B.&#10;Mo., 10.11. 16:30 Fußball Ben&#10;Fr., 14.11. Elternabend"></textarea>'+
  '<p class="err" id="cie"></p><div id="cipv"></div>',
  ()=>{const T=$("cit");if(S.icu)$("ciu").value=S.icu.u;
    const draw=()=>{const V=$("cipv"),n=P.evs.length,b=P.bds.length;V.innerHTML="";if(!n&&!b)return;
      const t=todayK(),old=P.evs.filter(x=>!x.v.r&&(x.v.e||x.v.d)<t).length;
      V.innerHTML='<p style="margin:12px 0 0;font-weight:600">'+n+(n===1?" Termin":" Termine")+(b?" und "+b+(b===1?" Geburtstag":" Geburtstage"):"")+' erkannt</p>'+
        (old?'<label class="ck"><input type="checkbox" id="ciold" checked> '+old+' vergangene'+(old===1?'n Termin':' Termine')+' weglassen</label>':'')+
        (b?'<label class="ck"><input type="checkbox" id="cibd" checked> Geburtstage in den Geburtstagskalender</label>':'')+
        (src==="url"?'<label class="ck"><input type="checkbox" id="cisub" checked> Link merken und regelmäßig aktualisieren</label>':'')+
        '<div id="cil" style="margin-top:6px"></div><button class="full pri" id="ciok" style="margin-top:12px">Übernehmen</button>';
      const L=$("cil"),srt=[...P.evs].sort((x,y)=>(x.v.d+(x.v.s||"")).localeCompare(y.v.d+(y.v.s||""))),up=srt.filter(x=>x.v.r||(x.v.e||x.v.d)>=t),vis=(up.length?up:srt).slice(0,30);
      vis.forEach(x=>{const r=el("div","row",'<div class="t">'+esc(x.v.n)+'<div class="sm">'+wd(x.v.d)+' '+dd(x.v.d)+x.v.d.slice(2,4)+(x.v.s?' · '+x.v.s+(x.v.z?'–'+x.v.z:'')+' Uhr':' · ganztägig')+(x.v.r?' · 🔁 '+esc(rpTxt(x.v.r)):'')+'</div></div><button class="ic" aria-label="Weglassen">✕</button>');
        r.querySelector("button").onclick=()=>{P.evs=P.evs.filter(y=>y!==x);draw()};L.appendChild(r)});
      P.bds.slice(0,10).forEach(x=>L.appendChild(el("div","row",'<div class="t">🎂 '+esc(x.v.n)+'<div class="sm">'+x.v.d.slice(3)+'.'+x.v.d.slice(0,2)+'.'+(x.v.y||'')+'</div></div>')));
      if(n+b>vis.length+Math.min(b,10))L.appendChild(el("p","sm","… und weitere")).style.margin="6px 0 0";
      $("ciok").onclick=()=>{const drop=!!($("ciold")&&$("ciold").checked),bd=!$("cibd")||$("cibd").checked,sub=src==="url"&&$("cisub")&&$("cisub").checked;
        const res=calApply(P,{src:sub?"fw":"",drop,bd});if(sub)S.icu={u:url,at:Date.now(),old:drop,bd};save();
        closeSheet();famTab="cal";const f=P.evs.filter(x=>!(drop&&!x.v.r&&(x.v.e||x.v.d)<t)).map(x=>x.v.d).sort().find(k=>k>=t);famSel=f||t;famMon=famSel.slice(0,7);show("fam");
        toast(res.n||res.b?(res.n?res.n+(res.n===1?" Termin":" Termine"):"")+(res.n&&res.b?", ":"")+(res.b?res.b+(res.b===1?" Geburtstag":" Geburtstage"):"")+" übernommen"+(res.cut?" ("+res.cut+" ältere passten nicht mehr)":""):"Alles schon im Kalender",res.n||res.b?res.undo:null)}};
    const setP=(x,s)=>{P=x;src=s;$("cie").textContent=!x.evs.length&&!x.bds.length&&s?(s==="text"?"Keine Termine erkannt. Am besten klappt es mit Datum (und Uhrzeit) in jeder Zeile, z. B. „Mo., 10.11. 16:30 Fußball“.":"Darin stehen keine Termine."):"";draw()};
    const loadUrl=async()=>{const u=$("ciu").value.trim();if(!u)return;$("cie").textContent="";const b=$("ciul");b.disabled=true;b.textContent="Lädt …";
      try{const x=await calFetch(u);url=u;setP(icsParse(x),"url")}catch(e){$("cie").textContent=e.message}finally{b.disabled=false;b.textContent="Laden"}};
    const fromText=v=>{v=String(v||"");
      if(/BEGIN:VCALENDAR|BEGIN:VEVENT/i.test(v))setP(icsParse(v),"file");
      else if(/^\s*(https?|webcal):\/\/\S+\s*$/i.test(v)){$("ciu").value=v.trim();T.value="";loadUrl()}
      else if(v.trim()){const evs=[],bds=[];txtParse(v).forEach(e=>{if(BDRX.test(e.n)&&bdName(e.n))bds.push({id:"g"+syHash(bdName(e.n).toLowerCase()+"|"+e.d.slice(5)),v:{n:bdName(e.n),d:e.d.slice(5)}});else evs.push({id:"c"+syHash(e.n+"|"+e.d+"|"+(e.s||"")),v:JSON.parse(JSON.stringify(e))})});setP({evs,bds},"text")}
      else setP({evs:[],bds:[]},"")};
    let tm;T.oninput=()=>{clearTimeout(tm);tm=setTimeout(()=>fromText(T.value),300)};
    if(canRead)$("cip").onclick=()=>navigator.clipboard.readText().then(x=>{T.value=x;fromText(x)},()=>{$("cie").textContent="Kein Zugriff auf die Zwischenablage. Tippe lange ins Feld und wähle „Einfügen“."});
    $("ciul").onclick=loadUrl;$("ciu").onkeydown=e=>{if(e.key==="Enter")loadUrl()};
    $("cif").onclick=()=>$("ciff").click();
    $("ciff").onchange=e=>{const f=e.target.files[0];if(!f)return;const rd=new FileReader();
      rd.onload=()=>{const x=String(rd.result||"");$("ciff").value="";if(!/BEGIN:VCALENDAR|BEGIN:VEVENT/i.test(x)){setP({evs:[],bds:[]},"");$("cie").textContent="Das ist keine Kalenderdatei (.ics).";return}setP(icsParse(x),"file")};rd.readAsText(f)};
    if(pre)T.value=pre,fromText(pre)})}
