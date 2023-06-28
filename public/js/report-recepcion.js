const username = localStorage.getItem("username");

const usernameElement = document.getElementById("username");
usernameElement.textContent = username;

const empresaSelect = document.getElementById("empresa-select");
const clearButton = document.getElementById("clear-button");
const estadoSelect = document.getElementById("estado-select");
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
    const empresasData = data;

    const initialOption = document.createElement("option");
    initialOption.value = "";
    initialOption.text = "Seleccione Empresa";
    initialOption.hidden = true;
    empresaSelect.appendChild(initialOption);

    const selectAllOption = document.createElement("option");
    selectAllOption.value = "0";
    selectAllOption.text = "Seleccionar todas las empresas";
    empresaSelect.appendChild(selectAllOption);

    empresasData.forEach((empresa) => {
      const option = document.createElement("option");
      option.value = empresa.empresa_id_cat_empresa;
      option.text = empresa.nombre_delta;
      option.classList.add("empresa-option");
      empresaSelect.appendChild(option);
    });
  })
  .catch((error) => {
    console.error("Error al obtener las empresas:", error);
  });

fetch("http://192.168.0.8:3000/api/recepciones_documento/Get_Documento_Estado", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    str_nombre: "",
    str_descripcion: "",
    int_estado_final: 2,
  }),
})
  .then((response) => response.json())
  .then((data) => {
    const estadosData = data;
    const initialOption = document.createElement("option");
    initialOption.value = "";
    initialOption.text = "Seleccione Tipo Estado";
    initialOption.hidden = true;
    estadoSelect.appendChild(initialOption);

    estadosData.forEach((estado) => {
      const option = document.createElement("option");
      option.value = estado.id_documento_estado;
      option.text = estado.nombre;
      option.classList.add("empresa-option");
      estadoSelect.appendChild(option);
    });
  })
  .catch((error) => {
    console.error("Error al obtener los estados de documento:", error);
  });

let table;

function initializeTable(nombreEmpresa, idEstado) {
  table = new Tabulator("#example-table", {
    layout: "fitColumns",
    columns: [],
    pagination: "local",
    paginationSize: 25,
    paginationSizeSelector: [10, 25, 50, 100],
    ajaxURL: "http://192.168.0.8:3000/api/reporteador/Get_Reporteador_RecepcionDocumento",
    ajaxParams: function (params) {
      return {
        int_id_empresa: nombreEmpresa,
        id_estado: idEstado,
      };
    },
    ajaxContentType: "json",
    ajaxResponse: function (url, params, response) {
      console.log(response);
      var columns = [];
      var headers = Object.keys(response[0]);
      headers.forEach((header) => {
        columns.push({ title: header, field: header, headerFilter: "input" });
      });
      table.setColumns(columns);
      return response;
    },
    renderComplete: function () {
      if (table.getDataCount() === 0) {
        // No se encontraron datos, mostrar mensaje personalizado
        table.setEmptyMsg("No se encontraron datos acorde a los filtros");
      }
    },
  });

  table.setData();
}

document.getElementById("refresh").addEventListener("click", function () {
  if (table) {
    table.clearData();
    table.setData();
  }
  let currentDateTime = new Date().toLocaleString();
  console.log("Botón de refrescar tabla clickeado. Fecha y hora actual:", currentDateTime);
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
  const selectedEstado = estadoSelect.value;
  initializeTable(selectedEmpresa, selectedEstado);
});

clearButton.addEventListener("click", () => {
  empresaSelect.value = "";
  estadoSelect.value = "";
  table.clearData();
});

clearButtonE.addEventListener("click", () => {
  estadoSelect.value = "";
  table.clearData();
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
