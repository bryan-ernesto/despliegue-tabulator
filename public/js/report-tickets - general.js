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
  const fechaInicialInput = document.getElementById("fecha-inicial");
  const fechaFinalInput = document.getElementById("fecha-final");

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

      const selectAllOption = document.createElement("option");
      selectAllOption.value = 0;
      selectAllOption.text = "Seleccionar todas las empresas";
      empresaSelect.appendChild(selectAllOption);

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
      if (selectedCompany === "0") { // Comprobar si se selecciona "Seleccionar todas las empresas"
        fetch("http://192.168.0.8:3000/api/usuarios/Get_departamentos", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            str_departamento_nombre: "",
            int_creado_por: 0,
            int_actualizado_por: 0,
            int_id_cat_empresa: 0, // Enviar 0 para seleccionar todas las empresas
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

            const selectAllOption = document.createElement("option");
            selectAllOption.value = 0;
            selectAllOption.text = "Seleccionar todos los departamentos";
            departamentoSelect.appendChild(selectAllOption);

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
        // Si se selecciona una empresa específica, realizar la solicitud fetch con el ID de la empresa seleccionada
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

            const selectAllOption = document.createElement("option");
            selectAllOption.value = 0;
            selectAllOption.text = "Seleccionar todos los departamentos";
            departamentoSelect.appendChild(selectAllOption);

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
      }
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
    const selectedDepartment = departamentoSelect.value; // Obtener el departamento seleccionado
    const selectedCompany = empresaSelect.value;

    if (selectedCompany !== "") {
      if (selectedDepartment === "0" && selectedCompany === "0") { // Comprobar si se selecciona "Seleccionar todos los departamentos"
        fetch("http://192.168.0.8:3000/api/reporteador/Get_Equipos_Tickets", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            int_id_cat_equipo: 0,
            str_equipo_nombre: "",
            int_id_cat_departamento: 0, // Enviar 0 para seleccionar todos los departamentos
            int_id_cat_empresa: 0,
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

            const selectAllOption = document.createElement("option");
            selectAllOption.value = 0;
            selectAllOption.text = "Seleccionar todos los equipos";
            equipoSelect.appendChild(selectAllOption);

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
        // Si se selecciona un departamento específico, realizar la solicitud fetch con el ID del departamento seleccionado
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

            const selectAllOption = document.createElement("option");
            selectAllOption.value = 0;
            selectAllOption.text = "Seleccionar todos los equipos";
            equipoSelect.appendChild(selectAllOption);

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
      }
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
          const fechaInicial = fechaInicialInput.value;
          const fechaFinal = fechaFinalInput.value;

          console.log(selectedEmpresa, selectedDepartamento, selectedEquipo, fechaInicial, fechaFinal)

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
                        selectedEquipo,
                        selectedDepartamento,
                        selectedEmpresa,
                        fechaInicial,
                        fechaFinal
                      );
                      Swal.close();
                      const recordCountText =
                        document.getElementById("record-count-text");
                      recordCountText.textContent = `Cantidad de registros: ${data.length}`;
                      recordCountText.style.display = "block"; // Mostrar el elemento
                      fetchDataBarChartSlaResolucion(selectedEquipo, selectedEmpresa, fechaInicial, fechaFinal);
                      fetchDataBarChartSlaAsignacion(selectedEquipo, selectedEmpresa, fechaInicial, fechaFinal);
                      fetchDataDoughnutTopsResponsables(selectedEquipo, selectedEmpresa, fechaInicial, fechaFinal);
                      fetchDataTicketStatus(selectedEquipo, fechaInicial, fechaFinal)
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

  function initializeTable(equipo, departamento, empresa, fechaInicial, fechaFinal) {
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
          date_creacion_inicio: fechaInicial,
          date_creacion_fin: fechaFinal,
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

document.addEventListener('DOMContentLoaded', function () {
  const equipo = localStorage.getItem("selectedEquipment");
  const equipoDefecto = 0;
  const empresaDefecto = 0;
  const selectedProceso = 0;
  const selectedUsuario = 0;
  const fechaInicial = '';
  const fechaFinal = '';
  fetchDataBarChartSlaResolucion(equipoDefecto, empresaDefecto, fechaInicial, fechaFinal);
  fetchDataBarChartSlaAsignacion(equipoDefecto, empresaDefecto, fechaInicial, fechaFinal);
  fetchDataDoughnutTopsResponsables(equipoDefecto, empresaDefecto, fechaInicial, fechaFinal)
  fetchDataTicketStatus(equipoDefecto, fechaInicial, fechaFinal);
});

async function fetchDataBarChartSlaAsignacion(equipo, empresa, fechaInicial, fechaFinal) {
  try {
    const response = await fetch('http://192.168.0.8:3000/api/nova_ticket/Get_Ticket_Graficas_Sla_Asignacion_Equipo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        int_id_cat_equipo: equipo,
        int_id_cat_empresa: empresa,
        date_fecha_inicial: fechaInicial,
        date_fecha_final: fechaFinal,
      })
    });
    const data = await response.json();

    const labels = data.map(ticket => ticket.equipo);
    const values_fuera = data.map(ticket => ticket.asignacion_fuera_tiempo);
    const values_entiempo = data.map(ticket => ticket.asignacion_en_tiempo);
    const values_blanco = data.map(ticket => ticket.en_blanco);

    // Obtener el canvas
    const canvas = document.getElementById('barGraficaSlaAsignacion');
    const existingChart = Chart.getChart(canvas); // Obtener la instancia existente de Chart en el canvas

    // Destruir la instancia existente de Chart si existe
    if (existingChart) {
      existingChart.destroy();
    }

    createBarChartSlaAsignacion(labels, values_fuera, values_entiempo, values_blanco);
  } catch (error) {
    console.error('Error al obtener los datos para la gráfica de barras:', error);
  }
}

async function fetchDataBarChartSlaResolucion(equipo, empresa, fechaInicial, fechaFinal) {
  try {
    const response = await fetch('http://192.168.0.8:3000/api/nova_ticket/Get_Ticket_Graficas_Sla_Resolucion_Equipo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        int_id_cat_equipo: equipo,
        int_id_cat_empresa: empresa,
        date_fecha_inicial: fechaInicial,
        date_fecha_final: fechaFinal,
      })
    });
    const data = await response.json();

    const labels = data.map(ticket => ticket.equipo);
    const values_fuera = data.map(ticket => ticket.resolucion_fuera_tiempo);
    const values_entiempo = data.map(ticket => ticket.resolucion_en_tiempo);
    const values_blanco = data.map(ticket => ticket.en_blanco);

    // Obtener el canvas
    const canvas = document.getElementById('barGraficaSlaResolucion');
    const existingChart = Chart.getChart(canvas); // Obtener la instancia existente de Chart en el canvas

    // Destruir la instancia existente de Chart si existe
    if (existingChart) {
      existingChart.destroy();
    }

    // Crear la nueva gráfica
    createBarChartSlaResolucion(labels, values_fuera, values_entiempo, values_blanco);
  } catch (error) {
    console.error('Error al obtener los datos para la gráfica de dona 1:', error);
  }
}

async function fetchDataDoughnutTopsResponsables(equipo, empresa, fechaInicial, fechaFinal) {
  try {
    const response = await fetch('http://192.168.0.8:3000/api/nova_ticket/Get_Ticket_Graficas_Tops_General_Reporteador', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        int_id_cat_equipo: equipo,
        int_id_cat_empresa: empresa,
        date_fecha_inicial: fechaInicial,
        date_fecha_final: fechaFinal,
      })
    });
    const data = await response.json();

    const labels = data.map(ticket => ticket.usuario);
    const values = data.map(ticket => ticket.total);

    const canvas = document.getElementById('barGraficaTopsResponsables');
    const existingChart = Chart.getChart(canvas); // Obtener la instancia existente de Chart en el canvas

    // Destruir la instancia existente de Chart si existe
    if (existingChart) {
      existingChart.destroy();
    }

    createDoughnutChartTopsResponsables(labels, values);
  } catch (error) {
    console.error('Error al obtener los datos para la gráfica de dona 1:', error);
  }
}

function createBarChartSlaResolucion(labels, values_fuera, values_entiempo, values_blanco) {
  var ctx = document.getElementById('barGraficaSlaResolucion').getContext('2d');
  var barChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        // Dataset 1
        {
          label: 'Resolución fuera de tiempo',
          data: values_fuera,
          backgroundColor: 'rgb(9, 109, 253)',
          borderColor: 'rgb(9, 109, 253)',
          borderWidth: 1
        },
        // Dataset 2
        {
          label: 'Resolución en tiempo',
          data: values_entiempo,
          backgroundColor: 'rgb(254, 195, 5)',
          borderColor: 'rgb(254, 195, 5)',
          borderWidth: 1
        },
        // Dataset 3
        {
          label: 'En blanco',
          data: values_blanco,
          backgroundColor: 'rgb(255, 99, 132)',
          borderColor: 'rgb(255, 99, 132)',
          borderWidth: 1
        },
      ]
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: 'SLA resolución de tickets por equipo'
        },
        tooltips: { // Habilitar tooltips
          mode: 'index', // Modo de visualización: 'index' para mostrar un tooltip por cada barra
          intersect: false // No interseccionar con otros elementos para mostrar el tooltip
        }
      }
    },
  });
}

function createBarChartSlaAsignacion(labels, values_fuera, values_entiempo, values_blanco) {
  var ctx = document.getElementById('barGraficaSlaAsignacion').getContext('2d');
  var barChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        // Dataset 1
        {
          label: 'Asignación fuera de tiempo',
          data: values_fuera,
          backgroundColor: 'rgb(9, 109, 253)',
          borderColor: 'rgb(9, 109, 253)',
          borderWidth: 1
        },
        // Dataset 2
        {
          label: 'Asignación en tiempo',
          data: values_entiempo,
          backgroundColor: 'rgb(254, 195, 5)',
          borderColor: 'rgb(254, 195, 5)',
          borderWidth: 1
        },
        // Dataset 3
        {
          label: 'En blanco',
          data: values_blanco,
          backgroundColor: 'rgb(255, 99, 132)',
          borderColor: 'rgb(255, 99, 132)',
          borderWidth: 1
        },
      ]
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: 'SLA asignación de tickets por equipo'
        },
        tooltips: { // Habilitar tooltips
          mode: 'index', // Modo de visualización: 'index' para mostrar un tooltip por cada barra
          intersect: false // No interseccionar con otros elementos para mostrar el tooltip
        }
      }
    },
  });
}


function createDoughnutChartTopsResponsables(labels, values) {
  var ctx = document.getElementById('barGraficaTopsResponsables').getContext('2d');
  var doughnutChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        label: 'Número de Tickets',
        data: values,
        backgroundColor: [
          'rgb(255, 99, 132)',
          'rgb(9, 109, 253)',
          'rgb(254, 195, 5)',
          'rgb(75, 160, 71)',
          'rgb(75, 68, 200)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: 'Top 5 usuarios por tickets resueltos'
        }
      }
    }
  });
}

function createGrafica1(labels, values) {
  var ctx = document.getElementById('grafica1').getContext('2d');
  var barra = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Número de Tickets',
        data: values,
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: 'Top 5 usuarios con más tickets resueltos'
        }
      },
      indexAxis: 'y',
    }
  });
}

function createGrafica2(labels, values) {
  var ctx = document.getElementById('grafica2').getContext('2d');
  var doughnut = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        label: 'Número de Tickets',
        data: values,
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: 'Top 5 equipos con más tickets'
        }
      },
      indexAxis: 'y',
    }
  });
}

async function fetchDataTicketStatus(equipo, fechaInicial, fechaFinal) {
  try {
    const response = await fetch('http://192.168.0.8:3000/api/nova_ticket/Get_Ticket_Graficas_Conteo_Estado', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        int_id_cat_equipo: equipo,
        date_fecha_inicial: fechaInicial,
        date_fecha_final: fechaFinal
      })
    });
    const data = await response.json();

    console.log(equipo);

    // Eliminar tarjetas previamente creadas
    const cardContainer = document.getElementById('card-container');
    cardContainer.innerHTML = '';

    // Crear tarjetas con los datos obtenidos
    createTicketStatusCards(data);
  } catch (error) {
    console.error('Error al obtener los datos de los tickets:', error);
  }
}

function createTicketStatusCards(data) {
  const cardContainer = document.getElementById('card-container');

  // Recorrer los datos y crear una tarjeta por cada estado
  data.forEach(ticketStatus => {
    const card = document.createElement('div');
    card.classList.add('card');

    const cardContent = `
          <h2>${ticketStatus.estado}</h2>
          <p>Total: ${ticketStatus.total}</p>
      `;

    card.innerHTML = cardContent;
    cardContainer.appendChild(card);
  });
}