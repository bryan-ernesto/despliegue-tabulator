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
  const empresa = localStorage.getItem("selectedCompany");
  const departamento = localStorage.getItem("selectedDepartment");
  const equipo = localStorage.getItem("selectedEquipment");

  const usernameElement = document.getElementById("username");
  usernameElement.textContent = username;

  const estadoSelect = document.getElementById("estado-select");
  const clearButton = document.getElementById("clear-button");
  const empresaSelect = document.getElementById("empresa-select");
  const clearButtonE = document.getElementById("clear-button-e");
  const fechaInicialInput = document.getElementById("fecha-inicial");
  const fechaFinalInput = document.getElementById("fecha-final");

  fetch("http://192.168.0.8:3000/api/compras/Get_Compras_OdcEstado", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      int_id_odc_estado: 0,
      str_nombre: "",
      int_orden: 0,
      int_estado: 2
    }),
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
      selectAllOption.value = "0";
      selectAllOption.text = "Seleccionar todas los estados";
      estadoSelect.appendChild(selectAllOption);

      estadosData.forEach((estado) => {
        const option = document.createElement("option");
        option.value = estado.id_odc_estado;
        option.text = estado.nombre;
        option.classList.add("estado-option");
        estadoSelect.appendChild(option);
      });
    })
    .catch((error) => {
      console.error("Error al obtener los estados:", error);
    });

  fetch(
    "http://192.168.0.8:3000/api/reporteador/Get_Reporteador_EmpresasInternas",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        str_empresa_nombre: "",
        int_id_delta: 0,
        str_nombre_delta: "",
        int_creado_por: 0,
        int_actualizado_por: 0
      }),
    }
  )
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
        option.value = empresa.empresa_id_cat_empresa;
        option.text = capitalizarCadena(empresa.empresa_nombre);
        option.classList.add("empresa-option");
        empresaSelect.appendChild(option);
      });
    })
    .catch((error) => {
      console.error("Error al obtener los usuarios:", error);
    });

  let table;

  document
    .getElementById("descargar-universo-button")
    .addEventListener("click", function () {
      const selectedEstado = "0";
      const selectedEmpresa = "0";
      const fechaInicial = "" ?? "";
      const fechaFinal = "" ?? "";
      estadoSelect.value = "";
      empresaSelect.value = "";
      fechaInicialInput.value = "";
      fechaFinalInput.value = "";
      initializeTable(
        selectedEstado,
        selectedEmpresa,
        fechaInicial,
        fechaFinal
      );
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
          "int_id_cat_aplicativo": 18,
          "int_id_cat_usuario": parseInt(id_cat_usuario),
          "int_id_creador": parseInt(id_cat_usuario)
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          const selectedEstado = estadoSelect.value;
          const selectedEmpresa = empresaSelect.value;
          const fechaInicial = fechaInicialInput.value;
          const fechaFinal = fechaFinalInput.value;

          console.log(selectedEstado, selectedEmpresa, fechaInicial, fechaFinal)

          if (selectedEstado) {
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
                  "http://192.168.0.8:3000/api/reporteador/Get_Reporte_Compras_Odc",
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      int_id_cat_empresa: selectedEmpresa,
                      str_nombre_empresa: "",
                      int_id_cat_usuario: 0,
                      str_nombre_usuario: "",
                      int_id_odc_estado: selectedEstado,
                      str_nombre_odc_estado: "",
                      str_nombre_proveedor: "",
                      str_nit_proveedor: "",
                      str_forma_pago: "",
                      int_id_categoria: "",
                      str_nombre_categoria: "",
                      str_estado_presupuesto: "",
                      str_tipo: "",
                      int_id_moneda: 0,
                      str_nombre_moneda: "",
                      int_apro1_id_usuario: 0,
                      str_apro1_nombre: "",
                      int_apro2_id_usuario: 0,
                      str_apro2_nombre: "",
                      int_apro3_id_usuario: 0,
                      str_apro3_nombre: "",
                      int_apro4_id_usuario: 0,
                      str_apro4_nombre: "",
                      int_estado: 2,
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
                        selectedEstado,
                        selectedEmpresa,
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
                text: "Debes seleccionar un usuario.",
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
    selectedEstado,
    selectedEmpresa,
    fechaInicial,
    fechaFinal
  ) {
    table = new Tabulator("#example-table", {
      layout: "fitData",
      columns: [],
      pagination: "local",
      paginationSize: 25,
      paginationSizeSelector: [10, 25, 50, 100],
      ajaxURL: "http://192.168.0.8:3000/api/reporteador/Get_Reporte_Compras_Odc",
      ajaxConfig: {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      },
      ajaxParams: function (params) {
        return {
          int_id_cat_empresa: selectedEmpresa,
          str_nombre_empresa: "",
          int_id_cat_usuario: 0,
          str_nombre_usuario: "",
          int_id_odc_estado: selectedEstado,
          str_nombre_odc_estado: "",
          str_nombre_proveedor: "",
          str_nit_proveedor: "",
          str_forma_pago: "",
          int_id_categoria: "",
          str_nombre_categoria: "",
          str_estado_presupuesto: "",
          str_tipo: "",
          int_id_moneda: 0,
          str_nombre_moneda: "",
          int_apro1_id_usuario: 0,
          str_apro1_nombre: "",
          int_apro2_id_usuario: 0,
          str_apro2_nombre: "",
          int_apro3_id_usuario: 0,
          str_apro3_nombre: "",
          int_apro4_id_usuario: 0,
          str_apro4_nombre: "",
          int_estado: 2,
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

  function exportTable() {
    if (table) {
      const customHeader = {
        v: "REPORTE DE COMPRAS ODC",
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
      XLSX.utils.book_append_sheet(workbook, worksheet, "ODC");

      XLSX.writeFile(workbook, "reporte-compras-odc.xlsx", {
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
    estadoSelect.value = "";
    table.clearData();
  });

  clearButtonE.addEventListener("click", () => {
    empresaSelect.value = "";
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
