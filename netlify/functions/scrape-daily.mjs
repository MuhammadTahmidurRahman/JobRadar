import { loadData, saveData, mergeJobs } from "../shared/store.mjs";
import { runScrape } from "../shared/scrape.mjs";

// Runs automatically every day at 02:00 UTC = 08:00 in Dhaka.
export default async () => {
  const old = await loadData();
  const fresh = await runScrape({ timeoutMs: 12000 });
  const merged = mergeJobs(old, fresh);
  await saveData(merged);
  console.log(`JobRadar: ${merged.jobs.length} jobs stored`, fresh.sources);
};

export const config = { schedule: "0 2 * * *" };
