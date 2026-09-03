/**
 * Calendar Hub pipeline -> Google Tasks sync
 */

const PIPELINE_ISSUE_NUMBER = 85;

function githubRequest(path) {
  const endpoint = `https://api.github.com/repos/${GITHUB_ORGANIZATION}/${GITHUB_REPOSITORY}${path}`;
  const response = UrlFetchApp.fetch(endpoint, {
    method: 'get',
    headers: {
      Authorization: 'Bearer ' + GITHUB_TOKEN,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    },
    muteHttpExceptions: true
  });

  const status = response.getResponseCode();
  if (status < 200 || status >= 300) {
    throw new Error(`GitHub API ${status}: ${response.getContentText()}`);
  }

  return JSON.parse(response.getContentText());
}

function fetchGitHubIssue(issueNumber) {
  const issue = githubRequest(`/issues/${issueNumber}`);
  return {
    number: issue.number,
    title: issue.title,
    html_url: issue.html_url,
    updated_at: issue.updated_at,
    state: issue.state
  };
}

function extractPipelineIssueNumbers(body) {
  const heading = '## 현재 작업순서';
  const start = body.indexOf(heading);
  if (start === -1) {
    throw new Error(`Pipeline issue #${PIPELINE_ISSUE_NUMBER} is missing '${heading}'.`);
  }

  const sectionStart = start + heading.length;
  const rest = body.slice(sectionStart);
  const nextHeading = rest.search(/\n##\s+/);
  const section = nextHeading === -1 ? rest : rest.slice(0, nextHeading);

  const issueNumbers = [];
  const seen = {};
  const regex = /^\s*(?:[-*]\s*)?#(\d+)\b/gm;
  let match;

  while ((match = regex.exec(section)) !== null) {
    const issueNumber = Number(match[1]);
    if (!seen[issueNumber]) {
      seen[issueNumber] = true;
      issueNumbers.push(issueNumber);
    }
  }

  if (issueNumbers.length === 0) {
    throw new Error(`No issue numbers found in pipeline issue #${PIPELINE_ISSUE_NUMBER}.`);
  }

  return issueNumbers;
}

function fetchPipelineIssues() {
  Logger.log(`Fetching Calendar Hub pipeline from issue #${PIPELINE_ISSUE_NUMBER}`);
  const pipelineIssue = githubRequest(`/issues/${PIPELINE_ISSUE_NUMBER}`);
  const issueNumbers = extractPipelineIssueNumbers(pipelineIssue.body || '');
  return issueNumbers.map(fetchGitHubIssue);
}
