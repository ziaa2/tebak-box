const $=s=>document.querySelector(s);
const KEY="tebak-profit-v1";
const favKey="tebak-favorites-v1";
let profits=JSON.parse(localStorage.getItem(KEY)||"[]");
let favorites=JSON.parse(localStorage.getItem(favKey)||"[]");

const rupiah=n=>new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(n);
const save=()=>localStorage.setItem(KEY,JSON.stringify(profits));
const total=()=>profits.reduce((s,x)=>s+x.amount,0);
function toast(t){const el=$("#toast");el.textContent=t;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),1300)}

function addProfit(amount){
  amount=Number(amount);
  if(!Number.isFinite(amount)||amount<=0)return toast("Nominal tidak valid");
  profits.unshift({id:Date.now()+Math.random(),amount,time:new Date().toISOString()});
  save(); render();
  toast("Laba "+rupiah(amount)+" ditambahkan");
}
function removeProfit(id){profits=profits.filter(x=>x.id!==id);save();render();toast("Catatan dihapus")}
function clearProfits(){if(!profits.length)return; if(confirm("Hapus semua catatan laba?")){profits=[];save();render();toast("Semua catatan dihapus")}}

function labaTool(){
 return `<div class="wrap">
  <div class="hero"><div class="eyebrow">Tool 01</div><h1>Catatan Laba</h1><p>Tambah laba sekali tap, tanpa ribet.</p></div>
  <section class="card profit">
    <div class="label">TOTAL LABA</div>
    <div class="amount">${rupiah(total())}</div>
    <div class="quick">
      <button data-add="2000">+ Rp2.000</button>
      <button data-add="3000">+ Rp3.000</button>
      <button data-add="5000">+ Rp5.000</button>
      <button data-add="10000">+ Rp10.000</button>
    </div>
    <form class="manual" id="manualForm">
      <input id="manualAmount" inputmode="numeric" placeholder="Nominal manual, contoh 7500">
      <button>Tambah</button>
    </form>
  </section>
  <section class="card">
    <div class="section-title"><h2>Riwayat Laba</h2><button class="danger" id="clearBtn">Reset</button></div>
    ${profits.length?profits.slice(0,30).map(x=>`<div class="entry"><div><strong>+ ${rupiah(x.amount)}</strong><small>${new Date(x.time).toLocaleString("id-ID",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"})}</small></div><button class="delete" data-delete="${x.id}">×</button></div>`).join(""):`<div class="empty">Belum ada catatan laba.</div>`}
  </section>
 </div>`
}
function home(){return `<div class="wrap"><div class="hero"><div class="eyebrow">Personal Toolbox</div><h1>TEBAK</h1><p>Tool sederhana buat kebutuhan harian.</p></div><div class="card"><h2>Catatan Laba</h2><p class="hero">Total saat ini: <strong>${rupiah(total())}</strong></p><a class="btn" href="#tool/laba">Buka Tool Laba</a></div></div>`}
// ===== TAMBAH TOOL DI SINI =====
const TOOL_CATALOG = [
 {id:"laba",icon:"💰",name:"Catatan Laba",desc:"Input cepat Rp2K, Rp3K, Rp5K, Rp10K atau manual.",href:"#tool/laba",tag:"Keuangan"},
 // TAMBAHKAN TOOL BARU DI BAWAH BARIS INI
];
function tools(){return `<div class="wrap"><div class="hero"><div class="eyebrow">Toolbox</div><h1>Semua Tools</h1><p>Pilih tool yang mau dipakai.</p></div><div class="tool-grid">${TOOL_CATALOG.map(t=>`<a class="tool-card" href="${t.href}"><div class="tool-icon">${t.icon}</div><div class="tool-copy"><div class="tool-top"><h3>${t.name}</h3><span>${t.tag||"Tool"}</span></div><p>${t.desc}</p></div><div class="tool-arrow">›</div></a>`).join("")}</div></div>`}
function history(){return `<div class="wrap"><div class="hero"><div class="eyebrow">Riwayat</div><h1>Riwayat Laba</h1><p>${profits.length} catatan • total ${rupiah(total())}</p></div><section class="card">${profits.length?profits.map(x=>`<div class="entry"><div><strong>+ ${rupiah(x.amount)}</strong><small>${new Date(x.time).toLocaleString("id-ID")}</small></div><button class="delete" data-delete="${x.id}">×</button></div>`).join(""):`<div class="empty">Belum ada riwayat.</div>`}</section></div>`}
function render(){
 const hash=location.hash||"#home";
 let content=hash==="#home"?home():hash==="#tools"?tools():hash==="#history"?history():hash==="#favorites"?tools():hash==="#tool/laba"?labaTool():home();
 $("#app").innerHTML=content;
 document.querySelectorAll("[data-add]").forEach(b=>b.onclick=()=>addProfit(b.dataset.add));
 const form=$("#manualForm"); if(form)form.onsubmit=e=>{e.preventDefault();let v=$("#manualAmount").value.replace(/[^0-9]/g,"");addProfit(v);$("#manualAmount").value=""};
 const clear=$("#clearBtn"); if(clear)clear.onclick=clearProfits;
 document.querySelectorAll("[data-delete]").forEach(b=>b.onclick=()=>removeProfit(Number(b.dataset.delete)));
 document.querySelectorAll("[data-nav]").forEach(a=>a.classList.toggle("active",hash.includes(a.dataset.nav)));
}
$("#themeBtn").onclick=()=>{document.body.classList.toggle("light");localStorage.setItem("tebak-theme",document.body.classList.contains("light")?"light":"dark")};
if(localStorage.getItem("tebak-theme")==="light")document.body.classList.add("light");
window.addEventListener("hashchange",render);render();
