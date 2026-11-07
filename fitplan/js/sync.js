// FitPlan – Teilen über Firebase: gemeinsame Einkaufsliste, Essensplan, Einladung, Verbindung
/* ---------- Gemeinsame Einkaufsliste (Firebase) ----------
   Zwei Handys teilen eine Liste: ein Firestore-Dokument lists/<Code>, jeder Eintrag ein Feld in „items“.
   Ohne Firebase-Bibliothek: REST-Aufrufe mit anonymer Anmeldung. Änderungen gehen sofort raus (offline in
   einer Warteschlange), abgeholt wird alle 5 s, solange der Plan-Tab offen ist. Nur die gemeinsame Liste
   verlässt das Handy – alles andere bleibt lokal. */
const SY=()=>S.sy&&S.sy.code?S.sy:null;
let syTok=null,syTokT=0,syBusy=false,syErr="",syTimer=null,syPlT=0,syPlErr="",syPlErrT=0,pExp=false;
const syRnd=n=>{const a="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";return Array.from(crypto.getRandomValues(new Uint8Array(n)),x=>a[x%32]).join("")};
const syHash=t=>{let h=2166136261;for(const c of t){h^=c.codePointAt(0);h=Math.imul(h,16777619)>>>0}return h.toString(36)};
const fsV=v=>typeof v==="boolean"?{booleanValue:v}:typeof v==="number"?{integerValue:String(Math.round(v))}:{stringValue:String(v)};
const fsMap=o=>({mapValue:{fields:Object.fromEntries(Object.entries(o).filter(([,v])=>v!=null).map(([k,v])=>[k,fsV(v)]))}});
const fsGet=f=>{const o={};Object.entries(f||{}).forEach(([k,v])=>{o[k]="booleanValue" in v?v.booleanValue:"integerValue" in v?+v.integerValue:"doubleValue" in v?v.doubleValue:v.stringValue});return o};
async function syFetch(url,opt){let r;try{r=await fetch(url,opt)}catch(e){const x=new Error("offline");x.off=1;throw x}
  const t=await r.text();let j={};try{j=t?JSON.parse(t):{}}catch(e){}
  if(!r.ok){const er=j.error||{},x=new Error(String(er.message||er.status||"HTTP "+r.status));x.st=r.status;throw x}return j}
async function syToken(s,force){if(!force&&syTok&&Date.now()<syTokT)return syTok;const k=encodeURIComponent(s.k);
  if(s.rt){try{const r=await syFetch("https://securetoken.googleapis.com/v1/token?key="+k,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:"grant_type=refresh_token&refresh_token="+encodeURIComponent(s.rt)});
      syTok=r.id_token;s.rt=r.refresh_token||s.rt;syTokT=Date.now()+((+r.expires_in||3600)-300)*1e3;return syTok}
    catch(e){if(e.off||e.st>=500)throw e;s.rt=null}}  // abgelaufene Anmeldung → neu anmelden
  const r=await syFetch("https://identitytoolkit.googleapis.com/v1/accounts:signUp?key="+k,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({returnSecureToken:true})});
  syTok=r.idToken;s.rt=r.refreshToken;syTokT=Date.now()+((+r.expiresIn||3600)-300)*1e3;if(SY()===s)save();return syTok}
async function syCall(s,method,qs,body){const url="https://firestore.googleapis.com/v1/projects/"+encodeURIComponent(s.p)+"/databases/(default)/documents/lists/"+s.code+(qs||"");
  for(let i=0;;i++){const tok=await syToken(s,i>0);
    try{return await syFetch(url,{method,headers:Object.assign({Authorization:"Bearer "+tok},body?{"Content-Type":"application/json"}:{}),body:body?JSON.stringify(body):undefined})}
    catch(e){if(e.st===401&&!i)continue;if(e.st===404&&method==="GET"&&!/does not exist/i.test(e.message))return{};throw e}}}
function syMsg(e){const m=e.message||"";
  if(e.off)return"Kein Internet – Änderungen werden später übertragen.";
  if(/OPERATION_NOT_ALLOWED|ADMIN_ONLY/.test(m))return"In Firebase ist die anonyme Anmeldung nicht eingeschaltet (Authentication → Anmeldemethode → Anonym).";
  if(/API.?key|API_KEY/i.test(m))return"Der apiKey wird nicht akzeptiert. Prüfe die Firebase-Konfiguration.";
  if(/does not exist|has not been used|disabled/i.test(m))return"Die Firestore-Datenbank fehlt noch (Firebase → Firestore Database → Datenbank erstellen).";
  if(e.st===403||/PERMISSION_DENIED|permission/i.test(m))return"Zugriff verweigert – prüfe die Firestore-Regeln aus der Anleitung.";
  return"Abgleich fehlgeschlagen: "+m}
// Änderung an einem Eintrag: {id,v} setzt/löscht ihn ganz, {id,f,v} ändert nur ein Feld (z. B. den Haken)
// col = cal/bd/rz: Kalender, Geburtstage, Rezepte (ganzer Eintrag als JSON-Text), sonst Einkaufsliste
function syApply(it,o){if(o.f){if(it[o.id])it[o.id][o.f]=o.v}else if(o.v)it[o.id]={...o.v};else delete it[o.id]}
function syOpN(L){const s=SY();if(!s||!L.length)return;L.forEach(o=>{o={...o,v:o.v&&typeof o.v==="object"?{...o.v}:o.v};s.q.push(o);syApply(o.col?famTgt(s,o.col):s.it,o)});save();clearTimeout(syOp.h);syOp.h=setTimeout(sySync,150)}
function syOp(o){syOpN([o])}
function syBody(ops){const W={};
  ops.forEach(o=>{const key=(o.col||"items")+"."+o.id,w=W[key];if(o.f){if(w&&!w.f){if(w.v)w.v[o.f]=o.v}else W[key]={id:o.id,f:o.f,v:o.v}}else W[key]={col:o.col,id:o.id,v:o.v&&{...o.v}}});
  const F={},L=Object.values(W),fields={};
  L.forEach(o=>{const G=F[o.col||"items"]=F[o.col||"items"]||{};if(o.f)G[o.id]={mapValue:{fields:{[o.f]:fsV(o.v)}}};else if(o.v)G[o.id]=o.col?{mapValue:{fields:{j:{stringValue:JSON.stringify(o.v)}}}}:fsMap(o.v)});
  Object.entries(F).forEach(([c,G])=>fields[c]={mapValue:{fields:G}});
  const paths=L.map(o=>(o.col||"items")+"."+o.id+(o.f?"."+o.f:""));
  if(L.some(o=>o.col)){fields.fv={stringValue:syRnd(8)};paths.push("fv")}  // Änderungsmarke: andere Handys laden Kalender & Co. dann neu
  return{qs:"?"+paths.map(x=>"updateMask.fieldPaths="+encodeURIComponent(x)).join("&"),body:{fields}}}
async function sySync(){const s=SY();if(!s||syBusy)return;syBusy=true;
  try{syAutoPlan();for(;;){const b=s.q.filter(o=>!o.col).slice(0,80);if(!b.length)break;const x=syBody(b);await syCall(s,"PATCH",x.qs,x.body);s.q=s.q.filter(o=>!b.includes(o));if(SY()===s)save()}
    await syPushFam(s);
    await syPubPlan(s);
    const d=await syCall(s,"GET","?mask.fieldPaths=items&mask.fieldPaths=fv");if(SY()!==s)return;
    const f=d.fields&&d.fields.items&&d.fields.items.mapValue&&d.fields.items.mapValue.fields||{},it={};
    Object.entries(f).forEach(([id,v])=>{const x=fsGet(v.mapValue&&v.mapValue.fields);if(x.n)it[id]=x});
    s.q.forEach(o=>{if(!o.col)syApply(it,o)});  // während des Abrufs Geändertes nicht überschreiben
    const ch=JSON.stringify(it)!==JSON.stringify(s.it);s.it=it;s.at=Date.now();syErr="";save();if(ch)renderShop();
    // Kalender, Geburtstage, Rezepte nur neu laden, wenn sich die Änderungsmarke geändert hat
    const fv=d.fields&&d.fields.fv&&d.fields.fv.stringValue||"";
    if(fv!==(s.fv||"")){const g=await syCall(s,"GET","?"+FAMC.map(c=>"mask.fieldPaths="+c).join("&"));if(SY()!==s)return;const c2=syReadFam(g,s);s.fv=fv;save();if(c2)renderFam()}
    if(Date.now()-syPlT>6e4){syPlT=Date.now();const p=await syCall(s,"GET","?mask.fieldPaths=plans");if(SY()!==s)return;
      const pls=syReadPlans(p,s.me);if(JSON.stringify(pls)!==JSON.stringify(s.pls||{})){s.pls=pls;save();renderPartner()}}}
  catch(e){syErr=syMsg(e)}finally{syBusy=false;syStat()}}
function syStat(){const s=SY();if(!s)return;const pend=s.q.length;
  const t=syErr?"⚠️ "+(/^Kein Internet/.test(syErr)?"offline":"Fehler"):pend?"wird übertragen …":s.at?"✓ "+(Date.now()-s.at<6e4?"aktuell":"Stand "+new Date(s.at).toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit"})):"";
  [$("syst"),$("smst"),$("fmst")].forEach(e=>{if(e){e.textContent=e.id==="smst"&&t?"👥 "+t:e.id==="fmst"&&t?"· "+t:t;e.title=syErr;e.style.color=syErr?"var(--warn)":""}});const m=$("syerr");if(m)m.textContent=syErr}
function syLoop(){clearTimeout(syTimer);if(!SY())return;const act=document.visibilityState==="visible"&&(view==="plan"||view==="fam"||sheetOpen()||shopOn);
  if(act)sySync();syTimer=setTimeout(syLoop,act?5000:20000)}
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")syLoop();else if(SY()&&SY().q.length)sySync()});
window.addEventListener("online",syLoop);
// Sichtbare Einträge (x = ausgeblendete Plan-Zutat) und Löschen: Plan-Zutaten werden nur ausgeblendet,
// sonst kämen sie beim nächsten Abgleich gleich wieder. Sie erscheinen erst wieder, wenn sich ihre Menge ändert.
const syVis=s=>Object.entries(s.it).filter(([,x])=>!x.x).map(([id,x])=>({id,...x}));
const syAuto=()=>{const s=SY();return!!s&&s.ap!==false};
const syDel=x=>x.p?syOp({id:x.id,f:"x",v:true}):syOp({id:x.id,v:null});
// Automatik: Zutaten des gewählten Zeitraums ↔ eigene Plan-Einträge der gemeinsamen Liste (nur bei Änderungen schreiben)
// Nur bei sichtbarem Plan (bzw. Einkaufsmodus): es gilt der dort gezeigte Zeitraum
function syAutoPlan(){const s=SY();if(!s||s.ap===false||view!=="plan"&&!shopOn)return;const want={},t=Date.now();let i=0;
  shopItems(true).forEach(o=>{want["p"+syHash(s.me+"|"+o.key)]={n:o.a==null?o.n:shopLabel(o),w:o.a==null}});
  Object.entries(want).forEach(([id,w])=>{const cur=s.it[id];if(cur&&cur.n===w.n)return;
    const v={n:w.n,c:false,b:s.name||"",d:s.me,p:true,t:t+i++};if(w.w)v.w=true;syOp({id,v})});
  Object.entries(s.it).forEach(([id,x])=>{if(x.p&&x.d===s.me&&!want[id])syOp({id,v:null})})}
// Offene Plan-Zutaten in die gemeinsame Liste – gleiche Zutat aus demselben Plan wird aktualisiert statt verdoppelt
function syPushPlan(E){const s=SY(),wk=ekK(),its=visItems(E).filter(o=>!E.c[o.key]);if(!s||!its.length)return;const ids=[],t=Date.now();
  its.forEach((o,i)=>{const id="p"+syHash(s.me+"|"+o.key);ids.push([id,o.key]);syOp({id,v:{n:shopLabel(o),c:false,b:s.name,d:s.me,p:true,t:t+i}});E.sh[o.key]=o.a??0});
  S.ek[wk]=E;save();renderShop();
  toast(its.length+(its.length===1?" Zutat":" Zutaten")+" geteilt",()=>{if(SY()!==s)return;ids.forEach(([id,k])=>{syOp({id,v:null});delete E.sh[k]});save();renderShop()})}
// FamilyWall-Artikel in die gemeinsame Liste: gleiche Artikel (Name) von beiden Handys ergeben einen Eintrag.
// rep = bisherige FamilyWall-Artikel ersetzen. Gibt eine Rückgängig-Funktion zurück.
const syHasFW=()=>!!SY()&&Object.values(SY().it).some(x=>x.f);
function syFW(items,rep){const s=SY(),old=Object.entries(s.it).filter(([,x])=>x.f).map(([id,x])=>({id,v:{...x}})),ids=new Set(),t=Date.now();
  items.forEach((x,i)=>{const id="f"+syHash(x.n.trim().toLowerCase());if(ids.has(id))return;ids.add(id);
    if(!rep&&s.it[id])return;syOp({id,v:{n:x.n,c:!!x.c,g:x.g||"Sonstiges",f:true,b:s.name,d:s.me,t:t+i}})});
  if(rep)old.forEach(o=>{if(!ids.has(o.id))syOp({id:o.id,v:null})});
  return()=>{if(SY()!==s)return;ids.forEach(id=>syOp({id,v:null}));old.forEach(syOp);renderShop()}}
// Was vor dem Verbinden nur auf diesem Handy stand (eigene Einträge, FamilyWall-Liste), kommt in die gemeinsame Liste
function syMigrate(){const s=SY();if(!s)return;const wk=ekK(),Ek=S.ek[wk];
  if(Ek&&Ek.x.length){Ek.x.forEach((x,i)=>syOp({id:"i"+syRnd(10),v:{n:x.n,c:!!x.c,b:s.name,d:s.me,t:Date.now()+i}}));Ek.x=[]}
  if(S.fw){syFW(S.fw.items,false);S.fw=null}
  // Kalender, Geburtstage und Rezepte von diesem Handy kommen mit in die gemeinsame Liste
  FAMC.forEach(c=>{const M=S.fam[c]||{},T=famTgt(s,c),L=[];Object.entries(M).forEach(([id,v])=>{if(T[id]&&JSON.stringify(T[id])===JSON.stringify(v))return;v={...v};if(v.dv===S.dev&&!v.b)v.b=s.name||"";L.push({col:c,id,v})});syOpN(L);S.fam[c]={}});save()}
/* Essensplan teilen: jedes Handy legt seinen Plan (gestern bis 4 Wochen voraus) samt Rezepten als
   JSON in plans.u<Gerät> ab. Geschrieben wird nur bei Änderungen, abgeholt etwa einmal pro Minute. */
const syPlPath=s=>"?updateMask.fieldPaths="+encodeURIComponent("plans.u"+s.me);
function syPlanJSON(){const t=todayK(),a=addDays(t,-1),b=addDays(t,27),days={},R={};
  Object.keys(S.pl).filter(k=>k>=a&&k<=b).sort().forEach(k=>{const o={};CATS.forEach(c=>{const r=rById(S.pl[k][c]);if(!r)return;o[c]=r.id;
    if(!R[r.id])R[r.id]={n:r.n,c:r.c,ic:icOf(r),k:r.k,p:r.p,kh:r.kh,fe:r.fe,bs:r.bs,t:r.t||"",z:r.z||[],s:r.s||"",pz:r.pz||1}});if(Object.keys(o).length)days[k]=o});
  return JSON.stringify({days,R})}
async function syPubPlan(s){if(syPlErr&&Date.now()-syPlErrT<6e4)return;  // nach Fehler nur jede Minute neu versuchen
  try{if(s.sp===false){if(!s.ph)return;await syCall(s,"PATCH",syPlPath(s),{fields:{}});s.ph=null}
    else{const j=syPlanJSON(),h=syHash((s.name||"")+"|"+j);if(h===s.ph)return;
      await syCall(s,"PATCH",syPlPath(s),{fields:{plans:{mapValue:{fields:{["u"+s.me]:fsMap({b:s.name||"",t:Date.now(),j})}}}}});s.ph=h}
    if(syPlErr){syPlErr="";renderPartner()}save()}
  catch(e){if(e.off)throw e;syPlErrT=Date.now();
    syPlErr=e.st===403?"Dein Essensplan wird noch nicht geteilt: In Firebase müssen die Firestore-Regeln aktualisiert werden (siehe Anleitung).":syMsg(e);renderPartner()}}
function syReadPlans(d,me){const f=d.fields&&d.fields.plans&&d.fields.plans.mapValue&&d.fields.plans.mapValue.fields||{},out={},N=v=>v==null?null:+v||0;
  Object.entries(f).forEach(([k,v])=>{if(k==="u"+me)return;const x=fsGet(v.mapValue&&v.mapValue.fields);
    try{const j=JSON.parse(x.j||"{}"),R={},days={};
      Object.entries(j.R||{}).forEach(([id,r])=>{if(r&&r.n)R[id]={n:String(r.n),c:String(r.c||""),ic:String(r.ic||"🍽️"),k:+r.k||0,p:+r.p||0,kh:N(r.kh),fe:N(r.fe),bs:N(r.bs),t:String(r.t||""),z:Array.isArray(r.z)?r.z.map(String):[],s:String(r.s||""),pz:+r.pz||1}});
      Object.entries(j.days||{}).forEach(([dk,o])=>{if(/^\d{4}-\d\d-\d\d$/.test(dk)&&o&&typeof o==="object"){const m={};CATS.forEach(c=>{if(R[o[c]])m[c]=o[c]});if(Object.keys(m).length)days[dk]=m}});
      out[k]={b:String(x.b||""),t:+x.t||0,days,R}}catch(e){}});
  return out}
function renderPartner(){const C=$("pcard"),s=SY(),P=s&&s.pls?Object.values(s.pls):[];C.innerHTML="";
  const warn=s&&s.sp!==false&&syPlErr?syPlErr:"";
  if(!P.length&&!warn){C.style.display="none";return}C.style.display="";
  if(warn)C.appendChild(el("p","err",esc(warn))).style.margin="0 0 8px";
  const t=todayK();
  P.forEach((pl,i)=>{const who=pl.b||"der anderen Person",ks=Object.keys(pl.days).filter(k=>k>=t).sort();
    const h=el("div","hd",'<h2>👥 Essensplan von '+esc(who)+'</h2>');if(i)h.style.marginTop="18px";C.appendChild(h);
    if(!ks.length){C.appendChild(el("p","sm","Ab heute ist dort nichts geplant.")).style.margin="0";return}
    const show=pExp?ks:ks.slice(0,3);
    show.forEach(k=>{const d=el("div","pd",'<b style="white-space:nowrap'+(k===t?';color:var(--accent)':'')+'">'+(k===t?'Heute · ':'')+wd(k)+' '+dd(k)+'</b>');const g=el("div","slots");
      CATS.forEach(c=>{const r=pl.R[pl.days[k][c]];if(!r)return;const b=el("button","",'<div class="sm">'+c+'</div>'+esc(r.ic)+" "+esc(r.n));b.onclick=()=>partnerRecipe(r,k,c,who);g.appendChild(b)});
      d.appendChild(g);C.appendChild(d)});
    if(ks.length>3){const b=el("button","full",pExp?"Weniger anzeigen":"Alle "+ks.length+" Tage anzeigen");b.style.marginTop="10px";b.onclick=()=>{pExp=!pExp;renderPartner()};C.appendChild(b)}
    if(pl.t)C.appendChild(el("p","sm","Stand: "+new Date(pl.t).toLocaleString("de-DE",{weekday:"short",hour:"2-digit",minute:"2-digit"})+" Uhr")).style.margin="8px 0 0"})}
// Fremdes Rezept (Plan der anderen Person, gemeinsame Rezepte) in die eigenen Rezepte – gleicher Name = schon da
function takeRecipe(r,c){let m=S.R.find(x=>x.n.toLowerCase()===r.n.toLowerCase());
  if(!m){m={id:uid(),c:CATS.includes(r.c)?r.c:CATS.includes(c)?c:"Mittag",n:r.n,k:r.k,p:r.p,kh:r.kh,fe:r.fe,bs:r.bs,ic:r.ic,t:r.t,z:r.z.slice(),s:r.s,tg:r.tg||""};if(r.pz>1)m.pz=r.pz;S.R.push(m);save()}return m}
// Rezept aus dem Plan der anderen Person ansehen, bei sich einplanen oder übernehmen
function partnerRecipe(r,k,c,who){const own=()=>S.R.find(x=>x.n.toLowerCase()===r.n.toLowerCase());const st=steps(r.s);
  openSheet(esc(r.ic)+" "+esc(r.n),
  '<p class="sm" style="margin:0 0 10px;padding:8px 10px;border-radius:10px;background:var(--accbg);color:var(--text)">👥 Bei '+esc(who)+' geplant: '+wd(k)+' '+dd(k)+' · '+esc(c)+'</p>'+
  '<p class="sm" style="margin:0 0 10px">'+mline(r.k,r.p,r.kh,r.fe)+' pro Portion'+(r.t?' · ⏱ '+esc(r.t):'')+'</p>'+
  (r.z.length?'<p class="lb">Zutaten'+(r.pz>1?' (für '+fq(r.pz)+' Portionen)':' (1 Portion)')+'</p><ul class="z">'+r.z.map(z=>'<li>'+esc(z)+'</li>').join("")+'</ul>':'<p class="sm">Keine Zutatenliste hinterlegt.</p>')+
  '<p class="lb" style="margin-top:12px">Zubereitung</p>'+(st.length?'<ol class="st">'+st.map(x=>'<li>'+esc(x)+'</li>').join("")+'</ol>':'<p class="sm">Keine Zubereitung hinterlegt.</p>')+
  '<button class="full pri" id="prPl" style="margin-top:16px">📅 Auch bei mir einplanen · '+wd(k)+' '+dd(k)+'</button>'+
  (own()?'<p class="sm" style="margin:8px 0 0">„'+esc(r.n)+'“ ist schon in deinen Rezepten.</p>':'<button class="full" id="prSv" style="margin-top:8px">＋ In meine Rezepte übernehmen</button>'),
  ()=>{const take=()=>takeRecipe(r,c);
    $("prPl").onclick=()=>{const cur=rById((S.pl[k]||{})[c]),m=own();if(cur&&(!m||cur.id!==m.id)&&!confirm("Bei dir ist dort schon „"+cur.n+"“ geplant. Ersetzen?"))return;
      planSet(k,c,take().id);closeSheet();toast("Bei dir eingeplant · "+wd(k)+" "+dd(k)+" · "+c)};
    if($("prSv"))$("prSv").onclick=()=>{take();closeSheet();renderFood();toast("„"+r.n+"“ ist jetzt in deinen Rezepten")}})}

// Einladung = Firebase-Projekt + Listen-Code, als ein Textbaustein zum Weiterschicken
const syInvite=s=>"FPL1-"+btoa(JSON.stringify({k:s.k,p:s.p,c:s.code})).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
function syParseInvite(t){const m=String(t).match(/FPL1-([A-Za-z0-9_-]+)/);if(!m)return null;
  try{const b=m[1].replace(/-/g,"+").replace(/_/g,"/");const o=JSON.parse(atob(b+"===".slice((b.length+3)%4)));return o.k&&o.p&&/^[A-Z0-9]{20}$/.test(o.c)?o:null}catch(e){return null}}
function syParseCfg(t){const g=k=>{const m=String(t).match(new RegExp('["\']?'+k+'["\']?\\s*:\\s*["\']([^"\']+)["\']'));return m&&m[1].trim()};const k=g("apiKey"),p=g("projectId");return k&&p?{k,p}:null}
function syShare(s){const t="Lass uns FitPlan gemeinsam nutzen (Einkaufsliste, Kalender, Geburtstage, Rezepte):\n1. FitPlan öffnen → Familie → „👥 Mit der Familie teilen“\n2. „Einladung annehmen“ wählen und diese Nachricht einfügen:\n\n"+syInvite(s);
  const copy=()=>{if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(()=>toast("Einladung kopiert – jetzt verschicken"),()=>{$("syx").style.display="";$("syx").value=t;$("syx").select()});else{$("syx").style.display="";$("syx").value=t;$("syx").select()}};
  if(navigator.share)navigator.share({title:"FitPlan gemeinsam nutzen",text:t}).catch(e=>{if(e.name!=="AbortError")copy()});else copy()}
function sySheet(){const s=SY();
  if(s){openSheet("Gemeinsam mit der Familie",
    '<p class="sm" style="margin:0 0 10px">Verbunden. Neue Einträge und Haken erscheinen nach wenigen Sekunden auch auf den anderen Handys. Über Firebase geteilt werden die Einkaufsliste (mit der FamilyWall-Liste), Kalender, Geburtstage, gemeinsame Rezepte und – wenn eingeschaltet – dein Essensplan. Alle anderen Daten bleiben auf dem Handy.</p>'+
    '<label class="f">Dein Name (sieht die andere Person bei deinen Einträgen)</label><div style="display:flex;gap:8px"><input id="syn" maxlength="30"><button id="synok">Speichern</button></div>'+
    '<label style="display:flex;gap:8px;align-items:center;margin-top:12px;font-size:15px"><input type="checkbox" id="syap" style="width:auto"> Zutaten aus meinem Plan automatisch auf die Liste</label>'+
    '<p class="sm" style="margin:2px 0 0">Kommt ein Essen in den Plan, stehen seine Zutaten gleich auf der gemeinsamen Liste. Fliegt es raus, verschwinden sie wieder. Es gilt der oben gewählte Zeitraum.</p>'+
    '<label style="display:flex;gap:8px;align-items:center;margin-top:12px;font-size:15px"><input type="checkbox" id="sysp" style="width:auto"> Meinen Essensplan mit Rezepten teilen</label>'+
    '<p class="sm" style="margin:2px 0 0">Die andere Person sieht deine geplanten Essen ab gestern bis 4 Wochen voraus – mit Zutaten und Zubereitung.</p>'+
    '<p class="err" id="sype" style="margin-top:6px"></p>'+
    '<p class="err" id="syerr" style="margin-top:8px"></p>'+
    '<p class="err" id="syfe" style="margin-top:6px"></p>'+
    '<button class="full pri" id="syinv" style="margin-top:12px">📨 Andere Person einladen</button>'+
    '<p class="sm" style="margin:6px 0 0">Wer die Einladung hat, kann Liste, Kalender, Geburtstage und Rezepte sehen und ändern. Schick sie nur an deine Familie.</p>'+
    '<textarea id="syx" rows="5" style="display:none;margin-top:8px" readonly></textarea>'+
    '<button class="full" id="synow" style="margin-top:12px">↻ Jetzt abgleichen</button>'+
    '<button class="full del" id="syoff" style="margin-top:8px">Verbindung trennen</button>',
    ()=>{$("syn").value=s.name||"";syStat();$("sysp").checked=s.sp!==false;$("syap").checked=s.ap!==false;
      $("syap").onchange=()=>{s.ap=$("syap").checked;const wk=ekK();if(S.ek[wk])S.ek[wk].sh={};
        if(s.ap)syAutoPlan();else Object.entries(s.it).forEach(([id,x])=>{if(x.p&&x.d===s.me)syOp({id,v:null})});
        save();renderShop();toast(s.ap?"Plan-Zutaten kommen automatisch auf die Liste":"Plan-Zutaten bleiben jetzt erst einmal auf diesem Handy")};$("sype").textContent=syPlErr;$("syfe").textContent=syFamErr;
      $("sysp").onchange=()=>{s.sp=$("sysp").checked;syPlErrT=0;save();sySync();toast(s.sp?"Essensplan wird geteilt":"Essensplan wird nicht mehr geteilt")};
      $("synok").onclick=()=>{s.name=$("syn").value.trim();save();toast("Name gespeichert")};
      $("syinv").onclick=()=>syShare(s);
      $("synow").onclick=()=>{toast("Wird abgeglichen …");syPlT=0;syPlErrT=0;sySync().then(()=>{if(!syErr)toast("Liste ist aktuell")})};
      $("syoff").onclick=()=>{if(!confirm("Dieses Handy von der gemeinsamen Liste trennen? Offene Einträge bleiben hier als eigene Einträge erhalten, Kalender, Geburtstage und Rezepte ebenfalls. Auf dem anderen Handy ändert sich nichts."))return;
        const wk=ekK(),E=S.ek[wk]=ekOf(wk);syVis(s).filter(x=>!x.c&&!(x.p&&x.d===s.me)).forEach(x=>E.x.push({n:x.n,c:false}));E.sh={};
        const mp=Object.entries(s.it).filter(([,x])=>x.p&&x.d===s.me).map(([id])=>({id,v:null}));if(mp.length){const b=syBody(mp);syCall(s,"PATCH",b.qs,b.body).catch(()=>{})}  // eigene Plan-Zutaten dort entfernen
        if(s.ph)syCall(s,"PATCH",syPlPath(s),{fields:{}}).catch(()=>{});  // eigenen Essensplan dort entfernen
        FAMC.forEach(c=>{S.fam[c]={...(S.fam[c]||{}),...(s.fm&&s.fm[c]||{})}});  // Kalender, Geburtstage, Rezepte bleiben hier gespeichert
        S.sy=null;syErr="";syPlErr="";syFamErr="";save();closeSheet();renderPlan();renderFam();toast("Verbindung getrennt")}});return}
  let mode="neu";
  openSheet("Gemeinsam mit der Familie",
    '<p class="sm" style="margin:0 0 10px">Mehrere Handys teilen sich Einkaufsliste, Kalender, Geburtstage und Rezepte: Was einer einträgt oder abhakt, sehen die anderen nach wenigen Sekunden. Dafür braucht es einmal ein kostenloses Firebase-Projekt – die Schritte stehen in der Anleitung. Alles andere (Essen, Gewicht, Sport) bleibt auf dem Handy.</p>'+
    '<div class="chips" id="sym"></div>'+
    '<label class="f">Dein Name</label><input id="syn" maxlength="30" placeholder="z. B. Laura">'+
    '<div id="syneu"><label class="f">Firebase-Konfiguration</label><textarea id="syc" rows="7" placeholder="const firebaseConfig = {\n  apiKey: &quot;…&quot;,\n  projectId: &quot;…&quot;,\n  …\n};"></textarea>'+
    '<p class="sm" style="margin:6px 0 0">Aus Firebase: ⚙️ Projekteinstellungen → Allgemein → Meine Apps → Web-App. Den ganzen Block mit <b>firebaseConfig</b> kopieren und hier einfügen.</p></div>'+
    '<div id="syjoin" style="display:none"><label class="f">Einladung</label><textarea id="syi" rows="5" placeholder="Nachricht mit der Einladung hier einfügen (enthält FPL1-…)"></textarea></div>'+
    '<button class="full pri" id="syok" style="margin-top:12px">Verbinden</button><p class="err" id="syerr"></p>',
    ()=>{const dm=()=>{const c=$("sym");c.innerHTML="";[["neu","Neue Liste anlegen"],["join","Einladung annehmen"]].forEach(([v,l])=>{const b=el("button",v===mode?"on":"",l);b.onclick=()=>{mode=v;dm()};c.appendChild(b)});
        $("syneu").style.display=mode==="neu"?"":"none";$("syjoin").style.display=mode==="join"?"":"none";$("syerr").textContent=""};dm();
      $("syok").onclick=async()=>{const E=$("syerr"),btn=$("syok");E.textContent="";let c;
        if(mode==="neu"){c=syParseCfg($("syc").value);if(!c){E.textContent="Darin stehen kein apiKey und keine projectId. Kopiere den ganzen firebaseConfig-Block.";return}c.code=syRnd(20)}
        else{const o=syParseInvite($("syi").value);if(!o){E.textContent="Keine gültige Einladung gefunden. Füge die ganze Nachricht ein.";return}c={k:o.k,p:o.p,code:o.c}}
        const s={...c,name:$("syn").value.trim(),me:syRnd(8),rt:null,q:[],it:{},at:0};
        btn.disabled=true;btn.textContent="Verbinde …";syTok=null;
        try{const d=await syCall(s,"GET");
          if(mode==="neu")await syCall(s,"PATCH","?updateMask.fieldPaths=v",{fields:{v:{integerValue:"1"}}});
          else if(!d.fields){E.textContent="Diese Liste gibt es nicht (mehr). Lass dir eine neue Einladung schicken.";return}
          S.sy=s;syErr="";
          syMigrate();await sySync();renderShop();renderFam();syLoop();
          if(mode==="neu"){sySheet();toast("Liste angelegt – jetzt die andere Person einladen")}else{closeSheet();toast("Verbunden mit der gemeinsamen Liste")}}
        catch(e){E.textContent=syMsg(e)}finally{if($("syok")===btn){btn.disabled=false;btn.textContent="Verbinden"}}}})}
$("eksy").onclick=sySheet;
