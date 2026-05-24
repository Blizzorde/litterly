async function getMissions() {
  try {
    const res = await axios.get(`${CONFIG.API_BASE_URL}/missions`, {
      withCredentials: true,
    });
    return res.data;
  } catch (err) {
    if (!err.response) throw { status: 0, message: "Cannot reach server" };
    throw {
      status: err.response?.status,
      message: err.response?.data?.message,
    };
  }
}
