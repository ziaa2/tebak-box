const KEY="4dlab-history-v3";
const initial=["5749","3492","2010","2899","0065","2949","5415","1281","1536","0027"];
let H=JSON.parse(localStorage.getItem(KEY)||"null");
if(!Array.isArray(H)||!H.length){H=initial.map((n,i)=>({n,t:Date.now()-(9-i)*86400000}));save()}
const $=s=>document.querySelector(s);
function save(){localStorage.setItem(KEY,JSON.stringify(H))}
function toast(t){let x=$("#toast");x.textContent=t;x.classList.add("show");setTimeout(()=>x.classList.remove("show"),1700)}
function freq(a){let f=Array(10).fill(0);a.forEach(x=>f[+x]++);return f}
function topDigits(f){return f.map((v,i)=>[v,i]).sort((a,b)=>b[0]-a[0]).map(x=>x[1])}
function clamp(n){return ((n%10)+10)%10}
function pad4(a){return a.map(x=>clamp(x)).join("")}
function candidateSet(){
 const nums=H.map(x=>x.n), last=nums[nums.length-1], all=H.flatMap(x=>[...x.n].map(Number));
 const f=freq(all), hot=topDigits(f), cold=[...Array(10).keys()].sort((a,b)=>f[a]-f[b]);
 const pos=[0,1,2,3].map(p=>freq(nums.map(x=>+x[p])));
 const pHot=pos.map(x=>topDigits(x)), recent=nums.slice(-5);
 const avg=recent.map(x=>[...x].map(Number)).reduce((a,x)=>x.map((v,i)=>a[i]+v),[0,0,0,0]).map(v=>Math.round(v/recent.length));
 const prev=nums.length>1?nums[nums.length-2]:last;
 const diff=[...last].map((v,i)=>+v-(+prev[i]));
 const sets=[
  ["Frekuensi digit",()=>pad4(pHot.map(a=>a[0]))],
  ["Frekuensi alternatif",()=>pad4(pHot.map(a=>a[1]))],
  ["Digit terendah",()=>pad4(pos.map((_,i)=>cold[i%cold.length]))],
  ["Rata-rata 5 hasil",()=>pad4(avg)],
  ["Tren +1",()=>pad4([...last].map(x=>+x+1))],
  ["Tren -1",()=>pad4([...last].map(x=>+x-1))],
  ["Cermin digit",()=>pad4([...last].map(x=>9-+x))],
  ["Balik urutan",()=>[...last].reverse().join("")],
  ["Hot global",()=>pad4([hot[0],hot[1],hot[2],hot[3]])],
  ["Campuran pola",()=>pad4([pHot[0][0],pHot[1][1],hot[2],avg[3]])]
 ];
 let used=new Set(),out=[];
 for(const [label,fn] of sets){let n=fn();if(!used.has(n)){used.add(n);out.push({n,label})}}
 let seed=0;for(const c of H)for(const ch of c.n)seed=(seed*31+ +ch)%997;
 let i=0;while(out.length<10&&i<100){let a=out.length+seed+i*7;let n=pad4([hot[a%10],cold[(a+1)%10],pHot[2][(a>>1)%3],avg[(a>>2)%4]]);if(!used.has(n)){used.add(n);out.push({n,label:"Campuran statistik "+(out.length+1)})}i++}
 return out.slice(0,10);
}
function render(){
 $("#count").textContent="("+H.length+")";
 $("#hist").innerHTML=H.map((x,i)=>'<div class="hist"><span><b>#'+(H.length-i)+'</b> <span class="num">'+x.n+'</span></span><span class="time">'+new Date(x.t).toLocaleDateString("id-ID")+'</span></div>').join("");
 analyze();
}
function analyze(){
 if(!H.length){$("#candidates").innerHTML='<div class="empty">History kosong.</div>';return}
 const cs=candidateSet();
 $("#candidates").innerHTML='<div class="candidates">'+cs.map((c,i)=>'<div class="candidate"><small>#'+(i+1)+'</small><div class="n">'+c.n+'</div><span class="tag">'+c.label+'</span></div>').join("")+'</div>';
 const all=H.flatMap(x=>[...x.n].map(Number)),f=freq(all),odd=all.filter(x=>x%2).length,hi=all.filter(x=>x>=5).length;
 $("#stats").innerHTML=[["History",H.length],["Ganjil / Genap",odd+" / "+(all.length-odd)],["Tinggi / Rendah",hi+" / "+(all.length-hi)],["Digit teratas",topDigits(f).slice(0,3).join(", ")]].map(x=>'<div class="stat"><small>'+x[0]+'</small><b>'+x[1]+'</b></div>').join("");
 const labels=["Ribuan","Ratusan","Puluhan","Satuan"];
 $("#patterns").innerHTML=labels.map((l,p)=>{let f=freq(H.map(x=>+x.n[p])),a=topDigits(f);return '<div class="card"><h3>'+l+'</h3><p>Teratas: <b>'+a.slice(0,4).join(", ")+'</b></p></div>'}).join("");
}
$("#add").onclick=()=>{let n=$("#n").value.trim();if(!/^\d{4}$/.test(n)){toast("Masukkan tepat 4 digit");return}H.push({n,t:Date.now()});save();$("#n").value="";render();toast("Hasil aktual ditambahkan")};
$("#n").onkeydown=e=>{if(e.key==="Enter")$("#add").click()};
$("#analyze").onclick=()=>{analyze();toast("10 kandidat dianalisis ulang")};
$("#clear").onclick=()=>{if(confirm("Hapus semua history?")){H=[];save();render();toast("History dihapus")}};
render();