// FitPlan – Start der App: Daten laden, letzten Tab zeigen, Teilen aus anderen Apps, Updates
load();syMigrate();all();
// Beim Start den zuletzt geöffneten Tab wieder zeigen
try{const v=localStorage.getItem(KEY+".tab");if(v&&v!=="essen"&&$("v-"+v))show(v)}catch(e){}
syLoop();
// Android: etwas aus einer anderen App an FitPlan geteilt – Kalenderdatei, Termine oder iCal-Link → Kalender,
// sonst Einkaufsliste (FamilyWall-Liste). Text kommt als ?text=… (ältere Installation), Dateien über sw.js (?shared).
function shareIn(ti,tx,u,files){const f=(files||[]).find(x=>/BEGIN:VCALENDAR|BEGIN:VEVENT/i.test(x.text||""));
  if(f){famTab="cal";show("fam");calImport("",f);return}
  const t=((ti&&!tx.includes(ti)?ti+"\n":"")+tx+(u&&!tx.includes(u)?"\n"+u:"")).trim();
  if(!t){if(files&&files.length)toast("Diese Datei kann FitPlan nicht lesen");return}
  if(looksCal(t)){famTab="cal";show("fam");calImport(t)}else{show("plan");fwSheet(t)}}
(()=>{const q=new URLSearchParams(location.search);
  if(q.has("shared")){history.replaceState(null,"",location.pathname);
    if(window.caches)caches.open("fitplan-share").then(c=>c.match("share-inbox").then(r=>r&&r.json().then(o=>{c.delete("share-inbox");shareIn(o.title||"",o.text||"",o.url||"",o.files||[])}))).catch(()=>{});return}
  const tx=q.get("text")||"",ti=q.get("title")||"",u=q.get("url")||"";if(!tx&&!ti&&!u)return;history.replaceState(null,"",location.pathname);shareIn(ti,tx,u)})();
if(navigator.storage&&navigator.storage.persist)navigator.storage.persist();
// Updates: beim Zurückholen der App nach neuer Version fragen und sie sofort laden
if("serviceWorker" in navigator&&location.protocol==="https:"){const SW=navigator.serviceWorker,had=!!SW.controller;let rl=false;
  SW.register("sw.js").then(reg=>{document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")reg.update().catch(()=>{})})}).catch(()=>{});
  SW.addEventListener("controllerchange",()=>{if(!had||rl)return;rl=true;const a=document.activeElement,busy=shopOn||sheetOpen()||$("sheet2").classList.contains("open")||(a&&/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)&&a.value);
    if(!busy)location.reload();else{toast("Neue Version von FitPlan ist da",()=>location.reload(),"Jetzt laden");clearTimeout(toast.h)}})}
