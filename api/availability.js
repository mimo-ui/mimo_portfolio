const { allowedSlots, getBusy, isDate, isWeekday, json, overlaps, slotRange } = require("./_google");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") return json(res, 405, { error: "仅支持 GET 请求" });
  const date = String(req.query?.date || "");
  if (!isDate(date) || !isWeekday(date)) return json(res, 400, { error: "请选择有效的工作日" });
  try {
    const busy = await getBusy(date);
    const booked = allowedSlots().filter((time) => overlaps(slotRange(date, time), busy));
    return json(res, 200, { date, booked });
  } catch (error) {
    console.error("availability_error", error.message);
    return json(res, 503, { error: "暂时无法读取日历，请稍后重试" });
  }
};

