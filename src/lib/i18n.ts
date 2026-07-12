// Minimal i18n for the login page and the Roy signup wizard. Language is
// stored in a plain (non-httpOnly) "lang" cookie so both server components
// (page.tsx, reading via next/headers cookies()) and client components
// (via document.cookie through LanguageSwitcher) can agree on it without a
// routing/middleware change. Scope is intentionally limited to these two
// entry points for now — extend `dict` here as more pages need translation.

export type Lang = "ko" | "en";

export const LANG_COOKIE = "lang";

/** Normalize a raw cookie value (or undefined) to a supported Lang. */
export function resolveLang(raw: string | undefined): Lang {
  return raw === "en" ? "en" : "ko";
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
};

// Sport interest cards inside the wizard (kept separate from src/lib/sports.ts
// so the rest of the app — home page, sport hubs, guides — is unaffected).
export const SPORT_I18N: Record<string, Record<Lang, { name: string; tagline: string }>> = {
  lacrosse: {
    ko: { name: "라크로스", tagline: "스틱 핸들링부터 1대1까지, 단계별 훈련 방식" },
    en: { name: "Lacrosse", tagline: "From stick handling to 1-on-1s, step-by-step training" },
  },
  soccer: {
    ko: { name: "축구", tagline: "터치, 패스, 드리블, 마무리까지 포지션 불문 기본 연습" },
    en: { name: "Soccer", tagline: "Touch, passing, dribbling, finishing — fundamentals for every position" },
  },
  swimming: {
    ko: { name: "수영", tagline: "영법·거리별 랩 타임을 측정하고 기록으로 남기세요" },
    en: { name: "Swimming", tagline: "Track lap times by stroke and distance" },
  },
};

export const EXPERIENCE_I18N: Record<string, Record<Lang, { label: string; detail: string }>> = {
  beginner: {
    ko: { label: "처음이에요", detail: "이제 막 시작하는 단계예요" },
    en: { label: "I'm new", detail: "Just getting started" },
  },
  intermediate: {
    ko: { label: "조금 해봤어요", detail: "기본기는 어느 정도 있어요" },
    en: { label: "Some experience", detail: "I have the basics down" },
  },
  advanced: {
    ko: { label: "많이 해봤어요", detail: "대회·훈련 경험이 많아요" },
    en: { label: "Very experienced", detail: "Lots of competition/training experience" },
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

export function t(lang: Lang) {
  return { login: login[lang], signup: signup[lang] };
}
