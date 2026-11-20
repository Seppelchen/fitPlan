// FitPlan – Rezeptbuch: alle Rezepte im Vollbild zum Durchblättern, mit Suche, Filtern und A–Z
/* Eigene und mitgelieferte Rezepte (S.R) plus Rezepte der Familie (gemeinsame Auswahl). Antippen öffnet das
   Rezept (Fenster liegt über dem Rezeptbuch), ＋ trägt 1 Portion ein. Android-Zurück schließt das Buch. */
let rbOn=false,rbCat="",rbSort="az";const rbTag=new Set();
// Fleisch/Fisch in Name oder Zutaten → nicht vegetarisch („gehackte Tomaten“ zählt nicht)
const RB_MEAT=/hack|fleisch|schnitzel|speck|schinken|wurst|würstchen|hähnchen|huhn|hühn|pute|\brind|schwein|lachs|fisch|garnele|shrimp|\bente|leber|zunge|keule|salami|bacon|kassler|cordon/i;
const rbVeg=r=>!RB_MEAT.test((r.n+" "+(r.z||[]).join(" ")).toLowerCase().replace(/gehackt\w*|haferschnitzel|sellerieschnitzel|sojaschnetzel/g,""));
const rbFast=r=>{const m=String(r.t||"").match(/^(\d+)\s*Min/);return!!m&&+m[1]<=20&&!/\+|Std|Tag|Nacht|Vorabend/.test(r.t)};
const RB_TAGS=[["veg","🌱 Vegetarisch",r=>rbVeg(r)],["fast","⚡ Bis 20 Min.",r=>rbFast(r)],["light","🪶 Bis 450 kcal",r=>r.k<=450],["sweet","🍬 Süß",r=>r.tg==="s"],["fav","⭐ Favoriten",r=>isFav(r.n)],["fam","👥 Familie",(r,o)=>!!o.ext]];
function rbItems(){const own=S.R.map(r=>({r})),ext=typeof katRecipes==="function"?katRecipes().map(o=>({r:o.r,ext:o})):[];return own.concat(ext)}
function rbOpen(){rbOn=true;$("rbook").classList.add("open");document.body.style.overflow="hidden";$("rbl").scrollTop=0;rbRender();try{history.pushState({rbook:1},"")}catch(e){}}
function rbClose(fromPop){if(!rbOn)return;rbOn=false;$("rbook").classList.remove("open");document.body.style.overflow="";if(!fromPop&&history.state&&history.state.rbook)history.back()}
window.addEventListener("popstate",()=>{if(!rbOn)return;if(sheetOpen()){closeSheet();try{history.pushState({rbook:1},"")}catch(e){}return}rbClose(true)});
function rbRefresh(){if(rbOn)rbRender()}  // nach Änderungen (Rezept gespeichert, gelöscht, übernommen)
function rbRender(){const L=$("rbl"),st=L.scrollTop,all=rbItems(),q=norm($("rbq").value.trim()),w=q.split(/\s+/).filter(Boolean);
  // Mahlzeit
  const C=$("rbcat");C.innerHTML="";[["","Alle"],...CATS.map(c=>[c,c])].forEach(([v,l])=>{const b=el("button",v===rbCat?"on":"",l);b.onclick=()=>{rbCat=v;rbRender();L.scrollTop=0};C.appendChild(b)});
  // Filter (mehrere möglich) und Sortierung
  const T=$("rbtag");T.innerHTML="";RB_TAGS.forEach(([k,l])=>{if(k==="fam"&&!all.some(o=>o.ext))return;const b=el("button",rbTag.has(k)?"on":"",l);b.onclick=()=>{if(rbTag.has(k))rbTag.delete(k);else rbTag.add(k);rbRender();L.scrollTop=0};T.appendChild(b)});
  const sb=el("button","",rbSort==="az"?"↕ A–Z":"↕ Kalorien");sb.onclick=()=>{rbSort=rbSort==="az"?"kcal":"az";rbRender();L.scrollTop=0};T.appendChild(sb);
  const it=all.filter(o=>{const r=o.r;if(rbCat&&r.c!==rbCat)return false;
    for(const [k,,f] of RB_TAGS)if(rbTag.has(k)&&!f(r,o))return false;
    return!w.length||w.every(t=>norm(r.n+" "+(r.z||[]).join(" ")).includes(t))});
  it.sort(rbSort==="az"?(a,b)=>a.r.n.localeCompare(b.r.n,"de"):(a,b)=>a.r.k-b.r.k||a.r.n.localeCompare(b.r.n,"de"));
  $("rbc").textContent=all.length+" Rezepte"+(it.length<all.length?" · "+it.length+(it.length===1?" passt":" passen"):"");
  L.innerHTML="";
  if(!it.length){L.appendChild(el("div","fin",'<div style="font-size:40px">📖</div>Kein Rezept passt.<div class="sm">Filter oder Suche ändern.</div>'));return}
  let g="";it.forEach(o=>{const r=o.r;
    const h=rbSort==="az"?(norm(r.n)[0]||"#").toUpperCase():r.k<=300?"Bis 300 kcal":r.k<=450?"300–450 kcal":r.k<=600?"450–600 kcal":"Über 600 kcal";
    if(h!==g){g=h;L.appendChild(el("div","sec",esc(h)))}
    const row=el("div","row",'<span class="fi">'+esc(o.ext?r.ic:icOf(r))+'</span><div class="t" style="cursor:pointer">'+esc(r.n)+(r.tg==="s"?'<span class="bdg s">süß</span>':'')+(rbVeg(r)?'<span class="bdg">veg</span>':'')+(isFav(r.n)?' ⭐':'')+
      '<div class="sm">'+esc(r.c)+' · '+mline(r.k,r.p,r.kh,r.fe)+(r.t?' · '+esc(r.t):'')+(r.pz>1?' · '+r.pz+' Portionen':'')+(o.ext?' · 👥 '+esc(o.ext.who||"von deinem anderen Gerät"):'')+'</div></div><button class="ic" aria-label="Eintragen">＋</button>');
    row.querySelector(".t").onclick=row.querySelector(".fi").onclick=()=>o.ext?extRecipe(o.ext):recipeDetail(r.id);
    row.querySelector("button").onclick=()=>{if(o.ext)logFood(mkEntry(r.n,r.k,r.p,guessMeal(),1,r));else addRecipe(r,1,dt.value===todayK()?guessMeal():r.c)};
    L.appendChild(row)});
  L.scrollTop=st}
$("rbo").onclick=rbOpen;$("rbx").onclick=()=>rbClose();$("rbq").oninput=()=>{rbRender();$("rbl").scrollTop=0};
