import api from "./api";
import { normalizeAvatarUrl } from "../utils/normalizeAvatarUrl";

// LOGIN
export async function loginRequest(email, password) {
  try {
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    const token = response.data.token;

    localStorage.setItem("token", token);

    const meResponse = await api.get("/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const user = meResponse.data;

    if (user) {
      user.avatar = normalizeAvatarUrl(user.avatar);
      user.photo = normalizeAvatarUrl(user.photo);
    }

    localStorage.setItem("user", JSON.stringify(user));

    return user;
  } catch (err) {
    throw (
      err.response?.data?.message ||
      "Erro ao fazer login. Verifique suas credenciais."
    );
  }
}

// ESQUECI MINHA SENHA
export async function forgotPasswordService(email) {
  try {
    const response = await api.post("/auth/forgot-password", {
      email,
    });

    return response.data;
  } catch (err) {
    throw err.response?.data?.message || "Erro ao processar solicitação.";
  }
}

// REGISTRO
export async function registerRequest(data) {
  try {
    const response = await api.post("/auth/register", data);

    return response.data;
  } catch (err) {
    throw err.response?.data?.message || "Erro ao realizar cadastro.";
  }
}

// LOGOUT
export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}
