# Simple Chat

A one-page multi-user chat app with vanilla HTML/CSS/JS and a tiny Node.js WebSocket server.

## Run

```bash
npm install
npm start
```

Open http://localhost:3000 in multiple browser tabs to test real-time messaging.

## Share on the internet

Install Cloudflare Tunnel once:

```bash
brew install cloudflared
```

Then run:

```bash
npm run share
```

Copy the `https://....trycloudflare.com` URL from the output and share it. The URL changes each time you start the tunnel.

## Features

- Username on join (saved in localStorage)
- Real-time message broadcast
- Online user count
- Join/leave system messages
- Auto-scroll to latest message

Messages are in-memory only and disappear when the server restarts.
