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

  const procesoSelect = document.getElementById("estado-select");
  const clearButton = document.getElementById("clear-button");
  const clearButtonE = document.getElementById("clear-button-e");
  const fechaInicialInput = document.getElementById("fecha-inicial");
  const fechaFinalInput = document.getElementById("fecha-final");

  fetch("http://192.168.0.8:3000/api/cronograma_pagos/Get_Cronograma_Estado", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      str_nombre: "",
      int_estado: 2,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      const procesosData = data;

      const initialOption = document.createElement("option");
      initialOption.value = "";
      initialOption.text = "Seleccione Estado";
      initialOption.hidden = true;
      procesoSelect.appendChild(initialOption);

      const selectAllOption = document.createElement("option");
      selectAllOption.value = "0";
      selectAllOption.text = "Seleccionar todos los Estados";
      procesoSelect.appendChild(selectAllOption);

      procesosData.forEach((proceso) => {
        const option = document.createElement("option");
        option.value = proceso.id_estado;
        option.text = proceso.nombre_estado;
        option.classList.add("proceso-option");
        procesoSelect.appendChild(option);
      });
    })
    .catch((error) => {
      console.error("Error al obtener los estados:", error);
    });

  let table;

  fechaInicialInput.addEventListener("change", function () {
    fechaFinalInput.min = this.value;
  });

  fechaFinalInput.addEventListener("change", function () {
    fechaInicialInput.max = this.value;
  });

  document
    .getElementById("descargar-universo-button")
    .addEventListener("click", function () {
      const selectEstado = "0";
      const fechaInicial = "" ?? "";
      const fechaFinal = "" ?? "";
      procesoSelect.value = "";
      fechaInicialInput.value = "";
      fechaFinalInput.value = "";
      Swal.fire({
        title: "Validando que exista información",
        text: "Esto puede durar varios minutos",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
      fetch(
        "http://192.168.0.8:3000/api/reporteador/Get_Reporte_Cronograma_Tarea",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            int_id_estado_tarea: selectEstado,
            date_fecha_inicial: fechaInicial,
            date_fecha_final: fechaFinal
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
              selectEstado,
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
          "int_id_cat_aplicativo": 35,
          "int_id_cat_usuario": parseInt(id_cat_usuario),
          "int_id_creador": parseInt(id_cat_usuario)
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          const selectedProceso = procesoSelect.value;
          const fechaInicial = fechaInicialInput.value;
          const fechaFinal = fechaFinalInput.value;

          if (selectedProceso) {
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
                  "http://192.168.0.8:3000/api/reporteador/Get_Reporte_Cronograma_Tarea",
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      int_id_estado_tarea: selectedProceso,
                      date_fecha_inicial: fechaInicial,
                      date_fecha_final: fechaFinal
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
                        selectedProceso,
                        fechaInicial,
                        fechaFinal
                      );
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
              text: "Debes seleccionar un proceso.",
            });
          }
        })
    });

  function initializeTable(
    selectedProceso,
    fechaInicial,
    fechaFinal
  ) {
    table = new Tabulator("#example-table", {
      layout: "fitData",
      columns: [],
      pagination: "local",
      paginationSize: 25,
      paginationSizeSelector: [10, 25, 50, 100],
      ajaxURL: "http://192.168.0.8:3000/api/reporteador/Get_Reporte_Cronograma_Tarea",
      ajaxConfig: {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      },
      ajaxParams: function (params) {
        return {
          int_id_estado_tarea: selectedProceso,
          date_fecha_inicial: fechaInicial,
          date_fecha_final: fechaFinal
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

  function exportTable() {
    if (table) {
      const customHeader = {
        v: "REPORTE CRONOGRAMA",
        s: { font: { sz: 30 } },
      };

      const worksheet = XLSX.utils.aoa_to_sheet([]);
      worksheet["A1"] = { ...customHeader };

      const columns = table.getColumns();
      const headers = columns.map((column) => column.getField());
      const dataT = [
        headers,
        ...table.getData().map((row) => Object.values(row)),
      ];
      XLSX.utils.sheet_add_aoa(worksheet, dataT, { origin: "A9" });

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Registros");

      XLSX.writeFile(workbook, "reporte-cronograma.xlsx", {
        bookType: "xlsx",
        bookSST: true,
        type: "binary",
        cellStyles: true,
      });
    } else {
    }
  }

  document
    .getElementById("export-table")
    .addEventListener("click", function () {
      exportTable();
    });

  clearButton.addEventListener("click", () => {
    procesoSelect.value = "";
    table.clearData();
  });

  clearButtonE.addEventListener("click", () => {
    usuarioSelect.value = "";
    table.clearData();
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
  logoutTimer = setTimeout(function () {
    // Eliminar el username del localStorage al expirar el tiempo
    localStorage.removeItem("username");
    autoLogout();
  }, 1800000);
}

resetLogoutTimer();

document.addEventListener('mousemove', resetLogoutTimer);
document.addEventListener('keydown', resetLogoutTimer);
document.addEventListener('wheel', resetLogoutTimer);
document.addEventListener('touchmove', resetLogoutTimer);
