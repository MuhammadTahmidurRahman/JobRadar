import { createHash } from "node:crypto";
import * as cheerio from "cheerio";
import { XMLParser } from "fast-xml-parser";
import { FEEDS, CAREER_PAGES } from "./sources.mjs";
import { isTech, categorize, detectLevel, bdEligibility } from "./classify.mjs";

const UA = "JobRadarPersonalBot/1.0 (personal job-search tool; once-a-day fetch)";

async function fetchText(url, timeoutMs) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      headers: { "user-agent": UA, accept: "text/html,application/xml,application/rss+xml,*/*" },
      signal: ctrl.signal,
      redirect: "follow",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(t);
  }
}

const str = (v) => (Array.isArray(v) ? v.join(", ") : v == null ? "" : String(v));
const plain = (html) => cheerio.load(`<div>${html}</div>`).text().replace(/\s+/g, " ").trim();
const idOf = (url) => createHash("sha1").update(url).digest("hex").slice(0, 12);
const toIso = (v) => {
  const ms = Date.parse(str(v));
  return Number.isNaN(ms) ? null : new Date(ms).toISOString();
};

function build(raw) {
  const text = `${raw.title} ${raw.tags?.join(" ") ?? ""}`;
  return {
    id: idOf(raw.url),
    title: raw.title,
    company: raw.company || "Unknown company",
    url: raw.url,
    source: raw.source,
    sourceUrl: raw.sourceUrl,
    scope: raw.scope, // "remote" | "bangladesh"
    location: raw.location || (raw.scope === "remote" ? "Remote" : "Bangladesh"),
    employmentType: raw.employmentType || "",
    categories: categorize(text),
    level: detectLevel(raw.title),
    bdEligible: raw.scope === "bangladesh" ? "yes" : bdEligibility(raw.location),
    tags: (raw.tags ?? []).slice(0, 8),
    postedAt: raw.postedAt ?? null,
    deadline: raw.deadline ?? null,
    description: (raw.description || "").slice(0, 700),
  };
}

async function scrapeFeed(src, timeoutMs) {
  const xml = await fetchText(src.url, timeoutMs);
  const doc = new XMLParser({ ignoreAttributes: true, trimValues: true }).parse(xml);
  const items = [].concat(doc?.rss?.channel?.item ?? []);
  const out = [];
  for (const it of items) {
    const link = str(it.link).trim();
    const rawTitle = plain(str(it.title));
    if (!link || !rawTitle) continue;

    let company = str(it.company);
    let title = rawTitle;
    // We Work Remotely titles look like "Company: Job title"
    if (src.format === "wwr" && rawTitle.includes(": ")) {
      const i = rawTitle.indexOf(": ");
      company = company || rawTitle.slice(0, i);
      title = rawTitle.slice(i + 2);
    }
    const location = str(it.region || it.location || it.country);
    const tags = (str(it.skills || it.tags || it.category) || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const description = plain(str(it.description));

    if (!isTech(title, tags.join(" "))) continue;

    out.push(
      build({
        title,
        company,
        url: link,
        source: src.name,
        sourceUrl: src.siteUrl,
        scope: "remote",
        location,
        employmentType: str(it.type),
        tags,
        postedAt: toIso(it.pubDate),
        deadline: toIso(it.expires_at),
        description,
      })
    );
  }
  return out;
}

const NAV_WORDS = /^(careers?|jobs?|home|about|contact|blog|apply now|view all|read more|learn more|login|sign in|open positions?)$/i;
const ROLE_WORDS =
  /(engineer|developer|programmer|architect|devops|administrator|analyst|scientist|qa|tester|intern|trainee|specialist|lead|consultant|executive|officer|designer)/i;

async function scrapeCareerPage(src, timeoutMs) {
  const html = await fetchText(src.url, timeoutMs);
  const $ = cheerio.load(html);
  const seen = new Set();
  const out = [];
  $("a[href]").each((_, el) => {
    const title = $(el).text().replace(/\s+/g, " ").trim();
    if (title.length < 6 || title.length > 120 || NAV_WORDS.test(title)) return;
    if (!ROLE_WORDS.test(title) || !isTech(title)) return;
    let url;
    try {
      url = new URL($(el).attr("href"), src.url).toString();
    } catch {
      return;
    }
    const key = `${url}|${title}`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push(
      build({
        title,
        company: src.company,
        url,
        source: src.company,
        sourceUrl: src.url,
        scope: "bangladesh",
        location: src.location,
        tags: [],
        description: "",
      })
    );
  });
  return out;
}

export async function runScrape({ timeoutMs = 8000 } = {}) {
  const tasks = [
    ...FEEDS.map((s) => ({ id: s.id, name: s.name, run: () => scrapeFeed(s, timeoutMs) })),
    ...CAREER_PAGES.map((s) => ({ id: s.id, name: s.company, run: () => scrapeCareerPage(s, timeoutMs) })),
  ];
  const results = await Promise.allSettled(tasks.map((t) => t.run()));
  const jobs = [];
  const sources = results.map((r, i) => {
    const t = tasks[i];
    if (r.status === "fulfilled") {
      jobs.push(...r.value);
      return { id: t.id, name: t.name, ok: true, count: r.value.length };
    }
    return { id: t.id, name: t.name, ok: false, count: 0, error: String(r.reason?.message ?? r.reason) };
  });
  // de-duplicate by id
  const map = new Map();
  for (const j of jobs) if (!map.has(j.id)) map.set(j.id, j); // first source wins
  return { jobs: [...map.values()], sources };
}
