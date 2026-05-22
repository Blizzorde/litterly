import { login } from "../api/loginApi.js";

const loginForm = document.getElementById("login-form");
const toastContainer = document.getElementById("toast-container");

function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value.trim();

  try {
    await login(email, password);
    showToast("Logged in successfully. Redirecting to missions...", "success");
    setTimeout(() => {
      window.location.href = "missions.html";
    }, 1000);
  } catch (err) {
    showToast(err.message || "Login failed", "error");
  }
});

