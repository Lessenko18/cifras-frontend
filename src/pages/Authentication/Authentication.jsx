import { FaUser, FaLock } from "react-icons/fa";
import { Background, Login } from "./AuthenticationStyled";
import { useState } from "react";
import { loginRequest } from "../../service/auth.service";

export default function Authentication() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const result = await loginRequest(username, password);

      console.log("Login OK:", result);

      // salva o token no navegador
      localStorage.setItem("token", result.token.token);

      alert("Login realizado com sucesso!");
    } catch (error) {
      alert(error);
    }
  };

  return (
    <Background>
      <Login>
        <form onSubmit={handleSubmit}>
          <h1>Acesse o sistema</h1>

          <div className="input-field">
            <input
              type="email"
              placeholder="E-mail"
              onChange={(e) => setUsername(e.target.value)}
            />
            <FaUser className="icon" />
          </div>

          <div className="input-field">
            <input
              type="password"
              placeholder="Senha"
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
      </Login>
    </Background>
  );
}
