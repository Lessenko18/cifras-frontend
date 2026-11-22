import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/700.css";
import { GlobalStyled } from "./GlobalStyled.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { Toaster } from "react-hot-toast";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient.js";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary.jsx";
import { initMonitoring } from "./lib/monitoring.js";
import { router } from "./routes/router.jsx";
import PwaPrompts from "./components/PwaPrompts/PwaPrompts.jsx";

initMonitoring();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <GlobalStyled />
        <ErrorBoundary>
          <RouterProvider router={router} />
        </ErrorBoundary>
        <Toaster />
        <PwaPrompts />
        <SpeedInsights />
      </AuthProvider>
    </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
