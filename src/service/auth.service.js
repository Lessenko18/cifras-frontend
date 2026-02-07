import api from "./api";

// LOGIN
export async function loginRequest(email, password) {
  try {
    console.log("=== LOGIN DEBUG ===");
    console.log("📧 Email:", email);

    const response = await api.post("/auth/login", {
      email,
      password,
    });

    console.log("✅ Response do /auth/login:", response.data);
    const token = response.data.token;
    console.log("🔑 Token recebido:", token);

    localStorage.setItem("token", token);
    console.log("✅ Token salvo no localStorage");

    const meResponse = await api.get("/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("✅ Response do /auth/me:", meResponse.data);
    const user = meResponse.data;

    localStorage.setItem("user", JSON.stringify(user));
    console.log("✅ User salvo no localStorage:", user);
    console.log("===================");

    return user;
  } catch (err) {
    console.error("❌ Login Error:", err.response?.data || err.message);
    console.error("❌ Full error object:", err);
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
    console.log("=== REGISTER DEBUG ===");
    console.log("📝 Data being sent:", data);
    console.log("📝 Data stringified:", JSON.stringify(data));

    const response = await api.post("/auth/register", data);

    return response.data;
  } catch (err) {
    console.error("❌ Register Error:", err.response?.data || err.message);
    console.error("❌ Full error object:", err);
    throw err.response?.data?.message || "Erro ao realizar cadastro.";
  }
}

// LOGOUT
export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}
