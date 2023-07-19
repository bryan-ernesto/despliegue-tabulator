const username = localStorage.getItem("username");

const usernameElement = document.getElementById("username");
usernameElement.textContent = username;

let table;

function initializeTable(idEmpresa, idCuenta) {
  table = new Tabulator("#example-table", {
    layout: "fitColumns",
    columns: [],
    pagination: "local",
    paginationSize: 25,
    paginationSizeSelector: [10, 25, 50, 100],
    ajaxURL: "http://192.168.0.8:3000/api/delta/Get_Reporte_ABO_CXP_2_1",
    ajaxParams: function (params) {
      return {
        Id_Empresa: idEmpresa,
        Id_Cuenta: idCuenta
      };
    },
    ajaxContentType: "json",
    ajaxResponse: function (url, params, response) {
      var columns = [];
      var headers = Object.keys(response[0]);
      headers.forEach((header) => {
        columns.push({ title: header, field: header, headerFilter: "input" });
      });
      table.setColumns(columns);
      return response;
    },
  });

  table.setData();
}

function updateTable() {
  const idEmpresa = document.getElementById("id-empresa-input").value;
  const idCuenta = document.getElementById("id-cuenta-input").value;

  if (idEmpresa && idCuenta) {
    // Validar que se hayan ingresado los parámetros
    if (table) {
      table.clearData();
      initializeTable(idEmpresa, idCuenta);
    } else {
      initializeTable(idEmpresa, idCuenta);
    }
  } else {
    alert("Ingresa los parámetros Id_Empresa y Id_Cuenta");
  }
}

document.getElementById("update-button").addEventListener("click", updateTable);

function applyFilter(event) {
  var filterInput = event.target.parentNode.querySelector('.filter-input');
  var column = filterInput.getAttribute('data-column');
  var filterValue = filterInput.value;
  table.setFilter(column, "like", filterValue);
}

function clearFilter(event) {
  var filterInput = event.target.parentNode.querySelector('.filter-input');
  var column = filterInput.getAttribute('data-column');
  var filters = table.getFilters();
  filters = filters.filter(function (filter) {
    return filter.field !== column;
  });
  table.clearFilter();
  filters.forEach(function (filter) {
    table.setFilter(filter.field, filter.type, filter.value);
  });
  filterInput.value = "";
}

function exportTable() {
  if (table) {
    table.download("csv", "registros.csv", {
      bom: true,
      charset: "utf-8"
    });
  }
}

const logoutButton = document.getElementById("logout-button");
logoutButton.addEventListener("click", () => {
  localStorage.removeItem("username");
  window.location.href = "/index.html";
  document.body.innerHTML = "<h1>Error: Acceso no autorizado</h1>";
});

const sidebarButtons = document.querySelectorAll(".sidebar-button");

sidebarButtons.forEach((button) => {
  button.addEventListener("click", function () {
    const targetPage = this.getAttribute("data-target");

    window.location.href = targetPage;
  });
});
