// FitPlan – Kalenderansichten im Tab Familie: Liste (Monat oben fest, Termine darunter), Tag, 3 Tage, Woche, Monat
const CALV=[["list","Liste"],["day","Tag"],["3d","3 Tage"],["week","Woche"],["month","Monat"]],HH=44;  // HH = Höhe einer Stunde (px), auch in app.css
let calV="list",agA="",agB="",agLock=0,calWantScroll=false;
try{const v=localStorage.getItem(KEY+".calv");if(CALV.some(x=>x[0]===v))calV=v}catch(e){}
const monAdd=(m,n)=>{const d=new Date(Date.UTC(+m.slice(0,4),+m.slice(5,7)-1+n,1));return d.getUTCFullYear()+"-"+p2(d.getUTCMonth()+1)};
const monEnd=m=>m+"-"+p2(new Date(Date.UTC(+m.slice(0,4),+m.slice(5,7),0)).getUTCDate());
const wkStart=k=>addDays(k,-wdi(k));
const tMin=s=>{const m=/^(\d\d):(\d\d)$/.exec(s||"");return m?+m[1]*60+ +m[2]:null};
const calTimeV=()=>calV==="day"||calV==="3d"||calV==="week";
function calDays(){const k=famSel;return calV==="day"?[k]:calV==="3d"?[k,addDays(k,1),addDays(k,2)]:Array.from({length:7},(_,i)=>addDays(wkStart(k),i))}
function calSetView(v){calV=v;try{localStorage.setItem(KEY+".calv",v)}catch(e){}calWantScroll=true;renderCal()}
function calGo(k,scroll){famSel=k;famMon=k.slice(0,7);calWantScroll=scroll!==false;renderCal()}
function calStep(n){const k=famSel||todayK();
  if(calV==="list"||calV==="month"){const m=monAdd(famMon||k.slice(0,7),n),t=todayK();calGo(t.slice(0,7)===m?t:m+"-01")}
  else calGo(addDays(k,n*(calV==="day"?1:calV==="3d"?3:7)))}
// Beim Öffnen des Tabs in Stundenansichten zur aktuellen Uhrzeit springen
function calOnShow(){if(calTimeV())calWantScroll=true}
function calTitle(){if(calV==="list"||calV==="month")return MONS[+famMon.slice(5)-1]+" "+famMon.slice(0,4);
  const D=calDays(),a=D[0],b=D[D.length-1],md=x=>+x.slice(8)+". "+MONS[+x.slice(5,7)-1].slice(0,3);
  if(calV==="day")return wd(a)+", "+md(a)+" "+a.slice(0,4);
  const rg=a.slice(0,7)===b.slice(0,7)?+a.slice(8)+".–"+dd(b):dd(a)+"–"+dd(b);  // z. B. 16.–22.11.
  return(calV==="week"?"KW "+kw(a)+" · ":"")+rg}

function renderCal(){const t=todayK();famSel=famSel||t;famMon=famSel.slice(0,7);
  $("cmt").textContent=calTitle();
  const V=$("calv");V.innerHTML="";CALV.forEach(([v,l])=>{const b=el("button",v===calV?"on":"",l);b.onclick=()=>calSetView(v);V.appendChild(b)});
  const G=$("cgrid"),D=$("cday");G.innerHTML="";D.innerHTML="";G.className="";G.style.gridTemplateColumns="";
  if(calV==="list"){agEnsure(famSel);renderCalGrid();renderAgenda()}else if(calV==="month")renderMonth();else renderTime();
  renderCalSub();agSize();
  if(calWantScroll){calWantScroll=false;requestAnimationFrame(calScroll)}}
// Fester Bereich oben: Abstand von oben (Notch) + Höhe
const calStick=()=>(parseFloat(getComputedStyle($("calTop")).top)||0)+$("calTop").offsetHeight;
function calScroll(){if(view!=="fam"||famTab!=="cal")return;
  if(calV==="list")agScrollTo(famSel,true);
  else if(calTimeV()){const B=document.querySelector("#cday .tgb");if(!B)return;const t=todayK(),now=new Date(),h=calDays().includes(t)?Math.max(0,now.getHours()-1):7;
    window.scrollTo({top:Math.max(0,B.getBoundingClientRect().top+scrollY+h*HH-calStick()),behavior:"smooth"})}}

/* Liste: kleiner Monat (fest) + durchgehende Terminliste. Beim Scrollen läuft der Monat mit. */
function renderCalGrid(){const t=todayK(),first=famMon+"-01",a=wkStart(first),b=addDays(a,41),R=calRange(a,b),G=$("cgrid");
  G.className="cal";G.innerHTML=WDS.map(w=>'<span class="wh">'+w+'</span>').join("");$("cmt").textContent=calTitle();
  for(let i=0;i<42;i++){const k=addDays(a,i),L=R[k]||[];  // immer 6 Wochen, damit der feste Bereich gleich hoch bleibt
    const bt=el("button",[k.slice(0,7)!==famMon?"o":"",k===t?"td":"",k===famSel?"sel":""].join(" ").trim(),'<span>'+(+k.slice(8))+'</span><span class="dts">'+L.slice(0,4).map(o=>'<i style="background:'+(o.bd?"var(--sweet)":famCol(o.ev))+'"></i>').join("")+'</span>');
    bt.setAttribute("aria-label",ld(k)+(L.length?", "+L.length+(L.length===1?" Eintrag":" Einträge"):""));
    bt.onclick=()=>calGo(k);G.appendChild(bt)}}
// Zeitraum der Liste: ab heute bzw. Monatsanfang, 6 Monate weit; mehr per Knopf oder beim Erreichen des Endes
function agEnsure(k){if(agA&&k>=agA&&k<=agB)return;const t=todayK();agA=k.slice(0,7)===t.slice(0,7)&&k>=t?t:k.slice(0,7)+"-01";agB=monEnd(monAdd(k.slice(0,7),5))}
let agIO=null;
function renderAgenda(){const D=$("cday"),t=todayK();if(famSel<agA||famSel>agB)agEnsure(famSel);const R=calRange(agA,agB),ks=new Set(Object.keys(R));
  [t,famSel].forEach(k=>{if(k>=agA&&k<=agB)ks.add(k)});
  const up=el("button","full","↑ Frühere Termine");up.style.cssText="margin:10px 0 0;font-size:13px";up.onclick=()=>agMore(-1);D.appendChild(up);
  let mon="";[...ks].sort().forEach(k=>{const m=k.slice(0,7);if(m!==mon){mon=m;D.appendChild(el("div","agm",MONS[+m.slice(5)-1]+" "+m.slice(0,4)))}
    const a=el("div","aga");a.dataset.k=k;D.appendChild(a);
    D.appendChild(el("div","agd"+(k===t?" td":""),(k===t?"Heute · ":k===addDays(t,1)?"Morgen · ":"")+wdL(k)+", "+(+k.slice(8))+". "+MONS[+k.slice(5,7)-1]));
    const L=R[k]||[];
    if(!L.length){const r=el("div","row",'<div class="t sm">Keine Termine</div><button class="ic" aria-label="Termin eintragen">＋</button>');r.querySelector("button").onclick=()=>calForm(null,k);D.appendChild(r)}
    L.forEach(o=>D.appendChild(famRow(o)))});
  const more=el("button","full","Weitere Termine ↓");more.style.cssText="margin-top:10px;font-size:13px";more.onclick=()=>agMore(1);D.appendChild(more);
  const sp=el("div","");sp.id="agsp";D.appendChild(sp);
  // Ende erreicht → automatisch weiterladen (höchstens 3 Jahre voraus)
  if(agIO)agIO.disconnect();if(window.IntersectionObserver){agIO=new IntersectionObserver(es=>{if(es[0].isIntersecting&&agB<addDays(t,1095)&&Date.now()>agLock)agMore(1)});agIO.observe(more)}}
function agMore(dir){if(dir<0){const a0=document.querySelector("#cday .aga"),y0=a0?a0.getBoundingClientRect().top:0;
    agA=monAdd(agA.slice(0,7),agA.endsWith("-01")?-1:0)+"-01";renderAgenda();agSize();
    if(a0){const a1=document.querySelector('#cday .aga[data-k="'+a0.dataset.k+'"]');if(a1){agLock=Date.now()+300;window.scrollBy(0,a1.getBoundingClientRect().top-y0)}}}
  else{agB=monEnd(monAdd(agB.slice(0,7),3));const y=scrollY;renderAgenda();agSize();window.scrollTo(0,y)}}
// Höhe des festen Bereichs für die Tagesüberschriften; Platz am Ende, damit auch der letzte Tag nach oben scrollen kann
function agSize(){const T=$("calTop");if(!T||!T.offsetHeight)return;document.documentElement.style.setProperty("--calh",T.offsetHeight+"px");
  const sp=$("agsp");if(sp)sp.style.height=Math.max(0,innerHeight-calStick()-140)+"px"}
function agScrollTo(k,smooth){const a=document.querySelector('#cday .aga[data-k="'+k+'"]');if(!a)return;agLock=Date.now()+(smooth?900:250);
  window.scrollTo({top:Math.max(0,a.getBoundingClientRect().top+scrollY-calStick()),behavior:smooth?"smooth":"auto"})}
// Welcher Tag steht gerade oben unter dem Monat? → im Monat markieren, bei Monatswechsel mitblättern
function agSync(){if(view!=="fam"||famTab!=="cal"||calV!=="list"||Date.now()<agLock)return;const line=$("calTop").getBoundingClientRect().bottom+4;let cur=null;
  for(const a of document.querySelectorAll("#cday .aga")){if(a.getBoundingClientRect().top<=line)cur=a;else break}
  if(!cur||cur.dataset.k===famSel)return;famSel=cur.dataset.k;famMon=famSel.slice(0,7);renderCalGrid()}
window.addEventListener("scroll",()=>{if(!agSync.f)agSync.f=requestAnimationFrame(()=>{agSync.f=0;agSync()})},{passive:true});
window.addEventListener("resize",agSize);

/* Monat: großes Raster mit Kalenderwochen und Termintiteln */
function calChip(o){const i=el("i","",esc(o.bd?"🎂 "+o.bd.n:o.ev.n));i.title=o.bd?"Geburtstag":evTime(o);i.style.background=o.bd?"var(--sweet)":famCol(o.ev);
  i.onclick=e=>{e.stopPropagation();if(o.bd)bdForm(o.bd.id);else calDetail(o.ev.id,o.s)};return i}
function renderMonth(){const t=todayK(),a=wkStart(famMon+"-01"),R=calRange(a,addDays(a,41)),G=$("cgrid"),M=el("div","mg");
  G.className="mgh";G.innerHTML='<span>KW</span>'+WDS.map(w=>'<span>'+w+'</span>').join("");
  for(let w=0;w<6;w++){M.appendChild(el("span","mkw",String(kw(addDays(a,w*7)))));
    for(let i=0;i<7;i++){const k=addDays(a,w*7+i),L=R[k]||[],c=el("div","mc2"+(k.slice(0,7)!==famMon?" o":"")+(k===t?" td":"")+(k===famSel?" sel":""),'<b>'+(+k.slice(8))+'</b>');
      L.slice(0,4).forEach(o=>c.appendChild(calChip(o)));if(L.length>4)c.appendChild(el("em","","+"+(L.length-4)));
      c.setAttribute("aria-label",ld(k));c.onclick=()=>{famSel=k;famMon=k.slice(0,7);calV="day";calWantScroll=true;renderCal()};M.appendChild(c)}}
  $("cday").appendChild(M)}

/* Tag, 3 Tage, Woche: Stundenraster. Ganztägiges und Geburtstage oben im festen Bereich. */
function calTimed(o){if(o.bd)return null;const e=o.ev,s=tMin(e.s),z=tMin(e.z);let a,b;
  if(!o.dur){if(s==null)return null;a=s;b=z!=null&&z>s?z:s+60}
  else if(o.i===0){if(s==null)return null;a=s;b=1440}
  else if(o.i===o.dur){if(z==null)return null;a=0;b=z}
  else return null;
  return{a,b:Math.min(1440,Math.max(b,a+20))}}
function renderTime(){const t=todayK(),D=calDays(),R=calRange(D[0],D[D.length-1]),G=$("cgrid"),C=$("cday"),cols="40px repeat("+D.length+",minmax(0,1fr))";
  G.className="tgh";G.style.gridTemplateColumns=cols;G.appendChild(el("span",""));
  D.forEach(k=>{const b=el("button","tgd"+(k===t?" td":"")+(k===famSel&&D.length>1?" sel":""),'<span>'+wd(k)+'</span><b>'+(+k.slice(8))+'</b>');
    b.onclick=()=>{famSel=k;famMon=k.slice(0,7);calV="day";calWantScroll=true;renderCal()};G.appendChild(b)});
  G.appendChild(el("span","tga","ganzt."));
  D.forEach(k=>{const c=el("div","tgc");(R[k]||[]).filter(o=>!calTimed(o)).forEach(o=>c.appendChild(calChip(o)));G.appendChild(c)});
  const B=el("div","tgb");B.style.gridTemplateColumns=cols;B.style.height=24*HH+"px";
  const g=el("div","tgg");for(let h=1;h<24;h++){const s=el("span","",h+":00");s.style.top=h*HH+"px";g.appendChild(s)}B.appendChild(g);
  const now=new Date(),nm=now.getHours()*60+now.getMinutes();
  D.forEach(k=>{const col=el("div","tgcol");
    // Überschneidende Termine nebeneinander
    const ev=(R[k]||[]).map(o=>({o,...(calTimed(o)||{})})).filter(x=>x.a!=null).sort((x,y)=>x.a-y.a||y.b-x.b),out=[];let cl=[],end=-1;
    const flush=()=>{const ln=[];cl.forEach(x=>{let i=ln.findIndex(e=>e<=x.a);if(i<0){i=ln.length;ln.push(0)}ln[i]=x.b;x.l=i});cl.forEach(x=>x.n=ln.length);out.push(...cl);cl=[]};
    ev.forEach(x=>{if(cl.length&&x.a>=end){flush();end=-1}cl.push(x);end=Math.max(end,x.b)});flush();
    out.forEach(x=>{const e=x.o.ev,d=el("div","tge",'<b>'+esc(e.n)+'</b>'+((x.b-x.a)>=45?'<br>'+esc(evTime(x.o)):''));
      d.style.cssText="top:"+(x.a/60*HH)+"px;height:"+Math.max(18,(x.b-x.a)/60*HH-2)+"px;left:calc("+(x.l/x.n*100)+"% + 1px);width:calc("+(100/x.n)+"% - 2px);background:"+famCol(e);
      d.onclick=ev2=>{ev2.stopPropagation();calDetail(e.id,x.o.s)};col.appendChild(d)});
    if(k===t){const n=el("div","tgn");n.style.top=nm/60*HH+"px";col.appendChild(n)}
    col.onclick=e=>{const h=Math.min(23,Math.max(0,Math.floor(e.offsetY/HH)));calForm(null,k,p2(h)+":00")};
    B.appendChild(col)});
  C.appendChild(B)}

/* Bedienung: Pfeile, Heute, Neu, Wischen */
$("cmp").onclick=()=>calStep(-1);$("cmn").onclick=()=>calStep(1);$("cmh").onclick=()=>calGo(todayK());
$("cadd").onclick=()=>calForm(null,famSel||todayK());$("cimp").onclick=()=>calImport("");
["cgrid","cday"].forEach(id=>{let x0=null,y0=0;const G=$(id);
  G.addEventListener("touchstart",e=>{x0=e.touches[0].clientX;y0=e.touches[0].clientY},{passive:true});
  G.addEventListener("touchend",e=>{if(x0==null)return;const dx=e.changedTouches[0].clientX-x0,dy=e.changedTouches[0].clientY-y0;x0=null;
    if(calV!=="list"||id==="cgrid")if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.5)calStep(dx<0?1:-1)},{passive:true})});
