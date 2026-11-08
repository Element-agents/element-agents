import { defineMessages } from "../../message";

export const messages = defineMessages("startup", {
  // The one native error box: the app could not start, so no renderer exists to show it.
  "startup.failedTitle": "Element Agents couldn’t start",
  "startup.failedBody":
    "{message}\n\nYour local data was not reset or overwritten. See the troubleshooting guide for recovery steps.",
  // Shown while Element Agents runs, when another program changed `app.asar`: the next start would fail with no message.
  "startup.archiveChangedTitle": "Element Agents files were changed",
  "startup.archiveChangedBody":
    "Another program changed the Element Agents file app.asar. Element Agents runs now, but it will not open after you quit it.\n\nTo repair Element Agents, install it again. Your local data stays.",
  "startup.archiveChangedDownload": "Download Element Agents",
  // An older Element Agents started over data that a newer one migrated: it installs the latest release.
  "startup.newerDataUpdatingTitle": "Updating Element Agents",
  "startup.newerDataUpdatingBody":
    "A newer version of Element Agents saved your data. Element Agents installs the latest version and then opens again.\n\nYour local data was not reset or overwritten.",
  "startup.newerDataTitle": "Install the latest Element Agents",
  "startup.newerDataBody":
    "A newer version of Element Agents saved your data, and this version ({version}) cannot open it. Install the latest version to open your data.\n\nYour local data was not reset or overwritten.",
  "startup.newerDataDownload": "Download Element Agents",
  "startup.newerDataGuide": "Open guide",
  "startup.newerDataQuit": "Quit",
});
