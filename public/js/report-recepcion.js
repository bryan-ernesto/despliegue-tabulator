window.onpageshow = function (event) {
  if (event.persisted) {
    window.location.reload();
  }
};

document.addEventListener("DOMContentLoaded", (event) => {
  const username = localStorage.getItem("username");
  const id_cat_usuario = localStorage.getItem("id_cat_usuario");

  if (!username) {
    window.location.href = "/index.html";
    return;
  }

  const usernameElement = document.getElementById("username");
  usernameElement.textContent = username;

  const fechaInicialInput = document.getElementById("fecha-inicial");
  const fechaFinalInput = document.getElementById("fecha-final");
  const empresaSelect = document.getElementById("empresa-select");
  const clearButton = document.getElementById("clear-button");
  const estadoSelect = document.getElementById("estado-select");
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
      const empresasData = data;

      const initialOption = document.createElement("option");
      initialOption.value = "";
      initialOption.text = "Seleccione Empresa";
      initialOption.hidden = true;
      empresaSelect.appendChild(initialOption);

      const selectAllOption = document.createElement("option");
      selectAllOption.value = 0;
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

  fetch(
    "http://192.168.0.8:3000/api/recepciones_documento/Get_Documento_Estado",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        str_nombre: "",
        str_descripcion: "",
        int_estado_final: 2,
      }),
    }
  )
    .then((response) => response.json())
    .then((data) => {
      const estadosData = data;
      const initialOption = document.createElement("option");
      initialOption.value = "";
      initialOption.text = "Seleccione Tipo Estado";
      initialOption.hidden = true;
      estadoSelect.appendChild(initialOption);

      const selectAllOption = document.createElement("option");
      selectAllOption.value = 0;
      selectAllOption.text = "Seleccionar todos los estados";
      estadoSelect.appendChild(selectAllOption);

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

  function initializeTable(nombreEmpresa, idEstado, fechaInicial, fechaFinal) {
    table = new Tabulator("#example-table", {
      layout: "fitData",
      columns: [],
      pagination: "local",
      paginationSize: 25,
      paginationSizeSelector: [10, 25, 50, 100],
      ajaxURL:
        "http://192.168.0.8:3000/api/reporteador/Get_Reporteador_RecepcionDocumento",
      ajaxParams: function (params) {
        return {
          int_id_empresa: nombreEmpresa,
          id_estado: idEstado,
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
          columns.push({ title: header, field: header, headerFilter: "input" });
        });

        table.setColumns(columns);
        return response;
      },
    });

    table.setData();
  }

  document
    .getElementById("actualizar-button")
    .addEventListener("click", function () {
      fetch("http://192.168.0.8:3000/api/recepciones_documento/Post_Documento_BitacoraLogin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          "int_id_cat_aplicativo": 10,
          "int_id_cat_usuario": parseInt(id_cat_usuario),
          "int_id_creador": parseInt(id_cat_usuario)
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          const selectedEmpresa = empresaSelect.value;
          const selectedEstado = estadoSelect.value;
          const fechaInicial = fechaInicialInput.value;
          const fechaFinal = fechaFinalInput.value;

          if (selectedEmpresa) {
            if (selectedEstado) {
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
                  "http://192.168.0.8:3000/api/reporteador/Get_Reporteador_RecepcionDocumento_1",
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      int_id_empresa: selectedEmpresa,
                      id_estado: selectedEstado,
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
                      initializeTable(selectedEmpresa, selectedEstado, fechaInicial, fechaFinal);
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
                text: "Debes seleccionar un estado.",
              });
            }
          } else {
            Swal.fire({
              icon: "error",
              title: "Error",
              text: "Debes seleccionar una empresa.",
            });
          }
        })
    });

  document
    .getElementById("descargar-universo-button")
    .addEventListener("click", function () {
      const selectedEmpresa = 0;
      const selectedEstado = 0;
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
      fetch(
        "http://192.168.0.8:3000/api/reporteador/Get_Reporteador_RecepcionDocumento_1",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            int_id_empresa: selectedEmpresa,
            id_estado: selectedEstado,
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
            initializeTable(selectedEmpresa, selectedEstado, fechaInicial, fechaFinal);
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
      const customHeader = {
        v: "REPORTE RECEPCIÓN DE DOCUMENTOS",
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
      XLSX.utils.book_append_sheet(workbook, worksheet, "recepcion-documentos");

      XLSX.writeFile(workbook, "recepcion-documentos.xlsx", {
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

window.addEventListener('popstate', function (event) {
  location.reload(true);
});