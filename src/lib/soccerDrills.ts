// Original soccer drill library with age-band tagging and diagram specs.
// Diagrams are described declaratively and drawn by <DrillDiagram/>.
//
// Authored copy carries its translations inline (see src/lib/localized.ts).

import { L, searchText, type Localized } from "./localized";
import type { Lang } from "./i18n";

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
  title: Localized;
  ageLevels: string[]; // keys from AGE_LEVELS
  category: Localized;
  durationMin: number;
  players: Localized;
  summary: Localized;
  steps: Localized[];
  coaching: Localized[];
  diagram: DiagramSpec;
}

export const AGE_LEVELS = [
  { key: "u6-8", label: { ko: "만 6-8세", en: "Ages 6–8", es: "6–8 años" }, note: { ko: "재미 · 기본기", en: "Fun · fundamentals", es: "Diversión · fundamentos" } },
  { key: "u9-11", label: { ko: "만 9-11세", en: "Ages 9–11", es: "9–11 años" }, note: { ko: "기술 · 협응", en: "Technique · coordination", es: "Técnica · coordinación" } },
  { key: "u12+", label: { ko: "만 12세+", en: "Ages 12+", es: "12+ años" }, note: { ko: "전술 · 스피드", en: "Tactics · speed", es: "Táctica · velocidad" } },
] as const;

export const DRILLS: Drill[] = [
  {
    id: "dribble-gates",
    title: { ko: "드리블 게이트", en: "Dribble gates", es: "Puertas de regate" },
    ageLevels: ["u6-8", "u9-11"],
    category: { ko: "드리블", en: "Dribbling", es: "Regate" },
    durationMin: 10,
    players: { ko: "개인 · 콘 게이트 4~6개", en: "Solo · 4–6 cone gates", es: "Individual · 4–6 puertas de conos" },
    summary: { ko: "곳곳에 세운 콘 게이트를 최대한 많이 통과하며 볼 컨트롤과 시야를 기릅니다.", en: "Dribble through as many scattered cone gates as possible to build close control and vision.", es: "Regatea por tantas puertas de conos como puedas para mejorar el control y la visión." },
    steps: [
      { ko: "필드 여기저기에 콘 두 개로 만든 '게이트'를 여러 개 세웁니다.", en: "Scatter several two-cone 'gates' around the area.", es: "Reparte varias 'puertas' de dos conos por el área." },
      { ko: "제한 시간 안에 서로 다른 게이트를 최대한 많이 드리블로 통과합니다.", en: "Dribble through as many different gates as you can inside the time limit.", es: "Regatea por tantas puertas distintas como puedas dentro del tiempo límite." },
      { ko: "같은 게이트를 연속으로 통과할 수 없습니다 — 고개를 들어 다음 게이트를 찾습니다.", en: "You may not use the same gate twice in a row — look up and find the next one.", es: "No puedes repetir la misma puerta dos veces seguidas: levanta la cabeza y busca la siguiente." },
    ],
    coaching: [{ ko: "짧고 잦은 터치로 볼을 몸 가까이 두세요.", en: "Short, frequent touches keep the ball close.", es: "Toques cortos y frecuentes mantienen el balón cerca." }, { ko: "볼이 아니라 다음 게이트를 보며 이동합니다.", en: "Look at the next gate, not at the ball.", es: "Mira la siguiente puerta, no el balón." }],
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
    title: { ko: "지그재그 슬라럼", en: "Zig-zag slalom", es: "Eslalon en zigzag" },
    ageLevels: ["u6-8"],
    category: { ko: "드리블", en: "Dribbling", es: "Regate" },
    durationMin: 8,
    players: { ko: "개인 · 콘 6개 일렬", en: "Solo · 6 cones in a line", es: "Individual · 6 conos en línea" },
    summary: { ko: "일렬로 세운 콘 사이를 지그재그로 빠르게 통과하며 인·아웃사이드 터치를 익힙니다.", en: "Weave quickly through a line of cones, alternating inside and outside touches.", es: "Zigzaguea rápido entre una fila de conos alternando toques con interior y exterior." },
    steps: [
      { ko: "1~1.5m 간격으로 콘 6개를 일렬로 세웁니다.", en: "Set six cones in a line, 1–1.5 m apart.", es: "Coloca seis conos en línea, separados 1–1,5 m." },
      { ko: "인사이드·아웃사이드를 번갈아 사용해 콘 사이를 통과합니다.", en: "Weave through the cones alternating inside and outside of the foot.", es: "Pasa entre los conos alternando interior y exterior del pie." },
      { ko: "끝까지 가면 반대 발로 돌아옵니다.", en: "At the end of the line, come back using the other foot.", es: "Al final de la fila, vuelve usando el otro pie." },
    ],
    coaching: [{ ko: "콘을 넘어뜨리지 않도록 볼을 작게 다룹니다.", en: "Keep the touches small so you don't knock the cones over.", es: "Haz toques pequeños para no derribar los conos." }, { ko: "속도보다 정확한 터치를 먼저 익히세요.", en: "Get the touch right before you add speed.", es: "Domina el toque antes de añadir velocidad." }],
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
    title: { ko: "삼각 패스 & 이동", en: "Triangle pass & move", es: "Pase y desmarque en triángulo" },
    ageLevels: ["u6-8", "u9-11"],
    category: { ko: "패스", en: "Passing", es: "Pase" },
    durationMin: 12,
    players: { ko: "3명 · 삼각형", en: "3 players · triangle", es: "3 jugadores · triángulo" },
    summary: { ko: "삼각형 대형에서 패스한 뒤 그 방향으로 이동하는 pass-and-move의 기본을 익힙니다.", en: "Learn the basics of pass-and-move: pass, then follow your pass around a triangle.", es: "Aprende la base del pase y desmarque: pasa y sigue tu pase alrededor del triángulo." },
    steps: [
      { ko: "세 명이 한 변 8~10m의 삼각형을 이룹니다.", en: "Three players form a triangle with 8–10 m sides.", es: "Tres jugadores forman un triángulo de 8–10 m de lado." },
      { ko: "인사이드로 정확히 패스한 뒤, 패스한 방향으로 뛰어 자리를 바꿉니다.", en: "Pass accurately with the inside of the foot, then run to the position you passed to.", es: "Pasa con precisión con el interior y corre hacia la posición a la que pasaste." },
      { ko: "한 방향으로 익숙해지면 반대 방향으로도 진행합니다.", en: "Once one direction feels comfortable, run it the other way.", es: "Cuando domines un sentido, hazlo en el contrario." },
    ],
    coaching: [{ ko: "디딤발은 볼 옆, 발끝은 목표 방향을 향하게.", en: "Plant foot beside the ball, toes pointing where the pass is going.", es: "Pie de apoyo junto al balón, punta apuntando adonde va el pase." }, { ko: "패스 후 멈추지 말고 즉시 이동하세요.", en: "Don't stop after the pass — move immediately.", es: "No te pares tras el pase: muévete de inmediato." }],
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
    title: { ko: "4대1 론도", en: "4v1 rondo", es: "Rondo 4 contra 1" },
    ageLevels: ["u9-11", "u12+"],
    category: { ko: "포제션", en: "Possession", es: "Posesión" },
    durationMin: 12,
    players: { ko: "5명 · 사각형", en: "5 players · square", es: "5 jugadores · cuadrado" },
    summary: { ko: "가운데 수비수 한 명을 두고 네 명이 빠른 원터치 패스로 소유권을 지킵니다.", en: "Four players keep the ball from one defender in the middle with quick one-touch passing.", es: "Cuatro jugadores conservan el balón ante un defensor central con pases rápidos a un toque." },
    steps: [
      { ko: "한 변 8~10m의 사각형 네 꼭짓점에 공격수 4명이 섭니다.", en: "Four attackers stand on the corners of a square with 8–10 m sides.", es: "Cuatro atacantes se colocan en las esquinas de un cuadrado de 8–10 m de lado." },
      { ko: "가운데 수비수 1명이 볼을 뺏으려 합니다.", en: "One defender in the middle tries to win the ball.", es: "Un defensor en el centro intenta robar el balón." },
      { ko: "공격수는 원·투 터치로 패스를 돌리고, 볼을 뺏기거나 8회 성공하면 수비수를 교대합니다.", en: "Attackers circulate the ball in one or two touches; swap the defender after a turnover or 8 completed passes.", es: "Los atacantes circulan el balón a uno o dos toques; cambia el defensor tras una pérdida u 8 pases completados." },
    ],
    coaching: [{ ko: "패스 전에 다음 받을 곳을 미리 보세요(스캔).", en: "Scan for your next option before the ball arrives.", es: "Escanea tu siguiente opción antes de que llegue el balón." }, { ko: "수비수 발이 닿지 않는 각도로 패스 길을 엽니다.", en: "Open a passing angle the defender can't reach.", es: "Abre un ángulo de pase fuera del alcance del defensor." }],
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
    title: { ko: "1대1 마무리", en: "1v1 to goal", es: "1 contra 1 a portería" },
    ageLevels: ["u9-11", "u12+"],
    category: { ko: "1대1 · 슈팅", en: "1v1 · finishing", es: "1 contra 1 · definición" },
    durationMin: 15,
    players: { ko: "2명 + GK", en: "2 players + GK", es: "2 jugadores + portero" },
    summary: { ko: "공격수가 수비수를 제치고 골키퍼와의 1대1까지 침착하게 마무리합니다.", en: "The attacker beats a defender and finishes calmly one-on-one with the keeper.", es: "El atacante supera a un defensor y define con calma en el mano a mano." },
    steps: [
      { ko: "공격수는 하프라인에서 볼을 잡고 출발합니다.", en: "The attacker starts on the ball at the halfway line.", es: "El atacante arranca con el balón desde el medio campo." },
      { ko: "수비수는 지연하며 한쪽으로 몰고, 공격수는 페인트로 돌파합니다.", en: "The defender delays and shows them one way; the attacker beats them with a feint.", es: "El defensor retrasa y le orienta a un lado; el atacante le supera con una finta." },
      { ko: "돌파 후 골키퍼의 반대쪽 코너를 노려 마무리합니다.", en: "After beating the defender, finish into the corner away from the keeper.", es: "Tras superarle, define al palo contrario al portero." },
    ],
    coaching: [{ ko: "첫 스텝의 폭발력이 돌파 성공률을 좌우합니다.", en: "An explosive first step decides whether the move works.", es: "Un primer paso explosivo decide si el regate funciona." }, { ko: "파워보다 코스 — 키퍼 반대쪽을 먼저 노리세요.", en: "Placement over power — aim away from the keeper first.", es: "Colocación antes que potencia: apunta lejos del portero." }],
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
    title: { ko: "슈팅 서킷", en: "Shooting circuit", es: "Circuito de tiro" },
    ageLevels: ["u12+"],
    category: { ko: "슈팅", en: "Shooting", es: "Tiro" },
    durationMin: 15,
    players: { ko: "2명 + GK", en: "2 players + GK", es: "2 jugadores + portero" },
    summary: { ko: "패스를 받아 원터치로 방향을 잡고 즉시 슈팅으로 연결하는 마무리 훈련입니다.", en: "Receive, open the body with one touch and shoot straight away.", es: "Recibe, orienta el cuerpo con un toque y dispara de inmediato." },
    steps: [
      { ko: "서포터가 페널티 아크 근처에서 공격수에게 볼을 내줍니다.", en: "A server feeds the striker near the edge of the box.", es: "Un asistente sirve al delantero cerca de la frontal del área." },
      { ko: "공격수는 퍼스트 터치로 슈팅 각을 만든 뒤 강하게 슛합니다.", en: "The striker takes a first touch into a shooting angle, then strikes firmly.", es: "El delantero orienta el primer toque hacia el ángulo de tiro y golpea con firmeza." },
      { ko: "좌·우 코너를 번갈아 노리며 10회 반복합니다.", en: "Alternate near and far corners for 10 repetitions.", es: "Alterna palo corto y palo largo durante 10 repeticiones." },
    ],
    coaching: [{ ko: "디딤발을 볼 옆에 확실히 고정하고 상체를 덮으세요.", en: "Plant firmly beside the ball and get your chest over it.", es: "Apoya con firmeza junto al balón y lleva el pecho por encima." }, { ko: "퍼스트 터치를 슈팅 각으로 밀어 두면 템포가 빨라집니다.", en: "Pushing the first touch into the shooting angle speeds the whole action up.", es: "Empujar el primer toque hacia el ángulo de tiro acelera toda la acción." }],
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
    title: { ko: "2대2 트랜지션", en: "2v2 transition", es: "Transición 2 contra 2" },
    ageLevels: ["u12+"],
    category: { ko: "전환 · 게임", en: "Transition · game", es: "Transición · juego" },
    durationMin: 18,
    players: { ko: "4명 + 미니골 2개", en: "4 players + 2 mini goals", es: "4 jugadores + 2 minporterías" },
    summary: { ko: "좁은 공간에서 2대2로 공수 전환을 반복하며 빠른 판단과 지원 움직임을 훈련합니다.", en: "Repeated 2v2 transitions in a tight space train quick decisions and supporting runs.", es: "Transiciones 2 contra 2 repetidas en espacio reducido entrenan decisión rápida y apoyos." },
    steps: [
      { ko: "20x15m 그리드 양 끝에 미니골을 둡니다.", en: "Put a mini goal at each end of a 20×15 m grid.", es: "Coloca una minportería en cada extremo de una zona de 20×15 m." },
      { ko: "2대2로 경기하되, 볼을 뺏으면 즉시 반대 골을 공격합니다.", en: "Play 2v2; the moment you win the ball, attack the opposite goal.", es: "Juega 2 contra 2; en cuanto robes, ataca la portería contraria." },
      { ko: "득점 또는 아웃되면 코치가 새 볼을 투입해 계속 이어갑니다.", en: "After a goal or when the ball goes out, the coach serves a new ball to keep it flowing.", es: "Tras gol o salida del balón, el entrenador sirve otro para mantener el ritmo." },
    ],
    coaching: [{ ko: "볼을 뺏는 순간 1~2초 안에 역습을 시작하세요.", en: "Start the counter within one or two seconds of winning it.", es: "Inicia el contraataque en uno o dos segundos tras robar." }, { ko: "볼 없는 선수는 항상 패스 각을 만들어 지원합니다.", en: "The player off the ball always offers a passing angle.", es: "El jugador sin balón siempre ofrece un ángulo de pase." }],
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

/**
 * Searches across all three languages rather than the active one: someone
 * browsing in Spanish still finds a drill by its English name, and the index
 * doesn't change meaning when they switch the language switcher.
 */
export function searchDrills(query: string, limit = 6): Drill[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return DRILLS.filter((d) =>
    [d.title, d.category, d.summary, ...d.ageLevels.map((k) => ageLabelOf(k))]
      .map(searchText)
      .join(" ")
      .toLowerCase()
      .includes(q),
  ).slice(0, limit);
}

/** The raw (still localizable) label for an age key. */
export function ageLabelOf(key: string): Localized {
  return AGE_LEVELS.find((a) => a.key === key)?.label ?? key;
}

export function ageLabel(key: string, lang: Lang): string {
  return L(ageLabelOf(key), lang);
}
