// src/main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import "./index.css";
import App from "./App.jsx";
import VerifyProduct from "./VerifyProduct.jsx";
import ScanQR from "./ScanQR.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/scan" element={<ScanQR />} />
        <Route
          path="/verify/:productId"
          element={<VerifyProduct />}
        />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);