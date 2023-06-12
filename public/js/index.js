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
  event.preventDefault(); // Evita el envío del formulario por defecto

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
          window.location.href = "reports/dropDowns.html";
          localStorage.setItem("username", username);
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
