import type { PartialTranslation } from "../../message";
import type { messages as source } from "../en/menu";

export const messages = {
  "menu.stopAllAgents": "Zatrzymaj wszystkich agentów",
  "menu.checkForUpdates": "Sprawdź aktualizacje…",
  "menu.preferences": "Ustawienia…",
  "menu.actualSize": "Rzeczywisty rozmiar",
  "menu.zoomIn": "Powiększ",
  "menu.zoomOut": "Pomniejsz",
  "menu.copyLink": "Kopiuj link",
  "menu.quit": "Zamknij Element",
  "menu.quitConfirmTitle": "Zamknąć Element?",
  "menu.quitConfirmBody": "Agenci i rutyny zatrzymają się, dopóki nie otworzysz Element ponownie.",
  "menu.quitConfirm": "Zamknij",
  "menu.quitHint": "Przytrzymaj ⌘Q lub naciśnij dwa razy, aby zamknąć",
  "menu.trayOpen": "Otwórz Element",
  "menu.trayQuit": "Zamknij Element",
  "menu.trayTooltip": "Element",
  "menu.undo": "Cofnij",
  "menu.redo": "Przywróć",
  "menu.cut": "Wytnij",
  "menu.copy": "Kopiuj",
  "menu.paste": "Wklej",
  "menu.pasteAndMatchStyle": "Wklej i dopasuj styl",
  "menu.delete": "Usuń",
  "menu.selectAll": "Zaznacz wszystko",
} as const satisfies PartialTranslation<typeof source>;
