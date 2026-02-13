export default async function runMatchScore(req, res) {
  const { startup = {}, investor = {} } = req.body || {};

  const domainMatch = investor.focusDomains?.includes(startup.domain)
    ? "strong"
    : "medium";

  const stageMatch = investor.preferredStages?.includes(startup.stage)
    ? "exact"
    : "partial";

  const matchScore =
    domainMatch === "strong" && stageMatch === "exact" ? 72 : 55;

  res.json({
    matchScore,
    alignment: {
      domain: domainMatch,
      stage: stageMatch,
      ticketSize: "within range"
    },
    keyReasons: [
      "Startup domain aligns with investor focus",
      "Stage matches investor entry preference"
    ],
    riskFlags: [
      "Funding ask close to investor comfort range",
      "Market validation still early"
    ],
    demo: true
  });
}
