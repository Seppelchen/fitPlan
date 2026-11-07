// FitPlan – Tab Familie: gemeinsamer Kalender, Geburtstage und Rezepte
/* ---------- Familie: gemeinsamer Kalender, Geburtstage und Rezepte ----------
   Ohne Verbindung liegt alles nur auf diesem Handy (S.fam). Mit Verbindung im selben Firebase-Dokument wie
   die Einkaufsliste: Felder cal (Termine), bd (Geburtstage), rz (Rezepte), jeder Eintrag als JSON-Text.
   fv wechselt bei jeder Änderung – nur dann laden die anderen Handys diese Felder neu. */
const FAMC=["cal","bd","rz"],FAM_MAX={cal:1500,bd:300,rz:200};
let famTab="cal",famMon="",famSel="",syFamErr="",syFamErrT=0,calSubBusy=false;
try{const v=localStorage.getItem(KEY+".fam");if(FAMC.includes(v))famTab=v}catch(e){}
const famTgt=(s,c)=>{s.fm=s.fm||{};return s.fm[c]=s.fm[c]||{}};
const famMap=c=>{const s=SY();return s?famTgt(s,c):(S.fam[c]=S.fam[c]||{})};
const isK=k=>typeof k==="string"&&/^\d{4}-\d\d-\d\d$/.test(k);
const calOk=x=>!!x&&typeof x==="object"&&!!x.n&&isK(x.d)&&(!x.e||isK(x.e));
const bdOk=x=>!!x&&typeof x==="object"&&!!x.n&&/^\d\d-\d\d$/.test(x.d);
const rzOk=x=>!!x&&typeof x==="object"&&!!x.r&&!!x.r.n;
const famList=c=>Object.entries(famMap(c)).map(([id,x])=>({...x,id})).filter(c==="cal"?calOk:c==="bd"?bdOk:rzOk);
const famMine=x=>x.dv===S.dev;
const famCol=x=>famMine(x)?"var(--accent)":["var(--s2)","var(--s3)","var(--s4)"][parseInt(syHash(String(x.dv||"")),36)%3];
// Einträge setzen (v=null löscht). Neue Einträge bekommen Gerät und Namen, bestehende behalten sie.
function famSetN(c,L){if(!L.length)return;const s=SY(),t=Date.now();
  L=L.map(([id,v],i)=>{if(v){v={...v,t:t+i};delete v.id;if(!v.dv){v.dv=S.dev;v.b=s?s.name||"":""}}return{col:c,id,v}});
  if(s)syOpN(L);else{const M=famMap(c);L.forEach(o=>{if(o.v)M[o.id]=o.v;else delete M[o.id]});save()}}
const famSet=(c,id,v)=>famSetN(c,[[id,v]]);
// Abgleich mit Firebase (Teil von sySync)
async function syPushFam(s){if(!s.q.some(o=>o.col)||syFamErr&&Date.now()-syFamErrT<6e4)return;
  try{for(;;){const b=s.q.filter(o=>o.col).slice(0,60);if(!b.length)break;const x=syBody(b);await syCall(s,"PATCH",x.qs,x.body);s.q=s.q.filter(o=>!b.includes(o));if(SY()===s)save()}
    if(syFamErr){syFamErr="";renderFam()}}
  catch(e){if(e.off)throw e;syFamErrT=Date.now();
    syFamErr=e.st===403?"Kalender, Geburtstage und Rezepte werden noch nicht geteilt: In Firebase müssen die Firestore-Regeln aktualisiert werden (siehe Anleitung). Auf diesem Handy ist alles gespeichert.":syMsg(e);renderFam()}}
function syReadFam(d,s){let ch=false;
  FAMC.forEach(c=>{const f=d.fields&&d.fields[c]&&d.fields[c].mapValue&&d.fields[c].mapValue.fields||{},M={};
    Object.entries(f).forEach(([id,v])=>{const j=v.mapValue&&v.mapValue.fields&&v.mapValue.fields.j;try{const o=JSON.parse(j&&j.stringValue||"null");if(o&&typeof o==="object")M[id]=o}catch(e){}});
    s.q.forEach(o=>{if(o.col===c)syApply(M,o)});  // noch nicht übertragene eigene Änderungen behalten
    if(JSON.stringify(M)!==JSON.stringify(famTgt(s,c))){s.fm[c]=M;ch=true}});
  return ch}

/* Datum & Wiederholung */
const p2=n=>String(n).padStart(2,"0");
const ymd=(y,m,d)=>{const D=new Date(Date.UTC(y,m-1,d));return D.getUTCFullYear()===y&&D.getUTCMonth()===m-1&&D.getUTCDate()===d?y+"-"+p2(m)+"-"+p2(d):null};
const kd=k=>new Date(k+"T12:00");
const wdi=k=>(kd(k).getDay()+6)%7;  // Montag = 0
const ld=k=>kd(k).toLocaleDateString("de-DE",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
const MONS=["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"];
const WDS=["Mo","Di","Mi","Do","Fr","Sa","So"],WDN=["Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag","Sonntag"];
function nthWd(y,m,n,w){const last=new Date(Date.UTC(y,m,0)).getUTCDate();let d;
  if(n>0)d=1+((w-wdi(ymd(y,m,1))+7)%7)+(n-1)*7;else d=last-((wdi(ymd(y,m,last))-w+7)%7)+(n+1)*7;
  return d>=1&&d<=last?ymd(y,m,d):null}
// Startdaten der Vorkommen eines Termins, die den Zeitraum a…b berühren
// r = {f:"d"|"w"|"m"|"y", i:Abstand, u:bis, c:Anzahl, wd:[Wochentage], nth:[n,Wochentag]}, x = ausgelassene Tage
function occ(ev,a,b){const dur=ev.e&&ev.e>ev.d?dayDiff(ev.d,ev.e):0,lo=addDays(a,-dur),r=ev.r,out=[];
  if(!r||typeof r!=="object"||!["d","w","m","y"].includes(r.f)){if(ev.d>=lo&&ev.d<=b)out.push(ev.d);return out}
  const iv=Math.max(1,Math.min(99,+r.i||1)),end=isK(r.u)&&r.u<b?r.u:b,cnt=+r.c||0,ex=new Set(Array.isArray(ev.x)?ev.x:[]);let n=0;
  const hit=k=>{if(k<ev.d)return true;if(k>end)return false;n++;if(cnt&&n>cnt)return false;if(k>=lo&&!ex.has(k))out.push(k);return true};
  const y0=+ev.d.slice(0,4),m0=+ev.d.slice(5,7),d0=+ev.d.slice(8,10),W=Array.isArray(r.wd)?[...new Set(r.wd.map(Number))].filter(x=>x>=0&&x<7).sort():[];
  if(r.f==="d"||r.f==="w"&&!W.length){const st=(r.f==="d"?1:7)*iv;let j=cnt?0:Math.max(0,Math.floor(dayDiff(ev.d,lo)/st));
    for(let g=0;g<4000;g++,j++)if(!hit(addDays(ev.d,j*st)))break}
  else if(r.f==="w"){const ws=addDays(ev.d,-wdi(ev.d));let j=cnt?0:Math.max(0,Math.floor(dayDiff(ws,lo)/(7*iv)));
    stop:for(let g=0;g<2000;g++,j++){const base=addDays(ws,j*7*iv);for(const w of W)if(!hit(addDays(base,w)))break stop}}
  else{const yr=r.f==="y",ly=+lo.slice(0,4),lm=+lo.slice(5,7);let j=cnt?0:Math.max(0,(yr?Math.floor((ly-y0)/iv):Math.floor(((ly-y0)*12+lm-m0)/iv))-1);
    for(let g=0;g<2000;g++,j++){let y=y0,m=m0;if(yr)y+=j*iv;else{const t=m0-1+j*iv;y+=Math.floor(t/12);m=t%12+1}
      const k=Array.isArray(r.nth)?nthWd(y,m,+r.nth[0],+r.nth[1]):ymd(y,m,d0);if(!k){if(y>+end.slice(0,4))break;continue}if(!hit(k))break}}
  return out}
const bdIn=(x,y)=>{const m=+x.d.slice(0,2),d=+x.d.slice(3,5);return ymd(y,m,d)||(m===2&&d===29?ymd(y,2,28):null)};
function bdNext(x){const t=todayK();let y=+t.slice(0,4),k=bdIn(x,y);if(!k||k<t)k=bdIn(x,++y);return{k,age:x.y&&y-x.y>0?y-x.y:null,in:dayDiff(t,k)}}
// Alle Termine und Geburtstage im Zeitraum, nach Tag: {k:[{ev,s,i,dur}|{bd,age}]}
function calRange(a,b){const R={},add=(k,o)=>(R[k]=R[k]||[]).push(o);
  famList("cal").forEach(ev=>{const dur=ev.e&&ev.e>ev.d?Math.min(366,dayDiff(ev.d,ev.e)):0;
    occ(ev,a,b).forEach(s=>{for(let i=0;i<=dur;i++){const k=addDays(s,i);if(k>b)break;if(k>=a)add(k,{ev,s,i,dur})}})});
  famList("bd").forEach(x=>{for(let y=+a.slice(0,4);y<=+b.slice(0,4);y++){const k=bdIn(x,y);if(k&&k>=a&&k<=b)add(k,{bd:x,age:x.y&&y-x.y>0?y-x.y:null})}});
  const rk=o=>o.bd?"0":!o.ev.s||o.i?"1":"2"+o.ev.s;
  Object.values(R).forEach(L=>L.sort((p,q)=>rk(p).localeCompare(rk(q))||String((p.bd||p.ev).n).localeCompare(String((q.bd||q.ev).n),"de")));return R}
function rpTxt(r){if(!r||!r.f)return"";const i=+r.i||1,U={d:["Täglich","Alle "+i+" Tage"],w:["Jede Woche","Alle "+i+" Wochen"],m:["Jeden Monat","Alle "+i+" Monate"],y:["Jedes Jahr","Alle "+i+" Jahre"]}[r.f];if(!U)return"";
  let t=U[i>1?1:0];
  if(Array.isArray(r.nth))t+=" am "+(+r.nth[0]===-1?"letzten":r.nth[0]+".")+" "+(WDN[r.nth[1]]||"");
  else if(r.f==="w"&&Array.isArray(r.wd)&&r.wd.length)t+=" am "+r.wd.map(x=>WDS[x]).join(", ");
  if(isK(r.u))t+=" bis "+kd(r.u).toLocaleDateString("de-DE");else if(+r.c)t+=", "+r.c+"-mal";return t}
const rpKey=r=>{if(!r||!r.f)return"";if(r.c||r.nth||Array.isArray(r.wd)&&r.wd.length)return"x";const i=+r.i||1;
  return i===1&&"dwmy".includes(r.f)?r.f:i===2&&r.f==="w"?"w2":"x"};
function evTime(o){const e=o.ev;
  if(o.dur){const last=addDays(o.s,o.dur);if(o.i===0)return(e.s?"ab "+e.s+" Uhr":"ganztägig")+" · bis "+wd(last)+" "+dd(last);
    if(o.i===o.dur)return e.z?"bis "+e.z+" Uhr":"letzter Tag";return"Tag "+(o.i+1)+" von "+(o.dur+1)}
  return e.s?e.s+(e.z?"–"+e.z:"")+" Uhr":"ganztägig"}
function famRow(o){const r=el("div","row");r.style.cursor="pointer";
  if(o.bd){r.innerHTML='<span class="cbar" style="background:var(--sweet)"></span><div class="t">🎂 '+esc(o.bd.n)+'<div class="sm">Geburtstag'+(o.age?' · wird '+o.age:'')+'</div></div>';r.onclick=()=>bdForm(o.bd.id)}
  else{const e=o.ev,sub=[evTime(o),e.o,e.r&&e.r.f?"🔁":"",famMine(e)?"":e.b?"von "+e.b:"",e.src==="fw"?"📋 FamilyWall":""].filter(Boolean);
    r.innerHTML='<span class="cbar" style="background:'+famCol(e)+'"></span><div class="t">'+esc(e.n)+'<div class="sm">'+esc(sub.join(" · "))+'</div></div>';r.onclick=()=>calDetail(e.id,o.s)}
  return r}

/* Ansicht */
function famBadge(){const t=todayK(),n=(calRange(t,t)[t]||[]).length,b=$("fmnb");b.textContent=n>9?"9+":n;b.style.display=n?"block":"none"}
function renderFam(){famBadge();if(view!=="fam")return;renderFamTop();
  const T=$("fmTabs");T.innerHTML="";[["cal","📅 Kalender"],["bd","🎂 Geburtstage"],["rz","📖 Rezepte"]].forEach(([v,l])=>{const b=el("button",v===famTab?"on":"",l);
    b.onclick=()=>{famTab=v;try{localStorage.setItem(KEY+".fam",v)}catch(e){}renderFam()};T.appendChild(b)});
  FAMC.forEach(c=>$("fm-"+c).style.display=c===famTab?"":"none");
  if(famTab==="cal")renderCal();else if(famTab==="bd")renderBd();else renderRz()}
function renderFamTop(){const T=$("fmTop"),t=todayK(),cal=famTab==="cal",R=cal?{}:calRange(t,addDays(t,6)),s=SY(),ks=Object.keys(R).sort();T.innerHTML="";
  T.style.padding=cal?"10px 14px":"";
  if(!cal)T.appendChild(el("h2","","Heute & nächste 7 Tage"));
  if(!cal&&!ks.length)T.appendChild(el("p","sm","Keine Termine und Geburtstage in den nächsten 7 Tagen.")).style.margin="0";
  let n=0;const tot=ks.reduce((a,k)=>a+R[k].length,0);
  for(const k of ks){if(n>=10)break;const h=el("div","gh",'<span>'+(k===t?"Heute":k===addDays(t,1)?"Morgen":wdL(k))+', '+dd(k)+'</span><span></span>');if(!n)h.style.marginTop="0";T.appendChild(h);
    R[k].forEach(o=>{if(n++<10)T.appendChild(famRow(o))})}
  if(tot>10)T.appendChild(el("p","sm","… und "+(tot-10)+" weitere im Kalender")).style.margin="6px 0 0";
  if(s){const d=el("div","",'<span class="sm" style="flex:1">👥 Gemeinsam mit der Familie <span id="fmst"></span></span><button id="fmcon" style="font-size:13px;padding:4px 12px">Verwalten</button>');
    d.style.cssText="display:flex;align-items:center;gap:8px;margin-top:"+(cal?"0":"12px");T.appendChild(d);syStat()}
  else{T.appendChild(el("button","full","👥 Mit der Familie teilen")).id="fmcon";$("fmcon").style.marginTop=cal?"0":"12px";
    if(!cal)T.appendChild(el("p","sm","Dann sehen alle verbundenen Handys Kalender, Geburtstage, Rezepte und die Einkaufsliste.")).style.margin="6px 0 0"}
  $("fmcon").onclick=sySheet;
  if(s&&syFamErr)T.appendChild(el("p","err",esc(syFamErr)))}

/* Kalender: Termine anlegen, ansehen, FamilyWall-Verknüpfung */
// Die Kalenderansichten (Liste, Tag, 3 Tage, Woche, Monat) stehen in kalender.js
function calForm(id,k0,t0){const old=id?famMap("cal")[id]:null;if(id&&!calOk(old))return;const e=old||{n:"",d:k0||todayK(),s:t0,z:t0?p2(Math.min(23,+t0.slice(0,2)+1))+":"+t0.slice(3):undefined},rv=rpKey(e.r);
  openSheet(id?"Termin bearbeiten":"Neuer Termin",
  '<label class="f">Was?</label><input id="ceN" maxlength="120" placeholder="z. B. Zahnarzt Laura">'+
  '<div class="g2"><div><label class="f">Datum</label><input type="date" id="ceD"></div><div><label class="f">Bis (mehrere Tage)</label><input type="date" id="ceE"></div></div>'+
  '<label class="ck" style="margin-top:12px"><input type="checkbox" id="ceA"> Ganztägig</label>'+
  '<div class="g2" id="ceTw"><div><label class="f">Von</label><input type="time" id="ceS"></div><div><label class="f">Bis</label><input type="time" id="ceZ"></div></div>'+
  '<label class="f">Wiederholen</label><select id="ceR"><option value="">Nie</option><option value="d">Täglich</option><option value="w">Jede Woche</option><option value="w2">Alle 2 Wochen</option><option value="m">Jeden Monat</option><option value="y">Jedes Jahr</option>'+(rv==="x"?'<option value="x">'+esc(rpTxt(e.r))+'</option>':'')+'</select>'+
  '<div id="ceUw"><label class="f">Wiederholen bis (leer = ohne Ende)</label><input type="date" id="ceU"></div>'+
  '<label class="f">Ort</label><input id="ceO" maxlength="120">'+
  '<label class="f">Notiz</label><textarea id="ceNo" rows="3" maxlength="500"></textarea>'+
  '<button class="full pri" id="ceOk" style="margin-top:14px">Speichern</button><p class="err" id="ceErr"></p>',
  ()=>{$("ceN").value=e.n;$("ceD").value=e.d;$("ceE").value=e.e||"";$("ceA").checked=!e.s;$("ceS").value=e.s||"";$("ceZ").value=e.z||"";$("ceR").value=rv;$("ceU").value=e.r&&isK(e.r.u)?e.r.u:"";$("ceO").value=e.o||"";$("ceNo").value=e.no||"";
    const up=()=>{$("ceTw").style.display=$("ceA").checked?"none":"";$("ceUw").style.display=$("ceR").value?"":"none"};up();
    $("ceA").onchange=()=>{if(!$("ceA").checked&&!$("ceS").value)$("ceS").value="09:00";up()};$("ceR").onchange=up;
    $("ceD").onchange=()=>{if($("ceE").value&&$("ceE").value<$("ceD").value)$("ceE").value=""};
    if(!id)setTimeout(()=>$("ceN").focus(),80);
    $("ceOk").onclick=()=>{const E=$("ceErr"),n=$("ceN").value.trim(),d=$("ceD").value,en=$("ceE").value,all=$("ceA").checked,st=$("ceS").value,z=$("ceZ").value,rk=$("ceR").value;
      if(!n){E.textContent="Gib ein, was ansteht.";return}if(!d){E.textContent="Wähle ein Datum.";return}
      if(en&&en<d){E.textContent="„Bis“ liegt vor dem Datum.";return}
      if(!all&&!st){E.textContent="Gib eine Uhrzeit ein oder wähle „Ganztägig“.";return}
      if(!all&&z&&(!en||en===d)&&z<st){E.textContent="Die Endzeit liegt vor der Startzeit.";return}
      const v={...(old||{}),n,d,e:en&&en>d?en:undefined,s:all?undefined:st,z:all||!z?undefined:z,o:$("ceO").value.trim()||undefined,no:$("ceNo").value.trim()||undefined};
      if(!rk)v.r=undefined;else if(rk!=="x")v.r={f:rk[0],i:rk==="w2"?2:1};else v.r={...e.r};
      if(v.r){const u=$("ceU").value;if(u){v.r.u=u;delete v.r.c}else delete v.r.u}
      famSet("cal",id||"c"+syRnd(10),v);closeSheet();famSel=d;famMon=d.slice(0,7);calWantScroll=true;renderFam();toast(id?"Termin gespeichert":"Termin eingetragen")}})}
function calDetail(id,k){const e=famMap("cal")[id];if(!calOk(e))return;k=k||e.d;const dur=e.e&&e.e>e.d?dayDiff(e.d,e.e):0,rp=rpTxt(e.r);
  openSheet(esc(e.n),
  '<div style="font-size:15px;line-height:1.75">📅 '+ld(k)+(dur?'<br>&nbsp; &nbsp; &nbsp;bis '+ld(addDays(k,dur)):'')+
  '<br>🕒 '+(e.s?esc(e.s)+(e.z?' – '+esc(e.z):'')+' Uhr':'ganztägig')+(rp?'<br>🔁 '+esc(rp):'')+(e.o?'<br>📍 '+esc(e.o):'')+'</div>'+
  (e.no?'<p style="white-space:pre-wrap;margin:10px 0 0;font-size:15px">'+esc(e.no)+'</p>':'')+
  '<p class="sm" style="margin:10px 0 0">'+(e.src==="fw"?'📋 Aus FamilyWall übernommen':famMine(e)?'Von dir eingetragen':'Eingetragen von '+esc(e.b||'der anderen Person'))+'</p>'+
  '<div class="g2" style="margin-top:16px"><button id="cdEd">Bearbeiten</button><button class="del" id="cdDel">'+(rp?'Ganze Serie löschen':'Löschen')+'</button></div>'+
  (rp?'<button class="full del" id="cdOne" style="margin-top:8px">Nur am '+dd(k)+' löschen</button>':''),
  ()=>{$("cdEd").onclick=()=>calForm(id);
    $("cdDel").onclick=()=>{if(rp&&!confirm("Alle Termine dieser Serie löschen?"))return;famSet("cal",id,null);closeSheet();renderFam();toast("Termin gelöscht",()=>{famSet("cal",id,e);renderFam()})};
    if(rp)$("cdOne").onclick=()=>{famSet("cal",id,{...e,x:[...(Array.isArray(e.x)?e.x:[]),k]});closeSheet();renderFam();toast("Termin am "+dd(k)+" gelöscht",()=>{famSet("cal",id,e);renderFam()})}})}
function renderCalSub(){const W=$("cfw"),c=S.icu;W.innerHTML="";if(!c)return;
  W.innerHTML='<div class="sm" style="padding:8px 10px;border-radius:10px;background:var(--chip)">📋 FamilyWall-Kalender verknüpft · '+(c.err?'<span style="color:var(--warn)">'+esc(c.err)+'</span>':'aktualisiert '+new Date(c.at).toLocaleString("de-DE",{weekday:"short",hour:"2-digit",minute:"2-digit"})+' Uhr')+
    '<div style="display:flex;gap:8px;margin-top:6px"><button id="cfr" style="font-size:13px;padding:4px 12px">↻ Aktualisieren</button><button id="cfx" style="font-size:13px;padding:4px 12px">Verknüpfung lösen</button></div></div>';
  $("cfr").onclick=()=>calSubRefresh(true);
  $("cfx").onclick=()=>{if(!confirm("Verknüpfung mit dem FamilyWall-Kalender lösen? Die übernommenen Termine bleiben im Kalender."))return;S.icu=null;save();renderCal()}}

/* Geburtstage */
function renderBd(){const L=$("blist"),t=todayK();L.innerHTML="";
  const all=famList("bd").map(x=>({x,...bdNext(x)})).sort((a,b)=>a.k.localeCompare(b.k)||a.x.n.localeCompare(b.x.n,"de"));
  if(!all.length){L.innerHTML='<p class="sm" style="margin:0">Noch keine Geburtstage. Tippe auf ＋ Geburtstag – oder übernimm sie mit dem Kalender aus FamilyWall.</p>';return}
  let g="";all.forEach(o=>{const mk=o.k.slice(0,7);
    if(mk!==g){g=mk;const h=el("div","gh",'<span>'+MONS[+mk.slice(5)-1]+(mk.slice(0,4)!==t.slice(0,4)?" "+mk.slice(0,4):"")+'</span><span></span>');if(!L.children.length)h.style.marginTop="0";L.appendChild(h)}
    const when=o.in===0?'<b style="color:var(--accent)">heute 🎉</b>':o.in===1?'morgen':'in '+o.in+' Tagen';
    const r=el("div","row",'<span class="fi">'+(o.in===0?"🎉":"🎂")+'</span><div class="t">'+esc(o.x.n)+'<div class="sm">'+wd(o.k)+' '+dd(o.k)+(o.age?' · wird '+o.age:'')+' · '+when+(famMine(o.x)||!o.x.b?'':' · von '+esc(o.x.b))+'</div></div>');
    r.style.cursor="pointer";r.onclick=()=>bdForm(o.x.id);L.appendChild(r)})}
$("badd").onclick=()=>bdForm(null);
function bdForm(id){const old=id?famMap("bd")[id]:null;if(id&&!bdOk(old))return;const x=old||{n:"",d:""},yr=new Date().getFullYear();
  openSheet(id?"Geburtstag bearbeiten":"Neuer Geburtstag",
  '<label class="f">Name</label><input id="bdN" maxlength="60" placeholder="z. B. Oma Helga">'+
  '<div class="g3"><div><label class="f">Tag</label><select id="bdD"><option value="">–</option>'+Array.from({length:31},(_,i)=>'<option>'+(i+1)+'</option>').join("")+'</select></div>'+
  '<div><label class="f">Monat</label><select id="bdM"><option value="">–</option>'+MONS.map((m,i)=>'<option value="'+(i+1)+'">'+m+'</option>').join("")+'</select></div>'+
  '<div><label class="f">Jahr</label><input id="bdY" type="number" inputmode="numeric" placeholder="optional"></div></div>'+
  '<p class="sm" style="margin:6px 0 0">Mit Geburtsjahr steht dabei, wie alt jemand wird.</p>'+
  '<button class="full pri" id="bdOk" style="margin-top:14px">Speichern</button>'+(id?'<button class="full del" id="bdDel" style="margin-top:8px">Löschen</button>':'')+'<p class="err" id="bdErr"></p>',
  ()=>{$("bdN").value=x.n;if(x.d){$("bdD").value=String(+x.d.slice(3,5));$("bdM").value=String(+x.d.slice(0,2))}$("bdY").value=x.y||"";if(!id)setTimeout(()=>$("bdN").focus(),80);
    $("bdOk").onclick=()=>{const E=$("bdErr"),n=$("bdN").value.trim(),d=+$("bdD").value,m=+$("bdM").value,y=+$("bdY").value||0;
      if(!n){E.textContent="Gib einen Namen ein.";return}if(!d||!m){E.textContent="Wähle Tag und Monat.";return}
      if(!ymd(2000,m,d)){E.textContent="Den "+d+". "+MONS[m-1]+" gibt es nicht.";return}
      if(y&&(y<1900||y>yr)){E.textContent="Das Jahr stimmt nicht – oder leer lassen.";return}
      if(y&&!ymd(y,m,d)&&!(m===2&&d===29)){E.textContent="Das Datum gibt es nicht.";return}
      famSet("bd",id||"g"+syRnd(10),{...(old||{}),n,d:p2(m)+"-"+p2(d),y:y||undefined});closeSheet();renderFam();toast("Geburtstag gespeichert")};
    if(id)$("bdDel").onclick=()=>{famSet("bd",id,null);closeSheet();renderFam();toast("Geburtstag gelöscht",()=>{famSet("bd",id,old);renderFam()})}})}

/* Gemeinsame Rezepte */
const STDN=new Set([...RB,...RB2,...RB3].map(x=>x[1].toLowerCase()));
const rzId=r=>"r"+syHash(S.dev+"|"+r.id);
const rzShared=r=>!!famMap("rz")[rzId(r)];
const rzPack=r=>({n:r.n,c:r.c,ic:icOf(r),k:r.k,p:r.p,kh:r.kh??null,fe:r.fe??null,bs:r.bs??null,t:r.t||"",z:(r.z||[]).slice(),s:r.s||"",pz:r.pz||1,tg:r.tg||""});
function rzSan(r){const N=v=>v==null||v===""?null:+v||0;
  return{n:String(r.n).slice(0,120),c:String(r.c||""),ic:String(r.ic||"🍽️").slice(0,8),k:+r.k||0,p:+r.p||0,kh:N(r.kh),fe:N(r.fe),bs:N(r.bs),t:String(r.t||""),z:Array.isArray(r.z)?r.z.map(String):[],s:String(r.s||""),pz:+r.pz||1,tg:r.tg==="s"?"s":"h"}}
function rzToggle(r){const id=rzId(r);
  if(rzShared(r)){famSet("rz",id,null);toast("„"+r.n+"“ wird nicht mehr geteilt")}
  else{if(Object.keys(famMap("rz")).length>=FAM_MAX.rz){toast("Höchstens "+FAM_MAX.rz+" gemeinsame Rezepte");return}famSet("rz",id,{r:rzPack(r)});toast("„"+r.n+"“ mit der Familie geteilt")}
  renderFam()}
function renderRz(){const I=$("zinfo");
  I.innerHTML=SY()?'':'<p class="sm" style="margin:0 0 10px;padding:8px 10px;border-radius:10px;background:var(--accbg);color:var(--text)">Hier sammelt ihr Rezepte für alle. Damit die anderen sie sehen, oben einmal „👥 Mit der Familie teilen“ einrichten – bis dahin bleibt die Liste auf diesem Handy.</p>';
  const q=$("zq").value.trim().toLowerCase(),L=$("zlist");L.innerHTML="";
  const all=famList("rz").map(x=>({x,r:rzSan(x.r)})).sort((a,b)=>a.r.n.localeCompare(b.r.n,"de"));
  const it=q?all.filter(o=>(o.r.n+" "+o.r.z.join(" ")).toLowerCase().includes(q)):all;
  $("zq").style.display=all.length>5?"":"none";
  if(!all.length)L.innerHTML='<p class="sm" style="margin:6px 0 0">Noch keine gemeinsamen Rezepte. Tippe auf ＋ Teilen und wähle eins deiner Rezepte – oder lege unten ein neues an.</p>';
  else if(!it.length)L.innerHTML='<p class="sm">Keine Rezepte gefunden.</p>';
  it.forEach(o=>{const row=el("div","row",'<span class="fi">'+esc(o.r.ic)+'</span><div class="t">'+esc(o.r.n)+'<div class="sm">'+mline(o.r.k,o.r.p,o.r.kh,o.r.fe)+(famMine(o.x)?'':' · von '+esc(o.x.b||'der anderen Person'))+'</div></div>');
    row.style.cursor="pointer";row.onclick=()=>famRecipe(o.x.id);L.appendChild(row)})}
$("zq").oninput=renderRz;
$("zadd").onclick=()=>rzPick();
$("znew").onclick=()=>recipeForm(null,null,o=>{rzToggle(o)});
function rzPick(){openSheet("Rezept teilen",'<p class="sm" style="margin:0 0 8px">Tippe auf ＋, dann sehen alle das Rezept unter „Gemeinsame Rezepte“ – mit Zutaten und Zubereitung. Eigene Rezepte stehen oben.</p><input id="zpq" placeholder="Rezept suchen" style="margin-bottom:8px"><div id="zpl"></div>',
  ()=>{const dr=()=>{const q=$("zpq").value.trim().toLowerCase(),L=$("zpl");L.innerHTML="";
      const it=S.R.filter(r=>!q||r.n.toLowerCase().includes(q)).sort((a,b)=>STDN.has(a.n.toLowerCase())-STDN.has(b.n.toLowerCase())||a.n.localeCompare(b.n,"de")).slice(0,80);
      if(!it.length)L.innerHTML='<p class="sm">Keine Rezepte gefunden.</p>';
      it.forEach(r=>{const sh=rzShared(r),row=el("div","row",'<span class="fi">'+icOf(r)+'</span><div class="t">'+esc(r.n)+'<div class="sm">'+(STDN.has(r.n.toLowerCase())?'':'eigenes Rezept · ')+mline(r.k,r.p,r.kh,r.fe)+'</div></div><button class="ic'+(sh?' done':'')+'" aria-label="'+(sh?'Nicht mehr teilen':'Teilen')+'">'+(sh?'✓':'＋')+'</button>');
        row.querySelector("button").onclick=()=>{rzToggle(r);dr()};L.appendChild(row)})};
    $("zpq").oninput=dr;dr()})}
function famRecipe(id){const x=famMap("rz")[id];if(!rzOk(x))return;const r=rzSan(x.r),st=steps(r.s),mine=famMine(x),own=()=>S.R.find(y=>y.n.toLowerCase()===r.n.toLowerCase());
  openSheet(esc(r.ic)+" "+esc(r.n),
  '<p class="sm" style="margin:0 0 10px;padding:8px 10px;border-radius:10px;background:var(--accbg);color:var(--text)">📖 Gemeinsames Rezept · '+(mine?'von dir geteilt':'geteilt von '+esc(x.b||'der anderen Person'))+'</p>'+
  '<p class="sm" style="margin:0 0 10px">'+mline(r.k,r.p,r.kh,r.fe)+' pro Portion'+(r.t?' · ⏱ '+esc(r.t):'')+'</p>'+
  (r.z.length?'<p class="lb">Zutaten'+(r.pz>1?' (für '+fq(r.pz)+' Portionen)':' (1 Portion)')+'</p><ul class="z">'+r.z.map(z=>'<li>'+esc(z)+'</li>').join("")+'</ul>':'<p class="sm">Keine Zutatenliste hinterlegt.</p>')+
  '<p class="lb" style="margin-top:12px">Zubereitung</p>'+(st.length?'<ol class="st">'+st.map(s=>'<li>'+esc(s)+'</li>').join("")+'</ol>':'<p class="sm">Keine Zubereitung hinterlegt.</p>')+
  '<p class="lb" style="margin-top:16px">Einplanen</p><div class="g2"><div><input type="date" id="frD"></div><div>'+mealSel("frM",CATS.includes(r.c)?r.c:"Mittag")+'</div></div>'+
  '<button class="full pri" id="frPl" style="margin-top:8px">📅 Einplanen</button>'+
  (r.z.length?'<button class="full" id="frEk" style="margin-top:8px">🛒 Zutaten auf die Einkaufsliste</button>':'')+
  (own()?'<p class="sm" style="margin:8px 0 0">„'+esc(r.n)+'“ ist schon in deinen Rezepten.</p>':'<button class="full" id="frSv" style="margin-top:8px">＋ In meine Rezepte übernehmen</button>')+
  '<button class="full del" id="frRm" style="margin-top:8px">'+(mine?'Nicht mehr teilen':'Aus den gemeinsamen Rezepten entfernen')+'</button>',
  ()=>{$("frD").value=todayK();
    $("frPl").onclick=()=>{const k=$("frD").value,c=$("frM").value;if(!k)return;const cur=rById((S.pl[k]||{})[c]),m=own();
      if(cur&&(!m||cur.id!==m.id)&&!confirm("Am "+dd(k)+" ist bei "+c+" schon „"+cur.n+"“ geplant. Ersetzen?"))return;
      planSet(k,c,takeRecipe(r,c).id);closeSheet();toast("Eingeplant · "+wd(k)+" "+dd(k)+" · "+c)};
    if($("frEk"))$("frEk").onclick=()=>{const L=r.z.filter(z=>!/^wie\s/i.test(z));L.forEach(ekAdd);toast(L.length+(L.length===1?" Zutat":" Zutaten")+" auf der Einkaufsliste")};
    if($("frSv"))$("frSv").onclick=()=>{takeRecipe(r,r.c);closeSheet();renderFood();toast("„"+r.n+"“ ist jetzt in deinen Rezepten")};
    $("frRm").onclick=()=>{if(!mine&&!confirm("„"+r.n+"“ für alle aus den gemeinsamen Rezepten entfernen?"))return;famSet("rz",id,null);closeSheet();renderFam();toast("Rezept entfernt",()=>{famSet("rz",id,x);renderFam()})}})}
