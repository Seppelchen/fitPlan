// FitPlan – Meine Geräte abgleichen (gleicher Name) und Essen der Familie zur Auswahl
/* ---------- Gleicher Name = dieselbe Person ----------
   Wer sich auf mehreren Geräten mit demselben Namen verbindet, hat dort dieselben Daten: Essen, Wasser,
   Sport, Gewicht, Maße, Wochenplan, Rezepte, Favoriten, Produkte und Ziele. Jede Person hat in Firebase
   eigene Dokumente lists/<Code>/u/<Person>_<Teil> (a = Rezepte & Einstellungen, b = Produkte,
   w = Gewicht, Maße, Plan, d2026 … = Essen, Wasser & Sport je Jahr). Jeder Eintrag (ein Tag, ein Rezept …)
   ist ein Feld. Es gilt die letzte Änderung – ändern zwei Geräte gleichzeitig denselben Tag, werden die
   Einträge zusammengeführt. Die Änderungsmarke pv.<Person>_<Teil> im Hauptdokument sagt den anderen
   Geräten, welchen Teil sie neu laden müssen. */
let myErr="",myErrT=0,myCache=null,katCache=null,katErr="",katErrT=0,syKickT=null,myAt=0;
const h2=t=>syHash(t)+"x"+syHash("~"+t);
const myPid=s=>{const n=nrm(s&&s.name);return n?"u"+h2(n):""};
const myOn=()=>{const s=SY();return!!s&&s.ps!==false&&!!myPid(s)};
const emptyObj=o=>!o||typeof o!=="object"||!Object.values(o).some(v=>v!=null&&v!=="");
const dayEmpty=D=>!D||!(D.f||[]).length&&!(D.s||[]).length&&!(D.h||[]).length&&!Object.values(D.x||{}).some(Boolean);
// Was abgeglichen wird: m = Sammlung nach Schlüssel (Datum, Barcode), a = Liste (Schlüssel = Name), one = ein Objekt
const MYC={
  d:{m:()=>S.d,b:k=>"d"+k.slice(0,4),skip:dayEmpty},
  w:{m:()=>S.w,b:()=>"w"},
  m:{m:()=>S.m,b:()=>"w",skip:emptyObj},
  pl:{m:()=>S.pl,b:()=>"w",skip:emptyObj},
  bc:{m:()=>S.bc,b:()=>"b"},
  R:{a:()=>S.R,b:()=>"a"},
  fav:{a:()=>S.fav,b:()=>"a"},
  A:{a:()=>S.A,b:()=>"a"},
  E:{a:()=>S.E,b:()=>"a"},
  g:{one:()=>S.g,b:()=>"a"}};
const myId=(c,k)=>"e"+h2(c+"|"+k);
// Stand dieses Geräts: {id:{c,k,h}} (h = Prüfsumme des Eintrags) – neu berechnet nur nach save()
function myLocal(){if(myCache&&myCache.r===saveRev)return myCache.L;const L={};
  const put=(c,k,v)=>{L[myId(c,k)]={c,k,h:h2(JSON.stringify(v))}};
  Object.entries(MYC).forEach(([c,o])=>{
    if(o.m)Object.entries(o.m()||{}).forEach(([k,v])=>{if(v!=null&&!(o.skip&&o.skip(v)))put(c,k,v)});
    else if(o.a)(o.a()||[]).forEach(v=>{if(v&&v.n)put(c,nrm(v.n),v)});
    else put(c,"",o.one())});
  myCache={r:saveRev,L};return L}
function myVal(c,k){const o=MYC[c];if(o.m)return o.m()[k];if(o.one)return o.one();let v=null;o.a().forEach(x=>{if(x&&nrm(x.n)===k)v=x});return v}
const dayFix=D=>{D=D&&typeof D==="object"?D:{};["f","s","h"].forEach(c=>{if(!Array.isArray(D[c]))D[c]=[]});if(!D.x||typeof D.x!=="object")D.x={};return D};
// Rezept hat auf dem anderen Gerät eine andere ID (z. B. Standardrezepte) → Plan und Einträge umstellen
function reId(a,b){if(!a||a===b)return;Object.values(S.pl).forEach(P=>{if(P)CATS.forEach(c=>{if(P[c]===a)P[c]=b})});
  Object.values(S.d).forEach(D=>(D.f||[]).forEach(f=>{if(f.rid===a)f.rid=b}))}
function mySet(c,k,v){const o=MYC[c];
  if(o.m){const M=o.m();if(v==null)delete M[k];else M[k]=c==="d"?dayFix(v):v;return}
  if(o.one){if(v&&typeof v==="object")Object.assign(o.one(),v);return}
  const A=o.a();let i=-1;A.forEach((x,j)=>{if(x&&nrm(x.n)===k)i=j});
  if(v==null){if(i>=0)A.splice(i,1);return}
  if(c==="R"){if(i<0)i=A.findIndex(x=>x&&x.id===v.id);else reId(A[i].id,v.id)}  // gleiche ID, anderer Name = umbenannt
  if(i>=0)A[i]=v;else A.push(v)}
// Gleicher Tag auf zwei Geräten geändert: alle Einträge behalten
function mergeDay(a,b){a=dayFix({...a});b=dayFix({...b});const u=(x,y)=>{const s=new Set(x.map(e=>JSON.stringify(e)));return x.concat(y.filter(e=>!s.has(JSON.stringify(e))))};
  const x={...b.x};Object.entries(a.x).forEach(([n,v])=>{x[n]=Math.max(+v||0,+x[n]||0)});
  return{...b,...a,f:u(b.f,a.f),s:u(b.s,a.s),h:u(b.h,a.h),x}}
const shH=(sh,id)=>sh[id]?sh[id][0]:"x";
function myDirty(){const s=SY();if(!myOn())return false;if(s.pj!==myPid(s))return true;const L=myLocal(),sh=s.psh||{};
  for(const id in L)if(L[id].h!==shH(sh,id))return true;for(const id in sh)if(!L[id]&&sh[id][0]!=="x")return true;return false}
const myRules="Deine Daten werden noch nicht zwischen deinen Geräten abgeglichen: In Firebase müssen die Firestore-Regeln aktualisiert werden (siehe Anleitung). Auf diesem Gerät ist alles gespeichert.";
// Teil von sySync: pv = Änderungsmarken aus dem Hauptdokument
async function syMine(s,pv){const pid=myPid(s);if(!pid||s.ps===false||myErr&&Date.now()-myErrT<6e4)return;
  if(s.pj!==pid){s.pj=pid;s.psh={};s.pm={};s.pi=1}  // neue Person (oder neuer Name): erst zusammenführen
  const sh=s.psh,pm=s.pm,pre=pid+"_";let ch=false;
  try{
    // 1. Laden, was die anderen Geräte dieser Person geändert haben
    const bs=Object.keys(pv).filter(f=>f.indexOf(pre)===0&&pv[f]!==pm[f.slice(pre.length)]).map(f=>f.slice(pre.length));
    for(const b of bs){const d=await syCall(s,"GET","",null,"/u/"+pre+b);if(SY()!==s)return;const L0=myLocal();
      const F=d.fields&&d.fields.e&&d.fields.e.mapValue&&d.fields.e.mapValue.fields||{};
      Object.entries(F).forEach(([id,x])=>{let a;try{a=JSON.parse(x.stringValue)}catch(e){return}
        if(!Array.isArray(a)||!MYC[a[0]]||typeof a[1]!=="string")return;const [c,k,v]=a,rh=v==null?"x":h2(JSON.stringify(v)),old=shH(sh,id);
        if(rh===old)return;const loc=L0[id],dirty=(loc?loc.h:"x")!==old;sh[id]=[rh,c,k];
        if((loc?loc.h:"x")===rh)return;
        if(v==null){if(!loc)return;if(s.pi?!["R","A","E"].includes(c):dirty)return;mySet(c,k,null);ch=true;return}  // gelöscht
        if(loc&&dirty&&!s.pi){if(c==="d"){mySet(c,k,mergeDay(S.d[k],v));ch=true}return}  // gleichzeitig geändert: dieses Gerät gilt, Tage zusammengeführt
        if(loc&&s.pi&&c==="d"){mySet(c,k,mergeDay(S.d[k],v));ch=true;return}
        mySet(c,k,v);ch=true});
      pm[b]=pv[pre+b]}
    s.pi=0;if(ch){save();all()}else if(bs.length)save();
    // 2. Eigene Änderungen hochladen (je Teil in Paketen), danach die Änderungsmarken setzen
    const L=myLocal(),by={};
    new Set([...Object.keys(L),...Object.keys(sh)]).forEach(id=>{const h=L[id]?L[id].h:"x";if(h===shH(sh,id))return;
      const c=L[id]?L[id].c:sh[id][1],k=L[id]?L[id].k:sh[id][2],v=L[id]?myVal(c,k):null;
      (by[MYC[c].b(k)]=by[MYC[c].b(k)]||[]).push({id,c,k,h,j:JSON.stringify([c,k,v==null?null:v])})});
    const bl=Object.keys(by);if(!bl.length){myOk();return}
    for(const b of bl)for(let i=0;i<by[b].length;i+=150){const part=by[b].slice(i,i+150),fields={};part.forEach(o=>fields[o.id]={stringValue:o.j});
      await syCall(s,"PATCH","?"+part.map(o=>"updateMask.fieldPaths="+encodeURIComponent("e."+o.id)).join("&"),{fields:{e:{mapValue:{fields}}}},"/u/"+pre+b)}
    const M={};bl.forEach(b=>M[pre+b]={stringValue:syRnd(8)});
    await syCall(s,"PATCH","?"+bl.map(b=>"updateMask.fieldPaths="+encodeURIComponent("pv."+pre+b)).join("&"),{fields:{pv:{mapValue:{fields:M}}}});
    bl.forEach(b=>by[b].forEach(o=>sh[o.id]=[o.h,o.c,o.k]));myAt=Date.now();save();myOk()}
  catch(e){if(e.off)throw e;myErrT=Date.now();const n=e.st===403?myRules:syMsg(e);if(n!==myErr){myErr=n;let last="";try{last=localStorage.getItem(KEY+".myerr")||""}catch(x){}
      if(e.st===403&&last!==todayK()){try{localStorage.setItem(KEY+".myerr",todayK())}catch(x){}toast("⚠️ Abgleich deiner Geräte: Firebase-Regeln aktualisieren (Anleitung)")}}myShow()}}  // höchstens einmal am Tag
function myOk(){if(myErr){myErr="";myShow()}}
function myShow(){const e=$("symy");if(e)e.textContent=myErr}

/* ---------- Essen der Familie zur Auswahl ----------
   Jedes Gerät legt seine eigenen Rezepte, was in den letzten 4 Monaten gegessen wurde, Favoriten und
   gescannte Produkte in lists/<Code>/u/kat ab (Feld e, Schlüssel = Art + Name). Alle verbundenen Geräte
   finden diese Essen dann beim Eintragen: bei den Rezepten, in der Lebensmittel-Suche, im freien Eintrag
   und bei der Auswahl im Wochenplan. Abgeholt wird nur, wenn sich die Marke pv.kat geändert hat. */
const katOn=()=>{const s=SY();return!!s&&s.ks!==false};
const katId=(y,k)=>"k"+h2(y+"|"+k);
const foodOf=f=>({n:f.n,k1:Math.round((+f.k1||0)*10)/10,p1:Math.round((+f.p1||0)*10)/10,kh1:f.kh1??null,fe1:f.fe1??null,bs1:f.bs1??null,ic:icOf(f)});
function katLocal(){if(katCache&&katCache.r===saveRev)return katCache.L;const L={},old=addDays(todayK(),-120);
  const put=(y,k,v)=>{L[katId(y,k)]={y,v,h:h2(JSON.stringify(v))}},rn=new Set(S.R.map(r=>nrm(r.n)));
  S.R.forEach(r=>{if(r&&r.n&&!STDN.has(r.n.toLowerCase()))put("r",nrm(r.n),rzPack(r))});
  const food=f=>{if(f&&f.n&&f.k1!=null&&!rn.has(nrm(f.n))&&!f.rid)put("f",nrm(f.n),foodOf(f))};
  Object.keys(S.d).filter(k=>k>=old).sort().forEach(k=>(S.d[k].f||[]).forEach(food));S.fav.forEach(food);
  Object.entries(S.bc).forEach(([c,o])=>{if(o&&o.n&&o.k!=null){const p={...o,c};delete p.lastA;put("p",c,p)}});
  katCache={r:saveRev,L};return L}
function katDirty(){const s=SY();if(!katOn())return false;const L=katLocal(),kh=s.kh||{};for(const id in L)if(L[id].h!==kh[id])return true;return false}
async function syKat(s,pv){if(s.ks===false||katErr&&Date.now()-katErrT<6e4)return;s.kh=s.kh||{};
  try{const m=pv.kat||"";
    if(m&&m!==s.km){const d=await syCall(s,"GET","",null,"/u/kat");if(SY()!==s)return;const F=d.fields&&d.fields.e&&d.fields.e.mapValue&&d.fields.e.mapValue.fields||{},K={};
      Object.entries(F).forEach(([id,x])=>{try{const o=JSON.parse(x.stringValue);if(o&&typeof o==="object"&&o.n&&"rfp".includes(o.y))K[id]=o}catch(e){}});
      const ch=JSON.stringify(K)!==JSON.stringify(s.kat||{});s.kat=K;s.km=m;save();if(ch){if(view==="essen")renderFood();if($("fres"))$("fq").oninput()}}
    const L=katLocal(),up=Object.entries(L).filter(([id,o])=>o.h!==s.kh[id]);if(!up.length){katOk();return}
    const n=Object.keys(s.kat||{}).length,t=Date.now(),list=up.filter(([id])=>(s.kat||{})[id]||n<2500).slice(0,200),fields={};
    list.forEach(([id,o],i)=>fields[id]={stringValue:JSON.stringify({...o.v,y:o.y,b:s.name||"",dv:S.dev,ts:t+i})});
    if(list.length){await syCall(s,"PATCH","?"+list.map(([id])=>"updateMask.fieldPaths="+encodeURIComponent("e."+id)).join("&"),{fields:{e:{mapValue:{fields}}}},"/u/kat");
      await syCall(s,"PATCH","?updateMask.fieldPaths=pv.kat",{fields:{pv:{mapValue:{fields:{kat:{stringValue:syRnd(8)}}}}}})}
    up.forEach(([id,o])=>s.kh[id]=o.h);save();katOk()}
  catch(e){if(e.off)throw e;katErrT=Date.now();katErr=e.st===403?"Die Essen werden noch nicht mit der Familie geteilt: In Firebase müssen die Firestore-Regeln aktualisiert werden (siehe Anleitung).":syMsg(e);myShow2()}}
function katOk(){if(katErr){katErr="";myShow2()}}
function myShow2(){const e=$("sykat");if(e)e.textContent=katErr}
// Aus der gemeinsamen Auswahl: who = Name der Person ("" = du selbst, auch auf deinem anderen Gerät)
function katItems(y){const s=SY();if(!s||s.ks===false||!s.kat)return[];const me=nrm(s.name);
  return Object.entries(s.kat).filter(([,x])=>x&&x.y===y).map(([id,x])=>({x,id,who:x.dv===S.dev||me&&nrm(x.b)===me?"":x.b||"der Familie"}))}
// Rezepte der anderen, die hier (noch) nicht unter den Rezepten stehen
function katRecipes(){const own=new Set(S.R.map(r=>nrm(r.n)));
  return katItems("r").filter(o=>!own.has(nrm(o.x.n))).map(o=>{const r=rzSan(o.x);if(!CATS.includes(r.c))r.c="Mittag";return{r,id:o.id,who:o.who}}).sort((a,b)=>a.r.n.localeCompare(b.r.n,"de"))}
const katRecipeBy=n=>{const l=nrm(n);return katRecipes().find(o=>nrm(o.r.n)===l)||null};
// Alle bekannten Einzel-Essen: eigene (Favoriten, zuletzt gegessen) und die der Familie, je Name einmal
function knownFoods(){const out=[],seen=new Set(),rn=new Set(S.R.map(r=>nrm(r.n))),add=(f,who,id)=>{const l=nrm(f.n);if(!l||seen.has(l)||rn.has(l)||f.k1==null)return;seen.add(l);out.push({...foodOf(f),who,id})};
  S.fav.forEach(f=>add(f,""));Object.keys(S.d).sort().reverse().forEach(k=>{const fs=S.d[k].f||[];for(let j=fs.length-1;j>=0;j--)if(!fs[j].rid)add(fs[j],"")});
  katItems("f").sort((a,b)=>(b.x.ts||0)-(a.x.ts||0)).forEach(o=>add(o.x,o.who,o.id));return out}
const katProducts=()=>katItems("p").filter(o=>o.x.c&&!S.bc[o.x.c]).map(o=>{const p={...o.x};["y","b","dv","ts","c"].forEach(f=>delete p[f]);return{c:o.x.c,o:p,who:o.who,id:o.id}});
// Eintrag für alle aus der Auswahl nehmen
function katRemove(id,label){const s=SY();if(!s||!s.kat||!s.kat[id])return;const old=s.kat[id];delete s.kat[id];save();
  syCall(s,"PATCH","?updateMask.fieldPaths="+encodeURIComponent("e."+id),{fields:{e:{mapValue:{fields:{[id]:{stringValue:"null"}}}}}},"/u/kat")
    .then(()=>syCall(s,"PATCH","?updateMask.fieldPaths=pv.kat",{fields:{pv:{mapValue:{fields:{kat:{stringValue:syRnd(8)}}}}}}))
    .then(()=>toast("„"+label+"“ steht nicht mehr zur Auswahl"),e=>{s.kat[id]=old;save();renderFood();toast(syMsg(e))})}

// Rezept aus der gemeinsamen Auswahl ansehen, eintragen, einplanen oder übernehmen. ctx = {k,c} aus dem Wochenplan
function extRecipe(o,ctx){const r=o.r,st=steps(r.s),when=ctx?wd(ctx.k)+" "+dd(ctx.k):"";
  openSheet(esc(r.ic)+" "+esc(r.n),
  (ctx?'<button id="erBk" style="margin:0 0 10px;font-size:14px;padding:5px 12px">‹ Zurück zur Auswahl</button>':'')+
  '<p class="sm" style="margin:0 0 10px;padding:8px 10px;border-radius:10px;background:var(--accbg);color:var(--text)">👥 '+(o.who?'Rezept von '+esc(o.who):'Dein Rezept von einem anderen Gerät')+'</p>'+
  '<p class="sm" style="margin:0 0 10px">'+mline(r.k,r.p,r.kh,r.fe)+' pro Portion'+(r.t?' · ⏱ '+esc(r.t):'')+'</p>'+
  (r.z.length?'<p class="lb">Zutaten'+(r.pz>1?' (für '+fq(r.pz)+' Portionen)':' (1 Portion)')+'</p><ul class="z">'+r.z.map(z=>'<li>'+esc(z)+'</li>').join("")+'</ul>':'<p class="sm">Keine Zutatenliste hinterlegt.</p>')+
  '<p class="lb" style="margin-top:12px">Zubereitung</p>'+(st.length?'<ol class="st">'+st.map(x=>'<li>'+esc(x)+'</li>').join("")+'</ol>':'<p class="sm">Keine Zubereitung hinterlegt.</p>')+
  (ctx?'<button class="full pri" id="erPl" style="margin-top:16px">📅 Für '+when+' · '+esc(ctx.c)+' einplanen</button>':
  '<p class="lb" style="margin-top:16px">Eintragen</p><div class="chips" id="erq"></div>'+mealSel("erM",guessMeal())+
  '<button class="full pri" id="erAdd" style="margin-top:8px"></button>'+
  '<p class="lb" style="margin-top:16px">Einplanen</p><div class="g2"><div><input type="date" id="erD"></div><div>'+mealSel("erC",r.c)+'</div></div>'+
  '<button class="full" id="erPl" style="margin-top:8px">📅 Einplanen</button>')+
  '<button class="full" id="erSv" style="margin-top:8px">＋ In meine Rezepte übernehmen</button>'+
  '<button class="full del" id="erRm" style="margin-top:8px">Für alle aus der Auswahl nehmen</button>',
  ()=>{const take=c=>takeRecipe(r,c);
    $("erSv").onclick=()=>{take(r.c);closeSheet();renderFood();toast("„"+r.n+"“ ist jetzt in deinen Rezepten")};
    $("erRm").onclick=()=>{if(!confirm("„"+r.n+"“ bei allen aus der Auswahl nehmen? Wer es schon übernommen hat, behält es."))return;closeSheet();katRemove(o.id,r.n);renderFood()};
    if(ctx){$("erBk").onclick=()=>pickRecipe(ctx.k,ctx.c);$("erPl").onclick=()=>{const id=take(ctx.c).id;closeSheet();planSet(ctx.k,ctx.c,id);toast("Eingeplant · "+when)};return}
    let q=1;const sh=()=>{qChips("erq",q,v=>{q=v;sh()});$("erAdd").textContent="＋ Eintragen · "+fq(q)+(q<=1?" Portion":" Portionen")+" · "+fmt(r.k*q)+" kcal"};sh();
    $("erAdd").onclick=()=>{closeSheet();logFood(mkEntry(r.n,r.k,r.p,$("erM").value,q,r))};
    $("erD").value=dt.value||todayK();
    $("erPl").onclick=()=>{const k=$("erD").value,c=$("erC").value;if(!k)return;const cur=rById((S.pl[k]||{})[c]);
      if(cur&&!confirm("Am "+dd(k)+" ist bei "+c+" schon „"+cur.n+"“ geplant. Ersetzen?"))return;planSet(k,c,take(c).id);closeSheet();toast("Eingeplant · "+wd(k)+" "+dd(k)+" · "+c)}})}
// Einzel-Essen (pro Portion) eintragen – oder bei pickCb als Zutat ans Rezept geben
function foodSheet(o,back){const pk=!!pickCb;let q=1;
  openSheet(pk?"Zutat":"Eintragen",(back?'<button id="fsBk" style="margin:0 0 10px;font-size:14px;padding:5px 12px">‹ Zurück zur Suche</button>':'')+
  '<div style="display:flex;gap:10px;align-items:center"><span class="fi">'+esc(o.ic||icOf(o))+'</span><b>'+esc(o.n)+'</b></div>'+
  '<p class="sm" style="margin:2px 0 4px">1 Portion: '+mline(o.k1,o.p1,o.kh1,o.fe1)+(o.who?' · eingetragen von '+esc(o.who):'')+'</p>'+
  '<p class="lb">Portion</p><div class="chips" id="fsq"></div>'+(pk?'':'<label class="f">Mahlzeit</label>'+mealSel("fsm",guessMeal()))+
  '<button class="full pri" id="fsok" style="margin-top:12px"></button>'+(o.id&&o.who?'<button class="full del" id="fsrm" style="margin-top:8px">Für alle aus der Auswahl nehmen</button>':''),
  ()=>{const sh=()=>{qChips("fsq",q,v=>{q=v;sh()});$("fsok").textContent=(pk?"＋ Zum Rezept hinzufügen · ":"＋ Eintragen · ")+fmt(o.k1*q)+" kcal"};sh();
    if(back)$("fsBk").onclick=back;
    if($("fsrm"))$("fsrm").onclick=()=>{if(!confirm("„"+o.n+"“ bei allen aus der Auswahl nehmen?"))return;closeSheet();katRemove(o.id,o.n)};
    $("fsok").onclick=()=>{const r1=x=>x==null?null:Math.round(x*q*10)/10;
      if(pk){const cb=pickCb;closeSheet();cb({n:o.n,a:q,u:"Portion",z:(q===1?"":fq(q)+" × ")+o.n,k:r1(o.k1),p:r1(o.p1),kh:r1(o.kh1),fe:r1(o.fe1),bs:r1(o.bs1)});return}
      const m=$("fsm").value;closeSheet();logFood(mkEntry(o.n,o.k1,o.p1,m,q,per1(o)))}})}

// Freier Eintrag: bekannte Essen als Vorschlag, beim Treffer Kalorien und Nährwerte vorausfüllen
(()=>{const qn=$("qn"),dl=el("datalist");dl.id="qnl";document.body.appendChild(dl);qn.setAttribute("list","qnl");qn.setAttribute("autocomplete","off");let auto=false;
  qn.addEventListener("focus",()=>{dl.innerHTML=knownFoods().slice(0,300).map(f=>'<option value="'+esc(f.n)+'">'+fmt(f.k1)+' kcal'+(f.who?' · von '+esc(f.who):'')+'</option>').join("")});
  qn.addEventListener("input",()=>{const l=nrm(qn.value),f=l&&knownFoods().find(x=>nrm(x.n)===l);
    if(f){if(!$("qk").value||auto){const v=x=>x==null?"":String(Math.round(x));$("qk").value=v(f.k1);$("qp").value=v(f.p1);$("qkh").value=v(f.kh1);$("qfe").value=v(f.fe1);auto=true}}
    else if(auto){$("qk").value=$("qp").value=$("qkh").value=$("qfe").value="";auto=false}});
  ["qk","qp","qkh","qfe"].forEach(i=>$(i).addEventListener("input",()=>{auto=false}));
  $("qadd").addEventListener("click",()=>{auto=false},true)})();

// Nach jeder Speicherung: geänderte eigene Daten bald hochladen (nicht bei jeder Kleinigkeit sofort)
function syKick(){if(!SY())return;clearTimeout(syKickT);syKickT=setTimeout(()=>{if(syBusy){syKick();return}if(myDirty()||katDirty())sySync()},2500)}
