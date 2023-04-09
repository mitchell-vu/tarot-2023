import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import { StoreProvider } from "@/context/store";

import "@/fonts/IBM_Plex_Sans/IBMPlexSans-Light.ttf";
import "@/fonts/Inter/Inter-Light.ttf";
import "@/fonts/Inter/Inter-SemiBold.ttf";
import "@/fonts/Mulish/Mulish-Bold.ttf";
import "@/fonts/Mulish/Mulish-Regular.ttf";
import "@/fonts/Mulish/Mulish-Light.ttf";
import "@/fonts/Mirra/mirra.otf";

import "@/styles/global.scss";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  // <React.StrictMode>
  <StoreProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StoreProvider>,
  // </React.StrictMode>,
);
