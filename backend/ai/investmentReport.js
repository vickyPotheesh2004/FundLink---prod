export default async function runInvestmentReport(req, res) {
  res.json({
    report: `
INVESTMENT ANALYSIS REPORT (DEMO)

PAST:
The SME credit market in India has historically suffered from slow underwriting
cycles, fragmented lender discovery, and poor founder readiness.
Most solutions have focused on banks rather than workflow efficiency.

PRESENT:
The startup presents a clear problem statement and a usable frontend prototype.
Market understanding is directional but lacks strong quantitative validation.
Execution is founder-led, with technical depth still developing.

FUTURE:
With successful backend implementation and lender integrations,
the platform could act as a discovery and qualification layer for SME financing.
Primary risks include regulatory complexity, CAC management, and execution speed.

INVESTOR FIT:
Best suited for early-stage FinTech investors comfortable with iterative
go-to-market strategies and long-term infrastructure plays.
`,
    demo: true
  });
}
