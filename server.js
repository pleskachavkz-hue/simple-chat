const http = require("http");
const fs = require("fs");
const path = require("path");
const { WebSocketServer } = require("ws");

const PORT = process.env.PORT || 3000;
const clients = new Map();

function formatTime(date = new Date()) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function broadcast(data, except) {
  const payload = JSON.stringify(data);
  for (const [ws] of clients) {
    if (ws !== except && ws.readyState === ws.OPEN) {
      ws.send(payload);
    }
  }
}

function joinedUserCount() {
  let count = 0;
  for (const [, client] of clients) {
    if (client.user) {
      count++;
    }
  }
  return count;
}

function broadcastUserCount() {
  broadcast({ type: "users", count: joinedUserCount() });
}

const server = http.createServer((req, res) => {
  if (req.url === "/" || req.url === "/index.html") {
    const filePath = path.join(__dirname, "index.html");
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Failed to load page");
        return;
      }
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(data);
    });
    return;
  }

  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not found");
});

const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  clients.set(ws, { user: null });

  ws.on("message", (raw) => {
    let data;
    try {
      data = JSON.parse(raw.toString());
    } catch {
      return;
    }

    const client = clients.get(ws);
    if (!client) {
      return;
    }

    if (data.type === "join") {
      if (client.user) {
        return;
      }

      const user = String(data.user).trim().slice(0, 32);
      if (!user) {
        return;
      }

      client.user = user;
      broadcast({
        type: "system",
        text: `${user} joined`,
        time: formatTime(),
      });
      broadcastUserCount();
      return;
    }

    if (data.type === "message") {
      if (!client.user) {
        return;
      }

      const text = String(data.text).trim().slice(0, 2000);
      if (!text) {
        return;
      }

      broadcast({
        type: "message",
        user: client.user,
        text,
        time: formatTime(),
      });
    }
  });

  ws.on("close", () => {
    const client = clients.get(ws);
    if (client?.user) {
      broadcast({
        type: "system",
        text: `${client.user} left`,
        time: formatTime(),
      });
    }
    clients.delete(ws);
    broadcastUserCount();
  });
});

server.listen(PORT, () => {
  console.log(`Chat server running at http://localhost:${PORT}`);
});
