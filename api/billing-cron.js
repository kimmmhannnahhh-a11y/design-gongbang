// 매일 실행(Vercel Cron): 갱신일 도래한 구독 자동청구. 해지된 구독은 기간 만료 시 프리미엄 종료.
// 복합 인덱스 회피 위해 subStatus로만 조회 후 코드에서 날짜 필터.
const { db, chargeBillingKey } = require("./_lib/server");
const PLANS = { light: 4900, pro: 9900 };
const MONTH_MS = 30 * 24 * 3600 * 1000;

module.exports = async (req, res) => {
  // Vercel Cron 보호(선택): CRON_SECRET 설정 시 Authorization 확인
  if (process.env.CRON_SECRET) {
    const a = req.headers["authorization"] || "";
    if (a !== "Bearer " + process.env.CRON_SECRET) { res.status(401).json({ ok: false }); return; }
  }
  const nowISO = new Date().toISOString();
  let charged = 0, failed = 0, ended = 0;
  try {
    const store = db();

    // 1) 활성 구독 자동청구
    const active = await store.collection("users").where("subStatus", "==", "active").limit(500).get();
    for (const d of active.docs) {
      const u = d.data();
      if (!u.nextBillingAt || u.nextBillingAt > nowISO) continue; // 아직 청구일 전
      const amount = PLANS[u.subPlan] || u.subAmount || 4900;
      const paymentId = "dg_sub_" + d.id.slice(0, 8) + "_" + Date.now();
      const charge = await chargeBillingKey({
        paymentId, billingKey: u.billingKey, amount,
        orderName: "디자인공방 " + (u.subPlan === "pro" ? "프로" : "라이트") + " (월 정기결제)",
        customer: { id: d.id, email: u.email || "" }
      });
      if (charge.ok) {
        charged++;
        await d.ref.set({ premium: true, lastPaidAt: nowISO, nextBillingAt: new Date(Date.now() + MONTH_MS).toISOString(), lastPaymentId: paymentId, subFailCount: 0 }, { merge: true });
      } else {
        failed++;
        const fc = (u.subFailCount || 0) + 1;
        if (fc >= 3) {
          await d.ref.set({ premium: false, subStatus: "past_due", subFailCount: fc }, { merge: true });
        } else {
          // 2일 후 재시도
          await d.ref.set({ subFailCount: fc, nextBillingAt: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString() }, { merge: true });
        }
      }
    }

    // 2) 해지된 구독: 남은 기간 끝나면 프리미엄 종료
    const canceled = await store.collection("users").where("subStatus", "==", "canceled").limit(500).get();
    for (const d of canceled.docs) {
      const u = d.data();
      if (u.premium && u.nextBillingAt && u.nextBillingAt <= nowISO) {
        ended++;
        await d.ref.set({ premium: false, subStatus: "expired" }, { merge: true });
      }
    }

    res.status(200).json({ ok: true, charged, failed, ended });
  } catch (e) {
    console.error("[billing-cron] 예외", e && e.message ? e.message : e);
    res.status(500).json({ ok: false });
  }
};
