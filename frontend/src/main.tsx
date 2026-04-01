import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { JobsContextProvider } from "./store/jobs_context";
import "./styles/index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <JobsContextProvider>
        <App />
      </JobsContextProvider>
    </BrowserRouter>
  </React.StrictMode>
);
