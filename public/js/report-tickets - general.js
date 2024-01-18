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

  const empresaSelect = document.getElementById("empresa-select");
  const clearButton = document.getElementById("clear-button");
  const departamentoSelect = document.getElementById("departamento-select");
  const clearButtonD = document.getElementById("clear-button-e");
  const equipoSelect = document.getElementById("equipo-select");
  const clearButtonE = document.getElementById("clear-button-d");

  let empresasData;

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
        str_tipo: "",
        int_creado_por: 0,
        int_actualizado_por: 0,
      }),
    }
  )
    .then((response) => response.json())
    .then((data) => {
      empresasData = data;

      const initialOption = document.createElement("option");
      initialOption.value = "";
      initialOption.text = "Seleccione Empresa";
      initialOption.hidden = true;
      empresaSelect.appendChild(initialOption);

      empresasData.forEach((empresa) => {
        const option = document.createElement("option");
        option.value = empresa.empresa_id_cat_empresa;
        option.text = empresa.empresa_nombre;
        option.classList.add("empresa-option");
        empresaSelect.appendChild(option);
      });
    })
    .catch((error) => {
      console.error("Error al obtener las empresas:", error);
    });

  empresaSelect.addEventListener("change", () => {
    const selectedCompany = empresaSelect.value;

    if (selectedCompany !== "") {
      const selectedEmpresa = empresasData.find(
        (empresa) =>
          empresa.empresa_id_cat_empresa === parseInt(selectedCompany)
      );

      const companyId = selectedEmpresa.empresa_id_cat_empresa;
      const nameDept = selectedEmpresa.departamento_nombre;

      fetch("http://192.168.0.8:3000/api/usuarios/Get_departamentos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          str_departamento_nombre: "",
          int_creado_por: 0,
          int_actualizado_por: 0,
          int_id_cat_empresa: companyId,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          departamentoSelect.innerHTML = "";

          const initialOption = document.createElement("option");
          initialOption.value = "";
          initialOption.text = "Seleccione Departamento";
          initialOption.hidden = true;
          departamentoSelect.appendChild(initialOption);

          data.forEach((departamento) => {
            const option = document.createElement("option");
            option.value = departamento.departamento_id_cat_departamento;
            option.text = capitalizarCadena(departamento.departamento_nombre);
            departamentoSelect.appendChild(option);
          });
        })
        .catch((error) => {
          console.error("Error al obtener los departamentos:", error);
        });
    } else {
      departamentoSelect.innerHTML = "";
      equipoSelect.innerHTML = "";
      showPageButton1.style.display = "none";
      showPageButton2.style.display = "none";
      showPageButton3.style.display = "none";
      showPageButton4.style.display = "none";
      showPageButton5.style.display = "none";
      showPageButton6.style.display = "none";
    }
  });

  departamentoSelect.addEventListener("change", () => {
    const selectedDepartment = departamentoSelect.value; // Obtenemos el departamento seleccionado
    const selectedCompany = empresaSelect.value;

    if (selectedCompany !== "") {
      const selectedEmpresa = empresasData.find(
        (empresa) =>
          empresa.empresa_id_cat_empresa === parseInt(selectedCompany)
      );

      const companyId = selectedEmpresa.empresa_id_cat_empresa;
      const nameDept = selectedEmpresa.departamento_nombre;

      fetch("http://192.168.0.8:3000/api/reporteador/Get_Equipos_Tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          int_id_cat_equipo: 0,
          str_equipo_nombre: "",
          int_id_cat_departamento: parseInt(selectedDepartment),
          int_id_cat_empresa: parseInt(selectedCompany),
          int_creado_por: 0,
          int_actualizado_por: 0,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          equipoSelect.innerHTML = "";

          const initialOption = document.createElement("option");
          initialOption.value = "";
          initialOption.text = "Seleccione Equipo";
          initialOption.hidden = true;
          equipoSelect.appendChild(initialOption);

          data.forEach((equipo) => {
            const option = document.createElement("option");
            option.value = equipo.equipo_id_cat_equipo;
            option.text = capitalizarCadena(equipo.equipo_nombre);
            equipoSelect.appendChild(option);
          });
        })
        .catch((error) => {
          console.error("Error al obtener los equipos:", error);
        });
    } else {
      departamentoSelect.innerHTML = "";
      equipoSelect.innerHTML = "";
      showPageButton1.style.display = "none";
      showPageButton2.style.display = "none";
      showPageButton3.style.display = "none";
      showPageButton4.style.display = "none";
      showPageButton5.style.display = "none";
      showPageButton6.style.display = "none";
    }
  });

  let table;

  document
    .getElementById("descargar-universo-button")
    .addEventListener("click", function () {
      const selectEquipo = 0;
      const selectDepartamento = 0;
      const selectEmpresa = 0;
      empresaSelect.value = "";
      departamentoSelect.value = "";
      equipoSelect.value = "";
      initializeTable(selectEquipo, selectDepartamento, selectEmpresa);
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
          "int_id_cat_aplicativo": 25,
          "int_id_cat_usuario": parseInt(id_cat_usuario),
          "int_id_creador": parseInt(id_cat_usuario)
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          const selectedEmpresa = empresaSelect.value;
          const selectedDepartamento = departamentoSelect.value;
          const selectedEquipo = equipoSelect.value;
          console.log(selectedEquipo, selectedDepartamento, selectedEmpresa);
          if (selectedEmpresa) {
            if (selectedDepartamento) {
              if (selectedEquipo) {
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
                      int_id_equipo: selectedEquipo,
                      int_id_departamento: selectedDepartamento,
                      int_id_empresa: selectedEmpresa,
                      string_nombre_referencia: "",
                      int_id_prioridad: 0,
                      int_estado_resolucion: 0,
                      int_id_proceso: 0,
                      int_id_cat_tipo: 0,
                      int_id_cat_canal: 0,
                      int_id_cat_seguimiento: 0,
                      int_id_cat_responsable: 0,
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
                      date_creacion_inicio: "",
                      date_creacion_fin: "",
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
                        selectedEquipo,
                        selectedDepartamento,
                        selectedEmpresa
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
                  text: "Debes seleccionar un equipo.",
                });
              }
            } else {
              Swal.fire({
                icon: "error",
                title: "Error",
                text: "Debes seleccionar un departamento.",
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

  function initializeTable(equipo, departamento, empresa) {
    console.log(equipo, departamento, empresa);
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
          int_id_proceso: 0,
          int_id_cat_tipo: 0,
          int_id_cat_canal: 0,
          int_id_cat_seguimiento: 0,
          int_id_cat_responsable: 0,
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
          date_creacion_inicio: "",
          date_creacion_fin: "",
          date_actualizacion_inicio: "",
          date_actualizacion_fin: "",
        };
      },
      ajaxContentType: "json",
      ajaxResponse: function (url, params, response) {
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

      XLSX.writeFile(workbook, "reporte-tickets.xlsx", {
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
    empresaSelect.value = "";
    departamentoSelect.value = "";
    equipoSelect.value = "";
    table.clearData();
  });

  clearButtonD.addEventListener("click", () => {
    departamentoSelect.value = "";
    equipoSelect.value = "";
    table.clearData();
  });

  clearButtonE.addEventListener("click", () => {
    equipoSelect.value = "";
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
