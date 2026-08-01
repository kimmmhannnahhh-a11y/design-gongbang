// 정기결제 시작: 카드(빌링키) 등록 후 첫 달 청구 + 구독 저장 + 프리미엄 활성화.
const { db, verifyToken, chargeBillingKey } = require("./_lib/server");
const PLANS = { light: 4900, pro: 9900 };
const MONTH_MS = 30 * 24 * 3600 * 1000;

module.exports = async (req, res) => {
  if (req.method !== "POST") { res.status(405).json({ ok: false, error: "허용되지 않은 방식" }); return; }
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const uid = await verifyToken(body.idToken);
    if (!uid) { res.status(401).json({ ok: false, error: "로그인이 필요해요." }); return; }

    const plan = PLANS[body.plan] ? body.plan : "light";
    const amount = PLANS[plan];
    const billingKey = String(body.billingKey || "");
    if (!billingKey) { res.status(400).json({ ok: false, error: "카드 등록 정보가 없어요." }); return; }

    const paymentId = "dg_sub_" + uid.slice(0, 8) + "_" + Date.now();
    const charge = await chargeBillingKey({
      paymentId, billingKey, amount,
      orderName: "디자인공방 " + (plan === "pro" ? "프로" : "라이트") + " (월 정기결제)",
      customer: { id: uid, email: String(body.email || "").slice(0, 120) }
    });
    if (!charge.ok) {
      console.error("[subscribe] 청구 실패", charge.status, JSON.stringify(charge.data));
      res.status(402).json({ ok: false, error: "결제에 실패했어요. 카드 정보를 확인해 주세요." });
      return;
    }

    const now = Date.now();
    const next = new Date(now + MONTH_MS).toISOString();
    await db().collection("users").doc(uid).set({
      premium: true, premiumPlan: plan,
      billingKey, subStatus: "active", subPlan: plan, subAmount: amount, subFailCount: 0,
      subStartedAt: new Date(now).toISOString(), lastPaidAt: new Date(now).toISOString(),
      nextBillingAt: next, lastPaymentId: paymentId, app: "design-gongbang"
    }, { merge: true });

    res.status(200).json({ ok: true, plan, nextBillingAt: next });
  } catch (e) {
    console.error("[subscribe] 예외", e && e.message ? e.message : e);
    res.status(500).json({ ok: false, error: "일시적인 오류가 발생했어요." });
  }
};
