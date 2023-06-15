document.addEventListener("DOMContentLoaded", () => {
  // Recuperar el nombre de usuario del almacenamiento local
  const username = localStorage.getItem("username");

  const usernameElement = document.getElementById("username");
  usernameElement.textContent = username;

  const companySelect = document.getElementById("empresa-select");
  const clearButton = document.getElementById("clear-button");
  const departmentSelect = document.getElementById("departamento-select");
  const clearButtonD = document.getElementById("clear-button-d");
  const equipmentSelect = document.getElementById("equipo-select");
  const clearButtonE = document.getElementById("clear-button-e");
  const showPageButton1 = document.getElementById("show-page-report1");
  const showPageButton2 = document.getElementById("show-page-report2");
  const showPageButton3 = document.getElementById("show-page-report3");
  const showPageButton4 = document.getElementById("show-page-report4");
  const showPageButton5 = document.getElementById("show-page-report5");
  const showPageButton6 = document.getElementById("show-page-report6");
  showPageButton1.style.display = "none"; 
  showPageButton2.style.display = "none"; 
  showPageButton3.style.display = "none"; 
  showPageButton4.style.display = "none"; 
  showPageButton5.style.display = "none"; 
  showPageButton6.style.display = "none"; 

  let empresasData;

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
      empresasData = data;
      const initialOption = document.createElement("option");
      initialOption.value = "";
      initialOption.text = "Seleccione empresa";
      companySelect.appendChild(initialOption);

      empresasData.forEach((empresa) => {
        const option = document.createElement("option");
        option.value = empresa.empresa_id_cat_empresa;
        option.text = empresa.empresa_nombre;
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
    showPageButton2.style.display = "none";
    showPageButton3.style.display = "none";
    showPageButton4.style.display = "none";
  });

  function checkSelections() {
    const selectedCompany = companySelect.value;
    const selectedDepartment = departmentSelect.value;
    const selectedEquipment = equipmentSelect.value;
  
    const selectedEmpresa = empresasData.find(
      (empresa) => empresa.empresa_id_cat_empresa === parseInt(selectedCompany)
    );
  
    if (
      selectedEmpresa &&
      parseInt(selectedCompany) === 1 &&
      parseInt(selectedDepartment) === 9 &&
      parseInt(selectedEquipment) === 18
    ) {
      showPageButton1.style.display = "block";
    } else {
      showPageButton1.style.display = "none";
    }

    if (
      selectedEmpresa &&
      parseInt(selectedCompany) === 1 &&
      parseInt(selectedDepartment) === 9 &&
      parseInt(selectedEquipment) === 18
    ) {
      showPageButton2.style.display = "block";
    } else {
      showPageButton2.style.display = "none";
    }

    if (
      selectedEmpresa &&
      parseInt(selectedCompany) === 1 &&
      parseInt(selectedDepartment) === 9 &&
      parseInt(selectedEquipment) === 18
    ) {
      showPageButton3.style.display = "block";
    } else {
      showPageButton3.style.display = "none";
    }
    if (
      selectedEmpresa &&
      parseInt(selectedCompany) === 1 &&
      parseInt(selectedDepartment) === 9 &&
      parseInt(selectedEquipment) === 17
    ) {
      showPageButton4.style.display = "block";
    } else {
      showPageButton4.style.display = "none";
    }
    if (
      selectedEmpresa &&
      parseInt(selectedCompany) === 1 &&
      parseInt(selectedDepartment) === 13
    ) {
      showPageButton5.style.display = "block";
    } else {
      showPageButton5.style.display = "none";
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
  }

  companySelect.addEventListener("change", () => {
    const selectedCompany = companySelect.value;

    if (selectedCompany !== "") {
      const selectedEmpresa = empresasData.find(
        (empresa) => empresa.empresa_id_cat_empresa === parseInt(selectedCompany)
      );

      const companyId = selectedEmpresa.empresa_id_cat_empresa;

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
          departmentSelect.innerHTML = "";

          const initialOption = document.createElement("option");
          initialOption.value = "";
          initialOption.text = "Seleccione departamento";
          departmentSelect.appendChild(initialOption);

          data.forEach((departamento) => {
            const option = document.createElement("option");
            option.value = departamento.departamento_id_cat_departamento;
            option.text = departamento.departamento_nombre;
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
      showPageButton2.style.display = "none";
      showPageButton3.style.display = "none";
      showPageButton4.style.display = "none";
    }
  });

  departmentSelect.addEventListener("change", () => {
    const selectedDepartment = departmentSelect.value;

    if (selectedDepartment !== "") {
      fetch("http://192.168.0.8:3000/api/usuarios/Get_Equipos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
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
          initialOption.text = "Seleccione equipo";
          equipmentSelect.appendChild(initialOption);

          data.forEach((equipo) => {
            const option = document.createElement("option");
            option.value = equipo.equipo_id_cat_equipo;
            option.text = equipo.equipo_nombre;
            equipmentSelect.appendChild(option);
          });
        })
        .catch((error) => {
          console.error("Error al obtener los equipos:", error);
        });
    } else {
      equipmentSelect.innerHTML = "";
      showPageButton1.style.display = "none";
      showPageButton2.style.display = "none";
      showPageButton3.style.display = "none";
      showPageButton4.style.display = "none";
    }
  });

  clearButtonD.addEventListener("click", () => {
    departmentSelect.value = "";
    equipmentSelect.innerHTML = "";
    showPageButton1.style.display = "none";
    showPageButton2.style.display = "none";
    showPageButton3.style.display = "none";
    showPageButton4.style.display = "none";
  });

  clearButtonE.addEventListener("click", () => {
    equipmentSelect.value = "";
    showPageButton1.style.display = "none";
    showPageButton2.style.display = "none";
    showPageButton3.style.display = "none";
    showPageButton4.style.display = "none";
  });

  companySelect.addEventListener("change", checkSelections);
  departmentSelect.addEventListener("change", checkSelections);
  equipmentSelect.addEventListener("change", checkSelections);

  const logoutButton = document.getElementById("logout-button");
  logoutButton.addEventListener("click", () => {
    localStorage.removeItem("username");

    document.body.innerHTML = "<h1>Error: Acceso no autorizado</h1>";
  });

  history.replaceState(null, null, location.href);
  window.addEventListener("popstate", () => {
    history.pushState(null, null, location.href);
  });

  companySelect.addEventListener("change", () => {
    const selectedCompanyId = companySelect.value;
    console.log("ID del departamento seleccionado:", selectedCompanyId);
  });

  departmentSelect.addEventListener("change", () => {
    const selectedDepartmentId = departmentSelect.value;
    console.log("ID del departamento seleccionado:", selectedDepartmentId);
  });

  equipmentSelect.addEventListener("change", () => {
    const selectedEquipmentId = equipmentSelect.value;
    console.log("ID del equipo seleccionado:", selectedEquipmentId);
  });
});
