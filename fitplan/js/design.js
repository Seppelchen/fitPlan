// FitPlan – Design: wie das System (Standard), Hell oder Dunkel.
// Wird im <head> vor allem anderen geladen, damit die Seite nicht kurz im falschen Design aufblitzt.
const THEME_KEY="fitplan.v1.design";
function themeGet(){try{const v=localStorage.getItem(THEME_KEY);return v==="light"||v==="dark"?v:"system"}catch(e){return"system"}}
function themeApply(v){const r=document.documentElement;if(v==="light"||v==="dark")r.setAttribute("data-theme",v);else r.removeAttribute("data-theme");
  // Farbe der Statusleiste (Android/Chrome) passend setzen, bei „System“ wieder die Vorgaben aus index.html
  document.querySelectorAll('meta[name="theme-color"]').forEach(m=>{if(!m.dataset.c)m.dataset.c=m.content;m.content=v==="light"?"#f5f5f2":v==="dark"?"#141413":m.dataset.c})}
function themeSet(v){try{if(v==="system")localStorage.removeItem(THEME_KEY);else localStorage.setItem(THEME_KEY,v)}catch(e){}themeApply(v)}
themeApply(themeGet());
