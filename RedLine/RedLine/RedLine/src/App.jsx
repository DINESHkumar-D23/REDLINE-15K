// src/App.jsx
import React from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Home from "./pages/home.jsx";        // your Home page component
import "./App.css";
import cars from "./assets/front-ani.png"; // moving strip image

import Formula1 from "./pages/Formula1";
import MotoGP from "./pages/MotoGP";
import Drones from "./pages/Drones";
import Create from "./pages/Create";
import Simulation from "./pages/Simulation";
import Tracks from "./pages/Tracks";
import logo from "./assets/logored2.png";

function Landing() {
  const navigate = useNavigate();

  const scroll = {
    x: ["-100%", "0%"],
    transition: {
      x: { repeat: Infinity, repeatType: "loop", duration: 12, ease: "linear" },
    },
  };

  return (
    <div className="app landing-container">
      <div className="bg-wrap" aria-hidden>
        <motion.div
          className="bg-strip"
          style={{ backgroundImage: `url(${cars})` }}
          animate={scroll}
        />
        <motion.div
          className="bg-strip"
          style={{ backgroundImage: `url(${cars})` }}
          animate={scroll}
        />
      </div>

      {/* background logo placed between strips and content */}
      <div className="landing-logo-bg" aria-hidden>
        {/* using a public asset path avoids bundler import errors for large images */}
         
      </div>

      <motion.div
        className="content landing-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <img src={logo} alt="RedLine background logo" />
        <h1>Welcome to RedLine</h1>
        <p>Experience speed, precision, and creativity all in one place.</p>

        <motion.button
          className="cta"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/home")}
        >
          Get Started
        </motion.button>
      </motion.div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/home" element={<Home />} />
      <Route path="/formula1" element={<Formula1 />} />
      <Route path="/motogp" element={<MotoGP />} />
      <Route path="/drones" element={<Drones />} />
      <Route path="/create" element={<Create />} />
      <Route path="/tracks" element={<Tracks />} />
      <Route path="/simulate/:trackId" element={<Simulation />} />
    </Routes>
  );
}
