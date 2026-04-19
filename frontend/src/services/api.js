const BASE_URL = "http://localhost:5000/api";

// 🔐 Get token safely
const getToken = () => {
  const token = localStorage.getItem("token");

  // ❌ Prevent sending invalid token
  if (!token || token === "undefined" || token === "null") {
    return null;
  }

  return token;
};

// 📡 Generic API request
export const apiRequest = async (endpoint, method = "GET", body = null) => {
  try {
    const token = getToken();

    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      ...(body && { body: JSON.stringify(body) }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Something went wrong");
    }

    return data;
  } catch (error) {
    throw error;
  }
};