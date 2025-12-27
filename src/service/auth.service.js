import axios from "axios";
import { baseURL } from "./cifraService";

export async function loginRequest(email, password) {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password,
    });

    return response.data;
  } catch (err) {
    throw err.response?.data?.message || "Erro ao fazer login";
  }
}
