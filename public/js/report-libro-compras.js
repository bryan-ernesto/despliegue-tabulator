const username = localStorage.getItem("username");

const usernameElement = document.getElementById("username");
usernameElement.textContent = username;

const empresaSelect = document.getElementById("empresa-select");
const clearButton = document.getElementById("clear-button");
const fechaInicialInput = document.getElementById("fecha-inicial");
const fechaFinalInput = document.getElementById("fecha-final");

fetch("http://192.168.0.8:3000/api/reporteador/Get_Empresas_Libro_Compras", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    str_clave: "",
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
      option.value = empresa.numero;
      option.text = empresa.clave;
      option.classList.add("empresa-option");
      empresaSelect.appendChild(option);
    });
  })
  .catch((error) => {
    console.error("Error al obtener las empresas:", error);
  });

let table;

function formatHeader(header) {
  const headerMapping = {
    abreviatura1: "Nombre completo 1",
    abreviatura2: "Nombre completo 2",
  };

  if (headerMapping.hasOwnProperty(header)) {
    return headerMapping[header];
  }

  const words = header.split("_");
  const formattedHeader = words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  return formattedHeader;
}

function initializeTable(nombreEmpresa, fechaInicial, fechaFinal) {
  table = new Tabulator("#example-table", {
    layout: "fitColumns",
    columns: [],
    pagination: "local",
    paginationSize: 25,
    paginationSizeSelector: [10, 25, 50, 100],
    ajaxURL: "http://192.168.0.8:3000/api/reporteador/Get_Reporte_Libro_Compras",
    ajaxParams: function (params) {
      return {
        int_numero_empresa: nombreEmpresa,
        date_fecha_inicial: fechaInicial,
        date_fecha_final: fechaFinal,
      };
    },
    ajaxContentType: "json",
    ajaxResponse: function (url, params, response) {
      console.log(response);
      var columns = [];
      var headers = Object.keys(response[0]);
      headers.forEach((header) => {
        columns.push({ title: formatHeader(header), field: header, headerFilter: "input" });
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
  const fechaInicial = fechaInicialInput.value;
  const fechaFinal = fechaFinalInput.value;

  if (selectedEmpresa) {
    if (fechaInicial && fechaFinal) {
      initializeTable(selectedEmpresa, fechaInicial, fechaFinal);
    } else {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Debes seleccionar una fecha inicial y una fecha final.",
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

clearButton.addEventListener("click", () => {
  empresaSelect.value = "";
  fechaInicialInput.value = "";
  fechaFinalInput.value = "";
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