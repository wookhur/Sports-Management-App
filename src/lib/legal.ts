// The Terms of Use and the Privacy Notice, in the three languages the app
// speaks. Plain sections of prose: a heading and paragraphs (a paragraph
// starting with "- " renders as a list item). The contact address comes from
// the environment so it can be changed without a deploy of copy.
//
// These describe what the app actually does with data today. If a new
// feature collects something new, this file changes with it.

import type { Lang } from "./i18n";

export interface LegalSection {
  heading: string;
  body: string[];
}

export interface LegalDoc {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}

const UPDATED = "2026-09-22";

export function privacyNotice(lang: Lang, contact: string): LegalDoc {
  const docs: Record<Lang, LegalDoc> = {
    ko: {
      title: "개인정보 처리방침",
      updated: `최종 수정 ${UPDATED}`,
      intro:
        "Sideline365는 학생 선수와 코치가 훈련을 기록하고 팀을 운영하는 서비스입니다. 이 방침은 어떤 정보를 왜 수집하고, 누가 볼 수 있으며, 어떻게 지울 수 있는지 설명합니다.",
      sections: [
        {
          heading: "수집하는 정보",
          body: [
            "- 계정 정보: 아이디, 이메일, 이름, 비밀번호(암호화 저장), 역할(선수/코치)",
            "- 프로필 정보(선택): 생년월일, 학교, 학년, 관심 종목, 경험 수준, 선호 언어",
            "- 훈련 정보: 기록, 훈련 일지, 목표, 미션 진행, 코치가 낸 과제와 완료 여부",
            "- 팀 정보: 소속 팀, 출석, 팀 공지, 직접 올린 드릴 이미지",
            "- 이용 정보: 로그인 시각, 연속 출석일, 알림 열람 여부",
          ],
        },
        {
          heading: "이용 목적",
          body: [
            "- 훈련 기록을 저장하고 진행 상황을 보여주기 위해",
            "- 코치가 팀원의 훈련·출석·과제를 확인하고 지도하기 위해",
            "- 팀 공지, 과제, 주간 요약 등 알림을 보내기 위해",
            "- 서비스 오류를 찾고 고치기 위해",
            "연구 목적 활용은 별도의 선택 동의가 있을 때만, 개인을 식별할 수 없는 형태로 이루어집니다. 이 동의는 프로필에서 언제든 철회할 수 있습니다.",
          ],
        },
        {
          heading: "미성년자(만 18세 미만)",
          body: [
            "만 18세 미만 사용자는 부모 또는 법정 보호자가 개인정보 수집·이용에 동의해야 계정을 만들 수 있습니다. 가입 시 보호자의 이름과 이메일을 받고, 동의 내용의 사본을 보호자에게 이메일로 보냅니다.",
            "보호자는 언제든지 자녀 정보의 열람·정정·삭제를 요청하거나 동의를 철회할 수 있습니다. 동의를 철회하면 계정과 그에 속한 기록이 삭제됩니다.",
            "미성년자에게는 서비스 이용에 필요한 최소한의 정보만 요청하며, 광고 목적으로 정보를 사용하거나 제3자에게 판매하지 않습니다.",
          ],
        },
        {
          heading: "누가 볼 수 있나",
          body: [
            "- 본인: 자신의 모든 정보",
            "- 코치: 연결된 선수와 자기 팀 소속 선수의 기록, 훈련 일지, 출석, 과제 진행",
            "- 팀원: 같은 팀의 순위표, 팀 공지, 팀 드릴",
            "그 밖의 사용자나 외부에는 공개되지 않습니다. 개인정보를 판매하거나 광고 목적으로 제공하지 않습니다.",
          ],
        },
        {
          heading: "보관과 삭제",
          body: [
            "정보는 계정이 존재하는 동안 보관됩니다. 계정 삭제를 요청하면 계정과 그에 속한 기록이 삭제되며, 팀에 남긴 공지와 출석 기록은 팀 운영을 위해 작성자 표시 없이 남을 수 있습니다.",
            "비밀번호 재설정 링크와 로그인 세션은 정해진 시간이 지나면 자동으로 만료됩니다.",
          ],
        },
        {
          heading: "처리 위탁",
          body: [
            "서비스는 클라우드 호스팅(Netlify)과 데이터베이스 호스팅, 이메일 발송 서비스(Resend)를 이용합니다. 이들은 서비스 제공에 필요한 범위에서만 정보를 처리합니다.",
          ],
        },
        {
          heading: "문의",
          body: [`정보 열람·정정·삭제, 동의 철회, 그 밖의 문의: ${contact}`],
        },
      ],
    },
    en: {
      title: "Privacy Notice",
      updated: `Last updated ${UPDATED}`,
      intro:
        "Sideline365 is where student athletes and their coaches log training and run a team. This notice explains what we collect and why, who can see it, and how to have it deleted.",
      sections: [
        {
          heading: "What we collect",
          body: [
            "- Account details: username, email, name, password (stored hashed), role (athlete or coach)",
            "- Profile details (optional): date of birth, school, grade, sports of interest, experience level, preferred language",
            "- Training details: records, training log, goals, mission progress, homework a coach assigns and whether it was done",
            "- Team details: team membership, attendance, team announcements, drill images you upload",
            "- Usage details: sign-in times, activity streak, whether notifications were read",
          ],
        },
        {
          heading: "Why we use it",
          body: [
            "- To store training records and show progress",
            "- So a coach can see and guide their athletes' training, attendance and homework",
            "- To send notifications: team announcements, homework, the weekly summary",
            "- To find and fix problems with the service",
            "Research use happens only with separate, optional consent and only on de-identified data. That consent can be withdrawn at any time from the profile page.",
          ],
        },
        {
          heading: "Minors (under 18)",
          body: [
            "Anyone under 18 needs a parent or legal guardian to consent to the collection and use of their personal information before an account is created. At sign-up we ask for the guardian's name and email and send them a copy of what they agreed to.",
            "A parent or guardian can ask to see, correct or delete their child's information, or withdraw consent, at any time. Withdrawing consent deletes the account and the records that belong to it.",
            "We ask minors only for what the service needs, and we do not use their information for advertising or sell it to anyone.",
          ],
        },
        {
          heading: "Who can see it",
          body: [
            "- You: everything about you",
            "- Your coach: records, training log, attendance and homework progress of the athletes linked to them and on their teams",
            "- Your teammates: the team's leaderboard, announcements and drills",
            "Nothing is visible to other users or to the public. We do not sell personal information or share it for advertising.",
          ],
        },
        {
          heading: "Retention and deletion",
          body: [
            "Information is kept for as long as the account exists. On request the account and the records that belong to it are deleted; announcements and attendance a coach recorded for a team may remain, without the author's name, so the team's history stays intact.",
            "Password-reset links and sign-in sessions expire on their own after a set time.",
          ],
        },
        {
          heading: "Service providers",
          body: [
            "The service runs on cloud hosting (Netlify), a hosted database, and an email delivery service (Resend). Each processes information only as far as running the service requires.",
          ],
        },
        {
          heading: "Contact",
          body: [`To see, correct or delete information, withdraw consent, or ask anything else: ${contact}`],
        },
      ],
    },
    es: {
      title: "Aviso de privacidad",
      updated: `Última actualización: ${UPDATED}`,
      intro:
        "Sideline365 es donde los atletas estudiantes y sus entrenadores registran el entrenamiento y gestionan un equipo. Este aviso explica qué recopilamos y por qué, quién puede verlo y cómo pedir que se elimine.",
      sections: [
        {
          heading: "Qué recopilamos",
          body: [
            "- Datos de la cuenta: nombre de usuario, correo, nombre, contraseña (guardada cifrada), rol (atleta o entrenador)",
            "- Datos del perfil (opcionales): fecha de nacimiento, escuela, curso, deportes de interés, nivel de experiencia, idioma preferido",
            "- Datos de entrenamiento: marcas, diario de entrenamiento, objetivos, progreso en misiones, tareas asignadas por el entrenador y si se completaron",
            "- Datos del equipo: pertenencia al equipo, asistencia, avisos del equipo, imágenes de ejercicios que subes",
            "- Datos de uso: horas de inicio de sesión, racha de actividad, si se leyeron las notificaciones",
          ],
        },
        {
          heading: "Para qué lo usamos",
          body: [
            "- Para guardar las marcas de entrenamiento y mostrar el progreso",
            "- Para que el entrenador vea y guíe el entrenamiento, la asistencia y las tareas de sus atletas",
            "- Para enviar notificaciones: avisos del equipo, tareas, el resumen semanal",
            "- Para detectar y corregir problemas del servicio",
            "El uso para investigación solo ocurre con un consentimiento aparte y opcional, y solo con datos anonimizados. Ese consentimiento se puede retirar en cualquier momento desde el perfil.",
          ],
        },
        {
          heading: "Menores (menos de 18 años)",
          body: [
            "Toda persona menor de 18 años necesita que su padre, madre o tutor legal autorice la recopilación y el uso de su información personal antes de crear la cuenta. En el registro pedimos el nombre y el correo del tutor y le enviamos una copia de lo que aceptó.",
            "El padre, madre o tutor puede pedir ver, corregir o eliminar la información de su hijo o hija, o retirar el consentimiento, en cualquier momento. Retirar el consentimiento elimina la cuenta y los registros que le pertenecen.",
            "A los menores solo les pedimos lo que el servicio necesita, y no usamos su información para publicidad ni la vendemos a nadie.",
          ],
        },
        {
          heading: "Quién puede verlo",
          body: [
            "- Tú: toda tu información",
            "- Tu entrenador: marcas, diario, asistencia y progreso de tareas de los atletas vinculados a él y de sus equipos",
            "- Tus compañeros de equipo: la clasificación, los avisos y los ejercicios del equipo",
            "Nada es visible para otros usuarios ni para el público. No vendemos información personal ni la compartimos con fines publicitarios.",
          ],
        },
        {
          heading: "Conservación y eliminación",
          body: [
            "La información se conserva mientras exista la cuenta. A petición se eliminan la cuenta y los registros que le pertenecen; los avisos y la asistencia que un entrenador registró para un equipo pueden permanecer, sin el nombre del autor, para que el historial del equipo siga completo.",
            "Los enlaces para restablecer la contraseña y las sesiones caducan solos pasado un tiempo.",
          ],
        },
        {
          heading: "Proveedores",
          body: [
            "El servicio funciona con alojamiento en la nube (Netlify), una base de datos alojada y un servicio de envío de correo (Resend). Cada uno procesa la información solo en la medida en que el servicio lo requiere.",
          ],
        },
        {
          heading: "Contacto",
          body: [`Para ver, corregir o eliminar información, retirar el consentimiento o cualquier otra consulta: ${contact}`],
        },
      ],
    },
  };
  return docs[lang];
}

export function termsOfUse(lang: Lang, contact: string): LegalDoc {
  const docs: Record<Lang, LegalDoc> = {
    ko: {
      title: "이용약관",
      updated: `최종 수정 ${UPDATED}`,
      intro: "Sideline365를 사용하면 아래 약관에 동의하는 것입니다. 짧게 썼습니다. 읽어주세요.",
      sections: [
        {
          heading: "계정",
          body: [
            "계정은 본인이 직접 만들고 본인만 사용합니다. 만 18세 미만은 보호자의 동의가 필요합니다. 비밀번호는 다른 사람과 공유하지 마세요.",
            "코치 계정은 실제로 선수를 지도하는 사람이 사용해야 합니다. 팀 초대 코드는 자기 팀원에게만 공유하세요.",
          ],
        },
        {
          heading: "올리는 내용",
          body: [
            "기록, 일지, 공지, 드릴 이미지 등 올리는 내용은 본인 것이며, 그 내용에 대한 책임도 본인에게 있습니다. 타인의 저작물이나 개인정보를 허락 없이 올리지 마세요.",
            "코치와 팀원에게 보이는 곳에는 그들이 봐도 괜찮은 내용만 올려주세요.",
          ],
        },
        {
          heading: "해서는 안 되는 것",
          body: ["- 다른 사람의 계정에 접근하거나 다른 사람인 척하는 것", "- 괴롭힘, 욕설, 차별적 내용", "- 서비스를 고의로 방해하거나 자동화 도구로 긁어가는 것"],
        },
        {
          heading: "서비스 변경과 중단",
          body: [
            "기능은 예고 없이 바뀌거나 사라질 수 있습니다. 약관을 위반한 계정은 정지되거나 삭제될 수 있습니다. 서비스는 '있는 그대로' 제공되며, 훈련 프로그램과 드릴은 참고 자료일 뿐 의학적 조언이 아닙니다. 다치지 않도록 코치와 함께 안전하게 훈련하세요.",
          ],
        },
        { heading: "문의", body: [`약관 관련 문의: ${contact}`] },
      ],
    },
    en: {
      title: "Terms of Use",
      updated: `Last updated ${UPDATED}`,
      intro: "By using Sideline365 you agree to these terms. They are short on purpose. Please read them.",
      sections: [
        {
          heading: "Your account",
          body: [
            "You create your own account and only you use it. Anyone under 18 needs a parent or guardian's consent. Don't share your password.",
            "A coach account is for someone who actually coaches athletes. Share a team's invite code only with your own team.",
          ],
        },
        {
          heading: "What you post",
          body: [
            "Records, log entries, announcements, drill images and anything else you upload are yours, and so is the responsibility for them. Don't upload someone else's work or personal information without their permission.",
            "Where your coach and teammates can see it, post only what you're happy for them to see.",
          ],
        },
        {
          heading: "What you must not do",
          body: ["- Access someone else's account or pretend to be someone else", "- Harass, abuse or discriminate", "- Deliberately disrupt the service or scrape it with automated tools"],
        },
        {
          heading: "Changes and termination",
          body: [
            "Features can change or go away without notice. An account that breaks these terms can be suspended or deleted. The service is provided as is; training programs and drills are reference material, not medical advice. Train safely, with your coach, so nobody gets hurt.",
          ],
        },
        { heading: "Contact", body: [`Questions about these terms: ${contact}`] },
      ],
    },
    es: {
      title: "Términos de uso",
      updated: `Última actualización: ${UPDATED}`,
      intro: "Al usar Sideline365 aceptas estos términos. Son cortos a propósito. Por favor, léelos.",
      sections: [
        {
          heading: "Tu cuenta",
          body: [
            "Creas tu propia cuenta y solo tú la usas. Toda persona menor de 18 años necesita el consentimiento de su padre, madre o tutor. No compartas tu contraseña.",
            "Una cuenta de entrenador es para quien de verdad entrena a atletas. Comparte el código de invitación de un equipo solo con tu propio equipo.",
          ],
        },
        {
          heading: "Lo que publicas",
          body: [
            "Las marcas, las entradas del diario, los avisos, las imágenes de ejercicios y todo lo que subas son tuyos, y también lo es la responsabilidad sobre ello. No subas el trabajo ni la información personal de otra persona sin su permiso.",
            "Donde tu entrenador y tus compañeros pueden verlo, publica solo lo que no te importe que vean.",
          ],
        },
        {
          heading: "Lo que no debes hacer",
          body: ["- Acceder a la cuenta de otra persona o hacerte pasar por otra persona", "- Acosar, insultar o discriminar", "- Interrumpir el servicio a propósito o extraer datos con herramientas automáticas"],
        },
        {
          heading: "Cambios y cancelación",
          body: [
            "Las funciones pueden cambiar o desaparecer sin previo aviso. Una cuenta que incumpla estos términos puede ser suspendida o eliminada. El servicio se ofrece tal cual; los programas y ejercicios son material de referencia, no consejo médico. Entrena con seguridad, con tu entrenador, para que nadie se lesione.",
          ],
        },
        { heading: "Contacto", body: [`Preguntas sobre estos términos: ${contact}`] },
      ],
    },
  };
  return docs[lang];
}
