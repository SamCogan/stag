import { NuqsAdapter } from "nuqs/adapters/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";
import { initializeTheme } from "./theme";

import "./index.css";

initializeTheme();

const rootElement = document.querySelector<HTMLDivElement>("#root");
if (rootElement === null) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(
  <StrictMode>
    <NuqsAdapter>
      <App />
    </NuqsAdapter>
  </StrictMode>,
);

if (import.meta.env.PROD && "serviceWorker" in globalThis.navigator) {
  globalThis.addEventListener("load", () => {
    void globalThis.navigator.serviceWorker.register(
      `${import.meta.env.BASE_URL}sw.js`,
    );
  });
}
