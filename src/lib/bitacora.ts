import { z } from "zod";
import type { Lang } from "./i18n";

// The school's soccer bitácora (coach's season log), as data.
//
// The source is the PE department's workbook. Its Spanish wording is kept
// exactly where it is the school's own (status names, evaluation points, the
// STA standards); English and Korean are translations for the app's other
// languages. The export writes the Spanish values the workbook's dropdowns
// and formulas expect.

// ---- B2 attendance ----------------------------------------------------------

export const ATTENDANCE_STATUSES = ["ASISTENCIA", "FALTA", "TARDE", "INCIDENTE", "JUSTIFICADA"] as const;
export type AttendanceStatusKey = (typeof ATTENDANCE_STATUSES)[number];

/** Late and "incident" both count as attended, as the workbook's totals do. */
export const ATTENDED: ReadonlySet<AttendanceStatusKey> = new Set(["ASISTENCIA", "TARDE", "INCIDENTE"]);

export function attendanceFlags(s: AttendanceStatusKey): { present: boolean; excused: boolean } {
  return { present: ATTENDED.has(s), excused: s === "JUSTIFICADA" };
}

/** The value the workbook's B2 dropdown holds. */
export const ATTENDANCE_SHEET_VALUE: Record<AttendanceStatusKey, string> = {
  ASISTENCIA: "Asistencia",
  FALTA: "Falta",
  TARDE: "Tarde",
  INCIDENTE: "Incidente",
  JUSTIFICADA: "Justificada",
};

export const ATTENDANCE_LABEL: Record<Lang, Record<AttendanceStatusKey, { label: string; code: string }>> = {
  es: {
    ASISTENCIA: { label: "Asistencia", code: "A" },
    FALTA: { label: "Falta", code: "F" },
    TARDE: { label: "Tarde", code: "T" },
    INCIDENTE: { label: "Incidente", code: "I" },
    JUSTIFICADA: { label: "Justificada", code: "J" },
  },
  en: {
    ASISTENCIA: { label: "Present", code: "P" },
    FALTA: { label: "Absent", code: "A" },
    TARDE: { label: "Late", code: "L" },
    INCIDENTE: { label: "Incident", code: "I" },
    JUSTIFICADA: { label: "Excused", code: "E" },
  },
  ko: {
    ASISTENCIA: { label: "출석", code: "출" },
    FALTA: { label: "결석", code: "결" },
    TARDE: { label: "지각", code: "지" },
    INCIDENTE: { label: "사고", code: "사" },
    JUSTIFICADA: { label: "사유 결석", code: "유" },
  },
};

/** Tailwind classes per status; colours also differ in lightness. */
export const ATTENDANCE_STYLE: Record<AttendanceStatusKey, string> = {
  ASISTENCIA: "bg-emerald-100 text-emerald-900",
  FALTA: "bg-slate-700 text-white",
  TARDE: "bg-amber-100 text-amber-900",
  INCIDENTE: "bg-orange-200 text-orange-950",
  JUSTIFICADA: "bg-sky-100 text-sky-900",
};

// ---- B3 match sheet ---------------------------------------------------------

export const MATCH_PLAYER_STATUSES = ["ASISTIO", "NO_ASISTIO", "JUSTIFICADO", "NO_SELECCIONADO"] as const;
export type MatchPlayerStatusKey = (typeof MATCH_PLAYER_STATUSES)[number];

/** Counted in the sheet's "total de partidos seleccionado". */
export const SELECTED: ReadonlySet<MatchPlayerStatusKey> = new Set(["ASISTIO", "NO_ASISTIO", "JUSTIFICADO"]);

/** The workbook's dropdown values (unaccented, as the sheet has them). */
export const MATCH_PLAYER_SHEET_VALUE: Record<MatchPlayerStatusKey, string> = {
  ASISTIO: "Asistio",
  NO_ASISTIO: "No asistio",
  JUSTIFICADO: "Justificado",
  NO_SELECCIONADO: "No seleccionado",
};

export const MATCH_PLAYER_LABEL: Record<Lang, Record<MatchPlayerStatusKey, string>> = {
  es: { ASISTIO: "Asistió", NO_ASISTIO: "No asistió", JUSTIFICADO: "Justificado", NO_SELECCIONADO: "No seleccionado" },
  en: { ASISTIO: "Played", NO_ASISTIO: "No-show", JUSTIFICADO: "Excused", NO_SELECCIONADO: "Not selected" },
  ko: { ASISTIO: "출전", NO_ASISTIO: "불참", JUSTIFICADO: "사유", NO_SELECCIONADO: "미선발" },
};

export const MATCH_PLAYER_STYLE: Record<MatchPlayerStatusKey, string> = {
  ASISTIO: "bg-emerald-100 text-emerald-900",
  NO_ASISTIO: "bg-slate-700 text-white",
  JUSTIFICADO: "bg-sky-100 text-sky-900",
  NO_SELECCIONADO: "bg-slate-100 text-slate-600",
};

export const MATCH_KIND_SHEET_VALUE = { LEAGUE: "LIGA", FRIENDLY: "AMISTOSO", TOURNAMENT: "TORNEO", ASOMEX: "ASOMEX" } as const;

// ---- B4 evaluations ---------------------------------------------------------

/** The workbook's scale, best first. */
export const EVAL_POINTS = [10, 9, 8, 7, 6] as const;

export const EVAL_POINT_LABEL: Record<Lang, Record<number, string>> = {
  es: { 10: "Excelente", 9: "Muy bien", 8: "Bien", 7: "Regular", 6: "Necesita mejorar" },
  en: { 10: "Excellent", 9: "Very good", 8: "Good", 7: "Fair", 6: "Needs to improve" },
  ko: { 10: "매우 우수", 9: "우수", 8: "보통", 7: "미흡", 6: "노력 필요" },
};

/** A block's grade: the average of its five points, once all five are scored. */
export function blockGrade(five: number[]): number | null {
  if (five.length !== 5 || five.some((s) => !(s >= 6 && s <= 10))) return null;
  return Math.round((five.reduce((a, b) => a + b, 0) / 5) * 10) / 10;
}

// ---- A-EV / STA self-evaluation ---------------------------------------------

export const SELF_EVAL_LEVELS = [5, 4, 3, 2] as const;

export const SELF_EVAL_LEVEL_LABEL: Record<Lang, Record<number, string>> = {
  es: { 5: "Excelente", 4: "Bien", 3: "Necesita mejorar", 2: "No aceptable" },
  en: { 5: "Excellent", 4: "Good", 3: "Needs to improve", 2: "Not acceptable" },
  ko: { 5: "매우 우수", 4: "우수", 3: "개선 필요", 2: "부적합" },
};

const ALWAYS = ["Siempre", "Normalmente", "A veces", "Pocas veces"];

export interface SelfEvalItem {
  key: string;
  es: string;
  en: string;
  ko: string;
  /** STA standards for 5, 4, 3, 2, in the school's Spanish. */
  sta: string[];
}

export interface SelfEvalSection {
  key: "prof" | "plan" | "obs";
  title: { es: string; en: string; ko: string };
  /** Sub-headings inside the section, by the index of the item they precede. */
  subheads?: Record<number, { es: string; en: string; ko: string }>;
  items: SelfEvalItem[];
}

export const SELF_EVAL: SelfEvalSection[] = [
  {
    key: "prof",
    title: { es: "Responsabilidades profesionales", en: "Professional responsibilities", ko: "직무 책임" },
    items: [
      { key: "puntualidad", es: "Puntualidad", en: "Punctuality", ko: "시간 엄수", sta: ["Nunca llegó tarde a clases, entrenamientos o juegos", "Llegó tarde no más de 2 veces durante el semestre", "Llegó tarde de 3 a 4 veces durante el semestre", "Llegó tarde frecuentemente, más de 6 veces durante el semestre"] },
      { key: "uniforme", es: "Uniforme", en: "Uniform", ko: "복장", sta: ["Siempre porta el uniforme correcto", "Siempre porta el uniforme pero no está completo de alguna forma", "No usa el uniforme en hasta tres ocasiones", "No usa el uniforme en más de tres ocasiones"] },
      { key: "actitudinales", es: "Actitudinales", en: "Attitude", ko: "태도", sta: ["Siempre utiliza lenguaje adecuado, respeta y se comunica eficientemente", "Pocas veces utiliza lenguaje inadecuado y en ocasiones su comunicación no es conveniente", "En repetidas ocasiones su lenguaje es inapropiado y su comunicación con el staff es deficiente", ""] },
      { key: "imagen", es: "Imagen personal", en: "Personal presentation", ko: "용모", sta: ["Siempre se presenta aseado y limpio y se preocupa por su imagen ante los demás", "Pocas veces se presenta desarreglado y despreocupado por su apariencia", "En repetidas ocasiones su apariencia es inapropiada, poco se preocupa por su imagen ante los demás", ""] },
      { key: "material", es: "Responsable material de deporte (tomando en cuenta desgaste natural)", en: "Care of sports equipment (allowing for normal wear)", ko: "체육 용품 관리 (자연 마모 감안)", sta: ["Material en excelentes condiciones; lleva el equipo completo a clases, entrenamientos y juegos (siempre porta el botiquín para partidos)", "Equipo incompleto en 1 ó 2 ocasiones (siempre porta el botiquín para partidos)", "Equipo incompleto en 3 ó 4 ocasiones (olvidó portar el botiquín en 2 partidos)", "Equipo incompleto en más de 5 ocasiones (olvidó portar el botiquín en más de 3 partidos)"] },
      { key: "bitacora", es: "Bitácora del entrenador", en: "Coach's log (bitácora)", ko: "코치 일지", sta: ["Siempre mantiene la bitácora del entrenador actualizada en la oficina de deportes", "Mantiene la bitácora actualizada pero con 2 errores", "Mantiene la bitácora actualizada pero con más de 2 errores", "La bitácora del entrenador NO está actualizada"] },
      { key: "evaluaciones", es: "Evaluaciones cocurriculares dep.: rendimiento, actitud deportiva", en: "Co-curricular evaluations: performance, sporting attitude", ko: "선수 평가: 경기력, 스포츠 태도", sta: ["Evaluaciones con retroalimentación efectiva; demuestra conocimiento completo del alumno o grupo", "Evaluaciones dan retroalimentación efectiva", "Evaluaciones dan retroalimentación", "Evaluaciones están mal hechas"] },
      { key: "guardias", es: "Guardias", en: "Duty shifts", ko: "당번", sta: ["Nunca faltó o llegó tarde a una guardia; hace las guardias de manera consciente", "Nunca faltó o llegó tarde a una guardia", "Llega tarde a guardias o se le olvidó en más de tres ocasiones", "Llega tarde a guardias o se le olvidó en más de cinco ocasiones"] },
      { key: "asistencia", es: "Asistencia", en: "Attendance", ko: "출근", sta: ["No tuvo faltas", "Faltó uno o dos días", "Faltó 3 o 4 días", "Faltó más de 5 días"] },
      { key: "capacitacion", es: "Asiste a sesiones de capacitación y reuniones del departamento", en: "Attends training sessions and department meetings", ko: "연수와 부서 회의 참석", sta: ["Asistió a todas las sesiones de capacitación o reuniones, participó activamente y puso atención en todo momento", "Faltó hasta a una sesión, participó activamente en las actividades", "Faltó hasta dos sesiones, no participó activamente en las actividades", "Faltó más de dos sesiones, no participó activamente en las actividades"] },
      { key: "eventos", es: "Asiste a eventos organizados del ASFG", en: "Attends ASFG events", ko: "학교 행사 참석", sta: ["Asiste a todos los eventos donde participan sus alumnos y a todos los eventos del ASFG", "Asiste a algunos eventos de sus alumnos y a la mayoría de los eventos del ASFG", "Asiste a la mayoría de los eventos del ASFG", "Falta a los eventos del ASFG y no asiste a eventos de sus alumnos ni a su evento ASOMEX"] },
      { key: "tecnologia", es: "Uso de la tecnología", en: "Use of technology for communication", ko: "소통에 기술 활용", sta: ["Usa el correo electrónico diariamente", "Usa el correo electrónico cada dos días", "Usa el correo electrónico cada tres días", "Usa el correo electrónico cada semana"] },
      { key: "reporta", es: "Reporta los incidentes de sus equipos", en: "Reports incidents in their teams", ko: "사고 보고", sta: ["Reporta inmediatamente", "Reporta al siguiente día", "Reporta cuando se le pide el reporte", "Se le pide el reporte y no lo realiza"] },
      { key: "seguimiento", es: "Le da seguimiento a los reportes de incidentes", en: "Follows up on incident reports", ko: "사고 후속 조치", sta: ["Seguimiento inmediato", "Se tarda por lo menos dos días pero concluye el seguimiento", "Pierde el seguimiento y lo retoma después de varios días", "Nunca se preocupó por darle seguimiento"] },
    ],
  },
  {
    key: "plan",
    title: { es: "Organización y planeación", en: "Organization and planning", ko: "조직과 계획" },
    items: [
      { key: "reportes", es: "Reportes", en: "Reports", ko: "보고서", sta: ["Siempre entrega a tiempo", "Entregó 2 veces tarde", "Entregó tarde 4 veces o más", "Entrega tarde e incompleto"] },
      { key: "planDiario", es: "Plan diario refleja una buena planeación", en: "Daily plan shows good planning", ko: "일일 계획이 잘 세워져 있음", sta: ["Siempre incluye descripción detallada de actividades y espacios, objetivos claros y tiempo suficiente para cada actividad", "Normalmente incluye descripción detallada de actividades y espacios; tiene objetivos claros", "A veces incluye descripción detallada de actividades y espacios", "Incluye la información mínima nada más"] },
      { key: "objetivos", es: "Cumple los objetivos trazados al inicio del año", en: "Meets the goals set at the start of the year", ko: "연초 목표 달성", sta: ["Cumplió TODOS sus objetivos o le faltó alguno por cuestiones fuera de su alcance", "Cumplió casi TODOS sus objetivos", "Realizó el 70% de sus objetivos", "No realizó ni siquiera el 50% de sus objetivos"] },
      { key: "metodo", es: "Su método de trabajo es acorde a la misión del programa", en: "Methods fit the program's mission", ko: "지도 방법이 프로그램 취지에 맞음", sta: ["Los métodos que aplica son muy acordes, siempre", "Los métodos que aplica son acordes, generalmente", "En ocasiones mal aplicados por no tomar en cuenta las características de la clase", "Los métodos que aplica no son acordes"] },
    ],
  },
  {
    key: "obs",
    title: { es: "Observación de clases y entrenamientos", en: "Lesson and training observation", ko: "수업·훈련 관찰" },
    subheads: {
      0: { es: "Instrucción durante las clases y los entrenamientos", en: "Instruction during lessons and training", ko: "수업과 훈련 중 지도" },
      8: { es: "Manejo del grupo (clases y equipo)", en: "Group management (lessons and team)", ko: "그룹 관리 (수업과 팀)" },
    },
    items: [
      { key: "calentamiento", es: "Incluye calentamiento y vuelta a la calma", en: "Includes a warm-up and cool-down", ko: "준비운동과 정리운동 포함", sta: ALWAYS },
      { key: "explica", es: "Explica, demuestra y corrige", en: "Explains, demonstrates and corrects", ko: "설명, 시범, 교정", sta: ALWAYS },
      { key: "describeObjetivos", es: "Describe los objetivos de la clase", en: "Describes the session's objectives", ko: "수업 목표 설명", sta: ALWAYS },
      { key: "equipo", es: "Usa el equipo deportivo eficientemente", en: "Uses sports equipment efficiently", ko: "용품을 효율적으로 사용", sta: ALWAYS },
      { key: "sigue", es: "Sigue el plan diario conforme a su planeación", en: "Follows the daily plan", ko: "일일 계획대로 진행", sta: ALWAYS },
      { key: "retroIndividual", es: "Proporciona retroalimentación individual", en: "Gives individual feedback", ko: "개별 피드백 제공", sta: ALWAYS },
      { key: "retroFinal", es: "Conduce una retroalimentación al final de la sesión", en: "Leads feedback at the end of the session", ko: "마무리 피드백 진행", sta: ALWAYS },
      { key: "variedad", es: "Contiene variedad de actividades", en: "Has a variety of activities", ko: "다양한 활동 구성", sta: ALWAYS },
      { key: "uniformeAlumnos", es: "Los estudiantes utilizan el uniforme adecuado en clases, entrenamientos y juegos", en: "Students wear the right kit in lessons, training and games", ko: "학생들이 알맞은 복장 착용", sta: ALWAYS },
      { key: "distraen", es: "Los estudiantes que se distraen son tratados de inmediato y efectivamente", en: "Distracted students are dealt with promptly and effectively", ko: "산만한 학생을 즉시 효과적으로 지도", sta: ALWAYS },
      { key: "dirige", es: "El maestro se dirige a los estudiantes de manera adecuada", en: "Addresses students appropriately", ko: "학생을 적절하게 대함", sta: ALWAYS },
      { key: "reglamento", es: "Aplica el reglamento en forma adecuada", en: "Applies the rules correctly", ko: "규정을 올바르게 적용", sta: ALWAYS },
      { key: "mision", es: "El maestro reafirma la misión del programa", en: "Reinforces the program's mission", ko: "프로그램 취지를 강조", sta: ALWAYS },
      { key: "liderazgo", es: "El maestro muestra liderazgo y predica con el ejemplo", en: "Shows leadership and leads by example", ko: "리더십과 솔선수범", sta: ALWAYS },
      { key: "consistente", es: "El maestro es consistente y asertivo en su trato con los alumnos", en: "Consistent and assertive with students", ko: "학생을 일관되고 분명하게 대함", sta: ALWAYS },
    ],
  },
];

/** Average of a section's scored items; null until every item is scored. */
export function sectionAverage(section: SelfEvalSection, scores: Record<string, number>): number | null {
  const vals = section.items.map((i) => scores[i.key]);
  if (vals.some((v) => !SELF_EVAL_LEVELS.includes(v as 5))) return null;
  return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100) / 100;
}

/** The workbook's "rango de efectividad" for the sum of the three averages. */
export function effectiveness(total: number): "excelente" | "bueno" | "mejorar" | "noAceptable" {
  if (total >= 14) return "excelente";
  if (total >= 12) return "bueno";
  if (total >= 11) return "mejorar";
  return "noAceptable";
}

// ---- Documents (STA-GRAL, R-FI, A-EV) ----------------------------------------

const text = (max: number) => z.string().max(max).default("");

export const goalsSchema = z.object({
  objectives: z.array(z.string().max(300)).max(18).default([]),
  general: text(4000),
  specific: text(4000),
  teacher: text(4000),
});
export type GoalsDoc = z.infer<typeof goalsSchema>;

export const reportSchema = z.object({
  started: z.number().int().min(0).max(200).nullable().default(null),
  bajas: z.array(z.object({ name: z.string().max(80), reason: z.string().max(300) })).max(40).default([]),
  places: z.record(z.string().max(120), z.string().max(40)).default({}),
  group: text(6000),
  asomex: text(6000),
  individual: z.record(z.string().max(40), z.string().max(2000)).default({}),
  incidents: z.array(z.object({ who: z.string().max(200), what: z.string().max(2000) })).max(3).default([]),
  wentWell: text(4000),
  notDone: text(4000),
  suggestions: text(4000),
  meeting: text(4000),
});
export type ReportDoc = z.infer<typeof reportSchema>;

export const selfEvalSchema = z.object({
  scores: z.record(z.string().max(40), z.number().int().min(2).max(5)).default({}),
  notes: z.record(z.string().max(40), z.string().max(500)).default({}),
  date: z.string().max(20).default(""),
});
export type SelfEvalDoc = z.infer<typeof selfEvalSchema>;

export const eventSchema = z.object({
  name: text(120),
  requestDate: text(20),
  dates: text(80),
  objective: text(4000),
  invited: z.array(z.string().max(40)).max(60).default([]),
  outsideCategory: z.array(z.string().max(40)).max(60).default([]),
  analysis: text(6000),
  individual: z.record(z.string().max(40), z.string().max(2000)).default({}),
  incidents: z.array(z.object({ who: z.string().max(200), what: z.string().max(2000) })).max(3).default([]),
  organization: text(4000),
});
export type EventDoc = z.infer<typeof eventSchema>;

export const DOC_KINDS = {
  goals: goalsSchema,
  report: reportSchema,
  selfEvalTerm: selfEvalSchema,
  selfEvalFinal: selfEvalSchema,
} as const;
export type DocKind = keyof typeof DOC_KINDS;

/** A stored document read back, filled out with defaults for anything missing. */
export function readDoc<K extends DocKind>(kind: K, data: unknown): z.infer<(typeof DOC_KINDS)[K]> {
  const parsed = DOC_KINDS[kind].safeParse(data ?? {});
  return (parsed.success ? parsed.data : DOC_KINDS[kind].parse({})) as z.infer<(typeof DOC_KINDS)[K]>;
}

export function readEvent(data: unknown): EventDoc {
  const parsed = eventSchema.safeParse(data ?? {});
  return parsed.success ? parsed.data : eventSchema.parse({});
}
