/**
 * Project: github-issues-on-google-tasks
 * File: Utils.js
 */

const GITHUB_TOKEN = getGithubKey();
const GITHUB_ORGANIZATION = getGithubOrganization();
const GITHUB_REPOSITORY = getGithubRepository();
const TASK_LIST_ID = getTaskListId();

function isSetupEmpty() {
  return getGithubKey() == null
    && getGithubOrganization() == null
    && getGithubRepository() == null
    && getTaskListId() == null;
}

function isSetupCompleted() {
  return getGithubKey() != null
    && getGithubOrganization() != null
    && getGithubRepository() != null
    && getTaskListId() != null;
}

function getAllTaskLists() {
  try {
    const taskLists = Tasks.Tasklists.list();
    if (!taskLists.items) {
      console.log('No task lists found.');
      return [];
    }

    for (let i = 0; i < taskLists.items.length; i++) {
      const taskList = taskLists.items[i];
      console.log('Task list with title "%s" and ID "%s" was found.', taskList.title, taskList.id);
    }

    return taskLists.items;
  } catch (err) {
    console.log('Failed with an error %s ', err.message);
    throw err;
  }
}

function findTaskListId(taskListName) {
  var taskLists = Tasks.Tasklists.list().getItems();
  for (var i = 0; i < taskLists.length; i++) {
    if (taskLists[i].getTitle() == taskListName) return taskLists[i].getId();
  }
  return null;
}

function openUrl() {
  SpreadsheetApp.getUi().alert('https://github.com/smj0722/github-issues-on-google-tasks');
}
