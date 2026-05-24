const userBtn = document.querySelector("#user-btn-demo");
const registerBtn = document.querySelector("#register-btn");

const usernameInput = document.querySelector("#username");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");
const confirmPasswordInput = document.querySelector("#conf-password");

const registerForm = document.querySelector("#register-form");
const errMsg = document.querySelector("#err-msg");

function setLoading(loading) {
  if (loading) {
    registerBtn.disabled = true;
    registerBtn.innerHTML =
      '<i class="fa-solid fa-circle-notch fa-spin"></i> Registering...';
    usernameInput.disabled = true;
    emailInput.disabled = true;
    passwordInput.disabled = true;
    confirmPasswordInput.disabled = true;
  } else {
    registerBtn.disabled = false;
    registerBtn.innerHTML =
      ' Register<i class="fa-solid fa-arrow-right-to-bracket"></i>';
    usernameInput.disabled = false;
    emailInput.disabled = false;
    passwordInput.disabled = false;
    confirmPasswordInput.disabled = false;
  }
}

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = usernameInput.value;
  const email = emailInput.value;
  const password = passwordInput.value;
  const confPassword = confirmPasswordInput.value;

  if (password != confPassword) {
    showNotif(
      "fa-circle-xmark",
      "Register Failed",
      "Passwords do not match!",
      "danger",
    );
    return;
  }

  try {
    setLoading(true);
    await registerUser(username, email, password);

    showNotif(
      "fa-circle-check",
      "Success",
      "Registered Succesfully!",
      "success",
    );
    setTimeout(() => {
      setLoading(false);
      window.location.href = "/pages/login.html";
    }, 1500);
  } catch (err) {
    setLoading(false);
    console.error(err);

    let msg = "";
    switch (err.status) {
      case 0:
        msg = "Cannot reach server, check your connection";
        showNotif("fa-circle-xmark", "Login Failed", msg, "danger");
        break;
      default:
        msg = "Something went wrong";
        showNotif("fa-circle-xmark", "Login Failed", msg, "danger");
        break;
    }
  }
});

userBtn.addEventListener("click", () => {
  usernameInput.value = "EpicHeroJessy";
  emailInput.value = "user@litterly.sr";
  passwordInput.value = "user-litterly";
  confirmPasswordInput.value = "user-litterly";
});
