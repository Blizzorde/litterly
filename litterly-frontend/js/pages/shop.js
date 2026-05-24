const shopGrid = document.querySelector(".shop-products");

const TYPE_ICONS = {
  badge: "fa-medal",
  avatar: "fa-circle-user",
  title: "fa-tag",
  frame: "fa-border-style",
};

function renderLoading() {
  shopGrid.innerHTML = `
    <div class="shop-loading">
      <i class="fa-solid fa-spinner fa-spin"></i>
    </div>
  `;
}

function renderItems(items) {
  if (!items.length) {
    shopGrid.innerHTML = `<p class="shop-empty">No items available.</p>`;
    return;
  }

  shopGrid.innerHTML = items
    .map(
      (item) => `
    <div class="shop-card">
      <div class="shop-card-img">
        <i class="fa-solid ${TYPE_ICONS[item.item_type_name] ?? "fa-box"}"></i>
      </div>
      <div class="shop-card-details">
        <div class="shop-card-type">${item.item_type_name}</div>
        <div class="shop-card-title">${item.name}</div>
        <div class="shop-card-description">${item.description ?? ""}</div>
        <button class="shop-card-cta" data-id="${item.id}" data-price="${item.price_points}">
          <i class="fa-solid fa-leaf"></i>
          ${item.price_points} Points
        </button>
      </div>
    </div>
  `,
    )
    .join("");
}

function getTypeFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const type = params.get("type");
  const allowed = ["badge", "avatar", "title", "frame"];
  return allowed.includes(type) ? type : null;
}

function setActiveFilter(type) {
  document.querySelectorAll(".shop-filter").forEach((el) => {
    el.classList.remove("active");
    if (el.dataset.type === (type ?? "")) el.classList.add("active");
  });
}

async function loadShopItems() {
  const type = getTypeFromUrl();
  setActiveFilter(type);
  renderLoading();

  try {
    const items = await getShopItems(type);
    renderItems(items);
  } catch (err) {
    shopGrid.innerHTML = "";
    showNotif(
      "fa-circle-xmark",
      "Error",
      "Failed to load shop items",
      "danger",
    );
  }
}

loadShopItems();
