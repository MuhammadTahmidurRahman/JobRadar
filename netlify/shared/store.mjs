import { getStore } from "@netlify/blobs";

const KEY = "jobs.json";
const DAY = 24 * 60 * 60 * 1000;

const store = () => getStore({ name: "jobradar", consistency: "strong" });

export async function loadData() {
  try {
    return (await store().get(KEY, { type: "json" })) ?? null;
  } catch {
    return null;
  }
}

export async function saveData(data) {
  await store().setJSON(KEY, data);
}

// Combine yesterday's list with today's scrape: keep firstSeen, drop stale/expired jobs.
export function mergeJobs(oldData, fresh, now = new Date()) {
  const nowIso = now.toISOString();
  const byId = new Map((oldData?.jobs ?? []).map((j) => [j.id, j]));

  for (const j of fresh.jobs) {
    const prev = byId.get(j.id);
    byId.set(j.id, { ...j, firstSeen: prev?.firstSeen ?? nowIso, lastSeen: nowIso });
  }

  const jobs = [...byId.values()].filter((j) => {
    const lastSeen = Date.parse(j.lastSeen ?? j.firstSeen);
    if (now - lastSeen > 14 * DAY) return false; // disappeared from source for 2 weeks
    if (j.postedAt && now - Date.parse(j.postedAt) > 60 * DAY) return false;
    if (j.deadline && Date.parse(j.deadline) < now - DAY) return false; // deadline passed
    return true;
  });

  jobs.sort(
    (a, b) =>
      Date.parse(b.postedAt ?? b.firstSeen ?? 0) - Date.parse(a.postedAt ?? a.firstSeen ?? 0)
  );

  return { updatedAt: nowIso, jobs, sources: fresh.sources };
}
