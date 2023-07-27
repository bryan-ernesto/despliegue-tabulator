document.addEventListener("DOMContentLoaded", (event) => {
  const username = localStorage.getItem("username");

  if (!username) {
    window.location.href = "/index.html"; // Reemplaza con la URL de tu página de inicio de sesión
    return; // Esto es importante para que el código después de esto no se ejecute si el usuario no está autenticado
  }

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
                const recordCountText =
                  document.getElementById("record-count-text");
                recordCountText.textContent = `Cantidad de registros: ${data.length}`;
                recordCountText.style.display = "block"; // Mostrar el elemento
              } else {
                Swal.fire({
                  icon: "warning",
                  title: "Advertencia",
                  text: "No se encontró información acorde a los filtros seleccionados.",
                });
                // Ocultar el texto cuando no hay registros
                const recordCountText =
                  document.getElementById("record-count-text");
                recordCountText.style.display = "none"; // Ocultar el elemento
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

  async function exportTable() {
    if (table) {
      const selectedOption = empresaSelect.selectedOptions[0];
      const razonSocial = selectedOption.getAttribute("data-razon-social");
      const empresaId = selectedOption.value;

      const fechaInicial = fechaInicialInput.value;
      const fechaFinal = fechaFinalInput.value;

      const workbook = new ExcelJS.Workbook();
      workbook.creator = "Me";
      workbook.lastModifiedBy = "Me";
      workbook.created = new Date();
      workbook.modified = new Date();
      const sheet = workbook.addWorksheet(
        selectedOption.value === "0" ? "Registros" : selectedOption.text
      );

      let startRow = 7;
      sheet.getCell("A1").value = "LIBRO DE COMPRAS";
      sheet.getCell("A1").font = { size: 30 };

      if (selectedOption.value === "0") {
        sheet.getCell("A3").value = "Todas las empresas";
        sheet.getCell("A3").font = { size: 12 };
      } else {
        const response = await fetch(
          "http://192.168.0.8:3000/api/delta/Get_Reporte_Empresa_Direccion",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              str_numero: empresaId,
            }),
          }
        );
        const data = await response.json();
        const direccion = data[0].DIRECCION;

        sheet.getCell("A3").value = "Razón Social: " + razonSocial;
        sheet.getCell("A3").font = { size: 12 };
        sheet.getCell("A4").value = "Dirección Comercial: " + direccion;
        sheet.getCell("A4").font = { size: 12 };
      }

      sheet.getCell("A5").value =
        "Fechas: " + fechaInicial + " - " + fechaFinal;
      sheet.getCell("A5").font = { size: 12 };

      const columns = table.getColumns();
      const headers = columns.map((column) => column.getField());
      const data = table.getData().map((row) => Object.values(row));

      headers.forEach((header, i) => {
        sheet.getCell(`${String.fromCharCode(65 + i)}${startRow}`).value =
          header;
      });

      data.forEach((row, i) => {
        row.forEach((value, j) => {
          sheet.getCell(
            `${String.fromCharCode(65 + j)}${i + startRow + 1}`
          ).value = isNaN(value) ? value : Number(value);
        });
      });

      workbook.xlsx.writeBuffer().then(function (buffer) {
        let blob = new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        saveAs(
          blob,
          selectedOption.value === "0"
            ? "registros.xlsx"
            : `${selectedOption.text}.xlsx`
        );
      });
    }
  }
  
  document
    .getElementById("export-table")
    .addEventListener("click", function () {
      exportTable();
    });

  const logoutButton = document.getElementById("logout-button");
  logoutButton.addEventListener("click", () => {
    localStorage.removeItem("username");
    window.location.href = "/index.html";
    document.body.innerHTML = "<h1>Error: Acceso no autorizado</h1>";
  });
});
