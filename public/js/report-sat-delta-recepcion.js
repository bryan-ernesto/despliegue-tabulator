window.onpageshow = function (event) {
  if (event.persisted) {
    window.location.reload();
  }
};

document.addEventListener("DOMContentLoaded", (event) => {
  const username = (localStorage.getItem("username") || "").toLowerCase();
  const id_cat_usuario = localStorage.getItem("id_cat_usuario");

  if (!username) {
    window.location.href = "/index.html";
    return;
  }

  const usernameElement = document.getElementById("username");
  usernameElement.textContent = username;

  const fechaActual = new Date();
  const primerDiaDelMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1);
  const ultimoDiaDelMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth() + 1, 0);

  const fechaInicialInput = document.getElementById("fecha-inicial");
  const fechaFinalInput = document.getElementById("fecha-final");

  fechaInicialInput.addEventListener("change", function () {
    fechaFinalInput.min = this.value;
  });

  fechaFinalInput.addEventListener("change", function () {
    fechaInicialInput.max = this.value;
  });


  let table;

  document
    .getElementById("descargar-universo-button")
    .addEventListener("click", function () {
      const fechaActual = new Date();
      const primerDiaDelMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1);

      const fechaInicial = primerDiaDelMes.toISOString().split("T")[0];
      const fechaFinal = fechaActual.toISOString().split("T")[0];

      fechaInicialInput.value = fechaInicial;
      fechaFinalInput.value = fechaFinal;

      console.log(fechaInicial, fechaFinal)

      Swal.fire({
        title: "Validando que exista información",
        text: "Esto puede durar varios minutos",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
      fetch(
        "http://192.168.0.8:3000/api/reporteador/Get_Reporte_SatRecepcionDelta",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
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
            initializeTable(
              fechaInicial,
              fechaFinal
            );
            Swal.close();
            const recordCountText =
              document.getElementById("record-count-text");
            recordCountText.textContent = `Cantidad de registros: ${data.length}`;
            recordCountText.style.display = "block";
          } else {
            Swal.fire({
              icon: "warning",
              title: "Advertencia",
              text: "No se encontró información acorde a los filtros seleccionados.",
            });
            const recordCountText =
              document.getElementById("record-count-text");
            recordCountText.style.display = "none";
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
    });

  document
    .getElementById("actualizar-button")
    .addEventListener("click", function () {
      fetch("http://192.168.0.8:3000/api/recepciones_documento/Post_Documento_BitacoraLogin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          "int_id_cat_aplicativo": 29,
          "int_id_cat_usuario": parseInt(id_cat_usuario),
          "int_id_creador": parseInt(id_cat_usuario)
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          const fechaInicial = fechaInicialInput.value;
          const fechaFinal = fechaFinalInput.value;

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
              "http://192.168.0.8:3000/api/reporteador/Get_Reporte_SatRecepcionDelta",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
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
                  initializeTable(
                    fechaInicial,
                    fechaFinal
                  );
                  Swal.close();
                  const recordCountText =
                    document.getElementById("record-count-text");
                  recordCountText.textContent = `Cantidad de registros: ${data.length}`;
                  recordCountText.style.display = "block";
                } else {
                  Swal.fire({
                    icon: "warning",
                    title: "Advertencia",
                    text: "No se encontró información acorde a los filtros seleccionados.",
                  });
                  const recordCountText =
                    document.getElementById("record-count-text");
                  recordCountText.style.display = "none";
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
        })
    });

  function initializeTable(
    fechaInicial,
    fechaFinal
  ) {
    table = new Tabulator("#example-table", {
      layout: "fitData",
      columns: [],
      pagination: "local",
      paginationSize: 25,
      paginationSizeSelector: [10, 25, 50, 100],
      ajaxURL: "http://192.168.0.8:3000/api/reporteador/Get_Reporte_SatRecepcionDelta",
      ajaxConfig: {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      },
      ajaxParams: function (params) {
        return {
          date_fecha_inicial: fechaInicial,
          date_fecha_final: fechaFinal,
        };
      },
      ajaxContentType: "json",
      ajaxResponse: function (url, params, response) {
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

  async function exportTable() {
    if (table) {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("sat-delta-recepcion");

      worksheet.getCell("A1").value = "REPORTE SAT-DELTA-RECEPCIÓN";
      worksheet.getCell("A1").font = { size: 30 };

      worksheet.mergeCells('A4', 'AB4');
      let cellA = worksheet.getCell('A4');
      cellA.value = "Reporte SAT";
      cellA.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

      worksheet.mergeCells('AC4', 'BC4');
      let cellB = worksheet.getCell('AC4');
      cellB.value = "Reporte de Recepción de Documentos";
      cellB.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

      worksheet.mergeCells('BD4', 'BG4');
      let cellC = worksheet.getCell('BG4');
      cellC.value = "Validaciones";
      cellC.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

      cellA.font = { bold: true, size: 12 };
      cellA.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cellA.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD9E1F2' } 
      };

      cellB.font = { bold: true, size: 12 };
      cellB.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cellB.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '14fb78' }
      };

      cellC.font = { bold: true, size: 12 };
      cellC.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cellC.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'd7ef05' }
      };

      const columns = table.getColumns();
      const headers = columns.map((column) => column.getField());
      const data = table.getData().map((row) => Object.values(row));

      let currentRow = worksheet.getRow(5);
      headers.forEach((header, index) => {
        currentRow.getCell(index + 1).value = header;
      });

      data.forEach((rowData, rowIndex) => {
        currentRow = worksheet.getRow(rowIndex + 6);
        rowData.forEach((cellValue, cellIndex) => {
          currentRow.getCell(cellIndex + 1).value = isNaN(cellValue) ? cellValue : Number(cellValue);
        });
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      });
      saveAs(blob, "reporte-sat-delta-recepcion.xlsx");
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
    localStorage.removeItem("selectedCompany");
    localStorage.removeItem("selectedDepartment");
    localStorage.removeItem("selectedEquipment");
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

  function capitalizarCadena(cadena) {
    if (cadena.length <= 4) {
      return cadena.toUpperCase();
    } else {
      const palabras = cadena.split(" ");
      const palabrasCapitalizadas = palabras.map((palabra) => {
        return palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase();
      });
      return palabrasCapitalizadas.join(" ");
    }
  }
});

window.addEventListener('popstate', function (event) {
  location.reload(true);
});

function autoLogout() {
  Swal.fire({
    icon: 'warning',
    title: 'Tiempo de espera terminado',
    text: 'Tu sesión ha expirado. Por favor, vuelve a iniciar sesión.',
    confirmButtonText: 'Aceptar',
    allowOutsideClick: false
  }).then((result) => {
    if (result.isConfirmed) {
      console.log("Sesión expirada, cerrando...");
      localStorage.removeItem("username");
      window.location.href = "/index.html";
    }
  });
}

let logoutTimer;

function resetLogoutTimer() {
  if (logoutTimer) {
    clearTimeout(logoutTimer);
  }
  logoutTimer = setTimeout(autoLogout, 1800000);
}

resetLogoutTimer();

document.addEventListener('mousemove', resetLogoutTimer);
document.addEventListener('keydown', resetLogoutTimer);
document.addEventListener('wheel', resetLogoutTimer);
document.addEventListener('touchmove', resetLogoutTimer);
