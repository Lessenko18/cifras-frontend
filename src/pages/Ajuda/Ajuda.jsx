import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { AjudaContainer, Bloco, FaqList, FeedbackForm } from "./AjudaStyled";
import { FAQ_ITEMS } from "./faqData";
import { FEEDBACK_TIPOS, sendFeedbackService } from "../../service/feedbackService";

const MAX_MENSAGEM = 2000;
const EMPTY_FORM = { tipo: "cifra_errada", mensagem: "", referencia: "", contato: "", website: "" };

export default function Ajuda() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [sending, setSending] = useState(false);
  // Anti-bot: o servidor ignora envios rápidos demais (mede desde que o form abriu)
  const openedAt = useRef(Date.now());

  const setField = (name) => (e) => setForm((s) => ({ ...s, [name]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.mensagem.trim().length < 5) {
      toast.error("Descreva o problema ou a melhoria.");
      return;
    }

    setSending(true);
    try {
      const res = await sendFeedbackService({
        ...form,
        tempoMs: Date.now() - openedAt.current,
      });
      toast.success(res?.message || "Relato enviado!");
      setForm(EMPTY_FORM);
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Erro ao enviar.");
    } finally {
      setSending(false);
    }
  }

  return (
    <AjudaContainer>
      <header>
        <h1>Ajuda</h1>
        <p className="sub">Como usar o TLCifras e como falar com a gente.</p>
      </header>

      <Bloco>
        <h2>Como usar o app</h2>
        <FaqList>
          {FAQ_ITEMS.map((item) => (
            <details key={item.pergunta}>
              <summary>{item.pergunta}</summary>
              <ol>
                {item.passos.map((passo) => (
                  <li key={passo}>{passo}</li>
                ))}
              </ol>
              {item.nota && <p className="nota">{item.nota}</p>}
            </details>
          ))}
        </FaqList>
      </Bloco>

      <Bloco id="feedback">
        <h2>Algo errado? Tem uma sugestão?</h2>
        <p className="sub" style={{ marginTop: 0 }}>
          Achou uma cifra errada, um problema no app ou tem uma ideia de melhoria? Conte
          pra gente — só o administrador recebe o seu relato.
        </p>

        <FeedbackForm onSubmit={handleSubmit}>
          <label>
            Tipo
            <select value={form.tipo} onChange={setField("tipo")}>
              {FEEDBACK_TIPOS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>
              Qual música ou página? <span className="opcional">(opcional)</span>
            </span>
            <input
              type="text"
              maxLength={300}
              placeholder="Ex.: Santo (Ministério Zoe) ou link da cifra"
              value={form.referencia}
              onChange={setField("referencia")}
            />
          </label>

          <label>
            O que está errado ou qual a melhoria? *
            <textarea
              required
              maxLength={MAX_MENSAGEM}
              placeholder="Descreva com o máximo de detalhes: onde está o erro e como deveria ser."
              value={form.mensagem}
              onChange={setField("mensagem")}
            />
            <span className="contador">
              {form.mensagem.length}/{MAX_MENSAGEM}
            </span>
          </label>

          <label>
            <span>
              Seu e-mail ou WhatsApp pra resposta <span className="opcional">(opcional)</span>
            </span>
            <input
              type="text"
              maxLength={200}
              value={form.contato}
              onChange={setField("contato")}
            />
          </label>

          {/* Honeypot: invisível pra pessoas; bots que preenchem tudo caem aqui */}
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="hp-field"
            value={form.website}
            onChange={setField("website")}
          />

          <button type="submit" className="btn" disabled={sending}>
            {sending ? "Enviando..." : "Enviar relato"}
          </button>
        </FeedbackForm>
      </Bloco>
    </AjudaContainer>
  );
}
