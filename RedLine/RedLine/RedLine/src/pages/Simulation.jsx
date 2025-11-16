// src/pages/Simulation.jsx
import React, { useEffect, useMemo, useState, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header.jsx";
import Leaderboard from "../components/Leaderboard.jsx";
import { tracks as f1Tracks } from "../data/tracks.js";
import { motogpTracks } from "../data/motogpTracks.js";
import { trackPointMaps } from "../data/trackPointMaps.js";
import { normalizeTrack, getPositionOnTrack } from "../utils/trackUtils.js";
import CanvasPlaceholder from "../components/CanvasPlaceholder.jsx";
import "../css/Simulation.css";
import "../components/Leaderboard.css";
import { motion } from "framer-motion";

const STORAGE_KEY = "rl_selected_reg";

const SAMPLE_F1_LEADERBOARD = [
  { pos: 1, name: "L. Hamilton", team: "Mercedes", time: "1:28.062" },
  { pos: 2, name: "M. Verstappen", team: "Red Bull Racing", time: "1:28.325" },
  { pos: 3, name: "C. Leclerc", team: "Ferrari", time: "1:28.735" },
  { pos: 4, name: "S. Pérez", team: "Red Bull Racing", time: "1:29.091" },
  { pos: 5, name: "G. Russell", team: "Mercedes", time: "1:29.450" },
];

const SAMPLE_MGP_LEADERBOARD = [
  { pos: 1, name: "F. Bagnaia", team: "Ducati Lenovo", time: "1:34.082" },
  { pos: 2, name: "M. Márquez", team: "Repsol Honda", time: "1:34.325" },
  { pos: 3, name: "F. Quartararo", team: "Monster Yamaha", time: "1:34.735" },
  { pos: 4, name: "J. Martín", team: "Pramac Racing", time: "1:34.991" },
  { pos: 5, name: "A. Espargaró", team: "Aprilia Racing", time: "1:35.230" },
];

export default function Simulation() {
  const { trackId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const initialTrack =
    location.state?.track ||
    f1Tracks.find((t) => t.id === trackId) ||
    motogpTracks.find((t) => t.id === trackId) ||
    f1Tracks[0];

  const isMotoGP = useMemo(
    () => motogpTracks.some((t) => t.id === initialTrack?.id),
    [initialTrack]
  );

  const [regulation, setRegulation] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || "2026";
    } catch {
      return "2026";
    }
  });

  // simulation parameters
  const [sessionType, setSessionType] = useState("Qualifying"); // Practice / Qualifying / Race
  const [timeOfDay, setTimeOfDay] = useState("Midday"); // Morning / Midday / Evening / Night
  const [weather, setWeather] = useState("Clear"); // Clear / Overcast / Rain
  const [ambientTemp, setAmbientTemp] = useState(22); // °C
  const [trackTemp, setTrackTemp] = useState(28); // °C
  const [windSpeed, setWindSpeed] = useState(8); // km/h
  const [gripLevel, setGripLevel] = useState(85); // 0 - 100
  const [tyrePressure, setTyrePressure] = useState(22); // psi
  const [pitStrategy, setPitStrategy] = useState("One-stop"); // None / One-stop / Two-stop
  const [trafficDensity, setTrafficDensity] = useState("Medium"); // Low/Medium/High
  const [aiDifficulty, setAiDifficulty] = useState("Normal"); // Easy/Normal/Hard
  const [safetyCarProb, setSafetyCarProb] = useState(8); // percent

  const [tyreCompound, setTyreCompound] = useState("soft");
  const [fuelKg, setFuelKg] = useState(50);
  const [runMinutes, setRunMinutes] = useState(10); // 0 for indefinite
  const [isRunning, setIsRunning] = useState(false);

  // timer: null => indefinite
  const [remainingSeconds, setRemainingSeconds] = useState(
    runMinutes > 0 ? runMinutes * 60 : null
  );

  // Track simulation state
  const [carProgress, setCarProgress] = useState(0); // 0..1
  const [carPosition, setCarPosition] = useState({ x: 0, y: 0 });
  const animationFrameRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, regulation);
    } catch {}
  }, [regulation]);

  // leaderboard
  const [leaderboard, setLeaderboard] = useState(
    isMotoGP ? SAMPLE_MGP_LEADERBOARD : SAMPLE_F1_LEADERBOARD
  );
  useEffect(() => {
    setLeaderboard(isMotoGP ? SAMPLE_MGP_LEADERBOARD : SAMPLE_F1_LEADERBOARD);
  }, [isMotoGP, initialTrack?.id]);

  // details for each driver
  const driverDetails = useMemo(() => {
    const map = {};
    (leaderboard || []).forEach((r, i) => {
      map[r.name] = {
        tyre:
          tyreCompound === "soft"
            ? "Soft"
            : tyreCompound === "medium"
            ? "Medium"
            : "Hard",
        fuelKg: Math.max(5, Math.round(fuelKg - i * 2.5)),
        tyrePressure: `${(tyrePressure + (i % 2 === 0 ? 0.3 : -0.2)).toFixed(1)} psi`,
        lastLap: `${1 + Math.floor(Math.random() * 2)}:${(5 + Math.floor(Math.random() * 55))
          .toString()
          .padStart(2, "0")}`,
        gap: `${(i * 1.2).toFixed(3)}s`,
        grip: `${Math.round(gripLevel - i * 1)}%`,
      };
    });
    return map;
  }, [leaderboard, tyreCompound, fuelKg, tyrePressure, gripLevel]);

  const estimatedLaps = useMemo(() => Math.max(1, Math.round(runMinutes * 0.33)), [runMinutes]);

  // ---------------------------
  // RAW track points (support generator functions exported in trackPointMaps)
  // ---------------------------
  const rawTrackPoints = useMemo(() => {
    if (!initialTrack || !initialTrack.id) return [];
    const entry = trackPointMaps[initialTrack.id];

    // If entry is a function (generator), call it with default sample count
    if (typeof entry === "function") {
      try {
        return entry(400) || [];
      } catch {
        return [];
      }
    }

    // If entry is an array already, use it
    if (Array.isArray(entry)) return entry;

    // fallback: if trackPointMaps.defaultPoints exists, try that
    if (trackPointMaps && typeof trackPointMaps.defaultPoints === "function") {
      try {
        const defaults = trackPointMaps.defaultPoints(400);
        if (defaults && Array.isArray(defaults[initialTrack.id])) return defaults[initialTrack.id];
      } catch {
        // ignore
      }
    }

    return [];
  }, [initialTrack]);

  // normalizedTrack - scaled into 800x600 with padding (kept for other uses)
  const normalizedTrack = useMemo(() => {
    if (!rawTrackPoints || rawTrackPoints.length === 0) return [];
    try {
      return normalizeTrack(rawTrackPoints, 800, 600, 40) || [];
    } catch {
      return [];
    }
  }, [rawTrackPoints]);

  const trackPolyline = useMemo(() => {
    if (!normalizedTrack || normalizedTrack.length === 0) return "";
    return normalizedTrack.map((p) => `${p.x},${p.y}`).join(" ");
  }, [normalizedTrack]);

  // Speed modifiers: difficulty -> factor
  const difficultyFactor = useMemo(() => {
    if (aiDifficulty === "Easy") return 0.9;
    if (aiDifficulty === "Hard") return 1.2;
    return 1.0;
  }, [aiDifficulty]);

  // Initialize carPosition to the first track point whenever normalizedTrack becomes available
  useEffect(() => {
    if (normalizedTrack && normalizedTrack.length > 0) {
      const first = normalizedTrack[0];
      if (first && typeof first.x === "number" && typeof first.y === "number") {
        setCarPosition({ x: first.x, y: first.y });
        setCarProgress(0);
      }
    }
  }, [normalizedTrack]);

  // keep remainingSeconds in sync when runMinutes changes
  useEffect(() => {
    if (runMinutes > 0) setRemainingSeconds(runMinutes * 60);
    else setRemainingSeconds(null);
  }, [runMinutes]);

  // Start / Stop the simulation (toggle)
  function handleStartStop() {
    setIsRunning((s) => {
      const next = !s;
      // if starting and there's a finite duration but remainingSeconds is 0/undefined, initialize
      if (next && runMinutes > 0 && (!remainingSeconds || remainingSeconds <= 0)) {
        setRemainingSeconds(runMinutes * 60);
      }
      return next;
    });
  }

  // Reset button
  function handleReset() {
    setIsRunning(false);
    setCarProgress(0);
    setLeaderboard(isMotoGP ? SAMPLE_MGP_LEADERBOARD : SAMPLE_F1_LEADERBOARD);
    setRemainingSeconds(runMinutes > 0 ? runMinutes * 60 : null);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (normalizedTrack && normalizedTrack.length > 0) {
      const first = normalizedTrack[0];
      setCarPosition({ x: first.x, y: first.y });
    } else {
      setCarPosition({ x: 0, y: 0 });
    }
  }

  // Simulation loop (requestAnimationFrame) - framerate independent
  useEffect(() => {
    if (!isRunning || !normalizedTrack || normalizedTrack.length === 0) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    // tuned base speed + modifiers (tyre, session, fuel, difficulty)
    const baseSpeed = 0.0006;
    const tyreFactor = tyreCompound === "soft" ? 1.03 : tyreCompound === "medium" ? 1.0 : 0.97;
    const sessionFactor = sessionType === "Practice" ? 0.9 : sessionType === "Qualifying" ? 1.15 : 1.0;
    const fuelClamped = Math.min(Math.max(fuelKg, 5), 120);
    const fuelFactor = 1 - ((fuelClamped - 5) / 115) * 0.13;

    const SPEED = baseSpeed * tyreFactor * sessionFactor * fuelFactor * difficultyFactor;

    let last = performance.now();

    const step = (now) => {
      const dt = now - last;
      last = now;
      // normalize to 60fps baseline so movement is stable across machines
      setCarProgress((prev) => {
        let next = prev + SPEED * (dt / (1000 / 60));
        if (next >= 1) next = next - Math.floor(next);
        return next;
      });
      animationFrameRef.current = requestAnimationFrame(step);
    };

    animationFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isRunning, normalizedTrack, tyreCompound, fuelKg, sessionType, difficultyFactor]);

  // Update carPosition when progress changes
  useEffect(() => {
    if (!normalizedTrack || normalizedTrack.length === 0) return;
    try {
      const pos = getPositionOnTrack(normalizedTrack, carProgress);
      if (pos && typeof pos.x === "number" && typeof pos.y === "number") {
        setCarPosition(pos);
      }
    } catch {
      // fall back - do nothing
    }
  }, [carProgress, normalizedTrack]);

  // Simulate leaderboard movement while running
  useEffect(() => {
    if (!isRunning) return;
    const iv = setInterval(() => {
      setLeaderboard((prev) => {
        if (!prev || prev.length < 2) return prev;
        const next = prev.slice();
        const moved = next.shift();
        next.splice(Math.floor(Math.random() * next.length), 0, moved);
        return next.map((x, i) => ({ ...x, pos: i + 1 }));
      });
    }, 1500);
    return () => clearInterval(iv);
  }, [isRunning]);

  // Timer for finite-run simulations
  useEffect(() => {
    // clear old timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (isRunning && runMinutes > 0) {
      timerRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev === null) return null;
          if (prev <= 1) {
            // time up -> stop
            setIsRunning(false);
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isRunning, runMinutes]);

  // canvas background style
  const canvasBgStyle = useMemo(() => {
    // use lighter backgrounds for daytime, darker for night — user asked for NOT pure black canvas
    let base = "linear-gradient(180deg,#f7fbff 0%, #e9f7ff 100%)";
    if (timeOfDay === "Morning") base = "linear-gradient(180deg,#fffaf0 0%, #f3f0e8 100%)";
    if (timeOfDay === "Midday") base = "linear-gradient(180deg,#f7fbff 0%, #e9f7ff 100%)";
    if (timeOfDay === "Evening") base = "linear-gradient(180deg,#fff7f0 0%, #ffeedd 100%)";
    if (timeOfDay === "Night") base = "linear-gradient(180deg,#071226 0%, #020512 100%)";

    let overlay = "";
    if (weather === "Overcast") overlay = ", linear-gradient(180deg, rgba(40,48,60,0.06), rgba(20,24,28,0.06))";
    if (weather === "Rain") overlay = ", linear-gradient(180deg, rgba(18,22,30,0.12), rgba(6,8,12,0.12))";

    // text color depends on day/night
    const color = timeOfDay === "Night" ? "#e7eefc" : "#07101a";
    return { backgroundImage: base + overlay, color };
  }, [timeOfDay, weather]);

  // utility format mm:ss
  const formatTime = (s) => {
    if (s === null) return "∞";
    const mm = Math.floor(s / 60).toString().padStart(2, "0");
    const ss = (s % 60).toString().padStart(2, "0");
    return `${mm}:${ss}`;
  };

  // collapsed sidebar for smaller screens
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      <Header />
      <main className="sim-page" style={{ paddingTop: 92 }}>
        <div className="sim-container">
          <section className="sim-main">
            <motion.div className="sim-card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
              <div className="sim-header">
                <h2>{initialTrack?.name ?? "Track"} — Simulation</h2>
                <div className="sim-meta">
                  <span className="chip">{isMotoGP ? "MotoGP" : `${sessionType} · Regulation ${regulation}`}</span>
                  <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
                <div className="sim-canvas" style={{ minHeight: 480 }}>
                  <div
                    className="sim-canvas-inner"
                    style={{
                      ...canvasBgStyle,
                      position: "relative",
                      overflow: "hidden",
                    }}
                    aria-live="polite"
                  >
                    {initialTrack?.img && (
                      <img
                        src={initialTrack.img}
                        alt={`${initialTrack.name} map`}
                        style={{
                          maxHeight: 260,
                          opacity: 0.12,
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          transform: "translate(-50%, -50%)",
                          zIndex: 1,
                          pointerEvents: "none",
                        }}
                      />
                    )}

                    {/* CanvasPlaceholder renders the track centerline and moving marker.
                        It uses the rawTrackPoints (2D centerline). */}
                    <div style={{ position: "relative", zIndex: 2, padding: 12 }}>
                      <CanvasPlaceholder
                        rawTrackPoints={rawTrackPoints}
                        width={800}
                        height={420}
                        padding={28}
                        running={isRunning}
                        speedFactor={difficultyFactor}
                        carProgress={carProgress}
                        onLap={(lap) => {
                          // optional hook: you can update UI/leaderboard here
                          // console.log("Lap completed:", lap);
                        }}
                      />
                    </div>

                    <div style={{ marginTop: 12, position: "relative", zIndex: 3 }}>
                      <p style={{ color: canvasBgStyle.color, margin: 0 }}>
                        Live simulation for <strong>{initialTrack?.name ?? "Track"}</strong>
                        {normalizedTrack && normalizedTrack.length > 0 ? " — Track spline active" : " — No track data available"}
                      </p>
                    </div>

                    <div className="metrics" style={{ marginTop: 12 }}>
                      <div className="metric">
                        <div className="metric-value">{estimatedLaps}</div>
                        <div className="metric-label">Estimated Laps</div>
                      </div>
                      <div className="metric">
                        <div className="metric-value">{fuelKg} kg</div>
                        <div className="metric-label">Fuel</div>
                      </div>
                      <div className="metric">
                        <div className="metric-value">{tyreCompound}</div>
                        <div className="metric-label">Tyres</div>
                      </div>
                    </div>

                    <div className="sim-quick-summary" style={{ color: canvasBgStyle.color }}>
                      <div><strong>Session:</strong> {sessionType}</div>
                      <div><strong>Time:</strong> {timeOfDay} · <strong>Weather:</strong> {weather}</div>
                      <div><strong>Track:</strong> {trackTemp}°C · <strong>Grip:</strong> {gripLevel}%</div>
                    </div>

                    <div className="canvas-controls" style={{ position: "absolute", bottom: 18, left: 18, zIndex: 4 }}>
                      <div className="time-pill" aria-live="polite" style={{ color: canvasBgStyle.color }}>
                        {runMinutes === 0 ? "Duration: ∞" : `Time left: ${formatTime(remainingSeconds)}`}
                      </div>
                    </div>

                    {/* DEBUG: progress indicator (can remove later) */}
                    <div style={{ position: "absolute", bottom: 18, right: 18, zIndex: 4, color: canvasBgStyle.color, fontWeight: 700 }}>
                      {`Progress: ${(carProgress * 100).toFixed(1)}%`}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 8 }}>
                  <Leaderboard initialData={leaderboard} live={isRunning} driverDetails={driverDetails} />
                </div>
              </div>
            </motion.div>
          </section>

          <aside className={`sim-side ${collapsed ? "collapsed" : ""}`}>
            <div className="params-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ margin: 0 }}>Simulation Parameters</h3>
                <button className="collapse-btn" onClick={() => setCollapsed((c) => !c)} aria-label="Toggle sidebar">
                  {collapsed ? "→" : "←"}
                </button>
              </div>

              <label className="param-label" htmlFor="sessionType">Session type</label>
              <select id="sessionType" value={sessionType} onChange={(e) => setSessionType(e.target.value)} className="param-select">
                <option>Practice</option>
                <option>Qualifying</option>
                <option>Race</option>
              </select>

              <label className="param-label" htmlFor="timeOfDay">Time of day</label>
              <select id="timeOfDay" value={timeOfDay} onChange={(e) => setTimeOfDay(e.target.value)} className="param-select">
                <option>Morning</option>
                <option>Midday</option>
                <option>Evening</option>
                <option>Night</option>
              </select>

              <label className="param-label" htmlFor="weather">Weather</label>
              <select id="weather" value={weather} onChange={(e) => setWeather(e.target.value)} className="param-select">
                <option>Clear</option>
                <option>Overcast</option>
                <option>Rain</option>
              </select>

              <label className="param-label" htmlFor="regulation">Regulation</label>
              <select id="regulation" value={regulation} onChange={(e) => setRegulation(e.target.value)} className="param-select">
                <option value="2022">2022 Regulations</option>
                <option value="2026">2026 Regulations</option>
              </select>

              <label className="param-label" htmlFor="tyreCompound">Tyre compound</label>
              <select id="tyreCompound" value={tyreCompound} onChange={(e) => setTyreCompound(e.target.value)} className="param-select">
                <option value="soft">Soft</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>

              <label className="param-label" htmlFor="fuelKg">Fuel (kg)</label>
              <input id="fuelKg" type="range" min="5" max="120" step="1" value={fuelKg} onChange={(e) => setFuelKg(Number(e.target.value))} className="param-range" />
              <div className="param-value">{fuelKg} kg</div>

              <label className="param-label" htmlFor="runMinutes">Run length (minutes)</label>
              <input id="runMinutes" type="number" min="0" max="180" value={runMinutes} onChange={(e) => setRunMinutes(Number(e.target.value))} className="param-number" />
              <div style={{ fontSize: 12, color: "#9aa0a6", marginBottom: 8 }}>*Set to 0 for indefinite run</div>

              <label className="param-label" htmlFor="ambientTemp">Ambient temperature (°C)</label>
              <input id="ambientTemp" type="range" min="-10" max="45" step="1" value={ambientTemp} onChange={(e) => setAmbientTemp(Number(e.target.value))} className="param-range" />
              <div className="param-value">{ambientTemp}°C</div>

              <label className="param-label" htmlFor="trackTemp">Track temperature (°C)</label>
              <input id="trackTemp" type="range" min="5" max="70" step="1" value={trackTemp} onChange={(e) => setTrackTemp(Number(e.target.value))} className="param-range" />
              <div className="param-value">{trackTemp}°C</div>

              <label className="param-label" htmlFor="gripLevel">Grip level</label>
              <input id="gripLevel" type="range" min="0" max="100" step="1" value={gripLevel} onChange={(e) => setGripLevel(Number(e.target.value))} className="param-range" />
              <div className="param-value">{gripLevel}%</div>

              <label className="param-label" htmlFor="windSpeed">Wind speed (km/h)</label>
              <input id="windSpeed" type="range" min="0" max="120" step="1" value={windSpeed} onChange={(e) => setWindSpeed(Number(e.target.value))} className="param-range" />
              <div className="param-value">{windSpeed} km/h</div>

              <label className="param-label" htmlFor="tyrePressure">Tyre pressure (psi)</label>
              <input id="tyrePressure" type="number" min="12" max="40" step="0.1" value={tyrePressure} onChange={(e) => setTyrePressure(Number(e.target.value))} className="param-number" />

              <label className="param-label" htmlFor="pitStrategy">Pit stop strategy</label>
              <select id="pitStrategy" value={pitStrategy} onChange={(e) => setPitStrategy(e.target.value)} className="param-select">
                <option>None</option>
                <option>One-stop</option>
                <option>Two-stop</option>
              </select>

              <label className="param-label" htmlFor="trafficDensity">Traffic density</label>
              <select id="trafficDensity" value={trafficDensity} onChange={(e) => setTrafficDensity(e.target.value)} className="param-select">
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>

              <label className="param-label" htmlFor="aiDifficulty">AI difficulty</label>
              <select id="aiDifficulty" value={aiDifficulty} onChange={(e) => setAiDifficulty(e.target.value)} className="param-select">
                <option>Easy</option>
                <option>Normal</option>
                <option>Hard</option>
              </select>

              <label className="param-label" htmlFor="safetyCarProb">Safety car probability</label>
              <input id="safetyCarProb" type="range" min="0" max="100" step="1" value={safetyCarProb} onChange={(e) => setSafetyCarProb(Number(e.target.value))} className="param-range" />
              <div className="param-value">{safetyCarProb}%</div>

              <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 10 }}>
                <button className="start-btn" onClick={handleStartStop}>
                  {isRunning ? "Stop Simulation" : "Start Simulation"}
                </button>
                <button className="reset-btn" onClick={handleReset} aria-label="Reset simulation">Reset</button>
              </div>

              <div className="small-note" style={{ marginTop: 12 }}>
                Start will run a live simulated leaderboard in this demo. Wire your WebGL engine and telemetry feed to these inputs and to the Leaderboard (via websocket or snapshots).
              </div>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}
