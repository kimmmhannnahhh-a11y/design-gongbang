// design-gongbang - AI 배경 이미지 생성 (Vercel Serverless Function)
// POST /api/generate-image
// OpenAI gpt-image-1 로 "배경/장식/분위기"만 생성. 한글 텍스트는 프론트 HTML이 위에 덮어씀.
// API 키는 반드시 서버 환경변수 OPENAI_API_KEY 로만 사용. 프론트에 절대 노출 금지.

const OPENAI_URL = "https://api.openai.com/v1/images/generations";

// ---- 허용 값 검증용 화이트리스트 ----
const ALLOWED_DOC = ["menu", "banner", "coupon", "businessCard"];
const ALLOWED_ORIENTATION = ["horizontal", "vertical"];
// 품질 tier: 무료/광고 = low(원가 최소), 프리미엄만 medium/high 허용.
// 프론트가 보낸 값은 신뢰하지 않고 서버가 화이트리스트로만 통과. 미지정/이상값 -> low.
const ALLOWED_QUALITY = ["low", "medium", "high"];

// 테마별 "분위기/색톤"만 지정(특정 소품 하드코딩 금지).
// 구체 요소는 사용자가 고른 장식(decorations) 또는 (랜덤) 시 모델이 다양하게 결정.
const THEME_VISUALS = {
  "여름": "a fresh, refreshing and cool summer atmosphere with bright sparkling sunlight and cool aqua, sky-blue and mint tones conveying coolness",
  "봄": "a bright, cheerful spring atmosphere with soft warm light and gentle pastel tones",
  "가을": "a warm, cozy autumn atmosphere with rich amber, beige and brown tones and soft natural light",
  "겨울": "a cool, elegant winter atmosphere with crisp cool tones, soft clean light and a serene feeling",
  "카페": "a cozy, premium cafe atmosphere with warm inviting light and stylish refined tones",
  "음식점": "an appetizing, warm restaurant atmosphere with rich, inviting and vivid tones",
  "뷰티": "an elegant, refined beauty and hair salon atmosphere with soft flattering light and premium tones",
  "오픈행사": "a festive, celebratory grand-opening atmosphere with vivid, lively and cheerful tones",
  "기본": "a clean, elegant, modern and premium atmosphere",
  "모던": "a sleek, modern and contemporary atmosphere with clean lines, bold minimal shapes and a sophisticated urban feel",
  "미니멀": "an ultra-minimal, clean and calm atmosphere with vast serene empty space, subtle tones and refined simplicity",
  "빈티지": "a warm vintage, retro atmosphere with nostalgic aged tones, classic textures and a timeless feel",
  "내추럴": "a fresh, natural and organic atmosphere with earthy greenery, natural materials and soft daylight",
  "럭셔리": "an opulent, luxurious atmosphere with rich gold accents, deep elegant tones and premium glossy materials",
  "클래식": "a refined, classic and elegant atmosphere with timeless ornamentation, soft neutral tones and graceful balance",
  "전통": "an elegant Korean traditional atmosphere (hanok and hanji inspired) with refined oriental patterns, calm natural tones and graceful craftsmanship",
  "키즈": "a playful, cheerful and friendly kids atmosphere with bright happy colors, soft rounded shapes and a fun feel",
  "크리스마스": "a festive, cozy Christmas atmosphere with warm glowing lights, rich seasonal tones and tasteful holiday charm",
  "로맨틱": "a soft, romantic and dreamy atmosphere with tender warm light, delicate details and a loving feel",
  "파스텔": "a soft pastel, dreamy atmosphere with gentle candy tones, airy light and a sweet cheerful feel",
  "트로피컬": "a vibrant tropical atmosphere with lush exotic greenery, bright fresh tones and a sunny resort feel",
  "할로윈": "a playful yet tasteful Halloween atmosphere with cozy dark tones, warm candlelight and charming spooky accents",
  "발렌타인": "a sweet, romantic Valentine atmosphere with soft blush and red tones, tender light and a loving feel",
  "새해": "a festive Korean New Year atmosphere with elegant traditional accents, warm gold tones and a hopeful celebratory feel"
};

// 매 생성마다 구도/스타일을 바꿔 결과가 매번 다르게 나오도록 하는 변주 목록.
const VARIATIONS = [
  "Use an asymmetric composition with the main visual weight on the left side.",
  "Use a composition with decorative elements flowing in from the top and upper corners.",
  "Use a minimal, spacious composition with a few large soft focal elements.",
  "Use a rich, layered composition with gentle depth and softly overlapping elements.",
  "Use a balanced composition framed by tasteful decorations along the outer border.",
  "Use a dynamic diagonal composition sweeping gently across the corners.",
  "Use a composition with the main decorative accent gathered in the lower area.",
  "Use an airy composition with scattered small decorative accents around wide empty space."
];
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// 같은 테마/장식이라도 매번 확연히 다른 결과가 나오도록 하는 랜덤 축들(화풍/조명/팔레트).
const ART_STYLES = [
  "as ultra-realistic product photography with shallow depth of field and soft bokeh",
  "as a refined, dreamy digital illustration",
  "as an elegant watercolor painting with soft bleeding edges",
  "as a luxurious glossy 3D-rendered scene",
  "as a soft gouache painting with gentle brush texture",
  "as a clean, bright editorial magazine-style photograph",
  "as a warm analog film photograph with subtle grain",
  "as a delicate, finely detailed hand-drawn illustration"
];
const LIGHTING = [
  "Use soft, diffused natural lighting.",
  "Use warm golden-hour lighting with long gentle shadows.",
  "Use bright, airy high-key lighting.",
  "Use dramatic soft directional light with gentle contrast.",
  "Use cool, crisp daylight.",
  "Use a dreamy backlit glow with soft haze."
];
const PALETTE_MOODS = [
  "Lean the palette toward soft pastel tones.",
  "Lean the palette toward rich, saturated tones.",
  "Lean the palette toward warm earthy tones.",
  "Lean the palette toward cool, fresh tones.",
  "Lean the palette toward clean minimal tones with lots of soft white space.",
  "Lean the palette toward bold, vivid contrasting tones."
];
// 매 생성마다 전체 색조합을 확 바꿔 결과가 뚜렷이 달라지게 하는 구체 팔레트.
const COLOR_SCHEMES = [
  "blush pink, cream and soft gold",
  "sage green, ivory and warm beige",
  "lavender, lilac and pale silver",
  "terracotta, peach and warm sand",
  "dusty blue, misty grey and clean white",
  "champagne, warm taupe and soft brown",
  "coral, apricot and cream",
  "mint, aqua and crisp white",
  "burgundy, mauve and antique gold",
  "charcoal, slate and muted teal",
  "olive green, cream and camel",
  "powder blue, white and rose gold"
];
// 매 생성마다 "그림의 종류/구도" 자체를 바꿔 매번 똑같은 실내 풍경만 나오지 않게 함.
const BG_ARCHETYPES = [
  "an abstract, minimal decorative background made only of soft shapes, gentle gradients, light and color - with no rooms, furniture or literal scenery",
  "a clean background featuring just a few tasteful themed objects grouped to one side, on a simple uncluttered surface",
  "a soft, airy atmospheric background with only a faint hint of setting, mostly open and uncrowded",
  "an elegant pattern- and texture-based background with tasteful repeating motifs and soft depth, and no scenery",
  "an overhead flat-lay arrangement of a few themed items on a clean surface with generous empty space",
  "a dreamy close-up of a single hero element with heavy soft blur around it and lots of clean empty space"
];
// 메뉴판 전용: 가장자리 장식 배치/밀도를 매번 바꿔 같은 업종도 매번 다르게 (가운데 비우는 규칙은 유지).
const MENU_EDGE_STYLES = [
  "concentrate the decorations mainly across the TOP header band and keep the rest calm and airy",
  "run a single elegant decorative border framing all four outer edges",
  "gather the decorations richly along the BOTTOM like a footer scene, keeping the top clean",
  "place a bold decorative strip down ONE side (left or right) only, leaving the other side plain",
  "use just a few small tasteful accents tucked into the corners, very minimal and spacious",
  "use lush, dense premium decorations wrapping the whole outer frame",
  "scatter soft, light decorative accents sparsely around the wide outer margins"
];

// 개별 장식 요소(테마별, 복수 선택) -> 고급 비주얼 묘사
// "(랜덤)"은 특수값: 모델이 테마에 맞는 장식을 알아서 구성.
const DECO_VISUALS = {
  // 기본
  "빛번짐": "soft glowing light bloom", "그라데이션": "smooth elegant color gradients",
  "도형": "elegant geometric shapes", "라인패턴": "subtle refined line patterns",
  "대리석": "luxurious marble texture", "반짝임": "soft sparkling light and dreamy bokeh",
  // 여름
  "파도": "realistic ocean waves", "물방울": "glistening fresh water droplets",
  "수박": "fresh juicy watermelon slices", "파인애플": "ripe golden pineapple",
  "레몬": "bright fresh lemons", "야자수": "lush tropical palm leaves",
  "햇빛": "bright sparkling sunlight reflections",
  // 봄
  "벚꽃": "delicate cherry blossoms", "꽃잎": "gently drifting flower petals",
  "나비": "graceful butterflies", "새싹": "fresh green sprouts",
  "봄꽃": "colorful blooming spring flowers", "햇살": "warm soft sunbeams",
  // 가을
  "낙엽": "softly fallen autumn leaves", "단풍": "red and orange maple leaves",
  "커피원두": "roasted coffee beans", "우드질감": "natural warm wood texture",
  "도토리": "small acorns", "감성조명": "warm cozy ambient lighting",
  // 겨울
  "눈": "soft falling snow", "눈송이": "delicate snowflakes",
  "서리": "fine frost crystals", "크리스마스장식": "tasteful Christmas ornaments",
  "리스": "an elegant holiday wreath", "조명": "warm glowing string lights",
  // 카페
  "커피": "a premium styled coffee cup", "원두": "roasted coffee beans",
  "디저트": "refined gourmet desserts", "케이크": "an elegant cake",
  "라떼아트": "beautiful latte art", "식물": "fresh green plants",
  // 음식점
  "접시": "elegantly plated dishes", "신선채소": "fresh vegetables",
  "고기": "premium grilled meat", "허브": "fresh aromatic herbs",
  "김(스팀)": "warm rising steam", "과일": "fresh colorful fruit",
  // 뷰티
  "꽃": "elegant fresh flowers", "화장품": "refined cosmetics",
  "머릿결": "silky flowing hair texture", "빛반사": "soft light reflections",
  "패브릭": "premium draped fabric", "깃털": "delicate feathers",
  // 오픈행사
  "풍선": "festive colorful balloons", "리본": "silky decorative ribbons",
  "색종이": "scattered confetti", "폭죽": "sparkling fireworks",
  "꽃가루": "falling celebration petals", "가랜드": "a festive party garland",
  // 모던
  "기하도형": "bold clean geometric shapes", "그리드": "a subtle modern grid", "메탈릭": "sleek metallic sheen",
  "컬러블록": "clean color-block panels", "얇은라인": "fine modern lines", "무광": "smooth matte surfaces",
  // 미니멀
  "여백": "vast calm empty negative space", "단색면": "a clean solid color field", "얇은선": "thin delicate lines",
  "심플도형": "a few simple minimal shapes", "그림자": "soft minimal shadows", "점": "subtle scattered dots",
  // 빈티지
  "오래된종이": "aged vintage paper texture", "레트로패턴": "retro geometric patterns", "필름그레인": "warm analog film grain",
  "세피아": "nostalgic sepia tones", "빈티지꽃": "vintage floral illustration", "우표": "old postage-stamp style accents",
  // 내추럴
  "나뭇잎": "fresh green leaves", "원목": "warm natural wood texture", "린넨": "soft linen fabric",
  "마른꽃": "delicate dried flowers", "돌": "smooth natural stones", "유칼립투스": "eucalyptus branches",
  // 럭셔리
  "골드": "elegant gold accents", "벨벳": "rich velvet fabric", "크리스탈": "sparkling crystal",
  "실크": "flowing silk", "보석": "refined jewels",
  // 클래식
  "아라베스크": "elegant arabesque ornament", "금테": "fine gold trim", "다마스크": "a refined damask pattern",
  "액자": "classic ornate frames", "진주": "lustrous pearls",
  // 전통
  "한지": "traditional hanji paper texture", "단청": "colorful Korean dancheong patterns", "매듭": "traditional Korean decorative knots",
  "먹": "elegant ink-wash strokes", "소나무": "graceful pine branches", "한국문양": "refined traditional Korean motifs",
  // 키즈
  "별": "cute twinkling stars", "구름": "soft fluffy clouds", "무지개": "a cheerful rainbow",
  "동물": "cute friendly animal characters", "크레용": "playful crayon doodles",
  // 크리스마스
  "트리": "a beautifully decorated Christmas tree", "오너먼트": "tasteful Christmas ornaments", "선물": "elegantly wrapped gift boxes",
  // 로맨틱·발렌타인
  "하트": "soft romantic hearts", "빛망울": "dreamy light bokeh", "레이스": "delicate lace", "장미": "elegant roses", "초콜릿": "luxurious chocolates",
  // 파스텔
  "파스텔구름": "soft pastel clouds", "몽글몽글": "soft dreamy blurred shapes", "마카롱": "pastel macarons",
  // 트로피컬
  "몬스테라": "large tropical monstera leaves", "히비스커스": "bright hibiscus flowers", "플라밍고": "a stylish flamingo",
  // 할로윈
  "호박": "carved Halloween jack-o-lantern pumpkins", "박쥐": "flying bats", "거미줄": "delicate spider webs",
  "유령": "cute friendly ghosts", "마녀모자": "a witch hat", "촛불": "flickering candles",
  // 새해
  "복주머니": "a traditional Korean lucky pouch", "매화": "elegant plum blossoms", "금빛장식": "festive gold decorations"
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
    let s = "Compose this as a vertical menu-poster background. Keep a clean empty header band across the top, and reserve generous empty space in the central body arranged for " + cols + " vertical column" + (cols > 1 ? "s" : "") + " of menu text so that menu names and prices stay perfectly readable. Place every decorative element only around the outer edges, corners and borders, and never inside the central text columns. For variety in this version, " + pick(MENU_EDGE_STYLES) + ".";
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

function shuffle(arr) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

// ---- 서버측 프롬프트 자동 작성 (사용자 입력을 명령이 아닌 데이터로만 사용) ----
function buildPrompt(data) {
  // 계절 -> THEME_VISUALS(분위기/색톤). season 우선, 없으면 theme, 없으면 기본.
  const themeKey = THEME_VISUALS[data.season] ? data.season : (THEME_VISUALS[data.theme] ? data.theme : "기본");
  const themePart = THEME_VISUALS[themeKey];

  const industry = clampStr(data.industry || data.businessType || "", 40);

  // 장식: (랜덤) 제외. 알려진 것은 영어 비주얼로, 모르는 한글은 그대로. 6개 이상이면 서버가 어울리게 3~5개 선별.
  const raw = Array.isArray(data.decorations) ? data.decorations : [];
  const isRandom = raw.includes("(랜덤)");
  let picked = raw.filter(d => d !== "(랜덤)").map(d => clampStr(d, 40)).filter(Boolean);
  if (picked.length > 5) picked = shuffle(picked).slice(0, 5);
  const known = picked.filter(d => DECO_VISUALS[d]);
  const unknown = picked.filter(d => !DECO_VISUALS[d]);
  let decoPart = "";
  if (known.length) decoPart += "Feature these decorative elements as rich, high-quality realistic product photography or refined premium illustration (never low-resolution icons or flat emoji): " + known.map(d => DECO_VISUALS[d]).join(", ") + ".";
  if (unknown.length) decoPart += (decoPart ? " " : "") + "Also elegantly incorporate, in a premium way: " + unknown.join(", ") + ".";
  const custom = clampStr(data.customDeco || "", 100);
  if (custom) decoPart += (decoPart ? " " : "") + "Design reference from the shop owner (interpret tastefully as visuals, never render as literal text): " + custom + ".";
  if (isRandom || (!picked.length && !custom)) decoPart += (decoPart ? " " : "") + "Creatively choose and compose a tasteful, varied set of premium decorative elements that best fit the theme.";

  const accent = isHex(data.accentColor) ? data.accentColor : "#7c5cff";
  const layoutPart = layoutSpaceInstruction(data.documentType, data.layoutType);
  const mood = clampStr(data.mood, 30), color = clampStr(data.color, 30), material = clampStr(data.material, 30), space = clampStr(data.space, 30);

  // 랜덤 4축 조합(화풍 × 조명 × 팔레트 × 구도)으로 매 생성마다 다른 느낌.
  const style = pick(ART_STYLES), light = pick(LIGHTING), palette = pick(PALETTE_MOODS), comp = pick(VARIATIONS);
  const scheme = pick(COLOR_SCHEMES), archetype = pick(BG_ARCHETYPES);
  // 기본 보라색 강조를 매번 강제하면 결과가 죄다 보라톤으로 비슷해짐 → 기본색일 땐 랜덤 팔레트가 주도.
  const isDefaultAccent = (data.accentColor === "#7657ff" || data.accentColor === "#7c5cff" || !isHex(data.accentColor));

  return [
    "Create a premium, high-end commercial poster-quality background" + (industry ? " for a " + industry : "") + ", " + themePart + ", rendered " + style + ".",
    (data.documentType === "menu" ? "" : "VERY IMPORTANT for variety: compose THIS version specifically as " + archetype + ". Do not default to a literal interior room scene."),
    light,
    palette,
    mood ? ("Overall mood/feeling: " + mood + ".") : "",
    color ? ("Lean the color palette toward: " + color + ".") : "",
    material ? ("Incorporate a subtle " + material + " material texture.") : "",
    space ? ("Style/space reference: " + space + ".") : "",
    (isDefaultAccent ? "" : "Use " + accent + " as the main accent color, woven tastefully into the palette."),
    ((isDefaultAccent && !color) ? ("Strongly lean the entire color palette toward " + scheme + ".") : ""),
    "Make this variation clearly distinct in color palette, lighting and composition from other versions.",
    decoPart,
    layoutPart,
    comp,
    "Render every element in a rich, detailed and premium way - never as low-resolution icons or simple emoji. Prioritize tasteful balance and generous whitespace over clutter.",
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

    // 직접입력(장식) 안전 필터: 데이터로만 사용. URL/꺾쇠 제거 후 길이 제한.
    const safeCustom = clampStr(String(body.customDeco || "").replace(/https?:\/\/\S+/gi, " ").replace(/[<>]/g, " "), 100);

    const data = {
      documentType,
      orientation,
      businessType: clampStr(body.businessType, 40),
      industry: clampStr(body.industry, 40),
      layoutType: clampStr(body.layoutType, 40),
      templateStyle: clampStr(body.templateStyle, 40),
      theme: clampStr(body.theme, 20),
      mood: clampStr(body.mood, 30),
      color: clampStr(body.color, 30),
      season: clampStr(body.season, 30),
      material: clampStr(body.material, 30),
      space: clampStr(body.space, 30),
      customDeco: safeCustom,
      categoriesCount: Math.max(0, Math.min(50, parseInt(body.categoriesCount, 10) || 0)),
      menuCount: Math.max(0, Math.min(500, parseInt(body.menuCount, 10) || 0)),
      accentColor: isHex(body.accentColor) ? body.accentColor : "#7c5cff",
      title: clampStr(body.title, 80),
      subtitle: clampStr(body.subtitle, 80),
      decorations: Array.isArray(body.decorations)
        ? body.decorations.filter(d => typeof d === "string").slice(0, 12)
        : []
    };

    const prompt = buildPrompt(data);
    const size = pickSize(documentType, orientation, data.layoutType);
    // 프리미엄 tier 검증(로그인/결제)이 서버에 붙기 전까지는 무조건 low로 강제.
    // (인증 없이 body.quality를 신뢰하면 누구나 quality:"high"를 직접 보내 공짜 고화질 남용 가능)
    // 추후: const isPremium = await verifyPremium(req); quality = isPremium && ALLOWED_QUALITY.includes(body.quality) ? body.quality : "low";
    const quality = "low";
    void ALLOWED_QUALITY;

    const oaRes = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ model: "gpt-image-1", prompt, n: 1, size, quality })
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
