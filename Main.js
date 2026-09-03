/**
 * Calendar Hub pipeline -> Google Tasks sync
 */

async function generateTasks() {
  Logger.log('Starting Calendar Hub pipeline sync');

  const pipelineIssues = fetchPipelineIssues();
  const pipelineNumbers = pipelineIssues.map(issue => issue.number);
  let changed = 0;
  let previousTaskId = null;

  for (let i = 0; i < pipelineIssues.length; i++) {
    const issue = pipelineIssues[i];
    const task = buildTask(issue);
    const tracked = getTrackedIssue(issue.number);
    let taskId;

    if (tracked == null) {
      taskId = await addTask(task);
      if (!taskId) throw new Error(`Failed to create Google Task for issue #${issue.number}`);
      writeIssueOnSpreadsheet(issue, taskId);
      changed++;
    } else {
      taskId = tracked.taskId;
      if (tracked.updatedAt != issue.updated_at || tracked.state != issue.state || tracked.title != issue.title) {
        updateTask(task, taskId);
        updateIssueOnSpreadsheet(issue);
        changed++;
      }
    }

    moveTask(taskId, previousTaskId);
    previousTaskId = taskId;
  }

  changed += reconcileIssuesRemovedFromPipeline(pipelineNumbers);

  Logger.log('Finished Calendar Hub pipeline sync');
  return changed;
}

function buildTask(issue) {
  return {
    title: `#${issue.number} ${issue.title}`,
    notes: issue.html_url,
    status: issue.state == 'closed' ? 'completed' : 'needsAction'
  };
}

async function addTask(task) {
  try {
    const newTask = Tasks.Tasks.insert(task, TASK_LIST_ID);
    Logger.log('Task "%s": "%s" was created.', newTask.id, newTask.title);
    return newTask.id;
  } catch (err) {
    Logger.log('Failed to create task: %s', err.message);
    throw err;
  }
}

function updateTask(task, taskId) {
  const updatedTask = {
    id: taskId,
    title: task.title,
    notes: task.notes,
    status: task.status
  };

  Tasks.Tasks.update(updatedTask, TASK_LIST_ID, taskId);
  Logger.log('Task "%s": "%s" was updated.', taskId, task.title);
}

function moveTask(taskId, previousTaskId) {
  try {
    if (previousTaskId == null) {
      Tasks.Tasks.move(TASK_LIST_ID, taskId);
    } else {
      Tasks.Tasks.move(TASK_LIST_ID, taskId, { previous: previousTaskId });
    }
  } catch (err) {
    Logger.log('Failed to reorder task "%s": %s', taskId, err.message);
    throw err;
  }
}

function reconcileIssuesRemovedFromPipeline(pipelineNumbers) {
  const pipelineSet = {};
  pipelineNumbers.forEach(number => pipelineSet[number] = true);
  const trackedIssues = getAllTrackedIssues();
  let changed = 0;

  for (let i = 0; i < trackedIssues.length; i++) {
    const tracked = trackedIssues[i];
    if (pipelineSet[tracked.number]) continue;

    const issue = fetchGitHubIssue(tracked.number);

    if (issue.state == 'closed') {
      if (tracked.state != 'closed' || tracked.updatedAt != issue.updated_at || tracked.title != issue.title) {
        updateTask(buildTask(issue), tracked.taskId);
        updateIssueOnSpreadsheet(issue);
        changed++;
      }
      continue;
    }

    // An open issue removed from #85 is no longer part of the active work pipeline.
    // Remove only the Task created by this script; never touch the GitHub issue.
    Tasks.Tasks.remove(TASK_LIST_ID, tracked.taskId);
    deleteIssueFromSpreadsheet(tracked.number);
    Logger.log('Removed issue #%s from Google Tasks because it is no longer in pipeline #85.', tracked.number);
    changed++;
  }

  return changed;
}
