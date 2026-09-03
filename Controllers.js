/**
 * Spreadsheet UI controllers.
 */

async function generateTasksController() {
  var ui = SpreadsheetApp.getUi();

  if (!isSetupCompleted()) {
    var response = ui.alert('You need to complete setup before syncing.\nDo you want to setup now?', ui.ButtonSet.YES_NO);
    if (response == ui.Button.YES) setup();
    return;
  }

  var response = ui.alert('Sync Calendar Hub issue #85 to Google Tasks now?', ui.ButtonSet.OK_CANCEL);
  if (response != ui.Button.OK) return;

  var numberOfChanges = await generateTasks();
  if (numberOfChanges > 0) {
    ui.alert('Sync completed.\n' + numberOfChanges + ' task(s) were created or updated.');
  } else {
    ui.alert('Sync completed.\nNo task content changes were needed.');
  }
}
