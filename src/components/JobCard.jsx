import { CATEGORY_LABELS, LEVEL_LABELS, timeAgo, daysLeft, isNew } from "../lib/helpers.js";

export default function JobCard({ job, saved, onToggleSave, onOpen }) {
  const left = daysLeft(job.deadline);
  return (
    <article className="card" onClick={() => onOpen(job)} tabIndex={0} onKeyDown={(e) => e.key === "Enter" && onOpen(job)}>
      <div className="card-main">
        <div className="card-top">
          <h3>{job.title}</h3>
          {isNew(job) && <span className="chip chip-new">New</span>}
        </div>
        <p className="company">
          {job.company} <span className="dot">·</span> {job.location}
        </p>
        <div className="chips">
          <span className={`chip ${job.scope === "bangladesh" ? "chip-bd" : "chip-remote"}`}>
            {job.scope === "bangladesh" ? "Bangladesh" : "Global remote"}
          </span>
          {job.scope === "remote" && job.bdEligible === "yes" && <span className="chip chip-ok">Open to BD ✓</span>}
          {job.scope === "remote" && job.bdEligible === "no" && <span className="chip chip-warn">May exclude BD</span>}
          {job.level !== "mid" && <span className="chip">{LEVEL_LABELS[job.level]}</span>}
          {job.categories.slice(0, 2).map((c) => (
            <span className="chip" key={c}>
              {CATEGORY_LABELS[c] ?? c}
            </span>
          ))}
          {left !== null && left >= 0 && (
            <span className={`chip ${left <= 5 ? "chip-warn" : ""}`}>{left === 0 ? "Closes today" : `${left}d left`}</span>
          )}
        </div>
      </div>
      <div className="card-side">
        <button
          className={`star ${saved ? "on" : ""}`}
          aria-label={saved ? "Remove from saved" : "Save job"}
          title={saved ? "Remove from saved" : "Save job"}
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave(job);
          }}
        >
          {saved ? "★" : "☆"}
        </button>
        <span className="muted small">{timeAgo(job.postedAt ?? job.firstSeen)}</span>
        <span className="muted small">{job.source}</span>
      </div>
    </article>
  );
}
