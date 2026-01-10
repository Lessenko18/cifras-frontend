import { FaUser, FaLock } from "react-icons/fa";
import { Background, LoginContainer } from "./LoginStyled";
import { useState } from "react";
import { loginRequest } from "../../service/auth.service";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email || !password) {
      alert("Por favor, preencha todos os campos.");
      return;
    }

    try {
      const result = await loginRequest(email, password);

      console.log("Login OK:", result);

      // Salva o token de forma segura no localStorage
      if (result.token) {
        localStorage.setItem("token", result.token);
        alert("Login realizado com sucesso!");
        navigate("/home"); 
      } else {
        alert("Erro ao receber token de autenticação.");
      }
    } catch (error) {
      alert(error);
    }
  };

  return (
    <Background>
      <LoginContainer>
        <form onSubmit={handleSubmit}>
          <h1>Acesse o sistema</h1>

          <div className="input-field">
            <input
              type="email"
              placeholder="E-mail"
              required
              onChange={(e) => setEmail(e.target.value)}
            />
            <FaUser className="icon" />
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

          <div className="recall-forget">
            <label>
              <input type="checkbox" /> Lembrar-me
            </label>
            <a href="/forgot-password">Esqueci minha senha</a>
          </div>

          <button type="submit">Entrar</button>

          <div className="signup-link">
            <p>Não tem uma conta?</p>
            <a href="/signup">Cadastre-se</a>
          </div>
        </form>
      </LoginContainer>
    </Background>
  );
}
