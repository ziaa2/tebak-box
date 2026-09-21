# Cara menambah tool

Semua kartu tool ada di `app.js`, bagian `TOOL_CATALOG`.

Tambahkan object seperti:
`{id:"nama",icon:"🧮",name:"Nama Tool",desc:"Deskripsi",href:"#tool/nama",tag:"Kategori"}`

Lalu buat function tool dan tambahkan route `#tool/nama` di `render()`.

Desain kartu otomatis memakai icon besar, badge kategori, deskripsi, dan panah.
