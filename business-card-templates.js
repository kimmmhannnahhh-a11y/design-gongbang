/*
 * Business card template registry.
 *
 * This file contains data only. Both template thumbnails and full-size card
 * faces must consume the same TemplateData object; no thumbnail-only styling
 * belongs here or in the renderer.
 */

/**
 * @typedef {"front"|"back"} CardFace
 * @typedef {"top-left"|"top-center"|"top-right"|"center-left"|"center"|"center-right"|"bottom-left"|"bottom-center"|"bottom-right"|"hidden"} CardPosition
 * @typedef {{front: *, back: *}} FaceValue
 * @typedef {{label: string, key?: string, value?: string, format: "text"|"tel"|"email"|"url"|"handle"|"hours"}} TemplateDetail
 *
 * @typedef {Object} TemplateData
 * @property {string} id Stable template identifier.
 * @property {string} name Display name.
 * @property {"basic"|"industry"} category Template browser category.
 * @property {string} industry Primary Korean industry label.
 * @property {"horizontal"|"vertical"} orientation Default card orientation.
 * @property {string} frontBackground CSS background value for the front face.
 * @property {string} backBackground CSS background value for the back face.
 * @property {string} frontTextColor Front face foreground color.
 * @property {string} backTextColor Back face foreground color.
 * @property {string} primaryColor Main accent color.
 * @property {string} secondaryColor Supporting accent color.
 * @property {string} fontFamily CSS font-family stack.
 * @property {FaceValue} fontWeight Font weight per face.
 * @property {string} frontLayout Front renderer layout ID.
 * @property {string} backLayout Back renderer layout ID.
 * @property {"left"|"center"|"right"} frontTextAlign Front text alignment.
 * @property {"left"|"center"|"right"} backTextAlign Back text alignment.
 * @property {FaceValue} logoPosition Logo position per face.
 * @property {FaceValue} infoPosition Information block position per face.
 * @property {FaceValue} qrPosition QR position per face.
 * @property {FaceValue} dividerStyle Divider treatment per face.
 * @property {FaceValue} borderStyle Border treatment per face.
 * @property {FaceValue} iconStyle Icon treatment per face.
 * @property {FaceValue} nameSize Name size in px per face.
 * @property {FaceValue} bodySize Body size in px per face.
 * @property {FaceValue} letterSpacing Letter spacing in px per face.
 * @property {FaceValue} lineHeight Unitless line height per face.
 * @property {FaceValue} padding Inner padding in px per face.
 * @property {number} borderRadius Corner radius in px.
 * @property {string} description Short template browser description.
 * @property {string[]} industries Related industry filters.
 * @property {string[]} searchAliases Search terms not shown in the card.
 * @property {string} icon Original, generic symbol key (never an official logo).
 * @property {string} kicker Small display line used by the composition.
 * @property {string} qrLabel Label shown beside the QR code.
 * @property {FaceValue} verticalAlign Vertical content alignment per face.
 * @property {FaceValue} motif Decorative motif rendered consistently at all sizes.
 * @property {TemplateDetail[]} frontDetails Ordered fields on the front.
 * @property {TemplateDetail[]} backDetails Ordered fields on the back.
 */

/** @type {TemplateData[]} */
window.BUSINESS_CARD_TEMPLATES = [
  {
    id: "signature",
    name: "시그니처",
    category: "basic",
    industry: "기본",
    orientation: "horizontal",
    frontBackground: "#f7f6f2",
    backBackground: "#20211f",
    frontTextColor: "#20211f",
    backTextColor: "#f7f6f2",
    primaryColor: "#a7865d",
    secondaryColor: "#d8c5a8",
    fontFamily: "Pretendard, Arial, sans-serif",
    fontWeight: { front: 700, back: 600 },
    frontLayout: "classic-split",
    backLayout: "classic-mark",
    frontTextAlign: "left",
    backTextAlign: "center",
    logoPosition: { front: "top-left", back: "center" },
    infoPosition: { front: "center-right", back: "bottom-center" },
    qrPosition: { front: "hidden", back: "bottom-right" },
    dividerStyle: { front: "hairline-vertical", back: "short-center" },
    borderStyle: { front: "none", back: "none" },
    iconStyle: { front: "solid-square", back: "outline-large" },
    nameSize: { front: 26, back: 18 },
    bodySize: { front: 11, back: 10 },
    letterSpacing: { front: 0, back: 0 },
    lineHeight: { front: 1.45, back: 1.4 },
    padding: { front: 30, back: 30 },
    borderRadius: 8,
    description: "정돈된 분할과 절제된 금빛 포인트",
    industries: ["기본", "기업", "브랜드", "공방"],
    searchAliases: ["클래식", "심플", "로고", "signature"],
    icon: "monogram",
    kicker: "EST. 2026",
    qrLabel: "MORE",
    verticalAlign: { front: "center", back: "center" },
    motif: { front: "vertical-rule", back: "quiet-frame" },
    frontDetails: [
      { label: "", key: "name", format: "text" },
      { label: "", key: "role", format: "text" }
    ],
    backDetails: [
      { label: "T", key: "mobile", format: "tel" },
      { label: "E", key: "email", format: "email" },
      { label: "W", key: "web", format: "url" }
    ]
  },
  {
    id: "modern",
    name: "모던 사이드",
    category: "basic",
    industry: "기본",
    orientation: "horizontal",
    frontBackground: "#f2f4f7",
    backBackground: "#17191f",
    frontTextColor: "#17191f",
    backTextColor: "#f3f5f8",
    primaryColor: "#5b54d6",
    secondaryColor: "#b8b5ff",
    fontFamily: "Pretendard, Arial, sans-serif",
    fontWeight: { front: 800, back: 700 },
    frontLayout: "modern-sidebar",
    backLayout: "modern-contact",
    frontTextAlign: "left",
    backTextAlign: "right",
    logoPosition: { front: "top-left", back: "bottom-left" },
    infoPosition: { front: "center-right", back: "center-right" },
    qrPosition: { front: "hidden", back: "bottom-right" },
    dividerStyle: { front: "color-rail", back: "grid-rule" },
    borderStyle: { front: "none", back: "none" },
    iconStyle: { front: "inverse-tile", back: "micro-mark" },
    nameSize: { front: 28, back: 20 },
    bodySize: { front: 11, back: 10 },
    letterSpacing: { front: 0, back: 0 },
    lineHeight: { front: 1.4, back: 1.5 },
    padding: { front: 28, back: 28 },
    borderRadius: 8,
    description: "선명한 컬러 레일과 기능적인 정보 그리드",
    industries: ["기본", "IT", "스타트업", "서비스"],
    searchAliases: ["모던", "현대적", "사이드바", "modern"],
    icon: "plus-grid",
    kicker: "PROFILE / 01",
    qrLabel: "CONNECT",
    verticalAlign: { front: "center", back: "center" },
    motif: { front: "side-rail", back: "coordinate-cross" },
    frontDetails: [
      { label: "", key: "name", format: "text" },
      { label: "", key: "role", format: "text" }
    ],
    backDetails: [
      { label: "TEL", key: "mobile", format: "tel" },
      { label: "MAIL", key: "email", format: "email" },
      { label: "WEB", key: "web", format: "url" }
    ]
  },
  {
    id: "minimal",
    name: "미니멀 타입",
    category: "basic",
    industry: "기본",
    orientation: "horizontal",
    frontBackground: "#ffffff",
    backBackground: "#f0f1f3",
    frontTextColor: "#111214",
    backTextColor: "#111214",
    primaryColor: "#111214",
    secondaryColor: "#a7abb2",
    fontFamily: "Pretendard, Arial, sans-serif",
    fontWeight: { front: 600, back: 500 },
    frontLayout: "minimal-space",
    backLayout: "minimal-rule",
    frontTextAlign: "left",
    backTextAlign: "left",
    logoPosition: { front: "top-left", back: "hidden" },
    infoPosition: { front: "bottom-left", back: "center-left" },
    qrPosition: { front: "hidden", back: "hidden" },
    dividerStyle: { front: "none", back: "micro-baseline" },
    borderStyle: { front: "inset-hairline", back: "inset-hairline" },
    iconStyle: { front: "wordmark-only", back: "none" },
    nameSize: { front: 25, back: 18 },
    bodySize: { front: 10, back: 10 },
    letterSpacing: { front: 0, back: 0 },
    lineHeight: { front: 1.55, back: 1.65 },
    padding: { front: 34, back: 34 },
    borderRadius: 2,
    description: "넓은 여백과 정확한 기준선만 남긴 구성",
    industries: ["기본", "프리랜서", "작가", "컨설팅"],
    searchAliases: ["미니멀", "무채색", "타이포", "minimal"],
    icon: "wordmark-dot",
    kicker: "INTRODUCTION",
    qrLabel: "",
    verticalAlign: { front: "bottom", back: "center" },
    motif: { front: "baseline-dot", back: "index-numbers" },
    frontDetails: [
      { label: "", key: "name", format: "text" },
      { label: "", key: "role", format: "text" }
    ],
    backDetails: [
      { label: "01", key: "mobile", format: "tel" },
      { label: "02", key: "email", format: "email" },
      { label: "03", key: "web", format: "url" }
    ]
  },
  {
    id: "premium",
    name: "프리미엄 볼드",
    category: "basic",
    industry: "기본",
    orientation: "horizontal",
    frontBackground: "#f3efe6",
    backBackground: "#1c2930",
    frontTextColor: "#172127",
    backTextColor: "#f8f5ee",
    primaryColor: "#e34f38",
    secondaryColor: "#ffb85c",
    fontFamily: "'Noto Serif KR', Georgia, serif",
    fontWeight: { front: 900, back: 700 },
    frontLayout: "premium-crest",
    backLayout: "premium-balanced",
    frontTextAlign: "left",
    backTextAlign: "left",
    logoPosition: { front: "top-right", back: "bottom-right" },
    infoPosition: { front: "center-left", back: "center-left" },
    qrPosition: { front: "hidden", back: "bottom-right" },
    dividerStyle: { front: "full-accent-band", back: "thick-short" },
    borderStyle: { front: "none", back: "accent-edge" },
    iconStyle: { front: "oversize-outline", back: "inverse-square" },
    nameSize: { front: 34, back: 22 },
    bodySize: { front: 11, back: 11 },
    letterSpacing: { front: 0, back: 0 },
    lineHeight: { front: 1.1, back: 1.4 },
    padding: { front: 26, back: 28 },
    borderRadius: 6,
    description: "굵은 컬러 밴드와 큰 이름이 만드는 강한 인상",
    industries: ["기본", "스튜디오", "마케팅", "행사"],
    searchAliases: ["볼드", "강렬", "밴드", "bold"],
    icon: "offset-circle",
    kicker: "MAKE IT CLEAR",
    qrLabel: "SCAN",
    verticalAlign: { front: "center", back: "center" },
    motif: { front: "horizontal-band", back: "serial-number" },
    frontDetails: [
      { label: "", key: "name", format: "text" },
      { label: "", key: "role", format: "text" }
    ],
    backDetails: [
      { label: "CALL", key: "mobile", format: "tel" },
      { label: "MAIL", key: "email", format: "email" },
      { label: "VISIT", key: "web", format: "url" }
    ]
  },
  {
    id: "creative",
    name: "크리에이티브 코너",
    category: "basic",
    industry: "기본",
    orientation: "vertical",
    frontBackground: "#f8f4ed",
    backBackground: "#242326",
    frontTextColor: "#242326",
    backTextColor: "#f8f4ed",
    primaryColor: "#cc4b42",
    secondaryColor: "#8ca6a2",
    fontFamily: "'Noto Serif KR', Georgia, serif",
    fontWeight: { front: 700, back: 500 },
    frontLayout: "creative-grid",
    backLayout: "creative-notes",
    frontTextAlign: "left",
    backTextAlign: "left",
    logoPosition: { front: "top-right", back: "bottom-right" },
    infoPosition: { front: "bottom-left", back: "top-left" },
    qrPosition: { front: "hidden", back: "bottom-left" },
    dividerStyle: { front: "corner-lines", back: "caption-rule" },
    borderStyle: { front: "asymmetric-corners", back: "none" },
    iconStyle: { front: "fine-line", back: "micro-mark" },
    nameSize: { front: 31, back: 19 },
    bodySize: { front: 11, back: 10 },
    letterSpacing: { front: 0, back: 0 },
    lineHeight: { front: 1.25, back: 1.55 },
    padding: { front: 30, back: 30 },
    borderRadius: 4,
    description: "세로 비율과 코너 선을 활용한 에디토리얼 디자인",
    industries: ["기본", "스튜디오", "사진", "작가"],
    searchAliases: ["에디토리얼", "세로", "스튜디오", "editorial"],
    icon: "crop-corner",
    kicker: "SELECTED WORKS",
    qrLabel: "PORTFOLIO",
    verticalAlign: { front: "bottom", back: "top" },
    motif: { front: "crop-marks", back: "folio-index" },
    frontDetails: [
      { label: "", key: "name", format: "text" },
      { label: "", key: "role", format: "text" }
    ],
    backDetails: [
      { label: "CONTACT", key: "mobile", format: "tel" },
      { label: "MAIL", key: "email", format: "email" },
      { label: "PORTFOLIO", key: "web", format: "url" }
    ]
  },
  {
    id: "noir",
    name: "누아르 루미에르",
    category: "basic",
    industry: "기본",
    orientation: "horizontal",
    frontBackground: "#121317",
    backBackground: "#ece4d4",
    frontTextColor: "#e8d5ac",
    backTextColor: "#25231f",
    primaryColor: "#bd9650",
    secondaryColor: "#7e6a45",
    fontFamily: "'Noto Serif KR', Georgia, serif",
    fontWeight: { front: 600, back: 500 },
    frontLayout: "noir-block",
    backLayout: "noir-columns",
    frontTextAlign: "center",
    backTextAlign: "center",
    logoPosition: { front: "center", back: "center" },
    infoPosition: { front: "bottom-center", back: "center" },
    qrPosition: { front: "hidden", back: "bottom-right" },
    dividerStyle: { front: "ornament-short", back: "double-hairline" },
    borderStyle: { front: "double-inset", back: "single-inset" },
    iconStyle: { front: "serif-monogram", back: "small-crest" },
    nameSize: { front: 27, back: 19 },
    bodySize: { front: 10, back: 10 },
    letterSpacing: { front: 0, back: 0 },
    lineHeight: { front: 1.35, back: 1.55 },
    padding: { front: 32, back: 32 },
    borderRadius: 4,
    description: "이중 프레임과 세리프 모노그램의 차분한 고급감",
    industries: ["기본", "법인", "주얼리", "프리미엄"],
    searchAliases: ["럭셔리", "고급", "골드", "luxe"],
    icon: "serif-monogram",
    kicker: "LUMIERE",
    qrLabel: "PRIVATE LINK",
    verticalAlign: { front: "center", back: "center" },
    motif: { front: "double-frame", back: "balanced-columns" },
    frontDetails: [
      { label: "", key: "co", format: "text" },
      { label: "", key: "name", format: "text" }
    ],
    backDetails: [
      { label: "DIRECT", key: "mobile", format: "tel" },
      { label: "EMAIL", key: "email", format: "email" },
      { label: "OFFICE", key: "addr", format: "text" }
    ]
  }
];
