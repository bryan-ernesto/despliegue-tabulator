window.onpageshow = function (event) {
  if (event.persisted) {
    window.location.reload();
  }
};

document.addEventListener("DOMContentLoaded", (event) => {
  const username = localStorage.getItem("username");

  if (!username) {
    window.location.href = "/index.html";
    return;
  }

  const usernameElement = document.getElementById("username");
  usernameElement.textContent = username;

  const fechaInicialInput = document.getElementById("fecha-inicial");
  const fechaFinalInput = document.getElementById("fecha-final");
  let table;

  document.getElementById("actualizar-button").addEventListener("click", function () {
    const fechaInicial = fechaInicialInput.value;
    const fechaFinal = fechaFinalInput.value;

    if (fechaInicial && fechaFinal) {
      Swal.fire({
        title: "Validando que exista información",
        text: "Esto puede durar varios minutos",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const apiUrl = `http://192.168.0.8:3000/api/reporteador/Get_Reporte_GestionesAzteca?fechainicio=${fechaInicial}&fechafin=${fechaFinal}&bearer=5bgrduHXsCZx8QTU2rGwXhQPu1igSn2nq7TX1StK/3gZObWNBt60yHQX5IjzAApXSkAuPFiKCwfKuiPuAAAAAAAAAAAAAAAAAAAAAAznYtNOPBnb3Daj+RvVWExXVm57okwSHWy4z0rETvZpI1XeShfy/WqTzPNLI9k0EQ==`;

      fetch(apiUrl)
        .then((response) => response.json())
        .then((data) => {
          if (data && data.length > 0) {
            Swal.update({
              title: "Enviando parámetros...",
              text: "Esto puede durar varios minutos",
            });
            initializeTable(fechaInicial, fechaFinal);
            Swal.close();

            const recordCountText = document.getElementById("record-count-text");
            recordCountText.textContent = `Cantidad de registros: ${data.length}`;
            recordCountText.style.display = "block";

            let tableElement = document.getElementById("example-table");
            let tablePosition = tableElement.offsetTop;
            recordCountText.style.top = `${tablePosition - recordCountText.offsetHeight + 20}px`;

          } else {
            Swal.fire({
              icon: "warning",
              title: "Advertencia",
              text: "No se encontró información acorde a los filtros seleccionados.",
            });
            const recordCountText = document.getElementById("record-count-text");
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
    } else {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Debes seleccionar una fecha inicial y una fecha final.",
      });
    }
  });

  function initializeTable(fechaInicial, fechaFinal) {
    const apiUrl = `http://192.168.0.8:3000/api/reporteador/Get_Reporte_GestionesAzteca?fechainicio=${fechaInicial}&fechafin=${fechaFinal}&bearer=5bgrduHXsCZx8QTU2rGwXhQPu1igSn2nq7TX1StK/3gZObWNBt60yHQX5IjzAApXSkAuPFiKCwfKuiPuAAAAAAAAAAAAAAAAAAAAAAznYtNOPBnb3Daj+RvVWExXVm57okwSHWy4z0rETvZpI1XeShfy/WqTzPNLI9k0EQ==`;

    table = new Tabulator("#example-table", {
      layout: "fitData",
      columns: [],
      pagination: "local",
      paginationSize: 25,
      paginationSizeSelector: [10, 25, 50, 100],
      ajaxURL: apiUrl,
      ajaxContentType: "json",
      ajaxResponse: function (url, params, response) {
        console.log(response);
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
        v: "REPORTE GESTIONES AZTECA",
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
      XLSX.utils.book_append_sheet(workbook, worksheet, "Registros");

      XLSX.writeFile(workbook, "reporte-gestiones-azteca.xlsx", {
        bookType: "xlsx",
        bookSST: true,
        type: "binary",
        cellStyles: true,
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No hay datos en la tabla para exportar.",
      });
    }
  }

  document
    .getElementById("export-table")
    .addEventListener("click", function () {
      exportTable();
    });

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
});

window.addEventListener('popstate', function (event) {
  location.reload(true);
});
