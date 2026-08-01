// 정기결제 서버 공용 유틸: Firebase Admin(자동청구 시 Firestore 접근) + 포트원 빌링 청구.
// 필요한 Vercel 환경변수: FIREBASE_SERVICE_ACCOUNT(JSON), PORTONE_V2_API_SECRET
const admin = require("firebase-admin");

function ensureApp() {
  if (!admin.apps.length) {
    const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || "{}");
    admin.initializeApp({ credential: admin.credential.cert(sa) });
  }
}
function db() { ensureApp(); return admin.firestore(); }
async function verifyToken(idToken) {
  ensureApp();
  if (!idToken) return null;
  try { const d = await admin.auth().verifyIdToken(idToken); return d.uid; }
  catch (e) { return null; }
}

const PORTONE_API = "https://api.portone.io";
// 빌링키(등록된 카드)로 실제 청구.
async function chargeBillingKey({ paymentId, billingKey, amount, orderName, customer }) {
  const r = await fetch(PORTONE_API + "/payments/" + encodeURIComponent(paymentId) + "/billing-key", {
    method: "POST",
    headers: {
      "Authorization": "PortOne " + (process.env.PORTONE_V2_API_SECRET || ""),
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ billingKey, orderName, customer, amount: { total: amount }, currency: "KRW" })
  });
  let data = {};
  try { data = await r.json(); } catch (e) {}
  return { ok: r.ok, status: r.status, data };
}

module.exports = { admin, db, verifyToken, chargeBillingKey };
