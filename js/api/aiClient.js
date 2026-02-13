const API_BASE = "http://localhost:5000";

async function post(endpoint, payload = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error("AI request failed");
  }

  return response.json();
}

export const AIClient = {
  matchScore(data) {
    return post("/ai/match-score", data);
  },

  readinessScore(data) {
    return post("/ai/readiness-score", data);
  },

  investmentReport(data) {
    return post("/ai/investment-report", data);
  }
};
