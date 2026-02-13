const API_BASE_URL = "http://localhost:5000";

/**
 * AI-1: Investor ↔ Startup match score
 * Used ONLY in Investor Dashboard
 */
export async function getMatchScore(payload) {
  const response = await fetch(`${API_BASE_URL}/ai/match-score`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error("Failed to fetch match score");
  }

  return response.json();
}

/**
 * AI-2: Startup readiness score
 * Used ONLY in Founder Dashboard
 */
export async function getReadinessScore(payload) {
  const response = await fetch(`${API_BASE_URL}/ai/readiness-score`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error("Failed to fetch readiness score");
  }

  return response.json();
}

/**
 * AI-3: Full investment analysis report
 * Used ONLY in Investor Dashboard
 */
export async function getInvestmentReport(payload) {
  const response = await fetch(`${API_BASE_URL}/ai/investment-report`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error("Failed to fetch investment report");
  }

  return response.json();
}
