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
  board: string;
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
    board: "자유게시판",
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
    board: "Community",
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
    board: "Comunidad",
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
  levelLabel: (n: number) => string;
  toNextLevel: (lp: number) => string;
  houseTitle: string;
  houseSub: string;
  houseDone: string;
  repairCta: (cost: number, unit: string) => string;
  repaired: string;
  notEnough: string;
  allQuests: string;
  dailyHeading: string;
  communityHeading: string;
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
    subtitle: "미션을 완료하고 완두콩을 모아 집을 수리해보세요.",
    beans: "콩",
    levelLabel: (n) => `Lv.${n}`,
    toNextLevel: (lp) => `다음 레벨까지 ${lp}LP`,
    houseTitle: "외관 수리하기",
    houseSub: "부서진 집을 새로운 아이템으로 수리해봐요",
    houseDone: "집을 모두 수리했어요! 🎉",
    repairCta: (cost, unit) => `${cost}${unit}으로 수리하기`,
    repaired: "수리 완료",
    notEnough: "완두콩이 부족해요",
    allQuests: "전체 퀘스트 확인하기",
    dailyHeading: "오늘의 미션",
    communityHeading: "함께 해요! 자유게시판",
    reward: (n, unit) => `${n}${unit}`,
    claim: "받기",
    claimed: "완료",
    claiming: "받는 중…",
    progressDays: (n) => `현재 ${n}일`,
    go: "하러 가기",
    howItWorks: "미션을 완료하면 완두콩을 얻고, 모은 완두콩으로 부서진 집을 수리할 수 있어요. 레벨을 올려 새로운 아이템도 잠금 해제하세요.",
  },
  en: {
    title: "Missions",
    subtitle: "Complete missions, collect beans, and repair your house.",
    beans: " beans",
    levelLabel: (n) => `Lv.${n}`,
    toNextLevel: (lp) => `${lp} LP to next level`,
    houseTitle: "Repair the exterior",
    houseSub: "Fix the broken house with new items",
    houseDone: "The house is fully repaired! 🎉",
    repairCta: (cost, unit) => `Repair · ${cost} ${unit}`,
    repaired: "Repaired",
    notEnough: "Not enough beans",
    allQuests: "View all quests",
    dailyHeading: "Today's missions",
    communityHeading: "Community board",
    reward: (n, unit) => `${n}${unit}`,
    claim: "Claim",
    claimed: "Done",
    claiming: "Claiming…",
    progressDays: (n) => `${n} day${n === 1 ? "" : "s"} so far`,
    go: "Go",
    howItWorks: "Complete missions to earn beans, then spend them repairing your broken house. Level up to unlock new items.",
  },
  es: {
    title: "Misiones",
    subtitle: "Completa misiones, junta guisantes y repara tu casa.",
    beans: " guisantes",
    levelLabel: (n) => `Nv.${n}`,
    toNextLevel: (lp) => `${lp} LP para el siguiente nivel`,
    houseTitle: "Repara el exterior",
    houseSub: "Arregla la casa rota con nuevos objetos",
    houseDone: "¡La casa está totalmente reparada! 🎉",
    repairCta: (cost, unit) => `Reparar · ${cost} ${unit}`,
    repaired: "Reparado",
    notEnough: "Guisantes insuficientes",
    allQuests: "Ver todas las misiones",
    dailyHeading: "Misiones de hoy",
    communityHeading: "Tablón de la comunidad",
    reward: (n, unit) => `${n}${unit}`,
    claim: "Reclamar",
    claimed: "Hecho",
    claiming: "Reclamando…",
    progressDays: (n) => `${n} día${n === 1 ? "" : "s"} hasta ahora`,
    go: "Ir",
    howItWorks: "Completa misiones para ganar guisantes y gástalos reparando tu casa rota. Sube de nivel para desbloquear nuevos objetos.",
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

export function t(lang: Lang) {
  return {
    login: login[lang],
    signup: signup[lang],
    nav: nav[lang],
    sidebar: sidebar[lang],
    missions: missions[lang],
    board: board[lang],
    calendar: calendar[lang],
  };
}
