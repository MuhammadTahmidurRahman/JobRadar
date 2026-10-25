// Keyword-based classification. No AI/API needed, just regex rules you can edit.

const TECH =
  /(software|developer|devops|\bsre\b|site reliability|back[- ]?end|front[- ]?end|full[- ]?stack|web dev|mobile|android|\bios\b|flutter|python|java(script)?\b|typescript|react|node\.?js|golang|\bgo (developer|engineer)|rust|\bphp\b|laravel|django|flask|\.net|c#|c\+\+|data (scientist|engineer|analyst|analytics)|machine learning|\bml\b|\bai\b|\bllm\b|deep learning|nlp|cyber|security (engineer|analyst)|infosec|penetration|pentest|soc analyst|appsec|cloud|\baws\b|azure|kubernetes|sysadmin|system administrator|network (engineer|administrator)|\bqa\b|\bsdet\b|test automation|\bdba\b|database|it support|programmer|computer science|solutions? architect|technical support engineer|engineer(ing)? manager)/i;

const NON_TECH =
  /(sales|marketing|recruit|account executive|customer success|nurse|driver|store manager|accountant|copywriter|content writer|hr manager|legal|paralegal|mechanical|civil engineer|electrical engineer|chemical)/i;

export function isTech(title, extra = "") {
  return TECH.test(`${title} ${extra}`) && !NON_TECH.test(title);
}

const CATEGORY_RULES = [
  ["ai-ml", /\b(ai|ml|machine learning|deep learning|llm|nlp|computer vision|generative)\b/i],
  ["data", /(data (scientist|engineer|analyst|analytics)|analytics|business intelligence|\bbi\b|\betl\b|\bsql\b|\bdba\b|database)/i],
  ["security", /(cyber|security|infosec|penetration|pentest|soc analyst|appsec|devsecops|ethical hack)/i],
  ["devops-cloud", /(devops|\bsre\b|site reliability|cloud|kubernetes|\baws\b|azure|\bgcp\b|infrastructure|sysadmin|system administrator|network)/i],
  ["mobile", /(android|\bios\b|flutter|react native|mobile)/i],
  ["web", /(front[- ]?end|\bweb\b|react|vue|angular|next\.?js|full[- ]?stack|javascript|typescript|\bphp\b|laravel|wordpress)/i],
  ["qa", /(\bqa\b|quality assurance|\bsdet\b|test(er|ing)? automation|tester)/i],
  ["software", /(software|developer|engineer|programmer|back[- ]?end|java\b|python|golang|rust|\.net|c\+\+|c#)/i],
];

export function categorize(text) {
  const found = CATEGORY_RULES.filter(([, re]) => re.test(text)).map(([k]) => k);
  return found.length ? found : ["it-other"];
}

export function detectLevel(title) {
  if (/(intern(ship)?|trainee|apprentice)/i.test(title)) return "intern";
  if (/(junior|\bjr\.?\b|entry[- ]level|graduate|fresher|associate|new grad)/i.test(title)) return "entry";
  if (/(senior|\bsr\.?\b|\blead\b|principal|staff|head of|director|architect|manager)/i.test(title)) return "senior";
  return "mid";
}

// Can someone in Bangladesh apply? Only a hint based on the region text. "maybe" when unclear.
export function bdEligibility(regionText = "") {
  const r = regionText.toLowerCase();
  if (!r.trim()) return "maybe";
  if (/(anywhere|worldwide|global|bangladesh|asia|apac|south asia|international)/.test(r)) return "yes";
  if (
    /(usa|u\.s\.|united states|\bus\b|canada|\buk\b|united kingdom|europe|\beu\b|emea|australia|latin america|north america|germany|france|netherlands|ireland)/.test(
      r
    )
  )
    return "no";
  return "maybe";
}
