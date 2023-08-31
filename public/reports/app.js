window.onpageshow = function (event) {
  if (event.persisted) {
    window.location.reload();
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const username = (localStorage.getItem("username") || "").toLowerCase();

  if (!username) {
    window.location.href = "/index.html";
    return;
  }

  const usernameElement = document.getElementById("username");
  usernameElement.textContent = username;

  const companySelect = document.getElementById("empresa-select");
  const clearButton = document.getElementById("clear-button");
  const departmentSelect = document.getElementById("departamento-select");
  const clearButtonD = document.getElementById("clear-button-d");
  const equipmentSelect = document.getElementById("equipo-select");
  const clearButtonE = document.getElementById("clear-button-e");
  const showPageButton1 = document.getElementById("show-page-report1");
  const showPageButton3 = document.getElementById("show-page-report3");
  const showPageButton4 = document.getElementById("show-page-report4");
  const showPageButton5 = document.getElementById("show-page-report5");
  const showPageButton6 = document.getElementById("show-page-report6");
  const showPageButton7 = document.getElementById("show-page-report7");
  const showPageButton8 = document.getElementById("show-page-report8");
  const showPageButton9 = document.getElementById("show-page-report9");
  const showPageButton10 = document.getElementById("show-page-report10");
  const showPageButton11 = document.getElementById("show-page-report11");
  const showPageButton12 = document.getElementById("show-page-report12");
  const showPageButton13 = document.getElementById("show-page-report13");

  showPageButton1.style.display = "none";
  showPageButton3.style.display = "none";
  showPageButton4.style.display = "none";
  showPageButton5.style.display = "none";
  showPageButton6.style.display = "none";
  showPageButton7.style.display = "none";
  showPageButton8.style.display = "none";
  showPageButton9.style.display = "none";
  showPageButton10.style.display = "none";
  showPageButton11.style.display = "none";
  showPageButton12.style.display = "none"
  showPageButton13.style.display = "none"

  let empresasData;

  if (
    username === "marriola" ||
    username === "cvicente" ||
    username === "bmorales" ||
    username === "djhernandez" ||
    username === "vgonzalez"
  ) {
    showPageButton1.style.display = "block";
    showPageButton3.style.display = "block";
    showPageButton4.style.display = "block";
    showPageButton6.style.display = "block";
    showPageButton7.style.display = "block";
    showPageButton8.style.display = "block";
    showPageButton9.style.display = "block";
    showPageButton10.style.display = "block";
    showPageButton11.style.display = "block";
    showPageButton12.style.display = "block";
  } else if (username === "bgamez") {
    showPageButton1.style.display = "block";
    showPageButton3.style.display = "block";
    showPageButton4.style.display = "block";
    showPageButton5.style.display = "block";
    showPageButton6.style.display = "block";
    showPageButton7.style.display = "block";
    showPageButton8.style.display = "block";
    showPageButton9.style.display = "block";
    showPageButton10.style.display = "block";
    showPageButton11.style.display = "block";
    showPageButton12.style.display = "block";
    showPageButton13.style.display = "block";
  } else if (username === "olopez" || username === "cpcifuentes" || username === "egalvez" || username === "hescobar" || username === "rsales") {
    showPageButton1.style.display = "block";
    showPageButton3.style.display = "block";
    showPageButton4.style.display = "block";
  } else if (
    username === "msolano" ||
    username === "sorellana" ||
    username === "rixim"
  ) {
    showPageButton7.style.display = "block";
  } else if (
    username === 'acastillo'
  ) {
    showPageButton8.style.display = "block";
    showPageButton6.style.display = "block";
    showPageButton9.style.display = "block";
  } else if (
    username === "jizquierdo" ||
    username === "acazun" ||
    username === "sflores" ||
    username === "jyaxon"
  ) {
    showPageButton11.style.display = "block";
  } else if (
    username === "ajvillatoro" ||
    username === "vvargas" ||
    username === "cnovales"
  ) {
    showPageButton9.style.display = "block";
  }
  else {
    showPageButton1.style.display = "none";
    showPageButton3.style.display = "none";
    showPageButton4.style.display = "none";
    showPageButton5.style.display = "none";
    showPageButton6.style.display = "none";
    showPageButton7.style.display = "none";
    showPageButton8.style.display = "none";
    showPageButton9.style.display = "none";
    showPageButton10.style.display = "none";
    showPageButton11.style.display = "none";
  }

  fetch("http://192.168.0.8:3000/api/reporteador/Get_Usuarios_Reporteador", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      str_usuario_nombre: "",
      str_username: username,
      int_empresa: 0,
      int_departamento: 0,
      int_equipo: 0,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      empresasData = data;

      if (data && data.length > 0 && data[0].hasOwnProperty("id_cat_usuario")) {
        localStorage.setItem("id_cat_usuario", data[0].id_cat_usuario);
      }

      const initialOption = document.createElement("option");
      initialOption.value = "";
      initialOption.text = "Seleccione Empresa";
      initialOption.hidden = true;
      companySelect.appendChild(initialOption);

      empresasData.forEach((empresa) => {
        const option = document.createElement("option");
        option.value = empresa.id_cat_empresa;
        option.text = empresa.nombre_empresa;
        option.classList.add("empresa-option");
        companySelect.appendChild(option);
      });
    })
    .catch((error) => {
      console.error("Error al obtener las empresas:", error);
    });

  clearButton.addEventListener("click", () => {
    companySelect.value = "";
    departmentSelect.value = "";
    departmentSelect.innerHTML = "";
    equipmentSelect.innerHTML = "";
    showPageButton1.style.display = "none";
    showPageButton3.style.display = "none";
    showPageButton4.style.display = "none";
    showPageButton5.style.display = "none";
    showPageButton6.style.display = "none";
    showPageButton7.style.display = "none";
    showPageButton8.style.display = "none";
    showPageButton9.style.display = "none";
    showPageButton10.style.display = "none";
    showPageButton11.style.display = "none";
  });

  function checkSelections() {
    const selectedCompany = companySelect.value;
    const selectedDepartment = departmentSelect.value;
    const selectedEquipment = equipmentSelect.value;

    const selectedEmpresa = empresasData.find(
      (empresa) => empresa.id_cat_empresa === parseInt(selectedCompany)
    );

    if (
      selectedEmpresa &&
      parseInt(selectedCompany) === 1 &&
      parseInt(selectedDepartment) === 9 &&
      parseInt(selectedEquipment) === 19
    ) {
      showPageButton3.style.display = "block";
    } else if (selectedEmpresa &&
      parseInt(selectedCompany) === 1 &&
      parseInt(selectedDepartment) === 9 &&
      parseInt(selectedEquipment) === 18) {
      showPageButton3.style.display = "block";
    } else {
      showPageButton3.style.display = "none";
    }
    if (
      selectedEmpresa &&
      parseInt(selectedCompany) === 4 &&
      parseInt(selectedDepartment) === 2 &&
      parseInt(selectedEquipment) === 25
    ) {
      showPageButton4.style.display = "block";
    } else {
      showPageButton4.style.display = "none";
    }
    if (
      selectedEmpresa &&
      parseInt(selectedCompany) === 3 &&
      parseInt(selectedDepartment) === 7 &&
      parseInt(selectedEquipment) === 27
    ) {
      showPageButton5.style.display = "block";
    } else if (
      selectedEmpresa &&
      parseInt(selectedCompany) === 1 &&
      parseInt(selectedDepartment) === 18 &&
      parseInt(selectedEquipment) === 24
    ) {
      showPageButton5.style.display = "block";
    } else if (
      selectedEmpresa &&
      parseInt(selectedCompany) === 4 &&
      parseInt(selectedDepartment) === 2 &&
      parseInt(selectedEquipment) === 29
    ) {
      showPageButton5.style.display = "block";
    } else if (
      selectedEmpresa &&
      parseInt(selectedCompany) === 1 &&
      parseInt(selectedDepartment) === 4 &&
      parseInt(selectedEquipment) === 7
    ) {
      showPageButton5.style.display = "block";
    } else if (
      selectedEmpresa &&
      parseInt(selectedCompany) === 1 &&
      parseInt(selectedDepartment) === 15 &&
      parseInt(selectedEquipment) === 23
    ) {
      showPageButton5.style.display = "block";
    } else if (
      selectedEmpresa &&
      parseInt(selectedCompany) === 1 &&
      parseInt(selectedDepartment) === 9 &&
      parseInt(selectedEquipment) === 38
    ) {
      showPageButton13.style.display = "block";
    }
    else {
      showPageButton5.style.display = "none";
      showPageButton1.style.display = "none";
    }
    if (
      selectedEmpresa &&
      parseInt(selectedCompany) === 1 &&
      parseInt(selectedDepartment) === 13
    ) {
      showPageButton6.style.display = "block";
    } else {
      showPageButton6.style.display = "none";
    }
    if (
      selectedEmpresa &&
      parseInt(selectedCompany) === 1 &&
      parseInt(selectedDepartment) === 22 &&
      parseInt(selectedEquipment) === 30
    ) {
      showPageButton9.style.display = "block";
    } else if (
      selectedEmpresa &&
      parseInt(selectedCompany) === 1 &&
      parseInt(selectedDepartment) === 14 &&
      parseInt(selectedEquipment) === 36
    ) {
      showPageButton9.style.display = "block";
    } else if (
      selectedEmpresa &&
      parseInt(selectedCompany) === 1 &&
      parseInt(selectedDepartment) === 13 &&
      parseInt(selectedEquipment) === 37
    ) {
      showPageButton9.style.display = "block";
      showPageButton6.style.display = "none";
    }
    else {
      showPageButton9.style.display = "none";
      showPageButton6.style.display = "none";
    }
  }

  companySelect.addEventListener("change", () => {
    const selectedCompany = companySelect.value;
    localStorage.setItem("selectedCompany", selectedCompany);

    if (selectedCompany !== "") {
      const selectedEmpresa = empresasData.find(
        (empresa) => empresa.id_cat_empresa === parseInt(selectedCompany)
      );

      const companyId = selectedEmpresa.id_cat_empresa;
      const nameDept = selectedEmpresa.nombre_departamento;

      fetch("http://192.168.0.8:3000/api/usuarios/Get_departamentos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          str_departamento_nombre: nameDept,
          int_creado_por: 0,
          int_actualizado_por: 0,
          int_id_cat_empresa: companyId,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          departmentSelect.innerHTML = "";

          const initialOption = document.createElement("option");
          initialOption.value = "";
          initialOption.text = "Seleccione Departamento";
          initialOption.hidden = true;
          departmentSelect.appendChild(initialOption);

          data.forEach((departamento) => {
            const option = document.createElement("option");
            option.value = departamento.departamento_id_cat_departamento;
            option.text = capitalizarCadena(departamento.departamento_nombre);
            departmentSelect.appendChild(option);
          });
        })
        .catch((error) => {
          console.error("Error al obtener los departamentos:", error);
        });
    } else {
      departmentSelect.innerHTML = "";
      equipmentSelect.innerHTML = "";
      showPageButton1.style.display = "none";
      showPageButton3.style.display = "none";
      showPageButton4.style.display = "none";
      showPageButton5.style.display = "none";
      showPageButton6.style.display = "none";
      showPageButton7.style.display = "none";
      showPageButton8.style.display = "none";
      showPageButton9.style.display = "none";
      showPageButton10.style.display = "none";
    }
  });

  departmentSelect.addEventListener("change", () => {
    const selectedDepartment = departmentSelect.value;
    localStorage.setItem("selectedDepartment", selectedDepartment);

    if (selectedDepartment !== "") {
      const selectedCompany = companySelect.value;
      const selectedEmpresa = empresasData.find(
        (empresa) => empresa.id_cat_empresa === parseInt(selectedCompany)
      );
      if (selectedEmpresa) {
        const idCatEquipo = selectedEmpresa.id_cat_equipo;

        fetch("http://192.168.0.8:3000/api/usuarios/Get_Equipos", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            int_id_cat_equipo: idCatEquipo,
            str_equipo_nombre: "",
            int_id_cat_departamento: parseInt(selectedDepartment),
            int_id_cat_empresa: parseInt(companySelect.value),
            int_creado_por: 0,
            int_actualizado_por: 0,
          }),
        })
          .then((response) => response.json())
          .then((data) => {
            equipmentSelect.innerHTML = "";

            const initialOption = document.createElement("option");
            initialOption.value = "";
            initialOption.text = "Seleccione Equipo";
            initialOption.hidden = true;
            equipmentSelect.appendChild(initialOption);

            data.forEach((equipo) => {
              const option = document.createElement("option");
              option.value = equipo.equipo_id_cat_equipo;
              option.text = capitalizarCadena(equipo.equipo_nombre);
              equipmentSelect.appendChild(option);
            });
            const selectedEquipment = equipmentSelect.value;
            localStorage.setItem("selectedEquipment", selectedEquipment);
          })
          .catch((error) => {
            console.error("Error al obtener los equipos:", error);
          });
      } else {
        equipmentSelect.innerHTML = "";
        showPageButton1.style.display = "none";
        showPageButton3.style.display = "none";
        showPageButton4.style.display = "none";
        showPageButton5.style.display = "none";
        showPageButton6.style.display = "none";
        showPageButton7.style.display = "none";
        showPageButton8.style.display = "none";
        showPageButton9.style.display = "none";
        showPageButton10.style.display = "none";
      }
    }
  });

  equipmentSelect.addEventListener("change", () => {
    const selectedEquipment = equipmentSelect.value;
    localStorage.setItem("selectedEquipment", selectedEquipment);
  });

  clearButtonD.addEventListener("click", () => {
    departmentSelect.value = "";
    equipmentSelect.innerHTML = "";
    showPageButton1.style.display = "none";
    showPageButton3.style.display = "none";
    showPageButton4.style.display = "none";
    showPageButton5.style.display = "none";
    showPageButton6.style.display = "none";
    showPageButton7.style.display = "none";
    showPageButton8.style.display = "none";
    showPageButton9.style.display = "none";
    showPageButton10.style.display = "none";
  });

  clearButtonE.addEventListener("click", () => {
    equipmentSelect.value = "";
    showPageButton1.style.display = "none";
    showPageButton3.style.display = "none";
    showPageButton4.style.display = "none";
    showPageButton5.style.display = "none";
    showPageButton6.style.display = "none";
    showPageButton7.style.display = "none";
    showPageButton8.style.display = "none";
    showPageButton9.style.display = "none";
    showPageButton10.style.display = "none";
  });

  companySelect.addEventListener("change", checkSelections);
  departmentSelect.addEventListener("change", checkSelections);
  equipmentSelect.addEventListener("change", checkSelections);

  const logoutButton = document.getElementById("logout-button");
  logoutButton.addEventListener("click", () => {
    localStorage.removeItem("username");
    window.location.href = "/index.html";
    document.body.innerHTML = "<h1>Error: Acceso no autorizado</h1>";
  });

  history.replaceState(null, null, location.href);
  window.addEventListener("popstate", () => {
    history.pushState(null, null, location.href);
  });


  function handleButtonClick(event) {
    event.preventDefault();
    const anchor = event.currentTarget;
    const button = anchor.parentElement;
    const appId = button.getAttribute('data-app-id');

    fetch("http://192.168.0.8:3000/api/reporteador/Get_Usuarios_Reporteador", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        str_usuario_nombre: "",
        str_username: username,
        int_empresa: 0,
        int_departamento: 0,
        int_equipo: 0,
      }),
    })
      .then(response => response.json())
      .then(data => {
        const userId = data[0].id_cat_usuario;

        return fetch("http://192.168.0.8:3000/api/recepciones_documento/Post_Documento_BitacoraLogin", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            int_id_cat_aplicativo: appId,
            int_id_cat_usuario: userId,
            int_id_creador: userId
          }),
        });
      })
      .then(response => response.json())
      .then(result => {
        console.log("Registro exitoso:", result);
        window.location.href = anchor.href;
      })
      .catch(error => {
        console.error("Error:", error);
        window.location.href = anchor.href;
      });
  }

  const anchorsInsideButtons = document.querySelectorAll('button.report-button a');
  anchorsInsideButtons.forEach(anchor => {
    anchor.addEventListener('click', handleButtonClick);
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