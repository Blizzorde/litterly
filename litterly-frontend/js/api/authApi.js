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

async function getMe() {
  try {
    const res = await axios.get(`${CONFIG.API_BASE_URL}/users/me`, {
      withCredentials: true,
    });
    return res.data.user;
  } catch (err) {
    console.error(err.message);
    return null; // not logged in
  }
}

async function logoutUser() {
  try {
    await axios.post(
      `${CONFIG.API_BASE_URL}/auth/logout`,
      {},
      { withCredentials: true },
    );
  } catch (err) {
    // doesn't matter, clear local state anyway
  }
}

async function registerUser(username, email, password) {
  try {
    const res = await axios.post(
      `${CONFIG.API_BASE_URL}/auth/register`,
      {
        username,
        email,
        password,
      },
      {
        withCredentials: true,
      },
    );

    return res.data;
  } catch (err) {
    console.error(err);
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
