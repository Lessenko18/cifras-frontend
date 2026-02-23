import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { Background, LoginContainer } from "./LoginStyled";
import { useState } from "react";
import { loginRequest } from "../../service/auth.service";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Por favor, insira um email válido.");
      return;
    }

    try {
      const user = await loginRequest(email, password, remember);

      if (!user) {
        toast.error("Erro ao realizar login.");
        return;
      }

      toast.success("Login realizado com sucesso!");
      navigate("/home");
    } catch (error) {
      toast.error(error || "Erro ao realizar login.");
    }
  };

  return (
    <Background>
      <LoginContainer>
        <form onSubmit={handleSubmit}>
          <div className="title-container">
            <img
              src="/logotlcifras.png"
              alt="TL Cifras Logo"
              className="logo"
            />
            <h1>TL Cifras</h1>
          </div>

          <div className="input-field">
            <input
              type="email"
              id="email"
              name="email"
              placeholder="E-mail"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <FaUser className="icon icon-left" />
          </div>

          <div className="input-field">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              placeholder="Senha"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <FaLock className="icon icon-left" />
            <div className="icon icon-right" onClick={togglePasswordVisibility}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </div>
          </div>

          <div className="recall-forget">
            <label htmlFor="remember-me">
              <input
                type="checkbox"
                id="remember-me"
                name="remember"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />{" "}
              Lembrar-me
            </label>
            <Link to="/forgot-password">Esqueci minha senha</Link>
          </div>

          <button type="submit">Entrar</button>

          <div className="signup-link">
            <p>Não tem uma conta?</p>
            <Link to="/signup">Cadastre-se</Link>
          </div>
        </form>
      </LoginContainer>
    </Background>
  );
}
