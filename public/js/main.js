const username = localStorage.getItem("username");

const usernameElement = document.getElementById("username");
usernameElement.textContent = username;

const empresaSelect = document.getElementById("empresa-select");
const clearButton = document.getElementById("clear-button");
const cuentaSelect = document.getElementById("cuenta-select");
const clearButtonE = document.getElementById("clear-button-e");

fetch("http://192.168.0.8:3000/api/reporteador/Get_empresas", {
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
    layout: "fitData",
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

document.getElementById("actualizar-button").addEventListener("click", function () {
  const selectedEmpresa = empresaSelect.value;
  const selectedCuenta = cuentaSelect.value;

  if (selectedEmpresa) {
    if (selectedCuenta) {
      Swal.fire({
        title: "Validando que exista información",
        text: "Esto puede durar varios minutos",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      fetch("http://192.168.0.8:3000/api/delta/Get_Reporte_ABO_CXP_1", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Id_Empresa: selectedEmpresa,
          Id_Cuenta: selectedCuenta,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data && data.length > 0) {
            initializeTable(selectedEmpresa, selectedCuenta);
            Swal.update({
              title: "Enviando parámetros...",
              text: "Esto puede durar varios minutos",
            });
          } else {
            Swal.fire({
              icon: "warning",
              title: "Advertencia",
              text: "No se encontró información acorde a los filtros seleccionados.",
            });
          }
        })
        .catch((error) => {
          console.error("Error al obtener los datos:", error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Ocurrió un error al obtener los datos. Por favor, intenta nuevamente más tarde.",
          });
        });
    } else {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Debes seleccionar un número de cuenta.",
      });
    }
  } else {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Debes seleccionar una empresa.",
    });
  }
});

function exportTable() {
  if (table) {
    table.download("csv", "registros.csv", {
      bom: true,
      charset: "utf-8",
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
