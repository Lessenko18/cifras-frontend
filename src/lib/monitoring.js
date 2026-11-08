// Monitoramento de erros (Sentry) do front. Só liga se VITE_SENTRY_DSN existir;
// sem ele tudo aqui é no-op (dev, testes e quem ainda não configurou).
//
// O SDK é carregado sob demanda (import dinâmico): não pesa no bundle inicial
// nem atrasa a primeira renderização. Erros que acontecem antes do SDK carregar
// ficam numa fila curta e são enviados assim que ele estiver pronto.
const DSN = import.meta.env.VITE_SENTRY_DSN?.trim();
const MAX_PENDING = 20;

let sentry = null;
const pending = [];

function send(S, error, context) {
  S.withScope((scope) => {
    if (context) scope.setExtras(context);
    S.captureException(error);
  });
}

export function initMonitoring() {
  if (!DSN) return;

  import("@sentry/react")
    .then((S) => {
      S.init({
        dsn: DSN,
        environment: import.meta.env.MODE,
        sendDefaultPii: false,
        tracesSampleRate: 0, // só erros
        // Ruído que não é bug do app
        ignoreErrors: [
          "ResizeObserver loop limit exceeded",
          "ResizeObserver loop completed with undelivered notifications",
          "Network Error",
          "Load failed",
          "Failed to fetch",
        ],
        beforeSend(event) {
          // Nunca manda cookies nem a query string (pode ter filtros/ids)
          if (event.request) {
            delete event.request.cookies;
            delete event.request.query_string;
          }
          return event;
        },
      });
      sentry = S;
      pending.splice(0).forEach(({ error, context }) => send(S, error, context));
    })
    .catch(() => {
      // sem rede ou SDK bloqueado: o app segue normal, só não reporta
    });
}

export function reportError(error, context) {
  if (!DSN) return;
  if (sentry) return send(sentry, error, context);
  if (pending.length < MAX_PENDING) pending.push({ error, context });
}
