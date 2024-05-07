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

  fechaInicialInput.addEventListener("change", function () {
    fechaFinalInput.min = this.value;
  });

  fechaFinalInput.addEventListener("change", function () {
    fechaInicialInput.max = this.value;
  });

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
      Swal.fire({
        title: "Validando que exista información",
        text: "Esto puede durar varios minutos",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
      fetch(
        "http://192.168.0.8:3000/api/reporteador/Get_Reporte_Tickets_Programacion",
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
            int_id_proceso: selectProceso,
            int_id_cat_tipo: 0,
            int_id_cat_canal: 0,
            int_id_cat_seguimiento: 0,
            int_id_cat_responsable: selectUsuario,
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
              selectEquipo,
              selectDepartamento,
              selectEmpresa,
              selectProceso,
              selectUsuario,
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
          "int_id_cat_aplicativo": 16,
          "int_id_cat_usuario": parseInt(id_cat_usuario),
          "int_id_creador": parseInt(id_cat_usuario)
        }),
      })
        .then((response) => response.json())
        .then((data) => {
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
                  "http://192.168.0.8:3000/api/reporteador/Get_Reporte_Tickets_Programacion",
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
                      fetchDataBarChart(equipo, selectedProceso, selectedUsuario, fechaInicial, fechaFinal)
                      fetchDataDoughnutChart1(equipo, selectedProceso, fechaInicial, fechaFinal)
                      fetchDataTicketStatus(equipo, fechaInicial, fechaFinal)
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
      ajaxURL: "http://192.168.0.8:3000/api/reporteador/Get_Reporte_Tickets_Programacion",
      ajaxConfig: {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      },
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

document.addEventListener('DOMContentLoaded', function () {
  const equipo = localStorage.getItem("selectedEquipment");
  const selectedProceso = 0;
  const selectedUsuario = 0;
  const fechaInicial = '';
  const fechaFinal = '';
  fetchDataBarChart(equipo, selectedProceso, selectedUsuario, fechaInicial, fechaFinal);
  fetchDataDoughnutChart1(equipo, selectedProceso, fechaInicial, fechaFinal);
  fetchDataDoughnutChart2(equipo);
  fetchDataTicketStatus(equipo, fechaInicial, fechaFinal);
});

async function fetchDataBarChart(equipo, selectedProceso, selectedUsuario, fechaInicial, fechaFinal) {
  try {
    const response = await fetch('http://192.168.0.8:3000/api/nova_ticket/Get_Ticket_ConteoPorUsuarios', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        int_id_cat_equipo: equipo,
        int_id_cat_proceso: selectedProceso,
        int_id_cat_usuario: selectedUsuario,
        date_fecha_inicial: fechaInicial,
        date_fecha_final: fechaFinal,
      })
    });
    const data = await response.json();

    const labels = data.map(ticket => ticket.usuario);
    const values_total = data.map(ticket => ticket.total);
    const values_asignado = data.map(ticket => ticket.Asignado);
    const values_progreso = data.map(ticket => ticket.Enprogreso);

    createBarChart(labels, values_total, values_asignado, values_progreso);
  } catch (error) {
    console.error('Error al obtener los datos para la gráfica de barras:', error);
  }
}

async function fetchDataDoughnutChart1(equipo, selectedProceso, fechaInicial, fechaFinal) {
  try {
    const response = await fetch('http://192.168.0.8:3000/api/nova_ticket/Get_Ticket_Graficas_Tops_Reporteador', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        int_id_cat_equipo: equipo,
        int_id_cat_proceso: selectedProceso,
        date_fecha_inicial: fechaInicial,
        date_fecha_final: fechaFinal,
      })
    });
    const data = await response.json();

    const labels = data.map(ticket => ticket.usuario);
    const values = data.map(ticket => ticket.total);

    // Obtener el canvas
    const canvas = document.getElementById('doughnutChart1');
    const existingChart = Chart.getChart(canvas); // Obtener la instancia existente de Chart en el canvas

    // Destruir la instancia existente de Chart si existe
    if (existingChart) {
      existingChart.destroy();
    }

    // Crear la nueva gráfica
    createDoughnutChart1(labels, values);
  } catch (error) {
    console.error('Error al obtener los datos para la gráfica de dona 1:', error);
  }
}


async function fetchDataDoughnutChart2(equipo) {
  try {
    const response = await fetch('http://192.168.0.8:3000/api/nova_ticket/Get_Ticket_Graficas_Tops_Solicitantes_Reporteador', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        int_id_cat_equipo: equipo
      })
    });
    const data = await response.json();

    const labels = data.map(ticket => ticket.usuario);
    const values = data.map(ticket => ticket.total);

    createDoughnutChart2(labels, values);
  } catch (error) {
    console.error('Error al obtener los datos para la gráfica de dona 1:', error);
  }
}

function createBarChart(labels, values_total, values_asignado, values_progreso) {
  var ctx = document.getElementById('barChart').getContext('2d');
  var existingChart = Chart.getChart(ctx); // Obtener la instancia existente de Chart

  // Destruir la gráfica existente si hay una
  if (existingChart) {
    existingChart.destroy();
  }

  // Crear la nueva gráfica
  var barChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Número de Tickets',
          data: values_total,
          backgroundColor: [
            'rgb(255, 99, 132)'
          ],
          borderColor: [
            'rgba(255, 99, 132)',
          ],
          borderWidth: 1
        },
        {
          label: 'Asignado',
          data: values_asignado,
          backgroundColor: [
            'rgb(9, 109, 253)'
          ],
          borderColor: [
            'rgb(9, 109, 253)'
          ],
          borderWidth: 1
        },
        {
          label: 'En Progreso',
          data: values_progreso,
          backgroundColor: [
            'rgb(254, 195, 5)'
          ],
          borderColor: [
            'rgb(254, 195, 5)'
          ],
          borderWidth: 1
        },
      ]
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: 'Tickets de todos los usuarios del equipo'
        },
      },
      // indexAxis: 'y',
    }
  });
}

function createDoughnutChart1(labels, values) {
  var ctx = document.getElementById('doughnutChart1').getContext('2d');
  var barChart = new Chart(ctx, {
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
          text: 'Top 5 usuarios con Tickets resueltos'
        },
        datalabels: {
          color: '#000',
          formatter: (value, ctx) => {
            let label = ctx.chart.data.labels[ctx.dataIndex];
            return label + ': ' + value;
          }
        }
      }
    }
  });
}

function createDoughnutChart2(labels, values) {
  var ctx = document.getElementById('doughnutChart2').getContext('2d');
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
          text: 'Top 5 usuarios solicitantes'
        }
      }
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