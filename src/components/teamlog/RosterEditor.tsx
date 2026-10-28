"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Lang } from "@/lib/i18n";
import { tl } from "@/lib/teamLogText";
import { nameKey } from "@/lib/nameKey";
import { bt } from "@/lib/bitacoraText";

export interface RosterRow {
  userId: string;
  name: string;
  managed: boolean;
  number: number | null;
  birthDate: string | null;
  curp: string | null;
  guardian1Name: string | null;
  guardian1Email: string | null;
  guardian1Phone: string | null;
  guardian2Name: string | null;
  guardian2Email: string | null;
  guardian2Phone: string | null;
}

const GUARDIAN_FIELDS = ["Name", "Email", "Phone"] as const;
type Key = Exclude<keyof RosterRow, "userId" | "managed">;

async function send(url: string, method: string, body: unknown): Promise<string | null> {
  const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (res.ok) return null;
  const data = await res.json().catch(() => null);
  return data?.error ?? "error";
}

/** Category, branch and time zone. */
export function TeamDetailsForm({
  teamId,
  lang,
  initial,
  timeZones,
}: {
  teamId: string;
  lang: Lang;
  initial: { category: string; branch: string; timeZone: string };
  timeZones: readonly string[];
}) {
  const s = tl(lang);
  const r = s.roster;
  const router = useRouter();
  const [v, setV] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <form
      className="card grid gap-3 p-5 md:grid-cols-3"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        const err = await send(`/api/teams/${teamId}`, "PATCH", v);
        setBusy(false);
        setMsg(err ? (err === "error" ? s.common.errSave : err) : s.common.saved);
        if (!err) router.refresh();
      }}
    >
      <h2 className="text-sm font-bold md:col-span-3">{r.teamInfo}</h2>
      <label>
        <span className="label">{r.category}</span>
        <input className="input" name="category" placeholder={r.categoryHint} maxLength={40} value={v.category} onChange={(e) => setV({ ...v, category: e.target.value })} />
      </label>
      <label>
        <span className="label">{r.branch}</span>
        <input className="input" name="branch" placeholder={r.branchHint} maxLength={40} value={v.branch} onChange={(e) => setV({ ...v, branch: e.target.value })} />
      </label>
      <label>
        <span className="label">{r.timeZone}</span>
        <select className="input" name="timeZone" value={v.timeZone} onChange={(e) => setV({ ...v, timeZone: e.target.value })}>
          {timeZones.map((z) => (
            <option key={z} value={z}>
              {z.replace(/_/g, " ")}
            </option>
          ))}
        </select>
        <span className="mt-1 block text-[11px] text-slate-500">{r.timeZoneHint}</span>
      </label>
      <div className="flex items-center justify-end gap-3 md:col-span-3">
        <span className="text-xs text-slate-500" role="status">
          {msg ?? ""}
        </span>
        <button type="submit" className="btn-primary text-sm" disabled={busy}>
          {busy ? s.common.saving : s.common.save}
        </button>
      </div>
    </form>
  );
}

/** Paste a list of names to put players on the roster without accounts. */
export function AddPlayersForm({ teamId, lang }: { teamId: string; lang: Lang }) {
  const s = tl(lang);
  const r = s.roster;
  const router = useRouter();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const names = text
    .split(/\r?\n/)
    .map((n) => n.trim())
    .filter(Boolean);
  return (
    <form
      className="card p-5"
      onSubmit={async (e) => {
        e.preventDefault();
        if (names.length === 0) return;
        setBusy(true);
        const err = await send(`/api/teams/${teamId}/roster`, "POST", { names });
        setBusy(false);
        if (err) {
          setMsg({ ok: false, text: err === "error" ? s.common.errSave : err });
          return;
        }
        setMsg({ ok: true, text: r.added(names.length) });
        setText("");
        router.refresh();
      }}
    >
      <h2 className="text-sm font-bold">{r.addPlayer}</h2>
      <p className="mt-1 text-xs text-slate-600">{r.addPlayerSub}</p>
      <label className="mt-3 block">
        <span className="label">{r.pasteNames}</span>
        <textarea
          name="names"
          className="input min-h-[96px]"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={r.namesExample}
        />
      </label>
      <div className="mt-3 flex items-center justify-end gap-3">
        <span className={`text-xs ${msg?.ok === false ? "text-red-700" : "text-emerald-700"}`} role={msg?.ok === false ? "alert" : "status"}>
          {msg?.text ?? ""}
        </span>
        <button type="submit" className="btn-primary text-sm" disabled={busy || names.length === 0}>
          {busy ? s.common.saving : r.addPlayers(names.length)}
        </button>
      </div>
    </form>
  );
}

function PlayerEditor({ teamId, lang, row, onDone }: { teamId: string; lang: Lang; row: RosterRow; onDone: () => void }) {
  const s = tl(lang);
  const r = s.roster;
  const router = useRouter();
  const [v, setV] = useState<Record<Key, string>>(() => {
    const out = {} as Record<Key, string>;
    for (const k of Object.keys(row) as (keyof RosterRow)[]) {
      if (k === "userId" || k === "managed") continue;
      out[k] = row[k] == null ? "" : String(row[k]);
    }
    return out;
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const field = (k: Key, label: string, type = "text", hint?: string) => (
    <label key={k}>
      <span className="label">{label}</span>
      <input
        className="input"
        name={k}
        type={type}
        value={v[k]}
        onChange={(e) => setV({ ...v, [k]: k === "curp" ? e.target.value.toUpperCase() : e.target.value })}
        {...(k === "curp" && { maxLength: 18, autoCapitalize: "characters", spellCheck: false })}
      />
      {hint && <span className="mt-0.5 block text-[11px] text-slate-500">{hint}</span>}
    </label>
  );
  const b = bt(lang).roster;
  return (
    <form
      className="mt-3 grid gap-3 rounded-xl bg-slate-50 p-3 sm:grid-cols-3"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError(null);
        const { name, number, ...rest } = v;
        const err = await send(`/api/teams/${teamId}/roster/${row.userId}`, "PATCH", {
          ...rest,
          ...(row.managed && name.trim() ? { name } : {}),
          number: number.trim() === "" ? null : Number(number),
        });
        setBusy(false);
        if (err) {
          setError(err === "error" ? s.common.errSave : err);
          return;
        }
        onDone();
        router.refresh();
      }}
    >
      {row.managed && field("name", r.name)}
      {field("number", r.number, "number")}
      {field("birthDate", r.birthDate, "date")}
      {field("curp", b.curp, "text", b.curpHint)}
      {[1, 2].map((n) => (
        <fieldset key={n} className="grid gap-2 sm:col-span-3 sm:grid-cols-3">
          <legend className="mb-1 text-xs font-bold text-slate-600">{n === 1 ? r.guardian1 : r.guardian2}</legend>
          {GUARDIAN_FIELDS.map((f) =>
            field(`guardian${n}${f}` as Key, f === "Name" ? r.name : f === "Email" ? r.email : r.phone, f === "Email" ? "email" : f === "Phone" ? "tel" : "text"),
          )}
        </fieldset>
      ))}
      {error && (
        <p role="alert" className="text-sm text-red-700 sm:col-span-3">
          {error}
        </p>
      )}
      <div className="flex justify-end gap-2 sm:col-span-3">
        <button type="button" className="btn-ghost text-sm" onClick={onDone}>
          {s.common.cancel}
        </button>
        <button type="submit" className="btn-primary text-sm" disabled={busy}>
          {busy ? s.common.saving : s.common.save}
        </button>
      </div>
    </form>
  );
}

/** Take a player off the team, with the reason the year-end report lists. */
function RemovePanel({ teamId, lang, row, onDone }: { teamId: string; lang: Lang; row: RosterRow; onDone: () => void }) {
  const s = tl(lang);
  const b = bt(lang).roster;
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <form
      className="mt-3 space-y-3 rounded-xl bg-rose-50 p-3"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError(null);
        const err = await send(`/api/teams/${teamId}/members/${row.userId}`, "DELETE", { reason });
        setBusy(false);
        if (err) {
          setError(err === "error" ? s.common.errSave : err);
          return;
        }
        onDone();
        router.refresh();
      }}
    >
      <label className="block">
        <span className="label">
          {b.leaveReason} {s.common.optional}
        </span>
        <input name="reason" className="input" maxLength={300} value={reason} onChange={(e) => setReason(e.target.value)} />
        <span className="mt-0.5 block text-[11px] text-slate-600">{b.leaveReasonHint}</span>
      </label>
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <button type="button" className="btn-ghost text-sm" onClick={onDone}>
          {s.common.cancel}
        </button>
        <button type="submit" className="btn-primary bg-rose-700 text-sm hover:bg-rose-800" disabled={busy}>
          {busy ? s.common.saving : `${b.remove}: ${row.name}`}
        </button>
      </div>
    </form>
  );
}

/** Pick the account a roster-only player becomes, and confirm. */
function MergePanel({
  teamId,
  lang,
  row,
  accounts,
  suggested,
  onDone,
}: {
  teamId: string;
  lang: Lang;
  row: RosterRow;
  accounts: RosterRow[];
  suggested: string | null;
  onDone: () => void;
}) {
  const s = tl(lang);
  const r = s.roster;
  const router = useRouter();
  const [into, setInto] = useState(suggested ?? accounts[0]?.userId ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (accounts.length === 0) {
    return (
      <div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
        <p>{r.noAccounts}</p>
        <div className="mt-2 flex justify-end">
          <button type="button" className="btn-ghost text-sm" onClick={onDone}>
            {s.common.cancel}
          </button>
        </div>
      </div>
    );
  }
  const target = accounts.find((a) => a.userId === into);
  return (
    <form
      className="mt-3 space-y-3 rounded-xl bg-amber-50 p-3"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!target || !window.confirm(r.mergeConfirm(row.name, target.name))) return;
        setBusy(true);
        setError(null);
        const err = await send(`/api/teams/${teamId}/roster/${row.userId}/merge`, "POST", { into });
        setBusy(false);
        if (err) {
          setError(err === "error" ? s.common.errSave : err);
          return;
        }
        onDone();
        router.refresh();
      }}
    >
      <p className="text-sm text-slate-700">{r.mergeSub(row.name)}</p>
      <label className="block">
        <span className="label">{r.mergeInto}</span>
        <select name="into" className="input" value={into} onChange={(e) => setInto(e.target.value)}>
          {accounts.map((a) => (
            <option key={a.userId} value={a.userId}>
              {a.name}
            </option>
          ))}
        </select>
      </label>
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <button type="button" className="btn-ghost text-sm" onClick={onDone}>
          {s.common.cancel}
        </button>
        <button type="submit" className="btn-primary text-sm" disabled={busy || !into}>
          {busy ? s.common.saving : r.mergeGo}
        </button>
      </div>
    </form>
  );
}

/**
 * The roster with each player's details, editable one player at a time.
 *
 * A roster-only player whose name matches someone with an account (ignoring
 * accents, case and word order) is flagged at the top: that is almost always
 * the same child, added by the coach before they signed up.
 */
export default function RosterEditor({ teamId, lang, rows }: { teamId: string; lang: Lang; rows: RosterRow[] }) {
  const s = tl(lang);
  const r = s.roster;
  const [open, setOpen] = useState<{ id: string; mode: "edit" | "merge" | "remove" } | null>(null);
  const accounts = rows.filter((x) => !x.managed);
  const byKey = new Map(accounts.map((a) => [nameKey(a.name), a]));
  const matchOf = (row: RosterRow) => (row.managed ? byKey.get(nameKey(row.name)) ?? null : null);
  const duplicates = rows.filter((x) => matchOf(x));

  return (
    <div className="space-y-4">
      {duplicates.length > 0 && (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4" aria-labelledby="dup-title">
          <h2 id="dup-title" className="text-sm font-bold text-amber-900">
            {r.dupTitle}
          </h2>
          <ul className="mt-2 space-y-2">
            {duplicates.map((d) => (
              <li key={d.userId} className="flex flex-wrap items-center justify-between gap-2 text-sm text-amber-900">
                <span>{r.dupLine(d.name, matchOf(d)!.name)}</span>
                <button type="button" className="btn-ghost bg-white px-3 py-1 text-xs" onClick={() => setOpen({ id: d.userId, mode: "merge" })}>
                  {r.merge}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
      <ul className="card divide-y divide-slate-100">
        {rows.map((row) => {
          const isOpen = open?.id === row.userId;
          return (
            <li key={row.userId} className="px-4 py-3" data-player={row.name}>
              <div className="flex flex-wrap items-center gap-3">
                <span className="w-8 text-right text-sm font-bold tabular-nums text-slate-500">{row.number ?? "–"}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">
                    {row.name}
                    {row.managed && (
                      <span className="ml-2 rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">{r.noAccount}</span>
                    )}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {[row.birthDate, row.curp, row.guardian1Name, row.guardian1Phone, row.guardian1Email].filter(Boolean).join(" · ") || r.noDetails}
                  </p>
                </div>
                {!isOpen && (
                  <div className="flex gap-1">
                    {row.managed && (
                      <button type="button" className="btn-ghost px-2 py-1 text-xs" onClick={() => setOpen({ id: row.userId, mode: "merge" })}>
                        {r.merge}
                      </button>
                    )}
                    <button type="button" className="btn-ghost px-2 py-1 text-xs" onClick={() => setOpen({ id: row.userId, mode: "edit" })}>
                      {s.common.edit}
                    </button>
                    <button type="button" className="btn-ghost px-2 py-1 text-xs text-rose-800" onClick={() => setOpen({ id: row.userId, mode: "remove" })}>
                      {bt(lang).roster.remove}
                    </button>
                  </div>
                )}
              </div>
              {isOpen && open.mode === "edit" && <PlayerEditor teamId={teamId} lang={lang} row={row} onDone={() => setOpen(null)} />}
              {isOpen && open.mode === "remove" && <RemovePanel teamId={teamId} lang={lang} row={row} onDone={() => setOpen(null)} />}
              {isOpen && open.mode === "merge" && (
                <MergePanel
                  teamId={teamId}
                  lang={lang}
                  row={row}
                  accounts={accounts}
                  suggested={matchOf(row)?.userId ?? null}
                  onDone={() => setOpen(null)}
                />
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
