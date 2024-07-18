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

  const fechaInicialInput = document.getElementById("fecha-inicial");
  const fechaFinalInput = document.getElementById("fecha-final");

  let table;

  fechaInicialInput.addEventListener("change", function () {
    fechaFinalInput.min = this.value;
  });

  fechaFinalInput.addEventListener("change", function () {
    fechaInicialInput.max = this.value;
  });

  document
    .getElementById("actualizar-button")
    .addEventListener("click", function () {
      fetch(
        "http://192.168.0.8:3000/api/recepciones_documento/Post_Documento_BitacoraLogin",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            int_id_cat_aplicativo: 40,
            int_id_cat_usuario: parseInt(id_cat_usuario),
            int_id_creador: parseInt(id_cat_usuario),
          }),
        }
      )
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
              "http://192.168.0.8:3000/api/reporteador/Get_Reporte_Quejas_General",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  date_fecha_inicial: "",
                  date_fecha_final: "",
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
                  initializeTable(fechaInicial, fechaFinal);
                  Swal.close();
                  const recordCountText =
                    document.getElementById("record-count-text");
                  recordCountText.textContent = `Cantidad de registros: ${data.length}`;
                  recordCountText.style.display = "block";

                  let tableElement = document.getElementById("example-table");
                  let tablePosition = tableElement.offsetTop;
                  recordCountText.style.top = `${
                    tablePosition - recordCountText.offsetHeight - 30
                  }px`;
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
        });
    });

  function initializeTable(fechaInicial, fechaFinal) {
    table = new Tabulator("#example-table", {
      layout: "fitRows",
      columns: [],
      pagination: "local",
      paginationSize: 25,
      paginationSizeSelector: [10, 25, 50, 100],
      ajaxURL: "http://192.168.0.8:3000/api/reporteador/Get_Reporte_Quejas_General",
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

  document
    .getElementById("descargar-universo-button")
    .addEventListener("click", function () {
      const fechaInicial = "";
      const fechaFinal = "";
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
      fetch("http://192.168.0.8:3000/api/reporteador/Get_Reporte_Quejas_General", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date_fecha_inicial: fechaInicial,
          date_fecha_final: fechaFinal,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data && data.length > 0) {
            Swal.update({
              title: "Enviando parámetros...",
              text: "Esto puede durar varios minutos",
            });
            initializeTable(fechaInicial, fechaFinal, username);
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
    });

  function exportTable() {
    if (table) {
      const customHeader = {
        v: "BOMRI y BOMRE",
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
      XLSX.utils.sheet_add_aoa(worksheet, dataT, { origin: "A5" });

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Registros");

      XLSX.writeFile(workbook, "reporte-quejas.xlsx", {
        bookType: "xlsx",
        bookSST: true,
        type: "binary",
        cellStyles: true,
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No hay datos en la tabla para exportar.",
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

  const sidebarButtons = document.querySelectorAll(".sidebar-button");

  sidebarButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const targetPage = this.getAttribute("data-target");

      window.location.href = targetPage;
    });
  });
});

window.addEventListener("popstate", function (event) {
  location.reload(true);
});

function autoLogout() {
  Swal.fire({
    icon: "warning",
    title: "Tiempo de espera terminado",
    text: "Tu sesión ha expirado. Por favor, vuelve a iniciar sesión.",
    confirmButtonText: "Aceptar",
    allowOutsideClick: false,
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

document.addEventListener("mousemove", resetLogoutTimer);
document.addEventListener("keydown", resetLogoutTimer);
document.addEventListener("wheel", resetLogoutTimer);
document.addEventListener("touchmove", resetLogoutTimer);
