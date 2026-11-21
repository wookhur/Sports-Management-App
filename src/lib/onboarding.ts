export interface OnboardingStep {
  emoji: string;
  title: string;
  body: string;
}

const ATHLETE_STEPS: OnboardingStep[] = [
  {
    emoji: "🏅",
    title: "Sideline365에 오신 걸 환영해요!",
    body: "기록을 측정하고 코치와 공유해 더 나은 운동 성과를 만드는 앱이에요. 1분이면 둘러볼 수 있어요.",
  },
  {
    emoji: "🥍",
    title: "종목을 선택하세요",
    body: "홈 화면의 종목 카드를 눌러보세요. 라크로스·축구는 단계별 훈련 가이드를, 수영은 기록 측정 기능을 제공해요.",
  },
  {
    emoji: "⏱️",
    title: "기록을 측정해요",
    body: "수영 화면에서 타이머로 직접 시간을 재거나, '직접 입력' 탭에서 시간을 바로 타이핑해 기록할 수 있어요.",
  },
  {
    emoji: "🤝",
    title: "코치에게 공유하세요",
    body: "기록마다 공유 스위치를 켜면 연결된 코치가 확인하고 피드백을 남길 수 있어요.",
  },
  {
    emoji: "📮",
    title: "코치와 연결하세요",
    body: "'내 기록' 페이지에서 코치의 이메일을 등록하면 서로 연결돼요. 이제 시작해볼까요?",
  },
];

const COACH_STEPS: OnboardingStep[] = [
  {
    emoji: "🏅",
    title: "Sideline365에 오신 걸 환영해요!",
    body: "팀 명단, 출석, 경기, 평가까지 코치 일지를 한곳에서 관리해요. 1분이면 둘러볼 수 있어요.",
  },
  {
    emoji: "👥",
    title: "팀을 만들고 학생을 추가하세요",
    body: "팀에서 ‘+ 학생 추가’를 누르고 이름만 입력하면 돼요. 학생은 계정이 없어도 돼요.",
  },
  {
    emoji: "✅",
    title: "출석을 부르고 경기를 기록하세요",
    body: "훈련마다 출석(출석·결석·지각·사고·사유)을 체크하고, 경기는 B3에서 선수별로 기록해요.",
  },
  {
    emoji: "📄",
    title: "공식 일지를 내려받으세요",
    body: "‘코치 일지’에서 학교 시트를 채우고, 제출용 공식 엑셀을 바로 내려받아요. 시작해볼까요?",
  },
];

export function getOnboardingSteps(role: "ATHLETE" | "COACH"): OnboardingStep[] {
  return role === "COACH" ? COACH_STEPS : ATHLETE_STEPS;
}

// -----------------------------------------------------------------------------
// Signup wizard content (Roy) — experience level + grade options.
// -----------------------------------------------------------------------------
export const EXPERIENCE_LEVELS = [
  { value: "beginner", label: "처음이에요", detail: "이제 막 시작하는 단계예요" },
  { value: "intermediate", label: "조금 해봤어요", detail: "기본기는 어느 정도 있어요" },
  { value: "advanced", label: "많이 해봤어요", detail: "대회·훈련 경험이 많아요" },
] as const;

export const GRADE_OPTIONS = ["초등학생", "중학생", "고등학생", "대학생·성인"] as const;

