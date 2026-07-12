// Fay School Lacrosse — Elite Training Program.
// Structured from the coach-provided overview (sourced from USA Lacrosse,
// NCAA D1 programs, and the Premier Lacrosse League). Static reference content.

export interface NamedItem {
  name: string;
  detail: string;
}
export interface Phase {
  title: string;
  time: string;
  items: NamedItem[];
  source?: string;
}
export interface PositionPlan {
  name: string;
  emoji: string;
  blocks: NamedItem[];
  source?: string;
}
export interface VideoLink {
  title: string;
  note: string;
  url: string;
}
export interface VideoGroup {
  group: string;
  videos: VideoLink[];
}

export const LAX_META = {
  title: "엘리트 훈련 프로그램",
  subtitle: "USA Lacrosse · NCAA D1 · Premier Lacrosse League 기반",
  season: "2025/2026 시즌 준비",
};

export const LAX_PRINCIPLES: NamedItem[] = [
  { name: "피로 전에 기술", detail: "기술 훈련은 항상 신선한 상태에서 — 컨디셔닝으로 신경계가 지치기 전에 먼저 합니다." },
  { name: "정적보다 동적", detail: "유소년부터 PLL까지 모든 레벨에서 정적 스트레칭 대신 동적 웜업. 활동 전 정적 스트레칭은 폭발력을 떨어뜨립니다." },
  { name: "길이보다 빈도", detail: "매일 20분 월볼이 주 2~3회 긴 세션보다 기술 습득이 빠릅니다." },
  { name: "항상 게임 스피드", detail: "모든 드릴은 실전 속도로. 60%로 대충 하면 60% 습관이 몸에 뱁니다." },
  { name: "매 세션 양손", detail: "예외 없음. 약한 손 개발이 어떤 레벨에서든 가장 빠른 향상 방법입니다." },
];

export const LAX_QUOTE = {
  text: "라크로스는 '두 발로 하는 가장 빠른 스포츠'로 불립니다. 그에 맞는 프로그램은 이 종목의 대사적 요구를 분석하는 데서 출발합니다.",
  by: "Corey Crane, Army NCAA 스트렝스 & 컨디셔닝 코치",
};

// 2. Warm-up (RAMP)
export const LAX_WARMUP: Phase[] = [
  {
    title: "Phase 1 — 일반 활성화",
    time: "5–7분",
    items: [
      { name: "동적 러닝 시퀀스", detail: "하이니·버트킥·래터럴 셔플·카리오카·백페달 — 각 2×20yd" },
      { name: "줄넘기 / 퀵풋", detail: "NCAA 팀은 래더 드릴 5~6개 또는 줄넘기로 운동감각 자극" },
      { name: "스피드 스케이터", detail: "폭발적 측면 홉으로 둔근·엉덩이 활성화. 2×15초" },
      { name: "드롭 앤 드라이브 스프린트", detail: "백페달 → 신호에 폭발적 전진 스프린트 ×4~6. 중추신경 각성" },
    ],
    source: "USA Lacrosse LaxFit; Relentless Lacrosse RAMP 프로토콜",
  },
  {
    title: "Phase 2 — 가동성 & 근육 활성화",
    time: "5–6분",
    items: [
      { name: "런지 + 상체 회전", detail: "World's Greatest Stretch — 엉덩이와 흉추 개방. 1×10yd 양방향" },
      { name: "허들 워크", detail: "고관절 개방 — 앞·뒤로 1×10yd" },
      { name: "글루트 브릿지 + 밴드 사이드 스텝", detail: "둔근·엉덩이 안정근 활성화. 각 10~12회" },
      { name: "암 서클 + 손목 롤", detail: "각 방향 30초. 던지기·받기를 위한 어깨·손목 준비" },
    ],
    source: "USA Lacrosse LaxFit 밴드 프로토콜; LaxPlayBook; Athletes Untapped",
  },
  {
    title: "Phase 3 — 스틱 스킬 웜업",
    time: "5–7분",
    items: [
      { name: "무빙 파트너 패싱", detail: "나란히 조깅하며 매회 거리 확대. 양손." },
      { name: "스타 패싱", detail: "오각형 콘 5개 — 대각선 패스 후 패스한 콘으로 스프린트. 3분 연속." },
      { name: "센터서클 노리턴 패싱", detail: "모두 움직이며 아무에게나 패스, 같은 사람에게 되돌릴 수 없음. 3~4분." },
      { name: "기브앤고 피니싱", detail: "아크에 두 줄 — 패스·스프린트·리드패스 받아 마무리. 양손." },
    ],
    source: "Lacrosse Library; GameBreaker Camps; LaxPlayBook",
  },
];

// 3. Individual stick skills
export const LAX_STICK: { group: string; items: NamedItem[]; source?: string }[] = [
  {
    group: "월볼 프로그레션",
    source: "Peak Primal Wellness; JR Minutemen; Hustle Training / Martin Bowes",
    items: [
      { name: "강한 손", detail: "100회, 특정 지점 조준, 매회 손목 스냅" },
      { name: "약한 손", detail: "바로 이어서 100회. 절대 건너뛰지 않기." },
      { name: "스위치 핸드", detail: "오른손 던지고 왼손 받기. 양방향 5분 연속." },
      { name: "퀵 스틱", detail: "벽 3~5yd에서 크레들 없이 한 동작으로 받아 던지기" },
      { name: "스플릿 도지 + 스로우", detail: "스플릿 도지 실행 후 바뀐 손으로 발사" },
      { name: "롤 도지 드릴", detail: "강한 손으로 던지고 풀 롤 도지, 약한 손으로 받아 발사" },
      { name: "런 어롱 월", detail: "벽 길이를 달리며 패스 — 벽을 달리는 팀원처럼 활용" },
      { name: "그라운드볼 스쿱 + 리파이어", detail: "벽에 던지고 바운스를 향해 돌진해 다시 슛" },
    ],
  },
  {
    group: "트리플 스렛 & 원핸드 크레들",
    items: [
      { name: "탑핸드 크레들", detail: "버트엔드가 흔들리지 않게 스틱 페이스만 회전. '콰이엇 스틱' — 항상 트리플 스렛" },
      { name: "원핸드 파워 패싱", detail: "벽에 각 손 50회. 손 독립성 향상" },
      { name: "비하인드 더 백 셀프토스", detail: "보지 않고도 스틱 헤드 위치 감각 형성" },
    ],
  },
  {
    group: "슈팅 갤러리 & 박스 드릴",
    items: [
      { name: "타임 앤 룸 슛", detail: "골로 스텝 → 볼 콜 → 피드 받아 강한 오버핸드 코너 슛" },
      { name: "온더런 슛", detail: "콘으로 컷하며 리드패스 받아 발 세우지 않고 즉시 발사" },
      { name: "박스 드릴", detail: "① 도지 시퀀스(스플릿·롤·페이스·스플릿) ② 패스 앤 컷 ③ 수비 섀도우(발놀림만, 리치 금지)" },
    ],
  },
];

// 4. Conditioning
export const LAX_CONDITIONING: NamedItem[] = [
  { name: "300야드 셔틀 (NCAA 기준)", detail: "25yd 콘 왕복 6회, 최대 강도. 세션당 2~3회, 사이 3~5분 휴식. 모든 D1의 표준 체력 테스트." },
  { name: "T-드릴", detail: "T자 콘 4개 — B로 스프린트, C·D로 셔플, B로 셔플, A로 백페달. 대학 필수 타임 테스트. 10~15회." },
  { name: "수어사이드 셔틀", detail: "10·20·30yd 왕복(~40초). 동일 시간 휴식. 3~5세트." },
  { name: "힐 스프린트 + 래터럴 바운딩", detail: "30yd 언덕 스프린트 ×6~8. 래터럴 바운딩 각 방향 2×10." },
  { name: "어질리티 래더", detail: "스트라이드런·이키셔플·인아웃·래터럴·스네이크점프 — 각 패턴 2회." },
];
export const LAX_CONDITIONING_NOTE =
  "라크로스는 약 60% 무산소/ATP · 20% 무산소-젖산 · 20% 유산소. 장거리 러닝이 아니라 고강도 인터벌 + 부분 회복으로. 스피드/어질리티는 신선할 때(초반), 컨디셔닝 피니셔는 연습 끝에 배치.";

// 5. Team drills
export const LAX_TEAM: { group: string; items: NamedItem[] }[] = [
  {
    group: "공격 드릴",
    items: [
      { name: "3맨 위브", detail: "세 명 연속 움직임 — 패스·간격·컨디셔닝" },
      { name: "도지 앤 피니시 (라이브 1v1)", detail: "라이브 도지 후 2초 안에 마무리 또는 컷터에게 피드" },
      { name: "피라미드 슈팅", detail: "크리스로 컷, 양 윙 피더 — 짧은 시간 다량의 인사이드 슛" },
      { name: "2v1 / 2v2 오드맨 러시", detail: "패스 전에 수비가 먼저 커밋하도록 유도" },
    ],
  },
  {
    group: "수비 드릴",
    items: [
      { name: "슬라이드 앤 리커버 (2v2)", detail: "25yd 박스에서 첫 수비는 버티고, 두 번째가 슬라이드, 첫 수비는 리커버" },
      { name: "지그재그 풋워크", detail: "지그재그 콘 8개 — 넓은 측면 스텝으로 후진, 몸은 항상 정면" },
      { name: "클리어 앤 라이드", detail: "골리 세이브 → 수비 클리어 → 공격 라이드. 풀필드, 20초 샷클락" },
      { name: "그라운드볼 스크램블", detail: "1v1 → 앵글 스크램블 → 2v2→3v2 전환" },
    ],
  },
  {
    group: "풀팀",
    items: [{ name: "6v6 트랜지션", detail: "풀필드, 샷클락, 소통 — 혼돈 속 질서를 찾는 훈련" }],
  },
];

// 6. Practice structures (rows: time, block, details)
export const LAX_PRACTICE_90: [string, string, string][] = [
  ["0:00", "웜업 (15분)", "Phase 1 동적 러닝 + Phase 2 가동성 + Phase 3 무빙 스틱스킬"],
  ["0:15", "스틱스킬 (18분)", "월볼(8분) + 슈팅 갤러리 스테이션당 8슛(10분)"],
  ["0:33", "팀 드릴 (35분)", "그라운드볼 + 피라미드 슈팅 → 도지/피니시 + 슬라이드/리커버 → 6v6 + 클리어/라이드"],
  ["1:08", "컨디셔닝 (14분)", "T-드릴 8~10회 → 300yd 셔틀 ×2 → 수어사이드 3세트"],
  ["1:22", "쿨다운 (8분)", "정적 스트레칭 + 수분 + 다음 연습 코칭 포인트 1개"],
];
export const LAX_PRACTICE_120: [string, string, string][] = [
  ["0:00", "웜업 (18분)", "확장 Phase 1(포텐시에이션 스프린트 포함) + 전체 Phase 2 + 스타 패싱 Phase 3"],
  ["0:18", "스틱스킬 (27분)", "월볼 각 손 100회 + 포지션별 박스 드릴(7분) + 슈팅 갤러리 12슛(10분)"],
  ["0:45", "팀 드릴 (48분)", "그라운드볼(10) → 공격 개발(12) → 수비 개발(12) → 풀팀 라이브 6v6 + 클리어/라이드(14)"],
  ["1:33", "컨디셔닝 (18분)", "T-드릴 ×10 → 300yd 셔틀 ×2 → 수어사이드 피니셔(마지막 세트 무휴식)"],
  ["1:51", "쿨다운 (9분)", "전체 정적 스트레칭 + 개인 30초 리플렉션 + 팀 디브리프 + 다음 세션 예고"],
];

// 7. Pregame (rows: time, phase, content)
export const LAX_PREGAME: [string, string, string][] = [
  ["-20분", "Phase 1 — 런 (4분)", "팀 조깅 1바퀴 → 동적 러닝 시퀀스 ~70% → 스피드 스케이터 2×15초"],
  ["-16분", "Phase 2 — 가동성 (3분)", "런지+상체회전(1×10yd) → 허들 워크(1×10yd) → 암 서클 + 손목 롤"],
  ["-13분", "Phase 3 — 스틱 (6분)", "포지션 그룹별 인사이드-아웃 라인 드릴(4분, 양손) → 그라운드볼 스쿱(2분)"],
  ["-7분", "Phase 4 — 포지션 (4분)", "동시 진행: 공격=피라미드 슈팅 | 미드=스타 드릴 | 수비=지그재그 | 골리=다양한 슛"],
  ["-3분", "Phase 5 — 락인 (3분)", "90~95% 폭발 스프린트 2회 → 골리에게 각 1슛 → 60초 팀 허들 → 30초 박스 호흡"],
];
export const LAX_PREGAME_NOTE =
  "연습 웜업과 근본적으로 다릅니다. 목표는 탱크를 비우지 않고 몸과 마음을 준비시키는 것 — 강도 ~70%, 컨디셔닝·새 기술 없음.";

// 8. Position plans
export const LAX_POSITIONS: PositionPlan[] = [
  {
    name: "어택 (Attack)",
    emoji: "🎯",
    source: "Signature Lacrosse; LaxPlayBook; GameBreaker Camps",
    blocks: [
      { name: "세 지점 도지 (12분)", detail: "윙 도지(스플릿·롤·페이스) → 탑 도지(인사이드 레인) → X 도지(케이지 뒤). 각 지점 4회, 양손." },
      { name: "X에서 피드 (10분)", detail: "골 뒤에서 드라이브하며 수비 읽기 — 첫 컷터 피드 또는 홀드 후 두 번째 찾기." },
      { name: "슈팅 갤러리 (10분)", detail: "5스테이션 로테이션: 타임앤룸 → 온더런 → 퀵스틱. 스테이션당 10슛, 양손." },
    ],
  },
  {
    name: "디펜스 (Defense)",
    emoji: "🛡️",
    source: "1st Class Lax / Jesse Bernhardt; LaxPlayBook 2026",
    blocks: [
      { name: "풋워크 & 바디 포지셔닝 (12분)", detail: "스타트-스톱 미러 + 지그재그 풋워크(콘 8개) + 셰이드/틸트 조정." },
      { name: "수비수 스틱스킬 (8분)", detail: "롱폴 월볼 각 손 50회 + Figure 8 / W / M 체크 암 패턴." },
      { name: "첫 슬라이드 + 클리어 아웃렛 (12분)", detail: "첫 슬라이드 타이밍 → 두 번째 슬라이드 규율 → 즉시 업필드 아웃렛." },
    ],
  },
  {
    name: "미드필드 (Midfield)",
    emoji: "🔄",
    source: "Lacrosse Drive; STXZ Lacrosse; Signature Lacrosse",
    blocks: [
      { name: "트랜지션 판단력 (12분)", detail: "패스트브레이크 트레일링 미드 드릴: 2v1 또는 3v2, 8초 샷클락." },
      { name: "스프린트-스위치 이중역할 (10분)", detail: "공격 세트 → 즉시 수비 위치로 스프린트. 무휴식. 4포제션 ×3세트." },
      { name: "피로 상태 슈팅 (10분)", detail: "40yd 전력 스프린트 → 패스 받아 즉시 슛, 무휴식. 각 손 8회." },
    ],
  },
  {
    name: "골리 (Goalie)",
    emoji: "🥅",
    source: "Lax Goalie Rat; Lacrosse Drive; MLL Pro Brian Phipps",
    blocks: [
      { name: "풋워크 & 스탠스 (10분)", detail: "Walk the Line(5분) — 세이브 동작 모방으로 근육 기억. 골리 셔틀 — 빠른 투구, 탑핸드·리드풋 구동." },
      { name: "소프트 핸즈 & 리바운드 (8분)", detail: "핫 포테이토(달걀처럼 받기, 낚아채지 않기). 리바운드 컨트롤: 접촉 시 살짝 크레들." },
      { name: "라이브 슛 & 클리어 (15분)", detail: "다양한 각도·거리. 세이브 후 즉시 컷하는 미드에게 아웃렛. 블라인드 리액션 슛 5개 포함." },
    ],
  },
  {
    name: "FOGO — 페이스오프",
    emoji: "⚔️",
    source: "Advanced Lacrosse USA / Coach Luke Engelke (Duke); Lacrosse Drive",
    blocks: [
      { name: "스탠스·그립·클램프 (12분)", detail: "뉴트럴 그립으로 20회 파이어아웃(속도 아닌 레버리지). 클램프 드릴: 손 속도·반응·엑싯 카운터." },
      { name: "드로우 후 그라운드볼 & 윙 (12분)", detail: "드로우 앤 스쿱 → 접촉 속 GB 획득 → 윙 아웃렛. 윙 소통 드릴. 각 사이드 10회." },
      { name: "미드필드 스킬 (8분)", detail: "스프린트-스위치 컨디셔닝 + GB 1v1 + 짧은 버스트(10/20/30yd 셔틀 ×3)." },
    ],
  },
  {
    name: "LSM — 롱스틱 미드",
    emoji: "📏",
    source: "1st Class Lax; Lacrosse Ball Store; Gladiator Lacrosse",
    blocks: [
      { name: "롱폴 풋워크 + 1v1 (12분)", detail: "롱폴 미러(풋워크만) + 롱폴 지그재그 + 15yd 박스 온볼 1v1." },
      { name: "페이스오프 윙 플레이 (10분)", detail: "리스트레이닝 라인 포지셔닝 → 상대 윙 박스아웃 GB → 패스트브레이크 미드 아웃렛." },
      { name: "롱폴 트랜지션 & 클리어 (10분)", detail: "롱폴 월볼 100회(양손) + 클리어 스프린트: 크리스에서 스쿱 → 40yd 스프린트 → 미드 아웃렛." },
    ],
  },
];

// 9. Weekly rotation
export const LAX_WEEKLY: [string, string][] = [
  ["월", "스피드 & 폭발력 — T-드릴, 힐 스프린트, 포텐시에이션, 10×40yd"],
  ["화", "개인 스틱스킬 — 월볼, 슈팅 갤러리, 박스 드릴, 1v1 도지 앤 피니시"],
  ["수", "팀 공수 — 3맨 위브, 피라미드 슈팅, 슬라이드/리커버, 지그재그, 클리어/라이드"],
  ["목", "근력 & 컨디셔닝 — 전신 키네틱체인 리프트 + 코어 서킷 + 300yd 셔틀"],
  ["금", "실전 시뮬 — 게임 페이스 웜업, 그라운드볼 스크램블, 6v6 트랜지션, 30분 라이브"],
];

// 10. Strength & plyometrics
export const LAX_STRENGTH: { group: string; items: NamedItem[] }[] = [
  {
    group: "3일 키네틱 체인 로테이션",
    items: [
      { name: "Day 1 — 스쿼트 + 푸시", detail: "고블릿 스쿼트 4×8 → 인클라인 체스트 프레스 4×8 → 스플릿 스쿼트 점프 3×5" },
      { name: "Day 2 — 런지 + 풀", detail: "리버스 런지 4×8 → 풀업 4×6 → 래터럴 바운딩 2×10" },
      { name: "Day 3 — 힌지 + 푸시", detail: "트랩바 데드리프트 4×6 → 하프닐링 숄더 프레스 3×10 → 브로드 점프 3×3" },
    ],
  },
  {
    group: "플라이오메트릭 (주 1~2회)",
    items: [
      { name: "중강도", detail: "바운딩 2×10, 래터럴 바운딩 2×10, 스쿼트 점프 3×8, 턱 점프 3×6, 앵클 홉 2×10" },
      { name: "고강도", detail: "바운딩 1×10, 뎁스 점프 10×1, 싱글레그 포고 1×10, 브로드 점프 3×3" },
    ],
  },
  {
    group: "회전 코어 서킷 (주 3회)",
    items: [
      { name: "메디신볼 회전 스로우", detail: "각 사이드 3×10 — 벽으로, 슛·패스 동작 모방" },
      { name: "메디신볼 슬램", detail: "3×8 — 접촉을 위한 코어 브레이싱" },
      { name: "러시안 트위스트 / 팔로프 프레스 / 플랭크", detail: "복사근·안티로테이션·안정성 — 각 3세트" },
    ],
  },
];

// 11. Video library
export const LAX_VIDEOS: VideoGroup[] = [
  {
    group: "웜업",
    videos: [
      { title: "Paul Rabil's Warm-Up Shooting Drill", note: "PLL / Team USA — Phase 3 스틱 활성화", url: "https://www.youtube.com/watch?v=eEjpTW9IBbU" },
      { title: "Notre Dame 3-Man Shuffle Ground Ball", note: "노트르담 — Phase 3 그라운드볼 웜업", url: "https://www.youtube.com/watch?v=KbZFNegunIo" },
      { title: "Dan Keating Ground Ball Warm-Up", note: "St. Joseph's Univ. 부수석코치 (D1)", url: "https://www.youtube.com/watch?v=jN-1aobAB18" },
    ],
  },
  {
    group: "스틱 스킬",
    videos: [
      { title: "D1 Wall Ball Routine — Mitchell Pehlke", note: "퀵스틱 50회 → 오버/사이드/언더핸드", url: "https://www.youtube.com/watch?v=xgYBdTTUBRk" },
      { title: "D1 Player's Wall Ball Routine (Lax Weekly)", note: "양손·퀵스틱·스위치 — 입문용 베스트", url: "https://www.youtube.com/watch?v=RLQB_hrszBw" },
      { title: "Pro Wall Ball — Kevin Crowley", note: "2x 올아메리칸 프로의 8드릴 루틴", url: "https://www.youtube.com/watch?v=jCP5ze6OyKw" },
      { title: "Ultimate Wall Ball — 25 Exercises, 3 Phases", note: "모든 월볼 드릴을 담은 완전판", url: "https://www.youtube.com/watch?v=eUzj3EhPBS4" },
      { title: "USA Lacrosse Official Wall Ball Tips", note: "USA 라크로스 공식 영상", url: "https://www.youtube.com/watch?v=eiwZV_a2EfY" },
    ],
  },
  {
    group: "컨디셔닝",
    videos: [
      { title: "Best Conditioning Drills — Relentless", note: "Coach Kyle — 300 셔틀 + 수어사이드", url: "https://www.youtube.com/watch?v=UOROCjSfygU" },
      { title: "300-Yard Shuttle Test — Demo", note: "NCAA D1 벤치마크 — 콘 세팅·방향", url: "https://www.youtube.com/shorts/pprgR6tXDqU" },
      { title: "Maryland Conditioning — Tempo Runs", note: "메릴랜드 D1 실제 컨디셔닝", url: "https://www.youtube.com/watch?v=qijojeuT0GI" },
      { title: "Strength Training — 4 Keys", note: "플라이오·후면사슬·키네틱체인", url: "https://www.youtube.com/watch?v=QUvHzxalOiM" },
    ],
  },
  {
    group: "팀 드릴",
    videos: [
      { title: "Plus 1 Ground Ball Drill (POWLAX)", note: "2v2 → 3v2 그라운드볼 전환", url: "https://www.youtube.com/watch?v=YpxvkEaj2gI" },
      { title: "Apache Ground Ball — Colgate", note: "콜게이트 D1 코치의 고강도 GB", url: "https://www.youtube.com/watch?v=sRZjxsoXRgA" },
      { title: "Triangle Show Drill (POWLAX)", note: "3v3 인접 슬라이드 & 리커버", url: "https://www.youtube.com/watch?v=AKbwwcePPcM" },
      { title: "Line Bump Drill (POWLAX)", note: "크리스 슬라이드 & 리커버 소통", url: "https://www.youtube.com/watch?v=JMSYMLeE0uQ" },
      { title: "Notre Dame Drills — Playlist", note: "노트르담 D1 실전 연습 영상 모음", url: "https://www.youtube.com/playlist?list=PLW9zBdQE1wgnGJtCbCp0glvvKIgwFUdgC" },
    ],
  },
  {
    group: "어택",
    videos: [
      { title: "Paul Rabil's Favorite Shooting Drill (2025)", note: "PLL 공동창립자 — 슛 파워", url: "https://www.youtube.com/watch?v=SS38Z1WG5as" },
      { title: "Paul Rabil Split Dodge Mechanics", note: "Team USA & MLL MVP — 스플릿 도지", url: "https://www.youtube.com/watch?v=M4Tvpgv1RA0" },
      { title: "Paul Rabil Split Dodge Agility", note: "측면 민첩성 중심 스플릿 도지", url: "https://www.youtube.com/watch?v=P2OjcuhVqPI" },
      { title: "Low Angle Shooting from X", note: "X 뒤에서 GLE 로우앵글 슛", url: "https://www.youtube.com/watch?v=DsH3Ym_7e8k" },
      { title: "Best College Shooting — Spallina, Kirst", note: "톱 D1 선수 슈팅 루틴 비교", url: "https://www.youtube.com/watch?v=35c_reV3p-A" },
      { title: "Attackman Drills — Playlist", note: "어택맨 전용 재생목록", url: "https://www.youtube.com/playlist?list=PLW9zBdQE1wgl0v6fvlQPKmIvcy2i5b9N5" },
    ],
  },
  {
    group: "디펜스",
    videos: [
      { title: "Greatest Defensive Footwork — GLE (2024)", note: "가장 최신 D1급 수비 풋워크", url: "https://www.youtube.com/watch?v=XmCnzjD80KY" },
      { title: "Maryland AJ Larkin 'T' Footwork (2025)", note: "D1 T자 수비 풋워크", url: "https://www.youtube.com/watch?v=Q14sn4Y7S2Y" },
      { title: "Best Defensive Drill — ex-Penn State", note: "1v1 풋워크·포지셔닝", url: "https://www.youtube.com/watch?v=aDzLK-0Zctc" },
      { title: "The Random Drill for Defensemen — PLL", note: "PLL 수비 반응 속도·스틱", url: "https://www.youtube.com/watch?v=bTyj72cdRfY" },
      { title: "Breakdown Knockdown Drill — PLL", note: "브레이크다운 풋워크 — 첫 슬라이드", url: "https://www.youtube.com/watch?v=pFWhmjW3uH4" },
      { title: "Backyard Defensive Footwork — FCL", note: "FCL 디렉터 Matt Dunn 풀 워크아웃", url: "https://www.youtube.com/watch?v=VxGmfQUvX_k" },
      { title: "Defense Drills — Playlist", note: "수비 완전 재생목록", url: "https://www.youtube.com/playlist?list=PLW9zBdQE1wgkr4l_Fvf3wCTG-iF2uus92" },
    ],
  },
  {
    group: "골리",
    videos: [
      { title: "Walk the Line (Men's)", note: "세이브 동작 근육 기억 — 골리 플랜의 그 드릴", url: "https://www.youtube.com/watch?v=_HpOBBqzEjo" },
      { title: "Goalie Training 101 (2025)", note: "가장 포괄적인 최신 골리 영상", url: "https://www.youtube.com/watch?v=rL9HesRmqgs" },
      { title: "PLL Colin Kirst — 30+ Drills", note: "PLL Cannons 골리 — 핫포테이토 등", url: "https://www.youtube.com/watch?v=IkEHnEEnbP0" },
      { title: "7 Goalie Drills (Goalie Summit)", note: "소프트핸즈·리바운드·라이브 슛", url: "https://www.youtube.com/watch?v=lbztSIupI8E" },
      { title: "Goalie Footwork — Ohio State (D1)", note: "크리스 무빙·셔플·포지셔닝", url: "https://www.youtube.com/watch?v=g_BksY2q5Gk" },
      { title: "PLL Pro Goalies 1v1 (2025)", note: "PLL 올스타 반응·판단 스킬", url: "https://www.youtube.com/watch?v=086mBke4_G8" },
      { title: "Footwork & Hand-Eye — Goalie Summit 13", note: "풋워크·핸드아이 라이브 코칭", url: "https://www.youtube.com/watch?v=gqZnaVLcM_o" },
    ],
  },
  {
    group: "FOGO",
    videos: [
      { title: "How to Take a Faceoff — Trevor Baptiste", note: "세계 최고 FOGO — 스탠스·그립·클램프", url: "https://www.youtube.com/watch?v=SyOeFQ3p0zY" },
      { title: "HOW TO FACEOFF: EXITS (2024)", note: "클램프·레이크·점프스텝 엑싯", url: "https://www.youtube.com/watch?v=rZ_qvx17rPk" },
      { title: "Faceoff Drills — Warmup & Beginner", note: "입문 필수 페이스오프 워밍업 3종", url: "https://www.youtube.com/watch?v=-ZwugCY__MU" },
      { title: "Four FOGO Drills — USA Lacrosse", note: "Stevenson 코치 Paul Cantabene 공식", url: "https://www.youtube.com/watch?v=gw-1dyM6CvM" },
      { title: "Faceoff Tactic from Duke (D1)", note: "듀크 D1 전술적 페이스오프", url: "https://www.youtube.com/watch?v=6xHOvbfhZ7k" },
    ],
  },
];

// 12. Daily habits
export const LAX_HABITS: NamedItem[] = [
  { name: "월볼 매일 20분+", detail: "양손, 매일. 엘리트는 500회 목표." },
  { name: "활동 전 동적 웜업", detail: "절대 콜드 스타트 금지. 개인 운동도 동적 웜업으로 시작." },
  { name: "트리플 스렛 스틱 컨트롤", detail: "매일 5분 — 탑핸드 크레들, 콰이엇 스틱, 양손." },
  { name: "세션당 개선 1개 기록", detail: "적어두기. 스테이션 10개 × 1개 = 주당 30개 개선." },
  { name: "수분 + 운동 후 영양", detail: "즉시 재수분. 운동 후 30분 내 영양 섭취." },
  { name: "취침 전 10분 시각화", detail: "그라운드볼 획득·도지·정확한 패스를 성공하는 자신을 상상." },
];

// Flattened list for unified search (title + url).
export function lacrosseSearchItems(): { title: string; note: string; url: string; group: string }[] {
  return LAX_VIDEOS.flatMap((g) => g.videos.map((v) => ({ ...v, group: g.group })));
}
