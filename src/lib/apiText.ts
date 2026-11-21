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
  onlyCoachTeam: { en: "Only coaches can create a team", es: "Solo los entrenadores pueden crear un equipo", ko: "코치만 팀을 만들 수 있어요" },
  createTeamFailed: { en: "Couldn't create the team", es: "No se pudo crear el equipo", ko: "팀을 만들지 못했어요" },
  newCodeFailed: { en: "Couldn't issue a new code", es: "No se pudo generar un código nuevo", ko: "새 코드를 만들지 못했어요" },
  enterCode: { en: "Enter an invite code", es: "Escribe un código de invitación", ko: "초대 코드를 입력하세요" },
  codeNoMatch: { en: "That invite code doesn't match any team", es: "Ese código de invitación no corresponde a ningún equipo", ko: "그 초대 코드에 맞는 팀이 없어요" },
  alreadyCoach: { en: "You already coach this team", es: "Ya eres el entrenador de este equipo", ko: "이미 이 팀의 코치예요" },
  announcementNotFound: { en: "Announcement not found", es: "No se encontró el aviso", ko: "공지를 찾을 수 없어요" },
  assignmentNotFound: { en: "Assignment not found", es: "No se encontró la tarea", ko: "과제를 찾을 수 없어요" },
  onlyCoachAssign: { en: "Only coaches can set assignments", es: "Solo los entrenadores pueden asignar tareas", ko: "코치만 과제를 낼 수 있어요" },
  drillNotFound: { en: "Drill not found", es: "No se encontró el ejercicio", ko: "훈련을 찾을 수 없어요" },
  drillAttach: { en: "Attach a PNG or JPEG of the drill", es: "Adjunta una imagen PNG o JPEG del ejercicio", ko: "훈련 그림(PNG 또는 JPEG)을 첨부하세요" },
  drillUnreadable: { en: "That file isn't a readable PNG or JPEG", es: "Ese archivo no es un PNG o JPEG válido", ko: "읽을 수 있는 PNG나 JPEG 파일이 아니에요" },
  drillTooBig: { en: "The drill image must be under 2 MB", es: "La imagen del ejercicio debe pesar menos de 2 MB", ko: "훈련 그림은 2MB 이하여야 해요" },
  drillSoccerOnly: { en: "Custom drills are available for soccer only", es: "Los ejercicios propios solo están disponibles para fútbol", ko: "직접 만든 훈련은 축구에서만 쓸 수 있어요" },
  drillTitle: { en: "Give the drill a title (up to 120 characters)", es: "Ponle un título al ejercicio (hasta 120 caracteres)", ko: "훈련 제목을 입력하세요 (120자까지)" },
  drillDuration: { en: "Duration must be a whole number of minutes between 1 and 240", es: "La duración debe ser un número entero de minutos entre 1 y 240", ko: "시간은 1~240분 사이의 정수여야 해요" },
  drillFormat: { en: "The drill image must be a PNG or JPEG", es: "La imagen del ejercicio debe ser PNG o JPEG", ko: "훈련 그림은 PNG나 JPEG여야 해요" },
  forbidden: { en: "You don't have permission to do that", es: "No tienes permiso para hacer eso", ko: "권한이 없어요" },
  requestNotFound: { en: "Request not found", es: "No se encontró la solicitud", ko: "요청을 찾을 수 없어요" },
  ownRequest: { en: "You can't accept a request you sent", es: "No puedes aceptar una solicitud que tú enviaste", ko: "내가 보낸 요청은 수락할 수 없어요" },
  alreadyHandled: { en: "This request was already handled", es: "Esta solicitud ya se atendió", ko: "이미 처리된 요청이에요" },
  noUserWithEmail: { en: "No one with that email address uses the app", es: "Nadie con ese correo usa la app", ko: "그 이메일을 쓰는 사용자가 없어요" },
  pickSomeone: { en: "Choose who to connect with", es: "Elige con quién conectarte", ko: "연결할 사람을 고르세요" },
  notYourself: { en: "You can't connect with yourself", es: "No puedes conectarte contigo mismo", ko: "자기 자신과는 연결할 수 없어요" },
  badDob: { en: "Check the date of birth", es: "Revisa la fecha de nacimiento", ko: "생년월일을 확인하세요" },
  usernameTaken: { en: "That username is taken", es: "Ese nombre de usuario ya está en uso", ko: "이미 사용 중인 아이디예요" },
  tellMinor: { en: "Tell us whether you are under 18", es: "Indica si tienes menos de 18 años", ko: "만 18세 미만인지 알려 주세요" },
  acceptTerms: { en: "You need to accept the Terms of Use and Privacy Notice to sign up", es: "Para registrarte debes aceptar los Términos de uso y el Aviso de privacidad", ko: "가입하려면 이용약관과 개인정보 처리방침에 동의해야 해요" },
  parentConsent: { en: "A parent or guardian must consent before anyone under 18 can sign up", es: "Un padre, madre o tutor debe dar su consentimiento para registrar a un menor de 18 años", ko: "만 18세 미만은 보호자의 동의가 있어야 가입할 수 있어요" },
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
  curp: { en: "A CURP has 18 letters and digits", es: "La CURP tiene 18 letras y números", ko: "CURP는 영문자와 숫자 18자예요" },
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
