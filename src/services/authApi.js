const AUTH_BASE_URL = "http://localhost:8080/api/auth";

export async function registerUser(payload) {
  const response = await fetch(`${AUTH_BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error((await response.text()) || "Failed to register");
  }

  return response.json();
}

export async function loginUser(payload) {
  const response = await fetch(`${AUTH_BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error((await response.text()) || "Failed to login");
  }

  return response.json();
}
