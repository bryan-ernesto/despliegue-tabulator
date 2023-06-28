const username = localStorage.getItem("username");

const usernameElement = document.getElementById("username");
usernameElement.textContent = username;

const empresaSelect = document.getElementById("empresa-select");
const clearButton = document.getElementById("clear-button");
const cuentaSelect = document.getElementById("cuenta-select");
const clearButtonE = document.getElementById("clear-button-e");

fetch("http://192.168.0.8:3000/api/usuarios/Get_empresas", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    str_empresa_nombre: "",
    int_id_delta: 0,
    str_nombre_delta: "",
    int_creado_por: 0,
    int_actualizado_por: 0,
  }),
})
  .then((response) => response.json())
  .then((data) => {
    empresasData = data;

    const initialOption = document.createElement("option");
    initialOption.value = "";
    initialOption.text = "Seleccione Empresa";
    initialOption.hidden = true;
    empresaSelect.appendChild(initialOption);

    const selectAllOption = document.createElement("option");
    selectAllOption.value = "null";
    selectAllOption.text = "Seleccionar todas las empresas";
    empresaSelect.appendChild(selectAllOption);

    empresasData.forEach((empresa) => {
      const option = document.createElement("option");
      option.value = empresa.id_delta;
      option.text = empresa.nombre_delta;
      option.classList.add("empresa-option");
      empresaSelect.appendChild(option);
    });
  })
  .catch((error) => {
    console.error("Error al obtener las empresas:", error);
  });

fetch("http://192.168.0.8:3000/api/delta/Get_Reporte_Cuenta_Bancaria", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  // body: JSON.stringify({
  //   int_num_inte: 0,
  // }),
})
  .then((response) => response.json())
  .then((data) => {
    const cuentaData = data;
    const initialOption = document.createElement("option");
    initialOption.value = "";
    initialOption.text = "Seleccione Número de Cuenta";
    initialOption.hidden = true;
    cuentaSelect.appendChild(initialOption);

    const selectAllOption = document.createElement("option");
    selectAllOption.value = "null";
    selectAllOption.text = "Seleccionar todos las cuentas";
    cuentaSelect.appendChild(selectAllOption);

    cuentaData.forEach((cuenta) => {
      const option = document.createElement("option");
      option.value = cuenta.NUMERO_INTERNO;
      option.text = cuenta.CLAVE_BANCO;
      option.classList.add("empresa-option");
      cuentaSelect.appendChild(option);
    });
  })
  .catch((error) => {
    console.error("Error al obtener los numeros de cuenta", error);
  });

let table;

function initializeTable(idEmpresa, idCuenta) {
  table = new Tabulator("#example-table", {
    layout: "fitColumns",
    columns: [],
    pagination: "local",
    paginationSize: 25,
    paginationSizeSelector: [10, 25, 50, 100],
    ajaxURL: "http://192.168.0.8:3000/api/delta/Get_Reporte_ABO_CXP_1_1",
    ajaxParams: function (params) {
      return {
        Id_Empresa: idEmpresa,
        Id_Cuenta: idCuenta,
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

function applyFilter(event) {
  var filterInput = event.target.parentNode.querySelector(".filter-input");
  var column = filterInput.getAttribute("data-column");
  var filterValue = filterInput.value;
  table.setFilter(column, "like", filterValue);
}

function clearFilter(event) {
  var filterInput = event.target.parentNode.querySelector(".filter-input");
  var column = filterInput.getAttribute("data-column");
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

document.getElementById("refresh").addEventListener("click", function () {
  if (table) {
    table.clearData();
    table.setData();
  }
  let currentDateTime = new Date().toLocaleString();
  console.log(
    "Botón de refrescar tabla clickeado. Fecha y hora actual:",
    currentDateTime
  );
  fetch("http://192.168.0.8:3000/api/recepciones_documento/Get_Prueba", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ dateFecha: currentDateTime }),
  })
    .then((response) => {
      if (response.ok) {
        console.log("Fecha y hora enviadas correctamente a la API");
      } else {
        console.log("Hubo un error al enviar la fecha y hora a la API");
      }
    })
    .catch((error) => console.log("Error:", error));
});

document.getElementById("actualizar-button").addEventListener("click", function () {
  const selectedEmpresa = empresaSelect.value;
  const selectedCuenta = cuentaSelect.value;
  initializeTable(selectedEmpresa, selectedCuenta);
});

function exportTable() {
  if (table) {
    table.download("csv", "registros.csv");
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
