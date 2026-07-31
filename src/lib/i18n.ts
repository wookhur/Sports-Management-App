// i18n for the login page, the Roy signup wizard, and the authenticated
// app's NavBar. Language is stored in a plain (non-httpOnly) "lang" cookie
// so both server components (reading via next/headers cookies()) and client
// components (via document.cookie through LanguageSwitcher) can agree on it
// without a routing/middleware change. Extend `dict` here as more pages
// need translation.

export type Lang = "ko" | "en" | "es";

export const LANG_COOKIE = "lang";

/** Normalize a raw cookie value (or undefined) to a supported Lang. */
export function resolveLang(raw: string | undefined): Lang {
  if (raw === "en") return "en";
  if (raw === "es") return "es";
  return "ko";
}

// ---------------------------------------------------------------------------
// Login page
// ---------------------------------------------------------------------------
export interface LoginDict {
  tagline: string;
  heading: string;
  emailLabel: string;
  emailPlaceholder: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  submit: string;
  submitLoading: string;
  noAccount: string;
  signupLink: string;
  demoTitle: string;
  demoAthlete: string;
  demoCoach: string;
  errServer: string;
  errGeneric: (status: number) => string;
  errNetwork: string;
}

const login: Record<Lang, LoginDict> = {
  ko: {
    tagline: "기록을 측정하고 코치와 공유하세요",
    heading: "로그인",
    emailLabel: "이메일",
    emailPlaceholder: "you@example.com",
    passwordLabel: "비밀번호",
    passwordPlaceholder: "비밀번호",
    submit: "로그인",
    submitLoading: "처리 중…",
    noAccount: "계정이 없으신가요?",
    signupLink: "회원가입",
    demoTitle: "데모 계정",
    demoAthlete: "선수: athlete@example.com / password123",
    demoCoach: "코치: coach@example.com / password123",
    errServer: "서버 오류가 발생했습니다. 데이터베이스 설정을 확인해주세요.",
    errGeneric: (status) => `요청을 처리하지 못했습니다 (${status})`,
    errNetwork: "서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.",
  },
  en: {
    tagline: "Track your stats and share them with your coach",
    heading: "Log in",
    emailLabel: "Email",
    emailPlaceholder: "you@example.com",
    passwordLabel: "Password",
    passwordPlaceholder: "Password",
    submit: "Log in",
    submitLoading: "Signing in…",
    noAccount: "Don't have an account?",
    signupLink: "Sign up",
    demoTitle: "Demo accounts",
    demoAthlete: "Athlete: athlete@example.com / password123",
    demoCoach: "Coach: coach@example.com / password123",
    errServer: "A server error occurred. Please check the database configuration.",
    errGeneric: (status) => `Request failed (${status})`,
    errNetwork: "Couldn't reach the server. Please try again in a moment.",
  },
  es: {
    tagline: "Registra tus marcas y compártelas con tu entrenador",
    heading: "Iniciar sesión",
    emailLabel: "Correo electrónico",
    emailPlaceholder: "tu@ejemplo.com",
    passwordLabel: "Contraseña",
    passwordPlaceholder: "Contraseña",
    submit: "Iniciar sesión",
    submitLoading: "Procesando…",
    noAccount: "¿No tienes una cuenta?",
    signupLink: "Regístrate",
    demoTitle: "Cuentas de prueba",
    demoAthlete: "Atleta: athlete@example.com / password123",
    demoCoach: "Entrenador: coach@example.com / password123",
    errServer: "Se produjo un error en el servidor. Por favor revisa la configuración de la base de datos.",
    errGeneric: (status) => `No se pudo procesar la solicitud (${status})`,
    errNetwork: "No se pudo conectar con el servidor. Inténtalo de nuevo en un momento.",
  },
};

// ---------------------------------------------------------------------------
// Roy signup wizard
// ---------------------------------------------------------------------------
export interface SignupDict {
  common: { skip: string; next: string; back: string };
  intro: { greetingPrefix: string; greetingSuffix: string; sub: string; okay: string; haveAccount: string };
  username: { title: string; subtitle: string; suggest: string };
  school: { title: string; subtitle: string; placeholder: string };
  sportInterests: { title: string; subtitle: string };
  experience: { title: string };
  dobGrade: { title: string; subtitle: string; dobLabel: string; gradeLabel: string; gradeGroupAria: string };
  role: {
    title: string;
    subtitle: string;
    athleteName: string;
    athleteDesc: string;
    coachName: string;
    coachDesc: string;
  };
  account: {
    title: string;
    subtitle: string;
    emailLabel: string;
    emailPlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    showPassword: string;
    hidePassword: string;
    start: string;
    starting: string;
    errGeneric: string;
    errNetwork: string;
  };
}

const signup: Record<Lang, SignupDict> = {
  ko: {
    common: { skip: "건너뛰기", next: "다음", back: "이전 단계" },
    intro: {
      greetingPrefix: "안녕하세요! 저는 여러분의 AI 코치 ",
      greetingSuffix: "예요.",
      sub: "딱 맞는 코칭을 추천해드리기 위해 몇 가지 질문을 드릴게요.",
      okay: "좋아요!",
      haveAccount: "이미 계정이 있어요",
    },
    username: {
      title: "아이디를 만들어주세요",
      subtitle: "추천 아이디를 쓰거나 직접 입력하세요. 나중에 바꿀 수 있어요.",
      suggest: "다른 아이디 추천받기",
    },
    school: {
      title: "어느 학교에 다니세요?",
      subtitle: "코칭 추천에만 활용돼요. (선택)",
      placeholder: "예: 한국고등학교",
    },
    sportInterests: { title: "관심 있는 종목을 모두 골라주세요", subtitle: "여러 개를 선택할 수 있어요." },
    experience: { title: "운동 경험이 얼마나 되세요?" },
    dobGrade: {
      title: "생년월일과 학년을 알려주세요",
      subtitle: "코칭 추천에만 활용돼요. (선택)",
      dobLabel: "생년월일",
      gradeLabel: "학년",
      gradeGroupAria: "학년 선택",
    },
    role: {
      title: "선수인가요, 코치인가요?",
      subtitle: "역할에 따라 화면이 달라져요.",
      athleteName: "선수",
      athleteDesc: "기록을 측정하고 코치에게 공유해요",
      coachName: "코치",
      coachDesc: "선수 기록을 확인하고 피드백을 남겨요",
    },
    account: {
      title: "계정을 만들어주세요",
      subtitle: "거의 다 왔어요! 마지막 단계예요.",
      emailLabel: "이메일",
      emailPlaceholder: "you@example.com",
      passwordLabel: "비밀번호",
      passwordPlaceholder: "6자 이상",
      showPassword: "비밀번호 표시",
      hidePassword: "비밀번호 숨기기",
      start: "시작하기",
      starting: "가입 중…",
      errGeneric: "가입에 실패했습니다. 다시 시도해주세요.",
      errNetwork: "서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.",
    },
  },
  en: {
    common: { skip: "Skip", next: "Next", back: "Back" },
    intro: {
      greetingPrefix: "Hi! I'm ",
      greetingSuffix: ", your AI coach.",
      sub: "I'll ask a few quick questions to recommend the right coaching for you.",
      okay: "Let's go!",
      haveAccount: "I already have an account",
    },
    username: {
      title: "Create a username",
      subtitle: "Use the suggestion or type your own. You can change it later.",
      suggest: "Get another suggestion",
    },
    school: {
      title: "Which school do you attend?",
      subtitle: "Only used for coaching recommendations. (optional)",
      placeholder: "e.g. Lincoln High School",
    },
    sportInterests: { title: "Pick every sport you're interested in", subtitle: "You can select more than one." },
    experience: { title: "How much experience do you have?" },
    dobGrade: {
      title: "Tell us your birthday and grade",
      subtitle: "Only used for coaching recommendations. (optional)",
      dobLabel: "Date of birth",
      gradeLabel: "Grade",
      gradeGroupAria: "Select grade",
    },
    role: {
      title: "Are you an athlete or a coach?",
      subtitle: "Your screens will differ based on your role.",
      athleteName: "Athlete",
      athleteDesc: "Track your stats and share them with your coach",
      coachName: "Coach",
      coachDesc: "Review athlete stats and leave feedback",
    },
    account: {
      title: "Create your account",
      subtitle: "Almost there — last step!",
      emailLabel: "Email",
      emailPlaceholder: "you@example.com",
      passwordLabel: "Password",
      passwordPlaceholder: "6+ characters",
      showPassword: "Show password",
      hidePassword: "Hide password",
      start: "Get started",
      starting: "Signing up…",
      errGeneric: "Sign-up failed. Please try again.",
      errNetwork: "Couldn't reach the server. Please try again in a moment.",
    },
  },
  es: {
    common: { skip: "Omitir", next: "Siguiente", back: "Atrás" },
    intro: {
      greetingPrefix: "¡Hola! Soy ",
      greetingSuffix: ", tu entrenador con IA.",
      sub: "Te haré algunas preguntas rápidas para recomendarte la mejor formación.",
      okay: "¡Vamos!",
      haveAccount: "Ya tengo una cuenta",
    },
    username: {
      title: "Crea un nombre de usuario",
      subtitle: "Usa la sugerencia o escribe el tuyo propio. Puedes cambiarlo más adelante.",
      suggest: "Obtener otra sugerencia",
    },
    school: {
      title: "¿A qué escuela asistes?",
      subtitle: "Solo se usa para recomendaciones de entrenamiento. (opcional)",
      placeholder: "ej. Colegio Lincoln",
    },
    sportInterests: { title: "Elige todos los deportes que te interesen", subtitle: "Puedes seleccionar varios." },
    experience: { title: "¿Cuánta experiencia tienes?" },
    dobGrade: {
      title: "Cuéntanos tu fecha de nacimiento y tu grado",
      subtitle: "Solo se usa para recomendaciones de entrenamiento. (opcional)",
      dobLabel: "Fecha de nacimiento",
      gradeLabel: "Grado",
      gradeGroupAria: "Seleccionar grado",
    },
    role: {
      title: "¿Eres atleta o entrenador?",
      subtitle: "Tu pantalla cambiará según tu rol.",
      athleteName: "Atleta",
      athleteDesc: "Registra tus marcas y compártelas con tu entrenador",
      coachName: "Entrenador",
      coachDesc: "Revisa las marcas de tus atletas y deja comentarios",
    },
    account: {
      title: "Crea tu cuenta",
      subtitle: "¡Ya casi terminamos! Último paso.",
      emailLabel: "Correo electrónico",
      emailPlaceholder: "tu@ejemplo.com",
      passwordLabel: "Contraseña",
      passwordPlaceholder: "6+ caracteres",
      showPassword: "Mostrar contraseña",
      hidePassword: "Ocultar contraseña",
      start: "Comenzar",
      starting: "Registrando…",
      errGeneric: "No se pudo completar el registro. Inténtalo de nuevo.",
      errNetwork: "No se pudo conectar con el servidor. Inténtalo de nuevo en un momento.",
    },
  },
};

// Sport interest cards inside the wizard (kept separate from src/lib/sports.ts
// so the rest of the app — home page, sport hubs, guides — is unaffected).
// Swimming metric display names. Values are stored per-record as a Korean
// snapshot (metricName), so display always translates by metricKey through
// this map with the stored string as fallback (custom entries, old data).
export const METRIC_I18N: Record<string, Record<Lang, string>> = {
  freestyle_50m: { ko: "자유형 50m", en: "Freestyle 50m", es: "Estilo libre 50m" },
  freestyle_100m: { ko: "자유형 100m", en: "Freestyle 100m", es: "Estilo libre 100m" },
  backstroke_50m: { ko: "배영 50m", en: "Backstroke 50m", es: "Espalda 50m" },
  breaststroke_50m: { ko: "평영 50m", en: "Breaststroke 50m", es: "Pecho 50m" },
  butterfly_50m: { ko: "접영 50m", en: "Butterfly 50m", es: "Mariposa 50m" },
  custom: { ko: "직접 입력 (거리 선택)", en: "Custom (choose distance)", es: "Personalizado (elige distancia)" },
};

export function metricLabel(metricKey: string, fallback: string, lang: Lang): string {
  return METRIC_I18N[metricKey]?.[lang] ?? fallback;
}

// Roybot coach-tier persona names (shown next to the mascot).
export const ROYBOT_TIER_LABEL: Record<Lang, Record<"beginner" | "intermediate" | "pro", string>> = {
  ko: { beginner: "입문 코치", intermediate: "중급 코치", pro: "프로 코치" },
  en: { beginner: "Beginner Coach", intermediate: "Intermediate Coach", pro: "Pro Coach" },
  es: { beginner: "Coach Principiante", intermediate: "Coach Intermedio", pro: "Coach Pro" },
};

export const SPORT_I18N: Record<string, Record<Lang, { name: string; tagline: string }>> = {
  lacrosse: {
    ko: { name: "라크로스", tagline: "스틱 핸들링부터 1대1까지, 단계별 훈련 방식" },
    en: { name: "Lacrosse", tagline: "From stick handling to 1-on-1s, step-by-step training" },
    es: { name: "Lacrosse", tagline: "Desde el manejo del stick hasta los duelos 1 contra 1, paso a paso" },
  },
  soccer: {
    ko: { name: "축구", tagline: "터치, 패스, 드리블, 마무리까지 포지션 불문 기본 연습" },
    en: { name: "Soccer", tagline: "Touch, passing, dribbling, finishing — fundamentals for every position" },
    es: { name: "Fútbol", tagline: "Control, pase, regate y definición — fundamentos para cualquier posición" },
  },
  swimming: {
    ko: { name: "수영", tagline: "영법·거리별 랩 타임을 측정하고 기록으로 남기세요" },
    en: { name: "Swimming", tagline: "Track lap times by stroke and distance" },
    es: { name: "Natación", tagline: "Registra tus tiempos por estilo y distancia" },
  },
  track: {
    ko: { name: "육상", tagline: "세계 최고 스프린터들의 훈련법을 만나보세요" },
    en: { name: "Track & Field", tagline: "See how the world's fastest sprinters train" },
    es: { name: "Atletismo", tagline: "Descubre cómo entrenan los velocistas más rápidos del mundo" },
  },
  basketball: {
    ko: { name: "농구", tagline: "세계적인 농구 선수들의 훈련법을 만나보세요" },
    en: { name: "Basketball", tagline: "See how elite basketball players train" },
    es: { name: "Baloncesto", tagline: "Descubre cómo entrenan los jugadores de élite" },
  },
};

export const EXPERIENCE_I18N: Record<string, Record<Lang, { label: string; detail: string }>> = {
  beginner: {
    ko: { label: "처음이에요", detail: "이제 막 시작하는 단계예요" },
    en: { label: "I'm new", detail: "Just getting started" },
    es: { label: "Soy nuevo", detail: "Estoy empezando" },
  },
  intermediate: {
    ko: { label: "조금 해봤어요", detail: "기본기는 어느 정도 있어요" },
    en: { label: "Some experience", detail: "I have the basics down" },
    es: { label: "Algo de experiencia", detail: "Ya domino lo básico" },
  },
  advanced: {
    ko: { label: "많이 해봤어요", detail: "대회·훈련 경험이 많아요" },
    en: { label: "Very experienced", detail: "Lots of competition/training experience" },
    es: { label: "Mucha experiencia", detail: "Mucha experiencia en competencias y entrenamiento" },
  },
};

// Keyed by the Korean source string (GRADE_OPTIONS in lib/onboarding.ts),
// since that array is also the value stored on User.grade.
export const GRADE_I18N_EN: Record<string, string> = {
  초등학생: "Elementary school",
  중학생: "Middle school",
  고등학생: "High school",
  "대학생·성인": "College / Adult",
};

export const GRADE_I18N_ES: Record<string, string> = {
  초등학생: "Primaria",
  중학생: "Secundaria",
  고등학생: "Preparatoria",
  "대학생·성인": "Universidad / Adulto",
};

// NavBar labels for the authenticated app (shared across every page since
// NavBar is imported directly rather than via a shared layout).
export interface NavDict {
  home: string;
  coachDashboard: string;
  myRecords: string;
  blog: string;
  help: string;
  roleAthlete: string;
  roleCoach: string;
}

const nav: Record<Lang, NavDict> = {
  ko: {
    home: "홈",
    coachDashboard: "코치 대시보드",
    myRecords: "내 기록",
    blog: "블로그",
    help: "도움말",
    roleAthlete: "선수",
    roleCoach: "코치",
  },
  en: {
    home: "Home",
    coachDashboard: "Coach dashboard",
    myRecords: "My records",
    blog: "Blog",
    help: "Help",
    roleAthlete: "Athlete",
    roleCoach: "Coach",
  },
  es: {
    home: "Inicio",
    coachDashboard: "Panel del entrenador",
    myRecords: "Mis marcas",
    blog: "Blog",
    help: "Ayuda",
    roleAthlete: "Atleta",
    roleCoach: "Entrenador",
  },
};

// Left sidebar (menu bar) labels.
export interface SidebarDict {
  menu: string;
  home: string;
  library: string;
  stars: string;
  leaderboard: string;
  blog: string;
  search: string;
  missions: string;
  journal: string;
  board: string;
  games: string;
  sports: string;
  myActivity: string;
  myRecords: string;
  coachDashboard: string;
  admin: string;
  openMenu: string;
  closeMenu: string;
}

const sidebar: Record<Lang, SidebarDict> = {
  ko: {
    menu: "메뉴",
    home: "홈",
    library: "트레이닝 라이브러리",
    stars: "스타 루틴",
    leaderboard: "리더보드",
    blog: "블로그",
    search: "통합 검색",
    missions: "미션",
    journal: "훈련 일지",
    board: "자유게시판",
    games: "미니게임",
    sports: "스포츠",
    myActivity: "내 활동",
    myRecords: "내 기록",
    coachDashboard: "코치 대시보드",
    admin: "운영 현황",
    openMenu: "메뉴 열기",
    closeMenu: "메뉴 닫기",
  },
  en: {
    menu: "Menu",
    home: "Home",
    library: "Training Library",
    stars: "Star Routines",
    leaderboard: "Leaderboard",
    blog: "Blog",
    search: "Search",
    missions: "Missions",
    journal: "Training Journal",
    board: "Community",
    games: "Mini-games",
    sports: "Sports",
    myActivity: "My Activity",
    myRecords: "My Records",
    coachDashboard: "Coach Dashboard",
    admin: "Operations",
    openMenu: "Open menu",
    closeMenu: "Close menu",
  },
  es: {
    menu: "Menú",
    home: "Inicio",
    library: "Biblioteca de entrenamiento",
    stars: "Rutinas de estrellas",
    leaderboard: "Clasificación",
    blog: "Blog",
    search: "Buscar",
    missions: "Misiones",
    journal: "Diario de entrenamiento",
    board: "Comunidad",
    games: "Minijuegos",
    sports: "Deportes",
    myActivity: "Mi actividad",
    myRecords: "Mis marcas",
    coachDashboard: "Panel del entrenador",
    admin: "Operaciones",
    openMenu: "Abrir menú",
    closeMenu: "Cerrar menú",
  },
};

// ---------------------------------------------------------------------------
// Missions & character hub (/missions)
// ---------------------------------------------------------------------------
export interface MissionsDict {
  title: string;
  subtitle: string;
  beans: string; // unit label, e.g. "콩"
  petTitle: string;
  petSub: string;
  hatchTo: (n: number) => string; // "부화까지 N"
  growTo: (n: number) => string; // "다음 단계까지 N"
  maxed: string;
  hatchedMsg: string;
  careHeading: string;
  careCta: (cost: number, unit: string) => string;
  notEnough: string;
  catTraining: string;
  catConditioning: string;
  catLifestyle: string;
  reward: (n: number, unit: string) => string;
  claim: string;
  claimed: string;
  claiming: string;
  progressDays: (n: number) => string;
  go: string; // "하러 가기" CTA when not yet met
  howItWorks: string;
}

const missions: Record<Lang, MissionsDict> = {
  ko: {
    title: "미션",
    subtitle: "미션을 완료해 완두콩을 모으고, 알을 돌봐 새로 키워보세요.",
    beans: "콩",
    petTitle: "내 친구 키우기",
    petSub: "완두콩으로 돌보면 무럭무럭 자라요",
    hatchTo: (n) => `부화까지 ${n}`,
    growTo: (n) => `다음 단계까지 ${n}`,
    maxed: "다 자랐어요! 최고예요 🎉",
    hatchedMsg: "축하해요! 알이 부화했어요 🐣",
    careHeading: "돌보기",
    careCta: (cost, unit) => `${cost}${unit}`,
    notEnough: "완두콩이 부족해요",
    catTraining: "훈련",
    catConditioning: "컨디셔닝",
    catLifestyle: "건강한 생활",
    reward: (n, unit) => `${n}${unit}`,
    claim: "받기",
    claimed: "완료",
    claiming: "받는 중…",
    progressDays: (n) => `현재 ${n}일`,
    go: "하러 가기",
    howItWorks: "미션을 완료하면 완두콩을 얻어요. 완두콩으로 알을 돌보면 자라서 부화하고, 진행할수록 새로운 미션과 돌보기 활동이 열려요.",
  },
  en: {
    title: "Missions",
    subtitle: "Complete missions to earn beans, then care for your egg until it hatches.",
    beans: " beans",
    petTitle: "Raise your friend",
    petSub: "Care for it with beans and watch it grow",
    hatchTo: (n) => `${n} to hatch`,
    growTo: (n) => `${n} to next stage`,
    maxed: "All grown up! Amazing 🎉",
    hatchedMsg: "Congrats! Your egg hatched 🐣",
    careHeading: "Care",
    careCta: (cost, unit) => `${cost}${unit}`,
    notEnough: "Not enough beans",
    catTraining: "Training",
    catConditioning: "Conditioning",
    catLifestyle: "Healthy lifestyle",
    reward: (n, unit) => `${n}${unit}`,
    claim: "Claim",
    claimed: "Done",
    claiming: "Claiming…",
    progressDays: (n) => `${n} day${n === 1 ? "" : "s"} so far`,
    go: "Go",
    howItWorks: "Complete missions to earn beans. Spend beans caring for your egg so it grows and hatches — new missions and care actions unlock as you progress.",
  },
  es: {
    title: "Misiones",
    subtitle: "Completa misiones para ganar guisantes y cuida tu huevo hasta que eclosione.",
    beans: " guisantes",
    petTitle: "Cría a tu amigo",
    petSub: "Cuídalo con guisantes y míralo crecer",
    hatchTo: (n) => `${n} para eclosionar`,
    growTo: (n) => `${n} para la siguiente etapa`,
    maxed: "¡Ya creció del todo! Increíble 🎉",
    hatchedMsg: "¡Felicidades! Tu huevo eclosionó 🐣",
    careHeading: "Cuidar",
    careCta: (cost, unit) => `${cost}${unit}`,
    notEnough: "Guisantes insuficientes",
    catTraining: "Entrenamiento",
    catConditioning: "Acondicionamiento",
    catLifestyle: "Vida saludable",
    reward: (n, unit) => `${n}${unit}`,
    claim: "Reclamar",
    claimed: "Hecho",
    claiming: "Reclamando…",
    progressDays: (n) => `${n} día${n === 1 ? "" : "s"} hasta ahora`,
    go: "Ir",
    howItWorks: "Completa misiones para ganar guisantes. Gástalos cuidando tu huevo para que crezca y eclosione — nuevas misiones y cuidados se desbloquean al progresar.",
  },
};

// ---------------------------------------------------------------------------
// Training load (ACWR) — shown to athletes, and later to coaches per squad
// ---------------------------------------------------------------------------
export interface LoadDict {
  title: string;
  weekLoad: string;
  vsUsual: string;
  ratio: string;
  building: string;
  buildingHint: string;
  zone: Record<string, string>;
  zoneHint: Record<string, string>;
  disclaimer: string;
  activeDays: (n: number, total: number) => string;
}

const load: Record<Lang, LoadDict> = {
  ko: {
    title: "훈련 부하",
    weekLoad: "이번 주 부하",
    vsUsual: "평소 대비",
    ratio: "부하 비율",
    building: "기준 만드는 중",
    buildingHint: "2주 이상 기록하면 평소 부하와 비교해드려요.",
    zone: { detraining: "여유", optimal: "안정", caution: "주의", high: "급증", unknown: "—" },
    zoneHint: {
      detraining: "평소보다 훈련량이 적어요. 조금 더 쌓아도 좋아요.",
      optimal: "좋은 구간이에요. 이 흐름을 유지해보세요.",
      caution: "훈련량이 빠르게 늘었어요. 회복을 챙기세요.",
      high: "평소보다 훨씬 많이 했어요. 며칠은 강도를 낮춰보세요.",
      unknown: "",
    },
    disclaimer: "참고용 지표예요. 몸에 통증이 있으면 지표와 관계없이 쉬어가세요.",
    activeDays: (n, total) => `최근 ${total}일 중 ${n}일 훈련`,
  },
  en: {
    title: "Training load",
    weekLoad: "This week",
    vsUsual: "vs usual",
    ratio: "Load ratio",
    building: "Building baseline",
    buildingHint: "Log for two weeks and we can compare against your usual load.",
    zone: { detraining: "Light", optimal: "Steady", caution: "Watch", high: "Spike", unknown: "—" },
    zoneHint: {
      detraining: "Lighter than usual — there's room to build.",
      optimal: "A good place to be. Keep this rhythm.",
      caution: "Your load climbed quickly. Prioritise recovery.",
      high: "Well above your usual. Ease off for a few days.",
      unknown: "",
    },
    disclaimer: "A guide, not a diagnosis. If something hurts, rest regardless of the number.",
    activeDays: (n, total) => `Trained ${n} of the last ${total} days`,
  },
  es: {
    title: "Carga de entrenamiento",
    weekLoad: "Esta semana",
    vsUsual: "vs. lo habitual",
    ratio: "Ratio de carga",
    building: "Creando tu base",
    buildingHint: "Registra dos semanas y podremos compararlo con tu carga habitual.",
    zone: { detraining: "Suave", optimal: "Estable", caution: "Ojo", high: "Pico", unknown: "—" },
    zoneHint: {
      detraining: "Más suave de lo habitual: hay margen para subir.",
      optimal: "Buen punto. Mantén este ritmo.",
      caution: "Tu carga subió rápido. Prioriza la recuperación.",
      high: "Muy por encima de lo habitual. Baja el ritmo unos días.",
      unknown: "",
    },
    disclaimer: "Es una guía, no un diagnóstico. Si algo duele, descansa igualmente.",
    activeDays: (n, total) => `Entrenaste ${n} de los últimos ${total} días`,
  },
};

// ---------------------------------------------------------------------------
// Companion (the pet as an app-wide buddy)
// ---------------------------------------------------------------------------
export interface CompanionDict {
  /** What the pet says, by mood. */
  say: Record<string, (name: string, n: number) => string>;
  careCta: string;
  visitCta: string;
  growthLabel: string;
  hatchIn: (n: number) => string;
}

const companion: Record<Lang, CompanionDict> = {
  ko: {
    say: {
      celebrating: () => "오늘 완전 잘했어요! 최고예요 🎉",
      proud: (_n, streak) => `${streak}일째 함께하고 있어요. 자랑스러워요!`,
      happy: () => "오늘도 움직였네요! 기분 좋아요 😊",
      hungry: () => "완두콩이 있네요! 저 좀 돌봐줄래요?",
      sleepy: (_n, days) => `${days}일째 조용해요… 같이 다시 시작해요!`,
      waiting: (name) => `${name}님, 오늘 훈련 기다리고 있어요!`,
    },
    careCta: "돌보러 가기",
    visitCta: "보러 가기",
    growthLabel: "성장",
    hatchIn: (n) => `부화까지 ${n}`,
  },
  en: {
    say: {
      celebrating: () => "You crushed it today! Amazing 🎉",
      proud: (_n, streak) => `${streak} days together now. So proud!`,
      happy: () => "You moved today — that makes me happy 😊",
      hungry: () => "You've got beans! Want to take care of me?",
      sleepy: (_n, days) => `It's been ${days} quiet days… let's start again!`,
      waiting: (name) => `${name}, I'm waiting for today's training!`,
    },
    careCta: "Take care",
    visitCta: "Visit",
    growthLabel: "Growth",
    hatchIn: (n) => `${n} to hatch`,
  },
  es: {
    say: {
      celebrating: () => "¡Lo hiciste genial hoy! Increíble 🎉",
      proud: (_n, streak) => `¡${streak} días juntos ya. Qué orgullo!`,
      happy: () => "Hoy te moviste, ¡eso me alegra! 😊",
      hungry: () => "¡Tienes guisantes! ¿Me cuidas un poco?",
      sleepy: (_n, days) => `Llevamos ${days} días en silencio… ¡empecemos de nuevo!`,
      waiting: (name) => `${name}, ¡espero tu entrenamiento de hoy!`,
    },
    careCta: "Cuidar",
    visitCta: "Ver",
    growthLabel: "Crecimiento",
    hatchIn: (n) => `${n} para eclosionar`,
  },
};

// ---------------------------------------------------------------------------
// Community board (/board)
// ---------------------------------------------------------------------------
export interface BoardDict {
  title: string;
  subtitle: string;
  newPost: string;
  empty: string;
  writeTitle: string;
  titleLabel: string;
  titlePlaceholder: string;
  bodyLabel: string;
  bodyPlaceholder: string;
  addImages: string;
  publish: string;
  publishing: string;
  cancel: string;
  errBody: string;
  errSave: string;
  backToBoard: string;
  commentsHeading: (n: number) => string;
  noComments: string;
  commentPlaceholder: string;
  send: string;
  sending: string;
  likeAria: string;
  views: string;
  deletePost: string;
  deleteConfirm: string;
  // Categories (general / tips / gameplay) + video
  categoryLabel: string;
  catAll: string;
  catGeneral: string;
  catTips: string;
  catGameplay: string;
  videoLabel: string;
  videoPlaceholder: string;
  videoHint: string;
  watchVideo: string;
  catEmpty: string;
}

const board: Record<Lang, BoardDict> = {
  ko: {
    title: "자유게시판",
    subtitle: "훈련, 식단, 일상 무엇이든 자유롭게 나눠요.",
    newPost: "글쓰기",
    empty: "아직 게시글이 없어요. 첫 글을 남겨보세요!",
    writeTitle: "새 게시글",
    titleLabel: "제목 (선택)",
    titlePlaceholder: "제목을 입력하세요",
    bodyLabel: "내용",
    bodyPlaceholder: "오늘 있었던 일을 자유롭게 적어보세요…",
    addImages: "사진 추가",
    publish: "게시하기",
    publishing: "게시 중…",
    cancel: "취소",
    errBody: "내용을 입력해주세요",
    errSave: "게시에 실패했어요. 다시 시도해주세요.",
    backToBoard: "← 자유게시판",
    commentsHeading: (n) => `댓글 ${n}개`,
    noComments: "첫 댓글을 남겨보세요.",
    commentPlaceholder: "따뜻한 댓글을 남겨주세요",
    send: "등록",
    sending: "등록 중…",
    likeAria: "좋아요",
    views: "조회",
    deletePost: "삭제",
    deleteConfirm: "이 게시글을 삭제할까요?",
    categoryLabel: "분류",
    catAll: "전체",
    catGeneral: "일반",
    catTips: "💡 팁",
    catGameplay: "🎬 경기영상",
    videoLabel: "경기 영상 링크 (선택)",
    videoPlaceholder: "YouTube·Vimeo·Hudl 링크 붙여넣기",
    videoHint: "우리 팀 경기 영상 링크를 붙여넣으면 자동으로 재생돼요.",
    watchVideo: "영상 보기",
    catEmpty: "이 분류에는 아직 게시글이 없어요.",
  },
  en: {
    title: "Community",
    subtitle: "Share anything — training, meals, everyday life.",
    newPost: "New post",
    empty: "No posts yet. Be the first to share!",
    writeTitle: "New post",
    titleLabel: "Title (optional)",
    titlePlaceholder: "Enter a title",
    bodyLabel: "Body",
    bodyPlaceholder: "Share what's on your mind today…",
    addImages: "Add photos",
    publish: "Publish",
    publishing: "Publishing…",
    cancel: "Cancel",
    errBody: "Please write something",
    errSave: "Couldn't publish. Please try again.",
    backToBoard: "← Community",
    commentsHeading: (n) => `${n} comment${n === 1 ? "" : "s"}`,
    noComments: "Be the first to comment.",
    commentPlaceholder: "Leave a kind comment",
    send: "Post",
    sending: "Posting…",
    likeAria: "Like",
    views: "views",
    deletePost: "Delete",
    deleteConfirm: "Delete this post?",
    categoryLabel: "Category",
    catAll: "All",
    catGeneral: "General",
    catTips: "💡 Tips",
    catGameplay: "🎬 Gameplay",
    videoLabel: "Gameplay video link (optional)",
    videoPlaceholder: "Paste a YouTube / Vimeo / Hudl link",
    videoHint: "Paste your team's gameplay link and it plays right here.",
    watchVideo: "Watch video",
    catEmpty: "No posts in this category yet.",
  },
  es: {
    title: "Comunidad",
    subtitle: "Comparte lo que quieras: entrenamiento, comidas, día a día.",
    newPost: "Nueva publicación",
    empty: "Aún no hay publicaciones. ¡Sé el primero!",
    writeTitle: "Nueva publicación",
    titleLabel: "Título (opcional)",
    titlePlaceholder: "Escribe un título",
    bodyLabel: "Contenido",
    bodyPlaceholder: "Comparte lo que piensas hoy…",
    addImages: "Agregar fotos",
    publish: "Publicar",
    publishing: "Publicando…",
    cancel: "Cancelar",
    errBody: "Por favor escribe algo",
    errSave: "No se pudo publicar. Inténtalo de nuevo.",
    backToBoard: "← Comunidad",
    commentsHeading: (n) => `${n} comentario${n === 1 ? "" : "s"}`,
    noComments: "Sé el primero en comentar.",
    commentPlaceholder: "Deja un comentario amable",
    send: "Enviar",
    sending: "Enviando…",
    likeAria: "Me gusta",
    views: "vistas",
    deletePost: "Eliminar",
    deleteConfirm: "¿Eliminar esta publicación?",
    categoryLabel: "Categoría",
    catAll: "Todo",
    catGeneral: "General",
    catTips: "💡 Consejos",
    catGameplay: "🎬 Jugadas",
    videoLabel: "Enlace de video (opcional)",
    videoPlaceholder: "Pega un enlace de YouTube / Vimeo / Hudl",
    videoHint: "Pega el enlace del video de tu equipo y se reproduce aquí.",
    watchVideo: "Ver video",
    catEmpty: "Aún no hay publicaciones en esta categoría.",
  },
};

// ---------------------------------------------------------------------------
// Week calendar (home)
// ---------------------------------------------------------------------------
export interface CalendarDict {
  weekdays: [string, string, string, string, string, string, string]; // Mon..Sun
  today: string;
  activity: string;
}

const calendar: Record<Lang, CalendarDict> = {
  ko: { weekdays: ["월", "화", "수", "목", "금", "토", "일"], today: "오늘", activity: "활동" },
  en: { weekdays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], today: "Today", activity: "Activity" },
  es: { weekdays: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"], today: "Hoy", activity: "Actividad" },
};

// Mission title/subtitle come from src/lib/missions.ts (keyed by Lang there).

// ---------------------------------------------------------------------------
// Training journal (/journal) — daily score in the style of a diet-app meal
// score. Score-part labels mirror the macro chips (탄/단/지) of that pattern.
// ---------------------------------------------------------------------------
export interface JournalDict {
  title: string;
  subtitle: string;
  scoreTitle: string;
  pts: (n: number) => string;
  minutesLabel: string;
  minutesVal: (n: number) => string;
  partVolume: string;
  partIntensity: string;
  partMeasure: string;
  partConsistency: string;
  warnOver: string;
  warnRest: string;
  coachName: string;
  // Rule-based coach feedback lines
  fbStart: string;
  fbPb: (n: number) => string;
  fbGreat: string;
  fbGood: string;
  fbVolumeLow: (target: number) => string;
  fbIntensityLow: string;
  fbOvertrain: string;
  fbRest: string;
  fbMeasureTip: string;
  fbConsistency: string;
  // Form
  addTitle: string;
  sportLabel: string;
  kindLabel: string;
  kinds: Record<string, string>; // TrainingKind → label
  minutesInput: string;
  intensityLabel: string;
  rpeHintLow: string;
  rpeHintMid: string;
  rpeHintHigh: string;
  notesLabel: string;
  notesPlaceholder: string;
  save: string;
  saving: string;
  errSave: string;
  deleteConfirm: string;
  deleteAria: string;
  // Lists
  todaySessions: string;
  todayRecords: string;
  emptyToday: string;
  pbBadge: string;
  measureCta: string;
  weekTitle: string;
  weekAvg: (n: number) => string;
  // Home card
  homeCta: string;
  homeEmpty: string;
}

const journal: Record<Lang, JournalDict> = {
  ko: {
    title: "훈련 일지",
    subtitle: "오늘 한 훈련을 기록하면 바로 점수로 알려드려요.",
    scoreTitle: "오늘의 트레이닝 점수",
    pts: (n) => `${n}점`,
    minutesLabel: "총 훈련 시간",
    minutesVal: (n) => `${n}분`,
    partVolume: "훈련량",
    partIntensity: "강도",
    partMeasure: "측정",
    partConsistency: "꾸준함",
    warnOver: "과훈련 주의",
    warnRest: "휴식 필요",
    coachName: "AI 코치 Roybot",
    fbStart: "첫 기록을 남겨볼까요? 짧은 훈련이라도 기록하면 점수가 시작돼요!",
    fbPb: (n) => `오늘 최고 기록 ${n}개 갱신! 🏆 측정 보너스가 반영됐어요.`,
    fbGreat: "완벽에 가까운 하루예요. 이 리듬을 유지해봐요! 🔥",
    fbGood: "좋은 흐름이에요. 부족한 부분만 조금 채우면 더 올라가요.",
    fbVolumeLow: (target) => `훈련량이 조금 부족해요. 하루 ${target}분을 목표로 해봐요.`,
    fbIntensityLow: "강도가 낮았어요. 다음 세션엔 RPE 5–8 구간을 노려봐요.",
    fbOvertrain: "오늘은 꽤 몰아붙였네요. 내일은 회복 세션이나 휴식을 추천해요.",
    fbRest: "7일 연속 훈련 중이에요. 성장은 회복에서 나와요 — 휴식일을 잡아봐요.",
    fbMeasureTip: "스톱워치로 시간을 재면 측정 점수 +15, PB면 +5까지 받을 수 있어요.",
    fbConsistency: "어제도 훈련했다면 꾸준함 점수가 붙어요. 내일도 이어가봐요!",
    addTitle: "훈련 추가",
    sportLabel: "종목",
    kindLabel: "훈련 종류",
    kinds: {
      technique: "기술",
      strength: "근력",
      cardio: "유산소",
      match: "시합",
      recovery: "회복",
    },
    minutesInput: "시간 (분)",
    intensityLabel: "강도 (RPE)",
    rpeHintLow: "가볍게",
    rpeHintMid: "적당히 힘듦",
    rpeHintHigh: "한계까지",
    notesLabel: "메모 (선택)",
    notesPlaceholder: "예: 접영 턴 연습 위주, 마지막 세트 힘들었음",
    save: "기록하기",
    saving: "기록 중…",
    errSave: "저장에 실패했어요. 다시 시도해주세요.",
    deleteConfirm: "이 훈련 기록을 삭제할까요?",
    deleteAria: "훈련 기록 삭제",
    todaySessions: "오늘의 훈련",
    todayRecords: "오늘의 측정 기록",
    emptyToday: "아직 오늘 기록한 훈련이 없어요.",
    pbBadge: "PB!",
    measureCta: "기록 측정하러 가기 →",
    weekTitle: "최근 7일",
    weekAvg: (n) => `평균 ${n}점`,
    homeCta: "일지 쓰기 →",
    homeEmpty: "오늘 훈련을 기록해보세요",
  },
  en: {
    title: "Training Journal",
    subtitle: "Log today's training and get an instant score.",
    scoreTitle: "Today's training score",
    pts: (n) => `${n}`,
    minutesLabel: "Total training time",
    minutesVal: (n) => `${n} min`,
    partVolume: "Volume",
    partIntensity: "Intensity",
    partMeasure: "Measured",
    partConsistency: "Consistency",
    warnOver: "Overtraining risk",
    warnRest: "Rest needed",
    coachName: "AI Coach Roybot",
    fbStart: "Ready for your first entry? Even a short session starts your score!",
    fbPb: (n) => `${n} personal best${n === 1 ? "" : "s"} today! 🏆 Measurement bonus applied.`,
    fbGreat: "A near-perfect day. Keep this rhythm going! 🔥",
    fbGood: "Solid work. Top up the weaker parts and the score climbs.",
    fbVolumeLow: (target) => `A bit light on volume — aim for ${target} minutes a day.`,
    fbIntensityLow: "Intensity was low. Target RPE 5–8 next session.",
    fbOvertrain: "You pushed hard today. A recovery session or rest is smart tomorrow.",
    fbRest: "Seven straight days of training. Growth comes from recovery — plan a rest day.",
    fbMeasureTip: "Time yourself with the stopwatch for +15 measurement points, +5 more on a PB.",
    fbConsistency: "Training on back-to-back days earns the consistency bonus. Keep it rolling!",
    addTitle: "Add training",
    sportLabel: "Sport",
    kindLabel: "Type",
    kinds: {
      technique: "Technique",
      strength: "Strength",
      cardio: "Cardio",
      match: "Match",
      recovery: "Recovery",
    },
    minutesInput: "Duration (min)",
    intensityLabel: "Intensity (RPE)",
    rpeHintLow: "Easy",
    rpeHintMid: "Hard-ish",
    rpeHintHigh: "Max effort",
    notesLabel: "Notes (optional)",
    notesPlaceholder: "e.g. Fly turns focus, last set was brutal",
    save: "Log it",
    saving: "Saving…",
    errSave: "Couldn't save. Please try again.",
    deleteConfirm: "Delete this training entry?",
    deleteAria: "Delete training entry",
    todaySessions: "Today's training",
    todayRecords: "Today's timed records",
    emptyToday: "Nothing logged yet today.",
    pbBadge: "PB!",
    measureCta: "Go time a swim →",
    weekTitle: "Last 7 days",
    weekAvg: (n) => `avg ${n}`,
    homeCta: "Write journal →",
    homeEmpty: "Log today's training",
  },
  es: {
    title: "Diario de entrenamiento",
    subtitle: "Registra el entrenamiento de hoy y recibe una puntuación al instante.",
    scoreTitle: "Puntuación de hoy",
    pts: (n) => `${n}`,
    minutesLabel: "Tiempo total",
    minutesVal: (n) => `${n} min`,
    partVolume: "Volumen",
    partIntensity: "Intensidad",
    partMeasure: "Medición",
    partConsistency: "Constancia",
    warnOver: "Riesgo de sobreentrenamiento",
    warnRest: "Descanso necesario",
    coachName: "Entrenador IA Roybot",
    fbStart: "¿Listo para tu primer registro? ¡Hasta una sesión corta inicia tu puntuación!",
    fbPb: (n) => `¡${n} mejor${n === 1 ? " marca" : "es marcas"} hoy! 🏆 Bono de medición aplicado.`,
    fbGreat: "Un día casi perfecto. ¡Mantén este ritmo! 🔥",
    fbGood: "Buen trabajo. Refuerza las partes débiles y la puntuación sube.",
    fbVolumeLow: (target) => `Faltó algo de volumen — apunta a ${target} minutos al día.`,
    fbIntensityLow: "La intensidad fue baja. Apunta a RPE 5–8 en la próxima sesión.",
    fbOvertrain: "Hoy apretaste fuerte. Mañana conviene recuperación o descanso.",
    fbRest: "Siete días seguidos entrenando. El progreso nace del descanso — planifica un día libre.",
    fbMeasureTip: "Cronometra una prueba para +15 puntos de medición, +5 más si es tu mejor marca.",
    fbConsistency: "Entrenar días seguidos suma el bono de constancia. ¡Sigue así!",
    addTitle: "Añadir entrenamiento",
    sportLabel: "Deporte",
    kindLabel: "Tipo",
    kinds: {
      technique: "Técnica",
      strength: "Fuerza",
      cardio: "Cardio",
      match: "Partido",
      recovery: "Recuperación",
    },
    minutesInput: "Duración (min)",
    intensityLabel: "Intensidad (RPE)",
    rpeHintLow: "Suave",
    rpeHintMid: "Exigente",
    rpeHintHigh: "Al máximo",
    notesLabel: "Notas (opcional)",
    notesPlaceholder: "ej. Enfoque en virajes de mariposa, última serie durísima",
    save: "Registrar",
    saving: "Guardando…",
    errSave: "No se pudo guardar. Inténtalo de nuevo.",
    deleteConfirm: "¿Eliminar este registro?",
    deleteAria: "Eliminar registro de entrenamiento",
    todaySessions: "Entrenamiento de hoy",
    todayRecords: "Marcas cronometradas de hoy",
    emptyToday: "Aún no has registrado nada hoy.",
    pbBadge: "¡PB!",
    measureCta: "Ir a cronometrar →",
    weekTitle: "Últimos 7 días",
    weekAvg: (n) => `media ${n}`,
    homeCta: "Escribir diario →",
    homeEmpty: "Registra el entrenamiento de hoy",
  },
};

// ---------------------------------------------------------------------------
// Public landing / intro page
// ---------------------------------------------------------------------------
export interface LandingDict {
  kicker: string;
  headline1: string;
  headline2: string;
  headlineHi: string; // highlighted word
  sub: string;
  ctaStart: string;
  ctaLogin: string;
  stats: { value: string; label: string }[];
  featuresTitle: string;
  features: { emoji: string; title: string; desc: string }[];
  finalTitle: string;
  finalSub: string;
  finalCta: string;
}

const landing: Record<Lang, LandingDict> = {
  ko: {
    kicker: "선수와 코치를 위한 트레이닝 플랫폼",
    headline1: "매일의 훈련을",
    headline2: "성장으로",
    headlineHi: "기록",
    sub: "기록을 측정하고, 점수로 확인하고, 미션으로 동기부여하세요. Sideline365는 훈련의 모든 순간을 데이터로 만듭니다.",
    ctaStart: "무료로 시작하기",
    ctaLogin: "로그인",
    stats: [
      { value: "1,440+", label: "수영 훈련 데이터" },
      { value: "40+", label: "스타 선수 루틴" },
      { value: "5", label: "종목" },
    ],
    featuresTitle: "필요한 모든 것이 한 곳에",
    features: [
      { emoji: "⏱️", title: "기록 측정", desc: "스톱워치로 랩타임을 재고 개인 최고 기록을 추적하세요." },
      { emoji: "📓", title: "훈련 일지 & 점수", desc: "매일 훈련을 기록하면 즉시 100점 만점 점수로 알려드려요." },
      { emoji: "🎯", title: "미션 & 캐릭터", desc: "미션을 완료해 완두콩을 모으고 나만의 집을 키우세요." },
      { emoji: "⭐", title: "스타 루틴", desc: "세계적인 선수들의 실제 훈련법을 만나보세요." },
      { emoji: "🏆", title: "리더보드 & 배지", desc: "친구·팀과 경쟁하고 성취를 배지로 남기세요." },
      { emoji: "💬", title: "커뮤니티", desc: "블로그·자유게시판·경기영상으로 함께 성장하세요." },
    ],
    finalTitle: "오늘, 첫 기록을 남겨보세요",
    finalSub: "가입은 1분이면 충분해요.",
    finalCta: "지금 시작하기",
  },
  en: {
    kicker: "The training platform for athletes and coaches",
    headline1: "Turn every workout",
    headline2: "into progress",
    headlineHi: "Track",
    sub: "Measure your times, see them scored, and stay motivated with missions. Sideline365 turns every moment of training into data.",
    ctaStart: "Start free",
    ctaLogin: "Log in",
    stats: [
      { value: "1,440+", label: "swim workouts" },
      { value: "40+", label: "star routines" },
      { value: "5", label: "sports" },
    ],
    featuresTitle: "Everything you need, in one place",
    features: [
      { emoji: "⏱️", title: "Time tracking", desc: "Clock lap times with the stopwatch and chase personal bests." },
      { emoji: "📓", title: "Journal & score", desc: "Log daily training and get an instant score out of 100." },
      { emoji: "🎯", title: "Missions & character", desc: "Complete missions, collect beans, and grow your house." },
      { emoji: "⭐", title: "Star routines", desc: "See how the world's best athletes actually train." },
      { emoji: "🏆", title: "Leaderboards & badges", desc: "Compete with friends and teams, earn badges." },
      { emoji: "💬", title: "Community", desc: "Blog, community board, and gameplay clips — grow together." },
    ],
    finalTitle: "Log your first time today",
    finalSub: "Signing up takes a minute.",
    finalCta: "Get started now",
  },
  es: {
    kicker: "La plataforma de entrenamiento para atletas y entrenadores",
    headline1: "Convierte cada sesión",
    headline2: "en progreso",
    headlineHi: "Registra",
    sub: "Mide tus tiempos, míralos puntuados y mantente motivado con misiones. Sideline365 convierte cada momento en datos.",
    ctaStart: "Empieza gratis",
    ctaLogin: "Iniciar sesión",
    stats: [
      { value: "1,440+", label: "entrenamientos" },
      { value: "40+", label: "rutinas estrella" },
      { value: "5", label: "deportes" },
    ],
    featuresTitle: "Todo lo que necesitas, en un solo lugar",
    features: [
      { emoji: "⏱️", title: "Cronometraje", desc: "Toma tiempos con el cronómetro y persigue tus mejores marcas." },
      { emoji: "📓", title: "Diario y puntuación", desc: "Registra el entrenamiento diario y recibe una puntuación al instante." },
      { emoji: "🎯", title: "Misiones y personaje", desc: "Completa misiones, junta guisantes y haz crecer tu casa." },
      { emoji: "⭐", title: "Rutinas estrella", desc: "Descubre cómo entrenan de verdad los mejores atletas." },
      { emoji: "🏆", title: "Clasificaciones e insignias", desc: "Compite con amigos y equipos, gana insignias." },
      { emoji: "💬", title: "Comunidad", desc: "Blog, tablón y clips de juego — creced juntos." },
    ],
    finalTitle: "Registra tu primer tiempo hoy",
    finalSub: "Registrarse toma un minuto.",
    finalCta: "Empieza ahora",
  },
};

// ---------------------------------------------------------------------------
// Home-dashboard customization (in profile / settings)
// ---------------------------------------------------------------------------
export interface SettingsDict {
  homeTitle: string;
  homeSub: string;
  saved: string;
  saveErr: string;
  widgets: Record<string, string>; // widget key → label
}

const settings: Record<Lang, SettingsDict> = {
  ko: {
    homeTitle: "홈 화면 설정",
    homeSub: "홈에서 보고 싶은 항목만 켜두세요.",
    saved: "저장됨",
    saveErr: "저장에 실패했어요.",
    widgets: {
      calendar: "주간 캘린더",
      score: "오늘의 트레이닝 점수",
      streak: "연속 출석",
      weekly: "주간 리포트",
      tasks: "훈련 과제 & 팀",
      badges: "배지",
      sports: "종목",
      recent: "최근 기록",
    },
  },
  en: {
    homeTitle: "Home screen",
    homeSub: "Keep only the sections you want to see on your home.",
    saved: "Saved",
    saveErr: "Couldn't save.",
    widgets: {
      calendar: "Week calendar",
      score: "Today's training score",
      streak: "Streak",
      weekly: "Weekly report",
      tasks: "Assignments & teams",
      badges: "Badges",
      sports: "Sports",
      recent: "Recent records",
    },
  },
  es: {
    homeTitle: "Pantalla de inicio",
    homeSub: "Deja solo las secciones que quieras ver en tu inicio.",
    saved: "Guardado",
    saveErr: "No se pudo guardar.",
    widgets: {
      calendar: "Calendario semanal",
      score: "Puntuación de hoy",
      streak: "Racha",
      weekly: "Reporte semanal",
      tasks: "Tareas y equipos",
      badges: "Insignias",
      sports: "Deportes",
      recent: "Marcas recientes",
    },
  },
};

// ---------------------------------------------------------------------------
// Bullseye mini-game (/games/bullseye)
// ---------------------------------------------------------------------------
export interface GamesDict {
  title: string;
  subtitle: string;
  howTitle: string;
  how: string[];
  start: string;
  playAgain: string;
  shotOf: (n: number, total: number) => string;
  aimPhase: string;
  powerPhase: string;
  aimHint: string;
  powerHint: string;
  lock: string;
  total: string;
  pts: (n: number) => string;
  bullseye: string;
  finalScore: string;
  newRecord: string;
  yourRank: (n: number) => string;
  submitting: string;
  leaderboard: string;
  myBest: string;
  noScores: string;
  you: string;
  plays: (n: number) => string;
  rankCol: string;
  playerCol: string;
  scoreCol: string;
}

const games: Record<Lang, GamesDict> = {
  ko: {
    title: "🎯 불스아이 챌린지",
    subtitle: "조준·파워·정확도로 과녁 정중앙을 노려보세요. 5발 합산 점수로 친구들과 대결!",
    howTitle: "플레이 방법",
    how: [
      "1️⃣ 조준(AIM): 좌우로 움직이는 조준선을 탭해서 좌우 위치를 정하세요.",
      "2️⃣ 파워(POWER): 차오르는 파워 게이지를 탭해서 힘을 정하세요. 딱 맞으면 정중앙!",
      "3️⃣ 정중앙에 가까울수록 높은 점수. 5발을 쏴서 합산 점수를 겨뤄요.",
    ],
    start: "게임 시작",
    playAgain: "다시 하기",
    shotOf: (n, total) => `${n} / ${total} 발`,
    aimPhase: "조준",
    powerPhase: "파워",
    aimHint: "탭해서 좌우를 맞추세요",
    powerHint: "탭해서 파워를 맞추세요",
    lock: "탭 / 스페이스",
    total: "합계",
    pts: (n) => `${n}점`,
    bullseye: "불스아이! 🎯",
    finalScore: "최종 점수",
    newRecord: "🏆 신기록 달성!",
    yourRank: (n) => `현재 ${n}위`,
    submitting: "기록 저장 중…",
    leaderboard: "🏆 리더보드",
    myBest: "내 최고 점수",
    noScores: "아직 기록이 없어요. 첫 도전자가 되어보세요!",
    you: "나",
    plays: (n) => `${n}회 플레이`,
    rankCol: "순위",
    playerCol: "플레이어",
    scoreCol: "점수",
  },
  en: {
    title: "🎯 Bullseye Challenge",
    subtitle: "Aim, power, accuracy — hit dead center. Compete with friends on total over 5 shots!",
    howTitle: "How to play",
    how: [
      "1️⃣ AIM: tap to lock the sweeping horizontal position.",
      "2️⃣ POWER: tap to lock the rising power gauge. Perfect power = dead center!",
      "3️⃣ Closer to center = more points. Take 5 shots and compare totals.",
    ],
    start: "Start game",
    playAgain: "Play again",
    shotOf: (n, total) => `Shot ${n} / ${total}`,
    aimPhase: "AIM",
    powerPhase: "POWER",
    aimHint: "Tap to set left/right",
    powerHint: "Tap to set power",
    lock: "Tap / Space",
    total: "Total",
    pts: (n) => `${n}`,
    bullseye: "Bullseye! 🎯",
    finalScore: "Final score",
    newRecord: "🏆 New record!",
    yourRank: (n) => `Rank #${n}`,
    submitting: "Saving…",
    leaderboard: "🏆 Leaderboard",
    myBest: "My best",
    noScores: "No scores yet. Be the first!",
    you: "You",
    plays: (n) => `${n} plays`,
    rankCol: "#",
    playerCol: "Player",
    scoreCol: "Score",
  },
  es: {
    title: "🎯 Desafío Diana",
    subtitle: "Puntería, potencia y precisión: da en el centro. ¡Compite con amigos por el total de 5 tiros!",
    howTitle: "Cómo jugar",
    how: [
      "1️⃣ PUNTERÍA: toca para fijar la posición horizontal en movimiento.",
      "2️⃣ POTENCIA: toca para fijar la barra que sube. ¡Potencia perfecta = centro!",
      "3️⃣ Más cerca del centro = más puntos. Haz 5 tiros y compara totales.",
    ],
    start: "Empezar",
    playAgain: "Jugar otra vez",
    shotOf: (n, total) => `Tiro ${n} / ${total}`,
    aimPhase: "PUNTERÍA",
    powerPhase: "POTENCIA",
    aimHint: "Toca para ajustar izq/der",
    powerHint: "Toca para ajustar la potencia",
    lock: "Toca / Espacio",
    total: "Total",
    pts: (n) => `${n}`,
    bullseye: "¡Diana! 🎯",
    finalScore: "Puntuación final",
    newRecord: "🏆 ¡Nuevo récord!",
    yourRank: (n) => `Puesto #${n}`,
    submitting: "Guardando…",
    leaderboard: "🏆 Clasificación",
    myBest: "Mi mejor",
    noScores: "Aún no hay puntuaciones. ¡Sé el primero!",
    you: "Tú",
    plays: (n) => `${n} partidas`,
    rankCol: "#",
    playerCol: "Jugador",
    scoreCol: "Puntos",
  },
};

export function t(lang: Lang) {
  return {
    login: login[lang],
    signup: signup[lang],
    nav: nav[lang],
    sidebar: sidebar[lang],
    missions: missions[lang],
    board: board[lang],
    calendar: calendar[lang],
    journal: journal[lang],
    landing: landing[lang],
    settings: settings[lang],
    games: games[lang],
    companion: companion[lang],
    load: load[lang],
  };
}

// ---------------------------------------------------------------------------
// Training-guide cards (src/lib/sports.ts). The guide data is authored in
// Korean; display translates by stable guide id with the authored string as
// the fallback — same pattern as METRIC_I18N.
// ---------------------------------------------------------------------------
export const GUIDE_LEVEL_I18N: Record<string, Record<Lang, string>> = {
  입문: { ko: "입문", en: "Beginner", es: "Principiante" },
  중급: { ko: "중급", en: "Intermediate", es: "Intermedio" },
  고급: { ko: "고급", en: "Advanced", es: "Avanzado" },
};

export function guideLevelLabel(level: string, lang: Lang): string {
  return GUIDE_LEVEL_I18N[level]?.[lang] ?? level;
}

interface GuideCopy {
  title: string;
  focus: string;
  summary: string;
}

export const GUIDE_I18N: Record<string, Record<Lang, GuideCopy>> = {
  // 🥍 Lacrosse
  "cradling-basics": {
    ko: { title: "크레들링 기본기", focus: "볼 컨트롤 · 스틱 감각", summary: "달리면서도 볼을 흘리지 않는 크레들링의 기본 리듬을 익힙니다." },
    en: { title: "Cradling Basics", focus: "Ball control · Stick feel", summary: "Build the cradling rhythm that keeps the ball secure even at a run." },
    es: { title: "Fundamentos del cradle", focus: "Control · Tacto del stick", summary: "Aprende el ritmo del cradle que mantiene la bola segura incluso corriendo." },
  },
  "passing-catching": {
    ko: { title: "패스 & 캐치", focus: "정확도 · 캐치 안정성", summary: "짝을 이뤄 정확한 패스와 안정적인 캐치를 반복 훈련합니다." },
    en: { title: "Passing & Catching", focus: "Accuracy · Clean catches", summary: "Drill accurate passes and dependable catches with a partner." },
    es: { title: "Pase y recepción", focus: "Precisión · Recepción limpia", summary: "Entrena pases precisos y recepciones seguras con un compañero." },
  },
  "ground-ball": {
    ko: { title: "그라운드 볼 장악", focus: "루즈볼 · 몸싸움", summary: "바닥에 떨어진 볼을 안정적으로 걷어 올려 소유권을 가져옵니다." },
    en: { title: "Winning Ground Balls", focus: "Loose balls · Body position", summary: "Scoop loose balls cleanly and come away with possession." },
    es: { title: "Ganar bolas al suelo", focus: "Bolas sueltas · Cuerpo", summary: "Recoge bolas sueltas con limpieza y hazte con la posesión." },
  },
  "shooting-accuracy": {
    ko: { title: "슈팅 정확도", focus: "코스 · 파워", summary: "골 네 모서리를 겨냥해 코스와 파워를 함께 끌어올립니다." },
    en: { title: "Shooting Accuracy", focus: "Placement · Power", summary: "Target the four corners to raise placement and power together." },
    es: { title: "Precisión de tiro", focus: "Colocación · Potencia", summary: "Apunta a las cuatro esquinas para ganar colocación y potencia." },
  },
  "dodging-1v1": {
    ko: { title: "도징 & 1대1", focus: "돌파 · 페인트", summary: "수비를 흔드는 도징 무브로 슈팅 각도를 만들어냅니다." },
    en: { title: "Dodging & 1-on-1", focus: "Beating your man · Feints", summary: "Use dodges that unbalance the defender and open a shooting lane." },
    es: { title: "Regate y 1 contra 1", focus: "Superar al rival · Fintas", summary: "Usa regates que desequilibren al defensor y abran el ángulo de tiro." },
  },
  // ⚽ Soccer
  "first-touch": {
    ko: { title: "볼 컨트롤 & 퍼스트 터치", focus: "트래핑 · 방향 전환", summary: "받는 즉시 원하는 방향으로 볼을 놓는 퍼스트 터치를 만듭니다." },
    en: { title: "Control & First Touch", focus: "Trapping · Changing direction", summary: "Take your first touch into the direction you actually want to go." },
    es: { title: "Control y primer toque", focus: "Recepción · Cambio de dirección", summary: "Orienta tu primer toque hacia donde de verdad quieres ir." },
  },
  "passing-move": {
    ko: { title: "패스 & 무브", focus: "정확도 · 오프더볼", summary: "패스 후 곧바로 움직이는 pass-and-move 습관을 몸에 익힙니다." },
    en: { title: "Pass & Move", focus: "Accuracy · Off-the-ball", summary: "Make passing and immediately moving an automatic habit." },
    es: { title: "Pasar y moverse", focus: "Precisión · Sin balón", summary: "Convierte el pasar y moverse enseguida en un hábito automático." },
  },
  "dribbling-cones": {
    ko: { title: "드리블 & 콘 워크", focus: "볼 다루기 · 민첩성", summary: "좁은 간격의 콘을 빠르게 통과하며 볼 터치 빈도를 높입니다." },
    en: { title: "Dribbling & Cone Work", focus: "Ball handling · Agility", summary: "Move through tight cones quickly to raise your touch frequency." },
    es: { title: "Regate y conos", focus: "Manejo · Agilidad", summary: "Pasa entre conos estrechos con rapidez para aumentar los toques." },
  },
  finishing: {
    ko: { title: "슈팅 & 마무리", focus: "결정력 · 코스", summary: "다양한 상황에서 골로 마무리하는 결정력을 훈련합니다." },
    en: { title: "Shooting & Finishing", focus: "Composure · Placement", summary: "Train the composure to finish chances from varied situations." },
    es: { title: "Tiro y definición", focus: "Definición · Colocación", summary: "Entrena la calma para definir desde situaciones variadas." },
  },
  defending: {
    ko: { title: "수비 포지셔닝", focus: "예측 · 태클 타이밍", summary: "무리한 태클 대신 각도와 타이밍으로 볼을 끊어냅니다." },
    en: { title: "Defensive Positioning", focus: "Reading play · Tackle timing", summary: "Win the ball with angles and timing instead of rash tackles." },
    es: { title: "Posicionamiento defensivo", focus: "Lectura · Timing de entrada", summary: "Roba con ángulos y timing en vez de entradas precipitadas." },
  },
};

/** Translated card copy for a guide, falling back to the authored Korean. */
export function guideCopy(
  id: string,
  lang: Lang,
  fallback: { title: string; focus: string; summary: string },
): GuideCopy {
  return GUIDE_I18N[id]?.[lang] ?? fallback;
}

// Step-by-step body of each training guide (titles, details, tips).
interface GuideBody {
  steps: { title: string; detail: string }[];
  tips: string[];
}

const GUIDE_BODY_I18N: Record<string, Partial<Record<Lang, GuideBody>>> = {
  "cradling-basics": {
    en: {
      steps: [
        { title: "Find your grip", detail: "Top hand on the throat of the stick, bottom hand loosely round the end. Keep the wrists soft." },
        { title: "Cradle standing still", detail: "Roll the wrist in a half-circle and feel the ball rock inside the pocket. 30 sec × 3." },
        { title: "Cradle walking", detail: "Walk slowly and hold the rhythm. Eyes forward, not on the ball." },
        { title: "Cradle running", detail: "Build to a jog and mix in left/right hand switches. 20m × 6." },
      ],
      tips: ["Train yourself to look ahead instead of down at the ball.", "Rock from the wrist — swinging the whole arm loses the ball."],
    },
    es: {
      steps: [
        { title: "La empuñadura", detail: "Mano superior en el cuello del stick, la inferior rodeando el extremo sin apretar. Muñecas sueltas." },
        { title: "Cradle parado", detail: "Gira la muñeca en semicírculo y siente la bola mecerse en la red. 30 s × 3." },
        { title: "Cradle caminando", detail: "Camina despacio manteniendo el ritmo. Mirada al frente, no a la bola." },
        { title: "Cradle corriendo", detail: "Sube al trote y alterna mano izquierda y derecha. 20 m × 6." },
      ],
      tips: ["Acostúmbrate a mirar al frente en vez de a la bola.", "Mece desde la muñeca — mover todo el brazo hace perder la bola."],
    },
  },
  "passing-catching": {
    en: {
      steps: [
        { title: "Box target", detail: "Pick a square target on a wall and throw 20 overhand passes from 5m." },
        { title: "Partner catches", detail: "Face a partner 10m apart and trade 15 reps with each hand." },
        { title: "Passing on the move", detail: "Move laterally and lead each other to build game-like angles." },
      ],
      tips: ["Give with the ball — pull the stick back slightly as you catch.", "Throw from beside your ear for accuracy."],
    },
    es: {
      steps: [
        { title: "Objetivo en la pared", detail: "Marca un cuadro en la pared y lanza 20 pases por encima del hombro desde 5 m." },
        { title: "Recepciones con pareja", detail: "Frente a frente a 10 m, 15 repeticiones con cada mano." },
        { title: "Pase en movimiento", detail: "Desplázate lateralmente y pasa por delante del compañero para crear ángulos reales." },
      ],
      tips: ["Acompaña la bola: retrasa un poco el stick al recibir.", "Lanza desde al lado de la oreja para ganar precisión."],
    },
  },
  "ground-ball": {
    en: {
      steps: [
        { title: "Low scoop", detail: "Bend the knees, get low and drive the stick through parallel to the ground." },
        { title: "Scoop and cradle", detail: "Go straight into a cradle the moment you pick it up to protect the ball. 15 reps." },
        { title: "Contested ground balls", detail: "Start level with a partner and fight for it, using your body to seal the angle." },
      ],
      tips: ["Scoop through the ball — never stop and stab at it.", "Break away in the opposite direction right after you pick it up."],
    },
    es: {
      steps: [
        { title: "Recogida baja", detail: "Flexiona las rodillas, baja el cuerpo y pasa el stick paralelo al suelo." },
        { title: "Recoger y proteger", detail: "Pasa al cradle en cuanto la levantes para proteger la bola. 15 repeticiones." },
        { title: "Bola disputada", detail: "Salid a la vez y disputadla usando el cuerpo para cerrar el ángulo." },
      ],
      tips: ["Recoge atravesando la bola — nunca te pares a picarla.", "Sal hacia el lado contrario justo después de recogerla."],
    },
  },
  "shooting-accuracy": {
    en: {
      steps: [
        { title: "Set shots", detail: "From a standstill, 10 reps into each corner: top left/right, bottom left/right." },
        { title: "Crank shot", detail: "Shift your weight onto the front foot and add power by rotating the torso." },
        { title: "Shooting on the run", detail: "Cradle → step → shoot as one continuous game action. 15 reps." },
      ],
      tips: ["Hip and shoulder rotation is where the power comes from.", "Favour the bottom corners — they're hardest for a keeper to reach."],
    },
    es: {
      steps: [
        { title: "Tiro parado", detail: "Desde parado, 10 repeticiones a cada esquina: arriba izq/der, abajo izq/der." },
        { title: "Tiro potente", detail: "Pasa el peso al pie adelantado y suma potencia rotando el tronco." },
        { title: "Tiro en carrera", detail: "Cradle → paso → tiro como una sola acción de juego. 15 repeticiones." },
      ],
      tips: ["La potencia sale de la rotación de cadera y hombros.", "Prioriza las esquinas bajas: son las más difíciles para el portero."],
    },
  },
  "dodging-1v1": {
    en: {
      steps: [
        { title: "Split dodge", detail: "Sharp left-right change of direction to break the defender's balance. 10 reps." },
        { title: "Roll dodge", detail: "Turn away shielding the stick with your body. 8 reps each way." },
        { title: "Live 1-on-1", detail: "Add a defender and finish dodge → shot. 6 sets." },
      ],
      tips: ["An explosive first step decides whether the dodge works.", "Sell the fake with your eyes and shoulders first."],
    },
    es: {
      steps: [
        { title: "Split dodge", detail: "Cambio brusco izquierda-derecha para romper el equilibrio del defensor. 10 repeticiones." },
        { title: "Roll dodge", detail: "Gira protegiendo el stick con el cuerpo. 8 repeticiones por lado." },
        { title: "1 contra 1 real", detail: "Con defensor, enlaza regate → tiro. 6 series." },
      ],
      tips: ["Un primer paso explosivo decide si el regate funciona.", "Vende la finta primero con la mirada y los hombros."],
    },
  },
  "first-touch": {
    en: {
      steps: [
        { title: "Wall pass control", detail: "Pass against a wall and take it away with the inside of the foot. 20 reps." },
        { title: "Cushioning", detail: "Kill a dropping ball softly with the laces, thigh and chest." },
        { title: "Touch and sprint", detail: "Push the first touch into space ahead and sprint 3m onto it." },
      ],
      tips: ["Relax the foot on contact so it absorbs the ball.", "Check over your shoulder before the ball arrives."],
    },
    es: {
      steps: [
        { title: "Control contra la pared", detail: "Pasa contra la pared y sácala con el interior del pie. 20 repeticiones." },
        { title: "Amortiguar", detail: "Mata la bola que cae con el empeine, el muslo y el pecho." },
        { title: "Control y sprint", detail: "Empuja el primer toque al espacio y esprinta 3 m a por ella." },
      ],
      tips: ["Relaja el pie al contacto para amortiguar la bola.", "Mira por encima del hombro antes de que llegue el balón."],
    },
  },
  "passing-move": {
    en: {
      steps: [
        { title: "Inside-foot passing", detail: "30 accurate ground passes with a partner 10m away." },
        { title: "Wall pass (2v1)", detail: "Use a wall or partner for a one-two to beat a defender." },
        { title: "Triangle passing", detail: "Three players in a triangle: pass, then move to the next position." },
      ],
      tips: ["Plant foot beside the ball, toes pointing where you're passing.", "Don't admire the pass — move into the next space immediately."],
    },
    es: {
      steps: [
        { title: "Pase con el interior", detail: "30 pases rasos precisos con un compañero a 10 m." },
        { title: "Pared (2 contra 1)", detail: "Usa la pared o un compañero para un uno-dos y superar al defensor." },
        { title: "Pases en triángulo", detail: "Tres jugadores en triángulo: pasa y muévete a la siguiente posición." },
      ],
      tips: ["Pie de apoyo junto al balón y punta hacia donde pasas.", "No te quedes mirando el pase: muévete al siguiente espacio."],
    },
  },
  "dribbling-cones": {
    en: {
      steps: [
        { title: "Zig-zag dribble", detail: "Six cones 1m apart, weaving with inside and outside of the foot × 5." },
        { title: "Change of pace", detail: "Slow down then accelerate between cones to break the rhythm." },
        { title: "Beat your man", detail: "Set a cone as the defender, feint, then explode past it." },
      ],
      tips: ["Short frequent touches keep the ball close to your body.", "Head up — read the next cone before you get there."],
    },
    es: {
      steps: [
        { title: "Regate en zigzag", detail: "Seis conos a 1 m, alternando interior y exterior del pie × 5." },
        { title: "Cambio de ritmo", detail: "Frena y acelera entre conos para romper el ritmo." },
        { title: "Superar al rival", detail: "Pon un cono como defensor, finta y sal explosivo." },
      ],
      tips: ["Toques cortos y frecuentes mantienen el balón cerca del cuerpo.", "Cabeza alta: lee el siguiente cono antes de llegar."],
    },
  },
  finishing: {
    en: {
      steps: [
        { title: "Set shooting", detail: "Instep shots from the edge of the box, 10 into each corner." },
        { title: "One-touch finishing", detail: "Finish crosses and cutbacks first time. 15 reps." },
        { title: "1-on-1 vs keeper", detail: "Run through and finish calmly against the keeper. 8 reps." },
      ],
      tips: ["Plant firmly beside the ball and get your body over it.", "Placement before power — go away from the keeper."],
    },
    es: {
      steps: [
        { title: "Tiro parado", detail: "Disparos de empeine desde la frontal, 10 a cada esquina." },
        { title: "Definición al primer toque", detail: "Remata centros y pases atrás al primer toque. 15 repeticiones." },
        { title: "1 contra 1 con el portero", detail: "Encara y define con calma ante el portero. 8 repeticiones." },
      ],
      tips: ["Apoya firme junto al balón y cubre con el cuerpo.", "Colocación antes que potencia: al lado contrario del portero."],
    },
  },
  defending: {
    en: {
      steps: [
        { title: "Delay", detail: "Don't dive in — sidestep and slow the attacker's progress." },
        { title: "Cut the angle", detail: "Use your body shape to close the passing lane and force them one way." },
        { title: "Intercepting", detail: "Read the moment of the pass and step in front to win it." },
      ],
      tips: ["Time it off their plant foot, not the ball.", "Stay low and never stand square with your legs apart."],
    },
    es: {
      steps: [
        { title: "Retrasar", detail: "No te lances: desplázate de lado y frena el avance del atacante." },
        { title: "Cerrar el ángulo", detail: "Orienta el cuerpo para tapar la línea de pase y llevarlo a un lado." },
        { title: "Interceptar", detail: "Lee el momento del pase y sal por delante para robarla." },
      ],
      tips: ["Calcula el tiempo por su pie de apoyo, no por el balón.", "Mantente bajo y nunca de frente con las piernas abiertas."],
    },
  },
};

/** Translated steps/tips for a guide, falling back to the authored Korean. */
export function guideBody(id: string, lang: Lang, fallback: GuideBody): GuideBody {
  return GUIDE_BODY_I18N[id]?.[lang] ?? fallback;
}
