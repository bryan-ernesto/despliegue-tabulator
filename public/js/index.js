const inputs = document.querySelectorAll(".input");
const loginForm = document.getElementById("login-form");
const usernameInput = document.getElementById("username-input");
const passwordInput = document.getElementById("password-input");
const statusMessage = document.getElementById("status-message");

function addcl() {
  let parent = this.parentNode.parentNode;
  parent.classList.add("focus");
}

function remcl() {
  let parent = this.parentNode.parentNode;
  if (this.value == "") {
    parent.classList.remove("focus");
  }
}

inputs.forEach((input) => {
  input.addEventListener("focus", addcl);
  input.addEventListener("blur", remcl);
});

function validateForm(event) {
  console.log("Función validateForm llamada");
  event.preventDefault();
  loginForm.removeEventListener("submit", validateForm);

  const username = usernameInput.value;
  const password = passwordInput.value;

  if (!username || !password) {
    const tooltip = document.createElement("div");
    tooltip.classList.add("tooltip");
    tooltip.textContent = "Por favor, ingrese usuario y contraseña";
    document.body.appendChild(tooltip);
    setTimeout(() => {
      tooltip.remove();
    }, 3000);
  } else {
    fetch("http://192.168.0.8:3000/api/AD/Get_validate_status_user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.authenticated) {
          showStatusMessage("Credenciales válidas, iniciando sesión...", true);
          console.log("Credenciales correctas");
          fetch(
            `http://192.168.0.8:3000/api/reporteador/Get_Usuarios_Reporteador`,
            {
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
            }
          )
            .then((response) => response.json())
            .then((userData) => {
              const userId = userData[0].id_cat_usuario;
              console.log(userId);
              fetch(
                "http://192.168.0.8:3000/api/recepciones_documento/Post_Documento_BitacoraLogin",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    int_id_cat_aplicativo: 5,
                    int_id_cat_usuario: userId,
                    int_id_creador: userId,
                  }),
                }
              )
                .then((response) => response.json())
                .then((result) => {
                  console.log("Registro de bitácora exitoso", result);
                  window.location.href = "reports/dropDowns.html";
                  localStorage.setItem("username", username);
                })
                .catch((error) => {
                  console.error(
                    "Error al realizar el registro de bitácora:",
                    error
                  );
                });
            })
            .catch((error) => {
              console.error("Error al obtener el ID de usuario:", error);
            });
        } else {
          showStatusMessage(
            "Credenciales inválidas, intente nuevamente",
            false
          );
          console.error("Contraseñas incorrectas");
        }
        setTimeout(() => {
          clearStatusMessage();
        }, 3000);
      })
      .catch((error) => {
        console.error("Error al realizar la solicitud:", error);
      });
  }
}

function showStatusMessage(message, isSuccess) {
  statusMessage.textContent = message;
  statusMessage.classList.remove("success", "error");
  statusMessage.classList.add(isSuccess ? "success" : "error");
}

function clearStatusMessage() {
  statusMessage.textContent = "";
  statusMessage.classList.remove("success", "error");
}

loginForm.addEventListener("submit", validateForm);

function initializeCarousel() {
  let images = document.querySelectorAll('.carousel-images img');

  let currentIndex = localStorage.getItem('carouselIndex');

  if (currentIndex === null) {
    currentIndex = 0;
  } else {
    currentIndex = (parseInt(currentIndex, 10) + 1) % images.length;
  }

  localStorage.setItem('carouselIndex', currentIndex.toString());
  images[currentIndex].style.display = 'block';

  function showNextImage() {
    images[currentIndex].style.display = 'none';
    currentIndex = (currentIndex + 1) % images.length;
    images[currentIndex].style.display = 'block';
  }

  document.getElementById('prev').addEventListener('click', function () {
    images[currentIndex].style.display = 'none';
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    images[currentIndex].style.display = 'block';
  });

  document.getElementById('next').addEventListener('click', showNextImage);

  setInterval(showNextImage, 35000);
}

initializeCarousel();


function handleAutoFocus() {
  if (usernameInput === document.activeElement) {
    let parent = usernameInput.parentNode.parentNode;
    parent.classList.add("focus");
  }
}

handleAutoFocus();
