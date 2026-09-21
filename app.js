const TOOLS=[
{id:"calc",name:"Calculator",cat:"Utility",icon:"⌗",desc:"Hitung cepat tanpa meninggalkan app.",keywords:"calculator math hitung"},
{id:"json",name:"JSON Formatter",cat:"Developer",icon:"{}",desc:"Rapikan, validasi, dan minify JSON.",keywords:"json format pretty minify"},
{id:"base64",name:"Base64",cat:"Text",icon:"64",desc:"Encode dan decode teks secara lokal.",keywords:"base64 encode decode"},
{id:"time",name:"Timestamp",cat:"Utility",icon:"◷",desc:"Konversi Unix timestamp ke waktu lokal.",keywords:"timestamp unix time tanggal"},
{id:"color",name:"Color Tools",cat:"Utility",icon:"◈",desc:"Preview warna dan ubah format HEX/RGB.",keywords:"color hex rgb warna"},
{id:"pattern",name:"Game Pattern",cat:"Personal",icon:"4D",desc:"Analyzer 4D lama, sekarang jadi tool.",keywords:"game pattern 4d analyzer"}
];

const FAV="tebak-favorites-v1", HIST="tebak-history-v1";
const state={favs:JSON.parse(localStorage.getItem(FAV)||"[]"),history:JSON.parse(localStorage.getItem(HIST)||"[]")};
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function save(){localStorage.setItem(FAV,JSON.stringify(state.favs));localStorage.setItem(HIST,JSON.stringify(state.history))}
function toast(t){const x=$("#toast");x.textContent=t;x.classList.add("show");setTimeout(()=>x.classList.remove("show"),1500)}
function record(t){state.history.push({tool:t.name,t:Date.now()});state.history=state.history.slice(-50);save()}
function card(t){return `<div class="tool-card" data-tool="${t.id}"><button class="fav ${state.favs.includes(t.id)?"on":""}" data-fav="${t.id}">${state.favs.includes(t.id)?"★":"☆"}</button><div class="tool-icon">${t.icon}</div><strong>${t.name}</strong><small>${t.desc}</small></div>`}
function bindCards(){document.querySelectorAll("[data-tool]").forEach(x=>x.onclick=e=>{if(e.target.closest("[data-fav]"))return;openTool(x.dataset.tool)});document.querySelectorAll("[data-fav]").forEach(x=>x.onclick=e=>{e.stopPropagation();const id=x.dataset.fav;state.favs=state.favs.includes(id)?state.favs.filter(v=>v!==id):[...state.favs,id];save();render()})}
function shell(title,kicker,body){return `<section class="hero"><div class="eyebrow">${kicker}</div><h1>${title}</h1>${body}</section>`}
function home(){
return shell("Tools that stay<br>out of your way.","PERSONAL TOOLBOX",`<p>Utility kecil untuk kerja harian. Cepat, lokal, dan dibuat buat dipakai sendiri.</p>
<div class="search">⌕ <input id="search" placeholder="Search tools..."></div>
<div class="section-head"><h2>Quick access</h2><small>${state.favs.length} favorites</small></div>
<div class="grid">${(state.favs.length?TOOLS.filter(t=>state.favs.includes(t.id)):TOOLS.slice(0,4)).map(card).join("")}</div>
<div class="section-head"><h2>All tools</h2></div>
<div class="chips" id="chips"><button class="chip active" data-cat="All">All</button>${[...new Set(TOOLS.map(t=>t.cat))].map(c=>`<button class="chip" data-cat="${c}">${c}</button>`).join("")}</div>
<div class="grid" id="toolgrid">${TOOLS.map(card).join("")}</div>`)}

function toolBody(id){
const b={
calc:`<div class="field"><label>Expression</label><input id="calcIn" inputmode="decimal" placeholder="(12 + 8) * 3"></div><div class="actions"><button class="primary" id="calcRun">Calculate</button><button class="secondary" id="calcClear">Clear</button></div><div class="result" id="calcOut">Hasil akan muncul di sini.</div>`,
json:`<div class="field"><label>JSON input</label><textarea id="jsonIn" placeholder='{"hello":"world"}'></textarea></div><div class="actions"><button class="primary" id="jsonFormat">Format</button><button class="secondary" id="jsonMin">Minify</button><button class="secondary" id="jsonCopy">Copy</button></div><div class="result" id="jsonOut"></div>`,
base64:`<div class="field"><label>Text</label><textarea id="b64In" placeholder="Tulis teks di sini..."></textarea></div><div class="actions"><button class="primary" id="b64Enc">Encode</button><button class="secondary" id="b64Dec">Decode</button></div><div class="result" id="b64Out"></div>`,
time:`<div class="field"><label>Unix timestamp (ms)</label><input id="timeIn" inputmode="numeric" placeholder="${Date.now()}"></div><div class="actions"><button class="primary" id="timeNow">Now</button><button class="secondary" id="timeConvert">Convert</button></div><div class="result" id="timeOut"></div>`,
color:`<div class="field"><label>Color</label><input id="colorIn" value="#b8ff55"></div><div class="result" id="colorOut">Preview</div>`,
pattern:`<div class="field"><label>4 digit history, satu per baris</label><textarea id="patIn" placeholder="5749\n3492\n2010"></textarea></div><div class="actions"><button class="primary" id="patRun">Analyze</button></div><div class="result" id="patOut"></div>`
};return b[id]||""}

function openTool(id){
const t=TOOLS.find(x=>x.id===id);if(!t)return;
record(t);location.hash="tool/"+id;
$("#app").innerHTML=`<section class="panel"><div class="tool-head"><div><h1>${t.icon} ${t.name}</h1><p>${t.desc}</p></div><button class="back" data-view="home">← Back</button></div>${toolBody(id)}</section>`;
bindTool(id)
}

function bindTool(id){
if(id==="calc"){
$("#calcRun").onclick=()=>{try{const v=$("#calcIn").value.replace(/[^0-9+*/().%\- ]/g,"");if(!v)throw 0;$("#calcOut").textContent=Function('"use strict";return ('+v+')')()}catch{$("#calcOut").textContent="Expression tidak valid."}};
$("#calcClear").onclick=()=>{$("#calcIn").value="";$("#calcOut").textContent=""}}
if(id==="json"){
const parse=()=>{try{return JSON.parse($("#jsonIn").value)}catch(e){$("#jsonOut").textContent="JSON tidak valid: "+e.message;return null}};
$("#jsonFormat").onclick=()=>{const x=parse();if(x!==null)$("#jsonOut").textContent=JSON.stringify(x,null,2)};
$("#jsonMin").onclick=()=>{const x=parse();if(x!==null)$("#jsonOut").textContent=JSON.stringify(x)};
$("#jsonCopy").onclick=()=>navigator.clipboard?.writeText($("#jsonOut").textContent).then(()=>toast("Copied"))}
if(id==="base64"){
$("#b64Enc").onclick=()=>{try{$("#b64Out").textContent=btoa(unescape(encodeURIComponent($("#b64In").value)))}catch{$("#b64Out").textContent="Encode gagal."}};
$("#b64Dec").onclick=()=>{try{$("#b64Out").textContent=decodeURIComponent(escape(atob($("#b64In").value.trim())))}catch{$("#b64Out").textContent="Base64 tidak valid."}}}
if(id==="time"){
$("#timeNow").onclick=()=>{$("#timeIn").value=Date.now();$("#timeConvert").click()};
$("#timeConvert").onclick=()=>{const d=new Date(Number($("#timeIn").value));$("#timeOut").textContent=Number.isNaN(d.getTime())?"Timestamp tidak valid.":d.toLocaleString("id-ID",{dateStyle:"full",timeStyle:"medium"})}}
if(id==="color"){
const render=()=>{const v=$("#colorIn").value.trim();$("#colorOut").style.background=v;$("#colorOut").style.color=v.toLowerCase()==="#ffffff"?"#000":"#fff";$("#colorOut").textContent=v};
$("#colorIn").oninput=render;render()}
if(id==="pattern"){
$("#patRun").onclick=()=>{const a=$("#patIn").value.split(/\s+/).filter(x=>/^\d{4}$/.test(x));if(!a.length){$("#patOut").textContent="Masukkan minimal satu hasil 4 digit.";return}const f=Array(10).fill(0);a.join("").split("").forEach(x=>f[+x]++);const hot=f.map((v,i)=>[v,i]).sort((x,y)=>y[0]-x[0]).slice(0,4).map(x=>x[1]).join("");$("#patOut").textContent=`History: ${a.length}\nDigit teratas: ${hot}\nFrekuensi: ${f.map((v,i)=>i+":"+v).join("  ")}`}}
}
function historyView(){return shell("Your activity.","RECENT",`<div class="panel">${state.history.length?state.history.slice().reverse().map(x=>`<div class="history-item"><span>${esc(x.tool)}</span><small>${new Date(x.t).toLocaleString("id-ID")}</small></div>`).join(""):'<div class="empty">Belum ada aktivitas.</div>'}</div>`)}
function render(){
const h=location.hash.slice(1)||"home", parts=h.split("/"), view=parts[0],id=parts[1];
document.querySelectorAll(".nav").forEach(n=>n.classList.toggle("active",n.dataset.view===view));
if(view==="tool"){openTool(id);return}
if(view==="tools")$("#app").innerHTML=shell("Everything<br>in one place.","ALL TOOLS",`<div class="grid">${TOOLS.map(card).join("")}</div>`);
else if(view==="favorites")$("#app").innerHTML=shell("Your shortcuts.","FAVORITES",`<div class="grid">${TOOLS.filter(t=>state.favs.includes(t.id)).map(card).join("")||'<div class="empty">Belum ada favorite.</div>'}</div>`);
else if(view==="history")$("#app").innerHTML=historyView();
else $("#app").innerHTML=home();
bindCards();
document.querySelectorAll("[data-view]").forEach(x=>x.onclick=()=>location.hash=x.dataset.view);
if(view==="home"){
const s=$("#search");s.oninput=()=>{const q=s.value.toLowerCase();$("#toolgrid").innerHTML=TOOLS.filter(t=>(t.name+" "+t.keywords).toLowerCase().includes(q)).map(card).join("");bindCards()};
document.querySelectorAll("[data-cat]").forEach(x=>x.onclick=()=>{document.querySelectorAll(".chip").forEach(c=>c.classList.remove("active"));x.classList.add("active");const c=x.dataset.cat;$("#toolgrid").innerHTML=TOOLS.filter(t=>c==="All"||t.cat===c).map(card).join("");bindCards()})
}}
$("#themeBtn").onclick=()=>{document.body.classList.toggle("light");localStorage.setItem("tebak-theme",document.body.classList.contains("light")?"light":"dark")};
if(localStorage.getItem("tebak-theme")==="light")document.body.classList.add("light");
window.addEventListener("hashchange",render);render();
if("serviceWorker"in navigator)navigator.serviceWorker.register("sw.js").catch(()=>{});
