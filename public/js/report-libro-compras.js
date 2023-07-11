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
      option.setAttribute("data-razon-social", empresa.nombre_completo);
      empresaSelect.appendChild(option);
    });
  })
  .catch((error) => {
    console.error("Error al obtener las empresas:", error);
  });

let table;

document
  .getElementById("actualizar-button")
  .addEventListener("click", function () {
    const selectedEmpresa = empresaSelect.value;
    const fechaInicial = fechaInicialInput.value;
    const fechaFinal = fechaFinalInput.value;

    if (selectedEmpresa) {
      if (fechaInicial && fechaFinal) {
        Swal.fire({
          title: "Validando que exista información",
          text: "Esto puede durar varios minutos",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });
        fetch(
          "http://192.168.0.8:3000/api/reporteador/Get_Reporte_Libro_Compras_1",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              int_numero_empresa: selectedEmpresa,
              date_fecha_inicial: fechaInicial,
              date_fecha_final: fechaFinal,
            }),
          }
        )
          .then((response) => response.json())
          .then((data) => {
            if (data && data.length > 0) {
              Swal.update({
                title: "Enviando parámetros...",
                text: "Esto puede durar varios minutos",
              });
              initializeTable(selectedEmpresa, fechaInicial, fechaFinal);
              Swal.close();
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

function initializeTable(nombreEmpresa, fechaInicial, fechaFinal) {
  
  table = new Tabulator("#example-table", {
    layout: "fitData",
    columns: [],
    pagination: "local",
    paginationSize: 25,
    paginationSizeSelector: [10, 25, 50, 100],
    ajaxURL:
      "http://192.168.0.8:3000/api/reporteador/Get_Reporte_Libro_Compras",
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
      var headers = response.length > 0 ? Object.keys(response[0]) : [];
      headers.forEach((header) => {
        columns.push({ title: header, field: header, headerFilter: "input" });
      });
      table.setColumns(columns);
      return response;
    },
  });

  table.setData();
}

clearButton.addEventListener("click", () => {
  empresaSelect.value = "";
  fechaInicialInput.value = "";
  fechaFinalInput.value = "";
  table.clearData();
});

function exportTable() {
  if (table) {
    const selectedOption = empresaSelect.selectedOptions[0];
    const razonSocial = selectedOption.getAttribute("data-razon-social");
    const empresaId = selectedOption.value;

    const fechaInicial = fechaInicialInput.value;
    const fechaFinal = fechaFinalInput.value;

    if (selectedOption.value === "0") {
      const customHeader = { v: "LIBRO DE COMPRAS", s: { font: { sz: 30 } } };
      const razonSocialCell = {
        v: "Todas las empresas",
        s: { font: { sz: 12 } },
      };
      const fechasCell = {
        v: "Fechas: " + fechaInicial + " - " + fechaFinal,
        s: { font: { sz: 12 } },
      };

      const worksheet = XLSX.utils.aoa_to_sheet([]);
      worksheet["A1"] = { ...customHeader};
      worksheet["A3"] = { ...razonSocialCell};
      worksheet["A4"] = { ...fechasCell};

      const columns = table.getColumns();
      const headers = columns.map((column) => column.getField());
      const dataT = [
        headers,
        ...table.getData().map((row) => Object.values(row)),
      ];
      XLSX.utils.sheet_add_aoa(worksheet, dataT, { origin: "A9" });

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Registros");

      XLSX.writeFile(workbook, "registros.xlsx", {
        bookType: "xlsx",
        bookSST: true,
        type: "binary",
        cellStyles: true,
      });
    } else {
      fetch("http://192.168.0.8:3000/api/delta/Get_Reporte_Empresa_Direccion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          str_numero: empresaId,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          console.log(data[0].DIRECCION);
          const direccion = data[0].DIRECCION;
          const worksheet = XLSX.utils.aoa_to_sheet([]);

          const customHeader = {
            v: "LIBRO DE COMPRAS",
            s: { font: { sz: 30 } },
          };
          const razonSocialCell = {
            v: "Razón Social: " + razonSocial,
            s: { font: { sz: 12 } },
          };
          const direccionCell = {
            v: "Dirección Comercial: " + direccion,
            s: { font: { sz: 12 } },
          };
          const fechasCell = {
            v: "Fechas: " + fechaInicial + " - " + fechaFinal,
            s: { font: { sz: 12 } },
          };

          worksheet["A1"] = { ...customHeader};
          worksheet["A3"] = { ...razonSocialCell};
          worksheet["A4"] = { ...direccionCell};
          worksheet["A5"] = { ...fechasCell};

          const columns = table.getColumns();
          const headers = columns.map((column) => column.getField());
          const dataT = [
            headers,
            ...table.getData().map((row) => Object.values(row)),
          ];
          XLSX.utils.sheet_add_aoa(worksheet, dataT, { origin: "A10" });

          const workbook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(workbook, worksheet, `${selectedOption.text}`);

          XLSX.writeFile(workbook, `${selectedOption.text}.xlsx`, {
            bookType: "xlsx",
            bookSST: true,
            type: "binary",
            cellStyles: true,
          });
        })
        .catch((error) => {
          console.error("Error al obtener la dirección:", error);
        });
    }
  }
}

const logoutButton = document.getElementById("logout-button");
logoutButton.addEventListener("click", () => {
  localStorage.removeItem("username");
  window.location.href = "/index.html";
  document.body.innerHTML = "<h1>Error: Acceso no autorizado</h1>";
});
