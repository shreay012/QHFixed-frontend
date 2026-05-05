// Maps a service object (or its category/name) to a local SVG icon under
// /public/images/resource-services. Falls back to developer.svg.
const BASE = "/images/resource-services";

const CATEGORY_ICON = {
  "AI Engineers": `${BASE}/ai.svg`,
  "Backend Developers": `${BASE}/backend-developer.svg`,
  "Frontend Development": `${BASE}/developer.svg`,
  "UI/UX Designer": `${BASE}/designer.svg`,
  "IT Support": `${BASE}/it-support.svg`,
  DevOps: `${BASE}/devops.svg`,
  "Content Writing": `${BASE}/content-writer.svg`,
  "Digital Marketing": `${BASE}/content-writer.svg`,
  "Quality Assurance": `${BASE}/quality.svg`,
  "Mobile App Development": `${BASE}/developer.svg`,
  "Third Party Integration": `${BASE}/developer.svg`,
  "Security Testing": `${BASE}/security.svg`,
  "Gen Ai Development": `${BASE}/ai.svg`,
  "API Development": `${BASE}/backend-developer.svg`,
  "React.js Development": `${BASE}/developer.svg`,
  "Website Design": `${BASE}/designer.svg`,
  "IT services": `${BASE}/it-support.svg`,
  "CI/CD Pipeline Management": `${BASE}/devops.svg`,
  "SEO Blog Writing": `${BASE}/content-writer.svg`,
};

const KEYWORD_ICON = [
  [/(ai|llm|ml |gen ai|nlp|chatbot|vector|rag|prompt|vision)/i, `${BASE}/ai.svg`],
  [/(security|vapt|penetration|sast|dast|iast|sca|rasp|cspm|mast|phishing|red team)/i, `${BASE}/security.svg`],
  [/(devops|docker|kubernetes|ci\/cd|infrastructure|monitoring|hosting|scaling)/i, `${BASE}/devops.svg`],
  [/(qa|test(ing)?|automation|regression|stress|load)/i, `${BASE}/quality.svg`],
  [/(design|ui|ux|wireframe|prototype|brand|graphic)/i, `${BASE}/designer.svg`],
  [/(content|copywriting|whitepaper|newsletter|ebook|blog|documentation|social copy|writer)/i, `${BASE}/content-writer.svg`],
  [/(it support|help desk|server admin|network|vpn|backup|disaster|migration)/i, `${BASE}/it-support.svg`],
  [/(backend|api|graphql|rest|microservice|database|server integration|serverless|cloud function|authentication)/i, `${BASE}/backend-developer.svg`],
  [/(frontend|react|next|vue|angular|wordpress|magento|spa|pwa|component library|accessibility)/i, `${BASE}/developer.svg`],
  [/(mobile|flutter|react native|swift|kotlin|ios|android|tablet|wearable|aso)/i, `${BASE}/developer.svg`],
  [/(payment|sso|map|sms|email|chat sdk|analytics|video|calendar|crm|invoice|shipping|marketplace|ticketing|integration)/i, `${BASE}/developer.svg`],
  [/(seo|smm|influencer|ppc|cro|orm|marketer|marketing)/i, `${BASE}/content-writer.svg`],
];

export function getServiceIcon(service) {
  if (!service) return `${BASE}/developer.svg`;
  // Match by name first (services collection uses name=category for our catalog).
  const name = String(service.name || service.title || "");
  if (name && CATEGORY_ICON[name]) return CATEGORY_ICON[name];
  const cat = service.category;
  if (cat && CATEGORY_ICON[cat]) return CATEGORY_ICON[cat];
  for (const [re, icon] of KEYWORD_ICON) {
    if (re.test(name)) return icon;
  }
  return `${BASE}/developer.svg`;
}
