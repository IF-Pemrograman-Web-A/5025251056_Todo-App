var initialData = [
  { id: 1, pekerjaan: "Sarapan", deskripsi: "Sarapan sebelum kuliah", Selesai: false },
  { id: 2, pekerjaan: "Kuliah", deskripsi: "Mengikuti perkuliahan di kampus", Selesai: false },
  { id: 3, pekerjaan: "Main", deskripsi: "Bermain game bersama teman", Selesai: false }
];

var todoList = JSON.parse(JSON.stringify(initialData));

var form = document.querySelector("form");
var inputPekerjaan = document.getElementById("pekerjaan");
var inputDesc = document.getElementById("desc");
var ulList = document.querySelector(".list ul");
var articleTodo = document.querySelector(".todo article");
var btnDarkMode = document.getElementById("btn-dark-mode");

function renderList() {
  ulList.innerHTML = "";

  for (var i = 0; i < todoList.length; i++) {
    var item = todoList[i];

    var li = document.createElement("li");

    var checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = item.Selesai;
    checkbox.dataset.index = i;
    
    checkbox.addEventListener("change", function(e) {
      var idx = e.target.dataset.index;
      todoList[idx].Selesai = e.target.checked;
      renderList();
    });

    var a = document.createElement("a");
    a.href = "#";
    a.textContent = item.pekerjaan;
    a.dataset.index = i;

    if (item.Selesai) {
      a.style.textDecoration = "line-through";
      a.style.color = "gray";
    }

    a.addEventListener("click", function(e) {
      e.preventDefault();
      var idx = e.target.dataset.index;
      tampilkanDetail(idx);
    });

    var btnEdit = document.createElement("button");
    btnEdit.textContent = "Edit";
    btnEdit.style.marginLeft = "5px";
    btnEdit.dataset.index = i;

    btnEdit.addEventListener("click", function(e) {
      var idx = e.target.dataset.index;
      var pekerjaanBaru = prompt("Edit Pekerjaan:", todoList[idx].pekerjaan);
      var deskripsiBaru = prompt("Edit Deskripsi:", todoList[idx].deskripsi);

      if (pekerjaanBaru !== null && pekerjaanBaru !== "") {
        todoList[idx].pekerjaan = pekerjaanBaru;
      }
      if (deskripsiBaru !== null && deskripsiBaru !== "") {
        todoList[idx].deskripsi = deskripsiBaru;
      }

      renderList();
      tampilkanDetail(idx);
    });

    var btnHapus = document.createElement("button");
    btnHapus.textContent = "Hapus";
    btnHapus.style.marginLeft = "3px";
    btnHapus.dataset.index = i;

    btnHapus.addEventListener("click", function(e) {
      var idx = e.target.dataset.index;
      todoList.splice(idx, 1);
      renderList();
      
      if (todoList.length === 0) {
        articleTodo.innerHTML = "<h1>Data Kosong</h1><p>Tidak ada todo untuk ditampilkan.</p>";
      } else {
        tampilkanDetail(0);
      }
    });

    li.appendChild(checkbox);
    li.appendChild(document.createTextNode(" "));
    li.appendChild(a);
    li.appendChild(btnEdit);
    li.appendChild(btnHapus);

    ulList.appendChild(li);
  }
}

function tampilkanDetail(index) {
  if (todoList[index]) {
    articleTodo.innerHTML = `
      <h1>${todoList[index].pekerjaan}</h1>
      <p>${todoList[index].deskripsi}</p>
      <p><b>Status:</b> ${todoList[index].Selesai ? "Selesai" : "Belum Selesai"}</p>
    `;
  }
}

form.addEventListener("submit", function(e) {
  e.preventDefault(); 

  var pekerjaanText = inputPekerjaan.value;
  var descText = inputDesc.value;

  if (pekerjaanText.trim() === "" || descText.trim() === "") {
    alert("Mohon isi pekerjaan dan deskripsi!");
    return;
  }

  var todoBaru = {
    id: Date.now(),
    pekerjaan: pekerjaanText,
    deskripsi: descText,
    Selesai: false
  };

  todoList.push(todoBaru);

  inputPekerjaan.value = "";
  inputDesc.value = "";

  renderList();
  tampilkanDetail(todoList.length - 1);
});

btnDarkMode.addEventListener("click", function() {
  document.body.classList.toggle("dark-mode");
});

renderList();
if (todoList.length > 0) {
  tampilkanDetail(0);
}