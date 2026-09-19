const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const S={role:null,peer:null,conn:null,room:"",title:"",levels:[],current:0,opened:[],player:""};
const params=new URLSearchParams(location.search), invite=params.get("room");
const topics=["Sarapan","Camilan","Makan Siang","Makan Sore","Makan Malam"];
const questions=["Mana yang cocok untuk sarapan?","Mana yang cocok untuk camilan?","Mana yang cocok untuk makan siang?","Mana yang cocok untuk makan sore?","Mana yang cocok untuk makan malam?"];
function show(id){$$(".page").forEach(x=>x.classList.remove("active"));$(id).classList.add("active")}
function toast(t){let x=$("#toast");x.textContent=t;x.classList.add("show");setTimeout(()=>x.classList.remove("show"),1700)}
function esc(s){return String(s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function defaults(){return topics.map((topic,i)=>({topic,q:questions[i],imgs:[]}))}
function progress(sel,n){$(sel).innerHTML=S.levels.map((_,i)=>`<i class="level ${i<n?"done":""} ${i===n?"active":""}"></i>`).join("")}
function compress(file){return new Promise((res,rej)=>{let r=new FileReader(),im=new Image();r.onload=()=>im.src=r.result;r.onerror=rej;im.onload=()=>{let m=850,z=Math.min(1,m/Math.max(im.width,im.height)),c=document.createElement("canvas");c.width=im.width*z;c.height=im.height*z;c.getContext("2d").drawImage(im,0,0,c.width,c.height);res(c.toDataURL("image/jpeg",.76))};r.readAsDataURL(file)})}
function editors(){
  $("#editors").innerHTML=S.levels.map((l,i)=>`<div class="editor">
  <div class="editorhead"><div><div class="lv">LEVEL ${i+1}</div><div class="topic">${esc(l.topic)}</div></div></div>
  <label class="field">Topik<input data-t="${i}" value="${esc(l.topic)}"></label>
  <label class="field">Pertanyaan<input data-q="${i}" value="${esc(l.q)}"></label>
  <div class="uploadgrid">${Array.from({length:6},(_,j)=>`<label class="upload">${l.imgs[j]?`<img src="${l.imgs[j]}">`:`<span>BOX ${j+1}<br>Tambah gambar</span>`}<input type="file" accept="image/*" data-f="${i}-${j}"></label>`).join("")}</div>
  </div>`).join("");
  $$("[data-t]").forEach(x=>x.oninput=()=>S.levels[+x.dataset.t].topic=x.value);
  $$("[data-q]").forEach(x=>x.oninput=()=>S.levels[+x.dataset.q].q=x.value);
  $$("[data-f]").forEach(x=>x.onchange=async e=>{let[i,j]=x.dataset.f.split("-").map(Number),f=e.target.files[0];if(!f)return;S.levels[i].imgs[j]=await compress(f);editors()});
}
function shuffle(a){return [...a].sort(()=>Math.random()-.5)}
function box(i,img,open,host){
  return `<div class="box ${open?"open":""}" ${host?`data-i="${i}"`:``}><div class="inner">
  <div class="face backface">?<span class="num">BOX ${i+1}</span></div>
  <div class="face front"><img src="${img}"><span class="num">BOX ${i+1}</span></div>
  </div></div>`
}
function renderHost(){
 let l=S.levels[S.current];$("#hTitle").textContent=S.title;$("#hRoom").textContent=S.room;progress("#hLevels",S.current);
 $("#hQuestion").innerHTML=`<div class="qlabel">LEVEL ${S.current+1} • ${esc(l.topic)}</div><div class="qtext">${esc(l.q)}</div>`;
 $("#hBoxes").innerHTML=l.boxes.map((x,i)=>box(i,x,S.opened.includes(i),true)).join("");
 $$("#hBoxes .box").forEach(x=>x.onclick=()=>open(+x.dataset.i));
}
function renderPlayer(){
 let l=S.levels[S.current];$("#pTitle").textContent=S.title;$("#pLv").textContent=`LEVEL ${S.current+1}`;$("#pName").textContent=S.player;progress("#pLevels",S.current);
 $("#pQuestion").innerHTML=`<div class="qlabel">LEVEL ${S.current+1} • ${esc(l.topic)}</div><div class="qtext">${esc(l.q)}</div>`;
 $("#pBoxes").innerHTML=l.boxes.map((x,i)=>box(i,x,S.opened.includes(i),false)).join("");
 $("#pInfo").textContent=S.opened.length===6?(S.current===4?"🏆 Semua level selesai.":"Menunggu host lanjut ke level berikutnya."):"Tunggu host membuka box.";
}
function send(m){if(S.conn?.open)S.conn.send(m)}
function open(i,b=true){if(S.opened.includes(i))return;S.opened.push(i);renderHost();if(b)send({type:"open",level:S.current,index:i})}
function all(){S.levels[S.current].boxes.forEach((_,i)=>open(i))}
function next(){if(S.opened.length<6){toast("Buka semua box dulu.");return}if(S.current===4){send({type:"done"});toast("Game selesai.");return}S.current++;S.opened=[];renderHost();send({type:"level",level:S.current})}
function connect(id){return new Promise((res,rej)=>{let p=new Peer(id);p.on("open",()=>res(p));p.on("error",rej)})}
function makeId(){return"tbx-"+Math.random().toString(36).slice(2,9)}
function hostMsg(m){if(m.type==="hello"){S.player=m.name;$("#players").textContent=`Penebak: ${m.name}`;send({type:"state",title:S.title,levels:S.levels.map(l=>({topic:l.topic,q:l.q,boxes:l.boxes})),current:S.current,opened:S.opened})}}
async function startHost(){
 for(let i=0;i<5;i++){if(!S.levels[i].q.trim()||S.levels[i].imgs.length!==6||S.levels[i].imgs.some(x=>!x)){toast(`LV ${i+1} belum lengkap.`);return}}
 S.title=$("#title").value.trim()||"TebakBox";S.levels=S.levels.map(l=>({...l,boxes:shuffle(l.imgs)}));S.role="host";S.room=makeId();
 try{S.peer=await connect(S.room)}catch(e){toast("Gagal membuat room.");return}
 $("#net").textContent="● HOST ONLINE";S.peer.on("connection",c=>{if(S.conn){c.on("open",()=>c.send({type:"busy"}));return}S.conn=c;c.on("open",()=>{$("#players").textContent="Penebak terhubung.";send({type:"state",title:S.title,levels:S.levels.map(l=>({topic:l.topic,q:l.q,boxes:l.boxes})),current:S.current,opened:S.opened})});c.on("data",hostMsg);c.on("close",()=>{$("#players").textContent="Penebak terputus.";S.conn=null})});
 let u=location.origin+location.pathname+"?room="+S.room;history.replaceState({},"","?room="+S.room);$("#copy").onclick=()=>navigator.clipboard.writeText(u).then(()=>toast("Invite link disalin"));renderHost();show("#host")
}
function playerMsg(m){
 if(m.type==="busy"){toast("Room sudah dipakai.");return}
 if(m.type==="state"){S.title=m.title;S.levels=m.levels;S.current=m.current;S.opened=m.opened||[];renderPlayer();show("#player")}
 if(m.type==="open"&&m.level===S.current){S.opened.push(m.index);renderPlayer()}
 if(m.type==="level"){S.current=m.level;S.opened=[];renderPlayer()}
 if(m.type==="done"){$("#pInfo").textContent="🏆 GAME SELESAI";toast("Game selesai!")}
}
async function join(){
 S.player=$("#name").value.trim();S.room=$("#room").value.trim();if(!S.player||!S.room){toast("Isi nama dan Room ID.");return}
 show("#wait");$("#waitText").textContent="Mencari host...";S.role="player";S.peer=await connect(makeId());S.conn=S.peer.connect(S.room,{reliable:true});S.conn.on("open",()=>{send({type:"hello",name:S.player});$("#net").textContent="● CONNECTED"});S.conn.on("data",playerMsg);S.conn.on("close",()=>toast("Koneksi terputus."))
}
$("#createBtn").onclick=()=>{S.levels=defaults();editors();show("#setup")};
$("#joinBtn").onclick=()=>{$("#room").value=invite||"";show("#join")};
$("#hostBtn").onclick=startHost;$("#joinGameBtn").onclick=join;$("#all").onclick=all;$("#next").onclick=next;
$$("[data-back]").forEach(x=>x.onclick=()=>show("#home"));
if(invite){$("#room").value=invite;show("#join")}
