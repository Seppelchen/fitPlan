// FitPlan – Tab Essen: Tagesübersicht, Rezepte, freier Eintrag, Sicherungs-Erinnerung, Wasser
/* ---------- Essen ---------- */
function mkEntry(n,k1,p1,m,q,x){q=q||1;x=x||{};const e={n,k1,p1,q,m,k:Math.round(k1*q),p:Math.round(p1*q)};
  MK.forEach(([c])=>{if(x[c]!=null&&isFinite(x[c]))e[c+"1"]=x[c]});if(x.ic)e.ic=x.ic;if(x.id&&x.n===n)e.rid=x.id;return e}
function logFood(e){day().f.push(e);save();renderFood();toast("Eingetragen · "+e.m)}
function addRecipe(r,q,m){logFood(mkEntry(r.n,r.k,r.p,m||r.c,q,r))}
const isFav=n=>S.fav.some(x=>x.n.toLowerCase()===String(n).toLowerCase());
function toggleFav(o){if(isFav(o.n)){S.fav=S.fav.filter(x=>x.n.toLowerCase()!==o.n.toLowerCase());toast("Aus Favoriten entfernt")}else{S.fav.push(favOf(o));toast("Als Favorit gemerkt")}save()}
function qChips(id,cur,cb){const c=$(id);c.innerHTML="";PQ.forEach(q=>{const b=el("button",q===cur?"on":"",fq(q)+(q===1?" Portion":""));b.onclick=()=>cb(q);c.appendChild(b)})}

function renderFood(){
  const D=day(),G=S.g.k;let k=0,p=0;D.f.forEach(f=>{k+=f.k;p+=f.p});
  renderDonut(D);renderMac(D);
  const L=$("flist");L.innerHTML="";
  if(!D.f.length)L.innerHTML='<p class="sm" style="margin:0">Noch nichts eingetragen.</p>';
  [...CATS,""].forEach(c=>{const it=D.f.filter(f=>c?f.m===c:!CATS.includes(f.m));if(!it.length)return;
    const t=macSum(it),ci=CATS.indexOf(c);L.appendChild(el("div","gh",'<span><span class="dot" style="background:'+(ci<0?"var(--muted)":"var(--s"+(ci+1)+")")+'"></span>'+(c||"Sonstiges")+'</span><span>'+fmt(t.k)+' kcal'+(t.any?'<span class="m"> · E '+fmt(t.p)+' · KH '+fmt(t.kh)+' · F '+fmt(t.fe)+' g</span>':'')+'</span>'));
    it.forEach(f=>{const r=el("div","row",'<span class="fi">'+icOf(f)+'</span><div class="t" style="cursor:pointer">'+(f.q!==1?fq(f.q)+' × ':'')+esc(f.n)+(isFav(f.n)?' ⭐':'')+'<div class="sm">'+mline(f.k,f.p,mv(f,"kh"),mv(f,"fe"))+'</div></div>'+(recipeOf(f)?'<button class="ic rzb" aria-label="Rezept ansehen">📖</button>':'')+'<button class="ic xd" aria-label="Löschen">✕</button>');
      r.querySelector(".t").onclick=r.querySelector(".fi").onclick=()=>entrySheet(f);r.querySelector("button.xd").onclick=()=>undoDel(D.f,D.f.indexOf(f),"Eintrag",renderFood);
      if(r.querySelector(".rzb"))r.querySelector(".rzb").onclick=()=>openRecipeOf(f);L.appendChild(r)})});
  renderPlanned();renderQuick();renderBackup();
  const rc=$("rcats");rc.innerHTML="";CATS.forEach(c=>{const b=el("button",c===rcat?"on":"",c);b.onclick=()=>{rcat=c;renderFood()};rc.appendChild(b)});
  const rs=$("rsub");rs.innerHTML="";rs.style.display=rcat==="Frühstück"?"flex":"none";
  if(rcat==="Frühstück")["Süß","Herzhaft","Alle"].forEach(c=>{const b=el("button",c===rsub?"on":"",c);b.onclick=()=>{rsub=c;renderFood()};rs.appendChild(b)});
  const q=$("rq").value.trim().toLowerCase();
  let items=S.R.filter(r=>r.c===rcat);
  if(rcat==="Frühstück"&&rsub!=="Alle")items=items.filter(r=>(r.tg||"h")===(rsub==="Süß"?"s":"h"));
  if(q)items=items.filter(r=>r.n.toLowerCase().includes(q)||(r.z||[]).join(" ").toLowerCase().includes(q));
  const RL=$("rlist");RL.innerHTML="";
  if(!items.length)RL.innerHTML='<p class="sm" style="margin:8px 0 0">Keine Rezepte gefunden.</p>';
  $("rman").textContent=rMan?"Fertig":"Verwalten";$("rman").className=rMan?"on":"";const MB=$("rmb");MB.style.display=rMan?"":"none";
  if(rMan){const miss=RB.filter(x=>!S.R.some(y=>y.n.toLowerCase()===x[1].toLowerCase()));
    MB.innerHTML='<p class="sm" style="margin:0 0 8px;padding:8px 10px;border-radius:10px;background:var(--accbg);color:var(--text)">Tippe 🗑 zum Löschen – auch bei den mitgelieferten Rezepten. Antippen öffnet das Rezept zum Bearbeiten.</p>'+
      (miss.length?'<button class="full" id="rres" style="margin-bottom:10px">↺ '+miss.length+' gelöschte'+(miss.length===1?'s Standardrezept':' Standardrezepte')+' wiederherstellen</button>':'');
    if(miss.length)$("rres").onclick=()=>{miss.forEach(x=>S.R.push(mkR(x)));save();renderFood();toast(miss.length+(miss.length===1?" Rezept":" Rezepte")+" wiederhergestellt")}}
  items.forEach(r=>{const row=el("div","row",'<span class="fi">'+icOf(r)+'</span><div class="t" style="cursor:pointer">'+esc(r.n)+(r.tg==="s"?'<span class="bdg s">süß</span>':'')+(quick(r)?'<span class="bdg">schnell</span>':'')+'<div class="sm">'+mline(r.k,r.p,r.kh,r.fe)+(r.t?' · '+esc(r.t):'')+'</div></div>'+(rMan?'<button class="ic del" aria-label="Löschen">🗑</button>':'<button class="ic" aria-label="Eintragen">＋</button>'));
    row.querySelector(".t").onclick=row.querySelector(".fi").onclick=()=>rMan?recipeForm(r.id):recipeDetail(r.id);row.querySelector("button").onclick=()=>rMan?delRecipe(r):addRecipe(r,1);RL.appendChild(row)});
}
$("rq").oninput=renderFood;
// Tagessumme: Kohlenhydrate, Fett, Ballaststoffe und Verteilung der Kalorien
function renderDonut(D){const G=S.g.k,k=sumK(D.f),sc=Math.max(k,G)||1,R=52,C=2*Math.PI*R,W=15;
  const parts=[...CATS.map((c,i)=>({l:c,v:sumK(D.f.filter(f=>f.m===c)),col:"var(--s"+(i+1)+")"})),{l:"Sonstiges",v:sumK(D.f.filter(f=>!CATS.includes(f.m))),col:"var(--muted)"}];
  const on=parts.filter(x=>x.v>0),gap=on.length>1||(on.length&&k<G)?1.8:0;let off=0;
  let h='<circle cx="60" cy="60" r="'+R+'" fill="none" stroke="var(--chip)" stroke-width="'+W+'"/>';
  on.forEach(x=>{const len=x.v/sc*C,L=Math.max(.6,len-gap);h+='<circle cx="60" cy="60" r="'+R+'" fill="none" stroke="'+x.col+'" stroke-width="'+W+'" stroke-dasharray="'+L.toFixed(2)+' '+(C-L).toFixed(2)+'" stroke-dashoffset="'+(-off).toFixed(2)+'"><title>'+x.l+': '+fmt(x.v)+' kcal</title></circle>';off+=len});
  if(k>G){const a=G/sc*2*Math.PI,p=r=>(60+r*Math.cos(a)).toFixed(1)+'" y'+(r<R?1:2)+'="'+(60+r*Math.sin(a)).toFixed(1);h+='<line x1="'+p(R-W/2-3)+'" x2="'+p(R+W/2+3)+'" stroke="var(--text)" stroke-width="2.5"><title>Ziel '+fmt(G)+' kcal</title></line>'}
  $("dsv").innerHTML=h;$("kc").textContent=fmt(k);$("kc").style.color=k>G?"var(--warn)":"";$("kz").textContent="von "+fmt(G)+" kcal";
  const row=(dot,l,v,st)=>'<div class="dlr"><span class="dot" style="'+dot+'"></span><span>'+l+'</span><b'+(st?' style="'+st+'"':'')+'>'+v+'</b></div>';
  $("dleg").innerHTML=parts.filter((x,i)=>i<4||x.v).map(x=>row("background:"+x.col,x.l,x.v?fmt(x.v):"–")).join("")+
    '<div style="border-top:1px solid var(--border);margin-top:4px;padding-top:2px">'+row("background:var(--chip);box-shadow:inset 0 0 0 1px var(--muted)",k<=G?"Übrig":"Zu viel",fmt(Math.abs(G-k)),k>G?"color:var(--warn)":"")+'</div>'}
function renderMac(D){const t=macSum(D.f),G=S.g,M=$("mac");
  M.innerHTML=[["p","Eiweiß"],...MK].map(([c,l])=>{const v=t[c],g=c==="p"?G.pz:G[c]||0,low=c==="bs"||c==="p";
    const sub=g?"von "+fmt(g)+" g":c!=="bs"&&t.k&&t.any?Math.round(v*(c==="fe"?9:4)/t.k*100)+" % der Kalorien":"";
    const bar=g?'<div class="bar"><div style="width:'+Math.min(100,v/g*100)+'%;background:'+(low?(v>=g?"var(--ok)":"var(--accent)"):(v>g?"var(--warn)":"var(--accent)"))+'"></div></div>':"";
    return '<div class="mc"><div class="sm">'+l+'</div><b>'+fmt(v)+' g</b>'+(sub?'<div class="sm">'+sub+'</div>':'')+bar+'</div>'}).join("");
  const e=[["mE","Eiweiß",t.p*4],["mK","Kohlenhydrate",t.kh*4],["mF","Fett",t.fe*9]],tot=e.reduce((a,x)=>a+x[2],0),B=$("mbar");
  B.style.display=t.any&&tot?"":"none";B.innerHTML=tot?e.map(x=>'<div style="width:'+(x[2]/tot*100)+'%;background:var(--'+x[0]+')"></div>').join(""):"";
  $("mlg").innerHTML=(t.any&&tot?"Kalorien aus: "+e.map(x=>'<span style="white-space:nowrap"><span class="dot" style="background:var(--'+x[0]+')"></span>'+x[1]+' '+Math.round(x[2]/tot*100)+' %</span>').join(" &nbsp;"):"")+
    (t.miss&&t.k?(t.any?'<br>':'')+t.miss+(t.miss===1?" Eintrag":" Einträge")+" ohne Kohlenhydrate/Fett – antippen zum Ergänzen":"")}

// Rezept zum Eintrag (gleicher Name): eigene Rezepte, sonst gemeinsame Rezepte der Familie
const nrm=s=>String(s||"").toLowerCase().replace(/\s+/g," ").trim();
function recipeOf(f){const n=typeof f==="string"?f:f.n;
  if(f&&f.rid){const r=S.R.find(x=>x.id===f.rid);if(r)return{r,own:1}}
  const l=nrm(n),alt=nrm(VEG[String(n).trim()]),r=S.R.find(x=>{const m=nrm(x.n);return m===l||!!alt&&m===alt});if(r)return{r,own:1};
  const g=famList("rz").find(x=>nrm(x.r.n)===l);return g?{r:rzSan(g.r),gid:g.id}:null}
// 📖 in der Gegessen-Liste: Rezept direkt öffnen (eigenes oder gemeinsames)
function openRecipeOf(f){const rc=recipeOf(f);if(!rc)return;if(rc.own)recipeDetail(rc.r.id);else famRecipe(rc.gid)}
function entrySheet(f){const D=day();let q=f.q;const rc=recipeOf(f);
  openSheet("Eintrag bearbeiten",
  '<div style="display:flex;gap:10px;align-items:center;margin:0 0 10px"><span class="fi">'+icOf(f)+'</span><b>'+esc(f.n)+'</b></div>'+
  (rc?'<details class="rzx"><summary>📖 Zutaten & Zubereitung</summary><div id="erz"></div></details>':'')+
  '<p class="lb">Portion</p><div class="chips" id="eq"></div>'+
  '<div class="g2"><div class="mc"><div class="sm">Kalorien</div><b id="ekc"></b></div><div class="mc"><div class="sm">Eiweiß</div><b id="epr"></b></div></div>'+mt3("em_")+
  (f.kh1==null?'<details style="margin-top:10px"><summary class="sm" style="cursor:pointer">Kohlenhydrate, Fett, Ballaststoffe ergänzen</summary><p class="sm" style="margin:6px 0 0">Werte für 1 Portion</p><div class="g3"><input id="ekh" inputmode="decimal" placeholder="KH g"><input id="efe" inputmode="decimal" placeholder="Fett g"><input id="ebs" inputmode="decimal" placeholder="Bst. g"></div></details>':'')+
  '<label class="f">Mahlzeit</label>'+mealSel("em",CATS.includes(f.m)?f.m:guessMeal())+
  '<button class="full" id="efav" style="margin-top:12px"></button><button class="full pri" id="esv" style="margin-top:8px">Speichern</button><button class="full del" id="edl" style="margin-top:8px">Löschen</button>',
  ()=>{const rz=()=>{if(!rc)return;const r=rc.r,st=steps(r.s),pz=r.pz>1,z=r.z||[];
      $("erz").innerHTML=(r.t?'<p class="sm" style="margin:8px 0 0">⏱ '+esc(r.t)+'</p>':'')+
        '<p class="lb" style="margin:10px 0 4px">Zutaten '+(pz?'(für alle '+fq(r.pz)+' Portionen)':'('+fq(q)+(q<=1?' Portion':' Portionen')+')')+'</p>'+
        (z.length?'<ul class="z">'+z.map(x=>'<li>'+esc(pz?x:scaleZ(x,q))+'</li>').join("")+'</ul>':'<p class="sm" style="margin:0">Keine Zutatenliste hinterlegt.</p>')+
        '<p class="lb" style="margin:12px 0 4px">Zubereitung</p>'+(st.length?'<ol class="st">'+st.map(x=>'<li>'+esc(x)+'</li>').join("")+'</ol>':'<p class="sm" style="margin:0">Keine Zubereitung hinterlegt.</p>')+
        (rc.own?'<button class="full" id="erzo" style="margin-top:8px;font-size:14px">Rezept öffnen</button>':'');
      if(rc.own)$("erzo").onclick=()=>recipeDetail(rc.r.id)};
    const dr=()=>{qChips("eq",q,v=>{q=v;dr()});rz();$("ekc").textContent=fmt(f.k1*q)+" kcal";$("epr").textContent=fmt(f.p1*q)+" g";mt3set("em_",c=>{const i=$("e"+c),x=i?nn(i.value):null;return f[c+"1"]!=null?f[c+"1"]*q:x!=null?x*q:null})};dr();
    if(f.kh1==null)["ekh","efe","ebs"].forEach(i=>$(i).oninput=dr);
    const fb=()=>{$("efav").textContent=isFav(f.n)?"★ Aus Favoriten entfernen":"☆ Als Favorit merken"};fb();
    const addM=()=>{if(f.kh1==null)MK.forEach(([c])=>{const x=nn($("e"+c).value);if(x!=null)f[c+"1"]=x})};
    $("efav").onclick=()=>{addM();toggleFav({...f,m:$("em").value});fb();renderFood()};
    $("esv").onclick=()=>{addM();f.q=q;f.k=Math.round(f.k1*q);f.p=Math.round(f.p1*q);f.m=$("em").value;save();closeSheet();renderFood();toast("Gespeichert")};
    $("edl").onclick=()=>{closeSheet();undoDel(D.f,D.f.indexOf(f),"Eintrag",renderFood)}})}

function renderQuick(){const R=$("rec");R.innerHTML="";const seen=new Set(),items=[];
  S.fav.forEach(f=>{seen.add(f.n.toLowerCase());items.push({...f,fav:1})});
  const ks=Object.keys(S.d).sort().reverse();let n=0;
  outer:for(const k of ks){const fs=S.d[k].f;for(let j=fs.length-1;j>=0;j--){const f=fs[j],l=f.n.toLowerCase();if(seen.has(l))continue;seen.add(l);items.push(favOf(f));if(++n>=8)break outer}}
  if(!items.length){R.innerHTML='<p class="sm" style="margin:0">Hier erscheinen deine Favoriten und was du zuletzt gegessen hast – ein Tipp trägt es wieder ein.</p>';return}
  items.forEach(it=>{const b=el("button","",(it.fav?"⭐ ":"")+icOf(it)+" "+esc(it.n)+' · '+fmt(it.k1)+' kcal');
    b.onclick=()=>logFood(mkEntry(it.n,it.k1,it.p1,dt.value===todayK()?guessMeal():(CATS.includes(it.m)?it.m:guessMeal()),1,per1(it)));R.appendChild(b)})}

function renderPlanned(){const P=$("fplan"),pl=S.pl[dt.value]||{},D=day();P.innerHTML="";
  const items=CATS.map(c=>({c,r:rById(pl[c])})).filter(x=>x.r&&!D.f.some(f=>f.n===x.r.n));
  if(!items.length)return;
  P.appendChild(el("p","lb","Geplant für diesen Tag – antippen zum Eintragen"));const ch=el("div","chips");
  items.forEach(x=>{const b=el("button","","＋ "+x.c+": "+esc(x.r.n));b.onclick=()=>addRecipe(x.r,1,x.c);ch.appendChild(b)});P.appendChild(ch)}

$("cpy").onclick=()=>{const yk=addDays(dt.value,-1),fs=(S.d[yk]||{}).f||[];
  if(!fs.length){toast("Am "+dd(yk)+" ist nichts eingetragen");return}
  const groups=[...CATS,""].map(c=>({c,it:fs.filter(f=>c?f.m===c:!CATS.includes(f.m))})).filter(g=>g.it.length);
  openSheet("Von "+wd(yk)+", "+dd(yk)+" übernehmen",'<p class="sm" style="margin:0 0 6px">Tippe an, was du für den '+dd(dt.value)+' übernehmen möchtest.</p>'+
    groups.map((g,i)=>'<div class="row"><div class="t">'+(g.c||"Sonstiges")+' · '+fmt(sumK(g.it))+' kcal<div class="sm">'+g.it.map(f=>esc(f.n)).join(", ")+'</div></div><button class="ic" data-i="'+i+'" aria-label="Übernehmen">＋</button></div>').join("")+
    '<button class="full pri" id="cpall" style="margin-top:12px">Alles übernehmen</button>',
  ()=>{const cp=its=>{const D=day();its.forEach(f=>D.f.push({...f}));save();renderFood()};
    $("sheetIn").querySelectorAll("button[data-i]").forEach(b=>b.onclick=()=>{if(b.classList.contains("done"))return;cp(groups[+b.dataset.i].it);b.classList.add("done");b.textContent="✓";toast("Übernommen")});
    $("cpall").onclick=()=>{cp(fs);closeSheet();toast(fs.length+" Einträge übernommen")}})};

// ctx: {k,c} = aus dem Wochenplan geöffnet, {k,c,pick:1} = Vorschau bei der Rezeptauswahl
// Zubereitung in Schritte teilen: eine Zeile = ein Schritt, sonst nach Sätzen
// (ohne Lookbehind-Regex, damit auch ältere iPhones die Seite laden)
const ABR=/(?:^|\s)(?:ca|min|std|sek|bzw|evtl|ggf|z|u|d|z\.\s?b|u\.\s?a|d\.\s?h|pkg|stk|el|tl|nr|max|mind|gr)\.$/i;
const steps=t=>{t=String(t||"").trim();if(!t)return[];let L=t.split(/\n+/).map(x=>x.trim()).filter(Boolean);
  if(L.length<2){L=[];const re=/[.!?]\s+(?=[A-ZÄÖÜ0-9])/g;let last=0,cur="",m;
    while((m=re.exec(t))){cur+=t.slice(last,m.index+1);last=re.lastIndex;if(ABR.test(cur))cur+=" ";else{L.push(cur);cur=""}}
    L.push(cur+t.slice(last))}
  return L.map(x=>x.replace(/^\d+[.)]\s*/,"").trim()).filter(Boolean)};
// Zutatenzeile auf q Portionen umrechnen: "100 g Quark" → "50 g Quark", "1 Ei (M)" → "½ Ei (M)"
const FRC={"½":.5,"¼":.25,"¾":.75};
const pnum=x=>{x=String(x).replace(/\s+/g,"");const m=x.match(/^(\d*)([½¼¾])$/);return m?(+(m[1]||0))+FRC[m[2]]:parseFloat(x.replace(",","."))};
const qfr=v=>{let i=Math.floor(v+1e-9),f=Math.round((v-i)*4)/4;if(f>=1){i++;f=0}const g={0:"",.25:"¼",.5:"½",.75:"¾"}[f];return g==null?nf(v):(i||!g?String(i||0):"")+g};
const qfmt=(v,u)=>/^(g|ml|kg|l)$/i.test(u)?(v>=10?fmt(v):nf(Math.round(v*10)/10)):Math.abs(Math.round(v*4)/4-v)<.02||v<20?qfr(v):fmt(v);
function scaleZ(line,q){if(q===1)return line;
  const one=seg=>seg.replace(/^((?:\d+(?:[.,]\d+)?(?:\s?[½¼¾])?|[½¼¾]))(?:\s*([–-])\s*(\d+(?:[.,]\d+)?|[½¼¾]))?(\s*)([^\s,()]*)/,(m,a,dash,b,sp,u)=>{
    const v=pnum(a)*q,w=b!=null?pnum(b)*q:null;let unit=u;
    if(/^eier$/i.test(u)&&v<=1&&w==null)unit="Ei";else if(/^ei$/i.test(u)&&v>1)unit="Eier";else if(/^prise$/i.test(u)&&v>1)unit="Prisen";else if(/^prisen$/i.test(u)&&v<=1)unit="Prise";
    return qfmt(v,u)+(w!=null?dash+qfmt(w,u):"")+sp+unit});
  return line.split(/,\s+/).map(one).join(", ")
    .replace(/\((\d+(?:[.,]\d+)?)\s*(g|ml)\)/g,(m,a,u)=>"("+qfmt(pnum(a)*q,u)+" "+u+")")
    .replace(/\((\d+)\s+Scheiben?\)/g,(m,a)=>{const v=pnum(a)*q;return"("+qfr(v)+" Scheibe"+(v>1?"n":"")+")"})
    .replace(/\((\d+)\s+Stück\)/g,(m,a)=>"("+qfr(pnum(a)*q)+" Stück)")}
function recipeDetail(id,ctx){const r=S.R.find(x=>x.id===id);if(!r)return;let q=1;const pk=ctx&&ctx.pick,pl=ctx&&!pk,when=ctx?wd(ctx.k)+" "+dd(ctx.k):"";
  openSheet(icOf(r)+" "+esc(r.n),
  (pk?'<button id="rdBk" style="margin:0 0 10px;font-size:14px;padding:5px 12px">‹ Zurück zur Auswahl</button>':'')+
  (ctx?'<p class="sm" style="margin:0 0 10px;padding:8px 10px;border-radius:10px;background:var(--accbg);color:var(--text)">📅 '+(pk?'Auswahl für ':'Geplant für ')+when+' · '+esc(ctx.c)+'</p>':'')+
  '<p class="lb">Portion</p><div class="chips" id="rdq"></div>'+
  '<div class="g2"><div class="mc"><div class="sm">Kalorien</div><b id="rdk"></b></div><div class="mc"><div class="sm">Eiweiß</div><b id="rdp"></b></div></div>'+mt3("rd_")+
  '<p class="sm" style="margin:10px 0 8px">'+esc(r.c)+(r.t?' · ⏱ '+esc(r.t):'')+'</p>'+
  (r.z&&r.z.length?'<p class="lb" id="rdzl"></p><ul class="z" id="rdz"></ul>':'<p class="sm">Keine Zutatenliste hinterlegt.</p>')+
  '<p class="lb" style="margin-top:12px">Zubereitung</p>'+(steps(r.s).length?'<ol class="st">'+steps(r.s).map(x=>'<li>'+esc(x)+'</li>').join("")+'</ol>':'<p class="sm" style="margin:0 0 6px">Noch keine Zubereitung hinterlegt.</p><button id="rdS">＋ Zubereitung hinzufügen</button>')+
  (pk?'<button class="full pri" id="rdPl" style="margin-top:16px">📅 Für '+when+' · '+esc(ctx.c)+' einplanen</button>':
  (pl?'':'<label class="f" style="margin-top:16px">Mahlzeit</label>'+mealSel("rdm",r.c))+
  '<button class="full pri" id="rdAdd" style="margin-top:10px"></button>'+
  (pl?'<div class="g2" style="margin-top:8px"><button id="rdCh">Anderes Rezept</button><button class="del" id="rdRm">Aus dem Plan</button></div><button class="full" id="rdEd" style="margin-top:8px">Rezept bearbeiten</button>'
    :'<div class="g2" style="margin-top:8px"><button id="rdEd">Bearbeiten</button><button class="del" id="rdDel">Löschen</button></div>')+'<button class="full" id="rdSh" style="margin-top:8px"></button>'),
  ()=>{if($("rdS"))$("rdS").onclick=()=>recipeForm(r.id,"fS");
    // Portion ändert Nährwerte und – außer bei Rezepten für mehrere Portionen – die Zutatenmengen
    const show=()=>{qChips("rdq",q,v=>{q=v;show()});$("rdk").textContent=fmt(r.k*q)+" kcal";$("rdp").textContent=fmt(r.p*q)+" g";mt3set("rd_",c=>r[c]==null?null:r[c]*q);
      if($("rdz")){const pz=r.pz>1;$("rdzl").textContent="Zutaten "+(pz?"(für alle "+r.pz+" Portionen – Nährwerte oben gelten für "+(q===1?"1 Portion":fq(q)+" Portionen")+")":"("+(q===1?"1 Portion":fq(q)+(q<=1?" Portion":" Portionen"))+")");
        $("rdz").innerHTML=r.z.map(z=>'<li>'+esc(pz?z:scaleZ(z,q))+'</li>').join("")}
      if($("rdAdd"))$("rdAdd").textContent="＋ Eintragen"+(pl?" für "+when:"")+" · "+fq(q)+(q<=1?" Portion":" Portionen")+" · "+fmt(r.k*q)+" kcal"};show();
    if(pk){$("rdBk").onclick=()=>pickRecipe(ctx.k,ctx.c);$("rdPl").onclick=()=>{planSet(ctx.k,ctx.c,r.id);closeSheet();toast("Eingeplant · "+when)};return}
    $("rdEd").onclick=()=>recipeForm(r.id);
    const shd=()=>{$("rdSh").textContent=rzShared(r)?"👥 Mit der Familie geteilt ✓ – nicht mehr teilen":"👥 Mit der Familie teilen"};shd();$("rdSh").onclick=()=>{rzToggle(r);shd()};
    if(pl){$("rdAdd").onclick=()=>{const D=S.d[ctx.k]||(S.d[ctx.k]={f:[],s:[],x:{},h:[]});D.f.push(mkEntry(r.n,r.k,r.p,ctx.c,q,r));save();closeSheet();renderFood();renderPlan();toast("Eingetragen · "+ctx.c+", "+when)};
      $("rdCh").onclick=()=>pickRecipe(ctx.k,ctx.c);
      $("rdRm").onclick=()=>{planSet(ctx.k,ctx.c,null);closeSheet();toast("Aus dem Plan genommen",()=>{planSet(ctx.k,ctx.c,r.id)})};return}
    $("rdAdd").onclick=()=>{addRecipe(r,q,$("rdm").value);closeSheet()};
    $("rdDel").onclick=()=>{closeSheet();delRecipe(r)}})}
function delRecipe(r){const i=S.R.indexOf(r);if(i<0)return;S.R.splice(i,1);save();renderFood();renderPlan();
  toast("„"+r.n+"“ gelöscht",()=>{S.R.splice(Math.min(i,S.R.length),0,r);save();renderFood();renderPlan()})}

function recipeForm(id,focus,after){const r=id?S.R.find(x=>x.id===id):null;
  const tg=r?(r.tg||"h"):(rcat==="Frühstück"&&rsub==="Süß"?"s":"h");
  openSheet(r?"Rezept bearbeiten":"Neues Rezept",
  '<label class="f">Name</label><input id="fN" value="'+esc(r?r.n:"")+'" placeholder="Bananen-Haferkekse">'+
  '<label class="f">Bild</label><div class="chips icp" id="fIc" style="margin:0"></div>'+
  '<div class="g2"><div><label class="f">Mahlzeit</label>'+mealSel("fC",r?r.c:rcat)+'</div>'+
  '<div><label class="f">Geschmack</label><select id="fT"><option value="s"'+(tg==="s"?' selected':'')+'>Süß</option><option value="h"'+(tg==="h"?' selected':'')+'>Herzhaft</option></select></div>'+
  '<div><label class="f">Kalorien (kcal)</label><input id="fK" type="number" inputmode="numeric" value="'+(r?r.k:"")+'"></div>'+
  '<div><label class="f">Eiweiß (g)</label><input id="fP" type="number" inputmode="numeric" value="'+(r?r.p:"")+'"></div></div>'+
  '<div class="g3">'+MK.map(([c,l])=>'<div><label class="f">'+(c==="kh"?"Kohlenhydr.":c==="bs"?"Ballastst.":l)+' (g)</label><input id="f_'+c+'" inputmode="decimal" value="'+(r&&r[c]!=null?String(r[c]).replace(".",","):"")+'"></div>').join("")+'</div>'+
  '<div class="mc" style="margin-top:12px;background:none;border:1px dashed var(--border)"><b style="font-size:15px">🧮 Aus Zutaten berechnen</b>'+
  '<p class="sm" style="margin:2px 0 4px">Zutaten mit Menge auswählen – Kalorien und Nährwerte oben rechnet FitPlan dann selbst aus.</p><div id="rcl"></div>'+
  '<div style="display:flex;gap:8px;align-items:center;margin-top:8px"><button class="pri" id="rca">＋ Zutat</button><span class="sm" style="margin-left:auto">Ergibt Portionen</span><input id="rcp" type="number" inputmode="numeric" min="1" max="50" value="'+(r&&r.pz||1)+'" style="width:64px"></div>'+
  '<p class="sm" id="rcs" style="margin:8px 0 0"></p></div>'+
  '<label class="f">Zubereitungszeit</label><input id="fZt" value="'+esc(r?r.t:"")+'" placeholder="10 Min.">'+
  '<label class="f" id="fZl">Zutaten – eine pro Zeile, mit Menge</label><textarea id="fZ" rows="6" placeholder="50 g Haferflocken&#10;200 ml Milch 1,5 %">'+esc(r?(r.z||[]).join("\n"):"")+'</textarea>'+
  '<label class="f">Zubereitung – ein Schritt pro Zeile</label><textarea id="fS" rows="6" placeholder="Zwiebel würfeln und anbraten.&#10;Tomaten zugeben und 10 Min. köcheln.&#10;Mit Salz und Pfeffer abschmecken.">'+esc(r?r.s:"")+'</textarea>'+
  (r?'':'<label style="display:flex;gap:8px;align-items:center;margin-top:12px;font-size:15px"><input type="checkbox" id="fNow" style="width:auto"> Heute direkt eintragen</label>')+
  '<button class="full pri" id="fSave" style="margin-top:14px">Speichern</button><p class="err" id="fErr"></p>',
  ()=>{["fN","fK"].forEach(i=>$(i).oninput=()=>$("fErr").textContent="");
    if(focus)setTimeout(()=>{const f=$(focus);if(f){f.scrollIntoView({block:"center"});f.focus()}},80);
    let ic=r&&r.ic||"";const icd=()=>{const B=$("fIc");B.innerHTML="";const a=el("button",ic?"":"on",'<span style="font-size:13px">Auto</span> '+foodIc($("fN").value));a.onclick=()=>{ic="";icd()};B.appendChild(a);
      ICS.forEach(e=>{const b=el("button",e===ic?"on":"",e);b.setAttribute("aria-label","Bild "+e);b.onclick=()=>{ic=e;icd()};B.appendChild(b)})};icd();
    $("fN").addEventListener("input",()=>{if(!ic)$("fIc").firstChild.lastChild.textContent=" "+foodIc($("fN").value)});
    let ci=(r&&r.ci||[]).map(x=>({...x}));const pzv=()=>Math.min(50,Math.max(1,parseInt($("rcp").value)||1));
    const calc=fill=>{const L=$("rcl"),pz=pzv();L.innerHTML="";$("fZl").textContent="Zutaten – eine pro Zeile, mit Menge"+(pz>1?" (für alle "+pz+" Portionen)":"");
      const zl=x=>x.z||nf(x.a)+" "+x.u+" "+x.n;
      ci.forEach((x,i)=>{const row=el("div","row",'<div class="t">'+esc(zl(x))+'<div class="sm">'+mline(x.k,x.p,x.kh,x.fe)+'</div></div><button class="ic" aria-label="Entfernen">✕</button>');
        row.querySelector("button").onclick=()=>{ci.splice(i,1);const z=$("fZ"),ln=zl(x),ls=z.value.split("\n"),j=ls.findIndex(l=>l.trim()===ln);if(j>=0){ls.splice(j,1);z.value=ls.join("\n")}calc(true)};L.appendChild(row)});
      if(!ci.length){$("rcs").textContent="";return}
      const t={k:0,p:0,kh:0,fe:0,bs:0},has={};ci.forEach(x=>["k","p","kh","fe","bs"].forEach(c=>{if(x[c]!=null){t[c]+=x[c];has[c]=1}}));
      if(fill){$("fK").value=Math.round(t.k/pz);$("fP").value=Math.round(t.p/pz);MK.forEach(([c])=>$("f_"+c).value=has[c]?String(Math.round(t[c]/pz*10)/10).replace(".",","):"");$("fErr").textContent=""}
      $("rcs").textContent="Zusammen "+fmt(t.k)+" kcal"+(pz>1?", also "+fmt(t.k/pz)+" kcal pro Portion":"")+(fill?" – oben eingetragen.":"")};
    calc(false);$("rcp").oninput=()=>calc(ci.length>0);
    $("rca").onclick=()=>{pickCb=x=>{ci.push(x);const z=$("fZ");z.value=(z.value.trim()?z.value.trim()+"\n":"")+(x.z||nf(x.a)+" "+x.u+" "+x.n);calc(true);toast(x.n+" hinzugefügt")};L2=true;foodSearch()};
    $("fSave").onclick=()=>{const n=$("fN").value.trim(),k=num($("fK").value);
      if(!n){$("fErr").textContent="Gib einen Namen ein.";return}
      if(!(k>0)){$("fErr").textContent="Gib die Kalorien ein.";return}
      const o={c:$("fC").value,tg:$("fT").value,n,k:Math.round(k),p:Math.round(num($("fP").value)||0),kh:nn($("f_kh").value),fe:nn($("f_fe").value),bs:nn($("f_bs").value),ci:ci.length?ci:undefined,pz:pzv()>1?pzv():undefined,ic:ic||undefined,t:$("fZt").value.trim(),z:$("fZ").value.split("\n").map(s=>s.trim()).filter(Boolean),s:$("fS").value.trim()};
      if(r){Object.assign(r,o);if(rzShared(r)){const id=rzId(r);famSet("rz",id,{...famMap("rz")[id],r:rzPack(r)});renderFam()}}  // geteilte Fassung mitändern
      else{o.id=uid();S.R.push(o);if($("fNow").checked)day().f.push(mkEntry(o.n,o.k,o.p,o.c,1,o))}
      rcat=o.c;if(o.c==="Frühstück")rsub=o.tg==="s"?"Süß":"Herzhaft";save();closeSheet();renderFood();toast("Rezept gespeichert");if(!r&&after)after(o)}})}
$("newR").onclick=()=>recipeForm(null);$("rman").onclick=()=>{rMan=!rMan;renderFood()};

$("qm").innerHTML=CATS.map(c=>'<option>'+c+'</option>').join("");$("qm").value=guessMeal();
["qn","qk","qp","qkh","qfe"].forEach(i=>$(i).oninput=()=>$("qerr").textContent="");
$("qadd").onclick=()=>{const n=$("qn").value.trim(),k=num($("qk").value);
  if(!n){$("qerr").textContent="Gib einen Namen ein.";return}
  if(!(k>0)){$("qerr").textContent="Gib die Kalorien ein.";return}
  logFood(mkEntry(n,Math.round(k),Math.round(num($("qp").value)||0),$("qm").value,1,{kh:nn($("qkh").value),fe:nn($("qfe").value)}));$("qn").value=$("qk").value=$("qp").value=$("qkh").value=$("qfe").value="";$("qm").value=guessMeal()};

/* ---------- Sicherungs-Erinnerung ---------- */
function renderBackup(){const B=$("bkb");
  const used=Object.values(S.d).filter(D=>D.f.length||D.s.length||D.h.length).length+Object.keys(S.w).length;
  const days=S.lastExp?Math.floor((Date.now()-new Date(S.lastExp))/864e5):null;
  if(used<3||(S.bsz&&Date.now()<S.bsz)||(days!==null&&days<14)){B.style.display="none";return}
  B.style.display="";$("bkt").textContent=(days===null?"Du hast noch keine Sicherung erstellt.":"Deine letzte Sicherung ist "+days+" Tage alt.")+" Deine Daten liegen nur auf diesem Gerät – wird die App gelöscht, sind sie weg."}
$("bkl").onclick=()=>{S.bsz=Date.now()+3*864e5;save();renderBackup()};


/* ---------- Wasser ---------- */
const HQ=[200,250,330,350,500];
const waterSum=()=>day().h.reduce((a,h)=>a+h.ml,0);
function renderWater(){const D=day(),G=S.g.ml,tot=waterSum();
  $("hc").textContent=fmt(tot)+" ml";$("hz").textContent="Ziel "+fmt(G)+" ml";
  $("hbar").style.width=Math.min(100,tot/G*100)+"%";$("hbar").style.background=tot>=G?"var(--ok)":"var(--accent)";
  $("hrest").textContent=tot>=G?"Ziel erreicht! 💧":"Noch "+fmt(G-tot)+" ml bis zum Ziel";
  const q=$("hq");q.innerHTML="";HQ.forEach(m=>{const b=el("button","","＋ "+m+" ml");b.onclick=()=>addWater(m);q.appendChild(b)});
  const L=$("hlist");L.innerHTML="";
  D.h.slice().reverse().forEach(h=>{const r=el("div","row",'<div class="t">'+fmt(h.ml)+' ml'+(h.t?' <span class="sm">· '+esc(h.t)+' Uhr</span>':'')+'</div><button class="ic" aria-label="Löschen">✕</button>');
    r.querySelector("button").onclick=()=>undoDel(D.h,D.h.indexOf(h),"Wasser",renderWater);L.appendChild(r)})}
function addWater(m){const before=waterSum();day().h.push({ml:Math.round(m),t:new Date().toTimeString().slice(0,5)});save();renderWater();
  toast(before<S.g.ml&&waterSum()>=S.g.ml?"Wasserziel erreicht 💧":"+"+fmt(m)+" ml")}
$("hi").oninput=()=>$("herr").textContent="";
$("hadd").onclick=()=>{const m=num($("hi").value);if(!(m>0&&m<=5000)){$("herr").textContent="Gib eine Menge in ml ein (z. B. 300).";return}addWater(m);$("hi").value=""};
$("hi").onkeydown=e=>{if(e.key==="Enter")$("hadd").click()};
