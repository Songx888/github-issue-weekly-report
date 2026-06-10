# GitHub Issue Weekly Report

Generate a Markdown weekly report from GitHub Issues and Pull Requests.

This project is built for small teams, open-source maintainers, contractors, and remote teams that use GitHub as their task tracker but still need a clean weekly status report.

## What It Does

- Reads Issues and Pull Requests from one GitHub repository
- Groups work into done, in progress, blocked, new, and merged sections
- Generates a Markdown report
- Runs locally or on a scheduled GitHub Actions workflow
- Works without third-party dependencies

## Quick Start

Create a config file:

```json
{
  "owner": "your-org",
  "repo": "your-repo",
  "sinceDays": 7,
  "output": "weekly-report.md",
  "labels": {
    "done": ["done", "completed"],
    "doing": ["in-progress", "doing"],
    "blocked": ["blocked"]
  }
}
```

Run:

```bash
GITHUB_TOKEN=ghp_xxx node ./src/index.js --config config.json
```

Run the demo:

```bash
node ./src/index.js --config examples/demo.config.json --mock examples/demo-data.json
```

## GitHub Actions

Copy `.github/workflows/weekly-report.yml` into your repository. The workflow runs every Monday and writes `weekly-report.md`.

You need a token with read access to Issues and Pull Requests. For private repositories, create a repository secret named `REPORT_GITHUB_TOKEN`.

## Configuration

| Field | Required | Description |
| --- | --- | --- |
| `owner` | yes | GitHub organization or username |
| `repo` | yes | Repository name |
| `sinceDays` | no | Number of days to include. Default: `7` |
| `output` | no | Report file path. Default: `weekly-report.md` |
| `labels.done` | no | Labels treated as completed work |
| `labels.doing` | no | Labels treated as in-progress work |
| `labels.blocked` | no | Labels treated as blocked work |

## Paid Service Ideas

This repository is intentionally simple so it can be used as an open-source lead magnet.

- Setup service: install and configure it for a team
- Integration service: send reports to Feishu, WeCom, Slack, email, or Notion
- Custom templates: make reports match the team's client-facing format
- Maintenance package: monitor failed workflows and adjust labels/report rules

See `docs/business-plan.zh-CN.md` for a practical monetization plan.

## License

MIT
