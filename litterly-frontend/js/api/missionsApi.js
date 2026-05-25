async function getMissions(type = null) {
  try {
    const params = type ? { type } : {};
    const res = await axios.get(`${CONFIG.API_BASE_URL}/missions`, {
      withCredentials: true,
      params,
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

async function getMissionById(id) {
  try {
    const res = await axios.get(`${CONFIG.API_BASE_URL}/missions/${id}`, {
      withCredentials: true,
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

async function registerForMission(missionId, areaId) {
  try {
    const res = await axios.post(
      `${CONFIG.API_BASE_URL}/missions/${missionId}/register`,
      { area_id: areaId },
      { withCredentials: true },
    );
    return res.data;
  } catch (err) {
    if (!err.response) throw { status: 0, message: "Cannot reach server" };
    throw {
      status: err.response?.status,
      message: err.response?.data?.message,
      areas: err.response?.data?.areas ?? null,
    };
  }
}

async function cancelMissionRegistration(missionId) {
  try {
    const res = await axios.post(
      `${CONFIG.API_BASE_URL}/missions/${missionId}/cancel`,
      {},
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
