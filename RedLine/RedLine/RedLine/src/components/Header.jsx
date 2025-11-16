import React from "react";
import { NavLink } from "react-router-dom";
import "../css/Header.css";

export default function Header() {
  const links = [
    { to: "/home", label: "Home" },
    { to: "/formula1", label: "Formula1" },
    { to: "/motogp", label: "MotoGP" },
    { to: "/drones", label: "Drone Racing" },
    { to: "/tracks", label: "All Tracks" },
    { to: "/create", label: "Create Event" },
  ];

  return (
    <header className="rl-header">
      <div className="rl-header-left">
        <div className="rl-logo">
          <span className="rl-logo-text">RedLine</span>
          <div className="rl-logo-streak" />
        </div>
      </div>

      <nav className="rl-nav" aria-label="Main navigation">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) =>
              isActive ? "rl-nav-link active" : "rl-nav-link"
            }
          >
            {l.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
