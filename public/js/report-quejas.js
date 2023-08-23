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

  const tipoSelect = document.getElementById("tipo-select");
  const clearButton = document.getElementById("clear-button");
  const empresaSelect = document.getElementById("empresa-select");
  const clearButtonE = document.getElementById("clear-button-e");
  const estadoSelect = document.getElementById("estado-select");
  const clearButtonES = document.getElementById("clear-button-es");
  const fechaInicialInput = document.getElementById("fecha-inicial");
  const fechaFinalInput = document.getElementById("fecha-final");

  fetch("http://192.168.0.8:3000/api/sharepoint/Get_Sharepoint_QuejasTipo", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      const tipoData = data;
      const initialOption = document.createElement("option");
      initialOption.value = "";
      initialOption.text = "Seleccione Tipo";
      initialOption.hidden = true;
      tipoSelect.appendChild(initialOption);

      const selectAllOption = document.createElement("option");
      selectAllOption.value = "";
      selectAllOption.text = "Seleccionar todos los tipos";
      tipoSelect.appendChild(selectAllOption);

      tipoData.forEach((tipo) => {
        const option = document.createElement("option");
        option.value = tipo.Tipo;
        option.text = tipo.Tipo;
        option.classList.add("tipo-option");
        tipoSelect.appendChild(option);
      });
    })
    .catch((error) => {
      console.error("Error al obtener los estados:", error);
    });

  fetch("http://192.168.0.8:3000/api/sharepoint/Get_Sharepoint_QuejasEmpresa", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      const estadosData = data;

      const initialOption = document.createElement("option");
      initialOption.value = "";
      initialOption.text = "Seleccione Empresa";
      initialOption.hidden = true;
      empresaSelect.appendChild(initialOption);

      const selectAllOption = document.createElement("option");
      selectAllOption.value = "";
      selectAllOption.text = "Seleccionar todas las empresas";
      empresaSelect.appendChild(selectAllOption);

      estadosData.forEach((empresa) => {
        const option = document.createElement("option");
        option.value = empresa.Empresa;
        option.text = empresa.Empresa;
        option.classList.add("empresa-option");
        empresaSelect.appendChild(option);
      });
    })
    .catch((error) => {
      console.error("Error al obtener las empresas:", error);
    });

  fetch("http://192.168.0.8:3000/api/sharepoint/Get_Sharepoint_QuejasEstado", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      const estadosData = data;

      const initialOption = document.createElement("option");
      initialOption.value = "";
      initialOption.text = "Seleccione Estado";
      initialOption.hidden = true;
      estadoSelect.appendChild(initialOption);

      const selectAllOption = document.createElement("option");
      selectAllOption.value = "";
      selectAllOption.text = "Seleccionar todos los estados";
      estadoSelect.appendChild(selectAllOption);

      estadosData.forEach((estado) => {
        const option = document.createElement("option");
        option.value = estado.Estado;
        option.text = estado.Estado;
        option.classList.add("empresa-option");
        estadoSelect.appendChild(option);
      });
    })
    .catch((error) => {
      console.error("Error al obtener los estados:", error);
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
          "int_id_cat_aplicativo": 23,
          "int_id_cat_usuario": parseInt(id_cat_usuario),
          "int_id_creador": parseInt(id_cat_usuario)
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          const selectedTipo = tipoSelect.value;
          const selectedEmpresa = empresaSelect.value;
          const selectedEstado = estadoSelect.value;
          const fechaInicial = fechaInicialInput.value;
          const fechaFinal = fechaFinalInput.value;
          if (selectedTipo !== undefined && selectedTipo !== null) {
            if (selectedEmpresa !== undefined && selectedEmpresa !== null) {
              if (selectedEstado !== undefined && selectedEstado !== null) {
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
                    "http://192.168.0.8:3000/api/sharepoint/Get_Sharepoint_Quejas",
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        str_tipo: selectedTipo,
                        str_empresa: selectedEmpresa,
                        str_estado: selectedEstado,
                        fecha_inicio: fechaInicial,
                        fecha_final: fechaFinal,
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
                          selectedTipo,
                          selectedEmpresa,
                          selectedEstado,
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
          } else {
            Swal.fire({
              icon: "error",
              title: "Error",
              text: "Debes seleccionar un tipo.",
            });
          }
        })
    });

  function initializeTable(
    selectedTipo,
    selectedEmpresa,
    selectedEstado,
    fechaInicial,
    fechaFinal
  ) {
    table = new Tabulator("#example-table", {
      layout: "fitData",
      columns: [],
      pagination: "local",
      paginationSize: 25,
      paginationSizeSelector: [10, 25, 50, 100],
      ajaxURL: "http://192.168.0.8:3000/api/sharepoint/Get_Sharepoint_Quejas_1",
      ajaxConfig: {
        method: "POST", // Cambia a POST
        headers: {
          "Content-Type": "application/json",
        },
      },
      ajaxParams: function (params) {
        return {
          str_tipo: selectedTipo,
          str_empresa: selectedEmpresa,
          str_estado: selectedEstado,
          fecha_inicio: fechaInicial,
          fecha_final: fechaFinal,
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

  document
    .getElementById("descargar-universo-button")
    .addEventListener("click", function () {
      Swal.fire({
        title: "Validando que exista información",
        text: "Esto puede durar varios minutos",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
      fetch("http://192.168.0.8:3000/api/sharepoint/Get_Sharepoint_Quejas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          str_tipo: "",
          str_empresa: "",
          str_estado: "",
          fecha_inicio: "",
          fecha_final: "",
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data && data.length > 0) {
            Swal.update({
              title: "Enviando parámetros...",
              text: "Esto puede durar varios minutos",
            });
            initializeTable();
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
        v: "REPORTE DE QUEJAS",
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
    }
  }

  document
    .getElementById("export-table")
    .addEventListener("click", function () {
      exportTable();
    });

  clearButton.addEventListener("click", () => {
    tipoSelect.value = "";
    table.clearData();
  });

  clearButtonE.addEventListener("click", () => {
    empresaSelect.value = "";
    table.clearData();
  });

  clearButtonES.addEventListener("click", () => {
    estadoSelect.value = "";
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
});

window.addEventListener('popstate', function (event) {
  location.reload(true);
});