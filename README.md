# 디자인공방 (사장님용 홍보물 제작)

사장님을 위한 가게 홍보물 생성기. 홍보 배너 / 메뉴판 / 쿠폰 / 명함.

## 실행 방법

빌드·설치 필요 없음. 순수 정적 HTML 1개.

- `index.html` 을 브라우저로 열면 바로 실행됨.
- 또는 로컬 서버:
  ```
  npx serve .
  # 또는
  python -m http.server 8000
  ```

## 구조

```
design-gongbang/
├── index.html   # 앱 전체 (HTML + CSS + JS 인라인)
└── README.md
```

별도 `src/`, `css/`, `js/`, `package.json`, 번들러(vite/next) 없음 — 단일 파일 구성.

## 사용 라이브러리 (CDN, 인터넷 필요)

- Pretendard (폰트) — jsdelivr
- Google Fonts: Noto Sans KR, Nanum Gothic, Nanum Myeongjo, Gothic A1
- qrcodejs (QR 자동 생성) — jsdelivr

> 오프라인 사용하려면 위 CDN 파일을 로컬로 받아 `index.html`의 링크를 상대경로로 바꾸면 됨.

## 기능

- **홍보 배너**: 업종 20종, 문구 입력, 테마색, 사이즈(1:1/4:5/16:9) 실시간 미리보기
- **쿠폰**: 타입 5종, 스타일 4종, 업종별 추천 8종, 절취선 디자인, QR 자동
- **명함**: 템플릿 4종, 앞/뒷면, 정렬·모서리·폰트, 로고/프로필 업로드, QR 자동
- **메뉴판**: 준비 중

## 미구현(스텁)

- PNG / PDF 다운로드
- 사이즈 변경, 쿠폰 앞뒷면, AI 생성 버튼
- 메뉴판 탭
