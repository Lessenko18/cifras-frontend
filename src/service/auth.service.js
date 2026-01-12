import api from "./api";

// LOGIN
export async function loginRequest(email, password) {
  try {
    // 1️⃣ faz login e recebe o token
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    const token = response.data.token;

    // 2️⃣ salva o token
    localStorage.setItem("token", token);

    // 3️⃣ busca o usuário logado usando o token
    const meResponse = await api.get("/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const user = meResponse.data;

    // 4️⃣ salva o usuário
    localStorage.setItem("user", JSON.stringify(user));

    // 5️⃣ retorna o usuário (opcional, mas útil)
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

// LOGOUT (boa prática)
export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}
