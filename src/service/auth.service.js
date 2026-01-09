import axios from "axios";
import { baseURL } from "./cifraService";

// Função de Login
export async function loginRequest(email, password) {
  try {
    const response = await axios.post(`${baseURL}/auth/login`, {
      email,
      password,
    });
    return response.data;
  } catch (err) {
    throw err.response?.data?.message || "Erro ao fazer login. Verifique suas credenciais.";
  }
}

// Função de Recuperação de Senha
export async function forgotPasswordService(email) {
  try {
    const response = await axios.post(`${baseURL}/auth/forgot-password`, {
      email,
    });

    return response.data;
  } catch (err) {
    throw err.response?.data?.message || "Erro ao processar solicitação.";
  }
}

// Função de Registro (opcional, já que usamos axios direto no componente, mas bom ter aqui)
export async function registerRequest(data) {
  try {
    const response = await axios.post(`${baseURL}/auth/register`, data);
    return response.data;
  } catch (err) {
    throw err.response?.data?.message || "Erro ao realizar cadastro.";
  }
}
