// 정기결제 해지: 자동청구만 중단. 남은 결제기간까지는 프리미엄 유지(만료 시 cron이 종료).
const { db, verifyToken } = require("./_lib/server");

module.exports = async (req, res) => {
  if (req.method !== "POST") { res.status(405).json({ ok: false }); return; }
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const uid = await verifyToken(body.idToken);
    if (!uid) { res.status(401).json({ ok: false, error: "로그인이 필요해요." }); return; }
    await db().collection("users").doc(uid).set({
      subStatus: "canceled", subCanceledAt: new Date().toISOString()
    }, { merge: true });
    res.status(200).json({ ok: true });
  } catch (e) {
    console.error("[cancel] 예외", e && e.message ? e.message : e);
    res.status(500).json({ ok: false, error: "일시적인 오류가 발생했어요." });
  }
};
