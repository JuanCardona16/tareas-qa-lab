import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import "./index.css";

async function enableMocking() {
  if (import.meta.env.DEV) {
    const { worker } = await import("./mocks/browser");
    return worker.start({
      onUnhandledRequest: "bypass",
    });
  }
  return Promise.resolve();
}

enableMocking().then(() => {
  const root = document.getElementById("root");
  if (!root) throw new Error("Root element not found");
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
});
