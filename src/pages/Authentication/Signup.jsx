import { FaUser, FaLock, FaEnvelope } from "react-icons/fa";
import { Background, SignupContainer } from "./SignupStyled";
import { useState } from "react";
import axios from "axios";
import { baseURL } from "../../service/cifraService";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      alert("As senhas não coincidem!");
      return;
    }

    try {
      // Usando a rota de registro do backend analisado
      const response = await axios.post(`${baseURL}/auth/register`, {
        nome,
        email,
        password,
        level: "user" 
      });

      alert(response.data.message || "Cadastro realizado com sucesso!");
      navigate("/login");
    } catch (error) {
      alert(error.response?.data?.message || "Erro ao realizar cadastro");
    }
  };

  return (
    <Background>
      <SignupContainer>
        <form onSubmit={handleSubmit}>
          <h1>Crie sua conta</h1>

          <div className="input-field">
            <input
              type="text"
              placeholder="Nome Completo"
              required
              onChange={(e) => setNome(e.target.value)}
            />
            <FaUser className="icon" />
          </div>

          <div className="input-field">
            <input
              type="email"
              placeholder="E-mail"
              required
              onChange={(e) => setEmail(e.target.value)}
            />
            <FaEnvelope className="icon" />
          </div>

          <div className="input-field">
            <input
              type="password"
              placeholder="Senha"
              required
              onChange={(e) => setPassword(e.target.value)}
            />
            <FaLock className="icon" />
          </div>

          <div className="input-field">
            <input
              type="password"
              placeholder="Confirme a Senha"
              required
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <FaLock className="icon" />
          </div>

          <button type="submit">Cadastrar</button>

          <div className="login-link">
            <p>Já tem uma conta?</p>
            <a href="/login">Faça Login</a>
          </div>
        </form>
      </SignupContainer>
    </Background>
  );
}
