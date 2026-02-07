import { FaUser, FaLock, FaEnvelope } from "react-icons/fa";
import { Background, SignupContainer } from "./SignupStyled";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerRequest } from "../../service/auth.service";
import toast from "react-hot-toast";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem!");
      return;
    }

    // Validação adicional
    if (!name || !email || !password) {
      toast.error("Por favor, preencha todos os campos!");
      return;
    }

    if (name.trim().length < 3) {
      toast.error("O nome deve ter pelo menos 3 caracteres!");
      return;
    }

    const userData = {
      name: name.trim(),
      email: email.trim(),
      password,
      level: "USER",
    };

    console.log("📋 Dados do formulário:", userData);

    try {
      await registerRequest(userData);

      toast.success("Cadastro realizado com sucesso!");
      navigate("/login");
    } catch (error) {
      console.error("Erro no cadastro:", error);
      toast.error(error || "Erro ao realizar cadastro");
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
              id="name"
              name="name"
              placeholder="Nome Completo"
              value={name}
              required
              onChange={(e) => setName(e.target.value)}
            />
            <FaUser className="icon" />
          </div>

          <div className="input-field">
            <input
              type="email"
              id="email"
              name="email"
              placeholder="E-mail"
              value={email}
              autoComplete="email"
              required
              onChange={(e) => setEmail(e.target.value)}
            />
            <FaEnvelope className="icon" />
          </div>

          <div className="input-field">
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Senha"
              value={password}
              autoComplete="new-password"
              required
              onChange={(e) => setPassword(e.target.value)}
            />
            <FaLock className="icon" />
          </div>

          <div className="input-field">
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Confirme a Senha"
              value={confirmPassword}
              autoComplete="new-password"
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
