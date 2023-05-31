let refreshCount = 0;

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
});

table.setData();

function exportTable() {
  table.download("csv", "registros.csv");
}
