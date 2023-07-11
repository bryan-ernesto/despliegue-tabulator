const username = localStorage.getItem("username");

const usernameElement = document.getElementById("username");
usernameElement.textContent = username;

const empresaSelect = document.getElementById("empresa-select");
const clearButton = document.getElementById("clear-button");
const departamentoSelect = document.getElementById("departamento-select");
const clearButtonD = document.getElementById("clear-button-e");
const equipoSelect = document.getElementById("equipo-select");
const clearButtonE = document.getElementById("clear-button-d");

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
    selectAllOption.value = "0";
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

fetch("http://192.168.0.8:3000/api/usuarios/Get_departamentos", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    str_departamento_nombre: "",
    int_creado_por: 0,
    int_actualizado_por: 0,
    int_id_cat_empresa: 0,
  }),
})
  .then((response) => response.json())
  .then((data) => {
    const departamentoData = data;
    const initialOption = document.createElement("option");
    initialOption.value = "";
    initialOption.text = "Seleccione Departamento";
    initialOption.hidden = true;
    departamentoSelect.appendChild(initialOption);

    const selectAllOption = document.createElement("option");
    selectAllOption.value = "0";
    selectAllOption.text = "Seleccionar todos los departamentos";
    departamentoSelect.appendChild(selectAllOption);

    departamentoData.forEach((estado) => {
      const option = document.createElement("option");
      option.value = estado.departamento_id_cat_departamento;
      option.text = estado.departamento_nombre;
      option.classList.add("empresa-option");
      departamentoSelect.appendChild(option);
    });
  })
  .catch((error) => {
    console.error("Error al obtener los departamentos:", error);
  });

fetch("http://192.168.0.8:3000/api/usuarios/Get_Equipos", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    int_id_cat_equipo: 0,
    str_equipo_nombre: "",
    int_id_cat_departamento: 0,
    int_id_cat_empresa: 0,
    int_creado_por: 0,
    int_actualizado_por: 0,
  }),
})
  .then((response) => response.json())
  .then((data) => {
    const equipoData = data;
    const initialOption = document.createElement("option");
    initialOption.value = "";
    initialOption.text = "Seleccione Equpo";
    initialOption.hidden = true;
    equipoSelect.appendChild(initialOption);

    const selectAllOption = document.createElement("option");
    selectAllOption.value = "0";
    selectAllOption.text = "Seleccionar todos los equipos";
    equipoSelect.appendChild(selectAllOption);

    equipoData.forEach((equipo) => {
      const option = document.createElement("option");
      option.value = equipo.equipo_id_cat_equipo;
      option.text = equipo.equipo_nombre;
      option.classList.add("empresa-option");
      equipoSelect.appendChild(option);
    });
  })
  .catch((error) => {
    console.error("Error al obtener los equipos de documento:", error);
  });

let table;

document
  .getElementById("actualizar-button")
  .addEventListener("click", function () {
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
          fetch("http://192.168.0.8:3000/api/reporteador/Get_Reporte_Tickets_1", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              int_id_equipo: selectedEquipo,
              int_id_departamento: selectedDepartamento,
              int_id_empresa: selectedEmpresa,
              string_nombre_referencia: '',
              int_id_prioridad:0,
              int_estado_resolucion:0,
              int_id_proceso:0,
              int_id_cat_tipo:0,
              int_id_cat_canal:0,
              int_id_cat_seguimiento:0,
              int_id_cat_responsable:0,
              int_id_cat_solicitante:0,
              int_id_cat_creado_por:0,
              date_asignacion_inicio: '',
              date_asignacion_fin: '',
              date_resolucion_inicio: '',
              date_resolucion_fin: '',
              date_ultima_vista_inicio: '',
              date_ultima_vista_fin: '',
              date_vencimiento_inicio: '',
              date_vencimiento_fin: '',
              date_primera_respuesta_inicio: '',
              date_primera_respuesta_fin: '',
              date_creacion_inicio: '',
              date_creacion_fin: '',
              date_actualizacion_inicio: '',
              date_actualizacion_fin: '' 
            }),
          })
            .then((response) => response.json())
            .then((data) => {
              if (data && data.length > 0) {
                Swal.update({
                  title: "Enviando parámetros...",
                  text: "Esto puede durar varios minutos",
                });
                initializeTable(selectedEquipo, selectedDepartamento, selectedEmpresa);
              } else {
                Swal.fire({
                  icon: "warning",
                  title: "Advertencia",
                  text: "No se encontró información acorde a los filtros seleccionados.",
                });
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
          string_nombre_referencia: '',
          int_id_prioridad:0,
          int_estado_resolucion:0,
          int_id_proceso:0,
          int_id_cat_tipo:0,
          int_id_cat_canal:0,
          int_id_cat_seguimiento:0,
          int_id_cat_responsable:0,
          int_id_cat_solicitante:0,
          int_id_cat_creado_por:0,
          date_asignacion_inicio: '',
          date_asignacion_fin: '',
          date_resolucion_inicio: '',
          date_resolucion_fin: '',
          date_ultima_vista_inicio: '',
          date_ultima_vista_fin: '',
          date_vencimiento_inicio: '',
          date_vencimiento_fin: '',
          date_primera_respuesta_inicio: '',
          date_primera_respuesta_fin: '',
          date_creacion_inicio: '',
          date_creacion_fin: '',
          date_actualizacion_inicio: '',
          date_actualizacion_fin: '' 
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
    table.download("csv", "registros.csv");
  }
}

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
