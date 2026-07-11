const REQUIRED_ENV = [
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "GOOGLE_REFRESH_TOKEN",
  "GOOGLE_CALENDAR_ID",
];

function requireEnv() {
  const missing = REQUIRED_ENV.filter((name) => !process.env[name]);
  if (missing.length) throw new Error(`Missing environment variables: ${missing.join(", ")}`);
}

async function getAccessToken() {
  requireEnv();
  const body = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    grant_type: "refresh_token",
  });
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!response.ok) throw new Error("Google authorization failed");
  const data = await response.json();
  return data.access_token;
}

async function googleFetch(path, options = {}) {
  const token = await getAccessToken();
  const response = await fetch(`https://www.googleapis.com${path}`, {
    ...options,
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
      ...(options.headers || {}),
    },
  });
  return response;
}

function json(res, status, payload) {
  res.status(status).setHeader("content-type", "application/json; charset=utf-8");
  res.setHeader("cache-control", "no-store");
  res.end(JSON.stringify(payload));
}

function isDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value || "") && !Number.isNaN(Date.parse(`${value}T12:00:00+08:00`));
}

function isWeekday(date) {
  const day = new Date(`${date}T12:00:00+08:00`).getUTCDay();
  return day >= 1 && day <= 5;
}

function allowedSlots() {
  const values = [];
  for (let minutes = 14 * 60; minutes <= 19 * 60; minutes += 30) {
    values.push(`${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`);
  }
  return values;
}

function slotRange(date, time) {
  const start = new Date(`${date}T${time}:00+08:00`);
  return { start, end: new Date(start.getTime() + 30 * 60 * 1000) };
}

async function getBusy(date) {
  const timeMin = `${date}T00:00:00+08:00`;
  const next = new Date(`${date}T00:00:00+08:00`);
  next.setUTCDate(next.getUTCDate() + 1);
  const response = await googleFetch("/calendar/v3/freeBusy", {
    method: "POST",
    body: JSON.stringify({
      timeMin,
      timeMax: next.toISOString(),
      timeZone: "Asia/Shanghai",
      items: [{ id: process.env.GOOGLE_CALENDAR_ID }],
    }),
  });
  if (!response.ok) throw new Error("Calendar availability lookup failed");
  const data = await response.json();
  return data.calendars?.[process.env.GOOGLE_CALENDAR_ID]?.busy || [];
}

function overlaps(range, busy) {
  return busy.some((item) => range.start < new Date(item.end) && range.end > new Date(item.start));
}

module.exports = { allowedSlots, getBusy, googleFetch, isDate, isWeekday, json, overlaps, slotRange };

