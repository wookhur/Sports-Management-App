import Link from "next/link";
import {
  LAX_META,
  LAX_PRINCIPLES,
  LAX_QUOTE,
  LAX_WARMUP,
  LAX_STICK,
  LAX_CONDITIONING,
  LAX_CONDITIONING_NOTE,
  LAX_TEAM,
  LAX_PRACTICE_90,
  LAX_PRACTICE_120,
  LAX_PREGAME,
  LAX_PREGAME_NOTE,
  LAX_POSITIONS,
  LAX_WEEKLY,
  LAX_STRENGTH,
  LAX_VIDEOS,
  LAX_HABITS,
  type NamedItem,
} from "@/lib/lacrosseProgram";

const NAV = [
  ["philosophy", "철학"],
  ["warmup", "웜업"],
  ["stick", "스틱스킬"],
  ["conditioning", "컨디셔닝"],
  ["team", "팀 드릴"],
  ["structure", "연습 구조"],
  ["pregame", "경기 전"],
  ["position", "포지션별"],
  ["weekly", "주간"],
  ["strength", "근력"],
  ["videos", "영상"],
  ["habits", "습관"],
];

export default function LacrosseProgramView({ sportId }: { sportId: string }) {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <Link href={`/sports/${sportId}`} className="text-sm text-slate-400 hover:text-slate-600">
        ← 라크로스
      </Link>

      <header className="mt-3 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 p-6 text-white">
        <p className="text-sm text-white/80">🥍 {LAX_META.season}</p>
        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{LAX_META.title}</h1>
        <p className="mt-1 text-white/85">{LAX_META.subtitle}</p>
      </header>

      {/* Jump nav */}
      <nav className="sticky top-14 z-10 -mx-4 mt-4 overflow-x-auto border-b border-slate-200 bg-white/90 px-4 py-2 backdrop-blur">
        <div className="flex gap-1.5">
          {NAV.map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              className="whitespace-nowrap rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200"
            >
              {label}
            </a>
          ))}
        </div>
      </nav>

      {/* 1. Philosophy */}
      <Section id="philosophy" title="1. 프로그램 철학">
        <blockquote className="rounded-xl border-l-4 border-emerald-400 bg-emerald-50 px-4 py-3 text-sm italic text-emerald-900">
          “{LAX_QUOTE.text}” <span className="not-italic text-emerald-700">— {LAX_QUOTE.by}</span>
        </blockquote>
        <ItemList items={LAX_PRINCIPLES} className="mt-4" />
      </Section>

      {/* 2. Warm-up */}
      <Section id="warmup" title="2. 연습 웜업 (RAMP)">
        <p className="mb-4 text-sm text-slate-500">Raise · Activate · Mobilize · Potentiate — 총 15~18분</p>
        <div className="space-y-4">
          {LAX_WARMUP.map((ph) => (
            <div key={ph.title} className="card p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-bold">{ph.title}</h3>
                <span className="badge bg-emerald-50 text-emerald-600">{ph.time}</span>
              </div>
              <ItemList items={ph.items} className="mt-3" />
              {ph.source && <p className="mt-3 text-xs text-slate-400">출처: {ph.source}</p>}
            </div>
          ))}
        </div>
      </Section>

      {/* 3. Stick skills */}
      <Section id="stick" title="3. 개인 스틱 스킬">
        <p className="mb-4 text-sm text-slate-500">
          엘리트는 세션당 500회 이상 월볼. 매일 20분이 개인 발전의 가장 강력한 도구입니다.
        </p>
        <div className="space-y-4">
          {LAX_STICK.map((g) => (
            <div key={g.group} className="card p-5">
              <h3 className="font-bold">{g.group}</h3>
              <ItemList items={g.items} className="mt-3" />
              {g.source && <p className="mt-3 text-xs text-slate-400">출처: {g.source}</p>}
            </div>
          ))}
        </div>
      </Section>

      {/* 4. Conditioning */}
      <Section id="conditioning" title="4. 컨디셔닝">
        <p className="mb-4 rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-600">{LAX_CONDITIONING_NOTE}</p>
        <div className="card p-5">
          <ItemList items={LAX_CONDITIONING} />
        </div>
      </Section>

      {/* 5. Team drills */}
      <Section id="team" title="5. 팀 드릴">
        <div className="grid gap-4 md:grid-cols-3">
          {LAX_TEAM.map((g) => (
            <div key={g.group} className="card p-5">
              <h3 className="mb-3 font-bold">{g.group}</h3>
              <ItemList items={g.items} />
            </div>
          ))}
        </div>
      </Section>

      {/* 6. Practice structures */}
      <Section id="structure" title="6. 연습 시간 구조">
        <div className="space-y-6">
          <PracticeTable title="90분 연습" rows={LAX_PRACTICE_90} />
          <PracticeTable title="2시간 연습" rows={LAX_PRACTICE_120} />
        </div>
      </Section>

      {/* 7. Pregame */}
      <Section id="pregame" title="7. 경기 전 웜업 (20분)">
        <p className="mb-4 rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-600">{LAX_PREGAME_NOTE}</p>
        <PracticeTable rows={LAX_PREGAME} head={["시각", "단계", "내용"]} />
      </Section>

      {/* 8. Positions */}
      <Section id="position" title="8. 포지션별 훈련 플랜">
        <div className="grid gap-4 sm:grid-cols-2">
          {LAX_POSITIONS.map((p) => (
            <div key={p.name} className="card p-5">
              <h3 className="font-bold">
                {p.emoji} {p.name}
              </h3>
              <ItemList items={p.blocks} className="mt-3" />
              {p.source && <p className="mt-3 text-xs text-slate-400">출처: {p.source}</p>}
            </div>
          ))}
        </div>
      </Section>

      {/* 9. Weekly */}
      <Section id="weekly" title="9. 주간 로테이션">
        <div className="card divide-y divide-slate-100">
          {LAX_WEEKLY.map(([day, focus]) => (
            <div key={day} className="flex gap-4 px-5 py-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                {day}
              </span>
              <p className="pt-0.5 text-sm text-slate-700">{focus}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* 10. Strength */}
      <Section id="strength" title="10. 근력 & 플라이오메트릭">
        <div className="space-y-4">
          {LAX_STRENGTH.map((g) => (
            <div key={g.group} className="card p-5">
              <h3 className="font-bold">{g.group}</h3>
              <ItemList items={g.items} className="mt-3" />
            </div>
          ))}
        </div>
      </Section>

      {/* 11. Videos */}
      <Section id="videos" title="11. 영상 자료실">
        <p className="mb-4 text-sm text-slate-500">모든 링크는 남자 선수·D1 코치·PLL 프로 영상입니다. (YouTube에서 열립니다)</p>
        <div className="space-y-5">
          {LAX_VIDEOS.map((g) => (
            <div key={g.group}>
              <h3 className="mb-2 text-sm font-semibold text-slate-500">{g.group}</h3>
              <div className="card divide-y divide-slate-100">
                {g.videos.map((v) => (
                  <a
                    key={v.url}
                    href={v.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 px-4 py-3 transition hover:bg-slate-50"
                  >
                    <span className="mt-0.5 text-brand">▶</span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-slate-800">{v.title}</span>
                      <span className="block text-xs text-slate-400">{v.note}</span>
                    </span>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* 12. Habits */}
      <Section id="habits" title="12. 데일리 습관">
        <div className="card p-5">
          <ItemList items={LAX_HABITS} />
        </div>
      </Section>
    </main>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mt-8 scroll-mt-28">
      <h2 className="mb-4 border-l-4 border-emerald-500 pl-3 text-lg font-bold">{title}</h2>
      {children}
    </section>
  );
}

function ItemList({ items, className = "" }: { items: NamedItem[]; className?: string }) {
  return (
    <ul className={`space-y-2.5 ${className}`}>
      {items.map((it, i) => (
        <li key={i} className="text-sm">
          <span className="font-semibold text-slate-800">{it.name}</span>
          <span className="text-slate-600"> — {it.detail}</span>
        </li>
      ))}
    </ul>
  );
}

function PracticeTable({
  title,
  rows,
  head = ["시각", "블록", "내용"],
}: {
  title?: string;
  rows: [string, string, string][];
  head?: [string, string, string] | string[];
}) {
  return (
    <div>
      {title && <h3 className="mb-2 font-bold">{title}</h3>}
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs text-slate-400">
              <th className="px-4 py-2.5 font-medium">{head[0]}</th>
              <th className="px-4 py-2.5 font-medium">{head[1]}</th>
              <th className="px-4 py-2.5 font-medium">{head[2]}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b border-slate-50 last:border-0">
                <td className="whitespace-nowrap px-4 py-2.5 font-mono text-xs text-slate-500">{r[0]}</td>
                <td className="whitespace-nowrap px-4 py-2.5 font-medium text-slate-800">{r[1]}</td>
                <td className="px-4 py-2.5 text-slate-600">{r[2]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
