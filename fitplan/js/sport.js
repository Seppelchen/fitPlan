// FitPlan – Tab Sport: Sportarten, Laufband, Heimtraining
/* ---------- Sport ---------- */
function weekStart(){const d=new Date(dt.value+"T12:00");d.setDate(d.getDate()-((d.getDay()+6)%7));return d}
function lastDone(n){const ks=Object.keys(S.d).filter(k=>k<=dt.value&&S.d[k].s.some(s=>s.n===n)).sort();return ks.pop()||null}
function renderSport(){const D=day();
  const m=weekStart(),c={},mn={};S.A.forEach(a=>{c[a.n]=0;mn[a.n]=0});
  for(let i=0;i<7;i++){const x=new Date(m);x.setDate(m.getDate()+i);const v=S.d[iso(x)];if(v)v.s.forEach(s=>{if(s.n in c){c[s.n]++;mn[s.n]+=s.m||0}})}
  $("wk").innerHTML=S.A.length?S.A.map(a=>{let big,sub,col="var(--text)";
    if(a.p>1){const ld=lastDone(a.n);if(!ld){big="Offen";sub="Alle "+a.p+" Wochen"}else{const days=dayDiff(ld,dt.value),left=a.p*7-days;if(left>0){big="In "+left+" T.";col="var(--ok)"}else{big="Fällig";col="var(--warn)"}sub="Zuletzt "+dd(ld)}}
    else{big=c[a.n]+" / "+a.g;if(c[a.n]>=a.g)col="var(--ok)";sub=fmt(mn[a.n])+" Min. diese Woche"}
    return '<div class="mc"><div class="sm">'+esc(a.n)+'</div><div style="font-size:18px;font-weight:600;color:'+col+'">'+big+'</div><div class="sm">'+sub+'</div></div>'}).join(""):'<p class="sm">Noch keine Sportarten angelegt.</p>';
  const L=$("slist");L.innerHTML=D.s.length?"":'<p class="sm" style="margin:0">Noch kein Sport eingetragen.</p>';
  D.s.forEach(s=>{let det=s.m?fmt(s.m)+" Min.":"";if(s.km)det+=" · "+d2(s.km)+" km";if(s.v)det+=" · "+d1(s.v)+" km/h";if(s.st)det+=" · "+d1(s.st)+" %";
    const r=el("div","row",'<div class="t">'+esc(s.n)+(det?'<div class="sm">'+det+'</div>':'')+'</div><button class="ic" aria-label="Löschen">✕</button>');r.querySelector("button").onclick=()=>undoDel(D.s,D.s.indexOf(s),s.n,renderSport);L.appendChild(r)});
  const ac=$("act");ac.innerHTML="";
  S.A.filter(a=>edA||a.n!=="Laufband").forEach(a=>{const on=D.s.some(s=>s.n===a.n);const b=el("button",edA?"del":(on?"done":""),(edA?"✕ ":"＋ ")+esc(a.n)+'<div class="sm">'+goalTxt(a)+'</div>');b.style.textAlign="left";
    b.onclick=()=>{if(edA){if(!confirm("Sportart „"+a.n+"“ entfernen? Bisherige Einträge bleiben erhalten."))return;S.A=S.A.filter(x=>x!==a)}else{D.s.push({n:a.n,m:num($("smin").value)||0});toast(a.n+" eingetragen")}save();renderSport()};ac.appendChild(b)});
  $("edA").textContent=edA?"Fertig":"Bearbeiten";$("edA").classList.toggle("on",edA);
  const ex=$("exl");ex.innerHTML=S.E.length?"":'<p class="sm" style="margin:0">Füge Übungen aus der Bibliothek hinzu.</p>';
  S.E.forEach(e=>{const s=D.x[e.n]||0;const r=el("div","row",'<div class="t">'+esc(e.n)+'<div class="sm">'+esc(e.b||"")+'</div></div>');
    if(edE){const b=el("button","ic del","✕");b.setAttribute("aria-label","Übung entfernen");b.onclick=()=>{S.E=S.E.filter(x=>x!==e);save();renderSport()};r.appendChild(b)}
    else{const w=el("div","rounds");for(let j=1;j<=3;j++){const b=el("button",s>=j?"done":"",String(j));b.setAttribute("aria-label","Runde "+j);
      b.onclick=()=>{D.x[e.n]=(D.x[e.n]===j?j-1:j);if(S.E.length&&S.E.every(q=>(D.x[q.n]||0)>=3)&&!D.s.some(x=>x.n==="Heimtraining")){D.s.push({n:"Heimtraining",m:30});toast("Heimtraining geschafft")}save();renderSport()};w.appendChild(b)}r.appendChild(w)}
    ex.appendChild(r)});
  $("edE").textContent=edE?"Fertig":"Bearbeiten";$("edE").classList.toggle("on",edE);
  renderTread()}
$("edA").onclick=()=>{edA=!edA;renderSport()};
$("edE").onclick=()=>{edE=!edE;renderSport()};

$("newA").onclick=()=>openSheet("Neue Sportart",
  '<label class="f">Name</label><input id="aN" placeholder="Radfahren"><label class="f">Wie oft?</label><select id="aG"><option value="1-1">1× pro Woche</option><option value="2-1">2× pro Woche</option><option value="3-1">3× pro Woche</option><option value="4-1">4× pro Woche</option><option value="1-2">Alle 2 Wochen</option><option value="1-3">Alle 3 Wochen</option><option value="1-4">Alle 4 Wochen</option></select><button class="full pri" id="aS" style="margin-top:14px">Hinzufügen</button><p class="err" id="aE"></p>',
  ()=>{$("aN").oninput=()=>$("aE").textContent="";$("aS").onclick=()=>{const n=$("aN").value.trim();const [g,p]=$("aG").value.split("-").map(Number);
    if(!n){$("aE").textContent="Gib einen Namen ein.";return}
    if(S.A.some(a=>a.n.toLowerCase()===n.toLowerCase())){$("aE").textContent="Diese Sportart gibt es schon.";return}
    S.A.push({n,g,p});save();closeSheet();renderSport();toast("Sportart hinzugefügt")}});

function drawLib(){const lc=$("lc");lc.innerHTML="";Object.keys(LIB).forEach(c=>{const b=el("button",c===libCat?"on":"",c);b.onclick=()=>{libCat=c;drawLib()};lc.appendChild(b)});
  const ll=$("ll");ll.innerHTML="";LIB[libCat].forEach(x=>{const inP=S.E.some(e=>e.n===x[0]);const r=el("div","row",'<div class="t">'+esc(x[0])+'<div class="sm">'+esc(x[1])+'</div></div>');
    const b=el("button","ic"+(inP?" done":""),inP?"✓":"＋");b.setAttribute("aria-label",inP?"Aus Training entfernen":"Zum Training hinzufügen");
    b.onclick=()=>{if(inP)S.E=S.E.filter(e=>e.n!==x[0]);else S.E.push({n:x[0],b:x[1]});save();drawLib();renderSport()};r.appendChild(b);ll.appendChild(r)})}
$("libB").onclick=()=>openSheet("Übungsbibliothek",'<p class="sm" style="margin:0 0 8px">Alle Übungen sind knieschonend. Mit ＋ kommen sie ins Training.</p><div class="chips" id="lc"></div><div id="ll"></div>',drawLib);
$("newE").onclick=()=>openSheet("Eigene Übung",
  '<label class="f">Name</label><input id="eN" placeholder="Armkreisen"><label class="f">Beschreibung</label><input id="eB" placeholder="30 Sek. vorwärts, 30 Sek. rückwärts"><button class="full pri" id="eS" style="margin-top:14px">Hinzufügen</button><p class="err" id="eE"></p>',
  ()=>{$("eN").oninput=()=>$("eE").textContent="";$("eS").onclick=()=>{const n=$("eN").value.trim();
    if(!n){$("eE").textContent="Gib einen Namen ein.";return}
    if(S.E.some(e=>e.n===n)){$("eE").textContent="Diese Übung gibt es schon.";return}
    S.E.push({n,b:$("eB").value.trim()});save();closeSheet();renderSport();toast("Übung hinzugefügt")}});

const lm=$("lm"),lv=$("lv"),ls=$("ls"),lk=$("lk");
function lcalc(){$("lerr").textContent="";const m=num(lm.value),v=num(lv.value),k=num(lk.value);
  $("lcalc").textContent=(m>0&&v>0&&!(k>0))?"≈ "+d2(v*m/60)+" km":(m>0&&k>0&&!(v>0))?"≈ "+d1(k/(m/60))+" km/h Durchschnitt":""}
[lm,lv,ls,lk].forEach(i=>i.oninput=lcalc);
$("ladd").onclick=()=>{const m=num(lm.value);let v=num(lv.value),k=num(lk.value);const st=num(ls.value);
  if(!(m>0)){$("lerr").textContent="Gib die Minuten ein.";return}
  if(!(v>0)&&!(k>0)){$("lerr").textContent="Gib Tempo oder Kilometer ein.";return}
  if(!(k>0))k=v*m/60;if(!(v>0))v=k/(m/60);
  day().s.push({n:"Laufband",m,km:Math.round(k*100)/100,v:Math.round(v*10)/10,st:st>0?st:0});
  lk.value="";$("lcalc").textContent="";save();renderSport();toast("Laufband gespeichert")};
function renderTread(){const all=[];Object.keys(S.d).sort().forEach(k=>S.d[k].s.forEach(s=>{if(s.n==="Laufband")all.push({d:k,...s})}));
  const m=weekStart(),ms=iso(m),mes=addDays(ms,6);
  const wkm=all.filter(s=>s.d>=ms&&s.d<=mes).reduce((a,s)=>a+(s.km||0),0),tot=all.reduce((a,s)=>a+(s.km||0),0);
  const best=Math.max(0,...all.map(s=>s.v||0)),longest=Math.max(0,...all.map(s=>s.m||0));
  $("lstat").innerHTML=[["Diese Woche",d1(wkm)+" km"],["Gesamt",d1(tot)+" km"],["Bestes Tempo",best?d1(best)+" km/h":"–"],["Längste Einheit",longest?fmt(longest)+" Min.":"–"]].map(x=>'<div class="mc"><div class="sm">'+x[0]+'</div><div class="v">'+x[1]+'</div></div>').join("");
  const L=$("lhist");L.innerHTML="";const last=all.slice().reverse().slice(0,10);
  if(!last.length){L.innerHTML='<p class="sm" style="margin:0">Noch keine Einheit eingetragen.</p>';return}
  last.forEach(s=>L.appendChild(el("div","row",'<div class="t">'+dd(s.d)+'</div><div style="text-align:right">'+fmt(s.m)+' Min. · '+(s.km?d2(s.km)+' km':'–')+'<div class="sm">'+(s.v?d1(s.v)+' km/h':'–')+(s.st?' · '+d1(s.st)+' %':'')+'</div></div>')))}
