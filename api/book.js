const { allowedSlots, getBusy, googleFetch, isDate, isWeekday, json, overlaps, slotRange } = require("./_google");

function clean(value, max = 500) {
  return String(value || "").trim().slice(0, max);
}

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "仅支持 POST 请求" });
  const body = req.body || {};
  const date = clean(body.date, 10);
  const time = clean(body.time, 5);
  const name = clean(body.name, 80);
  const email = clean(body.email, 160);
  const company = clean(body.company, 120);
  const phone = clean(body.phone, 60);
  const notes = clean(body.notes, 1000);
  const primary = body.primary === "yes" ? "是" : body.primary === "no" ? "否" : "";

  if (!isDate(date) || !isWeekday(date) || !allowedSlots().includes(time)) return json(res, 400, { error: "预约日期或时间无效" });
  if (!name || !company || !primary || !validEmail(email)) return json(res, 400, { error: "请完整填写必填信息" });

  try {
    const range = slotRange(date, time);
    const busy = await getBusy(date);
    if (overlaps(range, busy)) return json(res, 409, { error: "该时间已被预约，请重新选择" });

    const eventId = `mimoint${date.replaceAll("-", "")}${time.replace(":", "")}`;
    const params = new URLSearchParams({ conferenceDataVersion: "1", sendUpdates: "all" });
    const event = {
      id: eventId,
      summary: `作品集面试沟通｜${name}｜${company}`,
      description: [`姓名：${name}`, `公司：${company}`, `主要联系人：${primary}`, phone && `电话：${phone}`, notes && `备注：${notes}`].filter(Boolean).join("\n"),
      start: { dateTime: `${date}T${time}:00+08:00`, timeZone: "Asia/Shanghai" },
      end: { dateTime: range.end.toISOString(), timeZone: "Asia/Shanghai" },
      attendees: [{ email, displayName: name }],
      conferenceData: { createRequest: { requestId: `${eventId}meet`, conferenceSolutionKey: { type: "hangoutsMeet" } } },
    };
    const response = await googleFetch(`/calendar/v3/calendars/${encodeURIComponent(process.env.GOOGLE_CALENDAR_ID)}/events?${params}`, {
      method: "POST",
      body: JSON.stringify(event),
    });
    if (response.status === 409) return json(res, 409, { error: "该时间已被预约，请重新选择" });
    if (!response.ok) throw new Error("Calendar event creation failed");
    const created = await response.json();
    return json(res, 201, { ok: true, eventId: created.id, meetUrl: created.hangoutLink || null });
  } catch (error) {
    console.error("booking_error", error.message);
    return json(res, 503, { error: "预约暂时失败，请稍后重试" });
  }
};
