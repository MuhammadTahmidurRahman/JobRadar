// Run:  npm run scrape:test
// Runs the scraper on your own PC and prints what each source returned (nothing is saved).
import { runScrape } from "../netlify/shared/scrape.mjs";

const { jobs, sources } = await runScrape({ timeoutMs: 15000 });

console.log("\nSources:");
for (const s of sources) {
  console.log(`  ${s.ok ? "OK  " : "FAIL"} ${s.id.padEnd(18)} ${String(s.count).padStart(3)} jobs ${s.error ? "(" + s.error + ")" : ""}`);
}
console.log(`\nTotal: ${jobs.length} IT jobs\n`);
for (const j of jobs.slice(0, 10)) {
  console.log(`- [${j.scope}] ${j.title} @ ${j.company}  (${j.level}, ${j.categories.join("/")}, BD: ${j.bdEligible})`);
  console.log(`  ${j.url}`);
}
