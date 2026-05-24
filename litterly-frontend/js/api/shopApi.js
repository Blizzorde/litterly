async function getShopItems(type = null) {
  try {
    const res = await axios.get(`${CONFIG.API_BASE_URL}/shop`, {
      withCredentials: true,
      params: type ? { type } : {},
    });
    return res.data.data;
  } catch (err) {
    if (!err.response) throw { status: 0, message: "Cannot reach server" };
    throw {
      status: err.response?.status,
      message: err.response?.data?.message,
    };
  }
}

async function purchaseItem(itemId) {
  try {
    const res = await axios.post(
      `${CONFIG.API_BASE_URL}/shop/purchase`,
      { item_id: itemId },
      { withCredentials: true },
    );
    return res.data;
  } catch (err) {
    if (!err.response) throw { status: 0, message: "Cannot reach server" };
    throw {
      status: err.response?.status,
      message: err.response?.data?.message,
    };
  }
}
