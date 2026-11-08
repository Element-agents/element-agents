import type { PartialTranslation } from "../../message";
import type { messages as source } from "../en/startup";

export const messages = {
  "startup.failedTitle": "Nie udało się uruchomić Element",
  "startup.failedBody":
    "{message}\n\nTwoje lokalne dane nie zostały zresetowane ani nadpisane. Kroki przywracania znajdziesz w przewodniku rozwiązywania problemów.",
  "startup.archiveChangedTitle": "Pliki Element zostały zmienione",
  "startup.archiveChangedBody":
    "Inny program zmienił plik app.asar Element. Element działa teraz, ale nie uruchomi się po zamknięciu.\n\nAby naprawić Element, zainstaluj go ponownie. Twoje lokalne dane zostaną zachowane.",
  "startup.archiveChangedDownload": "Pobierz Element",
  "startup.newerDataUpdatingTitle": "Aktualizowanie Element",
  "startup.newerDataUpdatingBody":
    "Nowsza wersja Element zapisała Twoje dane. Element instaluje najnowszą wersję, a potem uruchomi się ponownie.\n\nTwoje lokalne dane nie zostały zresetowane ani nadpisane.",
  "startup.newerDataTitle": "Zainstaluj najnowszy Element",
  "startup.newerDataBody":
    "Nowsza wersja Element zapisała Twoje dane, a ta wersja ({version}) nie może ich otworzyć. Zainstaluj najnowszą wersję, aby otworzyć swoje dane.\n\nTwoje lokalne dane nie zostały zresetowane ani nadpisane.",
  "startup.newerDataDownload": "Pobierz Element",
  "startup.newerDataGuide": "Otwórz przewodnik",
  "startup.newerDataQuit": "Zakończ",
} as const satisfies PartialTranslation<typeof source>;
