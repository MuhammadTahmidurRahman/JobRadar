# JobRadar

IT / CS jobs for **Bangladesh + global remote**, updated automatically every day, hosted free on **Netlify**.
No paid API and no API keys: it reads public RSS feeds and public company career pages.

```
Browser (React)  →  /api/jobs  →  Netlify Function  →  Netlify Blobs (stored job list)
                                        ▲
Every day 8:00 AM Dhaka  →  scrape-daily function  →  RSS feeds + career pages
```

## ডিপ্লয় করার নিয়ম (Netlify) — সহজ পথ

Netlify-তে Functions ও Blobs ঠিকভাবে চালাতে প্রজেক্টটা **GitHub থেকে** ডিপ্লয় করাই সবচেয়ে ভালো।

1. GitHub-এ একটা নতুন repository বানাও (নাম: `jobradar`), তারপর এই ফোল্ডারের ফাইলগুলো push করো
   (`node_modules` আর `dist` যাবে না, `.gitignore` এ আছে)।
2. https://app.netlify.com → **Add new site → Import an existing project** → GitHub → `jobradar` সিলেক্ট করো।
3. Build settings নিজে থেকেই `netlify.toml` থেকে আসবে (`npm run build`, publish `dist`)। **Deploy** চাপো।
4. Site configuration → **Environment variables** → `REFRESH_TOKEN` নামে একটা গোপন পাসওয়ার্ড দাও (যেকোনো লম্বা লেখা)।
   তারপর Deploys → **Trigger deploy**।
5. সাইট খুললে প্রথম ভিজিটেই একবার স্ক্র্যাপ চলে। চাইলে হাতে আপডেট করতে:
   `https://YOUR-SITE.netlify.app/api/refresh?token=YOUR_TOKEN`
6. এরপর প্রতিদিন সকাল ৮টায় (ঢাকা) নিজে থেকেই আপডেট হবে। Netlify → **Functions → scrape-daily** এ লগ দেখা যাবে।

## Run on your Windows PC

```bash
npm install
npm run scrape:test      # prints what each source returns (nothing saved)
npm install -g netlify-cli
netlify dev              # full site + functions at http://localhost:8888
```

`npm run dev` alone shows only the UI with sample data (no backend).

## Where jobs come from

| Source | Type | Notes |
|---|---|---|
| We Work Remotely | public RSS | programming + devops categories. Credit and link back are shown in the footer and on each job |
| Remote OK | public RSS (`?tag=dev`) | credit + link back required; its feed can contain non-remote jobs, so the app filters by IT keywords |
| Brain Station 23, Cefalo, BJIT, SELISE | company career pages (HTML) | **best-effort URLs, not tested against the live pages.** Check the status line in the footer after the first run; fix or remove any that fail |

Edit `netlify/shared/sources.mjs` to add or remove sources.

**Bdjobs is not scraped.** Its listings are rendered by JavaScript and it has no public feed, so it needs a headless browser and its terms are stricter. The "Apply guide" tab links to Bdjobs and other local portals instead.

## What is a guess

- "Open to BD ✓ / May exclude BD" is a keyword guess from the job's region text. Always read the posting.
- Categories and levels (intern, entry, senior) are keyword rules in `netlify/shared/classify.mjs`. Edit the regex lists to tune them.
- Career-page scraping looks for links whose text looks like an IT job title. Sites that load jobs with JavaScript will return 0 jobs.

## Project layout

```
netlify/functions/   jobs.mjs (API) · scrape-daily.mjs (schedule) · refresh.mjs (manual update)
netlify/shared/      sources.mjs · scrape.mjs · classify.mjs · store.mjs
src/                 React app (filters, saved jobs, apply guide)
```

Saved jobs are stored in your own browser (localStorage). Nothing about you is sent to a server.
