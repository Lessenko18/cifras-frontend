import { FaEnvelope } from "react-icons/fa";
import { Background, ForgotContainer } from "./ForgotPasswordStyled";
import { useState } from "react";
import { forgotPasswordService } from "../../service/auth.service";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email) {
      toast.alert("Por favor, insira seu e-mail.");
      return;
    }

    try {
      await forgotPasswordService(email);

      alert("(Entre em contato com o ADM se não receber o e-mail).");
      navigate("/login");
    } catch (error) {
      alert("Entre em contato com o ADM se não receber o e-mail.");
      console.error(error);
      navigate("/login");
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
            <a href="/login">Voltar ao Login</a>
          </div>
        </form>
      </ForgotContainer>
    </Background>
  );
}
