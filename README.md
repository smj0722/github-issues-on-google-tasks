# Calendar Hub Pipeline → Google Tasks

Forked from `thiagobarbosa/github-issues-on-google-tasks` and customized for Calendar Hub.

## Purpose

This Apps Script reads **issue #85** from `smj0722/Calendar-Hub`, extracts only the `## 현재 작업순서` section, fetches each referenced GitHub issue, and mirrors the list to a dedicated Google Tasks list.

GitHub issue **#85 is the Source of Truth**. Google Tasks is a read-friendly working view.

## Sync behavior

- Reads issue numbers from `#85 > ## 현재 작업순서` in top-to-bottom order.
- Creates Google Tasks as `#issue-number issue-title`.
- Stores the GitHub issue URL in the task notes.
- Updates an existing task when the GitHub issue title/state changes.
- Reorders active Google Tasks to match the order in #85 on every sync.
- If an issue that is still listed in #85 is closed, its Google Task is marked completed.
- The sync is intentionally one-way: changing Google Tasks does not edit GitHub.
- No bulk "Delete all tasks" menu is provided.

> Important: remove completed issues from #85 only after a sync has had a chance to observe the closed state if you want the corresponding Google Task to be marked completed first.

## Requirements

- Google account
- Google Tasks advanced service enabled in Apps Script
- GitHub token that can read `smj0722/Calendar-Hub`
- A dedicated Google Tasks list, recommended name: `Calendar Hub`

## Setup

The original project uses a Google Sheet as a lightweight mapping database between GitHub issue numbers and Google Task IDs.

1. Make a copy of the original project's spreadsheet, or use an equivalent spreadsheet bound to this Apps Script.
2. Open **Extensions → Apps Script**.
3. Replace the script files with the files from this fork/branch.
4. Enable the **Google Tasks API advanced service** for the Apps Script project.
5. Reload the spreadsheet and open the `📋 Calendar Hub Tasks` menu.
6. Choose `Setup → Create setup` and enter:
   - GitHub key
   - GitHub owner: `smj0722`
   - GitHub repository: `Calendar-Hub`
   - Google Tasks list name, e.g. `Calendar Hub`
7. Run `🔄 Sync pipeline now` once and verify the result in Google Tasks.
8. If the result is correct, choose `🗓 Schedule sync → Every hour`.

## Pipeline format

Issue #85 must keep this heading:

```text
## 현재 작업순서
```

Each active item should start with an issue number, for example:

```text
#65 이전 접수 상세 UI 개선
#82 상단 앱 버전 표시
#75 일반 일정 생성·편집 UI 및 KICQ 화면 분리
```

The script reads only that section, so development history in #16 does not affect synchronization.

## Safety

- GitHub is never modified by this script.
- Google Tasks synchronization is limited to tasks tracked in the spreadsheet mapping.
- Bulk deletion of an entire Google Tasks list has been removed from the menu.
- Use a dedicated Google Tasks list for Calendar Hub.

## License

MIT. Original project by Thiago Barbosa.
