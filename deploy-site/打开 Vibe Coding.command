#!/bin/zsh
cd "$(dirname "$0")"
PORT=8021
if ! lsof -iTCP:$PORT -sTCP:LISTEN >/dev/null 2>&1; then
  python3 -m http.server $PORT >/tmp/mimio-vibe-coding-server.log 2>&1 &
  sleep 1
fi
open "http://127.0.0.1:$PORT/vibe-coding.html?from=command&v=20260707-4"
