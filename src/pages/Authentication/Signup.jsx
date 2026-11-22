import { FaUser, FaLock, FaEnvelope } from "react-icons/fa";
import { Background, SignupContainer } from "./SignupStyled";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerRequest } from "../../service/auth.service";
import toast from "react-hot-toast";

// Contas novas: 8. (Quem já tem conta com 6 continua entrando normalmente.)
const MIN_PASSWORD_LENGTH = 8;

import { passwordStrength } from "../../utils/passwordStrength";

const fieldMessage = { margin: "4px 4px 0", fontSize: 12, color: "#ff8a8a", textAlign: "left" };
const STRENGTH_COLORS = ["#e5484d", "#e5484d", "#f5a524", "#6cc24a", "#2e9e4f"];

function validate({ name, email, password, confirmPassword }) {
  return {
    name: !name.trim() ? "Informe seu nome." : name.trim().length < 3 ? "O nome deve ter pelo menos 3 caracteres." : "",
    email: !email.trim() ? "Informe seu e-mail." : !/^\S+@\S+\.\S+$/.test(email.trim()) ? "Digite um e-mail válido." : "",
    password: !password
      ? "Crie uma senha."
      : password.length < MIN_PASSWORD_LENGTH
        ? `A senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`
        : "",
    confirmPassword: !confirmPassword ? "Confirme a senha." : confirmPassword !== password ? "As senhas não coincidem." : "",
  };
}

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const values = { name, email, password, confirmPassword };
  const errors = validate(values);
  // Erro aparece assim que a pessoa começa a digitar no campo (ou ao tentar enviar)
  const shown = (field) => (submitted || values[field] ? errors[field] : "");
  const strength = passwordStrength(password);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitted(true);

    if (Object.values(errors).some(Boolean)) {
      toast.error(Object.values(errors).find(Boolean));
      return;
    }

    const userData = {
      name: name.trim(),
      email: email.trim(),
      password,
    };

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
        <form onSubmit={handleSubmit} noValidate>
          <h1>Crie sua conta</h1>

          <div className="input-field">
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Nome Completo"
              value={name}
              aria-invalid={Boolean(shown("name"))}
              aria-describedby="name-erro"
              required
              onChange={(e) => setName(e.target.value)}
            />
            <FaUser className="icon" />
          </div>
          {shown("name") && (
            <p id="name-erro" role="alert" style={fieldMessage}>
              {shown("name")}
            </p>
          )}

          <div className="input-field">
            <input
              type="email"
              id="email"
              name="email"
              placeholder="E-mail"
              value={email}
              autoComplete="email"
              aria-invalid={Boolean(shown("email"))}
              aria-describedby="email-erro"
              required
              onChange={(e) => setEmail(e.target.value)}
            />
            <FaEnvelope className="icon" />
          </div>
          {shown("email") && (
            <p id="email-erro" role="alert" style={fieldMessage}>
              {shown("email")}
            </p>
          )}

          <div className="input-field">
            <input
              type="password"
              id="password"
              name="password"
              placeholder={`Senha (mín. ${MIN_PASSWORD_LENGTH} caracteres)`}
              value={password}
              autoComplete="new-password"
              aria-invalid={Boolean(shown("password"))}
              aria-describedby="password-erro"
              required
              onChange={(e) => setPassword(e.target.value)}
            />
            <FaLock className="icon" />
          </div>
          {shown("password") && (
            <p id="password-erro" role="alert" style={fieldMessage}>
              {shown("password")}
            </p>
          )}
          {password && (
            <div style={{ margin: "6px 4px 0", textAlign: "left" }} aria-live="polite">
              <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.2)" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${(strength.score + 1) * 20}%`,
                    borderRadius: 2,
                    background: STRENGTH_COLORS[strength.score],
                    transition: "width 0.2s",
                  }}
                />
              </div>
              <span style={{ fontSize: 12 }}>Força da senha: {strength.label}</span>
            </div>
          )}

          <div className="input-field">
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Confirme a Senha"
              value={confirmPassword}
              autoComplete="new-password"
              aria-invalid={Boolean(shown("confirmPassword"))}
              aria-describedby="confirmPassword-erro"
              required
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <FaLock className="icon" />
          </div>
          {shown("confirmPassword") && (
            <p id="confirmPassword-erro" role="alert" style={fieldMessage}>
              {shown("confirmPassword")}
            </p>
          )}

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
