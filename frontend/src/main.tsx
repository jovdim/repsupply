import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import NestedGrid from "./components/background-grid/NestedGrid.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <NestedGrid
      mainGridSize={50}
      mainGridColor="rgba(255, 255, 255, 0.02)"
      subGridSize={10}
      subGridColor="rgba(255, 255, 255, 0.01)"
    />
    <App />
  </StrictMode>
);
