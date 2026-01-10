import api from "./api";

// LOGIN
export async function loginRequest(email, password) {
  try {
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    return response.data;
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
