import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { Background, LoginContainer } from "./LoginStyled";
import { useState } from "react";
import { loginRequest } from "../../service/auth.service";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email || !password) {
      toast.error("Por favor, preencha todos os campos.");
      return;
    }

    try {
      const user = await loginRequest(email, password);
      console.log("Login OK:", user);

      if (!user) {
        toast.error("Erro ao realizar login.");
        return;
      }

      toast.success("Login realizado com sucesso!");
      navigate("/home");
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
            <FaUser className="icon icon-left" />
          </div>

          <div className="input-field">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Senha"
              required
              onChange={(e) => setPassword(e.target.value)}
            />
            <FaLock className="icon icon-left" />
            <div className="icon icon-right" onClick={togglePasswordVisibility}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </div>
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
