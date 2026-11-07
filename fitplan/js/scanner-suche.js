// FitPlan – Barcode-Scanner (Open Food Facts) und Lebensmittelsuche
/* ---------- Barcode ---------- */
let cam=null,zx=null;
function stopCam(){if(cam){cam.stop=true;if(cam.st)cam.st.getTracks().forEach(t=>t.stop());cam=null}}
function loadZX(){return zx||(zx=new Promise((ok,no)=>{if(window.ZXing)return ok();const s=document.createElement("script");s.src="zxing.min.js";s.onload=ok;s.onerror=()=>{zx=null;no(new Error("load"))};document.head.appendChild(s)}))}
async function makeDetector(){
  if("BarcodeDetector" in window){try{const f=await BarcodeDetector.getSupportedFormats();if(f.includes("ean_13")){const bd=new BarcodeDetector({formats:["ean_13","ean_8","upc_a","upc_e"].filter(x=>f.includes(x))});return async v=>{const r=await bd.detect(v);return r[0]?r[0].rawValue:null}}}catch(e){}}
  await loadZX();const Z=window.ZXing,h=new Map();
  h.set(Z.DecodeHintType.POSSIBLE_FORMATS,[Z.BarcodeFormat.EAN_13,Z.BarcodeFormat.EAN_8,Z.BarcodeFormat.UPC_A,Z.BarcodeFormat.UPC_E]);
  const rd=new Z.MultiFormatReader();rd.setHints(h);const cv=document.createElement("canvas"),cx=cv.getContext("2d",{willReadFrequently:true});let n=0;
  return v=>{const vw=v.videoWidth,vh=v.videoHeight;if(!vw||!vh)return null;
    const sw=vw*.92,sh=vh*.5,sc=Math.min(1,960/sw);cv.width=Math.round(sw*sc);cv.height=Math.round(sh*sc);
    cx.drawImage(v,(vw-sw)/2,(vh-sh)/2,sw,sh,0,0,cv.width,cv.height);
    const src=new Z.HTMLCanvasElementLuminanceSource(cv),bin=(n++%2)?new Z.HybridBinarizer(src):new Z.GlobalHistogramBinarizer(src);
    try{return rd.decodeWithState(new Z.BinaryBitmap(bin)).getText()}catch(e){return null}finally{rd.reset()}}}
async function startCam(){const st=$("cst");
  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){st.textContent="Die Kamera ist hier nicht verfügbar. Gib die Nummer unten ein.";return}
  const me={stop:false};cam=me;
  try{me.st=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:"environment"},width:{ideal:1280},height:{ideal:720}},audio:false})}
  catch(e){if(cam===me)cam=null;if(!me.stop)st.textContent=e&&e.name==="NotAllowedError"?"Kein Kamerazugriff. Erlaube die Kamera (iPhone: Einstellungen → Safari → Kamera) oder gib die Nummer unten ein.":"Die Kamera konnte nicht gestartet werden. Gib die Nummer unten ein.";return}
  if(me.stop){me.st.getTracks().forEach(t=>t.stop());return}
  const v=$("cv");v.srcObject=me.st;try{await v.play()}catch(e){}
  let detect;try{detect=await makeDetector()}catch(e){if(!me.stop)st.textContent="Der Scanner konnte nicht geladen werden. Gib die Nummer unten ein.";return}
  if(me.stop)return;st.textContent="Halte den Barcode waagerecht in den Rahmen …";
  const loop=async()=>{if(me.stop)return;let c=null;if(v.readyState>=2){try{c=await detect(v)}catch(e){}}
    if(me.stop)return;if(c){stopCam();if(navigator.vibrate)navigator.vibrate(60);lookup(c);return}setTimeout(loop,120)};loop()}
function scanSheet(){openSheet("Barcode scannen",
  '<div class="cam"><video id="cv" playsinline muted autoplay></video><div class="fr"></div><div class="ln"></div></div><p class="sm" id="cst" style="margin:8px 0 0">Kamera wird gestartet …</p>'+
  '<label class="f">Oder Nummer unter dem Barcode eintippen</label><div style="display:flex;gap:8px"><input id="bcn" inputmode="numeric" placeholder="4001234567890"><button class="pri" id="bcs">Suchen</button></div><p class="err" id="bce"></p>',
  ()=>{startCam();$("bcn").oninput=()=>$("bce").textContent="";
    $("bcs").onclick=()=>{const c=$("bcn").value.replace(/\D/g,"");if(c.length<8||c.length>14){$("bce").textContent="Gib die 8- oder 13-stellige Nummer ein.";return}lookup(c)};
    $("bcn").onkeydown=e=>{if(e.key==="Enter")$("bcs").click()}},stopCam)}
$("scan").onclick=scanSheet;
function offParse(p){const n=p.nutriments||{},f=v=>{const x=parseFloat(v);return isFinite(x)?x:null},r1=x=>x==null?null:Math.round(x*10)/10;
  let k=f(n["energy-kcal_100g"]);if(k==null){const kj=f(n["energy-kj_100g"])??f(n.energy_100g);if(kj!=null)k=kj/4.184}
  const name=String(p.product_name_de||p.product_name||p.generic_name||"").trim(),br=String((Array.isArray(p.brands)?p.brands[0]:p.brands)||"").split(",")[0].trim();
  return{n:(name||"Produkt")+(br&&!name.toLowerCase().includes(br.toLowerCase())?" ("+br+")":""),k:k==null?null:Math.round(k),p:Math.round((f(n.proteins_100g)||0)*10)/10,kh:r1(f(n.carbohydrates_100g)),zu:r1(f(n.sugars_100g)),fe:r1(f(n.fat_100g)),bs:r1(f(n.fiber_100g)),
    u:/\d\s*(ml|cl|l)\b/i.test(p.quantity||"")?"ml":"g",sq:f(p.serving_quantity)>0?Math.round(f(p.serving_quantity)):null}}
async function lookup(code){if(code.length===12)code="0"+code;const lay=L2,alive=()=>L2===lay&&sheetOpen();
  if(S.bc[code]){productSheet(code);if(S.bc[code].kh===undefined&&navigator.onLine)refreshMac(code);return}
  openSheet("Produkt wird gesucht …",'<p class="sm" style="margin:0">Barcode '+esc(code)+' – frage Open Food Facts …</p>');
  if(!navigator.onLine){manualProduct(code,"Keine Internetverbindung. Trag die Werte von der Packung ein – beim nächsten Scan kennt FitPlan das Produkt.");return}
  let msg;
  try{const ctl=new AbortController(),t=setTimeout(()=>ctl.abort(),9000);
    const r=await offFetch(code,ctl.signal);clearTimeout(t);
    const j=r.ok||r.status===404?await r.json():null,p=j&&j.status===1&&j.product;
    if(!alive())return;
    if(p){const o=offParse(p);if(o.k!=null){S.bc[code]=o;save();productSheet(code);return}msg="Für dieses Produkt fehlen die Nährwerte. Bitte von der Packung ergänzen.";manualProduct(code,msg,o);return}
    msg=j?"Dieses Produkt ist bei Open Food Facts noch nicht bekannt. Trag die Werte von der Packung ein.":"Open Food Facts antwortet gerade nicht. Trag die Werte von der Packung ein."}
  catch(e){msg="Das Produkt konnte nicht geladen werden (keine Verbindung?). Trag die Werte von der Packung ein."}
  if(alive())manualProduct(code,msg)}
const offFetch=(code,signal)=>fetch("https://world.openfoodfacts.org/api/v2/product/"+code+".json?fields=product_name,product_name_de,generic_name,brands,nutriments,serving_quantity,quantity",{signal});
// Produkte, die vor den Kohlenhydraten gespeichert wurden, still nachladen
async function refreshMac(code){try{const r=await offFetch(code);if(!r.ok)return;const j=await r.json(),p=j&&j.status===1&&j.product,o=S.bc[code];if(!p||!o)return;
  const x=offParse(p);["kh","zu","fe","bs"].forEach(c=>{if(o[c]==null)o[c]=x[c]});save();
  const I=$("pinfo");if(I&&I.dataset.code===code){I.innerHTML=pinfo(o);amountSheet.up()}}catch(e){}}
const pinfo=o=>'pro 100 '+o.u+': '+fmt(o.k)+' kcal · Eiweiß '+d1(o.p)+' g'+(o.kh!=null?' · Kohlenhydrate '+d1(o.kh)+' g'+(o.zu!=null?' (davon Zucker '+d1(o.zu)+' g)':''):'')+(o.fe!=null?' · Fett '+d1(o.fe)+' g':'')+(o.bs!=null?' · Ballaststoffe '+d1(o.bs)+' g':'');
function productSheet(code){amountSheet(S.bc[code],{code})}
// Menge wählen und eintragen – oder bei pickCb als Zutat ans Rezept geben
function amountSheet(o,op){op=op||{};const code=op.code,pk=!!pickCb,a0=o.lastA||o.sq||100;
  openSheet(pk?"Zutat":"Produkt",(op.back?'<button id="pbk" style="margin:0 0 10px;font-size:14px;padding:5px 12px">‹ Zurück zur Suche</button>':'')+
  '<div style="display:flex;gap:10px;align-items:center"><span class="fi">'+icOf(o)+'</span><b>'+esc(o.n)+'</b></div><p class="sm" id="pinfo" data-code="'+esc(code||"")+'" style="margin:2px 0 4px">'+pinfo(o)+'</p>'+
  '<label class="f">Menge ('+o.u+')</label><input id="pa" type="number" inputmode="decimal" value="'+a0+'"><div class="chips" id="pac" style="margin:8px 0"></div>'+
  '<div class="g2"><div class="mc"><div class="sm">Kalorien</div><b id="pk"></b></div><div class="mc"><div class="sm">Eiweiß</div><b id="pp"></b></div></div>'+mt3("pm_")+
  (pk?'':'<label class="f">Mahlzeit</label>'+mealSel("pm",guessMeal())+
  '<label style="display:flex;gap:8px;align-items:center;margin-top:12px;font-size:15px"><input type="checkbox" id="pf" style="width:auto"> Mit dieser Menge als Favorit merken</label>')+
  '<button class="full pri" id="pok" style="margin-top:12px">'+(pk?'＋ Zum Rezept hinzufügen':'＋ Eintragen')+'</button><p class="err" id="pe"></p>'+
  (code?'<div class="g2" style="margin-top:8px"><button id="ped">Werte korrigieren</button><button id="pscan">'+(pk?'Andere scannen':'Nächster Scan')+'</button></div><p class="sm" style="margin:10px 0 0">Barcode '+esc(code)+' · Nährwerte: Open Food Facts bzw. eigene Angabe</p>'
    :'<p class="sm" style="margin:10px 0 0">Durchschnittswerte – je nach Sorte und Marke etwas anders. Für Markenprodukte lieber den Barcode scannen.</p>'),
  ()=>{const ch=[...(o.sq?[o.sq]:[]),50,100,150,200].filter((x,i,a)=>a.indexOf(x)===i);
    $("pac").innerHTML=ch.map(x=>'<button data-a="'+x+'">'+(x===o.sq?(o.sl||"Portion")+" · ":"")+fmt(x)+' '+o.u+'</button>').join("");
    const up=()=>{const v=num($("pa").value);$("pk").textContent=v>0?fmt(o.k*v/100)+" kcal":"–";$("pp").textContent=v>0?d1(o.p*v/100)+" g":"–";mt3set("pm_",c=>v>0&&o[c]!=null?o[c]*v/100:null,d1);$("pac").querySelectorAll("button").forEach(b=>b.classList.toggle("on",+b.dataset.a===v))};
    $("pac").querySelectorAll("button").forEach(b=>b.onclick=()=>{$("pa").value=b.dataset.a;$("pe").textContent="";up()});
    $("pa").oninput=()=>{$("pe").textContent="";up()};up();amountSheet.up=up;
    $("pok").onclick=()=>{const v=num($("pa").value);if(!(v>0&&v<5000)){$("pe").textContent="Gib die Menge ein.";return}
      o.lastA=v;const pv=c=>o[c]!=null?o[c]*v/100:null;
      if(pk){const cb=pickCb,r1=x=>x==null?null:Math.round(x*10)/10;if(code)save();closeSheet();
        cb({n:o.n,a:v,u:o.u,z:/^1 Stück/.test(o.sl||"")&&o.sq&&Number.isInteger(v/o.sq)?(v/o.sq)+" "+o.n:nf(v)+" "+o.u+" "+o.n,k:r1(o.k*v/100),p:r1(o.p*v/100),kh:r1(pv("kh")),fe:r1(pv("fe")),bs:r1(pv("bs"))});return}
      const e=mkEntry(o.n+" · "+nf(v)+" "+o.u,o.k*v/100,o.p*v/100,$("pm").value,1,{kh:pv("kh"),fe:pv("fe"),bs:pv("bs")});
      if($("pf").checked&&!isFav(e.n))S.fav.push(favOf(e));
      closeSheet();logFood(e)};
    if(op.back)$("pbk").onclick=op.back;
    if(code){$("ped").onclick=()=>manualProduct(code,"",o);$("pscan").onclick=scanSheet}})}

/* ---------- Lebensmittel-Suche ---------- */
const norm=s=>String(s).toLowerCase().replace(/ä/g,"a").replace(/ö/g,"o").replace(/ü/g,"u").replace(/ß/g,"ss");
const hit=(n,w)=>{const x=norm(n);return w.every(t=>x.includes(t))};
function fdFind(q){const w=norm(q).split(/\s+/).filter(Boolean);if(!w.length)return[];
  return FD.filter(o=>hit(o.n,w)).sort((a,b)=>(norm(a.n).startsWith(w[0])?0:1)-(norm(b.n).startsWith(w[0])?0:1)||a.n.length-b.n.length)}
const offCache={};
async function offSearch(q,signal){if(offCache[q])return offCache[q];
  const F="code,product_name,product_name_de,generic_name,brands,nutriments,quantity,serving_quantity";let hits=null;
  try{const r=await fetch("https://search.openfoodfacts.org/search?q="+encodeURIComponent(q)+"&langs=de&page_size=30&fields="+F,{signal});if(r.ok){const j=await r.json();if(Array.isArray(j.hits))hits=j.hits}}
  catch(e){if(e.name==="AbortError")throw e}
  if(!hits){const r=await fetch("https://world.openfoodfacts.org/cgi/search.pl?search_terms="+encodeURIComponent(q)+"&search_simple=1&action=process&json=1&page_size=30&tagtype_0=countries&tag_contains_0=contains&tag_0=germany&fields="+F,{signal});
    if(!r.ok)throw new Error("http "+r.status);const j=await r.json();hits=j.products||[]}
  const out=[],seen=new Set();
  hits.forEach(p=>{const c=String(p.code||"");if(!/^\d{8,14}$/.test(c)||seen.has(c))return;const o=offParse(p);if(o.k==null||o.n==="Produkt")return;seen.add(c);out.push({c,o})});
  return offCache[q]=out.slice(0,20)}
function foodSearch(q0){let tm=null,ctl=null,cur=q0||"";
  openSheet(pickCb?"Zutat hinzufügen":"Lebensmittel suchen",
  '<div style="display:flex;gap:8px"><input id="fq" type="search" enterkeyhint="search" autocomplete="off" placeholder="z. B. Apfel, Skyr, Vollkornbrot" value="'+esc(q0||"")+'"><button id="fqs" aria-label="Barcode scannen">📷</button></div>'+
  '<div id="fres"></div><div id="fres2"></div><p class="sm" id="fon" style="margin:10px 0 0"></p>',
  ()=>{const back=()=>foodSearch(cur);
    const row=(o,go)=>{const r=el("div","row",'<span class="fi">'+icOf(o)+'</span><div class="t">'+esc(o.n)+'<div class="sm">100 '+o.u+': '+mline(o.k,o.p,o.kh,o.fe)+'</div></div><span class="sm" style="font-size:20px">›</span>');r.style.cursor="pointer";r.onclick=go;return r};
    const sec=(B,t,items)=>{if(!items.length)return;B.appendChild(el("p","lb",t)).style.margin="12px 0 0";items.forEach(x=>B.appendChild(x))};
    const online=async q=>{const on=$("fon"),B=$("fres2");if(ctl)ctl.abort();const my=ctl=new AbortController(),to=setTimeout(()=>my.abort(),10000);
      on.textContent="Suche bei Open Food Facts …";
      try{const res=await offSearch(q,my.signal);if(my!==ctl||!$("fres2"))return;B.innerHTML="";
        sec(B,"Markenprodukte (Open Food Facts)",res.map(({c,o})=>row(o,()=>{if(!S.bc[c]){S.bc[c]=o;save()}amountSheet(S.bc[c],{code:c,back})})));
        on.textContent=res.length?"Werte von Open Food Facts – von Nutzern gepflegt, bei Zweifel mit der Packung vergleichen.":"Online nichts gefunden. Probier ein anderes Wort oder scanne den Barcode."}
      catch(e){if(my!==ctl||!$("fon"))return;on.textContent=e.name==="AbortError"?"Open Food Facts antwortet gerade nicht. Versuch es gleich noch mal oder scanne den Barcode.":"Die Online-Suche hat nicht geklappt (keine Verbindung?)."}
      finally{clearTimeout(to)}};
    const draw=()=>{const q=cur=$("fq").value.trim(),w=norm(q).split(/\s+/).filter(Boolean),A=$("fres");A.innerHTML="";$("fres2").innerHTML="";clearTimeout(tm);if(ctl){ctl.abort();ctl=null}
      const mine=Object.entries(S.bc).filter(([c,o])=>!w.length||hit(o.n,w)).reverse().slice(0,8);
      sec(A,"Grundnahrungsmittel",fdFind(q).slice(0,12).map(o=>row(o,()=>amountSheet(o,{back}))));
      sec(A,q?"Deine Produkte":"Zuletzt gescannt oder gefunden",mine.map(([c,o])=>row(o,()=>amountSheet(o,{code:c,back}))));
      const on=$("fon");
      if(q.length<3){on.textContent=q?"":"Obst, Gemüse und andere Grundnahrungsmittel findest du auch ohne Internet. Markenprodukte sucht FitPlan online – oder du scannst den Barcode.";return}
      if(!navigator.onLine){on.textContent=(A.children.length?"":"Nichts gefunden. ")+"Offline – Markenprodukte gibt es nur mit Internet.";return}
      on.textContent="";tm=setTimeout(()=>online(q),700)};
    $("fq").oninput=draw;$("fq").onkeydown=e=>{if(e.key==="Enter"){e.preventDefault();const q=$("fq").value.trim();$("fq").blur();if(q.length>=2&&navigator.onLine){clearTimeout(tm);online(q)}}};
    $("fqs").onclick=scanSheet;draw();if(!q0)setTimeout(()=>{const i=$("fq");if(i)i.focus()},60)},()=>{clearTimeout(tm);if(ctl)ctl.abort()})}
$("fsrch").onclick=()=>foodSearch();
function manualProduct(code,msg,pre){pre=pre||{};
  openSheet("Produkt eintragen",(msg?'<p class="sm" style="margin:0 0 4px">'+esc(msg)+'</p>':'')+
  '<label class="f">Name</label><input id="mn" value="'+esc(pre.n||"")+'" placeholder="z. B. Skyr Natur">'+
  '<div class="g2"><div><label class="f">kcal pro 100 g/ml</label><input id="mk" type="number" inputmode="decimal" value="'+(pre.k??"")+'"></div>'+
  '<div><label class="f">Eiweiß g pro 100</label><input id="mp" inputmode="decimal" value="'+(pre.p!=null?String(pre.p).replace(".",","):"")+'"></div>'+
  [["kh","Kohlenhydrate g"],["zu","davon Zucker g"],["fe","Fett g"],["bs","Ballaststoffe g"]].map(([c,l])=>'<div><label class="f">'+l+'</label><input id="m_'+c+'" inputmode="decimal" value="'+(pre[c]!=null?String(pre[c]).replace(".",","):"")+'"></div>').join("")+
  '<div><label class="f">Einheit</label><select id="mu"><option value="g">Gramm (g)</option><option value="ml"'+(pre.u==="ml"?' selected':'')+'>Milliliter (ml)</option></select></div>'+
  '<div><label class="f">Portion (optional)</label><input id="ms" type="number" inputmode="decimal" value="'+(pre.sq||"")+'" placeholder="z. B. 150"></div></div>'+
  '<button class="full pri" id="msv" style="margin-top:14px">Speichern und weiter</button><p class="err" id="mer"></p><p class="sm" style="margin:8px 0 0">Barcode '+esc(code)+' · wird nur auf diesem Gerät gespeichert.</p>',
  ()=>{["mn","mk"].forEach(i=>$(i).oninput=()=>$("mer").textContent="");
    $("msv").onclick=()=>{const n=$("mn").value.trim(),k=num($("mk").value),sq=num($("ms").value);
      if(!n){$("mer").textContent="Gib einen Namen ein.";return}
      if(!(k>=0&&k<1000)){$("mer").textContent="Gib die kcal pro 100 g ein (steht auf der Packung).";return}
      S.bc[code]={n,k:Math.round(k),p:Math.round((num($("mp").value)||0)*10)/10,kh:nn($("m_kh").value),zu:nn($("m_zu").value),fe:nn($("m_fe").value),bs:nn($("m_bs").value),u:$("mu").value,sq:sq>0?Math.round(sq):null,lastA:pre.lastA};save();productSheet(code)}})}
