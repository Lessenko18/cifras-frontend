import { FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { Background, ResetContainer } from "./ResetPasswordStyled";
import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { resetPasswordService } from "../../service/auth.service";
import toast from "react-hot-toast";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!token) {
      toast.error("Link de redefinição inválido.");
      return;
    }

    if (!newPassword || !confirmPassword) {
      toast.error("Preencha todos os campos.");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await resetPasswordService(token, newPassword);
      toast.success(result?.message || "Senha redefinida com sucesso!");
      navigate("/login");
    } catch (error) {
      toast.error(error || "Não foi possível redefinir a senha.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Background>
      <ResetContainer>
        <form onSubmit={handleSubmit}>
          <h1>Redefinir Senha</h1>
          <p>Digite sua nova senha para concluir a recuperação de acesso.</p>

          <div className="input-field">
            <input
              type={showNewPassword ? "text" : "password"}
              placeholder="Nova senha"
              autoComplete="new-password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <FaLock className="icon icon-left" />
            <div
              className="icon icon-right"
              onClick={() => setShowNewPassword((current) => !current)}
            >
              {showNewPassword ? <FaEyeSlash /> : <FaEye />}
            </div>
          </div>

          <div className="input-field">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirmar nova senha"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <FaLock className="icon icon-left" />
            <div
              className="icon icon-right"
              onClick={() => setShowConfirmPassword((current) => !current)}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </div>
          </div>

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Redefinindo..." : "Salvar nova senha"}
          </button>

          <div className="back-link">
            <Link to="/login">Voltar ao Login</Link>
          </div>
        </form>
      </ResetContainer>
    </Background>
  );
}
