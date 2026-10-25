export const CATEGORY_LABELS = {
  software: "Software",
  web: "Web",
  mobile: "Mobile",
  "ai-ml": "AI / ML",
  data: "Data",
  security: "Cyber Security",
  "devops-cloud": "DevOps / Cloud",
  qa: "QA / Testing",
  "it-other": "Other IT",
};

export const LEVEL_LABELS = {
  intern: "Internship",
  entry: "Entry-level",
  mid: "Mid-level",
  senior: "Senior",
};

const DAY = 24 * 60 * 60 * 1000;

export function timeAgo(iso) {
  if (!iso) return "";
  const diff = Date.now() - Date.parse(iso);
  if (diff < 60 * 60 * 1000) return "just now";
  if (diff < DAY) return `${Math.floor(diff / (60 * 60 * 1000))}h ago`;
  const d = Math.floor(diff / DAY);
  return d === 1 ? "yesterday" : `${d}d ago`;
}

export function daysLeft(iso) {
  if (!iso) return null;
  return Math.ceil((Date.parse(iso) - Date.now()) / DAY);
}

export function isNew(job) {
  return job.firstSeen && Date.now() - Date.parse(job.firstSeen) < 36 * 60 * 60 * 1000;
}

export function sortKey(job) {
  return Date.parse(job.postedAt ?? job.firstSeen ?? 0) || 0;
}

export function loadSaved() {
  try {
    return JSON.parse(localStorage.getItem("jobradar.saved") || "[]");
  } catch {
    return [];
  }
}

export function persistSaved(list) {
  try {
    localStorage.setItem("jobradar.saved", JSON.stringify(list));
  } catch {
    /* storage may be blocked; the app still works */
  }
}

// Step-by-step apply guide, generated from the job's own details.
export function buildApplySteps(job) {
  const steps = [];
  steps.push({
    title: "Open the original posting",
    text: `Click "Apply on ${job.source}" and read the full description on the employer's page. JobRadar only shows a summary.`,
  });

  if (job.scope === "remote") {
    const hint =
      job.bdEligible === "yes"
        ? "The location says it is open worldwide or to Asia, which is a good sign for Bangladesh."
        : job.bdEligible === "no"
        ? `The location says "${job.location}". It may exclude Bangladesh, so check before spending time.`
        : "The location isn't clear. Look for words like 'worldwide', 'anywhere' or 'timezone' on the posting.";
    steps.push({ title: "Check you are eligible from Bangladesh", text: `${hint} Also check the required time zone overlap and how payment is made (bank transfer, Wise, Payoneer).` });
  } else {
    steps.push({ title: "Check the basics", text: "Note the required experience, degree and the last date to apply. Many Bangladeshi companies list these at the bottom of the page." });
  }

  const skills = job.tags?.length ? job.tags.slice(0, 5).join(", ") : "the skills listed in the description";
  steps.push({
    title: "Tailor your CV (one page)",
    text: `Mirror the posting's keywords where they are true for you: ${skills}. Put 2–3 relevant projects (with GitHub links) above everything else.`,
  });

  if (job.level === "intern" || job.level === "entry") {
    steps.push({ title: "For early-career roles", text: "Add your final-year project, internships, competitive programming or open-source work. Keep your GitHub README files clean." });
  }

  steps.push({
    title: "Write a short cover note",
    text: "3–4 sentences: why this company, one project that matches the role, and your availability. Don't paste a generic letter.",
  });
  steps.push({
    title: "Apply only through the employer's own page or email",
    text: "A real employer never asks you to pay money, buy equipment, or move to Telegram/WhatsApp for an 'interview'. If it does, close the page.",
  });
  steps.push({
    title: "Track it",
    text: 'Press ☆ Save on JobRadar so it stays in your "Saved" tab, and note the date you applied. Follow up politely after 7–10 days.',
  });
  return steps;
}

export const BD_LINKS = [
  { name: "Bdjobs: IT & Telecommunication", url: "https://jobs.bdjobs.com/", note: "Bangladesh's biggest job portal. Open it and use the IT/Telecom category." },
  { name: "LinkedIn Jobs: Bangladesh", url: "https://www.linkedin.com/jobs/search/?location=Bangladesh&keywords=software", note: "Search 'software', 'data', 'cyber' with location Bangladesh." },
  { name: "Skill.jobs", url: "https://skill.jobs/", note: "Another popular local portal. Good for entry-level and internships." },
  { name: "Chakri.com", url: "https://www.chakri.com/", note: "Local portal with IT listings." },
];

export const GENERAL_TIPS = [
  { bn: "প্রতিদিন সকালে একবার JobRadar দেখো, নতুন জব ‘New’ ব্যাজ নিয়ে আসে।", en: "Check JobRadar once each morning. New jobs get a 'New' badge." },
  { bn: "একই CV সব জায়গায় পাঠিও না, জবের কীওয়ার্ড অনুযায়ী মিলিয়ে নাও।", en: "Don't send one CV everywhere. Match it to each job's keywords." },
  { bn: "GitHub প্রোফাইল আর LinkedIn আপডেট রাখো। রিক্রুটাররা এগুলো দেখে।", en: "Keep GitHub and LinkedIn updated. Recruiters look at them." },
  { bn: "চাকরির জন্য টাকা চাইলে সেটা স্ক্যাম। অ্যাপ্লাই করো না।", en: "If anyone asks for money for a job, it's a scam. Don't apply." },
];
