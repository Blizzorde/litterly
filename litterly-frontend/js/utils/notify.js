function showNotif(icon, title, subtext, type, options = {}) {
  let bg = "";
  switch (type) {
    case "danger":
      bg = "red";
      break;
    case "info":
      bg = "blue";
      break;
    case "success":
      bg = "green";
      break;
    case "warning":
      bg = "red";
      break;
  }

  const html = `
    <div class="toast-content">
      <i class="fa-solid ${icon} toast-icon"></i>
      <div class="toast-text">
        <span class="toast-title">${title}</span>
        <span class="toast-subtext">${subtext}</span>
      </div>
    </div>
  `;

  Toastify({
    text: html,
    escapeMarkup: false,
    duration: 3000,
    gravity: "top",
    position: "right",
    style: { background: bg, borderRadius: "1rem" },
    ...options,
  }).showToast();
}
