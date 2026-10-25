import { loadData, saveData, mergeJobs } from "../shared/store.mjs";
import { runScrape } from "../shared/scrape.mjs";

// GET /api/jobs  → the latest job list (JSON)
export default async () => {
  let data = await loadData();

  // First visit ever: nothing stored yet, so do one quick scrape right now.
  if (!data) {
    try {
      const fresh = await runScrape({ timeoutMs: 6000 });
      data = mergeJobs(null, fresh);
      await saveData(data);
    } catch {
      data = { updatedAt: null, jobs: [], sources: [] };
    }
  }

  return new Response(JSON.stringify(data), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=300",
    },
  });
};

export const config = { path: "/api/jobs" };
