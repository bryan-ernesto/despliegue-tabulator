document.addEventListener("DOMContentLoaded", (event) => {
  const username = localStorage.getItem("username");
  if (!username) {
    window.location.href = "/index.html"; // Reemplaza con la URL de tu página de inicio de sesión
    return; // Esto es importante para que el código después de esto no se ejecute si el usuario no está autenticado
  }
  const empresa = localStorage.getItem("selectedCompany");
  const departamento = localStorage.getItem("selectedDepartment");
  const equipo = localStorage.getItem("selectedEquipment");

  const usernameElement = document.getElementById("username");
  usernameElement.textContent = username;

  const procesoSelect = document.getElementById("proceso-select");
  const clearButton = document.getElementById("clear-button");
  const usuarioSelect = document.getElementById("usuario-select");
  const clearButtonE = document.getElementById("clear-button-e");
  const fechaInicialInput = document.getElementById("fecha-inicial");
  const fechaFinalInput = document.getElementById("fecha-final");

  fetch("http://192.168.0.8:3000/api/nova_ticket/Get_Ticket_EstadoProceso", {
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
      initialOption.text = "Seleccione Proceso";
      initialOption.hidden = true;
      procesoSelect.appendChild(initialOption);

      const selectAllOption = document.createElement("option");
      selectAllOption.value = "0";
      selectAllOption.text = "Seleccionar todas los procesos";
      procesoSelect.appendChild(selectAllOption);

      procesosData.forEach((proceso) => {
        const option = document.createElement("option");
        option.value = proceso.id_ticket_estado_proceso;
        option.text = proceso.nombre;
        option.classList.add("proceso-option");
        procesoSelect.appendChild(option);
      });
    })
    .catch((error) => {
      console.error("Error al obtener los estados:", error);
    });

  fetch(
    "http://192.168.0.8:3000/api/reporteador/Get_Usuarios_Reporte_Tickets",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        int_id_equipo: equipo,
      }),
    }
  )
    .then((response) => response.json())
    .then((data) => {
      const usuariosData = data;

      const initialOption = document.createElement("option");
      initialOption.value = "";
      initialOption.text = "Seleccione Usuario";
      initialOption.hidden = true;
      usuarioSelect.appendChild(initialOption);

      const selectAllOption = document.createElement("option");
      selectAllOption.value = "0";
      selectAllOption.text = "Seleccionar todos los usuarios";
      usuarioSelect.appendChild(selectAllOption);

      usuariosData.forEach((usuario) => {
        const option = document.createElement("option");
        option.value = usuario.usuario_responsable;
        option.text = capitalizarCadena(usuario.nombre);
        option.classList.add("usuario-option");
        usuarioSelect.appendChild(option);
      });
    })
    .catch((error) => {
      console.error("Error al obtener los usuarios:", error);
    });

  let table;

  document
    .getElementById("descargar-universo-button")
    .addEventListener("click", function () {
      const selectEquipo = equipo;
      const selectDepartamento = departamento;
      const selectEmpresa = empresa;
      const selectProceso = "0";
      const selectUsuario = "0";
      const fechaInicial = "" ?? "";
      const fechaFinal = "" ?? "";
      procesoSelect.value = "";
      usuarioSelect.value = "";
      fechaInicialInput.value = "";
      fechaFinalInput.value = "";
      initializeTable(
        selectEquipo,
        selectDepartamento,
        selectEmpresa,
        selectProceso,
        selectUsuario,
        fechaInicial,
        fechaFinal
      );
    });

  document
    .getElementById("actualizar-button")
    .addEventListener("click", function () {
      const selectedProceso = procesoSelect.value;
      const selectedUsuario = usuarioSelect.value;
      const fechaInicial = fechaInicialInput.value;
      const fechaFinal = fechaFinalInput.value;

      if (selectedProceso) {
        if (selectedUsuario) {
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
              "http://192.168.0.8:3000/api/reporteador/Get_Reporte_Tickets_1",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  int_id_equipo: equipo,
                  int_id_departamento: departamento,
                  int_id_empresa: empresa,
                  string_nombre_referencia: "",
                  int_id_prioridad: 0,
                  int_estado_resolucion: 0,
                  int_id_proceso: selectedProceso,
                  int_id_cat_tipo: 0,
                  int_id_cat_canal: 0,
                  int_id_cat_seguimiento: 0,
                  int_id_cat_responsable: selectedUsuario,
                  int_id_cat_solicitante: 0,
                  int_id_cat_creado_por: 0,
                  date_asignacion_inicio: "",
                  date_asignacion_fin: "",
                  date_resolucion_inicio: "",
                  date_resolucion_fin: "",
                  date_ultima_vista_inicio: "",
                  date_ultima_vista_fin: "",
                  date_vencimiento_inicio: "",
                  date_vencimiento_fin: "",
                  date_primera_respuesta_inicio: "",
                  date_primera_respuesta_fin: "",
                  date_creacion_inicio: fechaInicial,
                  date_creacion_fin: fechaFinal,
                  date_actualizacion_inicio: "",
                  date_actualizacion_fin: "",
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
                    equipo,
                    departamento,
                    empresa,
                    selectedProceso,
                    selectedUsuario,
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
    });

  function initializeTable(
    equipo,
    departamento,
    empresa,
    selectedProceso,
    selectedUsuario,
    fechaInicial,
    fechaFinal
  ) {
    table = new Tabulator("#example-table", {
      layout: "fitData",
      columns: [],
      pagination: "local",
      paginationSize: 25,
      paginationSizeSelector: [10, 25, 50, 100],
      ajaxURL: "http://192.168.0.8:3000/api/reporteador/Get_Reporte_Tickets",
      ajaxParams: function (params) {
        return {
          int_id_equipo: equipo,
          int_id_departamento: departamento,
          int_id_empresa: empresa,
          string_nombre_referencia: "",
          int_id_prioridad: 0,
          int_estado_resolucion: 0,
          int_id_proceso: selectedProceso,
          int_id_cat_tipo: 0,
          int_id_cat_canal: 0,
          int_id_cat_seguimiento: 0,
          int_id_cat_responsable: selectedUsuario,
          int_id_cat_solicitante: 0,
          int_id_cat_creado_por: 0,
          date_asignacion_inicio: "",
          date_asignacion_fin: "",
          date_resolucion_inicio: "",
          date_resolucion_fin: "",
          date_ultima_vista_inicio: "",
          date_ultima_vista_fin: "",
          date_vencimiento_inicio: "",
          date_vencimiento_fin: "",
          date_primera_respuesta_inicio: "",
          date_primera_respuesta_fin: "",
          date_creacion_inicio: fechaInicial,
          date_creacion_fin: fechaFinal,
          date_actualizacion_inicio: "",
          date_actualizacion_fin: "",
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
        v: "REPORTE DE TICKETS",
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

      XLSX.writeFile(workbook, "registros.xlsx", {
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
