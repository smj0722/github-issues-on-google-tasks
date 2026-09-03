/**
 * Spreadsheet-backed mapping between GitHub issues and Google Tasks.
 */

function getSheet() {
  return SpreadsheetApp.getActiveSheet();
}

function writeIssueOnSpreadsheet(issue, taskId) {
  const sheet = getSheet();
  const row = sheet.getLastRow() + 1;
  sheet.getRange(row, 1, 1, 6).setValues([[
    issue.title,
    issue.number,
    issue.html_url,
    issue.updated_at,
    issue.state,
    taskId
  ]]);
}

function updateIssueOnSpreadsheet(issue) {
  const issueRow = getIssueRowOnSpreadsheet(issue.number);
  if (issueRow == null) return null;

  const sheet = getSheet();
  const taskId = sheet.getRange(issueRow, 6).getValue();
  sheet.getRange(issueRow, 1, 1, 5).setValues([[
    issue.title,
    issue.number,
    issue.html_url,
    issue.updated_at,
    issue.state
  ]]);
  return taskId;
}

function getIssueRowOnSpreadsheet(issueNumber) {
  const data = getSheet().getDataRange().getValues();
  for (let i = 0; i < data.length; i++) {
    if (Number(data[i][1]) === Number(issueNumber)) return i + 1;
  }
  return null;
}

function getTrackedIssue(issueNumber) {
  const data = getSheet().getDataRange().getValues();
  for (let i = 0; i < data.length; i++) {
    if (Number(data[i][1]) === Number(issueNumber) && data[i][5]) {
      return {
        title: data[i][0],
        number: Number(data[i][1]),
        updatedAt: data[i][3],
        state: data[i][4],
        taskId: data[i][5]
      };
    }
  }
  return null;
}
