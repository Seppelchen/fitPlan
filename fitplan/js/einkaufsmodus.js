// FitPlan – Einkaufsmodus: nur die Liste im Vollbild
/* ---------- Einkaufsmodus: nur die Liste im Vollbild, große Zeilen, Bildschirm bleibt an ----------
   Alle Quellen (gemeinsame Liste, Plan, eigene Einträge, FamilyWall) in einer Ansicht. Offene Artikel
   oben nach Abschnitten, Abgehaktes wandert nach unten in „Im Wagen“. */
let shopOn=false,shopWL=null,shopDoneOpen=false;
// Dieselben Kategorien und zusammengefassten Artikel wie in der Liste (shopSecs in plan.js)
function shopModel(){return shopSecs().map(s=>({t:s.t,items:s.items.map(g=>({n:g.label,sub:g.sub,c:g.c,set:v=>{g.set(v);save()}}))}))}
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
