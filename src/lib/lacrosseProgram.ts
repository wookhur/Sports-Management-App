// Fay School Lacrosse — Elite Training Program.
// Structured from the coach-provided overview (sourced from USA Lacrosse,
// NCAA D1 programs, and the Premier Lacrosse League). Static reference content.
//
// Authored copy carries its translations inline (see src/lib/localized.ts).

import type { Localized } from "./localized";

export interface NamedItem {
  name: Localized;
  detail: Localized;
}
export interface Phase {
  title: Localized;
  time: Localized;
  items: NamedItem[];
  source?: Localized;
}
export interface PositionPlan {
  name: Localized;
  emoji: string;
  blocks: NamedItem[];
  source?: Localized;
}
export interface VideoLink {
  /** Video titles stay as published on YouTube, in English. */
  title: string;
  note: Localized;
  url: string;
}
export interface VideoGroup {
  group: Localized;
  videos: VideoLink[];
}

export const LAX_META = {
  title: { ko: "엘리트 훈련 프로그램", en: "Elite Training Program", es: "Programa de entrenamiento de élite" },
  subtitle: { ko: "USA Lacrosse · NCAA D1 · Premier Lacrosse League 기반", en: "Based on USA Lacrosse · NCAA D1 · Premier Lacrosse League", es: "Basado en USA Lacrosse · NCAA D1 · Premier Lacrosse League" },
  season: { ko: "2025/2026 시즌 준비", en: "2025/2026 season preparation", es: "Preparación de la temporada 2025/2026" },
};

export const LAX_PRINCIPLES: NamedItem[] = [
  { name: { ko: "피로 전에 기술", en: "Skill before fatigue", es: "Técnica antes que fatiga" }, detail: { ko: "기술 훈련은 항상 신선한 상태에서 — 컨디셔닝으로 신경계가 지치기 전에 먼저 합니다.", en: "Always train skills fresh — before conditioning tires the nervous system.", es: "Entrena siempre la técnica en fresco, antes de que el acondicionamiento fatigue el sistema nervioso." } },
  { name: { ko: "정적보다 동적", en: "Dynamic over static", es: "Dinámico antes que estático" }, detail: { ko: "유소년부터 PLL까지 모든 레벨에서 정적 스트레칭 대신 동적 웜업. 활동 전 정적 스트레칭은 폭발력을 떨어뜨립니다.", en: "Every level from youth to the PLL warms up dynamically, not statically. Static stretching before activity reduces power output.", es: "Desde la base hasta la PLL, el calentamiento es dinámico, no estático. Estirar en estático antes de la actividad reduce la potencia." } },
  { name: { ko: "길이보다 빈도", en: "Frequency over length", es: "Frecuencia antes que duración" }, detail: { ko: "매일 20분 월볼이 주 2~3회 긴 세션보다 기술 습득이 빠릅니다.", en: "Twenty minutes of wall ball every day builds skill faster than two or three long sessions a week.", es: "Veinte minutos de pared al día desarrollan la técnica más rápido que dos o tres sesiones largas por semana." } },
  { name: { ko: "항상 게임 스피드", en: "Always game speed", es: "Siempre a ritmo de partido" }, detail: { ko: "모든 드릴은 실전 속도로. 60%로 대충 하면 60% 습관이 몸에 뱁니다.", en: "Run every drill at match pace. Train at 60% and you build 60% habits.", es: "Haz cada ejercicio a ritmo de partido. Si entrenas al 60%, creas hábitos al 60%." } },
  { name: { ko: "매 세션 양손", en: "Both hands, every session", es: "Ambas manos, cada sesión" }, detail: { ko: "예외 없음. 약한 손 개발이 어떤 레벨에서든 가장 빠른 향상 방법입니다.", en: "No exceptions. Developing the weak hand is the fastest route to improvement at any level.", es: "Sin excepciones. Desarrollar la mano débil es la vía más rápida de mejora en cualquier nivel." } },
];

export const LAX_QUOTE = {
  text: { ko: "라크로스는 '두 발로 하는 가장 빠른 스포츠'로 불립니다. 그에 맞는 프로그램은 이 종목의 대사적 요구를 분석하는 데서 출발합니다.", en: "Lacrosse is called the fastest sport on two feet. A program worthy of it starts by analysing the metabolic demands of the game.", es: "Al lacrosse se le llama el deporte más rápido sobre dos pies. Un programa a su altura empieza analizando las demandas metabólicas del juego." },
  by: { ko: "Corey Crane, Army NCAA 스트렝스 & 컨디셔닝 코치", en: "Corey Crane, Army NCAA strength & conditioning coach", es: "Corey Crane, preparador físico de Army (NCAA)" },
};

// 2. Warm-up (RAMP)
export const LAX_WARMUP: Phase[] = [
  {
    title: { ko: "Phase 1 — 일반 활성화", en: "Phase 1 — General activation", es: "Fase 1 — Activación general" },
    time: { ko: "5–7분", en: "5–7 min", es: "5–7 min" },
    items: [
      { name: { ko: "동적 러닝 시퀀스", en: "Dynamic running sequence", es: "Secuencia de carrera dinámica" }, detail: { ko: "하이니·버트킥·래터럴 셔플·카리오카·백페달 — 각 2×20yd", en: "High knees, butt kicks, lateral shuffle, carioca, backpedal — 2×20 yd each", es: "Rodillas altas, talones al glúteo, desplazamiento lateral, carioca, marcha atrás — 2×20 yd cada uno" } },
      { name: { ko: "줄넘기 / 퀵풋", en: "Skipping rope / quick feet", es: "Comba / pies rápidos" }, detail: { ko: "NCAA 팀은 래더 드릴 5~6개 또는 줄넘기로 운동감각 자극", en: "NCAA teams use 5–6 ladder drills or rope work to wake up coordination", es: "Los equipos NCAA usan 5–6 ejercicios de escalera o comba para activar la coordinación" } },
      { name: { ko: "스피드 스케이터", en: "Speed skater", es: "Patinador de velocidad" }, detail: { ko: "폭발적 측면 홉으로 둔근·엉덩이 활성화. 2×15초", en: "Explosive lateral hops to fire up the glutes and hips. 2×15 sec", es: "Saltos laterales explosivos para activar glúteos y caderas. 2×15 s" } },
      { name: { ko: "드롭 앤 드라이브 스프린트", en: "Drop-and-drive sprint", es: "Sprint drop-and-drive" }, detail: { ko: "백페달 → 신호에 폭발적 전진 스프린트 ×4~6. 중추신경 각성", en: "Backpedal, then explode forward on the signal ×4–6. Wakes up the central nervous system", es: "Marcha atrás y arranque explosivo a la señal ×4–6. Despierta el sistema nervioso central" } },
    ],
    source: { ko: "USA Lacrosse LaxFit; Relentless Lacrosse RAMP 프로토콜", en: "USA Lacrosse LaxFit; Relentless Lacrosse RAMP protocol", es: "USA Lacrosse LaxFit; protocolo RAMP de Relentless Lacrosse" },
  },
  {
    title: { ko: "Phase 2 — 가동성 & 근육 활성화", en: "Phase 2 — Mobility & muscle activation", es: "Fase 2 — Movilidad y activación muscular" },
    time: { ko: "5–6분", en: "5–6 min", es: "5–6 min" },
    items: [
      { name: { ko: "런지 + 상체 회전", en: "Lunge with torso rotation", es: "Zancada con rotación de tronco" }, detail: { ko: "World's Greatest Stretch — 엉덩이와 흉추 개방. 1×10yd 양방향", en: "World's Greatest Stretch — opens the hips and thoracic spine. 1×10 yd each way", es: "World's Greatest Stretch: abre caderas y columna torácica. 1×10 yd en cada sentido" } },
      { name: { ko: "허들 워크", en: "Hurdle walk", es: "Marcha sobre vallas" }, detail: { ko: "고관절 개방 — 앞·뒤로 1×10yd", en: "Opens the hip joint — forwards and backwards, 1×10 yd", es: "Abre la articulación de la cadera: adelante y atrás, 1×10 yd" } },
      { name: { ko: "글루트 브릿지 + 밴드 사이드 스텝", en: "Glute bridge + banded side step", es: "Puente de glúteo + paso lateral con banda" }, detail: { ko: "둔근·엉덩이 안정근 활성화. 각 10~12회", en: "Activates the glutes and hip stabilisers. 10–12 reps each", es: "Activa glúteos y estabilizadores de cadera. 10–12 repeticiones de cada" } },
      { name: { ko: "암 서클 + 손목 롤", en: "Arm circles + wrist rolls", es: "Círculos de brazos + rotación de muñecas" }, detail: { ko: "각 방향 30초. 던지기·받기를 위한 어깨·손목 준비", en: "30 sec each direction. Prepares the shoulders and wrists for throwing and catching", es: "30 s en cada sentido. Prepara hombros y muñecas para lanzar y recibir" } },
    ],
    source: { ko: "USA Lacrosse LaxFit 밴드 프로토콜; LaxPlayBook; Athletes Untapped", en: "USA Lacrosse LaxFit band protocol; LaxPlayBook; Athletes Untapped", es: "Protocolo de bandas LaxFit de USA Lacrosse; LaxPlayBook; Athletes Untapped" },
  },
  {
    title: { ko: "Phase 3 — 스틱 스킬 웜업", en: "Phase 3 — Stick skill warm-up", es: "Fase 3 — Calentamiento con stick" },
    time: { ko: "5–7분", en: "5–7 min", es: "5–7 min" },
    items: [
      { name: { ko: "무빙 파트너 패싱", en: "Moving partner passing", es: "Pases en movimiento por parejas" }, detail: { ko: "나란히 조깅하며 매회 거리 확대. 양손.", en: "Jog side by side, widening the gap with every pass. Both hands.", es: "Trota en paralelo ampliando la distancia en cada pase. Ambas manos." } },
      { name: { ko: "스타 패싱", en: "Star passing", es: "Pases en estrella" }, detail: { ko: "오각형 콘 5개 — 대각선 패스 후 패스한 콘으로 스프린트. 3분 연속.", en: "Five cones in a pentagon — pass diagonally, then sprint to the cone you passed to. 3 min continuous.", es: "Cinco conos en pentágono: pasa en diagonal y esprinta al cono al que pasaste. 3 min continuos." } },
      { name: { ko: "센터서클 노리턴 패싱", en: "Centre-circle no-return passing", es: "Pases sin devolución en círculo central" }, detail: { ko: "모두 움직이며 아무에게나 패스, 같은 사람에게 되돌릴 수 없음. 3~4분.", en: "Everyone moves and passes to anyone, but never straight back to the passer. 3–4 min.", es: "Todos se mueven y pasan a cualquiera, pero nunca de vuelta al pasador. 3–4 min." } },
      { name: { ko: "기브앤고 피니싱", en: "Give-and-go finishing", es: "Definición con pared" }, detail: { ko: "아크에 두 줄 — 패스·스프린트·리드패스 받아 마무리. 양손.", en: "Two lines on the arc — pass, sprint, take the lead pass and finish. Both hands.", es: "Dos filas en el arco: pasa, esprinta, recibe el pase filtrado y define. Ambas manos." } },
    ],
    source: "Lacrosse Library; GameBreaker Camps; LaxPlayBook",
  },
];

// 3. Individual stick skills
export const LAX_STICK: { group: Localized; items: NamedItem[]; source?: Localized }[] = [
  {
    group: { ko: "월볼 프로그레션", en: "Wall ball progression", es: "Progresión de pared" },
    source: "Peak Primal Wellness; JR Minutemen; Hustle Training / Martin Bowes",
    items: [
      { name: { ko: "강한 손", en: "Strong hand", es: "Mano fuerte" }, detail: { ko: "100회, 특정 지점 조준, 매회 손목 스냅", en: "100 reps, aiming at one spot, snapping the wrist every time", es: "100 repeticiones apuntando a un punto fijo, con golpe de muñeca en cada una" } },
      { name: { ko: "약한 손", en: "Weak hand", es: "Mano débil" }, detail: { ko: "바로 이어서 100회. 절대 건너뛰지 않기.", en: "100 reps straight after. Never skip these.", es: "100 repeticiones justo después. Nunca te las saltes." } },
      { name: { ko: "스위치 핸드", en: "Switch hands", es: "Cambio de mano" }, detail: { ko: "오른손 던지고 왼손 받기. 양방향 5분 연속.", en: "Throw right, catch left. 5 min continuous, both ways.", es: "Lanza con la derecha, recibe con la izquierda. 5 min continuos en ambos sentidos." } },
      { name: { ko: "퀵 스틱", en: "Quick stick", es: "Quick stick" }, detail: { ko: "벽 3~5yd에서 크레들 없이 한 동작으로 받아 던지기", en: "From 3–5 yd off the wall, catch and release in one motion with no cradle", es: "A 3–5 yd de la pared, recibe y lanza en un solo movimiento, sin cradle" } },
      { name: { ko: "스플릿 도지 + 스로우", en: "Split dodge + throw", es: "Split dodge + lanzamiento" }, detail: { ko: "스플릿 도지 실행 후 바뀐 손으로 발사", en: "Execute the split dodge, then release with the hand you switched to", es: "Ejecuta el split dodge y lanza con la mano a la que cambiaste" } },
      { name: { ko: "롤 도지 드릴", en: "Roll dodge drill", es: "Ejercicio de roll dodge" }, detail: { ko: "강한 손으로 던지고 풀 롤 도지, 약한 손으로 받아 발사", en: "Throw strong hand, full roll dodge, catch and release weak hand", es: "Lanza con la mano fuerte, roll dodge completo, recibe y lanza con la débil" } },
      { name: { ko: "런 어롱 월", en: "Run along the wall", es: "Correr junto a la pared" }, detail: { ko: "벽 길이를 달리며 패스 — 벽을 달리는 팀원처럼 활용", en: "Pass while running the length of the wall — treat it as a team-mate running with you", es: "Pasa mientras corres a lo largo de la pared: trátala como un compañero que corre contigo" } },
      { name: { ko: "그라운드볼 스쿱 + 리파이어", en: "Ground ball scoop + refire", es: "Recogida de balón raso + relanzamiento" }, detail: { ko: "벽에 던지고 바운스를 향해 돌진해 다시 슛", en: "Throw at the wall, attack the bounce and fire again", es: "Lanza a la pared, ataca el bote y vuelve a disparar" } },
    ],
  },
  {
    group: { ko: "트리플 스렛 & 원핸드 크레들", en: "Triple threat & one-hand cradle", es: "Triple amenaza y cradle a una mano" },
    items: [
      { name: { ko: "탑핸드 크레들", en: "Top-hand cradle", es: "Cradle con la mano superior" }, detail: { ko: "버트엔드가 흔들리지 않게 스틱 페이스만 회전. '콰이엇 스틱' — 항상 트리플 스렛", en: "Rotate only the face of the stick, keeping the butt end still. A quiet stick stays in triple threat", es: "Gira solo la cara del stick manteniendo quieto el extremo. Un stick tranquilo mantiene la triple amenaza" } },
      { name: { ko: "원핸드 파워 패싱", en: "One-hand power passing", es: "Pase potente a una mano" }, detail: { ko: "벽에 각 손 50회. 손 독립성 향상", en: "50 reps per hand off the wall. Builds hand independence", es: "50 repeticiones por mano contra la pared. Desarrolla la independencia de manos" } },
      { name: { ko: "비하인드 더 백 셀프토스", en: "Behind-the-back self toss", es: "Autopase por la espalda" }, detail: { ko: "보지 않고도 스틱 헤드 위치 감각 형성", en: "Builds a feel for where the stick head is without looking", es: "Desarrolla la sensación de dónde está la cabeza del stick sin mirar" } },
    ],
  },
  {
    group: { ko: "슈팅 갤러리 & 박스 드릴", en: "Shooting gallery & box drill", es: "Galería de tiro y ejercicio en caja" },
    items: [
      { name: { ko: "타임 앤 룸 슛", en: "Time-and-room shot", es: "Tiro con tiempo y espacio" }, detail: { ko: "골로 스텝 → 볼 콜 → 피드 받아 강한 오버핸드 코너 슛", en: "Step to goal, call for it, take the feed and drive an overhand shot into the corner", es: "Paso hacia portería, pide el balón, recibe y dispara por arriba al ángulo" } },
      { name: { ko: "온더런 슛", en: "On-the-run shot", es: "Tiro en carrera" }, detail: { ko: "콘으로 컷하며 리드패스 받아 발 세우지 않고 즉시 발사", en: "Cut off the cone, take the lead pass and release without setting your feet", es: "Corta en el cono, recibe el pase filtrado y dispara sin fijar los pies" } },
      { name: { ko: "박스 드릴", en: "Box drill", es: "Ejercicio en caja" }, detail: { ko: "① 도지 시퀀스(스플릿·롤·페이스·스플릿) ② 패스 앤 컷 ③ 수비 섀도우(발놀림만, 리치 금지)", en: "1. Dodge sequence (split, roll, face, split) 2. Pass and cut 3. Defensive shadow (footwork only, no reaching)", es: "1. Secuencia de dodges (split, roll, face, split) 2. Pasa y corta 3. Sombra defensiva (solo pies, sin estirar el stick)" } },
    ],
  },
];

// 4. Conditioning
export const LAX_CONDITIONING: NamedItem[] = [
  { name: { ko: "300야드 셔틀 (NCAA 기준)", en: "300-yard shuttle (NCAA standard)", es: "Shuttle de 300 yardas (estándar NCAA)" }, detail: { ko: "25yd 콘 왕복 6회, 최대 강도. 세션당 2~3회, 사이 3~5분 휴식. 모든 D1의 표준 체력 테스트.", en: "Six round trips between cones 25 yd apart, all out. 2–3 per session with 3–5 min rest between. The standard fitness test across D1.", es: "Seis idas y vueltas entre conos a 25 yd, a máxima intensidad. 2–3 por sesión con 3–5 min de descanso. El test físico estándar en D1." } },
  { name: { ko: "T-드릴", en: "T-drill", es: "Ejercicio en T" }, detail: { ko: "T자 콘 4개 — B로 스프린트, C·D로 셔플, B로 셔플, A로 백페달. 대학 필수 타임 테스트. 10~15회.", en: "Four cones in a T — sprint to B, shuffle to C and D, shuffle back to B, backpedal to A. A required timed test at college level. 10–15 reps.", es: "Cuatro conos en T: esprinta a B, desplázate a C y D, vuelve a B y retrocede a A. Test cronometrado obligatorio a nivel universitario. 10–15 repeticiones." } },
  { name: { ko: "수어사이드 셔틀", en: "Suicide shuttle", es: "Shuttle progresivo" }, detail: { ko: "10·20·30yd 왕복(~40초). 동일 시간 휴식. 3~5세트.", en: "Out and back at 10, 20 and 30 yd (about 40 sec). Rest for the same time. 3–5 sets.", es: "Ida y vuelta a 10, 20 y 30 yd (unos 40 s). Descansa el mismo tiempo. 3–5 series." } },
  { name: { ko: "힐 스프린트 + 래터럴 바운딩", en: "Hill sprints + lateral bounding", es: "Sprints en cuesta + saltos laterales" }, detail: { ko: "30yd 언덕 스프린트 ×6~8. 래터럴 바운딩 각 방향 2×10.", en: "30 yd hill sprints ×6–8. Lateral bounds 2×10 each direction.", es: "Sprints en cuesta de 30 yd ×6–8. Saltos laterales 2×10 por lado." } },
  { name: { ko: "어질리티 래더", en: "Agility ladder", es: "Escalera de agilidad" }, detail: { ko: "스트라이드런·이키셔플·인아웃·래터럴·스네이크점프 — 각 패턴 2회.", en: "Stride run, icky shuffle, in-and-out, lateral, snake jump — 2 passes of each pattern.", es: "Carrera, icky shuffle, dentro-fuera, lateral y salto en serpiente: 2 pasadas de cada patrón." } },
];
export const LAX_CONDITIONING_NOTE =
  { ko: "라크로스는 약 60% 무산소/ATP · 20% 무산소-젖산 · 20% 유산소. 장거리 러닝이 아니라 고강도 인터벌 + 부분 회복으로. 스피드/어질리티는 신선할 때(초반), 컨디셔닝 피니셔는 연습 끝에 배치.", en: "Lacrosse is roughly 60% anaerobic/ATP, 20% anaerobic-lactic and 20% aerobic. Train it with high-intensity intervals and partial recovery, not long-distance running. Put speed and agility early while players are fresh, and conditioning finishers at the end of practice.", es: "El lacrosse es aproximadamente 60% anaeróbico/ATP, 20% anaeróbico-láctico y 20% aeróbico. Se entrena con intervalos de alta intensidad y recuperación parcial, no con carrera continua. Coloca velocidad y agilidad al principio, en fresco, y los finalizadores de acondicionamiento al final." };

// 5. Team drills
export const LAX_TEAM: { group: Localized; items: NamedItem[] }[] = [
  {
    group: { ko: "공격 드릴", en: "Offensive drills", es: "Ejercicios de ataque" },
    items: [
      { name: { ko: "3맨 위브", en: "Three-man weave", es: "Weave a tres" }, detail: { ko: "세 명 연속 움직임 — 패스·간격·컨디셔닝", en: "Three players in continuous motion — passing, spacing and conditioning at once", es: "Tres jugadores en movimiento continuo: pase, amplitud y acondicionamiento a la vez" } },
      { name: { ko: "도지 앤 피니시 (라이브 1v1)", en: "Dodge and finish (live 1v1)", es: "Dodge y definición (1 contra 1 real)" }, detail: { ko: "라이브 도지 후 2초 안에 마무리 또는 컷터에게 피드", en: "After a live dodge, finish or feed a cutter within two seconds", es: "Tras un dodge real, define o asiste a un cortador en dos segundos" } },
      { name: { ko: "피라미드 슈팅", en: "Pyramid shooting", es: "Tiro en pirámide" }, detail: { ko: "크리스로 컷, 양 윙 피더 — 짧은 시간 다량의 인사이드 슛", en: "Cut to the crease with feeders on both wings — a high volume of inside shots in little time", es: "Corta al área con asistentes en ambas bandas: mucho volumen de tiro interior en poco tiempo" } },
      { name: { ko: "2v1 / 2v2 오드맨 러시", en: "2v1 / 2v2 odd-man rush", es: "Superioridad 2 contra 1 / 2 contra 2" }, detail: { ko: "패스 전에 수비가 먼저 커밋하도록 유도", en: "Make the defender commit before you release the pass", es: "Haz que el defensor se comprometa antes de soltar el pase" } },
    ],
  },
  {
    group: { ko: "수비 드릴", en: "Defensive drills", es: "Ejercicios de defensa" },
    items: [
      { name: { ko: "슬라이드 앤 리커버 (2v2)", en: "Slide and recover (2v2)", es: "Ayuda y recuperación (2 contra 2)" }, detail: { ko: "25yd 박스에서 첫 수비는 버티고, 두 번째가 슬라이드, 첫 수비는 리커버", en: "In a 25 yd box the first defender holds, the second slides, the first recovers", es: "En una caja de 25 yd, el primer defensor aguanta, el segundo ayuda y el primero recupera" } },
      { name: { ko: "지그재그 풋워크", en: "Zig-zag footwork", es: "Juego de pies en zigzag" }, detail: { ko: "지그재그 콘 8개 — 넓은 측면 스텝으로 후진, 몸은 항상 정면", en: "Eight cones in a zig-zag — retreat with wide lateral steps, chest always square", es: "Ocho conos en zigzag: retrocede con pasos laterales amplios, siempre de frente" } },
      { name: { ko: "클리어 앤 라이드", en: "Clear and ride", es: "Salida y presión" }, detail: { ko: "골리 세이브 → 수비 클리어 → 공격 라이드. 풀필드, 20초 샷클락", en: "Goalie save, defensive clear, offensive ride. Full field, 20-second shot clock", es: "Parada del portero, salida defensiva, presión ofensiva. Campo entero, 20 s de posesión" } },
      { name: { ko: "그라운드볼 스크램블", en: "Ground ball scramble", es: "Disputa de balón raso" }, detail: { ko: "1v1 → 앵글 스크램블 → 2v2→3v2 전환", en: "1v1, then an angled scramble, then a 2v2 into 3v2 transition", es: "1 contra 1, disputa en ángulo y transición de 2 contra 2 a 3 contra 2" } },
    ],
  },
  {
    group: { ko: "풀팀", en: "Full team", es: "Equipo completo" },
    items: [{ name: { ko: "6v6 트랜지션", en: "6v6 transition", es: "Transición 6 contra 6" }, detail: { ko: "풀필드, 샷클락, 소통 — 혼돈 속 질서를 찾는 훈련", en: "Full field, shot clock, constant talk — finding order inside chaos", es: "Campo entero, reloj de posesión y comunicación constante: encontrar orden en el caos" } }],
  },
];

// 6. Practice structures (rows: time, block, details)
export const LAX_PRACTICE_90: [string, Localized, Localized][] = [
  ["0:00", { ko: "웜업 (15분)", en: "Warm-up (15 min)", es: "Calentamiento (15 min)" }, { ko: "Phase 1 동적 러닝 + Phase 2 가동성 + Phase 3 무빙 스틱스킬", en: "Phase 1 dynamic running + Phase 2 mobility + Phase 3 moving stick skills", es: "Fase 1 carrera dinámica + Fase 2 movilidad + Fase 3 stick en movimiento" }],
  ["0:15", { ko: "스틱스킬 (18분)", en: "Stick skills (18 min)", es: "Técnica de stick (18 min)" }, { ko: "월볼(8분) + 슈팅 갤러리 스테이션당 8슛(10분)", en: "Wall ball (8 min) + shooting gallery, 8 shots per station (10 min)", es: "Pared (8 min) + galería de tiro, 8 tiros por estación (10 min)" }],
  ["0:33", { ko: "팀 드릴 (35분)", en: "Team drills (35 min)", es: "Ejercicios de equipo (35 min)" }, { ko: "그라운드볼 + 피라미드 슈팅 → 도지/피니시 + 슬라이드/리커버 → 6v6 + 클리어/라이드", en: "Ground balls + pyramid shooting, then dodge/finish + slide/recover, then 6v6 + clear/ride", es: "Balones rasos + tiro en pirámide, luego dodge/definición + ayuda/recuperación, y 6 contra 6 + salida/presión" }],
  ["1:08", { ko: "컨디셔닝 (14분)", en: "Conditioning (14 min)", es: "Acondicionamiento (14 min)" }, { ko: "T-드릴 8~10회 → 300yd 셔틀 ×2 → 수어사이드 3세트", en: "T-drill ×8–10, 300 yd shuttle ×2, suicides ×3 sets", es: "Ejercicio en T ×8–10, shuttle de 300 yd ×2, progresivos ×3 series" }],
  ["1:22", { ko: "쿨다운 (8분)", en: "Cool-down (8 min)", es: "Vuelta a la calma (8 min)" }, { ko: "정적 스트레칭 + 수분 + 다음 연습 코칭 포인트 1개", en: "Static stretching, hydration, and one coaching point for next practice", es: "Estiramientos estáticos, hidratación y un punto de mejora para el próximo entrenamiento" }],
];
export const LAX_PRACTICE_120: [string, Localized, Localized][] = [
  ["0:00", { ko: "웜업 (18분)", en: "Warm-up (18 min)", es: "Calentamiento (18 min)" }, { ko: "확장 Phase 1(포텐시에이션 스프린트 포함) + 전체 Phase 2 + 스타 패싱 Phase 3", en: "Extended Phase 1 (including potentiation sprints) + full Phase 2 + star passing for Phase 3", es: "Fase 1 ampliada (con sprints de potenciación) + Fase 2 completa + pases en estrella para la Fase 3" }],
  ["0:18", { ko: "스틱스킬 (27분)", en: "Stick skills (27 min)", es: "Técnica de stick (27 min)" }, { ko: "월볼 각 손 100회 + 포지션별 박스 드릴(7분) + 슈팅 갤러리 12슛(10분)", en: "100 wall ball reps per hand + position box drills (7 min) + shooting gallery, 12 shots (10 min)", es: "100 repeticiones de pared por mano + ejercicios en caja por posición (7 min) + galería de tiro, 12 tiros (10 min)" }],
  ["0:45", { ko: "팀 드릴 (48분)", en: "Team drills (48 min)", es: "Ejercicios de equipo (48 min)" }, { ko: "그라운드볼(10) → 공격 개발(12) → 수비 개발(12) → 풀팀 라이브 6v6 + 클리어/라이드(14)", en: "Ground balls (10), offensive development (12), defensive development (12), full-team live 6v6 + clear/ride (14)", es: "Balones rasos (10), desarrollo ofensivo (12), desarrollo defensivo (12), 6 contra 6 real con salida/presión (14)" }],
  ["1:33", { ko: "컨디셔닝 (18분)", en: "Conditioning (18 min)", es: "Acondicionamiento (18 min)" }, { ko: "T-드릴 ×10 → 300yd 셔틀 ×2 → 수어사이드 피니셔(마지막 세트 무휴식)", en: "T-drill ×10, 300 yd shuttle ×2, suicide finisher (no rest on the last set)", es: "Ejercicio en T ×10, shuttle de 300 yd ×2, progresivo final (sin descanso en la última serie)" }],
  ["1:51", { ko: "쿨다운 (9분)", en: "Cool-down (9 min)", es: "Vuelta a la calma (9 min)" }, { ko: "전체 정적 스트레칭 + 개인 30초 리플렉션 + 팀 디브리프 + 다음 세션 예고", en: "Full static stretch, 30 seconds of individual reflection, team debrief, and a preview of the next session", es: "Estiramiento estático completo, 30 s de reflexión individual, puesta en común y avance de la próxima sesión" }],
];

// 7. Pregame (rows: time, phase, content)
export const LAX_PREGAME: [Localized, Localized, Localized][] = [
  [{ ko: "-20분", en: "-20 min", es: "-20 min" }, { ko: "Phase 1 — 런 (4분)", en: "Phase 1 — Run (4 min)", es: "Fase 1 — Carrera (4 min)" }, { ko: "팀 조깅 1바퀴 → 동적 러닝 시퀀스 ~70% → 스피드 스케이터 2×15초", en: "One team jog lap, dynamic running sequence at about 70%, speed skaters 2×15 sec", es: "Una vuelta trotando en equipo, secuencia de carrera dinámica al 70% y patinadores 2×15 s" }],
  [{ ko: "-16분", en: "-16 min", es: "-16 min" }, { ko: "Phase 2 — 가동성 (3분)", en: "Phase 2 — Mobility (3 min)", es: "Fase 2 — Movilidad (3 min)" }, { ko: "런지+상체회전(1×10yd) → 허들 워크(1×10yd) → 암 서클 + 손목 롤", en: "Lunge with rotation (1×10 yd), hurdle walk (1×10 yd), arm circles and wrist rolls", es: "Zancada con rotación (1×10 yd), marcha sobre vallas (1×10 yd), círculos de brazos y muñecas" }],
  [{ ko: "-13분", en: "-13 min", es: "-13 min" }, { ko: "Phase 3 — 스틱 (6분)", en: "Phase 3 — Stick (6 min)", es: "Fase 3 — Stick (6 min)" }, { ko: "포지션 그룹별 인사이드-아웃 라인 드릴(4분, 양손) → 그라운드볼 스쿱(2분)", en: "Inside-out line drill by position group (4 min, both hands), then ground ball scoops (2 min)", es: "Ejercicio de líneas de dentro a fuera por posición (4 min, ambas manos) y recogidas de balón raso (2 min)" }],
  [{ ko: "-7분", en: "-7 min", es: "-7 min" }, { ko: "Phase 4 — 포지션 (4분)", en: "Phase 4 — Position (4 min)", es: "Fase 4 — Posición (4 min)" }, { ko: "동시 진행: 공격=피라미드 슈팅 | 미드=스타 드릴 | 수비=지그재그 | 골리=다양한 슛", en: "All at once: attack on pyramid shooting, midfield on the star drill, defence on zig-zags, goalies facing varied shots", es: "Todo a la vez: ataque en tiro en pirámide, medios en ejercicio de estrella, defensa en zigzag y porteros con tiros variados" }],
  [{ ko: "-3분", en: "-3 min", es: "-3 min" }, { ko: "Phase 5 — 락인 (3분)", en: "Phase 5 — Lock in (3 min)", es: "Fase 5 — Concentración (3 min)" }, { ko: "90~95% 폭발 스프린트 2회 → 골리에게 각 1슛 → 60초 팀 허들 → 30초 박스 호흡", en: "Two explosive sprints at 90–95%, one shot each on the goalie, a 60-second team huddle, then 30 seconds of box breathing", es: "Dos sprints explosivos al 90–95%, un tiro cada uno al portero, 60 s de piña y 30 s de respiración en caja" }],
];
export const LAX_PREGAME_NOTE =
  { ko: "연습 웜업과 근본적으로 다릅니다. 목표는 탱크를 비우지 않고 몸과 마음을 준비시키는 것 — 강도 ~70%, 컨디셔닝·새 기술 없음.", en: "This is fundamentally different from a practice warm-up. The goal is to prepare body and mind without emptying the tank — about 70% intensity, no conditioning and no new skills.", es: "Es fundamentalmente distinto de un calentamiento de entrenamiento. El objetivo es preparar cuerpo y mente sin vaciar el depósito: en torno al 70% de intensidad, sin acondicionamiento ni técnicas nuevas." };

// 8. Position plans
export const LAX_POSITIONS: PositionPlan[] = [
  {
    name: { ko: "어택 (Attack)", en: "Attack", es: "Ataque" },
    emoji: "🎯",
    source: "Signature Lacrosse; LaxPlayBook; GameBreaker Camps",
    blocks: [
      { name: { ko: "세 지점 도지 (12분)", en: "Dodging from three spots (12 min)", es: "Dodges desde tres zonas (12 min)" }, detail: { ko: "윙 도지(스플릿·롤·페이스) → 탑 도지(인사이드 레인) → X 도지(케이지 뒤). 각 지점 4회, 양손.", en: "Wing dodge (split, roll, face), top dodge (inside lane), X dodge (behind the cage). Four reps from each spot, both hands.", es: "Dodge desde banda (split, roll, face), desde arriba (carril interior) y desde X (tras la portería). Cuatro repeticiones por zona, ambas manos." } },
      { name: { ko: "X에서 피드 (10분)", en: "Feeding from X (10 min)", es: "Asistencias desde X (10 min)" }, detail: { ko: "골 뒤에서 드라이브하며 수비 읽기 — 첫 컷터 피드 또는 홀드 후 두 번째 찾기.", en: "Drive from behind the goal and read the defence — feed the first cutter, or hold and find the second.", es: "Conduce desde detrás de portería y lee la defensa: asiste al primer cortador o aguanta y busca al segundo." } },
      { name: { ko: "슈팅 갤러리 (10분)", en: "Shooting gallery (10 min)", es: "Galería de tiro (10 min)" }, detail: { ko: "5스테이션 로테이션: 타임앤룸 → 온더런 → 퀵스틱. 스테이션당 10슛, 양손.", en: "Rotate five stations: time-and-room, on-the-run, quick stick. Ten shots per station, both hands.", es: "Rotación de cinco estaciones: con tiempo y espacio, en carrera y quick stick. Diez tiros por estación, ambas manos." } },
    ],
  },
  {
    name: { ko: "디펜스 (Defense)", en: "Defense", es: "Defensa" },
    emoji: "🛡️",
    source: "1st Class Lax / Jesse Bernhardt; LaxPlayBook 2026",
    blocks: [
      { name: { ko: "풋워크 & 바디 포지셔닝 (12분)", en: "Footwork & body positioning (12 min)", es: "Juego de pies y posición corporal (12 min)" }, detail: { ko: "스타트-스톱 미러 + 지그재그 풋워크(콘 8개) + 셰이드/틸트 조정.", en: "Start-stop mirroring, zig-zag footwork through eight cones, and shade/tilt adjustments.", es: "Espejo de arranque y parada, juego de pies en zigzag con ocho conos y ajustes de orientación." } },
      { name: { ko: "수비수 스틱스킬 (8분)", en: "Defensive stick skills (8 min)", es: "Técnica de stick del defensor (8 min)" }, detail: { ko: "롱폴 월볼 각 손 50회 + Figure 8 / W / M 체크 암 패턴.", en: "50 long-pole wall ball reps per hand plus figure-8, W and M check patterns.", es: "50 repeticiones de pared con palo largo por mano, más patrones de check en 8, W y M." } },
      { name: { ko: "첫 슬라이드 + 클리어 아웃렛 (12분)", en: "First slide + clearing outlet (12 min)", es: "Primera ayuda y salida de balón (12 min)" }, detail: { ko: "첫 슬라이드 타이밍 → 두 번째 슬라이드 규율 → 즉시 업필드 아웃렛.", en: "Timing the first slide, disciplining the second, then an immediate outlet upfield.", es: "Cronometrar la primera ayuda, disciplina en la segunda y salida inmediata hacia arriba." } },
    ],
  },
  {
    name: { ko: "미드필드 (Midfield)", en: "Midfield", es: "Centro del campo" },
    emoji: "🔄",
    source: "Lacrosse Drive; STXZ Lacrosse; Signature Lacrosse",
    blocks: [
      { name: { ko: "트랜지션 판단력 (12분)", en: "Transition decision-making (12 min)", es: "Toma de decisiones en transición (12 min)" }, detail: { ko: "패스트브레이크 트레일링 미드 드릴: 2v1 또는 3v2, 8초 샷클락.", en: "Fast-break trailing midfielder drill: 2v1 or 3v2 on an 8-second shot clock.", es: "Ejercicio del medio que llega en contraataque: 2 contra 1 o 3 contra 2 con 8 s de posesión." } },
      { name: { ko: "스프린트-스위치 이중역할 (10분)", en: "Sprint-switch two-way role (10 min)", es: "Doble rol con cambio en sprint (10 min)" }, detail: { ko: "공격 세트 → 즉시 수비 위치로 스프린트. 무휴식. 4포제션 ×3세트.", en: "Run an offensive set, then sprint straight back into defensive position. No rest. Four possessions ×3 sets.", es: "Juega una posesión de ataque y esprinta de inmediato a la posición defensiva. Sin descanso. Cuatro posesiones ×3 series." } },
      { name: { ko: "피로 상태 슈팅 (10분)", en: "Shooting under fatigue (10 min)", es: "Tiro en fatiga (10 min)" }, detail: { ko: "40yd 전력 스프린트 → 패스 받아 즉시 슛, 무휴식. 각 손 8회.", en: "40 yd all-out sprint, take the pass and shoot immediately, no rest. Eight reps per hand.", es: "Sprint máximo de 40 yd, recibe y dispara de inmediato, sin descanso. Ocho repeticiones por mano." } },
    ],
  },
  {
    name: { ko: "골리 (Goalie)", en: "Goalie", es: "Portero" },
    emoji: "🥅",
    source: "Lax Goalie Rat; Lacrosse Drive; MLL Pro Brian Phipps",
    blocks: [
      { name: { ko: "풋워크 & 스탠스 (10분)", en: "Footwork & stance (10 min)", es: "Juego de pies y postura (10 min)" }, detail: { ko: "Walk the Line(5분) — 세이브 동작 모방으로 근육 기억. 골리 셔틀 — 빠른 투구, 탑핸드·리드풋 구동.", en: "Walk the Line (5 min) — rehearsing the save motion to build muscle memory. Goalie shuttle — rapid feeds driven by top hand and lead foot.", es: "Walk the Line (5 min): ensayar el gesto de parada para crear memoria muscular. Shuttle de portero: lanzamientos rápidos dirigidos por la mano superior y el pie adelantado." } },
      { name: { ko: "소프트 핸즈 & 리바운드 (8분)", en: "Soft hands & rebounds (8 min)", es: "Manos blandas y rechaces (8 min)" }, detail: { ko: "핫 포테이토(달걀처럼 받기, 낚아채지 않기). 리바운드 컨트롤: 접촉 시 살짝 크레들.", en: "Hot potato — receive it like an egg, never snatch. Rebound control: a small cradle on contact.", es: "Patata caliente: recibe como si fuera un huevo, nunca atrapes de golpe. Control del rechace: un pequeño cradle al contacto." } },
      { name: { ko: "라이브 슛 & 클리어 (15분)", en: "Live shots & clearing (15 min)", es: "Tiros reales y salida (15 min)" }, detail: { ko: "다양한 각도·거리. 세이브 후 즉시 컷하는 미드에게 아웃렛. 블라인드 리액션 슛 5개 포함.", en: "Varied angles and distances. After the save, outlet immediately to a cutting midfielder. Include five blind reaction shots.", es: "Ángulos y distancias variados. Tras la parada, saca de inmediato al medio que corta. Incluye cinco tiros de reacción a ciegas." } },
    ],
  },
  {
    name: { ko: "FOGO — 페이스오프", en: "FOGO — Face-off", es: "FOGO — Saque neutral" },
    emoji: "⚔️",
    source: "Advanced Lacrosse USA / Coach Luke Engelke (Duke); Lacrosse Drive",
    blocks: [
      { name: { ko: "스탠스·그립·클램프 (12분)", en: "Stance, grip & clamp (12 min)", es: "Postura, agarre y clamp (12 min)" }, detail: { ko: "뉴트럴 그립으로 20회 파이어아웃(속도 아닌 레버리지). 클램프 드릴: 손 속도·반응·엑싯 카운터.", en: "Twenty fire-outs from a neutral grip — leverage, not speed. Clamp drill: hand speed, reaction and exit counters.", es: "Veinte salidas desde agarre neutro: palanca, no velocidad. Ejercicio de clamp: velocidad de manos, reacción y contras de salida." } },
      { name: { ko: "드로우 후 그라운드볼 & 윙 (12분)", en: "Ground balls & wings after the draw (12 min)", es: "Balones rasos y bandas tras el saque (12 min)" }, detail: { ko: "드로우 앤 스쿱 → 접촉 속 GB 획득 → 윙 아웃렛. 윙 소통 드릴. 각 사이드 10회.", en: "Draw and scoop, win the ground ball through contact, outlet to the wing. Wing communication drill. Ten reps each side.", es: "Saque y recogida, gana el balón raso en el contacto y saca a la banda. Ejercicio de comunicación con las bandas. Diez repeticiones por lado." } },
      { name: { ko: "미드필드 스킬 (8분)", en: "Midfield skills (8 min)", es: "Habilidades de medio campo (8 min)" }, detail: { ko: "스프린트-스위치 컨디셔닝 + GB 1v1 + 짧은 버스트(10/20/30yd 셔틀 ×3).", en: "Sprint-switch conditioning, 1v1 ground balls, and short bursts (10/20/30 yd shuttle ×3).", es: "Acondicionamiento con cambios en sprint, balones rasos 1 contra 1 y series cortas (shuttle de 10/20/30 yd ×3)." } },
    ],
  },
  {
    name: { ko: "LSM — 롱스틱 미드", en: "LSM — Long-stick midfielder", es: "LSM — Medio de palo largo" },
    emoji: "📏",
    source: "1st Class Lax; Lacrosse Ball Store; Gladiator Lacrosse",
    blocks: [
      { name: { ko: "롱폴 풋워크 + 1v1 (12분)", en: "Long-pole footwork + 1v1 (12 min)", es: "Juego de pies con palo largo + 1 contra 1 (12 min)" }, detail: { ko: "롱폴 미러(풋워크만) + 롱폴 지그재그 + 15yd 박스 온볼 1v1.", en: "Long-pole mirroring (footwork only), long-pole zig-zags, and on-ball 1v1 in a 15 yd box.", es: "Espejo con palo largo (solo pies), zigzag con palo largo y 1 contra 1 al balón en una caja de 15 yd." } },
      { name: { ko: "페이스오프 윙 플레이 (10분)", en: "Face-off wing play (10 min)", es: "Juego de banda en el saque (10 min)" }, detail: { ko: "리스트레이닝 라인 포지셔닝 → 상대 윙 박스아웃 GB → 패스트브레이크 미드 아웃렛.", en: "Position on the restraining line, box out the opposing wing for the ground ball, then outlet to the fast-break midfielder.", es: "Colócate en la línea de restricción, bloquea a la banda rival para ganar el balón raso y saca al medio en contraataque." } },
      { name: { ko: "롱폴 트랜지션 & 클리어 (10분)", en: "Long-pole transition & clearing (10 min)", es: "Transición y salida con palo largo (10 min)" }, detail: { ko: "롱폴 월볼 100회(양손) + 클리어 스프린트: 크리스에서 스쿱 → 40yd 스프린트 → 미드 아웃렛.", en: "100 long-pole wall ball reps (both hands) plus clearing sprints: scoop at the crease, sprint 40 yd, outlet to a midfielder.", es: "100 repeticiones de pared con palo largo (ambas manos) y sprints de salida: recoge en el área, esprinta 40 yd y saca a un medio." } },
    ],
  },
];

// 9. Weekly rotation
export const LAX_WEEKLY: [Localized, Localized][] = [
  [{ ko: "월", en: "Mon", es: "Lun" }, { ko: "스피드 & 폭발력 — T-드릴, 힐 스프린트, 포텐시에이션, 10×40yd", en: "Speed & power — T-drill, hill sprints, potentiation, 10×40 yd", es: "Velocidad y potencia: ejercicio en T, sprints en cuesta, potenciación, 10×40 yd" }],
  [{ ko: "화", en: "Tue", es: "Mar" }, { ko: "개인 스틱스킬 — 월볼, 슈팅 갤러리, 박스 드릴, 1v1 도지 앤 피니시", en: "Individual stick skills — wall ball, shooting gallery, box drills, 1v1 dodge and finish", es: "Técnica individual: pared, galería de tiro, ejercicios en caja, dodge y definición 1 contra 1" }],
  [{ ko: "수", en: "Wed", es: "Mié" }, { ko: "팀 공수 — 3맨 위브, 피라미드 슈팅, 슬라이드/리커버, 지그재그, 클리어/라이드", en: "Team offence and defence — three-man weave, pyramid shooting, slide/recover, zig-zags, clear/ride", es: "Ataque y defensa en equipo: weave a tres, tiro en pirámide, ayuda/recuperación, zigzag, salida/presión" }],
  [{ ko: "목", en: "Thu", es: "Jue" }, { ko: "근력 & 컨디셔닝 — 전신 키네틱체인 리프트 + 코어 서킷 + 300yd 셔틀", en: "Strength & conditioning — full-body kinetic chain lifts, core circuit, 300 yd shuttle", es: "Fuerza y acondicionamiento: levantamientos de cadena cinética, circuito de core y shuttle de 300 yd" }],
  [{ ko: "금", en: "Fri", es: "Vie" }, { ko: "실전 시뮬 — 게임 페이스 웜업, 그라운드볼 스크램블, 6v6 트랜지션, 30분 라이브", en: "Match simulation — game-pace warm-up, ground ball scrambles, 6v6 transition, 30 minutes live", es: "Simulación de partido: calentamiento a ritmo de juego, disputas de balón raso, transición 6 contra 6 y 30 min en vivo" }],
];

// 10. Strength & plyometrics
export const LAX_STRENGTH: { group: Localized; items: NamedItem[] }[] = [
  {
    group: { ko: "3일 키네틱 체인 로테이션", en: "Three-day kinetic chain rotation", es: "Rotación de cadena cinética en tres días" },
    items: [
      { name: { ko: "Day 1 — 스쿼트 + 푸시", en: "Day 1 — Squat + push", es: "Día 1 — Sentadilla + empuje" }, detail: { ko: "고블릿 스쿼트 4×8 → 인클라인 체스트 프레스 4×8 → 스플릿 스쿼트 점프 3×5", en: "Goblet squat 4×8, incline chest press 4×8, split squat jump 3×5", es: "Sentadilla goblet 4×8, press inclinado 4×8, salto en zancada 3×5" } },
      { name: { ko: "Day 2 — 런지 + 풀", en: "Day 2 — Lunge + pull", es: "Día 2 — Zancada + tracción" }, detail: { ko: "리버스 런지 4×8 → 풀업 4×6 → 래터럴 바운딩 2×10", en: "Reverse lunge 4×8, pull-ups 4×6, lateral bounding 2×10", es: "Zancada inversa 4×8, dominadas 4×6, saltos laterales 2×10" } },
      { name: { ko: "Day 3 — 힌지 + 푸시", en: "Day 3 — Hinge + push", es: "Día 3 — Bisagra + empuje" }, detail: { ko: "트랩바 데드리프트 4×6 → 하프닐링 숄더 프레스 3×10 → 브로드 점프 3×3", en: "Trap-bar deadlift 4×6, half-kneeling shoulder press 3×10, broad jump 3×3", es: "Peso muerto con barra hexagonal 4×6, press de hombro de rodillas 3×10, salto horizontal 3×3" } },
    ],
  },
  {
    group: { ko: "플라이오메트릭 (주 1~2회)", en: "Plyometrics (1–2× per week)", es: "Pliometría (1–2 veces por semana)" },
    items: [
      { name: { ko: "중강도", en: "Moderate intensity", es: "Intensidad media" }, detail: { ko: "바운딩 2×10, 래터럴 바운딩 2×10, 스쿼트 점프 3×8, 턱 점프 3×6, 앵클 홉 2×10", en: "Bounding 2×10, lateral bounding 2×10, squat jump 3×8, tuck jump 3×6, ankle hops 2×10", es: "Zancadas saltadas 2×10, saltos laterales 2×10, salto en sentadilla 3×8, salto agrupado 3×6, saltos de tobillo 2×10" } },
      { name: { ko: "고강도", en: "High intensity", es: "Intensidad alta" }, detail: { ko: "바운딩 1×10, 뎁스 점프 10×1, 싱글레그 포고 1×10, 브로드 점프 3×3", en: "Bounding 1×10, depth jump 10×1, single-leg pogo 1×10, broad jump 3×3", es: "Zancadas saltadas 1×10, salto en profundidad 10×1, pogo a una pierna 1×10, salto horizontal 3×3" } },
    ],
  },
  {
    group: { ko: "회전 코어 서킷 (주 3회)", en: "Rotational core circuit (3× per week)", es: "Circuito de core rotacional (3 veces por semana)" },
    items: [
      { name: { ko: "메디신볼 회전 스로우", en: "Medicine ball rotational throw", es: "Lanzamiento rotacional con balón medicinal" }, detail: { ko: "각 사이드 3×10 — 벽으로, 슛·패스 동작 모방", en: "3×10 each side against a wall, mimicking the shooting and passing motion", es: "3×10 por lado contra la pared, imitando el gesto de tiro y pase" } },
      { name: { ko: "메디신볼 슬램", en: "Medicine ball slam", es: "Golpeo de balón medicinal contra el suelo" }, detail: { ko: "3×8 — 접촉을 위한 코어 브레이싱", en: "3×8 — bracing the core for contact", es: "3×8: fijación del core para el contacto" } },
      { name: { ko: "러시안 트위스트 / 팔로프 프레스 / 플랭크", en: "Russian twist / Pallof press / plank", es: "Giro ruso / press Pallof / plancha" }, detail: { ko: "복사근·안티로테이션·안정성 — 각 3세트", en: "Obliques, anti-rotation and stability — three sets of each", es: "Oblicuos, antirrotación y estabilidad: tres series de cada" } },
    ],
  },
];

// 11. Video library
export const LAX_VIDEOS: VideoGroup[] = [
  {
    group: { ko: "웜업", en: "Warm-up", es: "Calentamiento" },
    videos: [
      { title: "Paul Rabil's Warm-Up Shooting Drill", note: { ko: "PLL / Team USA — Phase 3 스틱 활성화", en: "PLL / Team USA — Phase 3 stick activation", es: "PLL / Team USA — activación de stick de la Fase 3" }, url: "https://www.youtube.com/watch?v=eEjpTW9IBbU" },
      { title: "Notre Dame 3-Man Shuffle Ground Ball", note: { ko: "노트르담 — Phase 3 그라운드볼 웜업", en: "Notre Dame — Phase 3 ground ball warm-up", es: "Notre Dame: calentamiento de balón raso de la Fase 3" }, url: "https://www.youtube.com/watch?v=KbZFNegunIo" },
      { title: "Dan Keating Ground Ball Warm-Up", note: { ko: "St. Joseph's Univ. 부수석코치 (D1)", en: "Associate head coach, St. Joseph's University (D1)", es: "Entrenador asistente principal, St. Joseph's University (D1)" }, url: "https://www.youtube.com/watch?v=jN-1aobAB18" },
    ],
  },
  {
    group: { ko: "스틱 스킬", en: "Stick skills", es: "Técnica de stick" },
    videos: [
      { title: "D1 Wall Ball Routine — Mitchell Pehlke", note: { ko: "퀵스틱 50회 → 오버/사이드/언더핸드", en: "50 quick sticks, then overhand, sidearm and underhand", es: "50 quick sticks y luego por arriba, lateral y por abajo" }, url: "https://www.youtube.com/watch?v=xgYBdTTUBRk" },
      { title: "D1 Player's Wall Ball Routine (Lax Weekly)", note: { ko: "양손·퀵스틱·스위치 — 입문용 베스트", en: "Both hands, quick stick, switches — the best starting point", es: "Ambas manos, quick stick y cambios: el mejor punto de partida" }, url: "https://www.youtube.com/watch?v=RLQB_hrszBw" },
      { title: "Pro Wall Ball — Kevin Crowley", note: { ko: "2x 올아메리칸 프로의 8드릴 루틴", en: "An eight-drill routine from a two-time All-American pro", es: "Rutina de ocho ejercicios de un profesional dos veces All-American" }, url: "https://www.youtube.com/watch?v=jCP5ze6OyKw" },
      { title: "Ultimate Wall Ball — 25 Exercises, 3 Phases", note: { ko: "모든 월볼 드릴을 담은 완전판", en: "The complete collection of wall ball drills", es: "La colección completa de ejercicios de pared" }, url: "https://www.youtube.com/watch?v=eUzj3EhPBS4" },
      { title: "USA Lacrosse Official Wall Ball Tips", note: { ko: "USA 라크로스 공식 영상", en: "Official USA Lacrosse video", es: "Vídeo oficial de USA Lacrosse" }, url: "https://www.youtube.com/watch?v=eiwZV_a2EfY" },
    ],
  },
  {
    group: { ko: "컨디셔닝", en: "Conditioning", es: "Acondicionamiento" },
    videos: [
      { title: "Best Conditioning Drills — Relentless", note: { ko: "Coach Kyle — 300 셔틀 + 수어사이드", en: "Coach Kyle — 300 shuttle + suicides", es: "Coach Kyle: shuttle de 300 + progresivos" }, url: "https://www.youtube.com/watch?v=UOROCjSfygU" },
      { title: "300-Yard Shuttle Test — Demo", note: { ko: "NCAA D1 벤치마크 — 콘 세팅·방향", en: "NCAA D1 benchmark — cone setup and direction", es: "Referencia NCAA D1: colocación de conos y recorrido" }, url: "https://www.youtube.com/shorts/pprgR6tXDqU" },
      { title: "Maryland Conditioning — Tempo Runs", note: { ko: "메릴랜드 D1 실제 컨디셔닝", en: "Maryland's actual D1 conditioning session", es: "Sesión real de acondicionamiento de Maryland (D1)" }, url: "https://www.youtube.com/watch?v=qijojeuT0GI" },
      { title: "Strength Training — 4 Keys", note: { ko: "플라이오·후면사슬·키네틱체인", en: "Plyometrics, posterior chain and kinetic chain", es: "Pliometría, cadena posterior y cadena cinética" }, url: "https://www.youtube.com/watch?v=QUvHzxalOiM" },
    ],
  },
  {
    group: { ko: "팀 드릴", en: "Team drills", es: "Ejercicios de equipo" },
    videos: [
      { title: "Plus 1 Ground Ball Drill (POWLAX)", note: { ko: "2v2 → 3v2 그라운드볼 전환", en: "Ground ball transition from 2v2 into 3v2", es: "Transición de balón raso de 2 contra 2 a 3 contra 2" }, url: "https://www.youtube.com/watch?v=YpxvkEaj2gI" },
      { title: "Apache Ground Ball — Colgate", note: { ko: "콜게이트 D1 코치의 고강도 GB", en: "High-intensity ground balls from a Colgate D1 coach", es: "Balones rasos de alta intensidad de un entrenador de Colgate (D1)" }, url: "https://www.youtube.com/watch?v=sRZjxsoXRgA" },
      { title: "Triangle Show Drill (POWLAX)", note: { ko: "3v3 인접 슬라이드 & 리커버", en: "3v3 adjacent slide and recover", es: "Ayuda y recuperación adyacente en 3 contra 3" }, url: "https://www.youtube.com/watch?v=AKbwwcePPcM" },
      { title: "Line Bump Drill (POWLAX)", note: { ko: "크리스 슬라이드 & 리커버 소통", en: "Crease slide and recover communication", es: "Comunicación en ayuda y recuperación en el área" }, url: "https://www.youtube.com/watch?v=JMSYMLeE0uQ" },
      { title: "Notre Dame Drills — Playlist", note: { ko: "노트르담 D1 실전 연습 영상 모음", en: "A collection of real Notre Dame D1 practice footage", es: "Recopilación de entrenamientos reales de Notre Dame (D1)" }, url: "https://www.youtube.com/playlist?list=PLW9zBdQE1wgnGJtCbCp0glvvKIgwFUdgC" },
    ],
  },
  {
    group: { ko: "어택", en: "Attack", es: "Ataque" },
    videos: [
      { title: "Paul Rabil's Favorite Shooting Drill (2025)", note: { ko: "PLL 공동창립자 — 슛 파워", en: "PLL co-founder — shot power", es: "Cofundador de la PLL: potencia de tiro" }, url: "https://www.youtube.com/watch?v=SS38Z1WG5as" },
      { title: "Paul Rabil Split Dodge Mechanics", note: { ko: "Team USA & MLL MVP — 스플릿 도지", en: "Team USA and MLL MVP — the split dodge", es: "MVP de Team USA y la MLL: el split dodge" }, url: "https://www.youtube.com/watch?v=M4Tvpgv1RA0" },
      { title: "Paul Rabil Split Dodge Agility", note: { ko: "측면 민첩성 중심 스플릿 도지", en: "The split dodge, focused on lateral agility", es: "El split dodge, centrado en la agilidad lateral" }, url: "https://www.youtube.com/watch?v=P2OjcuhVqPI" },
      { title: "Low Angle Shooting from X", note: { ko: "X 뒤에서 GLE 로우앵글 슛", en: "Low-angle shooting from behind X at goal line extended", es: "Tiro de ángulo bajo desde detrás de X, a la altura de la línea de gol" }, url: "https://www.youtube.com/watch?v=DsH3Ym_7e8k" },
      { title: "Best College Shooting — Spallina, Kirst", note: { ko: "톱 D1 선수 슈팅 루틴 비교", en: "Comparing the shooting routines of top D1 players", es: "Comparativa de rutinas de tiro de los mejores jugadores D1" }, url: "https://www.youtube.com/watch?v=35c_reV3p-A" },
      { title: "Attackman Drills — Playlist", note: { ko: "어택맨 전용 재생목록", en: "A playlist just for attackmen", es: "Lista de reproducción solo para atacantes" }, url: "https://www.youtube.com/playlist?list=PLW9zBdQE1wgl0v6fvlQPKmIvcy2i5b9N5" },
    ],
  },
  {
    group: { ko: "디펜스", en: "Defense", es: "Defensa" },
    videos: [
      { title: "Greatest Defensive Footwork — GLE (2024)", note: { ko: "가장 최신 D1급 수비 풋워크", en: "The most current D1-level defensive footwork", es: "El juego de pies defensivo más actual a nivel D1" }, url: "https://www.youtube.com/watch?v=XmCnzjD80KY" },
      { title: "Maryland AJ Larkin 'T' Footwork (2025)", note: { ko: "D1 T자 수비 풋워크", en: "D1 T-shaped defensive footwork", es: "Juego de pies defensivo en T a nivel D1" }, url: "https://www.youtube.com/watch?v=Q14sn4Y7S2Y" },
      { title: "Best Defensive Drill — ex-Penn State", note: { ko: "1v1 풋워크·포지셔닝", en: "1v1 footwork and positioning", es: "Juego de pies y colocación en 1 contra 1" }, url: "https://www.youtube.com/watch?v=aDzLK-0Zctc" },
      { title: "The Random Drill for Defensemen — PLL", note: { ko: "PLL 수비 반응 속도·스틱", en: "PLL defensive reaction speed and stick work", es: "Velocidad de reacción y stick defensivo en la PLL" }, url: "https://www.youtube.com/watch?v=bTyj72cdRfY" },
      { title: "Breakdown Knockdown Drill — PLL", note: { ko: "브레이크다운 풋워크 — 첫 슬라이드", en: "Breakdown footwork — the first slide", es: "Juego de pies de frenado: la primera ayuda" }, url: "https://www.youtube.com/watch?v=pFWhmjW3uH4" },
      { title: "Backyard Defensive Footwork — FCL", note: { ko: "FCL 디렉터 Matt Dunn 풀 워크아웃", en: "A full workout from FCL director Matt Dunn", es: "Entrenamiento completo del director de FCL, Matt Dunn" }, url: "https://www.youtube.com/watch?v=VxGmfQUvX_k" },
      { title: "Defense Drills — Playlist", note: { ko: "수비 완전 재생목록", en: "The complete defence playlist", es: "Lista de reproducción completa de defensa" }, url: "https://www.youtube.com/playlist?list=PLW9zBdQE1wgkr4l_Fvf3wCTG-iF2uus92" },
    ],
  },
  {
    group: { ko: "골리", en: "Goalie", es: "Portero" },
    videos: [
      { title: "Walk the Line (Men's)", note: { ko: "세이브 동작 근육 기억 — 골리 플랜의 그 드릴", en: "Muscle memory for the save motion — the drill from the goalie plan", es: "Memoria muscular del gesto de parada: el ejercicio del plan de portero" }, url: "https://www.youtube.com/watch?v=_HpOBBqzEjo" },
      { title: "Goalie Training 101 (2025)", note: { ko: "가장 포괄적인 최신 골리 영상", en: "The most comprehensive recent goalie video", es: "El vídeo de portero reciente más completo" }, url: "https://www.youtube.com/watch?v=rL9HesRmqgs" },
      { title: "PLL Colin Kirst — 30+ Drills", note: { ko: "PLL Cannons 골리 — 핫포테이토 등", en: "PLL Cannons goalie — hot potato and more", es: "Portero de los PLL Cannons: patata caliente y más" }, url: "https://www.youtube.com/watch?v=IkEHnEEnbP0" },
      { title: "7 Goalie Drills (Goalie Summit)", note: { ko: "소프트핸즈·리바운드·라이브 슛", en: "Soft hands, rebounds and live shots", es: "Manos blandas, rechaces y tiros reales" }, url: "https://www.youtube.com/watch?v=lbztSIupI8E" },
      { title: "Goalie Footwork — Ohio State (D1)", note: { ko: "크리스 무빙·셔플·포지셔닝", en: "Crease movement, shuffling and positioning", es: "Movimiento en el área, desplazamientos y colocación" }, url: "https://www.youtube.com/watch?v=g_BksY2q5Gk" },
      { title: "PLL Pro Goalies 1v1 (2025)", note: { ko: "PLL 올스타 반응·판단 스킬", en: "PLL all-star reaction and decision skills", es: "Reacción y toma de decisiones de los all-star de la PLL" }, url: "https://www.youtube.com/watch?v=086mBke4_G8" },
      { title: "Footwork & Hand-Eye — Goalie Summit 13", note: { ko: "풋워크·핸드아이 라이브 코칭", en: "Live coaching on footwork and hand-eye", es: "Sesión en directo sobre juego de pies y coordinación óculo-manual" }, url: "https://www.youtube.com/watch?v=gqZnaVLcM_o" },
    ],
  },
  {
    group: "FOGO",
    videos: [
      { title: "How to Take a Faceoff — Trevor Baptiste", note: { ko: "세계 최고 FOGO — 스탠스·그립·클램프", en: "The world's best FOGO — stance, grip and clamp", es: "El mejor FOGO del mundo: postura, agarre y clamp" }, url: "https://www.youtube.com/watch?v=SyOeFQ3p0zY" },
      { title: "HOW TO FACEOFF: EXITS (2024)", note: { ko: "클램프·레이크·점프스텝 엑싯", en: "Clamp, rake and jump-step exits", es: "Salidas con clamp, rastrillo y paso saltado" }, url: "https://www.youtube.com/watch?v=rZ_qvx17rPk" },
      { title: "Faceoff Drills — Warmup & Beginner", note: { ko: "입문 필수 페이스오프 워밍업 3종", en: "Three essential face-off warm-ups for beginners", es: "Tres calentamientos de saque imprescindibles para empezar" }, url: "https://www.youtube.com/watch?v=-ZwugCY__MU" },
      { title: "Four FOGO Drills — USA Lacrosse", note: { ko: "Stevenson 코치 Paul Cantabene 공식", en: "Official, from Stevenson coach Paul Cantabene", es: "Oficial, del entrenador de Stevenson Paul Cantabene" }, url: "https://www.youtube.com/watch?v=gw-1dyM6CvM" },
      { title: "Faceoff Tactic from Duke (D1)", note: { ko: "듀크 D1 전술적 페이스오프", en: "Tactical face-offs from Duke (D1)", es: "Saques tácticos de Duke (D1)" }, url: "https://www.youtube.com/watch?v=6xHOvbfhZ7k" },
    ],
  },
];

// 12. Daily habits
export const LAX_HABITS: NamedItem[] = [
  { name: { ko: "월볼 매일 20분+", en: "20+ minutes of wall ball daily", es: "Más de 20 minutos de pared al día" }, detail: { ko: "양손, 매일. 엘리트는 500회 목표.", en: "Both hands, every day. Elite players aim for 500 reps.", es: "Ambas manos, todos los días. Los jugadores de élite apuntan a 500 repeticiones." } },
  { name: { ko: "활동 전 동적 웜업", en: "Dynamic warm-up before any activity", es: "Calentamiento dinámico antes de cualquier actividad" }, detail: { ko: "절대 콜드 스타트 금지. 개인 운동도 동적 웜업으로 시작.", en: "Never start cold. Even solo sessions begin with a dynamic warm-up.", es: "Nunca empieces en frío. Incluso las sesiones en solitario comienzan con calentamiento dinámico." } },
  { name: { ko: "트리플 스렛 스틱 컨트롤", en: "Triple-threat stick control", es: "Control del stick en triple amenaza" }, detail: { ko: "매일 5분 — 탑핸드 크레들, 콰이엇 스틱, 양손.", en: "Five minutes a day — top-hand cradle, quiet stick, both hands.", es: "Cinco minutos al día: cradle con la mano superior, stick tranquilo, ambas manos." } },
  { name: { ko: "세션당 개선 1개 기록", en: "Log one improvement per session", es: "Anota una mejora por sesión" }, detail: { ko: "적어두기. 스테이션 10개 × 1개 = 주당 30개 개선.", en: "Write it down. Ten stations times one each is 30 improvements a week.", es: "Escríbelo. Diez estaciones por una cada una son 30 mejoras a la semana." } },
  { name: { ko: "수분 + 운동 후 영양", en: "Hydration + post-training nutrition", es: "Hidratación y nutrición posentrenamiento" }, detail: { ko: "즉시 재수분. 운동 후 30분 내 영양 섭취.", en: "Rehydrate straight away. Eat within 30 minutes of finishing.", es: "Rehidrátate de inmediato. Come en los 30 minutos siguientes." } },
  { name: { ko: "취침 전 10분 시각화", en: "Ten minutes of visualisation before bed", es: "Diez minutos de visualización antes de dormir" }, detail: { ko: "그라운드볼 획득·도지·정확한 패스를 성공하는 자신을 상상.", en: "Picture yourself winning ground balls, beating your defender and hitting the pass.", es: "Visualízate ganando balones rasos, superando a tu defensor y acertando el pase." } },
];

// Flattened list for unified search (title + url).
export function lacrosseSearchItems(): { title: string; note: Localized; url: string; group: Localized }[] {
  return LAX_VIDEOS.flatMap((g) => g.videos.map((v) => ({ ...v, group: g.group })));
}
