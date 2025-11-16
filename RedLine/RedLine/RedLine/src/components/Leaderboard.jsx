// src/components/Leaderboard.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import "./Leaderboard.css";

/**
 * props:
 * - initialData: [{ pos, name, team, time }]
 * - live: boolean -> when true, component simulates live updates
 * - driverDetails: { "<driver name>": { tyre, fuelKg, lastLap } }
 * - websocketUrl (optional) - if provided, component will connect if autoConnect true
 * - autoConnect (optional)
 */
export default function Leaderboard({
  initialData = [],
  live = false,
  driverDetails = {},
  websocketUrl,
  autoConnect = false,
}) {
  const [board, setBoard] = useState(() => (initialData || []).map((r, i) => ({ pos: r.pos ?? i + 1, ...r })));
  const [connected, setConnected] = useState(false);
  const wsRef = useRef(null);
  const simulateIv = useRef(null);
  const flashRef = useRef({});
  const [expanded, setExpanded] = useState(null);

  // normalize incoming
  useEffect(() => {
    setBoard((prev) => {
      const next = (initialData || []).map((r, i) => ({ pos: r.pos ?? i + 1, ...r }));
      return next.sort((a, b) => a.pos - b.pos);
    });
  }, [initialData]);

  // websocket optional connection (snapshot messages expected)
  useEffect(() => {
    if (!websocketUrl || !autoConnect) return;
    let ws;
    try {
      ws = new WebSocket(websocketUrl);
      wsRef.current = ws;
      ws.addEventListener("open", () => setConnected(true));
      ws.addEventListener("close", () => setConnected(false));
      ws.addEventListener("message", (evt) => {
        try {
          const payload = JSON.parse(evt.data);
          if (payload?.leaderboard) applyLeaderboard(payload.leaderboard);
          else if (Array.isArray(payload)) applyLeaderboard(payload);
        } catch {}
      });
    } catch {}
    return () => {
      if (ws) ws.close();
      wsRef.current = null;
    };
  }, [websocketUrl, autoConnect]);

  function applyLeaderboard(newList) {
    if (!Array.isArray(newList)) return;
    const normalized = newList.map((r, i) => ({ pos: r.pos ?? i + 1, ...r })).sort((a, b) => a.pos - b.pos);
    const oldByName = Object.fromEntries(board.map((r) => [r.name, r]));
    normalized.forEach((r) => {
      const prev = oldByName[r.name];
      if (!prev || prev.pos !== r.pos || prev.time !== r.time) flashRef.current[r.name] = Date.now();
    });
    setBoard(normalized);
  }

  // simulate live changes
  useEffect(() => {
    if (!live) {
      if (simulateIv.current) {
        clearInterval(simulateIv.current);
        simulateIv.current = null;
      }
      return;
    }
    if (simulateIv.current) return;
    simulateIv.current = setInterval(() => {
      setBoard((prev) => {
        if (!prev || prev.length < 2) return prev;
        // small random movement: swap two adjacent entries
        const next = prev.slice();
        const a = Math.floor(Math.random() * (next.length - 1));
        const b = a + 1;
        const tmp = next[a];
        next[a] = { ...next[b] };
        next[b] = { ...tmp };
        return next.map((r, i) => ({ ...r, pos: i + 1 }));
      });
    }, 1200);
    return () => {
      if (simulateIv.current) {
        clearInterval(simulateIv.current);
        simulateIv.current = null;
      }
    };
  }, [live]);

  // flash helper for changed rows (1.8s)
  function getFlashClass(name) {
    const when = flashRef.current[name];
    if (!when) return "";
    if (Date.now() - when < 1800) return "row-flash";
    return "";
  }

  // detailed info to display in row expansion: prefer driverDetails prop otherwise mock
  function getDetails(name) {
    if (driverDetails && driverDetails[name]) return driverDetails[name];
    // generate lightweight mock deltas (non-deterministic)
    return {
      tyre: ["Soft", "Medium", "Hard"][Math.floor(Math.random() * 3)],
      fuelKg: 40 + Math.floor(Math.random() * 40),
      lastLap: `${1 + Math.floor(Math.random() * 2)}:${(10 + Math.floor(Math.random() * 50)).toString().padStart(2, "0")}`,
      gap: `${(Math.random() * 2.5).toFixed(3)}s`,
    };
  }

  const top3 = useMemo(() => board.slice(0, 3), [board]);

  return (
    <div className="lb-root" role="region" aria-label="Live leaderboard">
      <div className="lb-header">
        <div>
          <strong>Live Leaderboard</strong>
          <div className="lb-sub">Real-time positions & deltas</div>
        </div>

        <div className="lb-controls">
          {websocketUrl && (
            <button
              className={`lb-btn ${connected ? "connected" : "disconnected"}`}
              onClick={() => {
                if (connected && wsRef.current) wsRef.current.close();
                else if (websocketUrl) {
                  try {
                    const ws = new WebSocket(websocketUrl);
                    wsRef.current = ws;
                    ws.addEventListener("open", () => setConnected(true));
                    ws.addEventListener("close", () => setConnected(false));
                    ws.addEventListener("message", (evt) => {
                      try {
                        const payload = JSON.parse(evt.data);
                        if (payload?.leaderboard) applyLeaderboard(payload.leaderboard);
                        else if (Array.isArray(payload)) applyLeaderboard(payload);
                      } catch {}
                    });
                  } catch {}
                }
              }}
            >
              {connected ? "Connected" : "Connect"}
            </button>
          )}

          <button
            className="lb-btn"
            onClick={() => {
              // manual shuffle to inspect animation
              setBoard((prev) => {
                if (!prev || prev.length < 2) return prev;
                const next = prev.slice();
                const moved = next.shift();
                const insertAt = Math.floor(Math.random() * next.length);
                next.splice(insertAt, 0, moved);
                return next.map((r, i) => ({ ...r, pos: i + 1 }));
              });
            }}
          >
            Shuffle
          </button>
        </div>
      </div>

      {/* top 3 */}
      <div className="lb-top3">
        {top3.map((r, i) => (
          <div key={r.name} className={`top3-card t${i + 1}`}>
            <div className="pos">{r.pos}</div>
            <div className="meta">
              <div className="name">{r.name}</div>
              <div className="team">{r.team ?? ""}</div>
            </div>
            <div className="time">{r.time ?? "--:---"}</div>
          </div>
        ))}
      </div>

      {/* full list */}
      <div className="lb-list-wrap" role="table" aria-label="Positions table">
        <div className="lb-list-head" role="row">
          <div className="c-pos">#</div>
          <div className="c-name">Driver</div>
          <div className="c-team">Team</div>
          <div className="c-time">Time</div>
        </div>

        <div className="lb-list" role="rowgroup">
          {board.map((r) => {
            const cls = `${r.pos <= 3 ? "top" : ""} ${getFlashClass(r.name)}`;
            const details = getDetails(r.name);
            const isOpen = expanded === r.name;
            return (
              <div key={`${r.name}-${r.pos}`} className={`lb-row ${cls}`} role="row" tabIndex={0}>
                <div className="c-pos" onClick={() => setExpanded(isOpen ? null : r.name)}>{r.pos}</div>
                <div className="c-name" onClick={() => setExpanded(isOpen ? null : r.name)}>{r.name}</div>
                <div className="c-team">{r.team ?? "-"}</div>
                <div className="c-time" onClick={() => setExpanded(isOpen ? null : r.name)}>{r.time ?? "--:---"}</div>

                {/* expanded details */}
                {isOpen && (
                  <div className="lb-row-details" style={{ gridColumn: "1 / -1", paddingTop: 6 }}>
                    <div className="details-grid">
                      <div><strong>Tyre</strong><div className="small-muted">{details.tyre}</div></div>
                      <div><strong>Fuel</strong><div className="small-muted">{details.fuelKg} kg</div></div>
                      <div><strong>Last Lap</strong><div className="small-muted">{details.lastLap}</div></div>
                      <div><strong>Gap</strong><div className="small-muted">{details.gap}</div></div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
