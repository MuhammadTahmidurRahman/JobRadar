import { loadData, saveData, mergeJobs } from "../shared/store.mjs";
import { runScrape } from "../shared/scrape.mjs";

// GET /api/refresh?token=YOUR_SECRET  → scrape right now (manual update).
// Set REFRESH_TOKEN in Netlify → Site configuration → Environment variables.
export default async (req) => {
  const secret = process.env.REFRESH_TOKEN;
  const token = new URL(req.url).searchParams.get("token");

  if (!secret) {
    return json({ error: "REFRESH_TOKEN is not set on the server." }, 403);
  }
  if (token !== secret) {
    return json({ error: "Wrong token." }, 401);
  }

  const old = await loadData();
  const fresh = await runScrape({ timeoutMs: 6000 });
  const merged = mergeJobs(old, fresh);
  await saveData(merged);
  return json({ ok: true, jobs: merged.jobs.length, sources: merged.sources });
};

const json = (body, status = 200) =>
  new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });

export const config = { path: "/api/refresh" };
