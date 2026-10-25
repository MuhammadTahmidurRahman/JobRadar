// ─────────────────────────────────────────────────────────────
// Where JobRadar looks for jobs. Edit this file to add/remove sources.
// No API keys: only public RSS feeds and public career pages.
// ─────────────────────────────────────────────────────────────

// Public RSS feeds published by the job boards themselves for reuse.
// Both ask you to credit them and link back to the original posting (the UI does this).
export const FEEDS = [
  {
    id: "wwr-fullstack",
    name: "We Work Remotely",
    siteUrl: "https://weworkremotely.com",
    url: "https://weworkremotely.com/categories/remote-full-stack-programming-jobs.rss",
    format: "wwr",
  },
  {
    id: "wwr-backend",
    name: "We Work Remotely",
    siteUrl: "https://weworkremotely.com",
    url: "https://weworkremotely.com/categories/remote-back-end-programming-jobs.rss",
    format: "wwr",
  },
  {
    id: "wwr-frontend",
    name: "We Work Remotely",
    siteUrl: "https://weworkremotely.com",
    url: "https://weworkremotely.com/categories/remote-front-end-programming-jobs.rss",
    format: "wwr",
  },
  {
    id: "wwr-devops",
    name: "We Work Remotely",
    siteUrl: "https://weworkremotely.com",
    url: "https://weworkremotely.com/categories/remote-devops-sysadmin-jobs.rss",
    format: "wwr",
  },
  {
    id: "wwr-programming",
    name: "We Work Remotely",
    siteUrl: "https://weworkremotely.com",
    url: "https://weworkremotely.com/categories/remote-programming-jobs.rss",
    format: "wwr",
  },
  {
    id: "remoteok-dev",
    name: "Remote OK",
    siteUrl: "https://remoteok.com",
    url: "https://remoteok.com/remote-jobs.rss?tag=dev",
    format: "generic",
  },
];

// Bangladeshi company career pages (public HTML). The scraper looks for links that
// look like IT job titles. These URLs are best-effort: if a company changes its
// site, that source will show an error in the status bar; just fix or remove it.
export const CAREER_PAGES = [
  { id: "brainstation23", company: "Brain Station 23", url: "https://brainstation-23.com/career/", location: "Dhaka, Bangladesh" },
  { id: "cefalo", company: "Cefalo Bangladesh", url: "https://www.cefalo.com/en/careers", location: "Dhaka, Bangladesh" },
  { id: "bjit", company: "BJIT Group", url: "https://bjitgroup.com/career", location: "Dhaka, Bangladesh" },
  { id: "selise", company: "SELISE", url: "https://selisegroup.com/careers/", location: "Dhaka, Bangladesh" },
];
