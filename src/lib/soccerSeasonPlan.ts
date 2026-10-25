// A full school-year soccer plan, August to June: ten units, one objective a
// week, three sessions a week.
//
// Transcribed from a school PE department's coach log ("bitácora", sheet
// "Programa mensual y diario de entrenamientos"), which is written in Spanish;
// Spanish is the source here and English and Korean are translations. Weeks
// that repeat an objective, and the April week that returns to individual
// defending, are as the source has them.
//
// The source dates are the 2025-26 calendar. A team loading the plan for
// another year gets the same weeks of the year: each date moves by whole weeks
// so that Mondays stay Mondays (see weeksFor).

import { L, type LocalizedText } from "./localized";
import type { Lang } from "./i18n";
import { addDays, mondayOf, parseDay } from "./season";

const SOURCE_YEAR = 2025;

export const UNITS = {
  familiarizacion: { es: "Familiarización y Perfiles", en: "Familiarization and body shape", ko: "적응과 몸 방향" },
  pase: { es: "Pase y Amplitud", en: "Passing and width", ko: "패스와 폭" },
  conservacion: { es: "Conservación del Balón", en: "Keeping the ball", ko: "볼 소유" },
  desmarque: { es: "Desmarque y Profundidad", en: "Movement and depth", ko: "침투와 깊이" },
  centros: { es: "Centros y Remates", en: "Crosses and finishing", ko: "크로스와 슈팅" },
  transAD: { es: "Transición Ataque-Defensa", en: "Attack-to-defense transition", ko: "공격→수비 전환" },
  defensa: { es: "Defensa Individual y Colectiva", en: "Individual and team defending", ko: "개인·조직 수비" },
  bloques: { es: "Bloques Defensivos y Achique", en: "Defensive blocks and squeezing", ko: "수비 블록과 라인 올리기" },
  transDA: { es: "Transición Defensa-Ataque", en: "Defense-to-attack transition", ko: "수비→공격 전환" },
  modelo: { es: "Modelo de Juego Total", en: "The complete game model", ko: "전체 게임 모델" },
} satisfies Record<string, LocalizedText>;

type UnitKey = keyof typeof UNITS;

const ASSESS = {
  initial: { es: "Evaluación y Diagnóstico Inicial", en: "Initial assessment", ko: "초기 평가·진단" },
  term1: { es: "Evaluación y Diagnóstico Primer Semestre", en: "First-term assessment", ko: "1학기 평가·진단" },
  term2: { es: "Evaluación y Diagnóstico Segundo Semestre", en: "Second-term assessment", ko: "2학기 평가·진단" },
} satisfies Record<string, LocalizedText>;

const O = {
  contacto: {
    es: "Superficies de contacto. Uso de borde interno, externo para control.",
    en: "Contact surfaces: using the inside and outside of the foot to control.",
    ko: "볼 터치 면: 발 안쪽·바깥쪽으로 컨트롤하기.",
  },
  conduccion: {
    es: "Conducción y visión periférica. Levantar la cabeza mientras se traslada el balón.",
    en: "Dribbling with peripheral vision: head up while carrying the ball.",
    ko: "드리블과 주변 시야: 공을 몰면서 고개 들기.",
  },
  perfilado: {
    es: "Perfilado corporal. Recibir con la pierna alejada para dar continuidad al juego.",
    en: "Body shape: receive on the far foot to keep play moving.",
    ko: "몸 방향: 먼 발로 받아 플레이를 이어가기.",
  },
  desequilibrio: {
    es: "Capacidad de desequilibrio individual 1vs1.",
    en: "Beating a player one against one.",
    ko: "1대1 돌파 능력.",
  },
  paseCorto: {
    es: "Técnica de pase corto y media distancia. Tensión del balón.",
    en: "Short and medium passing technique: the weight of the pass.",
    ko: "짧은·중거리 패스 기술: 패스 세기.",
  },
  abrir: {
    es: "Concepto de \"abrir la cancha\". Posicionamiento de extremas y laterales.",
    en: "Making the pitch big: where wingers and full-backs stand.",
    ko: "경기장 넓게 쓰기: 윙어와 풀백의 위치.",
  },
  tercer: {
    es: "El \"tercer hombre\". Usar un apoyo intermedio para cambiar el sentido del ataque.",
    en: "The third player: using a link pass to switch the direction of attack.",
    ko: "세 번째 선수: 중간 연결로 공격 방향 바꾸기.",
  },
  basculacionOf: {
    es: "Basculación ofensiva. Mover el balón de lado a lado para encontrar espacios.",
    en: "Switching play: moving the ball side to side to find space.",
    ko: "공격 방향 전환: 좌우로 공을 돌려 공간 찾기.",
  },
  rondo: {
    es: "El Rondo clásico. Mantener la posesión en espacios muy reducidos.",
    en: "The classic rondo: keeping possession in very tight spaces.",
    ko: "클래식 론도: 아주 좁은 공간에서 볼 소유하기.",
  },
  proteccion: {
    es: "Protección de balón. Uso del cuerpo y brazo para alejar al defensor.",
    en: "Shielding the ball: using body and arm to hold off the defender.",
    ko: "볼 키핑: 몸과 팔로 수비수 막아내기.",
  },
  apoyo: {
    es: "Apoyo y comunicación. Ofrecer líneas de pase constantes a la poseedora.",
    en: "Support and communication: always offering a passing line to the player on the ball.",
    ko: "지원과 소통: 공 가진 선수에게 계속 패스 길 열어주기.",
  },
  presionAlta: {
    es: "Posesión bajo presión alta. Mantener la calma en zona de salida.",
    en: "Possession under a high press: staying calm when building out.",
    ko: "강한 압박 속 볼 소유: 빌드업 지역에서 침착하기.",
  },
  desmarques: {
    es: "Desmarques de apoyo vs. desmarques de ruptura (ir al espacio).",
    en: "Coming short to support vs. running in behind.",
    ko: "받으러 오는 움직임 vs 뒷공간 침투.",
  },
  temporizacion: {
    es: "Temporización del pase. Esperar el momento justo para filtrar el balón.",
    en: "Timing the pass: waiting for the right moment to play it through.",
    ko: "패스 타이밍: 스루패스를 넣을 순간 기다리기.",
  },
  paredes: {
    es: "Paredes y combinaciones rápidas en el último tercio.",
    en: "Wall passes and quick combinations in the final third.",
    ko: "파이널 서드에서 원투 패스와 빠른 콤비네이션.",
  },
  directo: {
    es: "Ataque directo. Transiciones rápidas tras superar la línea media.",
    en: "Direct attacking: quick transitions once past halfway.",
    ko: "직선적 공격: 하프라인을 넘으면 빠르게 전개.",
  },
  golpeo: {
    es: "Técnica de golpeo (empeine). Potencia vs. Colocación.",
    en: "Striking with the laces: power vs. placement.",
    ko: "발등 킥 기술: 파워 vs 정확도.",
  },
  centros: {
    es: "Centros desde la banda. Diferentes trayectorias (raso, tocado, fuerte). Remate de primera intención y técnica de cabeceo.",
    en: "Crosses from wide: low, lofted and driven deliveries; first-time finishing and heading.",
    ko: "측면 크로스: 낮게·띄워서·강하게. 원터치 슈팅과 헤딩.",
  },
  dosVsUno: {
    es: "Situaciones de 2vs1 en área penal. Toma de decisión frente al arco.",
    en: "Two against one in the box: decision-making in front of goal.",
    ko: "페널티 박스 2대1: 골문 앞 판단.",
  },
  reaccion: {
    es: "Reacción a la pérdida. El \"chip\" mental de dejar de atacar para defender.",
    en: "Reacting to losing the ball: switching from attacking to defending in your head.",
    ko: "볼 상실 후 반응: 공격에서 수비로 생각 전환.",
  },
  presionTras: {
    es: "Presión tras pérdida. Los primeros 5 segundos tras perder el balón.",
    en: "Counter-pressing: the first five seconds after losing the ball.",
    ko: "즉시 압박: 볼을 잃은 뒤 첫 5초.",
  },
  reorganizacion: {
    es: "Reorganización defensiva. Replegar si la presión inicial falla.",
    en: "Defensive reorganization: drop back if the first press fails.",
    ko: "수비 재정비: 첫 압박이 실패하면 물러서기.",
  },
  explosiva: {
    es: "Fuerza explosiva y frenado. Prevención de lesiones en cambios de ritmo.",
    en: "Explosive power and braking: preventing injuries when changing pace.",
    ko: "폭발적인 힘과 감속: 속도 변화 시 부상 예방.",
  },
  duelo: {
    es: "Duelo 1vs1 defensivo. Perfilado para orientar al rival a la banda.",
    en: "Defending one against one: body shape that shows the opponent wide.",
    ko: "1대1 수비: 몸 방향으로 상대를 측면으로 몰기.",
  },
  coberturas: {
    es: "Coberturas. Estar lista para ayudar si la compañera es superada.",
    en: "Cover: ready to help if a teammate is beaten.",
    ko: "커버: 동료가 뚫리면 도울 준비하기.",
  },
  permutas: {
    es: "Permutas. Intercambio de posiciones ante desajustes defensivos.",
    en: "Rotations: swapping positions when the defense is out of shape.",
    ko: "위치 교대: 수비가 흐트러지면 자리 바꾸기.",
  },
  agilidad: {
    es: "Agilidad defensiva. Movimientos laterales y retrocesos rápidos.",
    en: "Defensive agility: quick sideways and backward movement.",
    ko: "수비 민첩성: 빠른 좌우·후진 움직임.",
  },
  bloque: {
    es: "Bloque bajo y medio. Mantener las líneas juntas.",
    en: "Low and mid block: keeping the lines close together.",
    ko: "낮은·중간 블록: 라인 간격 좁게 유지하기.",
  },
  basculacionDef: {
    es: "Basculación defensiva colectiva siguiendo el movimiento del balón.",
    en: "The whole team shifting with the movement of the ball.",
    ko: "공의 움직임에 따라 팀 전체가 좌우로 이동하기.",
  },
  achique: {
    es: "El achique. Adelantar líneas para cerrar espacios entre líneas.",
    en: "Squeezing: pushing the lines up to close the space between them.",
    ko: "라인 올리기: 라인 사이 공간 좁히기.",
  },
  disciplina: {
    es: "Disciplina táctica. Mantener el orden bajo cansancio extremo.",
    en: "Tactical discipline: keeping shape when exhausted.",
    ko: "전술적 규율: 아주 지쳐도 대형 유지하기.",
  },
  seguridad: {
    es: "El pase de seguridad tras recuperar. Salir de la zona de presión.",
    en: "The safe pass after winning the ball: getting out of the pressure zone.",
    ko: "볼 탈취 후 안전한 패스: 압박 지역 벗어나기.",
  },
  contraataque: {
    es: "Contraataque veloz. Despliegue de extremos tras robo.",
    en: "Fast counter-attack: wingers break after a turnover.",
    ko: "빠른 역습: 볼 탈취 후 윙어 전개.",
  },
  resistencia: {
    es: "Resistencia a la velocidad. Capacidad anaeróbica para transitar.",
    en: "Speed endurance: the anaerobic capacity to transition.",
    ko: "스피드 지구력: 전환을 위한 무산소 능력.",
  },
  finalizacion: {
    es: "Finalización en transición. Llegar al arco rival en menos de 10 segundos.",
    en: "Finishing in transition: reaching the opponent's goal in under ten seconds.",
    ko: "전환 상황 마무리: 10초 안에 상대 골문까지.",
  },
  fija: {
    es: "Táctica fija ofensiva (Córners y tiros libres indirectos).",
    en: "Attacking set pieces: corners and indirect free kicks.",
    ko: "공격 세트피스: 코너킥과 간접 프리킥.",
  },
  modelo: {
    es: "Aplicación del modelo de juego completo.",
    en: "Putting the whole game model together.",
    ko: "전체 게임 모델 적용하기.",
  },
} satisfies Record<string, LocalizedText>;

type ObjKey = keyof typeof O;

// [Monday in the source calendar, unit, objective, assessment note]
const SOURCE: [string, UnitKey, ObjKey, keyof typeof ASSESS | null][] = [
  ["2025-09-01", "familiarizacion", "contacto", null],
  ["2025-09-08", "familiarizacion", "conduccion", "initial"],
  ["2025-09-15", "familiarizacion", "perfilado", null],
  ["2025-09-22", "familiarizacion", "desequilibrio", null],
  ["2025-09-29", "pase", "paseCorto", null],
  ["2025-10-06", "pase", "abrir", null],
  ["2025-10-13", "pase", "tercer", null],
  ["2025-10-20", "pase", "basculacionOf", null],
  ["2025-10-27", "conservacion", "rondo", null],
  ["2025-11-03", "conservacion", "proteccion", null],
  ["2025-11-10", "conservacion", "apoyo", null],
  ["2025-11-17", "conservacion", "presionAlta", null],
  ["2025-11-24", "desmarque", "desmarques", null],
  ["2025-12-01", "desmarque", "temporizacion", null],
  ["2025-12-08", "desmarque", "paredes", null],
  ["2025-12-15", "desmarque", "directo", null],
  ["2026-01-05", "centros", "golpeo", null],
  ["2026-01-12", "centros", "golpeo", null],
  ["2026-01-19", "centros", "centros", null],
  ["2026-01-26", "centros", "dosVsUno", "term1"],
  ["2026-02-02", "transAD", "reaccion", null],
  ["2026-02-09", "transAD", "presionTras", null],
  ["2026-02-16", "transAD", "reorganizacion", null],
  ["2026-02-23", "transAD", "explosiva", null],
  ["2026-03-02", "defensa", "duelo", null],
  ["2026-03-09", "defensa", "coberturas", null],
  ["2026-03-16", "defensa", "permutas", null],
  ["2026-03-23", "defensa", "agilidad", null],
  ["2026-03-30", "bloques", "bloque", null],
  ["2026-04-06", "defensa", "agilidad", null],
  ["2026-04-13", "bloques", "bloque", null],
  ["2026-04-20", "bloques", "basculacionDef", null],
  ["2026-04-27", "bloques", "achique", null],
  ["2026-05-04", "transDA", "disciplina", null],
  ["2026-05-11", "transDA", "seguridad", null],
  ["2026-05-18", "transDA", "contraataque", null],
  ["2026-05-25", "transDA", "resistencia", "term2"],
  ["2026-06-01", "transDA", "finalizacion", null],
  ["2026-06-08", "modelo", "fija", null],
  ["2026-06-15", "modelo", "modelo", null],
];

export interface PlanWeekSeed {
  weekStart: string;
  unit: string;
  objective: string;
  note: string | null;
}

/**
 * The Monday that anchors a school year: the one in the week of 1 September.
 * Moving the source plan to another year shifts every week by the gap between
 * the two anchors, which is always a whole number of weeks.
 */
function anchor(year: number): string {
  return mondayOf(`${year}-09-01`);
}

/** The plan for the school year starting in August of `year`, in one language. */
export function weeksFor(year: number, lang: Lang): PlanWeekSeed[] {
  const shift = Math.round((parseDay(anchor(year)).getTime() - parseDay(anchor(SOURCE_YEAR)).getTime()) / 86_400_000);
  return SOURCE.map(([day, unit, obj, note]) => ({
    weekStart: addDays(day, shift),
    unit: L(UNITS[unit], lang),
    objective: L(O[obj], lang),
    note: note ? L(ASSESS[note], lang) : null,
  }));
}

/** How each session is divided, in minutes. */
export const SESSION_PARTS: { minutes: number; title: LocalizedText; detail: LocalizedText }[] = [
  {
    minutes: 15,
    title: { es: "Activación", en: "Warm-up", ko: "준비운동" },
    detail: {
      es: "Calentamiento preventivo, juego lúdico o técnico.",
      en: "An injury-prevention warm-up, a fun game or technical work.",
      ko: "부상 예방 워밍업, 놀이형 게임이나 기술 훈련.",
    },
  },
  {
    minutes: 65,
    title: { es: "Parte principal", en: "Main part", ko: "본 훈련" },
    detail: {
      es: "Ejercicio analítico (técnica pura) y ejercicio global (situación de juego real / táctica).",
      en: "An analytical drill (pure technique), then a global exercise (a real game situation or tactics).",
      ko: "분석 훈련(순수 기술) 다음에 통합 훈련(실전 상황·전술).",
    },
  },
  {
    minutes: 10,
    title: { es: "Vuelta a la calma", en: "Cool-down", ko: "정리운동" },
    detail: {
      es: "Estiramientos, feedback y cierre psicológico.",
      en: "Stretching, feedback and a mental close to the session.",
      ko: "스트레칭, 피드백, 마무리 대화.",
    },
  },
];

/** Game-to-tactics balance by birth-year group. */
export const INTENSITY: { from: number; to: number; game: number }[] = [
  { from: 2019, to: 2020, game: 80 },
  { from: 2017, to: 2018, game: 60 },
  { from: 2013, to: 2016, game: 40 },
  { from: 2008, to: 2012, game: 20 },
];

export const FUNDAMENTALS_REMINDER: LocalizedText = {
  es: "Trabaja siempre fundamentos y principios básicos en cada sesión, sobre todo en categorías infantiles. La complejidad depende de la edad y del avance del grupo.",
  en: "Work on fundamentals and basic principles in every session, especially with the youngest groups. How complex to make it depends on age and how far the group has come.",
  ko: "매 훈련마다 기본기와 기본 원칙을 다루세요. 특히 어린 연령대에서 중요해요. 난이도는 나이와 팀의 진도에 맞춰 정하세요.",
};

/** Birth years named in a category like "2012-2013" or "Cat 2014", if any. */
export function categoryYears(category: string | null | undefined): number[] {
  return [...(category ?? "").matchAll(/\b(19|20)\d{2}\b/g)].map((m) => Number(m[0]));
}
