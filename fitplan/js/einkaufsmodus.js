// FitPlan – Einkaufsmodus: nur die Liste im Vollbild
/* ---------- Einkaufsmodus: nur die Liste im Vollbild, große Zeilen, Bildschirm bleibt an ----------
   Alle Quellen (gemeinsame Liste, Plan, eigene Einträge, FamilyWall) in einer Ansicht. Offene Artikel
   oben nach Abschnitten, Abgehaktes wandert nach unten in „Im Wagen“. */
let shopOn=false,shopWL=null,shopDoneOpen=false;
function shopModel(){const wk=ekK(),E=ekOf(wk),sy=SY(),secs=[],keep=()=>{S.ek[wk]=E;save()};
  const sec=(t,items)=>{if(items.length)secs.push({t,items})};
  const grp=(arr,gf)=>{const gs=[];arr.forEach(x=>{const g=gf(x);if(!gs.includes(g))gs.push(g)});return gs.sort((a,b)=>(a==="Sonstiges")-(b==="Sonstiges"))};
  if(sy){const all=syVis(sy).sort((a,b)=>(a.t||0)-(b.t||0)),pl=all.filter(x=>x.p).sort((a,b)=>a.n.replace(/^[\d.,½¼¾]+\s*\S*\s/,"").localeCompare(b.n.replace(/^[\d.,½¼¾]+\s*\S*\s/,""),"de"));
    const it=x=>({n:x.n,sub:x.f||!x.b||x.d===sy.me?"":(x.p?"aus dem Plan von ":"von ")+x.b,c:!!x.c,set:v=>syOp({id:x.id,f:"c",v})});
    sec("Gemeinsam",all.filter(x=>!x.f&&!x.p).map(it));
    // Gleiche Zutaten aus mehreren Plänen als eine Zeile
    const gi=g=>({n:g.label,sub:g.xs.every(x=>x.d===sy.me)?"":"aus dem Plan von "+[...new Set(g.xs.filter(x=>x.d!==sy.me).map(x=>x.b||"der anderen Person"))].join(", "),c:g.c,set:v=>g.xs.forEach(x=>syOp({id:x.id,f:"c",v}))});
    sec("Aus dem Plan",syGroup(pl.filter(x=>!x.w)).map(gi));sec("Gewürze & Vorrat",syGroup(pl.filter(x=>x.w)).map(gi));
    const fw=all.filter(x=>x.f);grp(fw,x=>x.g||"Sonstiges").forEach(g=>sec(g,fw.filter(x=>(x.g||"Sonstiges")===g).map(it)))}
  // Gewürze & Vorrat nur, wenn sie von Hand auf die Liste gesetzt wurden
  const its=syAuto()?[]:listItems(E),by=(a,b)=>a.n.localeCompare(b.n,"de");
  const pi=o=>({n:shopLabel(o),sub:"",c:!!E.c[o.key],set:v=>{if(v)E.c[o.key]=1;else delete E.c[o.key];keep()}});
  sec(sy?"Aus deinem Plan · nur hier":"Aus dem Plan",its.filter(o=>!o.w).sort(by).map(pi));
  sec("Gewürze & Vorrat",its.filter(o=>o.w).sort(by).map(pi));
  sec("Eigene Einträge",E.x.map(x=>({n:x.n,sub:"",c:!!x.c,set:v=>{x.c=v;keep()}})));
  if(S.fw&&S.fw.items.length)grp(S.fw.items,x=>x.g).forEach(g=>sec(g,S.fw.items.filter(x=>x.g===g).map(x=>({n:x.n,sub:"",c:!!x.c,set:v=>{x.c=v;save()}}))));
  return secs}
function renderShopMode(){if(!shopOn)return;const L=$("sml"),st=L.scrollTop,secs=shopModel(),done=[];let tot=0,dn=0;
  secs.forEach(s=>s.items.forEach(x=>{tot++;if(x.c)dn++}));
  $("smc").textContent=tot?dn+" von "+tot+" erledigt":"";$("smb").style.width=(tot?dn/tot*100:0)+"%";
  const row=(x,sec)=>{const sub=[x.sub,sec].filter(Boolean).join(" · ");
    const r=el("div","it"+(x.c?" ok":""),'<span class="bx">'+(x.c?"✓":"")+'</span><div class="t" style="flex:1;min-width:0">'+esc(x.n)+(sub?'<div class="sm">'+esc(sub)+'</div>':'')+'</div>');
    r.onclick=()=>{const was=x.c;x.set(!was);renderShop();if(!was)toast("„"+x.n+"“ im Wagen",()=>{x.set(false);renderShop()})};L.appendChild(r)};
  L.innerHTML="";
  secs.forEach(s=>{const open=s.items.filter(x=>!x.c);s.items.filter(x=>x.c).forEach(x=>done.push([x,s.t]));if(!open.length)return;
    L.appendChild(el("div","sec",esc(s.t)));open.forEach(x=>row(x))});
  if(!tot)L.appendChild(el("div","fin",'<div style="font-size:40px">🧺</div>Die Einkaufsliste ist leer.<div class="sm">Unten kannst du etwas eintragen.</div>'));
  else if(dn===tot)L.appendChild(el("div","fin",'<div style="font-size:40px">🎉</div>Alles erledigt!'));
  if(done.length){const b=el("button","full","✓ Im Wagen ("+done.length+") "+(shopDoneOpen?"▲":"▼"));b.style.marginTop="18px";b.onclick=()=>{shopDoneOpen=!shopDoneOpen;renderShopMode()};L.appendChild(b);
    if(shopDoneOpen)done.forEach(([x,t])=>row(x,t))}
  L.scrollTop=st;$("smst").textContent="";syStat()}
async function shopWake(){try{if(shopOn&&!shopWL&&navigator.wakeLock&&document.visibilityState==="visible"){shopWL=await navigator.wakeLock.request("screen");shopWL.addEventListener("release",()=>{shopWL=null})}}catch(e){}}
function shopOpen(){shopOn=true;shopDoneOpen=false;$("shopm").classList.add("open");document.body.style.overflow="hidden";$("sml").scrollTop=0;renderShopMode();shopWake();syLoop();
  try{history.pushState({shop:1},"")}catch(e){}}
function shopClose(fromPop){if(!shopOn)return;shopOn=false;$("shopm").classList.remove("open");document.body.style.overflow="";
  try{if(shopWL)shopWL.release()}catch(e){}shopWL=null;if(!fromPop&&history.state&&history.state.shop)history.back();renderShop()}
// Android-Zurück-Taste schließt den Einkaufsmodus statt die App
window.addEventListener("popstate",()=>{if(shopOn)shopClose(true)});
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")shopWake()});
$("ekgo").onclick=shopOpen;$("smx").onclick=()=>shopClose();
$("sma").onclick=()=>{const n=$("smi").value.trim();if(!n)return;$("smi").value="";ekAdd(n);toast("„"+n+"“ eingetragen")};
$("smi").onkeydown=e=>{if(e.key==="Enter")$("sma").click()};
