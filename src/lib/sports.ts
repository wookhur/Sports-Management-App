// -----------------------------------------------------------------------------
// Sport registry
//
// This is the single extension point for the whole app. To add a new sport
// later, add one entry to SPORTS below with its features + content. Nothing
// else in the app needs to know the concrete list of sports.
// -----------------------------------------------------------------------------

export type SportFeature = "guide" | "measure";

export interface GuideStep {
  title: string;
  detail: string;
}

export interface Guide {
  id: string;
  title: string;
  level: "입문" | "중급" | "고급";
  durationMin: number;
  focus: string;
  summary: string;
  steps: GuideStep[];
  tips: string[];
}

export interface Metric {
  key: string;
  name: string;
  // Which quantities this metric captures.
  capture: Array<"time" | "distance">;
  // Preset distance (meters) for fixed-distance events.
  distanceM?: number;
  unitLabel?: string;
}

export interface SportDef {
  id: string;
  name: string;
  emoji: string;
  /** Tailwind gradient classes for the sport card. */
  gradient: string;
  accent: string; // hex, for small accents and background tints
  /**
   * The same identity, dark enough to be read as text.
   *
   * Several accents are around 3.6:1 on white — fine as a 10% tint behind an
   * emoji, below AA the moment they carry words.
   */
  accentText: string;
  tagline: string;
  features: SportFeature[];
  guides?: Guide[];
  metrics?: Metric[];
}

// -----------------------------------------------------------------------------
// 🥍 라크로스 — 훈련 방식 가이드
// -----------------------------------------------------------------------------
const lacrosse: SportDef = {
  id: "lacrosse",
  name: "라크로스",
  emoji: "🥍",
  gradient: "from-emerald-500 to-teal-600",
  accent: "#0d9488",
  accentText: "#0f766e",
  tagline: "스틱 핸들링부터 1대1까지, 단계별 훈련 방식",
  features: ["guide"],
  guides: [
    {
      id: "cradling-basics",
      title: "크레들링 기본기",
      level: "입문",
      durationMin: 20,
      focus: "볼 컨트롤 · 스틱 감각",
      summary: "달리면서도 볼을 흘리지 않는 크레들링의 기본 리듬을 익힙니다.",
      steps: [
        { title: "그립 잡기", detail: "위손은 스틱 목, 아래손은 끝을 가볍게 감싸 쥡니다. 손목은 부드럽게." },
        { title: "제자리 크레들", detail: "손목을 반원으로 굴리며 볼이 포켓 안에서 흔들리는 감각을 느낍니다. 30초 × 3세트." },
        { title: "걸으며 크레들", detail: "천천히 걸으며 리듬을 유지합니다. 시선은 볼이 아닌 정면을 봅니다." },
        { title: "달리며 크레들", detail: "조깅 속도로 올리며 좌/우손 전환을 섞습니다. 20m × 6회." },
      ],
      tips: ["볼을 보지 말고 정면을 보는 습관을 들이세요.", "손목이 아니라 팔 전체로 흔들면 볼을 놓칩니다."],
    },
    {
      id: "passing-catching",
      title: "패스 & 캐치",
      level: "입문",
      durationMin: 25,
      focus: "정확도 · 캐치 안정성",
      summary: "짝을 이뤄 정확한 패스와 안정적인 캐치를 반복 훈련합니다.",
      steps: [
        { title: "박스 타깃", detail: "벽에 사각 타깃을 정해 5m 거리에서 오버핸드 패스 20회." },
        { title: "파트너 캐치", detail: "10m 간격으로 마주 서서 양손 각각 15회씩 주고받습니다." },
        { title: "이동 패스", detail: "옆으로 이동하며 리드 패스를 주고받아 실전 각도를 만듭니다." },
      ],
      tips: ["캐치 순간 스틱을 살짝 뒤로 빼 충격을 흡수하세요(give with the ball).", "패스는 귀 옆에서 던져야 정확합니다."],
    },
    {
      id: "ground-ball",
      title: "그라운드 볼 장악",
      level: "중급",
      durationMin: 20,
      focus: "루즈볼 · 몸싸움",
      summary: "바닥에 떨어진 볼을 안정적으로 걷어 올려 소유권을 가져옵니다.",
      steps: [
        { title: "로우 스쿱", detail: "무릎을 굽혀 낮은 자세로 스틱을 지면과 평행하게 밀어 넣습니다." },
        { title: "스쿱 & 크레들", detail: "걷어 올린 즉시 크레들로 전환해 볼을 보호합니다. 15회." },
        { title: "경쟁 그라운드볼", detail: "파트너와 동시에 출발해 볼 쟁탈. 몸으로 각도를 막습니다." },
      ],
      tips: ["볼 위를 지나가듯 스쿱하고 절대 멈춰서 찍지 마세요.", "걷어 올린 뒤 바로 반대 방향으로 벗어나면 안전합니다."],
    },
    {
      id: "shooting-accuracy",
      title: "슈팅 정확도",
      level: "중급",
      durationMin: 30,
      focus: "코스 · 파워",
      summary: "골 네 모서리를 겨냥해 코스와 파워를 함께 끌어올립니다.",
      steps: [
        { title: "세트 슛", detail: "정지 상태에서 상단 좌/우, 하단 좌/우 각 10회씩 코스별 반복." },
        { title: "크랭크 슛", detail: "체중을 앞발로 옮기며 상체 회전으로 파워를 더합니다." },
        { title: "온더런 슛", detail: "크레들 → 스텝 → 슛으로 이어지는 실전 동작 15회." },
      ],
      tips: ["엉덩이와 어깨 회전이 파워의 핵심입니다.", "골키퍼가 반응하기 어려운 하단 코너를 우선 노리세요."],
    },
    {
      id: "dodging-1v1",
      title: "도징 & 1대1",
      level: "고급",
      durationMin: 25,
      focus: "돌파 · 페인트",
      summary: "수비를 흔드는 도징 무브로 슈팅 각도를 만들어냅니다.",
      steps: [
        { title: "스플릿 도지", detail: "좌우 급전환으로 수비 무게중심을 무너뜨립니다. 10회." },
        { title: "롤 도지", detail: "몸으로 스틱을 보호하며 회전 돌파. 양방향 8회." },
        { title: "실전 1대1", detail: "수비수를 붙여 도지 → 슛까지 연결. 6세트." },
      ],
      tips: ["첫 스텝의 폭발력이 도지 성공률을 좌우합니다.", "페인트는 눈과 어깨로 먼저 속이세요."],
    },
  ],
};

// -----------------------------------------------------------------------------
// ⚽ 축구 — 연습 방식 가이드
// -----------------------------------------------------------------------------
const soccer: SportDef = {
  id: "soccer",
  name: "축구",
  emoji: "⚽",
  gradient: "from-sky-500 to-indigo-600",
  accent: "#4f46e5",
  accentText: "#4f46e5",
  tagline: "터치, 패스, 드리블, 마무리까지 포지션 불문 기본 연습",
  features: ["guide"],
  guides: [
    {
      id: "first-touch",
      title: "볼 컨트롤 & 퍼스트 터치",
      level: "입문",
      durationMin: 20,
      focus: "트래핑 · 방향 전환",
      summary: "받는 즉시 원하는 방향으로 볼을 놓는 퍼스트 터치를 만듭니다.",
      steps: [
        { title: "벽 패스 트래핑", detail: "벽에 패스 후 인사이드로 방향을 바꿔 받기 20회." },
        { title: "쿠셔닝", detail: "떨어지는 볼을 발등/허벅지/가슴으로 부드럽게 죽이기." },
        { title: "터치 후 스프린트", detail: "퍼스트 터치를 앞공간으로 밀고 3m 스프린트." },
      ],
      tips: ["볼이 닿는 순간 발에 힘을 빼 충격을 흡수하세요.", "받기 전 어깨너머로 주변을 먼저 확인합니다."],
    },
    {
      id: "passing-move",
      title: "패스 & 무브",
      level: "입문",
      durationMin: 25,
      focus: "정확도 · 오프더볼",
      summary: "패스 후 곧바로 움직이는 pass-and-move 습관을 몸에 익힙니다.",
      steps: [
        { title: "인사이드 패스", detail: "10m 간격 파트너와 정확한 지면 패스 30회." },
        { title: "월 패스(2대1)", detail: "벽/파트너를 이용한 원투 패스로 수비 통과." },
        { title: "삼각 패스", detail: "세 명이 삼각형을 이뤄 패스 후 자리 이동을 반복." },
      ],
      tips: ["디딤발은 볼 옆, 발끝은 목표 방향을 향하게.", "패스한 곳에 서 있지 말고 즉시 다음 공간으로 이동하세요."],
    },
    {
      id: "dribbling-cones",
      title: "드리블 & 콘 워크",
      level: "중급",
      durationMin: 20,
      focus: "볼 다루기 · 민첩성",
      summary: "좁은 간격의 콘을 빠르게 통과하며 볼 터치 빈도를 높입니다.",
      steps: [
        { title: "지그재그 드리블", detail: "1m 간격 콘 6개를 인/아웃사이드로 통과 × 5회." },
        { title: "속도 변화", detail: "콘 사이에서 감속→가속을 반복해 리듬 파괴." },
        { title: "1대1 돌파", detail: "수비 콘을 놓고 페인트 후 폭발적 돌파." },
      ],
      tips: ["짧고 잦은 터치로 볼을 몸 가까이 두세요.", "고개를 들어 다음 콘과 상황을 미리 봅니다."],
    },
    {
      id: "finishing",
      title: "슈팅 & 마무리",
      level: "중급",
      durationMin: 30,
      focus: "결정력 · 코스",
      summary: "다양한 상황에서 골로 마무리하는 결정력을 훈련합니다.",
      steps: [
        { title: "세트 슈팅", detail: "페널티 아크에서 인스텝 슛, 좌/우 코너 각 10회." },
        { title: "원터치 마무리", detail: "크로스/컷백을 받아 원터치로 마무리 15회." },
        { title: "1대1 vs 키퍼", detail: "돌파 후 키퍼와의 1대1 침착하게 마무리 8회." },
      ],
      tips: ["디딤발을 볼 옆에 확실히 고정하고 상체를 덮으세요.", "파워보다 코스가 먼저입니다. 키퍼 반대쪽을 노리세요."],
    },
    {
      id: "defending",
      title: "수비 포지셔닝",
      level: "고급",
      durationMin: 25,
      focus: "예측 · 태클 타이밍",
      summary: "무리한 태클 대신 각도와 타이밍으로 볼을 끊어냅니다.",
      steps: [
        { title: "지연 수비", detail: "달려들지 않고 옆걸음으로 공격수의 전진을 지연." },
        { title: "각도 차단", detail: "몸의 방향으로 패스 길을 막고 한쪽으로 몰기." },
        { title: "인터셉트", detail: "패스 순간을 예측해 앞서 나가 볼 차단 훈련." },
      ],
      tips: ["볼이 아니라 상대의 디딤발을 보고 타이밍을 잡으세요.", "무게중심을 낮추고 절대 다리를 벌린 채 서지 마세요."],
    },
  ],
};

// -----------------------------------------------------------------------------
// 🏊 수영 — 시간 · 거리 측정
// -----------------------------------------------------------------------------
const swimming: SportDef = {
  id: "swimming",
  name: "수영",
  emoji: "🏊",
  gradient: "from-cyan-500 to-blue-600",
  accent: "#0891b2",
  accentText: "#0e7490",
  tagline: "영법·거리별 랩 타임을 측정하고 기록으로 남기세요",
  features: ["measure"],
  metrics: [
    { key: "freestyle_50m", name: "자유형 50m", capture: ["time"], distanceM: 50 },
    { key: "freestyle_100m", name: "자유형 100m", capture: ["time"], distanceM: 100 },
    { key: "backstroke_50m", name: "배영 50m", capture: ["time"], distanceM: 50 },
    { key: "breaststroke_50m", name: "평영 50m", capture: ["time"], distanceM: 50 },
    { key: "butterfly_50m", name: "접영 50m", capture: ["time"], distanceM: 50 },
    { key: "custom", name: "직접 입력 (거리 선택)", capture: ["time", "distance"] },
  ],
};

// -----------------------------------------------------------------------------
// 🏃 육상 — 스타 루틴만 제공 (가이드·기록 측정 예정)
// -----------------------------------------------------------------------------
const track: SportDef = {
  id: "track",
  name: "육상",
  emoji: "🏃",
  gradient: "from-orange-500 to-amber-600",
  accent: "#ea580c",
  accentText: "#c2410c",
  tagline: "세계 최고 스프린터들의 훈련법을 만나보세요",
  features: [],
};

// -----------------------------------------------------------------------------
// 🏀 농구 — 스타 루틴만 제공 (가이드·기록 측정 예정)
// -----------------------------------------------------------------------------
const basketball: SportDef = {
  id: "basketball",
  name: "농구",
  emoji: "🏀",
  gradient: "from-red-500 to-rose-600",
  accent: "#dc2626",
  accentText: "#b91c1c",
  tagline: "세계적인 농구 선수들의 훈련법을 만나보세요",
  features: [],
};

// -----------------------------------------------------------------------------

export const SPORTS: Record<string, SportDef> = {
  lacrosse,
  soccer,
  swimming,
  track,
  basketball,
};

export const SPORT_LIST: SportDef[] = Object.values(SPORTS);

export function getSport(id: string): SportDef | undefined {
  return SPORTS[id];
}

export function getMetric(sportId: string, metricKey: string): Metric | undefined {
  return getSport(sportId)?.metrics?.find((m) => m.key === metricKey);
}

export function getGuide(sportId: string, guideId: string): Guide | undefined {
  return getSport(sportId)?.guides?.find((g) => g.id === guideId);
}

export interface GuideSearchHit extends Guide {
  sportId: string;
  sportName: string;
}

/** Full-text search across every sport's step-by-step guides. */
export function searchGuides(query: string, limit = 6): GuideSearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const hits: GuideSearchHit[] = [];
  for (const sport of SPORT_LIST) {
    for (const g of sport.guides ?? []) {
      const hay = [
        g.title,
        g.summary,
        g.focus,
        g.level,
        ...g.steps.flatMap((s) => [s.title, s.detail]),
        ...g.tips,
      ]
        .join(" ")
        .toLowerCase();
      if (hay.includes(q)) hits.push({ ...g, sportId: sport.id, sportName: sport.name });
    }
  }
  return hits.slice(0, limit);
}
