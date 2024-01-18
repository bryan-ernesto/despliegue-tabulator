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

  const usuarioSelect = document.getElementById("usuario-select");
  const clearButton = document.getElementById("clear-button");
  const fechaInicialInput = document.getElementById("fecha-inicial");
  const fechaFinalInput = document.getElementById("fecha-final");

  fetch("http://192.168.0.8:3000/api/usuarios/Get_usuarios", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      str_usuario_nombre: "",
      int_creado_por: 0,
      int_actualizado_por: 0,
      str_username: "",
      int_empresa: 4,
      int_departamento: 0,
      int_equipo: 0
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      const usuariosData = data;

      const initialOption = document.createElement("option");
      initialOption.value = "";
      initialOption.text = "Seleccione Usuario";
      initialOption.hidden = true;
      usuarioSelect.appendChild(initialOption);

      const selectAllOption = document.createElement("option");
      selectAllOption.value = "";
      selectAllOption.text = "Seleccionar todos los usuarios";
      usuarioSelect.appendChild(selectAllOption);

      usuariosData.forEach((usuario) => {
        const option = document.createElement("option");
        option.value = usuario.username;
        option.text = usuario.nombre;
        option.classList.add("usuario-option");
        usuarioSelect.appendChild(option);
      });
    })
    .catch((error) => {
      console.error("Error al obtener las empresas:", error);
    });

  fechaInicialInput.addEventListener("change", function () {
    fechaFinalInput.min = this.value;
  });

  fechaFinalInput.addEventListener("change", function () {
    fechaInicialInput.max = this.value;
  });

  let table;

  document
    .getElementById("actualizar-button")
    .addEventListener("click", function () {
      fetch("http://192.168.0.8:3000/api/recepciones_documento/Post_Documento_BitacoraLogin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          "int_id_cat_aplicativo": 22,
          "int_id_cat_usuario": parseInt(id_cat_usuario),
          "int_id_creador": parseInt(id_cat_usuario)
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          const selectedUsuario = usuarioSelect.value;
          const fechaInicial = fechaInicialInput.value;
          const fechaFinal = fechaFinalInput.value;

          console.log(selectedUsuario)

          if (selectedUsuario !== undefined && selectedUsuario !== null) {
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
                "http://192.168.0.8:3000/api/reporteador/Get_Reporte_Marcaje",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    str_username: selectedUsuario,
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
                    initializeTable(selectedUsuario, fechaInicial, fechaFinal);
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
              text: "Debes seleccionar un usuario.",
            });
          }
        })
    });

  function initializeTable(selectedUsuario, fechaInicial, fechaFinal) {
    table = new Tabulator("#example-table", {
      layout: "fitColumns",
      columns: [],
      pagination: "local",
      paginationSize: 25,
      paginationSizeSelector: [10, 25, 50, 100],
      ajaxURL:
        "http://192.168.0.8:3000/api/reporteador/Get_Reporte_Marcaje",
      ajaxConfig: {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      },
      ajaxParams: function (params) {
        return {
          str_username: selectedUsuario,
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
    usuarioSelect.value = "";
    table.clearData();
  });

  function exportTable() {
    if (table) {
      const customHeader = {
        v: "REPORTE MARCAJE",
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

      XLSX.writeFile(workbook, "reporte-marcaje.xlsx", {
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
