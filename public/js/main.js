const username = localStorage.getItem("username");

const usernameElement = document.getElementById("username");
usernameElement.textContent = username;

let table = new Tabulator("#example-table", {
  layout: "fitColumns",
  columns: [],
  pagination: "local",
  paginationSize: 25,
  paginationSizeSelector: [10, 25, 50, 100],
  ajaxURL: "http://192.168.0.8:3000/api/general/Get_Prueba",
  ajaxResponse: function (url, params, response) {
    var columns = [];
    var headers = Object.keys(response[0]);
    headers.forEach((header) => {
      columns.push({ title: header, field: header, headerFilter: "input" });
    });
    table.setColumns(columns);
    return response;
  },
  cellClick: function (e, cell) {
    var cellValue = cell.getValue();
    var popupContent = document.createElement('div');
    popupContent.textContent = 'Información adicional: ' + cellValue;
    tippy(cell.getElement(), {
      content: popupContent,
      allowHTML: true,
      interactive: true,
      placement: 'right',
    });
  },
});

table.setData();

function applyFilter(event) {
  var filterInput = event.target.parentNode.querySelector('.filter-input');
  var column = filterInput.getAttribute('data-column');
  var filterValue = filterInput.value;
  table.setFilter(column, "like", filterValue);
}

function clearFilter(event) {
  var filterInput = event.target.parentNode.querySelector('.filter-input');
  var column = filterInput.getAttribute('data-column');
  var filters = table.getFilters();
  filters = filters.filter(function (filter) {
    return filter.field !== column;
  });
  table.clearFilter();
  filters.forEach(function (filter) {
    table.setFilter(filter.field, filter.type, filter.value);
  });
  filterInput.value = "";
}

document.getElementById("refresh").addEventListener("click", function () {
  refreshCount++;
  console.log(`Número de clics ${refreshCount}`);
  table.clearData();
  table.setData();
});

document.getElementById("refresh").addEventListener("click", function () {
  table.clearData();
  table.setData();
  let currentDateTime = new Date().toLocaleString();
  console.log(
    "Botón de refrescar tabla clickeado. Fecha y hora actual:",
    currentDateTime
  );
  fetch("http://192.168.0.8:3000/api/recepciones_documento/Get_Prueba", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ dateFecha: currentDateTime }),
  })
    .then((response) => {
      if (response.ok) {
        console.log("Fecha y hora enviadas correctamente a la API");
      } else {
        console.log("Hubo un error al enviar la fecha y hora a la API");
      }
    })
    .catch((error) => console.log("Error:", error));
});

function exportTable() {
  table.download("csv", "registros.csv");
}

const logoutButton = document.getElementById("logout-button");
logoutButton.addEventListener("click", () => {
  localStorage.removeItem("username");
  window.location.href = "/index.html";
  document.body.innerHTML = "<h1>Error: Acceso no autorizado</h1>";
});