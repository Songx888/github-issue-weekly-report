const GITHUB_API = "https://api.github.com";

export async function loadRepositoryActivity(config, token) {
  if (!token) {
    throw new Error("Missing GITHUB_TOKEN environment variable.");
  }

  assertConfig(config);

  const since = getSinceDate(config.sinceDays ?? 7);
  const headers = {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": "2022-11-28"
  };

  const [issues, pulls] = await Promise.all([
    fetchIssues(config, since, headers),
    fetchPullRequests(config, since, headers)
  ]);

  return {
    owner: config.owner,
    repo: config.repo,
    since,
    generatedAt: new Date().toISOString(),
    issues,
    pulls
  };
}

async function fetchIssues(config, since, headers) {
  const params = new URLSearchParams({
    state: "all",
    since,
    per_page: "100",
    sort: "updated",
    direction: "desc"
  });
  const url = `${GITHUB_API}/repos/${config.owner}/${config.repo}/issues?${params}`;
  const items = await fetchAllPages(url, headers);
  return items.filter((item) => !item.pull_request).map(normalizeIssue);
}

async function fetchPullRequests(config, since, headers) {
  const params = new URLSearchParams({
    state: "all",
    per_page: "100",
    sort: "updated",
    direction: "desc"
  });
  const url = `${GITHUB_API}/repos/${config.owner}/${config.repo}/pulls?${params}`;
  const items = await fetchAllPages(url, headers);

  return items
    .filter((item) => new Date(item.updated_at) >= new Date(since))
    .map(normalizePullRequest);
}

async function fetchAllPages(url, headers) {
  let nextUrl = url;
  const allItems = [];

  while (nextUrl) {
    const response = await fetch(nextUrl, { headers });
    if (!response.ok) {
      const body = await response.text();
      throw new Error(`GitHub API error ${response.status}: ${body}`);
    }

    allItems.push(...(await response.json()));
    nextUrl = parseNextLink(response.headers.get("link"));
  }

  return allItems;
}

function parseNextLink(linkHeader) {
  if (!linkHeader) {
    return null;
  }

  const links = linkHeader.split(",").map((part) => part.trim());
  const next = links.find((part) => part.endsWith('rel="next"'));
  if (!next) {
    return null;
  }

  const match = next.match(/<([^>]+)>/);
  return match ? match[1] : null;
}

function normalizeIssue(issue) {
  return {
    number: issue.number,
    title: issue.title,
    url: issue.html_url,
    state: issue.state,
    labels: issue.labels.map((label) => label.name),
    createdAt: issue.created_at,
    updatedAt: issue.updated_at,
    closedAt: issue.closed_at,
    assignees: issue.assignees.map((assignee) => assignee.login)
  };
}

function normalizePullRequest(pull) {
  return {
    number: pull.number,
    title: pull.title,
    url: pull.html_url,
    state: pull.state,
    mergedAt: pull.merged_at,
    createdAt: pull.created_at,
    updatedAt: pull.updated_at,
    user: pull.user?.login
  };
}

function getSinceDate(days) {
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - Number(days));
  return since.toISOString();
}

function assertConfig(config) {
  if (!config.owner || !config.repo) {
    throw new Error("Config must include owner and repo.");
  }
}
