import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { VerifyEmailPage } from "./modules/auth/VerifyEmailPage";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

const path = window.location.pathname;

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    {path === "/verify-email" ? <VerifyEmailPage /> : <App />}
  </React.StrictMode>
);
