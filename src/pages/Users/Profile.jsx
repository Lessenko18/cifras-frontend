import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ProfileContainer,
  BackRow,
  Card,
  Avatar,
  Field,
  Actions,
} from "./ProfileStyled";
import { getMeRequest, logout } from "../../service/auth.service";
import { editUserService } from "../../service/userService";
import {
  MAX_AVATAR_SIZE_MB,
  getImageSizeError,
  uploadToS3ViaBackend,
} from "../../service/s3Service";
import { normalizeAvatarUrl } from "../../utils/normalizeAvatarUrl";
import toast from "react-hot-toast";

export default function Profile() {
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem("user")) || {};
  const normalizedStoredUser = {
    ...storedUser,
    avatar: normalizeAvatarUrl(storedUser.avatar),
    photo: normalizeAvatarUrl(storedUser.photo),
  };

  const [user, setUser] = useState(normalizedStoredUser);
  const [editing, setEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [preview, setPreview] = useState(user.avatar || user.photo || null);

  const [form, setForm] = useState({
    name: user.name || user.nome || "",
    email: user.email || "",
    password: "",
    avatarFile: null,
  });

  const userName = user?.name || user?.nome;
  const initials = userName
    ? userName
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : (user?.email?.charAt(0) || "U").toUpperCase();
  const avatarSrc = preview || user.avatar || user.photo || null;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "avatar") {
      const file = files && files[0] ? files[0] : null;

      const imageSizeError = getImageSizeError(file);
      if (imageSizeError) {
        toast.error(imageSizeError);
        e.target.value = "";
        setForm((s) => ({ ...s, avatarFile: null }));
        setPreview(user.avatar || user.photo || null);
        return;
      }
      setForm((s) => ({ ...s, avatarFile: file }));

      if (file) {
        const reader = new FileReader();
        reader.onload = () => setPreview(reader.result);
        reader.readAsDataURL(file);
      } else {
        setPreview(user.avatar || user.photo || null);
      }
    } else {
      setForm((s) => ({ ...s, [name]: value }));
    }
  };

  const validate = () => {
    if (!form.name?.trim()) {
      toast.error("Nome é obrigatório");
      return false;
    }
    if (!form.email?.trim()) {
      toast.error("Email é obrigatório");
      return false;
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(form.email)) {
      toast.error("Email inválido");
      return false;
    }
    return true;
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSaving(true);

    try {
      const authenticatedUser = await getMeRequest();
      const id = authenticatedUser?._id || authenticatedUser?.id;

      if (!id) {
        toast.error("ID do usuário não encontrado");
        setIsSaving(false);
        return;
      }

      let avatarUrl = user.avatar || user.photo || null;

      // Se tiver arquivo de avatar, faz upload pro S3 primeiro
      if (form.avatarFile) {
        try {
          toast.loading("📤 Enviando foto para o servidor...");
          avatarUrl = await uploadToS3ViaBackend(form.avatarFile);
          toast.dismiss(); // Remove o loading toast
        } catch (uploadErr) {
          toast.dismiss();
          toast.error("❌ " + uploadErr.message);
          console.error("Erro no upload:", uploadErr);

          // Pergunta se quer continuar sem a foto
          const continuar = window.confirm(
            "Erro ao fazer upload da foto. Deseja salvar as alterações sem atualizar a foto?",
          );

          if (!continuar) {
            setIsSaving(false);
            return;
          }
          // Se confirmou, continua sem atualizar o avatar
        }
      }

      // Agora salva os dados do usuário
      const payload = {
        name: form.name,
        email: form.email,
      };

      if (form.password) {
        payload.password = form.password;
      }

      if (avatarUrl) {
        payload.avatar = normalizeAvatarUrl(avatarUrl); // URL do S3
      }

      toast.loading("💾 Salvando perfil...");
      const response = await editUserService(id, payload);
      toast.dismiss(); // Remove o loading toast

      let updatedFromServer = response?.data || null;

      // Trata diferentes formatos de resposta do backend
      if (updatedFromServer?.user) {
        updatedFromServer = updatedFromServer.user;
      } else if (updatedFromServer?.data) {
        updatedFromServer = updatedFromServer.data;
      }

      let finalUser = {
        ...user,
        name: updatedFromServer?.name || updatedFromServer?.nome || form.name,
        email: updatedFromServer?.email || form.email,
        avatar: normalizeAvatarUrl(
          avatarUrl || updatedFromServer?.avatar || user.avatar,
        ),
      };

      localStorage.setItem("user", JSON.stringify(finalUser));
      window.dispatchEvent(new Event("userUpdated"));
      setUser(finalUser);

      toast.success("Perfil atualizado com sucesso!");
      setEditing(false);
      setForm((s) => ({ ...s, password: "", avatarFile: null }));
      setPreview(null);
    } catch (err) {
      console.error("Erro completo:", err);
      console.error("Status:", err?.response?.status);
      console.error("Dados do erro:", err?.response?.data);

      const errorMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Erro ao atualizar perfil";

      toast.error("❌ " + errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ProfileContainer>
      <BackRow>
        <button type="button" onClick={() => navigate(-1)}>
          <img src="/back.svg" alt="Voltar" className="img-hover" />
        </button>
      </BackRow>

      <Card onSubmit={handleSave}>
        <Avatar>
          {avatarSrc ? (
            <img src={avatarSrc} alt={user.name || user.nome || "Usuário"} />
          ) : (
            <div className="initials">{initials}</div>
          )}
          <div className="meta">
            <strong>{user?.name || user?.nome}</strong>
            <span>{user?.email}</span>
          </div>
        </Avatar>

        {!editing ? (
          <div className="info">
            <Field>
              <label>Nome</label>
              <div>{user?.name || user?.nome || "Não definido"}</div>
            </Field>

            <Field>
              <label>Email</label>
              <div>{user?.email || "Não definido"}</div>
            </Field>

            <Field>
              <label>Senha</label>
              <div>••••••••</div>
            </Field>

            <Actions>
              <button
                type="button"
                className="btn"
                onClick={() => setEditing(true)}
              >
                Editar Perfil
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={handleLogout}
              >
                Sair
              </button>
            </Actions>
          </div>
        ) : (
          <div className="form">
            <div>
              <label>Nome *</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Digite seu nome"
                disabled={isSaving}
              />
            </div>

            <div>
              <label>Email *</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Digite seu email"
                disabled={isSaving}
              />
            </div>

            <div>
              <label>Senha (deixe em branco para manter)</label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Nova senha (opcional)"
                disabled={isSaving}
              />
            </div>

            <div>
              <label>
                Avatar (Foto de Perfil) - Máx. {MAX_AVATAR_SIZE_MB} MB
              </label>
              <input
                name="avatar"
                type="file"
                accept="image/*"
                onChange={handleChange}
                disabled={isSaving}
              />
            </div>

            <Actions>
              <button type="submit" className="btn-success" disabled={isSaving}>
                {isSaving ? "Salvando..." : "Salvar"}
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => setEditing(false)}
                disabled={isSaving}
              >
                Cancelar
              </button>
            </Actions>
          </div>
        )}
      </Card>
    </ProfileContainer>
  );
}
// Fazer um refrash na pagina ao salvar a foto
