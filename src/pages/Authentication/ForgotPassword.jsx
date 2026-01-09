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
      alert("Por favor, insira seu e-mail.");
      return;
    }

    try {
      // O backend precisa ter uma rota para /auth/forgot-password
      await forgotPasswordService(email);

      alert("Se um e-mail cadastrado for encontrado, instruções de recuperação serão enviadas.");
      navigate("/login");
    } catch (error) {
      // Para segurança, não confirme se o e-mail existe ou não
      alert("Se um e-mail cadastrado for encontrado, instruções de recuperação serão enviadas.");
      console.error(error); // Log do erro para debug
      navigate("/login");
    }
  };

  return (
    <Background>
      <ForgotContainer>
        <form onSubmit={handleSubmit}>
          <h1>Recuperar Senha</h1>
          <p>
            Insira seu e-mail para receber as instruções de recuperação de senha.
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
