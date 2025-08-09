export const getToken = () => localStorage.getItem('authToken');
export const clearToken = () => localStorage.removeItem('authToken');
const API_URL = "http://127.0.0.1:5000/api"; // عدّله لاحقًا إذا تغيّر الباكند

export async function login(identifier, password) {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ identifier, password }),
    });

    if (!response.ok) {
      throw new Error("فشل تسجيل الدخول");
    }

    return await response.json();
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

export async function register(username, identifier, password) {
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, identifier, password }),
    });

    if (!response.ok) {
      throw new Error("فشل تسجيل الحساب");
    }

    return await response.json();
  } catch (error) {
    console.error("Register error:", error);
    throw error;
  }
}
