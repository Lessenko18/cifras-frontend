import api from "./api";
import { normalizeAvatarUrl } from "../utils/normalizeAvatarUrl";
import { getPublicAppUrl } from "../utils/getPublicAppUrl";

function normalizeUser(user) {
  if (!user) return user;

  return {
    ...user,
    avatar: normalizeAvatarUrl(user.avatar),
    photo: normalizeAvatarUrl(user.photo),
  };
}

// LOGIN
export async function loginRequest(email, password, remember = false) {
  try {
    const response = await api.post("/auth/login", {
      email,
      password,
      remember,
    });

    const token = response.data.token;

    localStorage.setItem("token", token);

    const meResponse = await api.get("/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const user = normalizeUser(meResponse.data);

    localStorage.setItem("user", JSON.stringify(user));

    return user;
  } catch (err) {
    throw (
      err.response?.data?.message ||
      "Erro ao fazer login. Verifique suas credenciais."
    );
  }
}

export async function getMeRequest() {
  const response = await api.get("/auth/me");
  const user = response?.data?.user || response?.data;
  return normalizeUser(user);
}

// ESQUECI MINHA SENHA
export async function forgotPasswordService(email) {
  try {
    const appUrl = getPublicAppUrl();

    const response = await api.post("/auth/forgot-password", {
      email,
      appUrl,
      frontendUrl: appUrl,
      resetPasswordUrl: appUrl ? `${appUrl}/reset-password` : undefined,
    });

    return response.data;
  } catch (err) {
    throw err.response?.data?.message || "Erro ao processar solicitação.";
  }
}

// RESET DE SENHA
export async function resetPasswordService(token, newPassword) {
  try {
    const response = await api.post("/auth/reset-password", {
      token,
      newPassword,
    });

    return response.data;
  } catch (err) {
    throw err.response?.data?.message || "Erro ao redefinir senha.";
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
