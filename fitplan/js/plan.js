// FitPlan – Tab Plan: Wochenplan, Einkaufsliste, FamilyWall-Liste einfügen
/* ---------- Wochenplan & Einkaufsliste ---------- */
function kw(k){const d=new Date(k+"T12:00");d.setDate(d.getDate()+3-((d.getDay()+6)%7));const y=new Date(d.getFullYear(),0,4,12);return 1+Math.round((dayDiff(iso(y),iso(d))-3+((y.getDay()+6)%7))/7)}
// Planungszeitraum: Standard Mo–So der gewählten Woche, sonst frei gewählt (Start + Anzahl Tage)
const prd=()=>S.pr&&S.pr.s&&S.pr.n>0?S.pr:{s:iso(weekStart()),n:7,auto:1};
const weekKeys=()=>{const p=prd();return Array.from({length:p.n},(_,i)=>addDays(p.s,i))};
const ekK=()=>prd().s;
const wdL=k=>new Date(k+"T12:00").toLocaleDateString("de-DE",{weekday:"long"});
function renderPlan(){const W=weekKeys(),G=S.g.k;
  const p=prd(),e=W[W.length-1],past=!p.auto&&e<todayK();
  $("pwt").textContent=p.auto?"Wochenplan · KW "+kw(W[0]):"Essensplan";
  $("pwr").textContent=wd(W[0])+" "+dd(W[0])+" – "+wd(e)+" "+dd(e)+(p.auto?"":" · "+W.length+" Tage")+(past?" · vorbei":"");
  $("pclr").textContent=p.auto?"Woche leeren":"Zeitraum leeren";
  const P=$("pdays");P.innerHTML="";
  W.forEach(k=>{const pl=S.pl[k]||{},rs=CATS.map(c=>rById(pl[c])).filter(Boolean),tot=rs.reduce((a,r)=>a+r.k,0),sm=c=>rs.reduce((a,r)=>a+(r[c]||0),0);
    const d=el("div","pd",'<div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px"><b style="white-space:nowrap'+(k===dt.value?';color:var(--accent)':'')+'">'+wd(k)+' '+dd(k)+'</b><span class="sm" style="text-align:right'+(tot>G?';color:var(--warn)':'')+'">'+(tot?mline(tot,sm("p"),sm("kh"),sm("fe")):'')+'</span></div>');
    const ate=(S.d[k]||{f:[]}).f;
    const g=el("div","slots");CATS.forEach(c=>{const r=rById(pl[c]),ok=r&&ate.some(f=>f.n===r.n);const b=el("button",r?"":"e",'<div class="sm">'+c+(ok?' <span style="color:var(--ok)">✓ gegessen</span>':'')+'</div>'+(r?icOf(r)+" "+esc(r.n):"＋ wählen"));b.onclick=()=>r?recipeDetail(r.id,{k,c}):pickRecipe(k,c);g.appendChild(b)});
    d.appendChild(g);const pc=partnerChips(k);if(pc)d.appendChild(pc);P.appendChild(d)});
  renderPartner();syAutoPlan();renderShop()}
const pnav=d=>{if(S.pr&&!prd().auto){S.pr.s=addDays(S.pr.s,d*S.pr.n);save();renderPlan()}else shift(d*7)};
$("pwp").onclick=()=>pnav(-1);$("pwn").onclick=()=>pnav(1);
$("pzr").onclick=()=>{const W=weekKeys(),t=todayK();
  openSheet("Planungszeitraum",'<p class="sm" style="margin:0 0 4px">Plane z. B. von Einkauf zu Einkauf – etwa Donnerstag bis nächsten Freitag. Die Einkaufsliste gilt dann genau für diesen Zeitraum.</p>'+
  '<div class="g2"><div><label class="f">Von</label><input type="date" id="pzs"></div><div><label class="f">Bis</label><input type="date" id="pze"></div></div>'+
  '<p class="sm" id="pzi" style="margin:6px 0 0;color:var(--text)"></p><p class="err" id="pzerr"></p>'+
  '<p class="lb" style="margin:12px 0 6px">Schnell wählen – ab heute ('+wdL(t)+')</p><div class="chips" id="pzq"></div>'+
  '<button class="full pri" id="pzok">Übernehmen</button>'+(prd().auto?'':'<button class="full" id="pzw" style="margin-top:8px">Zurück zur normalen Woche (Mo–So)</button>'),
  ()=>{const A=$("pzs"),B=$("pze");A.value=W[0];B.value=W[W.length-1];
    const n=()=>A.value&&B.value?dayDiff(A.value,B.value)+1:0;
    const info=()=>{const k=n();$("pzerr").textContent="";$("pzi").textContent=k>0?wdL(A.value)+", "+dd(A.value)+" bis "+wdL(B.value)+", "+dd(B.value)+" · "+k+" Tage":""};
    A.onchange=()=>{if(B.value<A.value)B.value=addDays(A.value,6);info()};B.onchange=info;info();
    [[7,"1 Woche"],[8,"bis nächsten "+wdL(t)],[9,"bis nächsten "+wdL(addDays(t,1))],[14,"2 Wochen"]].forEach(([k,l])=>{const b=el("button","",l+" · "+k+" Tage");b.onclick=()=>{A.value=t;B.value=addDays(t,k-1);info()};$("pzq").appendChild(b)});
    $("pzok").onclick=()=>{const k=n();if(!A.value||!B.value||k<1){$("pzerr").textContent="Wähle Start und Ende.";return}
      if(k>28){$("pzerr").textContent="Höchstens 4 Wochen (28 Tage).";return}
      S.pr={s:A.value,n:k};save();closeSheet();renderPlan();toast("Zeitraum: "+k+" Tage")};
    if($("pzw"))$("pzw").onclick=()=>{S.pr=null;save();closeSheet();renderPlan();toast("Wieder Montag bis Sonntag")}})};
function planSet(k,c,id){if(id)(S.pl[k]=S.pl[k]||{})[c]=id;else if(S.pl[k]){delete S.pl[k][c];if(!Object.keys(S.pl[k]).length)delete S.pl[k]}save();renderPlan();renderFood()}
function pickRecipe(k,c){const cur=(S.pl[k]||{})[c];let allC=false;
  openSheet(c+" · "+wd(k)+" "+dd(k),'<p class="sm" style="margin:0 0 8px">Rezept antippen zum Ansehen, ＋ plant es direkt ein.</p><input id="pq" placeholder="Rezept suchen" style="margin-bottom:8px"><div class="chips" id="pcs"></div><div id="pli"></div>'+(cur?'<button class="full del" id="prm" style="margin-top:10px">Aus dem Plan entfernen</button>':''),
  ()=>{const set=id=>{closeSheet();planSet(k,c,id)};
    const dr=()=>{const q=$("pq").value.trim().toLowerCase();
      $("pcs").innerHTML="";[[false,"Nur "+c],[true,"Alle Rezepte"]].forEach(([v,l])=>{const b=el("button",v===allC?"on":"",l);b.onclick=()=>{allC=v;dr()};$("pcs").appendChild(b)});
      const L=$("pli");L.innerHTML="";const it=S.R.filter(r=>(allC||r.c===c)&&(!q||r.n.toLowerCase().includes(q)));
      const ext=katRecipes().filter(o=>(allC||o.r.c===c)&&(!q||o.r.n.toLowerCase().includes(q)));
      if(!it.length&&!ext.length)L.innerHTML='<p class="sm">Keine Rezepte gefunden.</p>';
      it.forEach(r=>{const row=el("div","row",'<span class="fi">'+icOf(r)+'</span><div class="t">'+esc(r.n)+'<div class="sm">'+mline(r.k,r.p,r.kh,r.fe)+'</div></div><button class="ic'+(r.id===cur?' done':'')+'">'+(r.id===cur?'✓':'＋')+'</button>');row.style.cursor="pointer";row.onclick=()=>recipeDetail(r.id,{k,c,pick:1});
        row.querySelector("button").onclick=e=>{e.stopPropagation();set(r.id)};L.appendChild(row)});
      if(ext.length)L.appendChild(el("p","lb","👥 Von "+(ext.every(o=>!o.who)?"deinen anderen Geräten":"der Familie"))).style.margin="12px 0 0";
      ext.forEach(o=>{const r=o.r,row=el("div","row",'<span class="fi">'+esc(r.ic)+'</span><div class="t">'+esc(r.n)+'<div class="sm">'+(o.who?'von '+esc(o.who)+' · ':'')+mline(r.k,r.p,r.kh,r.fe)+'</div></div><button class="ic">＋</button>');row.style.cursor="pointer";row.onclick=()=>extRecipe(o,{k,c});
        row.querySelector("button").onclick=e=>{e.stopPropagation();set(takeRecipe(r,c).id)};L.appendChild(row)})};
    $("pq").oninput=dr;dr();if(cur)$("prm").onclick=()=>set(null)})}
$("pcopy").onclick=()=>{const W=weekKeys(),has=W.some(k=>S.pl[k]),prev=W.map(k=>S.pl[addDays(k,-7)]);
  if(!prev.some(Boolean)){toast("In der Vorwoche ist nichts geplant");return}
  if(has&&!confirm("Der Plan "+(prd().auto?"dieser Woche":"dieses Zeitraums")+" wird durch die Tage eine Woche davor ersetzt. Fortfahren?"))return;
  const bak=W.map(k=>S.pl[k]);W.forEach((k,i)=>{if(prev[i])S.pl[k]={...prev[i]};else delete S.pl[k]});save();renderPlan();
  toast("Vorwoche übernommen",()=>{W.forEach((k,i)=>{if(bak[i])S.pl[k]=bak[i];else delete S.pl[k]});save();renderPlan()})};
$("pclr").onclick=()=>{const W=weekKeys(),a=prd().auto;if(!W.some(k=>S.pl[k])){toast(a?"Diese Woche ist noch leer":"Dieser Zeitraum ist noch leer");return}
  const bak=W.map(k=>S.pl[k]);W.forEach(k=>delete S.pl[k]);save();renderPlan();
  toast(a?"Woche geleert":"Zeitraum geleert",()=>{W.forEach((k,i)=>{if(bak[i])S.pl[k]=bak[i]});save();renderPlan()})};

const UN={kg:["g",1e3],g:["g",1],l:["ml",1e3],liter:["ml",1e3],ml:["ml",1],el:["EL",1],tl:["TL",1],prise:["Prise",1],prisen:["Prise",1],scheibe:["Scheibe",1],scheiben:["Scheibe",1],"stück":["Stück",1],dose:["Dose",1],dosen:["Dose",1],bund:["Bund",1]};
const NUM=/^(\d+(?:[.,]\d+)?|½|¼|¾)/;
const RXZ=/^(\d+(?:[.,]\d+)?|½|¼|¾)(?:\s*[–-]\s*\d+(?:[.,]\d+)?)?\s*(?:(kg|g|ml|l|liter|EL|TL|Prisen?|Scheiben?|Stück|Dosen?|Bund)\.?\s+)?(.+)$/i;
function parseZ(line){const segs=line.split(/,\s+/),lead=NUM.test(line.trim()),parts=[];let cur=null;
  // „150 g Karotte, Gurke“ gehört zusammen, „½ TL Kurkuma, Ingwer“ sind zwei Zutaten
  segs.forEach(s=>{s=s.trim();if(!s)return;if(cur!==null&&lead&&!NUM.test(s)&&/^\S+\s*(kg|g|ml|l)\s/i.test(cur))cur+=", "+s;else{if(cur!==null)parts.push(cur);cur=s}});if(cur!==null)parts.push(cur);
  return parts.map(s=>{const m=s.match(RXZ);let a=null,u="",n=s;
    if(m){a={"½":.5,"¼":.25,"¾":.75}[m[1]]??num(m[1]);n=m[3];if(m[2]){const x=UN[m[2].toLowerCase()];u=x[0];a*=x[1]}}
    n=n.replace(/\s*\([^)]*\)/g,"").trim();if(!u&&/^eier?$/i.test(n))n="Ei";return{a,u,n}}).filter(x=>x.n)}
function shopItems(full){let W=weekKeys();if(ekMode==="r"&&!full)W=W.filter(k=>k>=todayK());const A={};
  const add=(r,slot,depth,f)=>{f/=(r.pz||1);(r.z||[]).forEach(line=>{
    if(/^wie\s/i.test(line)&&depth<2){const t=S.R.find(x=>x.n.toLowerCase()===line.slice(4).trim().toLowerCase());if(t){add(t,slot,depth+1,f);return}}
    parseZ(line).forEach(it=>{const key=(it.a!=null?it.u:"-")+"|"+it.n.toLowerCase();const o=A[key]||(A[key]={key,n:it.n,u:it.u,a:it.a!=null?0:null,s:new Set()});if(it.a!=null)o.a+=it.a*f;o.s.add(slot)})})};
  W.forEach(k=>{const pl=S.pl[k]||{};CATS.forEach(c=>{const r=rById(pl[c]);if(r)add(r,k+c,0,1)})});
  return Object.values(A)}
function shopLabel(o){if(o.a==null)return o.n;let a=o.a,u=o.u;if(u==="g"&&a>=1000){a/=1000;u="kg"}if(u==="ml"&&a>=1000){a/=1000;u="l"}
  if((u==="g"||u==="ml")&&a>=10)a=Math.round(a);const n=o.n==="Ei"&&a>1?"Eier":o.n;return fq(Math.round(a*100)/100)+(u?" "+u:"")+" "+n}
// Gelöschte Plan-Zutaten bleiben ausgeblendet, bis sich ihre Menge im Plan ändert
// In die gemeinsame Liste übernommene Plan-Zutaten (E.sh) ebenso, bis sich ihre Menge ändert
const ekOf=wk=>{const E=S.ek[wk]||{c:{},x:[]};E.hd=E.hd||{};E.sh=E.sh||{};return E};
const hid=(M,o)=>o.key in M&&M[o.key]===(o.a??0);
const visItems=E=>shopItems().filter(o=>!hid(E.hd,o)&&!hid(E.sh,o));
function renderShop(){renderShopList();renderShopMode();if(typeof shopFab==="function")shopFab()}
/* Einkaufsliste nach Kategorien: gleiche Artikel aus allen Quellen (Plan, Plan der anderen, eigene Einträge,
   FamilyWall) ergeben eine Zeile, Mengen je Einheit addiert – „150 ml Milch“ + „350 ml Milch 1,5 %“ = „500 ml Milch“. */
const SHX=/\b(fettarme?|frische?|kalte?|warme?|gekochte?|ungesüßte?|natur|light|bio|gemischt|tk)\b/g;
function shopCn(n){const s=String(n).toLowerCase().replace(/\([^)]*\)/g," ").replace(/\d+(?:[.,]\d+)?\s*%/g," ").replace(SHX," ").replace(/\s+/g," ").trim();
  return(s||String(n).toLowerCase()).split(" ").map(w=>w==="eier"?"ei":w.length>4&&/(en|ln|rn)$/.test(w)?w.slice(0,-1):w).join(" ")}
// Reihenfolge wie im Supermarkt; geprüft wird in der Reihenfolge von SHC (z. B. „passierte Tomaten“ vor „Tomate“)
const SHO=["Obst & Gemüse","Brot & Backwaren","Milchprodukte & Eier","Fleisch, Fisch & Tofu","Nudeln, Reis & Trockenware","Konserven & Soßen","Gewürze, Öl & Backen","Tiefkühl","Süßes & Snacks","Getränke","Haushalt & Drogerie"];
const SHC=[["Haushalt & Drogerie",/spül|wasch|reinig|putz|toilettenpapier|klopapier|küchenrolle|küchenpapier|müllbeutel|müllsäcke|zahnpasta|zahnbürste|shampoo|duschgel|seife|deo|windel|taschentüch|alufolie|frischhaltefolie|backpapier|schwamm|batterie|kerze|tabs\b/],
  ["Tiefkühl",/tiefkühl|\btk\b|pommes|fischstäbchen|\beis\b|eiscreme|tiefgefroren/],
  ["Getränke",/wasser|saft|schorle|\bcola|limo|\bbier|\bwein\b|kaffee|\btee\b|sprudel|eistee/],
  ["Konserven & Soßen",/passiert|tomatenmark|stückige tomaten|\bdose|soße|sauce|ketchup|senf|mayo|remoulade|brühe|\bfond|pesto|kokosmilch|apfelmus|gewürzgurke|essiggurke|sojasoße|sojasauce|dressing|marmelade|konfitüre|erdnussmus|nussmus|hummus/],
  ["Gewürze, Öl & Backen",/\bsalz|pfeffer|gewürz|paprikapulver|currypulver|\bcurry\b|zimt|muskat|oregano|thymian|rosmarin|kurkuma|kreuzkümmel|kümmel|chili|cayenne|majoran|lorbeer|öl\b|essig|zucker|honig|sirup|backpulver|natron|hefe|vanille|kakao|stärke|puderzucker|süßstoff|sesam|brühwürfel/],
  ["Süßes & Snacks",/schoko|keks|\bchips|gummi|bonbon|riegel|praline|nougat|popcorn|salzstangen|kekse/],
  ["Milchprodukte & Eier",/(^|\s)ei$|(^|\s)eier$|milch(?!reis)|joghurt|quark|skyr|käse|feta|mozzarella|parmesan|gouda|sahne|schmand|butter|kefir|margarine|crème|creme|haferdrink|sojadrink|mandeldrink|drink\b|ayran/],
  ["Fleisch, Fisch & Tofu",/fleisch|hack|hähnchen|huhn|hühn|pute|\brind|schwein|schnitzel|wurst|würstchen|salami|schinken|speck|bacon|lachs|fisch|thunfisch|garnele|shrimp|filet|geschnetzelt|gyros|tofu|tempeh|frikadelle|leberkäse|kassler|kotelett|steak|jagdwurst/],
  ["Brot & Backwaren",/brot|brötchen|toast|baguette|brezel|croissant|knäcke|wrap|tortilla|fladen|semmel|kuchen|zwieback|laugen/],
  ["Nudeln, Reis & Trockenware",/nudel|pasta|spaghetti|penne|fusilli|lasagne|\breis|milchreis|couscous|bulgur|quinoa|hafer|flocken|müsli|granola|mehl|grieß|polenta|linse|kichererbse|chia|leinsamen|nüsse|nuss|mandel|walnuss|cashew|erdnüss|samen|kerne|rosinen|datteln|spätzle|gnocchi|cornflakes/],
  ["Obst & Gemüse",/apfel|äpfel|banane|birne|orange|mandarine|clementine|zitrone|limette|kiwi|beere|traube|ananas|mango|melone|pfirsich|nektarine|pflaume|kirsche|avocado|tomate|gurke|paprika|karotte|möhre|brokkoli|blumenkohl|zucchini|spinat|salat|rucola|kohl|zwiebel|knoblauch|lauch|porree|sellerie|kartoffel|pilz|champignon|aubergine|kürbis|radieschen|ingwer|petersilie|basilikum|schnittlauch|dill|koriander|minze|kräuter|obst|gemüse|\bmais|erbse|bohne|fenchel|spargel|rote bete|feldsalat|eisberg|grapefruit|feige|rhabarber|physalis|granatapfel|süßkartoffel/]];
const shopCat=n=>{const s=String(n).toLowerCase();for(const [c,re] of SHC)if(re.test(s))return c;return"Sonstiges"};
// Alle Einträge aller Quellen → Kategorien mit zusammengefassten Zeilen [{t, items:[{label,sub,c,set(v),del()}]}]
function shopSecs(){const wk=ekK(),E=ekOf(wk),sy=SY(),auto=syAuto(),R=[],keep=()=>{S.ek[wk]=E;save()};
  const one=t=>{const p=parseZ(t);return p.length===1&&p[0].a!=null?p[0]:{a:null,u:"",n:t}};
  const add=(it,c,set,del,src,g,m)=>R.push({n:it.n,a:it.a,u:it.u||"",c:!!c,set,del,src,g,m:m||0,w:it.w});
  if(sy)syVis(sy).forEach(x=>{const mine=syMe(sy,x.d),who=x.b||"der anderen Person";
    const it=x.p&&x.nn?{n:x.nn,a:x.a==null||x.a===""?null:num(x.a),u:x.u||""}:one(x.n);if(x.w)it.w=1;
    add(it,x.c,v=>syOp({id:x.id,f:"c",v}),()=>syDel(x),x.f?"FamilyWall":x.p?(mine?"aus deinem Plan":"Plan von "+who):mine?"":"von "+who,x.g)});
  if(!auto)visItems(E).forEach(o=>add({n:o.n,a:o.a,u:o.u,w:o.a==null},E.c[o.key],v=>{if(v)E.c[o.key]=1;else delete E.c[o.key];keep()},()=>{E.hd[o.key]=o.a??0;delete E.c[o.key];keep()},sy?"aus deinem Plan · nur hier":"",null,o.s.size));
  E.x.forEach(x=>add(one(x.n),x.c,v=>{x.c=v;keep()},()=>{E.x=E.x.filter(y=>y!==x);keep()},""));
  if(S.fw)S.fw.items.forEach(x=>add(one(x.n),x.c,v=>{x.c=v;save()},()=>{if(!S.fw)return;S.fw.items=S.fw.items.filter(y=>y!==x);if(!S.fw.items.length)S.fw=null;save()},"FamilyWall",x.g));
  const G={};R.forEach(r=>{const k=shopCn(r.n);(G[k]=G[k]||[]).push(r)});
  const secs={};Object.values(G).forEach(rs=>{const sum={};rs.forEach(r=>{if(r.a!=null&&r.a>0)sum[r.u]=(sum[r.u]||0)+r.a});const us=Object.keys(sum);
    // Name: kürzeste Form („Milch“ statt „Milch 1,5 %“), bei Stückzahl über 1 die Mehrzahl („3 Bananen“)
    const ns=rs.map(r=>r.n).sort((a,b)=>a.length-b.length),n=us.length===1&&us[0]===""&&sum[""]>1?ns[ns.length-1]:ns[0];
    const label=!us.length?n:us.length===1?shopLabel({a:sum[us[0]],u:us[0],n}):us.map(u=>shopLabel({a:sum[u],u,n:""}).trim()).join(" + ")+" "+n;
    const src=[...new Set(rs.map(r=>r.src).filter(Boolean))],m=rs.reduce((a,r)=>a+r.m,0);if(m>1&&!sy)src.push("für "+m+" Mahlzeiten");
    let t=shopCat(n);if(t==="Sonstiges"){const g=rs.map(r=>r.g).find(g=>g&&g!=="Sonstiges");if(g)t=g;else if(rs.every(r=>r.w))t="Gewürze, Öl & Backen"}
    (secs[t]=secs[t]||[]).push({label,sub:src.join(" · "),c:rs.every(r=>r.c),set:v=>rs.forEach(r=>r.set(v)),del:()=>rs.forEach(r=>r.del()),sk:shopCn(n)})});
  const rk=t=>{const i=SHO.indexOf(t);return i>=0?i:t==="Sonstiges"?99:50};
  return Object.keys(secs).sort((a,b)=>rk(a)-rk(b)||a.localeCompare(b,"de")).map(t=>({t,items:secs[t].sort((a,b)=>(a.c-b.c)||a.sk.localeCompare(b.sk,"de"))}))}
function renderShopList(){const wk=ekK(),E=ekOf(wk),sy=SY(),auto=syAuto();
  const ch=$("ekm");ch.innerHTML="";ch.style.display=auto?"none":"";[["w",prd().auto?"Ganze Woche":"Ganzer Zeitraum"],["r","Ab heute"]].forEach(([v,l])=>{const b=el("button",v===ekMode?"on":"",l);b.onclick=()=>{ekMode=v;renderShop()};ch.appendChild(b)});
  const nh=auto?0:shopItems().filter(o=>hid(E.hd,o)&&!hid(E.sh,o)).length,L=$("ekl");L.innerHTML="";
  $("eksy").textContent=sy?"👥 Gemeinsame Liste verwalten":"👥 Mit anderem Handy teilen";
  const restore=()=>{if(!nh)return;const b=el("button","full","↺ "+nh+(nh===1?" gelöschte Zutat":" gelöschte Zutaten")+" aus dem Plan wieder anzeigen");b.style.cssText="margin-top:10px;font-size:13px";b.onclick=()=>{E.hd={};S.ek[wk]=E;save();renderShop()};L.appendChild(b)};
  const secs=shopSecs();
  if(sy){const h=el("div","gh",'<span>👥 Gemeinsame Liste</span><span class="sm" id="syst"></span>');h.style.marginTop="0";L.appendChild(h);
    const open=auto?0:visItems(E).filter(o=>!E.c[o.key]).length;
    if(open){const d=el("div","",'<span class="sm" style="flex:1">🗓️ '+open+(open===1?' Zutat':' Zutaten')+' aus deinem Plan stehen nur hier</span>');d.style.cssText="display:flex;align-items:center;gap:8px;margin:6px 0 0";
      const b=el("button","pri","↑ teilen");b.style.cssText="font-size:12px;padding:4px 10px";b.onclick=()=>syPushPlan(E);d.appendChild(b);L.appendChild(d)}}
  if(!secs.length){L.appendChild(el("p","sm",sy?(auto?"Noch leer. Plane oben Rezepte ein – die Zutaten landen automatisch hier, auch auf dem anderen Handy.":"Noch leer. Neue Einträge oben landen hier – auch auf dem anderen Handy."):nh?"Die Liste ist leer.":"Plane oben Rezepte ein – die Zutaten erscheinen dann hier automatisch. Eigenes trägst du oben ein.")).style.margin=sy?"6px 0 0":"0";if(sy)syStat();restore();return}
  const row=g=>{const r=el("div","ek"+(g.c?" ok":""),'<input type="checkbox"'+(g.c?' checked':'')+'><div class="t" style="flex:1;min-width:0">'+esc(g.label)+(g.sub?'<div class="sm">'+esc(g.sub)+'</div>':'')+'</div>');
    r.onclick=e=>{if(e.target.tagName==="BUTTON")return;g.set(!g.c);save();renderShop()};
    const b=el("button","ic","✕");b.setAttribute("aria-label","Entfernen");b.onclick=()=>{g.del();save();renderShop()};r.appendChild(b);L.appendChild(r)};
  secs.forEach((s,i)=>{const open=s.items.filter(g=>!g.c).length,h=el("div","gh",'<span>'+esc(s.t)+'</span><span class="sm">'+(open?open+" offen":"✓")+'</span>');if(i===0&&!sy)h.style.marginTop="0";L.appendChild(h);s.items.forEach(row)});
  const fwN=sy?syVis(sy).filter(x=>x.f):S.fw?S.fw.items:[];
  if(fwN.length){const b=el("button","full","📋 FamilyWall-Artikel entfernen ("+fwN.length+")");b.style.cssText="margin-top:12px;font-size:13px";
    b.onclick=()=>{if(sy){if(!confirm("FamilyWall-Artikel auf allen Handys aus der Liste nehmen?"))return;const old=fwN.map(x=>{const{id,...v}=x;return{id,v}});old.forEach(o=>syOp({id:o.id,v:null}));renderShop();
        toast("FamilyWall-Artikel entfernt",()=>{if(SY()===sy){old.forEach(syOp);renderShop()}})}
      else{const old=S.fw;S.fw=null;save();renderShop();toast("FamilyWall-Liste entfernt",()=>{S.fw=old;save();renderShop()})}};L.appendChild(b)}
  if(sy)syStat();restore()}
function shopBulk(all){const sy=SY(),auto=syAuto();if(all&&sy&&syVis(sy).length&&!confirm("Die gemeinsame Liste wird auch auf dem anderen Handy geleert. Fortfahren?"))return;
  const wk=ekK(),E=ekOf(wk),bak=JSON.stringify({E,fw:S.fw});let n=0;const go=x=>all||x;
  if(!auto)visItems(E).forEach(o=>{if(go(E.c[o.key])){E.hd[o.key]=o.a??0;delete E.c[o.key];n++}});
  n+=E.x.filter(x=>go(x.c)).length;E.x=E.x.filter(x=>!go(x.c));
  if(S.fw){n+=S.fw.items.filter(x=>go(x.c)).length;S.fw.items=S.fw.items.filter(x=>!go(x.c));if(!S.fw.items.length)S.fw=null}
  const sd=sy?syVis(sy).filter(x=>go(x.c)).map(({id,...v})=>({id,v})):[];n+=sd.length;
  if(!n){toast(all?"Die Liste ist schon leer":"Nichts abgehakt");return}
  sd.forEach(o=>syDel({id:o.id,...o.v}));
  S.ek[wk]=E;save();renderShop();toast(all?"Liste geleert":n+(n===1?" Eintrag":" Einträge")+" gelöscht",()=>{const b=JSON.parse(bak);S.ek[wk]=b.E;S.fw=b.fw;if(SY()===sy)sd.forEach(syOp);save();renderShop()})}
$("ekdc").onclick=()=>shopBulk(false);$("ekclr").onclick=()=>shopBulk(true);

/* FamilyWall-Liste einlesen (Text aus „Teilen“ in FamilyWall) */
function parseFW(t){const out=[];let g="Sonstiges",sep=false,title="",mk=0;
  const tc=l=>l.toLowerCase().replace(/(^|[\s&\/-])(\p{L})/gu,(a,b,c)=>b+c.toUpperCase());
  String(t||"").split(/\r?\n/).forEach(raw=>{const l=raw.replace(/\uFE0F/g,"").trim();if(!l)return;
    if(/^[*=_~\-–—]{3,}$/.test(l)){sep=true;return}
    if(/gesendet mit familywall|familywall\.com|mit familywall verschicken|kostenlos verfügbar für handy/i.test(l))return;
    let m=l.match(/^[❏❑☐□▢◻⬜○◯•·*-]\s*(.+)$/u);if(m){mk++;out.push({n:m[1].trim(),g,c:false});return}
    m=l.match(/^[☑☒✓✔✅■▣●]\s*(.+)$/u);if(m){mk++;out.push({n:m[1].trim(),g,c:true});return}
    if(/\p{Lu}/u.test(l)&&l===l.toUpperCase()&&l.length<=40){g=/^unkategorisiert$/i.test(l)?"Sonstiges":tc(l);return}
    if(!sep&&!out.length&&!title){title=l;return}
    if(l===title)return;
    out.push({n:l,g,c:false})});
  // iPhone-FamilyWall schickt nur Listenname, Werbezeile und Absender – das sind keine Artikel
  const stub=!mk&&/mit familywall verschicken|kostenlos verfügbar für handy/i.test(t);if(stub)out.length=0;
  // Nur eine Zeile wie „Einkaufen: Milch, Eier, Brot“ → in Artikel aufteilen
  if(!stub&&!out.length&&title&&/[,;]/.test(title)){const m=title.match(/^([^:]{1,30}):\s*(.+)$/);const body=m?m[2]:title;if(m)title=m[1].trim();
    body.split(/\s*[,;]\s*/).map(x=>x.replace(/^[❏❑☐□▢◻⬜○◯•·*-]\s*/u,"").trim()).filter(Boolean).forEach(n=>out.push({n,g:"Sonstiges",c:false}))}
  return{title,items:out.filter(x=>x.n)}}
const isIOS=()=>/iP(hone|ad|od)/.test(navigator.userAgent)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1);
// FamilyWall auf dem iPhone verschickt beim Teilen keine Artikel (nur Listenname + Werbezeile)
const FW_IOS='<b>Hinweis fürs iPhone:</b> Die FamilyWall-App auf dem iPhone schickt beim Teilen nur den Listennamen mit, <b>ohne die Artikel</b>. So bekommst du die Liste trotzdem:<ol style="margin:6px 0 0;padding-left:20px"><li><b>Am besten vom Android-Handy:</b> Die Liste ist in FamilyWall für alle synchron. Dort Liste öffnen → Teilen → <b>FitPlan</b>.</li><li><b>Oder über die FamilyWall-Webseite:</b> In Safari <b>app.familywall.com</b> öffnen, Liste öffnen, die Artikel markieren → Kopieren → hier einfügen.</li></ol>';
const fwStub=t=>/mit familywall verschicken|kostenlos verfügbar für handy|gesendet mit familywall/i.test(t);
function fwSheet(pre){const canRead=!!(navigator.clipboard&&navigator.clipboard.readText);
  openSheet("Aus FamilyWall einfügen",(isIOS()?'<div class="sm" style="margin:0 0 10px;padding:10px;border-radius:10px;background:var(--accbg);color:var(--text)">'+FW_IOS+'</div>'
    :'<p class="sm" style="margin:0 0 8px">Am schnellsten: in FamilyWall die Liste öffnen → Teilen → <b>FitPlan</b> wählen. Oder Teilen → Kopieren und hier einfügen.</p>')+
  (canRead?'<button class="full" id="fwp">📋 Aus Zwischenablage einfügen</button>':'')+
  '<textarea id="fwt" rows="8" style="margin-top:8px" placeholder="Text aus FamilyWall hier einfügen"></textarea><p class="sm" id="fwi" style="margin:6px 0 0"></p>'+
  '<div class="sm" id="fwh" style="display:none;margin:8px 0 0;padding:10px;border-radius:10px;border:1px solid var(--warn);color:var(--text)"></div>'+
  (S.fw||syHasFW()?'<label style="display:flex;gap:8px;align-items:center;margin-top:10px;font-size:15px"><input type="checkbox" id="fwr" checked style="width:auto"> Bisherige FamilyWall-Liste ersetzen</label>':'')+
  '<button class="full pri" id="fwo" style="margin-top:12px">Übernehmen</button><p class="err" id="fwe"></p>'+
  '<button class="full" id="fwcal" style="display:none;margin-top:8px">📅 Das sind Termine? In den Kalender übernehmen</button>',
  ()=>{const t=$("fwt");if(pre)t.value=pre;
    $("fwcal").onclick=()=>{const v=t.value;famTab="cal";show("fam");calImport(v)};
    const up=()=>{$("fwe").textContent="";const r=parseFW(t.value),gs=new Set(r.items.map(x=>x.g)),ck=r.items.filter(x=>x.c).length;
      $("fwi").textContent=r.items.length?r.items.length+" Artikel in "+gs.size+(gs.size===1?" Kategorie":" Kategorien")+" erkannt"+(ck?" ("+ck+" schon abgehakt)":""):"";
      // Nur der Listenname angekommen (typisch für iPhone → Teilen → Kopieren)
      $("fwcal").style.display=txtParse(t.value).length?"":"none";
      const stub=!r.items.length&&fwStub(t.value),only=!r.items.length&&(!!r.title||stub),H=$("fwh");H.style.display=only?"":"none";
      if(only)H.innerHTML='⚠️ '+(stub?'FamilyWall hat nur den Listennamen und eine Werbezeile geschickt – <b>die Artikel fehlen</b>. Das passiert, wenn die Liste von einem iPhone geteilt wird.':'Es ist nur der Listenname „'+esc(r.title)+'“ angekommen, nicht die Artikel.')+
        (isIOS()?' Siehe die Möglichkeiten oben.':'<br><br>'+FW_IOS.replace('<b>Hinweis fürs iPhone:</b> ',''))};
    t.oninput=up;up();
    if(canRead)$("fwp").onclick=()=>navigator.clipboard.readText().then(x=>{t.value=x;up()},()=>{$("fwe").textContent="Kein Zugriff auf die Zwischenablage. Tippe lange ins Feld und wähle „Einfügen“."});
    $("fwo").onclick=()=>{const r=parseFW(t.value);if(!r.items.length){$("fwe").textContent=r.title||fwStub(t.value)?"Es sind keine Artikel angekommen – siehe Hinweis.":"Keine Artikel erkannt. Füge den Text aus FamilyWall ein.";return}
      if(SY()){const u=syFW(r.items,!$("fwr")||$("fwr").checked);save();closeSheet();show("plan");$("ekl").closest(".card").scrollIntoView();window.scrollBy(0,-70);
        toast(r.items.length+" Artikel geteilt",u);return}
      const old=S.fw&&{...S.fw,items:S.fw.items.map(x=>({...x}))};
      if(!S.fw||!$("fwr")||$("fwr").checked)S.fw={at:todayK(),t:r.title,items:r.items};
      else{const have=new Set(S.fw.items.map(x=>x.n.toLowerCase()));r.items.forEach(x=>{if(!have.has(x.n.toLowerCase()))S.fw.items.push(x)});S.fw.at=todayK()}
      save();closeSheet();show("plan");const c=$("ekl").closest(".card");c.scrollIntoView();window.scrollBy(0,-70);
      toast(r.items.length+" Artikel übernommen",()=>{S.fw=old;save();renderShop()})}})}
$("ekfw").onclick=()=>fwSheet("");
function ekAdd(n){const sy=SY();if(sy){syOp({id:"i"+syRnd(10),v:{n,c:false,b:sy.name,d:syWho(sy),t:Date.now()}});renderShop();return}
  const wk=ekK();const E=S.ek[wk]=S.ek[wk]||{c:{},x:[]};E.x.push({n,c:false});save();renderShop()}
$("eka").onclick=()=>{const n=$("eki").value.trim();if(!n)return;$("eki").value="";ekAdd(n)};
$("eki").onkeydown=e=>{if(e.key==="Enter")$("eka").click()};
$("ekr").onclick=()=>{const wk=ekK(),E=S.ek[wk];if(E){E.c={};E.x.forEach(x=>x.c=false)}if(S.fw)S.fw.items.forEach(x=>x.c=false);const sy=SY();if(sy)syVis(sy).forEach(x=>{if(x.c)syOp({id:x.id,f:"c",v:false})});save();renderShop();toast("Haken zurückgesetzt")};
$("eksh").onclick=()=>{const wk=ekK(),E=ekOf(wk);
  const lines=[];shopSecs().forEach(s=>s.items.forEach(g=>{if(!g.c)lines.push(g.label)}));  // nach Kategorien, gleiche Artikel zusammengefasst
  if(!lines.length){toast("Nichts mehr offen");return}
  const W=weekKeys(),boxed="Einkaufsliste "+(prd().auto?"KW "+kw(wk):dd(W[0])+" – "+dd(W[W.length-1]))+"\n"+lines.map(l=>"☐ "+l).join("\n"),plain=lines.join("\n");
  const copy=t=>{const ok=()=>{toast("Liste kopiert – jetzt einfügen")},show=()=>{$("ekx").style.display="";$("ekx").value=t;$("ekx").select();toast("Text markiert – jetzt kopieren")};
    if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(ok,show);else show()};
  openSheet("Einkaufsliste exportieren",
  '<p class="sm" style="margin:0 0 12px">'+lines.length+' offene '+(lines.length===1?'Zutat':'Zutaten')+'. Abgehakte Einträge werden nicht exportiert.</p>'+
  '<p class="lb" style="margin:0 0 6px">Zum Abhaken in Notizen oder Erinnerungen</p>'+
  '<button class="full pri" id="ekc1">Kopieren</button>'+
  '<ul class="z sm" style="margin:8px 0 0"><li><b>Notizen:</b> neue Notiz → einfügen → alles markieren → Checklisten-Symbol (☑) tippen. Jede Zeile bekommt ein Kästchen zum Abhaken.</li>'+
  '<li style="margin-top:4px"><b>Erinnerungen:</b> Liste öffnen → „Neue Erinnerung“ → einfügen. Jede Zeile wird ein eigener Punkt zum Abhaken.</li></ul>'+
  '<p class="lb" style="margin:16px 0 6px">Zum Verschicken (WhatsApp, Nachrichten, Mail)</p>'+
  '<button class="full" id="ekc2">☐ Mit Kästchen teilen</button>'+
  '<p class="sm" style="margin:6px 0 0">Die Kästchen ☐ sind dort nur zum Ansehen, antippen lässt sich nichts.</p>'+
  '<textarea id="ekx" rows="6" style="display:none;margin-top:12px" readonly></textarea>',
  ()=>{$("ekc1").onclick=()=>copy(plain);
    $("ekc2").onclick=()=>{if(navigator.share)navigator.share({title:"Einkaufsliste",text:boxed}).catch(e=>{if(e.name!=="AbortError")copy(boxed)});else copy(boxed)}})};
