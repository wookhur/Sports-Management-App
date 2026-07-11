// Original soccer drill library with age-band tagging and diagram specs.
// Diagrams are described declaratively and drawn by <DrillDiagram/>.

export interface Point {
  x: number;
  y: number;
}
export interface DiagramPlayer extends Point {
  team?: "a" | "b" | "n"; // a = attacking (blue), b = defending (red), n = neutral (grey)
  label?: string;
}
export interface DiagramArrow {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  type: "pass" | "run" | "dribble";
}
export interface DiagramSpec {
  cones?: Point[];
  players?: DiagramPlayer[];
  ball?: Point;
  goals?: Point[];
  arrows?: DiagramArrow[];
}

export interface Drill {
  id: string;
  title: string;
  ageLevels: string[]; // keys from AGE_LEVELS
  category: string;
  durationMin: number;
  players: string;
  summary: string;
  steps: string[];
  coaching: string[];
  diagram: DiagramSpec;
}

export const AGE_LEVELS = [
  { key: "u6-8", label: "만 6-8세", note: "재미 · 기본기" },
  { key: "u9-11", label: "만 9-11세", note: "기술 · 협응" },
  { key: "u12+", label: "만 12세+", note: "전술 · 스피드" },
] as const;

export const DRILLS: Drill[] = [
  {
    id: "dribble-gates",
    title: "드리블 게이트",
    ageLevels: ["u6-8", "u9-11"],
    category: "드리블",
    durationMin: 10,
    players: "개인 · 콘 게이트 4~6개",
    summary: "곳곳에 세운 콘 게이트를 최대한 많이 통과하며 볼 컨트롤과 시야를 기릅니다.",
    steps: [
      "필드 여기저기에 콘 두 개로 만든 '게이트'를 여러 개 세웁니다.",
      "제한 시간 안에 서로 다른 게이트를 최대한 많이 드리블로 통과합니다.",
      "같은 게이트를 연속으로 통과할 수 없습니다 — 고개를 들어 다음 게이트를 찾습니다.",
    ],
    coaching: ["짧고 잦은 터치로 볼을 몸 가까이 두세요.", "볼이 아니라 다음 게이트를 보며 이동합니다."],
    diagram: {
      cones: [
        { x: 20, y: 16 }, { x: 26, y: 16 },
        { x: 60, y: 12 }, { x: 66, y: 12 },
        { x: 40, y: 38 }, { x: 46, y: 38 },
        { x: 74, y: 44 }, { x: 80, y: 44 },
      ],
      players: [{ x: 14, y: 50, team: "a", label: "1" }],
      ball: { x: 17, y: 50 },
      arrows: [
        { x1: 17, y1: 49, x2: 23, y2: 18, type: "dribble" },
        { x1: 23, y1: 18, x2: 43, y2: 37, type: "dribble" },
        { x1: 43, y1: 37, x2: 63, y2: 13, type: "dribble" },
      ],
    },
  },
  {
    id: "zigzag-slalom",
    title: "지그재그 슬라럼",
    ageLevels: ["u6-8"],
    category: "드리블",
    durationMin: 8,
    players: "개인 · 콘 6개 일렬",
    summary: "일렬로 세운 콘 사이를 지그재그로 빠르게 통과하며 인·아웃사이드 터치를 익힙니다.",
    steps: [
      "1~1.5m 간격으로 콘 6개를 일렬로 세웁니다.",
      "인사이드·아웃사이드를 번갈아 사용해 콘 사이를 통과합니다.",
      "끝까지 가면 반대 발로 돌아옵니다.",
    ],
    coaching: ["콘을 넘어뜨리지 않도록 볼을 작게 다룹니다.", "속도보다 정확한 터치를 먼저 익히세요."],
    diagram: {
      cones: [
        { x: 20, y: 32 }, { x: 32, y: 32 }, { x: 44, y: 32 },
        { x: 56, y: 32 }, { x: 68, y: 32 }, { x: 80, y: 32 },
      ],
      players: [{ x: 12, y: 32, team: "a", label: "1" }],
      ball: { x: 15, y: 32 },
      arrows: [
        { x1: 15, y1: 32, x2: 26, y2: 24, type: "dribble" },
        { x1: 26, y1: 24, x2: 38, y2: 40, type: "dribble" },
        { x1: 38, y1: 40, x2: 50, y2: 24, type: "dribble" },
        { x1: 50, y1: 24, x2: 62, y2: 40, type: "dribble" },
        { x1: 62, y1: 40, x2: 74, y2: 24, type: "dribble" },
        { x1: 74, y1: 24, x2: 86, y2: 32, type: "dribble" },
      ],
    },
  },
  {
    id: "triangle-passing",
    title: "삼각 패스 & 이동",
    ageLevels: ["u6-8", "u9-11"],
    category: "패스",
    durationMin: 12,
    players: "3명 · 삼각형",
    summary: "삼각형 대형에서 패스한 뒤 그 방향으로 이동하는 pass-and-move의 기본을 익힙니다.",
    steps: [
      "세 명이 한 변 8~10m의 삼각형을 이룹니다.",
      "인사이드로 정확히 패스한 뒤, 패스한 방향으로 뛰어 자리를 바꿉니다.",
      "한 방향으로 익숙해지면 반대 방향으로도 진행합니다.",
    ],
    coaching: ["디딤발은 볼 옆, 발끝은 목표 방향을 향하게.", "패스 후 멈추지 말고 즉시 이동하세요."],
    diagram: {
      players: [
        { x: 25, y: 48, team: "a", label: "1" },
        { x: 50, y: 14, team: "a", label: "2" },
        { x: 75, y: 48, team: "a", label: "3" },
      ],
      ball: { x: 28, y: 46 },
      arrows: [
        { x1: 28, y1: 46, x2: 48, y2: 16, type: "pass" },
        { x1: 27, y1: 47, x2: 46, y2: 18, type: "run" },
        { x1: 52, y1: 16, x2: 72, y2: 46, type: "pass" },
      ],
    },
  },
  {
    id: "rondo-4v1",
    title: "4대1 론도",
    ageLevels: ["u9-11", "u12+"],
    category: "포제션",
    durationMin: 12,
    players: "5명 · 사각형",
    summary: "가운데 수비수 한 명을 두고 네 명이 빠른 원터치 패스로 소유권을 지킵니다.",
    steps: [
      "한 변 8~10m의 사각형 네 꼭짓점에 공격수 4명이 섭니다.",
      "가운데 수비수 1명이 볼을 뺏으려 합니다.",
      "공격수는 원·투 터치로 패스를 돌리고, 볼을 뺏기거나 8회 성공하면 수비수를 교대합니다.",
    ],
    coaching: ["패스 전에 다음 받을 곳을 미리 보세요(스캔).", "수비수 발이 닿지 않는 각도로 패스 길을 엽니다."],
    diagram: {
      players: [
        { x: 22, y: 14, team: "a", label: "1" },
        { x: 78, y: 14, team: "a", label: "2" },
        { x: 78, y: 50, team: "a", label: "3" },
        { x: 22, y: 50, team: "a", label: "4" },
        { x: 50, y: 32, team: "b", label: "D" },
      ],
      ball: { x: 25, y: 16 },
      arrows: [
        { x1: 25, y1: 16, x2: 75, y2: 14, type: "pass" },
        { x1: 78, y1: 18, x2: 78, y2: 46, type: "pass" },
      ],
    },
  },
  {
    id: "1v1-to-goal",
    title: "1대1 마무리",
    ageLevels: ["u9-11", "u12+"],
    category: "1대1 · 슈팅",
    durationMin: 15,
    players: "2명 + GK",
    summary: "공격수가 수비수를 제치고 골키퍼와의 1대1까지 침착하게 마무리합니다.",
    steps: [
      "공격수는 하프라인에서 볼을 잡고 출발합니다.",
      "수비수는 지연하며 한쪽으로 몰고, 공격수는 페인트로 돌파합니다.",
      "돌파 후 골키퍼의 반대쪽 코너를 노려 마무리합니다.",
    ],
    coaching: ["첫 스텝의 폭발력이 돌파 성공률을 좌우합니다.", "파워보다 코스 — 키퍼 반대쪽을 먼저 노리세요."],
    diagram: {
      goals: [{ x: 92, y: 32 }],
      players: [
        { x: 18, y: 40, team: "a", label: "A" },
        { x: 60, y: 34, team: "b", label: "D" },
        { x: 88, y: 32, team: "n", label: "GK" },
      ],
      ball: { x: 21, y: 40 },
      arrows: [
        { x1: 21, y1: 40, x2: 55, y2: 30, type: "dribble" },
        { x1: 60, y1: 34, x2: 66, y2: 30, type: "run" },
        { x1: 66, y1: 26, x2: 89, y2: 36, type: "pass" },
      ],
    },
  },
  {
    id: "shooting-circuit",
    title: "슈팅 서킷",
    ageLevels: ["u12+"],
    category: "슈팅",
    durationMin: 15,
    players: "2명 + GK",
    summary: "패스를 받아 원터치로 방향을 잡고 즉시 슈팅으로 연결하는 마무리 훈련입니다.",
    steps: [
      "서포터가 페널티 아크 근처에서 공격수에게 볼을 내줍니다.",
      "공격수는 퍼스트 터치로 슈팅 각을 만든 뒤 강하게 슛합니다.",
      "좌·우 코너를 번갈아 노리며 10회 반복합니다.",
    ],
    coaching: ["디딤발을 볼 옆에 확실히 고정하고 상체를 덮으세요.", "퍼스트 터치를 슈팅 각으로 밀어 두면 템포가 빨라집니다."],
    diagram: {
      goals: [{ x: 92, y: 32 }],
      players: [
        { x: 45, y: 46, team: "a", label: "S" },
        { x: 66, y: 30, team: "a", label: "A" },
        { x: 88, y: 32, team: "n", label: "GK" },
      ],
      ball: { x: 48, y: 46 },
      arrows: [
        { x1: 48, y1: 46, x2: 64, y2: 32, type: "pass" },
        { x1: 68, y1: 29, x2: 89, y2: 27, type: "run" },
      ],
    },
  },
  {
    id: "2v2-transition",
    title: "2대2 트랜지션",
    ageLevels: ["u12+"],
    category: "전환 · 게임",
    durationMin: 18,
    players: "4명 + 미니골 2개",
    summary: "좁은 공간에서 2대2로 공수 전환을 반복하며 빠른 판단과 지원 움직임을 훈련합니다.",
    steps: [
      "20x15m 그리드 양 끝에 미니골을 둡니다.",
      "2대2로 경기하되, 볼을 뺏으면 즉시 반대 골을 공격합니다.",
      "득점 또는 아웃되면 코치가 새 볼을 투입해 계속 이어갑니다.",
    ],
    coaching: ["볼을 뺏는 순간 1~2초 안에 역습을 시작하세요.", "볼 없는 선수는 항상 패스 각을 만들어 지원합니다."],
    diagram: {
      goals: [{ x: 8, y: 32 }, { x: 92, y: 32 }],
      players: [
        { x: 35, y: 22, team: "a", label: "1" },
        { x: 30, y: 44, team: "a", label: "2" },
        { x: 62, y: 20, team: "b", label: "1" },
        { x: 66, y: 44, team: "b", label: "2" },
      ],
      ball: { x: 33, y: 24 },
      arrows: [
        { x1: 33, y1: 24, x2: 30, y2: 42, type: "pass" },
        { x1: 30, y1: 44, x2: 12, y2: 34, type: "run" },
      ],
    },
  },
];

export function drillsForAge(ageKey?: string): Drill[] {
  if (!ageKey) return DRILLS;
  return DRILLS.filter((d) => d.ageLevels.includes(ageKey));
}

export function getDrill(id: string): Drill | undefined {
  return DRILLS.find((d) => d.id === id);
}

export function searchDrills(query: string, limit = 6): Drill[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return DRILLS.filter((d) =>
    [d.title, d.category, d.summary, ...d.ageLevels.map(ageLabel)].join(" ").toLowerCase().includes(q)
  ).slice(0, limit);
}

export function ageLabel(key: string): string {
  return AGE_LEVELS.find((a) => a.key === key)?.label ?? key;
}
