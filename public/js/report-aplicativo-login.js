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

  const aplicativoSelect = document.getElementById("aplicativo-select");
  const clearButton = document.getElementById("clear-button");
  const fechaInicialInput = document.getElementById("fecha-inicial");
  const fechaFinalInput = document.getElementById("fecha-final");

  fetch("http://192.168.0.8:3000/api/reporteador/Get_Reporte_Documento_Aplicativo", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      int_id_aplicativo: 0
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      const aplicativoData = data;

      const initialOption = document.createElement("option");
      initialOption.value = "";
      initialOption.text = "Seleccione Aplicativo";
      initialOption.hidden = true;
      aplicativoSelect.appendChild(initialOption);

      const selectAllOption = document.createElement("option");
      selectAllOption.value = "0";
      selectAllOption.text = "Seleccionar todos los aplicativos";
      aplicativoSelect.appendChild(selectAllOption);

      aplicativoData.forEach((aplicativo) => {
        const option = document.createElement("option");
        option.value = aplicativo.id_cat_aplicativo;
        option.text = aplicativo.nombre;
        option.classList.add("aplicativo-option");
        aplicativoSelect.appendChild(option);
      });
    })
    .catch((error) => {
      console.error("Error al obtener los aplicativos:", error);
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
          "int_id_cat_aplicativo": 27,
          "int_id_cat_usuario": parseInt(id_cat_usuario),
          "int_id_creador": parseInt(id_cat_usuario)
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          const selectedAplicativo = aplicativoSelect.value;
          const fechaInicial = fechaInicialInput.value;
          const fechaFinal = fechaFinalInput.value;

          if (selectedAplicativo) {
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
                "http://192.168.0.8:3000/api/reporteador/Get_Reporte_Documento_Login",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    int_id_aplicativo: selectedAplicativo,
                    date_creacion_inicio: fechaInicial,
                    date_creacion_fin: fechaFinal,
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
                    initializeTable(selectedAplicativo, fechaInicial, fechaFinal);
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
                  console.log(selectedAplicativo)
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
              text: "Debes seleccionar un aplicativo.",
            });
          }
        })
    });

  function initializeTable(selectedAplicativo, fechaInicial, fechaFinal) {
    table = new Tabulator("#example-table", {
      layout: "fitData",
      columns: [],
      pagination: "local",
      paginationSize: 25,
      paginationSizeSelector: [10, 25, 50, 100],
      ajaxURL:
        "http://192.168.0.8:3000/api/reporteador/Get_Reporte_Documento_Login",
        ajaxConfig: {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        },
      ajaxParams: function (params) {
        return {
          int_id_aplicativo: selectedAplicativo,
          date_creacion_inicio: fechaInicial,
          date_creacion_fin: fechaFinal,
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
      const customHeader = {
        v: "REPORTE LOGIN APLICATIVO",
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

      XLSX.writeFile(workbook, "reporte-aplicativo.login.xlsx", {
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
