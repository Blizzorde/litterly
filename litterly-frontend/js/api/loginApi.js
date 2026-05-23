async function loginUser(email, password) {
  try {
    const res = await axios.post(
      `${CONFIG.API_BASE_URL}/auth/login`,
      {
        email,
        password,
      },
      {
        withCredentials: true,
      },
    );

    return res.data;
  } catch (err) {
    if (!err.response)
      throw {
        status: 0,
        message: "Cannot reach server, check your connection",
      };
    throw {
      status: err.response?.status,
      message: err.response?.data?.message,
    };
  }
}
