// FitPlan – Start der App: Daten laden, letzten Tab zeigen, Teilen aus anderen Apps, Updates
load();syMigrate();all();
// Beim Start den zuletzt geöffneten Tab wieder zeigen
try{const v=localStorage.getItem(KEY+".tab");if(v&&v!=="essen"&&$("v-"+v))show(v)}catch(e){}
syLoop();
// Android: Liste wurde aus einer anderen App (z. B. FamilyWall) an FitPlan geteilt
(()=>{const q=new URLSearchParams(location.search),tx=q.get("text")||"",ti=q.get("title")||"",t=((ti&&!tx.includes(ti)?ti+"\n":"")+tx+(q.get("url")&&!tx.includes(q.get("url"))?"\n"+q.get("url"):"")).trim();
  if(!t)return;history.replaceState(null,"",location.pathname);if(looksCal(t)){famTab="cal";show("fam");calImport(t)}else{show("plan");fwSheet(t)}})();
if(navigator.storage&&navigator.storage.persist)navigator.storage.persist();
// Updates: beim Zurückholen der App nach neuer Version fragen und sie sofort laden
if("serviceWorker" in navigator&&location.protocol==="https:"){const SW=navigator.serviceWorker,had=!!SW.controller;let rl=false;
  SW.register("sw.js").then(reg=>{document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")reg.update().catch(()=>{})})}).catch(()=>{});
  SW.addEventListener("controllerchange",()=>{if(!had||rl)return;rl=true;const a=document.activeElement,busy=shopOn||sheetOpen()||$("sheet2").classList.contains("open")||(a&&/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)&&a.value);
    if(!busy)location.reload();else{toast("Neue Version von FitPlan ist da",()=>location.reload(),"Jetzt laden");clearTimeout(toast.h)}})}
