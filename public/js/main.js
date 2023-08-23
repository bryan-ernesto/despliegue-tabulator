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
  const cuentaSelect = document.getElementById("cuenta-select");
  const clearButtonE = document.getElementById("clear-button-e");

  fetch(
    "http://192.168.0.8:3000/api/reporteador/Get_Empresas_Cheques_Circulacion",
    {
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
        option.value = empresa.id_delta;
        option.text = empresa.nombre_delta;
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
        (empresa) => empresa.id_delta === parseInt(selectedCompany)
      );

      const companyId = selectedEmpresa.id_delta;
      const nameDept = selectedEmpresa.nombre_delta;

      fetch(
        "http://192.168.0.8:3000/api/reporteador/Get_Reporteador_CuentaBancaria",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            int_id_empresa_delta: companyId,
            int_estado: 2,
          }),
        }
      )
        .then((response) => response.json())
        .then((data) => {
          cuentaSelect.innerHTML = "";

          const initialOption = document.createElement("option");
          initialOption.value = "";
          initialOption.text = "Seleccione Número de Cuenta";
          initialOption.hidden = true;
          cuentaSelect.appendChild(initialOption);

          data.forEach((cuenta) => {
            const option = document.createElement("option");
            option.value = cuenta.numero_interno;
            option.text = cuenta.clave_banco;
            cuentaSelect.appendChild(option);
          });
        })
        .catch((error) => {
          console.error("Error al obtener los departamentos:", error);
        });
    }
  });

  let table;

  function initializeTable(idEmpresa, idCuenta) {
    table = new Tabulator("#example-table", {
      layout: "fitData",
      columns: [],
      pagination: "local",
      paginationSize: 25,
      paginationSizeSelector: [10, 25, 50, 100],
      ajaxURL: "http://192.168.0.8:3000/api/delta/Get_Reporte_ABO_CXP_1_1",
      ajaxParams: function (params) {
        return {
          Id_Empresa: idEmpresa,
          Id_Cuenta: idCuenta,
        };
      },
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

  document
    .getElementById("descargar-universo-button")
    .addEventListener("click", function () {
      const empresa = "null";
      const cuenta = "null";
      empresaSelect.value = "";
      cuentaSelect.value = "";
      initializeTable(empresa, cuenta);
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
          "int_id_cat_aplicativo": 20,
          "int_id_cat_usuario": parseInt(id_cat_usuario),
          "int_id_creador": parseInt(id_cat_usuario)
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          const selectedEmpresa = empresaSelect.value;
          const selectedCuenta = cuentaSelect.value;

          console.log(selectedEmpresa, selectedCuenta);

          if (selectedEmpresa) {
            if (selectedCuenta) {
              Swal.fire({
                title: "Validando que exista información",
                text: "Esto puede durar varios minutos",
                allowOutsideClick: false,
                didOpen: () => {
                  Swal.showLoading();
                },
              });

              fetch("http://192.168.0.8:3000/api/delta/Get_Reporte_ABO_CXP_1", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  Id_Empresa: selectedEmpresa,
                  Id_Cuenta: selectedCuenta,
                }),
              })
                .then((response) => response.json())
                .then((data) => {
                  if (data && data.length > 0) {
                    Swal.update({
                      title: "Enviando parámetros...",
                      text: "Esto puede durar varios minutos",
                    });
                    initializeTable(selectedEmpresa, selectedCuenta);
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
            } else {
              Swal.fire({
                icon: "error",
                title: "Error",
                text: "Debes seleccionar un número de cuenta.",
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

  async function exportTable() {
    if (table) {
      const workbook = new ExcelJS.Workbook();
      workbook.creator = "Me";
      workbook.lastModifiedBy = "Me";
      workbook.created = new Date();
      workbook.modified = new Date();
      const sheet = workbook.addWorksheet("Registros");

      sheet.getCell("A1").value = "REPORTE CHEQUES EN CIRCULACIÓN";
      sheet.getCell("A1").font = { size: 30 };

      const columns = table.getColumns();
      const headers = columns.map((column) => column.getField());
      const data = table.getData().map((row) => Object.values(row));

      headers.forEach((header, i) => {
        sheet.getCell(`${String.fromCharCode(65 + i)}5`).value = header;
      });

      data.forEach((row, i) => {
        row.forEach((value, j) => {
          sheet.getCell(`${String.fromCharCode(65 + j)}${i + 6}`).value = isNaN(
            value
          )
            ? value
            : Number(value);
        });
      });

      workbook.xlsx.writeBuffer().then(function (buffer) {
        let blob = new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        saveAs(blob, "reporte-ch-circulacion.xlsx");
      });
    }
  }

  document
    .getElementById("export-table")
    .addEventListener("click", function () {
      exportTable();
    });

  clearButton.addEventListener("click", () => {
    empresaSelect.value = "";
    cuentaSelect.value = "";
    table.clearData();
  });

  clearButtonE.addEventListener("click", () => {
    cuentaSelect.value = "";
    table.clearData();
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
