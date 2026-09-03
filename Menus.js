/**
 * Spreadsheet menu.
 */

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  var mainMenu = ui.createMenu('📋 Calendar Hub Tasks');
  var setupMenu = ui.createMenu('Setup');

  if (isSetupEmpty()) {
    setupMenu.addItem('Create setup', 'setup');
  } else {
    if (getGithubKey() == null) setupMenu.addItem('Add Github key', 'updateGithubKey');
    else setupMenu.addItem('Change Github key', 'updateGithubKey');

    if (getGithubOrganization() == null) setupMenu.addItem('Add Github repository organization', 'updateGithubOrganization');
    else setupMenu.addItem('Change Github repository organization', 'updateGithubOrganization');

    if (getGithubRepository() == null) setupMenu.addItem('Add Github repository', 'updateGithubRepository');
    else setupMenu.addItem('Change Github repository', 'updateGithubRepository');

    if (getTaskListId() == null) setupMenu.addItem('Add task list', 'updateTaskList');
    else setupMenu.addItem('Change task list', 'updateTaskList');
  }

  mainMenu
    .addSubMenu(setupMenu)
    .addSeparator()
    .addItem('🔄 Sync pipeline now', 'generateTasksController')
    .addSeparator()
    .addSubMenu(ui.createMenu('🗓 Schedule sync')
      .addItem('Every hour', 'scheduleEveryHour')
      .addItem('Every 4 hours', 'scheduleEveryFourHours')
      .addItem('Once a day', 'scheduleOnceADay')
      .addSeparator()
      .addItem('Remove all schedulers', 'removeAllSchedulers')
    )
    .addSeparator()
    .addItem('View fork on Github ↗', 'openUrl')
    .addToUi();
}

function onEdit(e) {
  onOpen();
}

function setup() {
  var properties = PropertiesService.getScriptProperties();
  var ui = SpreadsheetApp.getUi();

  var githubKey = ui.prompt('1/4: Input your Github key', ui.ButtonSet.OK_CANCEL);
  if (githubKey.getSelectedButton() == ui.Button.CANCEL) return;
  properties.setProperties({ githubKey: githubKey.getResponseText() });

  var githubOrganization = ui.prompt('2/4: Input the owner name for your Github repository', ui.ButtonSet.OK_CANCEL);
  if (githubOrganization.getSelectedButton() == ui.Button.CANCEL) return;
  properties.setProperties({ githubOrganization: githubOrganization.getResponseText() });

  var githubRepository = ui.prompt('3/4: Input your Github repository', ui.ButtonSet.OK_CANCEL);
  if (githubRepository.getSelectedButton() == ui.Button.CANCEL) return;
  properties.setProperties({ githubRepository: githubRepository.getResponseText() });

  var taskListName = ui.prompt('4/4: Input the name of your Google Tasks list', ui.ButtonSet.OK_CANCEL);
  if (taskListName.getSelectedButton() == ui.Button.CANCEL) return;
  var taskListId = findTaskListId(taskListName.getResponseText());
  if (taskListId == null) {
    ui.alert("List '" + taskListName.getResponseText() + "' not found");
    return;
  }
  properties.setProperties({ taskListId: taskListId });

  ui.alert('Setup completed successfully');
  onOpen();
}
