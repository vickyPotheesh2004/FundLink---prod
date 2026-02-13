export default async function runReadinessScore(req, res) {
  res.json({
    readinessScore: 44,
    breakdown: {
      technical: 50,
      problemSolution: 60,
      market: 40,
      financial: 30,
      execution: 40
    },
    strengths: [
      "Clear problem definition in the SME financing space",
      "Functional frontend prototype demonstrates intent"
    ],
    gaps: [
      "Backend architecture not yet implemented",
      "Limited quantitative market validation",
      "Financial plan lacks detailed cost breakdown"
    ],
    nextActions: [
      "Design backend architecture and data model",
      "Conduct structured interviews with target SMEs",
      "Prepare a detailed use-of-funds plan"
    ],
    demo: true
  });
}
