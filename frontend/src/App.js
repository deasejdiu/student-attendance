import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import QRScanner from "./components/QRScanner";
import Home from "./components/Home";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/scan" element={<QRScanner />} />
      </Routes>
    </Router>
  );
}

export default App;

