import { BD_LINKS, GENERAL_TIPS } from "../lib/helpers.js";

export default function GuideTab() {
  return (
    <section className="guide">
      <h2>Apply guide</h2>
      <p className="muted">
        Every job also has its own step-by-step guide. Click a job to see it. These are general tips and shortcuts.
      </p>

      <h3>Other places to look in Bangladesh</h3>
      <p className="muted small">
        These portals are not scraped (their pages are built with JavaScript and their terms are stricter), so use them by hand once in a while.
      </p>
      <ul className="linklist">
        {BD_LINKS.map((l) => (
          <li key={l.url}>
            <a href={l.url} target="_blank" rel="noopener">
              {l.name} ↗
            </a>
            <span className="muted small">{l.note}</span>
          </li>
        ))}
      </ul>

      <h3>Tips / টিপস</h3>
      <ul className="tips">
        {GENERAL_TIPS.map((t) => (
          <li key={t.en}>
            <span>{t.bn}</span>
            <span className="muted small">{t.en}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
