const username = localStorage.getItem("username");
const empresa = localStorage.getItem("selectedCompany");
const departamento = localStorage.getItem("selectedDepartment");
const equipo = localStorage.getItem("selectedEquipment");

const usernameElement = document.getElementById("username");
usernameElement.textContent = username;

let table;

console.log(username, empresa, departamento, equipo)

function initializeTable() {
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
        int_id_empresa: empresa
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

initializeTable();

function exportTable() {
  if (table) {
    table.download("csv", "registros.csv");
  }
}

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
