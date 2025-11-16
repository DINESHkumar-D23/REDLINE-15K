// ws-mock.js
const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 8080 }, () => {
  console.log("Mock WS server listening on ws://localhost:8080");
});

const baseF1 = [
  { pos: 1, name: "L. Hamilton", team: "Mercedes", time: "1:28.062" },
  { pos: 2, name: "M. Verstappen", team: "Red Bull Racing", time: "1:28.325" },
  { pos: 3, name: "C. Leclerc", team: "Ferrari", time: "1:28.735" },
  { pos: 4, name: "S. Pérez", team: "Red Bull Racing", time: "1:29.091" },
  { pos: 5, name: "G. Russell", team: "Mercedes", time: "1:29.450" },
];

function randomShuffle(list) {
  const out = list.slice();
  // small random adjacent swaps
  for (let i = 0; i < 2; i++) {
    const a = Math.floor(Math.random() * (out.length - 1));
    const b = a + 1;
    const t = out[a];
    out[a] = out[b];
    out[b] = t;
  }
  return out.map((r, i) => ({ ...r, pos: i + 1 }));
}

wss.on("connection", (ws) => {
  console.log("client connected");
  // send initial
  ws.send(JSON.stringify({ leaderboard: baseF1 }));

  const iv = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      const payload = { leaderboard: randomShuffle(baseF1) };
      ws.send(JSON.stringify(payload));
    }
  }, 1200);

  ws.on("close", () => {
    console.log("client disconnected");
    clearInterval(iv);
  });

  ws.on("message", (msg) => {
    console.log("received from client:", msg.toString());
  });
});
