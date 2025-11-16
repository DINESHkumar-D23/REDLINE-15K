// src/pages/Drones.jsx
import React, { Suspense, useState } from "react";
import Header from "../components/Header";
import ErrorBoundary from "../components/ErrorBoundary";
import "../css/Drones.css";

const Hyperspeed = React.lazy(() => import("../components/Hyperspeed"));
const presetOptions = {
  colors: {
    roadColor: 0x080808,
    islandColor: 0x0a0a0a,
    background: 0x000000,

    // road markings matching the red theme
    shoulderLines: 0xff002b,
    brokenLines: 0xff4b2b,

    // your requested gradient: orange → red → orange
    leftCars: [0xff4b2b, 0xff002b, 0xff4b2b],
    rightCars: [0xff4b2b, 0xff002b, 0xff4b2b],

    // side light sticks using the sharp red
    sticks: 0xff002b
  }
};

export default function Drones() {
  // if you want to pause animation programmatically, keep this state;
  // but by default we mount it so it runs as background.
  const [isHyperActive] = useState(true);

  return (
    <>
      <Header />
      <main style={{ paddingTop: 92 }}>
        {/* HERO — FULLPAGE ANIMATION BACKGROUND (first section below nav) */}
        <section className="drones-hero" aria-label="Drone background animation">
          {/* absolutely positioned canvas background */}
            <p className="para">Drone Racing</p>
            <p className="pa">Experience the thrill of high-speed drone racing through dynamic landscapes.</p>
          <div className="hyperspeed-bg" aria-hidden={!isHyperActive}>
            <Suspense fallback={<div className="hyperspeed-fallback">Loading animation…</div>}>
              <ErrorBoundary>
                {isHyperActive ? <Hyperspeed effectOptions={presetOptions} /> : null}
              </ErrorBoundary>
            </Suspense>
            <div className="hyperspeed-overlay" />
          </div>
      

          {/* If you later want to add centered content on top of the animation,
              enable this container. For now it's empty per your request. */}
          <div className="drones-hero-content" aria-hidden="true"></div>
        </section>

        {/* following page content (keeps your page structure) */}
        <section className="page-content">
          {/* keep content placeholders here — empty now */}
        </section>
      </main>
    </>
  );
}
