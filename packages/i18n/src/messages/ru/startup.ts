import type { PartialTranslation } from "../../message";
import type { messages as source } from "../en/startup";

export const messages = {
  "startup.failedTitle": "Element не удалось запустить",
  "startup.failedBody":
    "{message}\n\nЛокальные данные не сброшены и не перезаписаны. Шаги восстановления — в руководстве по устранению неполадок.",
  "startup.archiveChangedTitle": "Файлы Element изменены",
  "startup.archiveChangedBody":
    "Другая программа изменила файл Element app.asar. Сейчас Element работает, но после выхода он больше не запустится.\n\nЧтобы исправить это, установите Element заново. Ваши локальные данные сохранятся.",
  "startup.archiveChangedDownload": "Скачать Element",
  "startup.newerDataUpdatingTitle": "Обновление Element",
  "startup.newerDataUpdatingBody":
    "Более новая версия Element сохранила ваши данные. Element устанавливает последнюю версию и затем откроется снова.\n\nВаши локальные данные не были сброшены или перезаписаны.",
  "startup.newerDataTitle": "Установите последнюю версию Element",
  "startup.newerDataBody":
    "Более новая версия Element сохранила ваши данные, и эта версия ({version}) не может их открыть. Установите последнюю версию, чтобы открыть данные.\n\nВаши локальные данные не были сброшены или перезаписаны.",
  "startup.newerDataDownload": "Скачать Element",
  "startup.newerDataGuide": "Открыть руководство",
  "startup.newerDataQuit": "Выйти",
} as const satisfies PartialTranslation<typeof source>;
