// ==========================================
// 1. LOCALSTORAGE: SIMPAN TEMA (LIGHT/DARK MODE)
// ==========================================
var btnDarkMode = document.getElementById("btn-dark-mode");

// Cek preferensi tema yang tersimpan di localStorage saat pertama muat
var savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
  document.body.classList.add("dark-mode");
}

btnDarkMode.addEventListener("click", function() {
  document.body.classList.toggle("dark-mode");
  
  // Simpan preferensi pengguna ke localStorage
  if (document.body.classList.contains("dark-mode")) {
    localStorage.setItem("theme", "dark");
  } else {
    localStorage.setItem("theme", "light");
  }
});


// ==========================================
// 2. INDEXEDDB: STORAGE UNTUK DATA TODO
// ==========================================
var db;
var requestDB = indexedDB.open("TodoDatabase", 1);

// Membuat tabel/object store saat database pertama dibuat
requestDB.onupgradeneeded = function(e) {
  db = e.target.result;
  if (!db.objectStoreNames.contains("todos")) {
    db.createObjectStore("todos", { keyPath: "id", autoIncrement: true });
  }
};

requestDB.onsuccess = function(e) {
  db = e.target.result;
  tampilkanDaftarTodo(); // Muat data dari IndexedDB
};

requestDB.onerror = function(e) {
  console.error("Gagal membuka IndexedDB:", e);
};


// ==========================================
// 3. SERVICE WORKER & NOTIFIKASI
// ==========================================
var swRegistration = null;

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').then(function(reg) {
    swRegistration = reg;
    console.log("Service Worker berhasil didaftarkan");
  });
}

// Minta izin notifikasi ke pengguna
if ('Notification' in window && Notification.permission !== 'granted') {
  Notification.requestPermission();
}

function aturNotifikasi(judul, waktu) {
  if (!waktu) return;
  
  var waktuTarget = new Date(waktu).getTime();
  var waktuSekarang = new Date().getTime();
  var selisih = waktuTarget - waktuSekarang;

  if (selisih > 0) {
    setTimeout(function() {
      if (swRegistration && swRegistration.active) {
        swRegistration.active.postMessage({
          type: 'SHOW_NOTIFICATION',
          title: 'Pengingat Tugas!',
          body: 'Waktunya mengerjakan: ' + judul
        });
      } else if (Notification.permission === 'granted') {
        new Notification('Pengingat Tugas!', { body: 'Waktunya: ' + judul });
      }
    }, selisih);
  }
}


// ==========================================
// 4. BACA DATA DOM & PROSES SIMPAN TODO BARU
// ==========================================
var form = document.getElementById("form-todo");
var ulList = document.getElementById("todo-ul-list");
var detailBox = document.getElementById("todo-detail");

form.addEventListener("submit", function(e) {
  e.preventDefault();

  var pekerjaan = document.getElementById("pekerjaan").value;
  var deskripsi = document.getElementById("desc").value;
  var waktuNotif = document.getElementById("waktuNotif").value;
  var fileInput = document.getElementById("foto");
  
  // Media Capture API: Mengambil foto dalam bentuk Base64 DataURL
  var file = fileInput.files[0];
  if (file) {
    var reader = new FileReader();
    reader.onload = function(evt) {
      simpanKeDatabase(pekerjaan, deskripsi, evt.target.result, waktuNotif);
    };
    reader.readAsDataURL(file);
  } else {
    simpanKeDatabase(pekerjaan, deskripsi, null, waktuNotif);
  }
});

function simpanKeDatabase(pekerjaan, deskripsi, gambarBase64, waktuNotif) {
  var todoBaru = {
    pekerjaan: pekerjaan,
    deskripsi: deskripsi,
    gambar: gambarBase64,
    waktuNotif: waktuNotif,
    selesai: false
  };

  var tx = db.transaction("todos", "readwrite");
  var store = tx.objectStore("todos");
  store.add(todoBaru);

  tx.oncomplete = function() {
    form.reset();
    tampilkanDaftarTodo();
    aturNotifikasi(pekerjaan, waktuNotif);
  };
}


// ==========================================
// 5. TAMPILKAN DAFTAR & DETAIL (READ, UPDATE, DELETE)
// ==========================================
function tampilkanDaftarTodo() {
  ulList.innerHTML = "";

  var tx = db.transaction("todos", "readonly");
  var store = tx.objectStore("todos");
  var request = store.getAll();

  request.onsuccess = function() {
    var daftar = request.result;

    daftar.forEach(function(item) {
      var li = document.createElement("li");

      // Checkbox Selesai (Accessibility: beri aria-label)
      var checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = item.selesai;
      checkbox.setAttribute("aria-label", "Tandai selesai " + item.pekerjaan);
      
      checkbox.addEventListener("change", function() {
        item.selesai = checkbox.checked;
        var updateTx = db.transaction("todos", "readwrite");
        updateTx.objectStore("todos").put(item);
        updateTx.oncomplete = function() {
          tampilkanDaftarTodo();
        };
      });

      // Link Judul Pekerjaan
      var a = document.createElement("a");
      a.href = "#";
      a.textContent = item.pekerjaan;
      if (item.selesai) {
        a.style.textDecoration = "line-through";
      }

      a.addEventListener("click", function(e) {
        e.preventDefault();
        tampilkanDetail(item);
      });

      // Tombol Hapus (Accessibility: aria-label)
      var btnHapus = document.createElement("button");
      btnHapus.textContent = "Hapus";
      btnHapus.style.marginLeft = "8px";
      btnHapus.setAttribute("aria-label", "Hapus tugas " + item.pekerjaan);

      btnHapus.addEventListener("click", function() {
        var delTx = db.transaction("todos", "readwrite");
        delTx.objectStore("todos").delete(item.id);
        delTx.oncomplete = function() {
          tampilkanDaftarTodo();
          detailBox.innerHTML = "<h2>Detail Tugas</h2><p>Tugas berhasil dihapus.</p>";
        };
      });

      li.appendChild(checkbox);
      li.appendChild(document.createTextNode(" "));
      li.appendChild(a);
      li.appendChild(btnHapus);
      ulList.appendChild(li);
    });
  };
}

function tampilkanDetail(item) {
  var htmlGambar = item.gambar ? `<img src="${item.gambar}" alt="Foto pendukung tugas ${item.pekerjaan}" />` : "";
  var htmlWaktu = item.waktuNotif ? `<p><b>Waktu Notifikasi:</b> ${new Date(item.waktuNotif).toLocaleString('id-ID')}</p>` : "";

  detailBox.innerHTML = `
    <h2>${item.pekerjaan}</h2>
    <p>${item.deskripsi}</p>
    ${htmlWaktu}
    <p><b>Status:</b> ${item.selesai ? "Selesai" : "Belum Selesai"}</p>
    ${htmlGambar}
  `;
}