export function buildWeeklyReport(activity, config = {}) {
  const labels = normalizeLabelConfig(config.labels);
  const issues = activity.issues ?? [];
  const pulls = activity.pulls ?? [];
  const sinceDate = formatDate(activity.since);
  const generatedDate = formatDate(activity.generatedAt ?? new Date().toISOString());

  const done = issues.filter((issue) => isDone(issue, labels.done));
  const doing = issues.filter((issue) => hasAnyLabel(issue, labels.doing) && issue.state !== "closed");
  const blocked = issues.filter((issue) => hasAnyLabel(issue, labels.blocked) && issue.state !== "closed");
  const newIssues = issues.filter((issue) => isCreatedSince(issue, activity.since));
  const mergedPulls = pulls.filter((pull) => pull.mergedAt);

  return [
    `# Weekly Report: ${activity.owner}/${activity.repo}`,
    "",
    `Period: ${sinceDate} - ${generatedDate}`,
    "",
    section("Done", done.map(formatIssue)),
    section("In Progress", doing.map(formatIssue)),
    section("Blocked", blocked.map(formatIssue)),
    section("New Issues", newIssues.map(formatIssue)),
    section("Merged Pull Requests", mergedPulls.map(formatPullRequest)),
    "## Summary",
    "",
    `- Done issues: ${done.length}`,
    `- In-progress issues: ${doing.length}`,
    `- Blocked issues: ${blocked.length}`,
    `- New issues: ${newIssues.length}`,
    `- Merged pull requests: ${mergedPulls.length}`,
    ""
  ].join("\n");
}

function section(title, items) {
  return [`## ${title}`, "", ...(items.length ? items : ["- None"]), ""].join("\n");
}

function formatIssue(issue) {
  const assignees = issue.assignees?.length ? ` (${issue.assignees.join(", ")})` : "";
  return `- [#${issue.number} ${issue.title}](${issue.url})${assignees}`;
}

function formatPullRequest(pull) {
  const author = pull.user ? ` (${pull.user})` : "";
  return `- [#${pull.number} ${pull.title}](${pull.url})${author}`;
}

function isDone(issue, doneLabels) {
  return issue.state === "closed" || hasAnyLabel(issue, doneLabels);
}

function hasAnyLabel(issue, expectedLabels) {
  const actualLabels = new Set((issue.labels ?? []).map((label) => label.toLowerCase()));
  return expectedLabels.some((label) => actualLabels.has(label));
}

function isCreatedSince(item, since) {
  return new Date(item.createdAt) >= new Date(since);
}

function normalizeLabelConfig(labels = {}) {
  return {
    done: normalizeLabels(labels.done ?? ["done", "completed"]),
    doing: normalizeLabels(labels.doing ?? ["in-progress", "doing"]),
    blocked: normalizeLabels(labels.blocked ?? ["blocked"])
  };
}

function normalizeLabels(labels) {
  return labels.map((label) => label.toLowerCase());
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "2-digit"
  }).format(new Date(value));
}
