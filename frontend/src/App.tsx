import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Layout/Navbar";
import { Home } from "./pages/Home";
import "./index.css";

function App() {
  return (
    <BrowserRouter>
      <div>
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
