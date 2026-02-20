import { FaEnvelope } from "react-icons/fa";
import { Background, ForgotContainer } from "./ForgotPasswordStyled";
import { useState } from "react";
import { forgotPasswordService } from "../../service/auth.service";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email) {
      toast.error("Por favor, insira seu e-mail.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Por favor, insira um e-mail válido.");
      return;
    }

    try {
      const result = await forgotPasswordService(email);
      toast.success(
        result?.message ||
          "Se o e-mail existir, você receberá um link para redefinir a senha.",
      );
      navigate("/login");
    } catch (error) {
      toast.error(error || "Erro ao processar solicitação.");
    }
  };

  return (
    <Background>
      <ForgotContainer>
        <form onSubmit={handleSubmit}>
          <h1>Recuperar Senha</h1>
          <p>
            Insira seu e-mail para receber as instruções de recuperação de
            senha.
          </p>

          <div className="input-field">
            <input
              type="email"
              placeholder="E-mail"
              required
              onChange={(e) => setEmail(e.target.value)}
            />
            <FaEnvelope className="icon" />
          </div>

          <button type="submit">Enviar Instruções</button>

          <div className="back-link">
            <Link to="/login">Voltar ao Login</Link>
          </div>
        </form>
      </ForgotContainer>
    </Background>
  );
}
