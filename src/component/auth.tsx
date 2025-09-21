import API from "./api";

export async function login(username: string, password: string) {
  const response = await API.post("/api/token/", {
    username,
    password,
  });
  
  // Sauvegarder access + refresh tokens
  localStorage.setItem("access_token", response.data.access);
  localStorage.setItem("refresh_token", response.data.refresh);

  return response.data;
}

// Fonction pour s'enregistrer
export async function register(username: string, password: string) {
  try {
    const response = await API.post("/api/register/", { username, password });
    return response.data; // retourne les infos du nouvel utilisateur si besoin
  } catch (error: any) {
    console.error("Erreur lors de l'inscription :", error.response?.data || error.message);
    throw error;
  }
}

export async function refreshToken() {
  const refresh = localStorage.getItem("refresh_token");
  if (!refresh) {
    return null;
  }

  try {
    const response = await API.post("/api/token/refresh/", { refresh });
    // console.log(response.data);
    // const accessToken = response.data.access;
    localStorage.setItem("access_token", response.data.access);
    return response.data;  // retourne uniquement la string du token
  } catch (error) {
    console.error("Erreur refresh token:", error);
    return null;
  }
}


