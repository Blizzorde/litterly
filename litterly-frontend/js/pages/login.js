const adminBtn = document.querySelector("#admin-btn-demo");
const userBtn = document.querySelector("#user-btn-demo");
const loginBtn = document.querySelector("#login-btn");

const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");

const loginForm = document.querySelector("#login-form");
const errMsg = document.querySelector("#err-msg");

function setLoading(loading) {
  if (loading) {
    loginBtn.disabled = true;
    loginBtn.innerHTML =
      '<i class="fa-solid fa-circle-notch fa-spin"></i> Logging in...';
    emailInput.disabled = true;
    passwordInput.disabled = true;
  } else {
    loginBtn.disabled = false;
    loginBtn.innerHTML =
      '  Sign In <i class="fa-solid fa-arrow-right-to-bracket"></i>';
    emailInput.disabled = false;
    passwordInput.disabled = false;
  }
}

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = emailInput.value;
  const password = passwordInput.value;

  try {
    setLoading(true);
    await loginUser(email, password);

    showNotif("fa-circle-check", "Success", "Logged in!", "success");
    setTimeout(() => {
      setLoading(false);
      window.location.href = "/";
    }, 1500);
  } catch (err) {
    setLoading(false);

    let msg = "";
    switch (err.status) {
      case 0:
        msg = "Cannot reach server, check your connection";
        showNotif("fa-circle-xmark", "Login Failed", msg, "danger");
        break;
      case 401:
        msg = "Wrong Email or Password";
        showNotif("fa-circle-xmark", "Login Failed", msg, "danger");
        break;
      case 404:
        msg = "Account Not Found";
        showNotif("fa-circle-xmark", "Login Failed", msg, "danger");
        break;
      default:
        msg = "Something went wrong";
        showNotif("fa-circle-xmark", "Login Failed", msg, "danger");
        break;
    }
  }
});

adminBtn.addEventListener("click", () => {
  emailInput.value = "admin@litterly.sr";
  passwordInput.value = "admin-litterly";
});

userBtn.addEventListener("click", () => {
  emailInput.value = "user@litterly.sr";
  passwordInput.value = "user-litterly";
});
