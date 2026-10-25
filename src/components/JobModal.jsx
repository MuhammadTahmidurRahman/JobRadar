import { useEffect } from "react";
import { CATEGORY_LABELS, LEVEL_LABELS, buildApplySteps, daysLeft, timeAgo } from "../lib/helpers.js";

export default function JobModal({ job, saved, onToggleSave, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const steps = buildApplySteps(job);
  const left = daysLeft(job.deadline);

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={job.title} onClick={(e) => e.stopPropagation()}>
        <button className="close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <h2>{job.title}</h2>
        <p className="company">
          {job.company} <span className="dot">·</span> {job.location}
        </p>
        <div className="chips">
          <span className={`chip ${job.scope === "bangladesh" ? "chip-bd" : "chip-remote"}`}>
            {job.scope === "bangladesh" ? "Bangladesh" : "Global remote"}
          </span>
          <span className="chip">{LEVEL_LABELS[job.level]}</span>
          {job.categories.map((c) => (
            <span className="chip" key={c}>
              {CATEGORY_LABELS[c] ?? c}
            </span>
          ))}
          {job.employmentType && <span className="chip">{job.employmentType}</span>}
          {left !== null && <span className="chip chip-warn">{left >= 0 ? `${left}d left to apply` : "Deadline passed"}</span>}
        </div>
        <p className="muted small">
          Posted {timeAgo(job.postedAt ?? job.firstSeen) || "recently"} · via{" "}
          <a href={job.sourceUrl} target="_blank" rel="noopener">
            {job.source}
          </a>
        </p>

        {job.description && (
          <>
            <h4>Summary</h4>
            <p className="desc">{job.description}{job.description.length >= 700 ? "…" : ""}</p>
          </>
        )}
        {job.tags?.length > 0 && (
          <div className="chips">
            {job.tags.map((t) => (
              <span className="chip chip-tag" key={t}>
                {t}
              </span>
            ))}
          </div>
        )}

        <h4>How to apply</h4>
        <ol className="steps">
          {steps.map((s) => (
            <li key={s.title}>
              <strong>{s.title}</strong>
              <span>{s.text}</span>
            </li>
          ))}
        </ol>

        <div className="actions">
          <a className="btn primary" href={job.url} target="_blank" rel="noopener">
            Apply on {job.source} ↗
          </a>
          <button className="btn" onClick={() => onToggleSave(job)}>
            {saved ? "★ Saved" : "☆ Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
