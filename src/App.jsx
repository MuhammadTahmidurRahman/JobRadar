import { useEffect, useMemo, useState, useCallback } from "react";
import JobCard from "./components/JobCard.jsx";
import JobModal from "./components/JobModal.jsx";
import GuideTab from "./components/GuideTab.jsx";
import { CATEGORY_LABELS, LEVEL_LABELS, loadSaved, persistSaved, sortKey, timeAgo, isNew } from "./lib/helpers.js";

async function fetchJobs() {
  try {
    const res = await fetch("/api/jobs");
    if (!res.ok) throw new Error("api");
    const data = await res.json();
    if (!Array.isArray(data.jobs)) throw new Error("bad shape");
    return { ...data, sample: false };
  } catch {
    // Running with plain `vite` (no Netlify functions): show sample data so the UI is testable.
    const res = await fetch("/sample-jobs.json");
    return { ...(await res.json()), sample: true };
  }
}

export default function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("jobs");
  const [saved, setSaved] = useState(loadSaved);
  const [open, setOpen] = useState(null);

  const [q, setQ] = useState("");
  const [scope, setScope] = useState("all");
  const [cat, setCat] = useState("all");
  const [level, setLevel] = useState("all");
  const [bdOnly, setBdOnly] = useState(false);
  const [newOnly, setNewOnly] = useState(false);
  const [sort, setSort] = useState("newest");

  useEffect(() => {
    fetchJobs().then(setData).catch(() => setError("Could not load jobs. Please refresh the page."));
  }, []);

  const savedIds = useMemo(() => new Set(saved.map((j) => j.id)), [saved]);
  const toggleSave = useCallback((job) => {
    setSaved((prev) => {
      const next = prev.some((j) => j.id === job.id) ? prev.filter((j) => j.id !== job.id) : [job, ...prev];
      persistSaved(next);
      return next;
    });
  }, []);

  const jobs = data?.jobs ?? [];

  const filtered = useMemo(() => {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    let list = jobs.filter((j) => {
      if (scope !== "all" && j.scope !== scope) return false;
      if (cat !== "all" && !j.categories.includes(cat)) return false;
      if (level !== "all" && j.level !== level) return false;
      if (bdOnly && j.scope === "remote" && j.bdEligible === "no") return false;
      if (newOnly && !isNew(j)) return false;
      if (words.length) {
        const hay = `${j.title} ${j.company} ${j.location} ${(j.tags || []).join(" ")}`.toLowerCase();
        if (!words.every((w) => hay.includes(w))) return false;
      }
      return true;
    });
    if (sort === "newest") list = [...list].sort((a, b) => sortKey(b) - sortKey(a));
    if (sort === "deadline")
      list = [...list].sort((a, b) => (Date.parse(a.deadline) || Infinity) - (Date.parse(b.deadline) || Infinity));
    return list;
  }, [jobs, q, scope, cat, level, bdOnly, newOnly, sort]);

  const counts = useMemo(
    () => ({
      all: jobs.length,
      bd: jobs.filter((j) => j.scope === "bangladesh").length,
      remote: jobs.filter((j) => j.scope === "remote").length,
      fresh: jobs.filter(isNew).length,
    }),
    [jobs]
  );

  const failed = (data?.sources ?? []).filter((s) => !s.ok);
  const listToShow = tab === "saved" ? saved : filtered;

  return (
    <div className="app">
      <header className="top">
        <div className="brand">
          <svg width="28" height="28" viewBox="0 0 64 64" aria-hidden="true">
            <rect width="64" height="64" rx="14" fill="#0f766e" />
            <circle cx="32" cy="32" r="18" fill="none" stroke="#fff" strokeWidth="4" opacity=".5" />
            <circle cx="32" cy="32" r="9" fill="none" stroke="#fff" strokeWidth="4" />
            <path d="M32 32 L48 16" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
          </svg>
          <div>
            <h1>JobRadar</h1>
            <p className="muted small">IT &amp; CS jobs · Bangladesh + global remote</p>
          </div>
        </div>
        <p className="muted small updated">
          {data?.updatedAt ? `Updated ${timeAgo(data.updatedAt)}` : data ? "Not updated yet" : "Loading…"}
        </p>
      </header>

      <nav className="tabs" aria-label="Sections">
        <button className={tab === "jobs" ? "on" : ""} onClick={() => setTab("jobs")}>
          Jobs <span className="count">{counts.all}</span>
        </button>
        <button className={tab === "saved" ? "on" : ""} onClick={() => setTab("saved")}>
          Saved <span className="count">{saved.length}</span>
        </button>
        <button className={tab === "guide" ? "on" : ""} onClick={() => setTab("guide")}>
          Apply guide
        </button>
      </nav>

      {data?.sample && (
        <div className="banner">
          Showing <strong>sample data</strong>. Real jobs appear once the site runs on Netlify (or with <code>netlify dev</code>).
        </div>
      )}
      {error && <div className="banner bad">{error}</div>}

      {tab === "guide" ? (
        <GuideTab />
      ) : (
        <>
          {tab === "jobs" && (
            <section className="filters">
              <input
                className="search"
                type="search"
                placeholder="Search title, company, skill (e.g. python, react, intern)…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <div className="row">
                <div className="seg" role="group" aria-label="Where">
                  {[
                    ["all", `All (${counts.all})`],
                    ["bangladesh", `Bangladesh (${counts.bd})`],
                    ["remote", `Remote (${counts.remote})`],
                  ].map(([v, label]) => (
                    <button key={v} className={scope === v ? "on" : ""} onClick={() => setScope(v)}>
                      {label}
                    </button>
                  ))}
                </div>
                <select value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Category">
                  <option value="all">All categories</option>
                  {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
                <select value={level} onChange={(e) => setLevel(e.target.value)} aria-label="Level">
                  <option value="all">All levels</option>
                  {Object.entries(LEVEL_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
                <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort">
                  <option value="newest">Newest first</option>
                  <option value="deadline">Deadline soonest</option>
                </select>
              </div>
              <div className="row">
                <label className="check">
                  <input type="checkbox" checked={bdOnly} onChange={(e) => setBdOnly(e.target.checked)} /> Hide remote jobs that exclude Bangladesh
                </label>
                <label className="check">
                  <input type="checkbox" checked={newOnly} onChange={(e) => setNewOnly(e.target.checked)} /> New only ({counts.fresh})
                </label>
              </div>
            </section>
          )}

          <main className="list">
            {!data && !error && <p className="muted pad">Loading jobs…</p>}
            {data && listToShow.length === 0 && (
              <p className="muted pad">
                {tab === "saved"
                  ? "No saved jobs yet. Press ☆ on any job to keep it here."
                  : jobs.length === 0
                  ? "No jobs stored yet. The first scrape runs on your first visit; if this stays empty, open /api/refresh?token=YOUR_TOKEN once."
                  : "No jobs match these filters."}
              </p>
            )}
            {listToShow.map((j) => (
              <JobCard key={j.id} job={j} saved={savedIds.has(j.id)} onToggleSave={toggleSave} onOpen={setOpen} />
            ))}
          </main>
        </>
      )}

      <footer className="foot muted small">
        {data?.sources?.length > 0 && (
          <p>
            Sources: {data.sources.filter((s) => s.ok).length}/{data.sources.length} working
            {failed.length > 0 && (
              <>
                {" "}
                · not working today: {failed.map((s) => s.name).join(", ")}
              </>
            )}
          </p>
        )}
        <p>
          Job data via{" "}
          <a href="https://weworkremotely.com" target="_blank" rel="noopener">
            We Work Remotely
          </a>
          ,{" "}
          <a href="https://remoteok.com" target="_blank" rel="noopener">
            Remote OK
          </a>{" "}
          and company career pages. Always apply on the original page. Updated automatically every day at 8:00 AM (Dhaka).
        </p>
      </footer>

      {open && <JobModal job={open} saved={savedIds.has(open.id)} onToggleSave={toggleSave} onClose={() => setOpen(null)} />}
    </div>
  );
}
