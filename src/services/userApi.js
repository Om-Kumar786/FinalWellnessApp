const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/users`;

const parseErrorMessage = async (response, fallback) => {
  const text = await response.text();
  return text || fallback;
};

export async function fetchUsers() {
  const response = await fetch(API_BASE_URL);
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response, "Failed to fetch users"));
  }
  return response.json();
}

export async function createUser(user) {
  const response = await fetch(API_BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response, "Failed to create user"));
  }
  return response.json();
}

export async function updateUser(id, user) {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response, "Failed to update user"));
  }
  return response.json();
}

export async function deleteUser(id) {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response, "Failed to delete user"));
  }
  return response.text();
}

export async function updateUserAccess(id, active) {
  const response = await fetch(`${API_BASE_URL}/${id}/access?active=${active}`, {
    method: "PATCH",
  });
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response, "Failed to update access"));
  }
  return response.json();
}
