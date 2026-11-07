// FitPlan – Tab Mehr: Ziele, Sicherung exportieren/importieren, Zurücksetzen
/* ---------- Mehr / Daten ---------- */
function renderMore(){$("gk").value=S.g.k;["kh","fe","bs"].forEach(c=>$("g"+c).value=S.g[c]||"");$("gp").value=S.g.pz;$("gw").value=S.g.ml;$("gs").value=String(S.g.s).replace(".",",");$("gz").value=String(S.g.z).replace(".",",");
  const le=$("lastExp");if(S.lastExp){const days=Math.floor((Date.now()-new Date(S.lastExp))/864e5);le.textContent="Letzte Sicherung: "+new Date(S.lastExp).toLocaleDateString("de-DE")+(days>=14?" – Zeit für eine neue":"");le.style.color=days>=14?"var(--warn)":""}
  else{le.textContent="Noch keine Sicherung erstellt.";le.style.color="var(--warn)"}
  const nb=Object.keys(S.bc).length;$("bccount").textContent=nb?nb+(nb===1?" Produkt":" Produkte")+" gespeichert.":""}
$("gsave").onclick=()=>{const k=parseInt($("gk").value),p=parseInt($("gp").value),w=parseInt($("gw").value),s=num($("gs").value),z=num($("gz").value);
  if(k>=800&&k<=5000)S.g.k=k;if(w>=500&&w<=6000)S.g.ml=w;if(p>0&&p<400)S.g.pz=p;if(s>30&&s<300)S.g.s=s;if(z>30&&z<300)S.g.z=z;
  ["kh","fe","bs"].forEach(c=>{const v=parseInt($("g"+c).value);S.g[c]=v>0&&v<1000?v:0});save();all();toast("Ziele gespeichert")};
function doExport(){const name="fitplan-sicherung-"+todayK()+".json";
  const data=JSON.stringify({app:"FitPlan",version:1,exportiert:new Date().toISOString(),daten:{...S,sy:undefined,fam:SY()?SY().fm||{}:S.fam}});
  const file=new File([data],name,{type:"application/json"});
  const done=()=>{S.lastExp=new Date().toISOString();save();renderMore();renderBackup();toast("Sicherung erstellt")};
  const dl=()=>{const a=document.createElement("a");a.href=URL.createObjectURL(file);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1500);done()};
  if(navigator.canShare&&navigator.canShare({files:[file]}))navigator.share({files:[file],title:"FitPlan-Sicherung"}).then(done).catch(e=>{if(e.name!=="AbortError")dl()});else dl()}
$("exp").onclick=doExport;$("bkn").onclick=doExport;
$("imp").onclick=()=>{$("derr").textContent="";$("impf").click()};
$("impf").onchange=e=>{const f=e.target.files[0];if(!f)return;const rd=new FileReader();
  rd.onload=()=>{try{let x=JSON.parse(rd.result);if(x&&x.daten)x=x.daten;if(!x||typeof x.d!=="object"||typeof x.w!=="object")throw 0;
    if(!confirm("Die aktuellen Daten auf diesem Gerät werden durch die Sicherung ersetzt. Fortfahren?"))return;
    const sy=S.sy;S=x;S.sy=sy;fix();syMigrate();save();all();toast("Daten importiert")}catch(err){$("derr").textContent="Die Datei ist keine gültige FitPlan-Sicherung."}finally{$("impf").value=""}};
  rd.readAsText(f)};
$("reset").onclick=()=>{if(!confirm("Wirklich alle Daten auf diesem Gerät löschen? Das lässt sich nicht rückgängig machen."))return;
  localStorage.removeItem(KEY);S=null;fix();save();all();toast("Daten gelöscht")};
