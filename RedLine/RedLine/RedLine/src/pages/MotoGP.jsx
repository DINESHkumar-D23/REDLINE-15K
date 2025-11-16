// src/pages/MotoGP.jsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "../components/Header";
import "../css/MotoGP.css";
import { motogpTracks } from "../data/motogpTracks.js";

export default function MotoGP() {
  const navigate = useNavigate();

  // Duplicate list for smooth infinite scroll
  const loopTracks = [...motogpTracks, ...motogpTracks];

  // Regulations state (persisted)
  const STORAGE_KEY = "rl_selected_reg_mgp";
  const [regulation, setRegulation] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || "2026";
    } catch {
      return "2026";
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, regulation);
    } catch {}
  }, [regulation]);

  // selected track state
  const [selectedTrackId, setSelectedTrackId] = useState(null);
  const selectedTrack = motogpTracks.find((t) => t.id === selectedTrackId) || null;

  // scroller refs & state
  const scrollerRef = useRef(null);
  const containerRef = useRef(null);
  const rafRef = useRef(null);
  const offsetRef = useRef(0);
  const loopWidthHalfRef = useRef(1);
  const isHoveringRef = useRef(false);
  const userInteractingRef = useRef(false);

  const AUTO_SPEED = 0.6;

  const recomputeWidths = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const totalWidth = scroller.scrollWidth;
    loopWidthHalfRef.current = totalWidth / 2;
    offsetRef.current = offsetRef.current % loopWidthHalfRef.current;
  }, []);

  const applyOffset = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    scroller.style.transform = `translateX(${-offsetRef.current}px)`;
  }, []);

  const loop = useCallback(() => {
    const loopHalf = loopWidthHalfRef.current;
    if (!loopHalf) {
      rafRef.current = requestAnimationFrame(loop);
      return;
    }

    if (!isHoveringRef.current && !userInteractingRef.current) {
      offsetRef.current += AUTO_SPEED;
    }

    if (offsetRef.current >= loopHalf) offsetRef.current -= loopHalf;
    if (offsetRef.current < 0) offsetRef.current += loopHalf;

    applyOffset();
    rafRef.current = requestAnimationFrame(loop);
  }, [applyOffset]);

  const onWheel = useCallback((e) => {
    if (!containerRef.current) return;
    e.preventDefault();
    const delta = e.deltaY || e.deltaX || 0;
    const SCROLL_FACTOR = 1.8;
    offsetRef.current += delta * SCROLL_FACTOR;

    userInteractingRef.current = true;
    clearTimeout(onWheel._timeout);
    onWheel._timeout = setTimeout(() => {
      userInteractingRef.current = false;
    }, 550);

    const loopHalf = loopWidthHalfRef.current || 1;
    if (offsetRef.current >= loopHalf) offsetRef.current -= loopHalf;
    if (offsetRef.current < 0) offsetRef.current += loopHalf;
    applyOffset();
  }, [applyOffset]);

  const onMouseEnter = () => { isHoveringRef.current = true; };
  const onMouseLeave = () => { isHoveringRef.current = false; };

  useEffect(() => {
    recomputeWidths();
    window.addEventListener("resize", recomputeWidths);
    rafRef.current = requestAnimationFrame(loop);

    const container = containerRef.current;
    if (container) container.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      window.removeEventListener("resize", recomputeWidths);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (container) container.removeEventListener("wheel", onWheel);
      clearTimeout(onWheel._timeout);
    };
  }, [loop, recomputeWidths, onWheel]);

  const onCardClick = (t) => {
    setSelectedTrackId(t.id);
  };

  const onBegin = () => {
    if (!selectedTrackId) return;
    const track = motogpTracks.find((t) => t.id === selectedTrackId);
    if (!track) return;
    navigate(`/simulate/${track.id}`, { state: { track, regulation } });
  };

  const hoverTransition = { type: "spring", stiffness: 300, damping: 18 };

  return (
    <>
      <Header />
      <main style={{ paddingTop: 92 }}>
        <section className="f1-page">
          <h2 className="f1-title">MotoGP — Circuits</h2>

          {/* Regulations */}
          <section className="regulations-section top">
            <div className="reg-banner" role="status" aria-live="polite">
              <strong>Notice:</strong> 2022 MotoGP regulations updated for <strong>2026</strong>.
            </div>

            <div className="reg-controls buttons-row" role="tablist" aria-label="Regulation options">
              <button
                role="tab"
                aria-pressed={regulation === "2022"}
                className={`reg-btn ${regulation === "2022" ? "active" : ""}`}
                onClick={() => setRegulation("2022")}
              >
                2022 Regulations
              </button>
              <button
                role="tab"
                aria-pressed={regulation === "2026"}
                className={`reg-btn ${regulation === "2026" ? "active" : ""}`}
                onClick={() => setRegulation("2026")}
              >
                2026 Regulations (Updated)
              </button>
            </div>

            <motion.article
              className="reg-card top"
              key={regulation}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              <h3 id="reg-title">{regulation === "2022" ? "2022 MotoGP Regulations" : "2026 MotoGP Regulations (updated)"}</h3>
              <p className="reg-summary">
                {regulation === "2022"
                  ? "The 2022 MotoGP regulations standardized electronic control units and refined aerodynamics for improved safety and performance consistency."
                  : "The 2026 regulations evolve further — focusing on hybrid-assist systems, lightweight materials, and revised aero fairing allowances for better overtaking opportunities."}
              </p>
              <details className="reg-details">
                <summary>Read more</summary>
                <p>
                  {regulation === "2022"
                    ? "Key changes included aerodynamic restrictions, engine allocation limits, and new fuel flow monitoring rules."
                    : "Updated engine specs, increased electric deployment zones, and sustainable fuel mandates are central."}
                </p>
              </details>
            </motion.article>
          </section>

          {/* Carousel */}
          <div
            className="carousel-wrap interactive"
            ref={containerRef}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            aria-label="MotoGP track carousel"
          >
            <div
              className="track-scroller"
              ref={scrollerRef}
              style={{ willChange: "transform" }}
            >
              {loopTracks.map((t, i) => {
                const isSelected = t.id === selectedTrackId;
                const { location = "-", laps = "-", length = "-", straights = "-", raceDistance = "-" } = t;
                return (
                  <motion.article
                    key={`${t.id}-${i}`}
                    className={`track-card ${isSelected ? "selected" : ""}`}
                    whileHover={{ scale: 1.04, y: -6 }}
                    transition={hoverTransition}
                    onClick={() => onCardClick(t)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(ev) => { if (ev.key === "Enter" || ev.key === " ") onCardClick(t); }}
                    aria-pressed={isSelected}
                  >
                    <div className="track-visual">
                      <img src={t.img} alt={t.name} />
                    </div>

                    <div className="track-meta">
                      <div className="meta-top">
                        <h3>{t.name}</h3>
                        <p className="subtitle">{location}</p>
                      </div>

                      <div className="track-stats" aria-hidden={false}>
                        <div className="stat">
                          <span className="stat-val">{laps}</span>
                          <span className="stat-label">Laps</span>
                        </div>
                        <div className="stat">
                          <span className="stat-val">{length}</span>
                          <span className="stat-label">Length</span>
                        </div>
                        <div className="stat">
                          <span className="stat-val">{straights}</span>
                          <span className="stat-label">Straights</span>
                        </div>
                        <div className="stat">
                          <span className="stat-val">{raceDistance}</span>
                          <span className="stat-label">Race dist.</span>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </div>

          <p className="hint">
            Hover the carousel to pause autoplay. Use the mouse wheel while hovering to scroll the cards in that direction. Click a card to select it.
          </p>

          {/* CTA */}
          <div className="simulation-cta">
            <div className="selection-summary" aria-live="polite">
              <div><strong>Selected Regulation:</strong> {regulation === "2022" ? "2022" : "2026 (updated)"}</div>
              <div><strong>Selected Circuit:</strong> {selectedTrack ? selectedTrack.name : "None"}</div>
            </div>

            <button
              className="begin-btn"
              onClick={onBegin}
              disabled={!selectedTrack}
              aria-disabled={!selectedTrack}
            >
              Begin the simulation
            </button>
          </div>
        </section>
      </main>
    </>
  );
}
