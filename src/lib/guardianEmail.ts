import type { Lang } from "./i18n";
import { appUrl, sendMail } from "./mailer";
import { privacyContact } from "./consent";

const L: Record<
  Lang,
  {
    subject: (child: string) => string;
    hello: (guardian: string) => string;
    body: (child: string, email: string) => string;
    what: string;
    items: string[];
    rights: (contact: string) => string;
    links: string;
    sign: string;
  }
> = {
  ko: {
    subject: (child) => `[Sideline365] ${child} 계정에 대한 보호자 동의 확인`,
    hello: (guardian) => `${guardian}님, 안녕하세요.`,
    body: (child, email) =>
      `방금 Sideline365에 "${child}" (${email}) 계정이 만들어졌고, 가입 과정에서 보호자로 귀하가 지정되어 개인정보 수집·이용에 동의하신 것으로 기록되었습니다. 이 메일은 그 기록의 사본입니다.`,
    what: "수집·이용되는 정보",
    items: [
      "계정 정보: 아이디, 이메일, 이름, 생년월일, 학교, 학년",
      "훈련 정보: 기록, 훈련 일지, 출석, 코치가 낸 과제와 그 완료 여부",
      "팀 정보: 소속 팀, 팀 공지, 팀 내 순위",
    ],
    rights: (contact) =>
      `보호자는 언제든지 자녀 정보의 열람·정정·삭제를 요청하거나 동의를 철회할 수 있습니다. 문의: ${contact}. 이 계정을 만든 적이 없다면 같은 주소로 알려주세요. 계정을 삭제해 드립니다.`,
    links: "이용약관과 개인정보 처리방침",
    sign: "Sideline365 드림",
  },
  en: {
    subject: (child) => `[Sideline365] Parent/guardian consent recorded for ${child}`,
    hello: (guardian) => `Hello ${guardian},`,
    body: (child, email) =>
      `An account for "${child}" (${email}) was just created on Sideline365. During sign-up you were named as their parent or guardian and recorded as consenting to the collection and use of their personal information. This email is your copy of that record.`,
    what: "What is collected and used",
    items: [
      "Account details: username, email, name, date of birth, school, grade",
      "Training details: records, training log, attendance, homework a coach assigns and whether it was done",
      "Team details: team membership, team announcements, team leaderboards",
    ],
    rights: (contact) =>
      `You can ask to see, correct or delete your child's information, or withdraw consent, at any time: ${contact}. If you did not agree to this account, reply to that address and we will remove it.`,
    links: "Terms of Use and Privacy Notice",
    sign: "Sideline365",
  },
  es: {
    subject: (child) => `[Sideline365] Consentimiento del padre, madre o tutor registrado para ${child}`,
    hello: (guardian) => `Hola ${guardian}:`,
    body: (child, email) =>
      `Se acaba de crear una cuenta para "${child}" (${email}) en Sideline365. Durante el registro se te indicó como su padre, madre o tutor y quedó registrado tu consentimiento para la recopilación y el uso de su información personal. Este correo es tu copia de ese registro.`,
    what: "Qué se recopila y se usa",
    items: [
      "Datos de la cuenta: nombre de usuario, correo, nombre, fecha de nacimiento, escuela, curso",
      "Datos de entrenamiento: marcas, diario de entrenamiento, asistencia, tareas asignadas por el entrenador y si se completaron",
      "Datos del equipo: pertenencia al equipo, avisos del equipo, clasificaciones del equipo",
    ],
    rights: (contact) =>
      `Puedes pedir ver, corregir o eliminar la información de tu hijo o hija, o retirar el consentimiento, en cualquier momento: ${contact}. Si no autorizaste esta cuenta, responde a esa dirección y la eliminaremos.`,
    links: "Términos de uso y Aviso de privacidad",
    sign: "Sideline365",
  },
};

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * The guardian's copy of the consent they gave.
 *
 * Sent after the account exists, never awaited by sign-up, and never a
 * reason for sign-up to fail: the record of consent is the row on the
 * account, and this is the courtesy copy. Without a mailer configured it
 * is skipped, which sendMail reports rather than throws.
 */
export async function sendGuardianNotice(args: {
  lang: Lang;
  guardianName: string;
  guardianEmail: string;
  childName: string;
  childEmail: string;
}) {
  const s = L[args.lang];
  const contact = privacyContact();
  const base = appUrl();
  const text = [
    s.hello(args.guardianName),
    "",
    s.body(args.childName, args.childEmail),
    "",
    `${s.what}:`,
    ...s.items.map((i) => `- ${i}`),
    "",
    s.rights(contact),
    "",
    `${s.links}: ${base}/terms · ${base}/privacy`,
    "",
    s.sign,
  ].join("\n");
  const html = `
    <div style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.55;color:#0f172a">
      <p>${esc(s.hello(args.guardianName))}</p>
      <p>${esc(s.body(args.childName, args.childEmail))}</p>
      <p><strong>${esc(s.what)}</strong></p>
      <ul>${s.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>
      <p>${esc(s.rights(contact))}</p>
      <p>${esc(s.links)}: <a href="${base}/terms">${base}/terms</a> · <a href="${base}/privacy">${base}/privacy</a></p>
      <p>${esc(s.sign)}</p>
    </div>`;
  try {
    return await sendMail({ to: args.guardianEmail, subject: s.subject(args.childName), text, html });
  } catch (e) {
    return { status: "failed" as const, reason: String(e) };
  }
}
