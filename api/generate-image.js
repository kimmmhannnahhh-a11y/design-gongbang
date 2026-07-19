// design-gongbang - AI 배경 이미지 생성 (Vercel Serverless Function)
// POST /api/generate-image
// OpenAI gpt-image-1 로 "배경/장식/분위기"만 생성. 한글 텍스트는 프론트 HTML이 위에 덮어씀.
// API 키는 반드시 서버 환경변수 OPENAI_API_KEY 로만 사용. 프론트에 절대 노출 금지.

const OPENAI_URL = "https://api.openai.com/v1/images/generations";

// ---- 허용 값 검증용 화이트리스트 ----
const ALLOWED_DOC = ["menu", "banner", "coupon", "businessCard"];
const ALLOWED_ORIENTATION = ["horizontal", "vertical"];

// 테마별 실제 상업 포스터 수준 시각 요소
const THEME_VISUALS = {
  "여름": "a refreshing summer scene with cool ocean-blue tones, realistic rippling ocean waves, glistening water droplets, bright sparkling sunlight reflections, fresh juicy tropical fruits such as watermelon, pineapple and lemon, and lush green palm leaves",
  "봄": "a bright cheerful spring scene with a clear blue sky, soft warm sunlight, delicate cherry blossoms and gently drifting flower petals",
  "가을": "a warm cozy autumn scene with rich beige and brown tones, softly fallen maple leaves, roasted coffee beans and natural wood texture",
  "겨울": "a cool elegant winter scene with soft fresh snow, delicate frost, cool blue lighting and tasteful Christmas ornaments",
  "카페": "a cozy premium cafe scene with a beautifully styled coffee cup, roasted coffee beans, delicate desserts and stylish table props",
  "음식점": "an appetizing restaurant scene with realistic photographic-quality fresh ingredients and elegantly plated gourmet food",
  "뷰티": "an elegant beauty and hair salon scene with silky flowing hair texture, soft light reflections, refined cosmetics, fresh flowers and premium fabric",
  "오픈행사": "a festive grand-opening celebration scene with colorful balloons, flowing ribbons, scattered confetti and party decorations",
  "기본": "a clean, elegant, modern and premium decorative scene"
};

// 개별 장식 요소(복수 선택) -> 고급 비주얼 묘사
const DECO_VISUALS = {
  "파도": "realistic ocean waves",
  "물방울": "glistening fresh water droplets",
  "수박": "fresh juicy watermelon slices",
  "파인애플": "ripe golden pineapple",
  "레몬": "bright fresh lemons",
  "야자수": "lush tropical palm leaves",
  "꽃": "elegant fresh flowers",
  "커피": "a premium coffee cup and roasted beans",
  "디저트": "refined gourmet desserts",
  "리본": "silky decorative ribbons",
  "풍선": "festive colorful balloons",
  "반짝임": "soft sparkling light and dreamy bokeh"
};

// ---- 유틸 ----
function clampStr(v, max) {
  if (typeof v !== "string") return "";
  // 제어문자 제거 후 길이 제한 (프롬프트 데이터로만 사용)
  return v.replace(/[\u0000-\u001f\u007f]/g, " ").slice(0, max).trim();
}
function isHex(v) {
  return typeof v === "string" && /^#[0-9a-fA-F]{6}$/.test(v);
}

// 문서 유형 + 방향 -> gpt-image-1 지원 사이즈
function pickSize(documentType, orientation, layoutType) {
  if (documentType === "banner") return "1536x1024";
  if (documentType === "coupon") return "1536x1024";
  if (documentType === "businessCard") {
    return orientation === "vertical" ? "1024x1536" : "1536x1024";
  }
  if (documentType === "menu") {
    if (layoutType && /가로/.test(layoutType)) return "1536x1024";
    return "1024x1536";
  }
  return "1024x1024";
}

// 레이아웃별 텍스트 여백 확보 지시문
function layoutSpaceInstruction(documentType, layoutType) {
  if (documentType === "menu") {
    const cols = /3\s*단/.test(layoutType) ? 3 : /2\s*단/.test(layoutType) ? 2 : 1;
    let s = "Compose this as a vertical menu-poster background. Keep a clean empty header band across the top, and reserve generous empty space in the central body arranged for " + cols + " vertical column" + (cols > 1 ? "s" : "") + " of menu text so that menu names and prices stay perfectly readable. Place every decorative element only around the outer edges, corners and borders, and never inside the central text columns.";
    if (/카테고리/.test(layoutType)) s += " Leave clearly separated empty blocks for several category sections.";
    return s;
  }
  if (documentType === "banner") {
    return "Compose this as a wide promotional banner background: an eye-catching richly decorated area on one side, and ample clean empty space on the opposite side reserved for a large headline and subtitle text.";
  }
  if (documentType === "coupon") {
    return "Compose this as a coupon background with a subtle dashed tear-off line and tasteful patterns, keeping a clean empty central panel reserved for the coupon title, benefit and condition text.";
  }
  if (documentType === "businessCard") {
    return "Compose this as an elegant business-card background with a clean empty area reserved for a logo or photo and generous empty space reserved for the name and contact details.";
  }
  return "";
}

// ---- 서버측 프롬프트 자동 작성 (사용자 입력을 명령이 아닌 데이터로만 사용) ----
function buildPrompt(data) {
  const theme = THEME_VISUALS[data.theme] ? data.theme : "기본";
  const themePart = THEME_VISUALS[theme];

  const decos = Array.isArray(data.decorations)
    ? data.decorations.filter(d => DECO_VISUALS[d]).slice(0, 12)
    : [];
  const decoPart = decos.length
    ? "Prominently feature these decorative elements rendered as rich, high-quality realistic product photography or refined premium illustration (never low-resolution icons or flat emoji): " + decos.map(d => DECO_VISUALS[d]).join(", ") + "."
    : "";

  const moodPart = data.mood ? "Overall mood: " + data.mood + "." : "";
  const accent = isHex(data.accentColor) ? data.accentColor : "#7c5cff";
  const layoutPart = layoutSpaceInstruction(data.documentType, data.layoutType);

  return [
    "Create " + themePart + ", in the style of a premium high-end commercial advertising poster with professional lighting, depth and texture.",
    moodPart,
    "Use " + accent + " as the main accent color, woven tastefully into the palette.",
    decoPart,
    layoutPart,
    "Render all fruits, food, flowers and props as realistic high-quality product photography or refined illustration - vivid, detailed and premium, absolutely not low-resolution icons or simple emoji.",
    "This image is ONLY a decorative background: there must be absolutely no text, no letters, no words, no numbers, no logos, no watermark, no signage, no menu, no captions of any language anywhere in the image.",
    "Keep the reserved text areas visually clean, softly lit and uncluttered so text can be cleanly overlaid on top later."
  ].filter(Boolean).join(" ");
}

// ---- 아주 기본적인 요청 제한 (best-effort, 서버리스라 인스턴스 간 공유는 안 됨) ----
// TODO: 추후 로그인/DB/Redis 기반의 정식 rate limit 으로 교체.
const rlStore = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxPerWindow = 10;
  const rec = rlStore.get(ip);
  if (!rec || now - rec.ts > windowMs) {
    rlStore.set(ip, { ts: now, count: 1 });
    return false;
  }
  rec.count += 1;
  return rec.count > maxPerWindow;
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "허용되지 않은 요청 방식입니다." });
    return;
  }

  const ip = (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "unknown";
  if (rateLimited(ip)) {
    res.status(429).json({ ok: false, error: "요청이 너무 잦습니다. 잠시 후 다시 시도해 주세요." });
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("[generate-image] OPENAI_API_KEY 환경변수가 설정되지 않았습니다.");
    res.status(500).json({ ok: false, error: "서버 설정 오류입니다. 잠시 후 다시 시도해 주세요." });
    return;
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});

    const documentType = body.documentType;
    if (!ALLOWED_DOC.includes(documentType)) {
      res.status(400).json({ ok: false, error: "지원하지 않는 문서 유형입니다." });
      return;
    }
    const orientation = ALLOWED_ORIENTATION.includes(body.orientation) ? body.orientation : "horizontal";

    const data = {
      documentType,
      orientation,
      businessType: clampStr(body.businessType, 30),
      layoutType: clampStr(body.layoutType, 40),
      templateStyle: clampStr(body.templateStyle, 40),
      theme: clampStr(body.theme, 20),
      mood: clampStr(body.mood, 40),
      accentColor: isHex(body.accentColor) ? body.accentColor : "#7c5cff",
      title: clampStr(body.title, 80),
      subtitle: clampStr(body.subtitle, 80),
      decorations: Array.isArray(body.decorations)
        ? body.decorations.filter(d => typeof d === "string").slice(0, 12)
        : []
    };

    const prompt = buildPrompt(data);
    const size = pickSize(documentType, orientation, data.layoutType);

    const oaRes = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ model: "gpt-image-1", prompt, n: 1, size })
    });

    if (!oaRes.ok) {
      let detail = "";
      try { detail = JSON.stringify(await oaRes.json()); } catch (e) { detail = oaRes.statusText; }
      console.error("[generate-image] OpenAI 오류:", oaRes.status, detail);
      const msg = oaRes.status === 429
        ? "지금은 요청이 많아요. 잠시 후 다시 시도해 주세요."
        : "이미지 생성에 실패했어요. 잠시 후 다시 시도해 주세요.";
      res.status(502).json({ ok: false, error: msg });
      return;
    }

    const json = await oaRes.json();
    const b64 = json && json.data && json.data[0] && json.data[0].b64_json;
    if (!b64) {
      console.error("[generate-image] 응답에 이미지 데이터가 없습니다.");
      res.status(502).json({ ok: false, error: "이미지 생성에 실패했어요. 잠시 후 다시 시도해 주세요." });
      return;
    }

    res.status(200).json({ ok: true, image: "data:image/png;base64," + b64, size });
  } catch (err) {
    console.error("[generate-image] 예외:", err && err.message ? err.message : err);
    res.status(500).json({ ok: false, error: "일시적인 오류가 발생했어요. 잠시 후 다시 시도해 주세요." });
  }
};
