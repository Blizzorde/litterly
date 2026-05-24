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
    shopGrid.innerHTML = `<p class="shop-empty">No items here yet.</p>`;
    return;
  }

  shopGrid.innerHTML = items
    .map((item) => {
      const isOwned = item.owned && !item.stackable;

      const btn = isOwned
        ? `<button class="shop-card-cta purchased" disabled>
           <i class="fa-solid fa-check"></i> Purchased
         </button>`
        : `<button class="shop-card-cta" data-id="${item.id}" data-price="${item.price_points}">
           <i class="fa-solid fa-leaf"></i> ${item.price_points} Points
         </button>`;

      return `
      <div class="shop-card">
        <div class="shop-card-img">
          <i class="fa-solid ${TYPE_ICONS[item.item_type_name] ?? "fa-box"}"></i>
        </div>
        <div class="shop-card-details">
          <div class="shop-card-type">${item.item_type_name}</div>
          <div class="shop-card-title">${item.name}</div>
          <div class="shop-card-description">${item.description ?? ""}</div>
          ${btn}
        </div>
      </div>
    `;
    })
    .join("");
}

function getTypeFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const type = params.get("type");
  const allowed = ["badge", "avatar", "title", "frame", "purchased"];
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

shopGrid.addEventListener("click", async (e) => {
  const btn = e.target.closest(".shop-card-cta");
  if (!btn || btn.disabled) return;

  const itemId = btn.dataset.id;
  const price = btn.dataset.price;

  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Buying...';

  try {
    const res = await purchaseItem(itemId);

    btn.innerHTML = '<i class="fa-solid fa-check"></i> Purchased';
    btn.classList.add("purchased");

    // update points in navbar live
    const pointsEl = document.querySelector("#points");
    if (pointsEl) pointsEl.textContent = res.remaining_points;
    if (window.currentUser) window.currentUser.points = res.remaining_points;

    showNotif(
      "fa-circle-check",
      "Purchased!",
      `Item added to your inventory`,
      "success",
      {
        duration: 2000,
      },
    );
  } catch (err) {
    btn.disabled = false;
    btn.innerHTML = `<i class="fa-solid fa-leaf"></i> ${price} Points`;

    let msg = "Purchase failed, try again";
    if (err.status === 400) msg = err.message;
    else if (err.status === 0) msg = "Cannot reach server";

    showNotif("fa-circle-xmark", "Purchase Failed", msg, "danger");
  }
});

loadShopItems();
