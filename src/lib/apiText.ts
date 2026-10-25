import { getLang } from "./getLang";
import { fail } from "./api";
import type { Lang } from "./i18n";

// Error messages the team log APIs send back, in the caller's language. The
// forms show the server's message as-is, so an English one surfaced in the
// middle of a Spanish screen ("Check the email").
//
// Validation schemas use these keys as their messages; anything that isn't a
// key (zod's own wording) falls back to `invalid`.

const TEXT = {
  signIn: { en: "Sign in to continue", es: "Inicia sesión para continuar", ko: "로그인이 필요해요" },
  teamNotFound: { en: "Team not found", es: "No se encontró el equipo", ko: "팀을 찾을 수 없어요" },
  notOnTeam: { en: "They are not on this team", es: "Ese jugador no está en el equipo", ko: "이 팀의 선수가 아니에요" },
  matchNotFound: { en: "Match not found", es: "No se encontró el partido", ko: "경기를 찾을 수 없어요" },
  invalid: {
    en: "Check what you entered and try again",
    es: "Revisa los datos e inténtalo de nuevo",
    ko: "입력한 내용을 확인하고 다시 시도하세요",
  },
  checkEmail: { en: "Check the email address", es: "Revisa el correo electrónico", ko: "이메일 주소를 확인하세요" },
  pickDate: { en: "Pick a date", es: "Elige una fecha", ko: "날짜를 고르세요" },
  addOpponent: { en: "Add the opponent", es: "Escribe el rival", ko: "상대 팀을 입력하세요" },
  addUnit: { en: "Add a unit", es: "Escribe la unidad", ko: "단원을 입력하세요" },
  addObjective: { en: "Add an objective", es: "Escribe el objetivo", ko: "목표를 입력하세요" },
  addName: { en: "Add at least one name", es: "Agrega al menos un nombre", ko: "이름을 하나 이상 입력하세요" },
  nameTooLong: { en: "Names can be up to 60 characters", es: "Los nombres pueden tener hasta 60 caracteres", ko: "이름은 60자까지 쓸 수 있어요" },
  tooManyNames: { en: "Add up to 60 names at a time", es: "Agrega hasta 60 nombres a la vez", ko: "한 번에 60명까지 추가할 수 있어요" },
  pickTerm: { en: "Pick a term", es: "Elige un semestre", ko: "학기를 고르세요" },
  shortTeamName: { en: "Team name is too short", es: "El nombre del equipo es muy corto", ko: "팀 이름이 너무 짧아요" },
  mergeNotManaged: {
    en: "Only a player without an account can be merged",
    es: "Solo se puede unir un jugador sin cuenta",
    ko: "계정 없는 선수만 합칠 수 있어요",
  },
  mergeTarget: {
    en: "Pick a teammate who has an account",
    es: "Elige un jugador del equipo que tenga cuenta",
    ko: "계정이 있는 팀원을 고르세요",
  },
  timeZone: { en: "Pick a time zone from the list", es: "Elige una zona horaria de la lista", ko: "목록에서 시간대를 고르세요" },
} satisfies Record<string, Record<Lang, string>>;

export type ApiTextKey = keyof typeof TEXT;

export function apiText(key: ApiTextKey, lang: Lang): string {
  return TEXT[key][lang];
}

/** A failure response with the message in the caller's language. */
export async function failT(key: ApiTextKey, status = 400) {
  return fail(apiText(key, await getLang()), status);
}

/** Turn a schema's first issue into a localized failure. */
export async function failIssue(issues: { message: string }[]) {
  const key = issues[0]?.message;
  return failT(key && key in TEXT ? (key as ApiTextKey) : "invalid");
}
