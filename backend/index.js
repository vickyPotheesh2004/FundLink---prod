import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import runMatchScore from "./ai/matchScore.js";
import runReadinessScore from "./ai/readinessScore.js";
import runInvestmentReport from "./ai/investmentReport.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/", (req, res) => {
    res.send("FundLink Backend is Running");
});

app.post("/ai/match-score", runMatchScore);
app.post("/ai/readiness-score", runReadinessScore);
app.post("/ai/investment-report", runInvestmentReport);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`✅ FundLink backend running on port ${PORT}`);
});
