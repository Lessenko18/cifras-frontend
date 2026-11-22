import { useEffect, useState } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { storage } from "../../lib/storage";

// Dois avisos do app instalável (PWA):
//  1. "Nova versão disponível": a atualização espera a pessoa tocar em Atualizar, em vez de
//     recarregar sozinha no meio de uma música.
//  2. "Instalar o app": convite para adicionar à tela inicial (Chrome/Edge/Android pelo
//     evento do navegador; iPhone/iPad, onde não há evento, com a instrução manual).
// Chave do storage: pwa_install_dispensado (data em que a pessoa dispensou o convite).

const DISMISS_DAYS = 14;
const CHECK_UPDATE_EVERY_MS = 60 * 60 * 1000;

const isStandalone = () =>
  window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone === true;

const isIos = () =>
  /iphone|ipad|ipod/i.test(window.navigator.userAgent) ||
  // iPadOS 13+ se apresenta como Mac, mas tem tela de toque
  (window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1);

function dismissedRecently() {
  const at = Number(storage.get("pwa_install_dispensado"));
  return Number.isFinite(at) && at > 0 && Date.now() - at < DISMISS_DAYS * 24 * 60 * 60 * 1000;
}

const barStyle = {
  position: "fixed",
  left: 12,
  right: 12,
  bottom: 12,
  zIndex: 1000,
  display: "flex",
  alignItems: "center",
  gap: 12,
  flexWrap: "wrap",
  maxWidth: 520,
  margin: "0 auto",
  padding: "12px 14px",
  borderRadius: 12,
  background: "var(--bg-card, #1a1a2e)",
  color: "var(--text-primary, #fff)",
  border: "1px solid var(--border-color, rgba(255,255,255,0.15))",
  boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
  fontSize: 14,
};
const primaryButton = {
  padding: "8px 14px",
  borderRadius: 8,
  border: "none",
  cursor: "pointer",
  fontWeight: 700,
  background: "var(--main, #4f46e5)",
  color: "#fff",
};
const ghostButton = { ...primaryButton, background: "transparent", color: "inherit", fontWeight: 400 };

export default function PwaPrompts() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    // Procura versão nova de hora em hora (quem deixa o app aberto no palco também recebe o aviso)
    onRegisteredSW(_url, registration) {
      if (registration) setInterval(() => registration.update().catch(() => {}), CHECK_UPDATE_EVERY_MS);
    },
  });

  const [installEvent, setInstallEvent] = useState(null);
  const [showIosHint, setShowIosHint] = useState(false);
  const [hiddenUpdate, setHiddenUpdate] = useState(false);

  useEffect(() => {
    if (isStandalone() || dismissedRecently()) return undefined;

    const onBeforeInstall = (event) => {
      event.preventDefault(); // guarda o convite do navegador para mostrar no nosso banner
      setInstallEvent(event);
    };
    const onInstalled = () => {
      setInstallEvent(null);
      setShowIosHint(false);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);

    // iOS não dispara o evento: mostra a dica depois de um tempo de uso
    const timer = isIos() ? setTimeout(() => setShowIosHint(true), 20000) : null;

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
      clearTimeout(timer);
    };
  }, []);

  const dismissInstall = () => {
    storage.set("pwa_install_dispensado", Date.now());
    setInstallEvent(null);
    setShowIosHint(false);
  };

  const install = async () => {
    if (!installEvent) return;
    installEvent.prompt();
    const { outcome } = await installEvent.userChoice;
    setInstallEvent(null);
    if (outcome === "dismissed") storage.set("pwa_install_dispensado", Date.now());
  };

  // Atualização tem prioridade sobre o convite de instalar
  if (needRefresh && !hiddenUpdate) {
    return (
      <div role="status" style={barStyle}>
        <span style={{ flex: 1, minWidth: 180 }}>Nova versão do TL Cifras disponível.</span>
        <button type="button" style={primaryButton} onClick={() => updateServiceWorker(true)}>
          Atualizar
        </button>
        <button type="button" style={ghostButton} onClick={() => setHiddenUpdate(true)}>
          Depois
        </button>
      </div>
    );
  }

  if (installEvent) {
    return (
      <div role="dialog" aria-label="Instalar o app" style={barStyle}>
        <span style={{ flex: 1, minWidth: 180 }}>Instale o TL Cifras: abre direto da tela inicial e funciona sem sinal.</span>
        <button type="button" style={primaryButton} onClick={install}>
          Instalar
        </button>
        <button type="button" style={ghostButton} onClick={dismissInstall}>
          Agora não
        </button>
      </div>
    );
  }

  if (showIosHint) {
    return (
      <div role="dialog" aria-label="Instalar o app" style={barStyle}>
        <span style={{ flex: 1, minWidth: 180 }}>
          Para instalar: toque em <strong>Compartilhar</strong> (⬆︎) e depois em <strong>Adicionar à Tela de Início</strong>.
        </span>
        <button type="button" style={ghostButton} onClick={dismissInstall}>
          Entendi
        </button>
      </div>
    );
  }

  return null;
}
