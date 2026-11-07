// FitPlan – Tab Fortschritt: Wochenrückblick, Gewicht, Prognose, Körpermaße
/* ---------- Fortschritt ---------- */
const wKeys=()=>Object.keys(S.w).sort();
function trendAt(k){const a=addDays(k,-6),v=Object.keys(S.w).filter(x=>x>=a&&x<=k).map(x=>S.w[x]);return v.length?v.reduce((s,x)=>s+x,0)/v.length:null}
function wRate(){const ks=wKeys();if(ks.length<3)return null;const last=ks[ks.length-1];let use=ks.filter(k=>k>=addDays(last,-27));
  if(use.length<3||dayDiff(use[0],last)<10)use=ks;if(dayDiff(use[0],last)<10)return null;
  const xs=use.map(k=>dayDiff(use[0],k)),ys=use.map(k=>S.w[k]),n=xs.length,mx=xs.reduce((a,b)=>a+b)/n,my=ys.reduce((a,b)=>a+b)/n;
  let sxy=0,sxx=0;xs.forEach((x,i)=>{sxy+=(x-mx)*(ys[i]-my);sxx+=(x-mx)*(x-mx)});return sxx?sxy/sxx*7:null}
function streak(){let k=dt.value;if(!(S.d[k]&&S.d[k].f.length))k=addDays(k,-1);let n=0;
  for(;;){const X=S.d[k];if(!X||!X.f.length||sumK(X.f)>S.g.k)break;n++;k=addDays(k,-1)}return n}
function renderReview(){const end=dt.value,G=S.g.k,days=[];
  for(let i=6;i>=0;i--){const k=addDays(end,-i),D=S.d[k]||{f:[],h:[],s:[]};const t=macSum(D.f);days.push({k,ms:CATS.map(c=>sumK(D.f.filter(f=>f.m===c))),mo:sumK(D.f.filter(f=>!CATS.includes(f.m))),any:t.any,log:D.f.length>0,kc:t.k,pr:t.p,kh:t.kh,fe:t.fe,bs:t.bs,w:D.h.reduce((a,h)=>a+h.ml,0),s:D.s})}
  const lg=days.filter(d=>d.log),n=lg.length;
  $("rvr").textContent=dd(days[0].k)+" – "+dd(end);
  const mx=Math.max(G*1.25,...days.map(d=>d.kc));
  const MD=[["k","Kalorien"],["m","Mahlzeiten"],["n","Nährstoffe"]],ME=[["mE","Eiweiß"],["mK","Kohlenhydrate"],["mF","Fett"]];
  $("rvm").innerHTML="";MD.forEach(([v,l])=>{const b=el("button",v===rvMode?"on":"",l);b.onclick=()=>{rvMode=v;renderReview()};$("rvm").appendChild(b)});
  const segs=d=>{if(rvMode==="m")return[...CATS.map((c,i)=>[d.ms[i],"var(--s"+(i+1)+")",c]),[d.mo,"var(--muted)","Sonstiges"]];
    if(rvMode==="n"){const e=[d.pr*4,d.kh*4,d.fe*9],tot=e[0]+e[1]+e[2];return d.any&&tot?ME.map((x,i)=>[e[i]/tot*d.kc,"var(--"+x[0]+")",x[1]]):[[d.kc,"var(--muted)","ohne Nährwerte"]]}
    return[[d.kc,d.kc>G?"var(--warn)":"var(--accent)","Kalorien"]]};
  $("rvc").innerHTML='<div class="gl" style="bottom:'+(G/mx*100)+'%"></div>'+days.map((d,i)=>'<div class="col'+(d.k===rvSel?' on':'')+'" data-i="'+i+'">'+(d.log?segs(d).filter(x=>x[0]>0).reverse().map(x=>'<div class="sg" style="height:'+(x[0]/mx*100)+'%;background:'+x[1]+'" title="'+esc(x[2])+': '+fmt(x[0])+' kcal"></div>').join(""):'')+'</div>').join("");
  $("rvl").innerHTML=days.map(d=>'<span'+(d.k===end?' style="font-weight:600;color:var(--text)"':'')+'>'+wd(d.k)+'</span>').join("");
  const dot=c=>'<span class="dot" style="background:var(--'+c+')"></span>';
  $("rvlg").innerHTML=rvMode==="m"?CATS.map((c,i)=>'<span style="white-space:nowrap">'+dot("s"+(i+1))+c+'</span>').join(" &nbsp;"):rvMode==="n"?ME.map(x=>'<span style="white-space:nowrap">'+dot(x[0])+x[1]+'</span>').join(" &nbsp;"):'<span style="color:var(--ok)">┅</span> Kalorienziel '+fmt(G)+' kcal';
  const info=d=>{if(!d.log)return wd(d.k)+" "+dd(d.k)+": nichts eingetragen";const h=wd(d.k)+" "+dd(d.k)+": ";
    if(rvMode==="m")return h+CATS.map((c,i)=>d.ms[i]?c+" "+fmt(d.ms[i]):"").filter(Boolean).concat(d.mo?["Sonstiges "+fmt(d.mo)]:[]).join(" · ")+" = "+fmt(d.kc)+" kcal";
    if(rvMode==="n")return h+(d.any?"Eiweiß "+fmt(d.pr)+" g · Kohlenhydrate "+fmt(d.kh)+" g · Fett "+fmt(d.fe)+" g":"keine Nährwerte")+" ("+fmt(d.kc)+" kcal)";
    return h+fmt(d.kc)+" kcal"+(d.kc>G?" – "+fmt(d.kc-G)+" über dem Ziel":" – im Ziel")};
  const sel=days.find(d=>d.k===rvSel);$("rvt").textContent=sel?info(sel):"Tippe auf einen Tag für Details.";
  $("rvc").querySelectorAll(".col").forEach(c=>c.onclick=()=>{const d=days[+c.dataset.i];rvSel=rvSel===d.k?null:d.k;renderReview()});
  const avg=f=>n?fmt(lg.reduce((a,d)=>a+f(d),0)/n):"–",sp=days.reduce((a,d)=>a+d.s.length,0),spm=days.reduce((a,d)=>a+d.s.reduce((b,s)=>b+(s.m||0),0),0);
  const sk=lg.reduce((a,d)=>a+d.kc,0),pct=f=>sk?Math.round(lg.reduce((a,d)=>a+f(d),0)/sk*100)+" % der kcal":"";
  const t1=trendAt(end),t0=trendAt(addDays(end,-7)),wd7=t1!=null&&t0!=null?t1-t0:null,st=streak();
  const tile=(l,v,s,c)=>'<div class="mc"><div class="sm">'+l+'</div><div class="v"'+(c?' style="color:'+c+'"':'')+'>'+v+'</div>'+(s?'<div class="sm">'+s+'</div>':'')+'</div>';
  $("rvs").innerHTML=
    tile("Ø Kalorien",avg(d=>d.kc)+(n?" kcal":""),n+" von 7 Tagen erfasst")+
    tile("Ø Eiweiß",avg(d=>d.pr)+(n?" g":""),"Ziel "+fmt(S.g.pz)+" g")+
    tile("Im Kalorienziel",lg.filter(d=>d.kc<=G).length+" / "+n,"Tage",n&&lg.every(d=>d.kc<=G)?"var(--ok)":"")+
    tile("Eiweißziel erreicht",lg.filter(d=>d.pr>=S.g.pz).length+" / "+n,"Tage")+
    tile("Ø Kohlenhydrate",avg(d=>d.kh)+(n?" g":""),S.g.kh?"Ziel "+fmt(S.g.kh)+" g":pct(d=>d.kh*4))+
    tile("Ø Fett",avg(d=>d.fe)+(n?" g":""),S.g.fe?"Ziel "+fmt(S.g.fe)+" g":pct(d=>d.fe*9))+
    tile("Ø Ballaststoffe",avg(d=>d.bs)+(n?" g":""),S.g.bs?"Ziel mind. "+fmt(S.g.bs)+" g":"")+
    tile("Ø Eiweiß-Anteil",n?pct(d=>d.pr*4).replace(" der kcal",""):"–","der Kalorien")+
    tile("Wasserziel erreicht",days.filter(d=>d.w>=S.g.ml).length+" / 7","Tage")+
    tile("Sport",sp+"×",fmt(spm)+" Min.")+
    tile("Gewicht (Trend)",wd7==null?"–":(wd7>0?"+":"")+d1(wd7)+" kg","zur Vorwoche",wd7==null?"":wd7<=0?"var(--ok)":"var(--warn)")+
    tile("Serie",st?"🔥 "+st+" "+(st===1?"Tag":"Tage"):"–",st?"in Folge im Kalorienziel":"Heute starten!")}

function renderWeight(){const ks=wKeys(),st=S.g.s,zl=S.g.z;const now=ks.length?S.w[ks[ks.length-1]]:st;const done=Math.max(0,st-now),tot=Math.max(.1,st-zl);
  $("wnow").textContent=d1(now)+" kg";$("wdone").textContent=d1(done)+" kg";$("wbar").style.width=Math.min(100,done/tot*100)+"%";
  const tn=ks.length?trendAt(ks[ks.length-1]):null;$("wavg").textContent=tn!=null&&ks.length>1?"7-Tage-Schnitt "+d1(tn)+" kg":"";
  $("wrest").textContent=now>zl?"Noch "+d1(now-zl)+" kg bis "+d1(zl)+" kg":"Ziel erreicht!";
  const rg=$("wrg");rg.innerHTML="";[[30,"30 Tage"],[90,"90 Tage"],[0,"Alle"]].forEach(([v,l])=>{const b=el("button",v===wr?"on":"",l);b.onclick=()=>{wr=v;renderWeight()};rg.appendChild(b)});
  const r=wRate();let fc="Ab etwa 2 Wochen Messungen";
  if(r!=null){const last=ks[ks.length-1],t=trendAt(last);
    if(t<=zl)fc="Ziel erreicht 🎉";else if(r>-.05)fc="Bei gleichbleibendem Trend noch nicht absehbar";
    else{const w=(t-zl)/-r;fc=w>156?"In mehr als 3 Jahren":"ca. "+new Date(addDays(last,Math.round(w*7))+"T12:00").toLocaleDateString("de-DE",{month:"long",year:"numeric"})}}
  const F=$("wfc");F.innerHTML="";
  if(r!=null&&r<=-.05){const last=ks[ks.length-1],t=trendAt(last);
    if(t>zl){const st=[];let m=Math.floor(t/5)*5;if(t-m<1)m-=5;while(m>zl+.5&&st.length<3){st.push(m);m-=5}st.push(zl);
      const when=v=>{const w=(t-v)/-r;if(w>156)return"in über 3 Jahren";const k=addDays(last,Math.round(w*7));
        return"ca. "+new Date(k+"T12:00").toLocaleDateString("de-DE",{day:"numeric",month:"short",year:"numeric"})+" · in "+(w<2?Math.max(1,Math.round(w*7))+" Tagen":Math.round(w)+" Wochen")};
      F.innerHTML='<p class="lb" style="margin:4px 0 0">Prognose bei deinem Tempo</p>'+st.map(v=>'<div class="row" style="padding:7px 0"><div class="t">'+(v===zl?'🎯 Ziel ':'')+d1(v)+' kg</div><div class="sm" style="text-align:right">'+when(v)+'</div></div>').join("")+
        '<p class="sm" style="margin:4px 0 8px">'+(r<-1.2?"Du nimmst gerade mehr als 1 kg pro Woche ab – empfohlen sind etwa 0,5–1 kg. Achte auf genug Eiweiß und iss nicht zu wenig. ":"")+"Berechnet aus deinem Verlauf der letzten 4 Wochen – je regelmäßiger du wiegst, desto genauer.</p>"}}
  $("wtr").innerHTML='<div class="mc"><div class="sm">Trend pro Woche</div><div class="v"'+(r!=null?' style="color:'+(r<=0?'var(--ok)':'var(--warn)')+'"':'')+'>'+(r==null?"–":(r>0?"+":"")+d1(r)+" kg")+'</div></div><div class="mc"><div class="sm">Ziel '+d1(zl)+' kg voraussichtlich</div><div style="font-weight:600">'+fc+'</div></div>';
  const L=$("wlist");L.innerHTML=ks.length?"":'<p class="sm" style="margin:0">Noch kein Gewicht eingetragen.</p>';
  ks.slice().reverse().forEach((k,j)=>{const pk=ks[ks.length-2-j],diff=pk?S.w[k]-S.w[pk]:0;
    const r=el("div","row",'<div class="t">'+new Date(k+"T12:00").toLocaleDateString("de-DE")+'</div><div>'+d1(S.w[k])+' kg'+(pk?' <span class="sm">('+(diff>0?"+":"")+d1(diff)+')</span>':'')+'</div><button class="ic" aria-label="Löschen">✕</button>');
    r.querySelector("button").onclick=()=>{const v=S.w[k];delete S.w[k];save();renderWeight();renderReview();toast("Gewicht gelöscht",()=>{S.w[k]=v;save();renderWeight();renderReview()})};L.appendChild(r)});
  drawChart()}
function drawChart(){const c=$("wch"),W=c.clientWidth,H=180;if(!W)return;const dpr=window.devicePixelRatio||1;c.width=W*dpr;c.height=H*dpr;const x=c.getContext("2d");x.scale(dpr,dpr);x.clearRect(0,0,W,H);
  const cs=getComputedStyle(document.documentElement),col=v=>cs.getPropertyValue(v).trim();let ks=wKeys();
  if(wr&&ks.length){const from=addDays(ks[ks.length-1],-(wr-1));ks=ks.filter(k=>k>=from)}
  x.font="11px sans-serif";x.fillStyle=col("--muted");
  if(ks.length<2){x.fillText(wKeys().length<2?"Ab zwei Einträgen erscheint hier der Verlauf.":"Zu wenige Einträge in diesem Zeitraum.",4,H/2);return}
  const vals=ks.map(k=>S.w[k]),tr=ks.map(trendAt);let lo=Math.min(...vals,...tr),hi=Math.max(...vals,...tr);
  // Prognose: gestrichelt in die Zukunft verlängern (max. 40 % der gezeigten Zeitspanne)
  const rt=wRate(),lt=tr[tr.length-1];let ext=0;
  if(rt!=null&&rt<=-.05&&lt>S.g.z&&ks[ks.length-1]===wKeys().slice(-1)[0]){ext=Math.round(Math.min((lt-S.g.z)/-rt*7,Math.max(14,dayDiff(ks[0],ks[ks.length-1]))*.4));lo=Math.min(lo,lt+rt*ext/7)}
  const showG=S.g.z>=lo-6;if(showG)lo=Math.min(lo,S.g.z);const mn=Math.floor(lo-1),mx=Math.ceil(hi+1);
  const t=k=>new Date(k+"T12:00").getTime(),t0=t(ks[0]),t1=t(ks[ks.length-1]),te=t1+ext*864e5,B=H-18;
  const px=v=>34+(v-t0)/(te-t0)*(W-44),py=v=>8+(mx-v)/(mx-mn)*(B-8);
  x.strokeStyle=col("--border");x.lineWidth=1;[mx,(mx+mn)/2,mn].forEach(v=>{x.beginPath();x.moveTo(34,py(v));x.lineTo(W-6,py(v));x.stroke();x.fillText(Math.round(v),2,py(v)+4)});
  x.fillText(dd(ks[0]),34,H-3);const le=dd(ext?addDays(ks[ks.length-1],ext):ks[ks.length-1]);x.fillText(le,W-6-x.measureText(le).width,H-3);
  if(showG){x.setLineDash([4,4]);x.strokeStyle=col("--ok");x.beginPath();x.moveTo(34,py(S.g.z));x.lineTo(W-6,py(S.g.z));x.stroke();x.setLineDash([])}
  x.strokeStyle=col("--muted");x.globalAlpha=.5;x.lineWidth=1;x.beginPath();ks.forEach((k,i)=>{const X=px(t(k)),Y=py(S.w[k]);i?x.lineTo(X,Y):x.moveTo(X,Y)});x.stroke();
  x.fillStyle=col("--muted");ks.forEach(k=>{x.beginPath();x.arc(px(t(k)),py(S.w[k]),2.5,0,7);x.fill()});x.globalAlpha=1;
  x.strokeStyle=col("--accent");x.lineWidth=3;x.lineJoin="round";x.beginPath();ks.forEach((k,i)=>{const X=px(t(k)),Y=py(tr[i]);i?x.lineTo(X,Y):x.moveTo(X,Y)});x.stroke();
  if(ext){x.setLineDash([5,5]);x.lineWidth=2;x.globalAlpha=.8;x.beginPath();x.moveTo(px(t1),py(lt));x.lineTo(px(te),py(lt+rt*ext/7));x.stroke();x.setLineDash([]);x.globalAlpha=1}}
window.addEventListener("resize",drawChart);
$("wi").oninput=()=>$("werr").textContent="";
$("wadd").onclick=()=>{const v=num($("wi").value);if(!(v>30&&v<300)){$("werr").textContent="Gib ein gültiges Gewicht ein.";return}
  S.w[dt.value]=Math.round(v*10)/10;$("wi").value="";save();renderWeight();renderReview();toast("Gewicht gespeichert")};

function renderMeasure(){const cur=S.m[dt.value]||{};
  $("mzin").innerHTML=MZ.map(([k,l])=>'<div><label class="f">'+l+' (cm)</label><input id="mz_'+k+'" inputmode="decimal" value="'+(cur[k]!=null?String(cur[k]).replace(".",","):"")+'"></div>').join("");
  MZ.forEach(([k])=>$("mz_"+k).oninput=()=>$("mze").textContent="");
  const ks=Object.keys(S.m).sort();
  if(!ks.length){$("mzlast").textContent="Noch keine Maße eingetragen.";$("mzsum").innerHTML="";$("mzl").innerHTML="";return}
  const ago=dayDiff(ks[ks.length-1],todayK());
  $("mzlast").textContent="Letzte Messung: "+new Date(ks[ks.length-1]+"T12:00").toLocaleDateString("de-DE")+(ago>=28?" – Zeit für eine neue Messung":"");$("mzlast").style.color=ago>=28?"var(--warn)":"";
  $("mzsum").innerHTML=MZ.map(([k,l])=>{const h=ks.filter(d=>S.m[d][k]!=null);if(!h.length)return"";const f=S.m[h[0]][k],v=S.m[h[h.length-1]][k],df=v-f;
    return '<div class="mc"><div class="sm">'+l+'</div><div class="v">'+d1(v)+' cm</div><div class="sm"'+(h.length>1&&df?' style="color:'+(df<0?'var(--ok)':'var(--warn)')+'"':'')+'>'+(h.length>1?(df>0?"+":"")+d1(df)+" cm seit "+dd(h[0]):"erste Messung")+'</div></div>'}).join("");
  const L=$("mzl");L.innerHTML="";
  ks.slice().reverse().forEach(d=>{const o=S.m[d];const r=el("div","row",'<div class="t">'+new Date(d+"T12:00").toLocaleDateString("de-DE")+'<div class="sm">'+MZ.filter(([k])=>o[k]!=null).map(([k,l])=>l+" "+d1(o[k])).join(" · ")+'</div></div><button class="ic" aria-label="Löschen">✕</button>');
    r.querySelector("button").onclick=()=>{delete S.m[d];save();renderMeasure();toast("Messung gelöscht",()=>{S.m[d]=o;save();renderMeasure()})};L.appendChild(r)})}
$("mzs").onclick=()=>{const o={};let bad=false;MZ.forEach(([k])=>{const s=$("mz_"+k).value.trim();if(!s)return;const v=num(s);if(v>=20&&v<=250)o[k]=Math.round(v*10)/10;else bad=true});
  if(bad){$("mze").textContent="Bitte gültige Werte in cm eingeben (z. B. 104,5).";return}
  if(!Object.keys(o).length){$("mze").textContent="Gib mindestens ein Maß ein.";return}
  S.m[dt.value]=o;save();renderMeasure();toast("Maße gespeichert")};
