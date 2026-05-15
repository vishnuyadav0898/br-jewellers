import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AppProviders } from "./shared/providers/AppProviders";
import favicon from "./assets/logo/br-favicon.svg";
import "./index.css";

const faviconLink = document.querySelector("link[rel='icon']") || document.createElement("link");
faviconLink.setAttribute("rel", "icon");
faviconLink.setAttribute("href", favicon);
document.head.appendChild(faviconLink);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppProviders>
        <App />
    </AppProviders>
  </React.StrictMode>
);
