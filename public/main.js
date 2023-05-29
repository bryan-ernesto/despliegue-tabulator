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

document.getElementById("refresh-btn").addEventListener("click", function () {
  refreshCount++;
  console.log(`Número de clics ${refreshCount}`);
  table.clearData();
  table.setData();
});

document.getElementById("refresh-btn").addEventListener("click", function () {
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

window.addEventListener("unload", async function () {
  var currentTime = new Date().toLocaleString();

  try {
    const response = await fetch("http://192.168.0.8:3000/api/recepciones_documento/Get_Prueba", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        date_fecha_hora: currentTime,
      }),
    });
    const data = await response.json();
    console.log("Fecha y hora guardada en la base de datos: ", data);
  } catch (error) {
    console.error("Error al guardar fecha y hora: ", error);
  }
});

function exportTable() {
  table.download("csv", "registros.csv");
}
