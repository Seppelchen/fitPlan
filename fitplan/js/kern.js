// FitPlan – Grundlagen: Hilfsfunktionen, Speichern/Laden, Tabs, Datum, Fenster (Sheets), Hinweise (Toast)
const KEY="fitplan.v1";
const CATS=["Frühstück","Mittag","Abend","Snack"];
const PQ=[.5,1,1.5,2];
const MZ=[["b","Bauch"],["h","Hüfte"],["o","Oberschenkel"],["a","Oberarm"]];
let rvMode="k",rvSel=null,rMan=false;
let S,rcat="Frühstück",rsub="Süß",edA=false,edE=false,libCat="Oberkörper",wr=90,ekMode="w";

const $=id=>document.getElementById(id);
const el=(t,c,h)=>{const e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e};
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const iso=d=>{const z=new Date(d.getTime()-d.getTimezoneOffset()*6e4);return z.toISOString().slice(0,10)};
const fmt=n=>Math.round(n||0).toLocaleString("de-DE");
const d1=n=>(Math.round((n||0)*10)/10).toLocaleString("de-DE",{minimumFractionDigits:1,maximumFractionDigits:1});
const d2=n=>(Math.round((n||0)*100)/100).toLocaleString("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2});
const nf=n=>(n||0).toLocaleString("de-DE",{maximumFractionDigits:1});
const num=v=>parseFloat(String(v??"").replace(",","."));
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const dd=k=>new Date(k+"T12:00").toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit"});
const wd=k=>new Date(k+"T12:00").toLocaleDateString("de-DE",{weekday:"short"}).replace(".","");
const addDays=(k,n)=>{const d=new Date(k+"T12:00");d.setDate(d.getDate()+n);return iso(d)};
const dayDiff=(a,b)=>Math.round((new Date(b+"T12:00")-new Date(a+"T12:00"))/864e5);
const todayK=()=>iso(new Date());
const fq=q=>({.25:"¼",.5:"½",.75:"¾",1.5:"1½",2.5:"2½"}[q]||nf(q));
const goalTxt=a=>a.p>1?"Alle "+a.p+" Wochen":a.g+"× pro Woche";
const quick=r=>/^\d+/.test(r.t||"")&&parseInt(r.t)<=5&&!/Vorabend/.test(r.t);
const sumK=fs=>fs.reduce((a,f)=>a+f.k,0);
const MK=[["kh","Kohlenhydrate"],["fe","Fett"],["bs","Ballaststoffe"]];
// Passendes Bild zum Essen über Stichwörter (erster Treffer gewinnt)
const FIC=[[/pizza/,"🍕"],[/döner|kebab|gyros|falafel/,"🥙"],[/burger/,"🍔"],[/pommes/,"🍟"],[/wrap|tortilla|burrito/,"🌯"],[/sushi/,"🍣"],[/suppe|eintopf|brühe/,"🍲"],
 [/croissant/,"🥐"],[/pancake|pfannkuchen|waffel|french toast/,"🥞"],[/smoothie|shake/,"🥤"],[/kaffee|cappuccino|latte|espresso/,"☕"],[/\btee\b/,"🍵"],[/bier\b/,"🍺"],
 [/schorle|saft|cola|limo|fanta|sprite|eistee/,"🧃"],[/kokos/,"🥥"],[/haferdrink|milch\b/,"🥛"],[/sandwich/,"🥪"],[/omelett|rührei|spiegelei|\beier?\b/,"🍳"],
 [/lachs|fisch|seelachs|kabeljau|thunfisch|forelle|hering/,"🐟"],[/garnele|shrimp|scampi/,"🦐"],[/hähnchen|huhn|hühn|chicken|pute|geflügel|chicken/,"🍗"],
 [/schinken|speck|bacon|aufschnitt/,"🥓"],[/wurst|würstchen|salami|leberkäse|wiener/,"🌭"],[/hack|rind|steak|schwein|fleisch|gulasch|schnitzel|frikadelle/,"🥩"],
 [/nudel|pasta|spaghetti|lasagne|couscous|spätzle/,"🍝"],[/reis\b|reis,|curry|risotto/,"🍛"],[/salat/,"🥗"],[/tofu|pfanne/,"🥘"],[/linse|bohne|kichererbse|hummus/,"🫘"],
 [/süßkartoffel/,"🍠"],[/kartoffel|chips/,"🥔"],[/porridge|hafer|oats|müsli|granola|cornflakes|milchreis|grieß|chia|bowl/,"🥣"],[/skyr|quark|joghurt|pudding/,"🥣"],
 [/brot|brötchen|toast|knäcke|brezel|semmel|baguette/,"🍞"],[/käse|feta|gouda|mozzarella|parmesan/,"🧀"],[/trauben/,"🍇"],[/wein/,"🍷"],
 [/apfel|äpfel/,"🍎"],[/banane/,"🍌"],[/erdbeer/,"🍓"],[/heidelbeer|blaubeer|himbeer|beere/,"🫐"],[/kirsch/,"🍒"],[/orange|mandarine|clementine/,"🍊"],[/zitrone/,"🍋"],
 [/ananas/,"🍍"],[/mango/,"🥭"],[/melone/,"🍉"],[/pfirsich|nektarine/,"🍑"],[/birne/,"🍐"],[/kiwi/,"🥝"],[/avocado/,"🥑"],[/pflaume/,"🫐"],
 [/tomate/,"🍅"],[/gurke/,"🥒"],[/paprika|chili/,"🫑"],[/karotte|möhre/,"🥕"],[/brokkoli|blumenkohl|kohl/,"🥦"],[/zucchini|aubergine/,"🥒"],[/mais/,"🌽"],
 [/pilz|champignon/,"🍄"],[/spinat|gemüse|radieschen|zwiebel|erbsen/,"🥬"],[/schoko|nougat|kakao/,"🍫"],[/kuchen|torte|muffin/,"🍰"],[/keks|cookie/,"🍪"],
 [/\beis\b|eiscreme|vanilleeis/,"🍦"],[/gummi|bonbon|süßigkeit/,"🍬"],[/popcorn/,"🍿"],[/nuss|nüsse|mandel|cashew/,"🥜"],[/honig/,"🍯"],[/butter/,"🧈"],[/\böl\b/,"🫒"]];
const foodIc=n=>{const x=String(n||"").toLowerCase();for(const [re,e] of FIC)if(re.test(x))return e;return"🍽️"};
const icOf=o=>{if(o.ic)return o.ic;const r=S.R.find(x=>x.n===o.n&&x.ic);return r?r.ic:foodIc(o.n)};
const ICS=["🥣","🥞","🍳","🍞","🥪","🌯","🥗","🍝","🍛","🍲","🥘","🐟","🍗","🥩","🥔","🥦","🫘","🍕","🍔","🍎","🍌","🍓","🫐","🥜","🧀","🥛","🍰","🍫","🍪","🍦","🥤","☕"];
const mv=(e,c)=>e[c+"1"]==null?null:e[c+"1"]*(e.q||1);
const per1=o=>({kh:o.kh1,fe:o.fe1,bs:o.bs1,ic:o.ic});
const favOf=o=>({n:o.n,k1:o.k1,p1:o.p1,kh1:o.kh1,fe1:o.fe1,bs1:o.bs1,ic:o.ic,m:o.m});
const nn=v=>{const x=num(v);return isFinite(x)&&x>=0?Math.round(x*10)/10:null};
// "405 kcal · E 25 · KH 44 · F 12 g" (E = Eiweiß, KH = Kohlenhydrate, F = Fett)
const mline=(k,p,kh,fe)=>fmt(k)+" kcal · E "+fmt(p)+(kh!=null?" · KH "+fmt(kh):"")+(fe!=null?" · F "+fmt(fe):"")+" g";
function macSum(fs){const t={k:0,p:0,kh:0,fe:0,bs:0,any:0,miss:0};
  fs.forEach(f=>{t.k+=f.k;t.p+=f.p;let m=0;MK.forEach(([c])=>{const v=mv(f,c);if(v!=null){t[c]+=v;m=1}});if(m)t.any++;else t.miss++});return t}
const mt3=pfx=>'<div class="g3" style="margin-top:8px">'+MK.map(([c,l])=>'<div class="mc"><div class="sm">'+l+'</div><b id="'+pfx+c+'"></b></div>').join("")+'</div>';
const mt3set=(pfx,get,f)=>MK.forEach(([c])=>{const v=get(c);$(pfx+c).textContent=v==null?"–":(f||fmt)(v)+" g"});
const rById=id=>id?S.R.find(r=>r.id===id):null;
function guessMeal(){const d=new Date(),h=d.getHours()+d.getMinutes()/60;return h<10.5?"Frühstück":h<14.5?"Mittag":h<17.5?"Snack":"Abend"}
const mealSel=(id,v)=>'<select id="'+id+'">'+CATS.map(c=>'<option'+(c===v?' selected':'')+'>'+c+'</option>').join("")+'</select>';

function toast(t,undo,lbl){const e=$("toast");e.textContent=t;
  if(undo){const b=el("button","",lbl||"Rückgängig");b.onclick=()=>{e.classList.remove("on");undo()};e.appendChild(b)}
  e.classList.toggle("act",!!undo);e.classList.add("on");clearTimeout(toast.h);toast.h=setTimeout(()=>e.classList.remove("on"),undo?5000:1800)}
function undoDel(arr,i,label,re){if(i<0)return;const x=arr.splice(i,1)[0];save();re();
  toast(label+" gelöscht",()=>{arr.splice(Math.min(i,arr.length),0,x);save();re()})}

const rMac=n=>{const m=RM[n];return m?{kh:m[0],fe:m[1],bs:m[2]}:{kh:null,fe:null,bs:null}};
const mkR=r=>({id:uid(),c:r[0],n:r[1],k:r[2],p:r[3],...rMac(r[1]),ic:RI[r[1]],t:r[4],z:r[5].slice(),s:r[6],tg:r[7]||""});
function defR(){return RB.map(mkR)}
function fix(){
  if(!S||typeof S!=="object")S={};
  S.d=S.d||{};S.w=S.w||{};
  // Einmalig: Standardrezepte vegetarisch (nur gebratener Lachs erlaubt, kein Räucherlachs) und ohne Pilze – gleiche ID, damit der Wochenplan erhalten bleibt
  if((S.veg||0)<2&&Array.isArray(S.R)){S.R.forEach(r=>{const nn=VEG[r.n];const row=nn&&RB.find(x=>x[1]===nn);if(row&&!S.R.some(y=>y!==r&&y.n===nn)){const id=r.id;Object.assign(r,mkR(row),{id});delete r.ci;delete r.pz}});S.veg=2}
  // Neue mitgelieferte Rezepte je Version einmalig ergänzen (gelöschte kommen nicht zurück)
  const RBV=[[2,RB2],[3,RB3]],top=RBV[RBV.length-1][0];
  if(!Array.isArray(S.R)){S.R=defR();S.rbv=top;S.veg=2}
  if((S.rbv||1)<top){const have=new Set(S.R.map(r=>r.n.toLowerCase()));RBV.forEach(([v,L])=>{if(v>(S.rbv||1))L.forEach(r=>{if(!have.has(r[1].toLowerCase()))S.R.push(mkR(r))})});S.rbv=top}
  S.R.forEach(r=>{r.id=r.id||uid();if(!Array.isArray(r.z)){const d=RB.find(x=>x[1]===r.n);if(d){r.t=d[4];r.z=d[5].slice();r.s=d[6];r.tg=d[7]||""}else{r.z=[];r.s=r.s||"";r.t=r.t||"";r.tg=r.tg||""}}
    if(r.kh===undefined)Object.assign(r,rMac(r.n))});
  if(!Array.isArray(S.A))S.A=DA.map(a=>({...a}));S.A.forEach(a=>{a.p=a.p||1;a.g=a.g||1});
  if(!Array.isArray(S.E))S.E=DE.map(e=>({...e}));
  S.g=Object.assign({k:1650,pz:90,s:110,z:80,ml:2000,kh:0,fe:0,bs:30},S.g||{});
  if(!Array.isArray(S.fav))S.fav=[];
  if(S.sy&&!(S.sy.code&&S.sy.k&&S.sy.p))S.sy=null;if(S.sy){S.sy.q=Array.isArray(S.sy.q)?S.sy.q:[];S.sy.it=S.sy.it||{};S.sy.me=S.sy.me||uid()}
  if(S.sy)S.sy.fm=S.sy.fm&&typeof S.sy.fm==="object"?S.sy.fm:{};
  S.fam=S.fam&&typeof S.fam==="object"?S.fam:{};FAMC.forEach(c=>{if(!S.fam[c]||typeof S.fam[c]!=="object")S.fam[c]={}});S.dev=S.dev||uid();if(S.icu&&!S.icu.u)S.icu=null;
  S.m=S.m||{};S.pl=S.pl||{};S.ek=S.ek||{};S.bc=S.bc||{};if(!S.fw||!Array.isArray(S.fw.items))S.fw=null;
  Object.values(S.d).forEach(D=>{D.f=D.f||[];D.x=D.x||{};D.h=D.h||[];D.s=D.s||(D.a||[]).map(a=>({n:a,m:0}));delete D.a;
    D.f.forEach(f=>{f.q=f.q||1;if(f.k1==null){f.k1=f.k/f.q;f.p1=(f.p||0)/f.q}})});
  const old=addDays(todayK(),-70);Object.keys(S.ek).forEach(k=>{if(k<old)delete S.ek[k]});
  // Einmalig: alte Einträge und Favoriten aus Rezepten bekommen Kohlenhydrate, Fett und Ballaststoffe
  if(!S.mv){const byN={};S.R.forEach(r=>{if(r.kh!=null)byN[r.n]=r});
    const fill=f=>{const r=byN[f.n];if(r&&f.kh1==null&&Math.abs(r.k-f.k1)<=r.k*.15){f.kh1=r.kh;f.fe1=r.fe;f.bs1=r.bs}};
    Object.values(S.d).forEach(D=>D.f.forEach(fill));S.fav.forEach(fill);S.mv=1}
  if(S.mv<2){S.R.forEach(r=>{if(!r.ic&&RI[r.n])r.ic=RI[r.n]});S.mv=2}
  // Einmalig: fehlende oder sehr knappe Zubereitungen der Standardrezepte ergänzen
  if(S.mv<3){const fixS=new Set(["Apfel + 15 g Mandeln","Magerquark mit Beeren","Gemüsesticks + Hummus","Buttermilch-Beeren-Shake"]);S.R.forEach(r=>{const d=RB.find(x=>x[1]===r.n);if(d&&d[6]&&(!r.s||fixS.has(r.n)&&r.s.length<45))r.s=d[6]});S.mv=3}
}
function load(){try{S=JSON.parse(localStorage.getItem(KEY))}catch(e){S=null}fix()}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){toast("Speichern fehlgeschlagen")}}

const dt=$("dt");dt.value=todayK();
const day=()=>{const k=dt.value||todayK();if(!S.d[k])S.d[k]={f:[],s:[],x:{},h:[]};return S.d[k]};
function shift(n){dt.value=addDays(dt.value||todayK(),n);all()}
$("prev").onclick=()=>shift(-1);$("next").onclick=()=>shift(1);$("today").onclick=()=>{dt.value=todayK();all()};dt.onchange=all;

let view="essen";
document.querySelectorAll("nav button").forEach(b=>b.onclick=()=>show(b.dataset.v));
function show(v){view=v;try{localStorage.setItem(KEY+".tab",v)}catch(e){}document.body.classList.toggle("nohd",v==="fam");document.querySelectorAll("nav button").forEach(b=>b.classList.toggle("on",b.dataset.v===v));document.querySelectorAll(".view").forEach(s=>s.classList.toggle("on",s.id==="v-"+v));window.scrollTo(0,0);
  if(v==="fort"){renderReview();renderWeight()}else if(v==="plan"){renderPlan();syLoop()}else if(v==="essen")renderFood();else if(v==="fam"){calOnShow();renderFam();syLoop();calSubRefresh()}}

// L2: zweite Ebene über einem offenen Sheet (Zutat fürs Rezept auswählen, Formular bleibt darunter erhalten)
let L2=false,pickCb=null;
const SH=()=>L2?{s:$("sheet2"),i:$("sheet2In"),x:"shx2",k:"cb2"}:{s:$("sheet"),i:$("sheetIn"),x:"shx",k:"cb"};
function openSheet(title,html,bind,onClose){runSheetClose();const L=SH();L.i.innerHTML='<div class="hd"><h2>'+title+'</h2><button class="ic" id="'+L.x+'" aria-label="Schließen">✕</button></div>'+html;L.s.classList.add("open");L.i.scrollTop=0;$(L.x).onclick=closeSheet;openSheet[L.k]=onClose||null;if(bind)bind()}
function runSheetClose(){const k=SH().k,c=openSheet[k];openSheet[k]=null;if(c)c()}
function closeSheet(){runSheetClose();SH().s.classList.remove("open");if(L2){L2=false;pickCb=null}}
const sheetOpen=()=>SH().s.classList.contains("open");
$("sheet").onclick=e=>{if(e.target.id==="sheet")closeSheet()};$("sheet2").onclick=e=>{if(e.target.id==="sheet2")closeSheet()};
// Alles neu zeichnen (die einzelnen render…-Funktionen stehen in den Dateien der Tabs)
function all(){renderFood();renderWater();renderSport();renderPlan();renderReview();renderWeight();renderMeasure();renderMore();renderFam()}
