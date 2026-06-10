import test from "node:test";
import assert from "node:assert/strict";
import { buildWeeklyReport } from "../src/report.js";

test("builds a weekly report with grouped issues and pull requests", () => {
  const report = buildWeeklyReport(
    {
      owner: "acme",
      repo: "roadmap",
      since: "2026-06-03T00:00:00.000Z",
      generatedAt: "2026-06-10T00:00:00.000Z",
      issues: [
        {
          number: 1,
          title: "Ship onboarding",
          url: "https://github.com/acme/roadmap/issues/1",
          state: "closed",
          labels: ["done"],
          createdAt: "2026-06-01T00:00:00.000Z",
          assignees: ["mona"]
        },
        {
          number: 2,
          title: "Review billing copy",
          url: "https://github.com/acme/roadmap/issues/2",
          state: "open",
          labels: ["blocked"],
          createdAt: "2026-06-05T00:00:00.000Z",
          assignees: []
        }
      ],
      pulls: [
        {
          number: 3,
          title: "Add report exporter",
          url: "https://github.com/acme/roadmap/pull/3",
          mergedAt: "2026-06-07T00:00:00.000Z",
          user: "octo"
        }
      ]
    },
    {}
  );

  assert.match(report, /# Weekly Report: acme\/roadmap/);
  assert.match(report, /## Done\n\n- \[#1 Ship onboarding\]/);
  assert.match(report, /## Blocked\n\n- \[#2 Review billing copy\]/);
  assert.match(report, /## Merged Pull Requests\n\n- \[#3 Add report exporter\]/);
  assert.match(report, /- Done issues: 1/);
  assert.match(report, /- Blocked issues: 1/);
});
