import type { PartialTranslation } from "../../message";
import type { messages as source } from "../en/startup";

export const messages = {
  "startup.failedTitle": "Element başlatılamadı",
  "startup.failedBody":
    "{message}\n\nYerel verileriniz sıfırlanmadı veya üzerine yazılmadı. Kurtarma adımları için sorun giderme kılavuzuna bakın.",
  "startup.archiveChangedTitle": "Element dosyaları değiştirildi",
  "startup.archiveChangedBody":
    "Başka bir program Element’un app.asar dosyasını değiştirdi. Element şu an çalışıyor, ancak kapattıktan sonra açılmayacak.\n\nOnarmak için Element’u yeniden yükleyin. Yerel verileriniz korunur.",
  "startup.archiveChangedDownload": "Element’u indir",
  "startup.newerDataUpdatingTitle": "Element güncelleniyor",
  "startup.newerDataUpdatingBody":
    "Element’un daha yeni bir sürümü verilerinizi kaydetti. Element en son sürümü yüklüyor ve ardından yeniden açılacak.\n\nYerel verileriniz sıfırlanmadı veya üzerine yazılmadı.",
  "startup.newerDataTitle": "En son Element’u yükleyin",
  "startup.newerDataBody":
    "Element’un daha yeni bir sürümü verilerinizi kaydetti ve bu sürüm ({version}) onları açamıyor. Verilerinizi açmak için en son sürümü yükleyin.\n\nYerel verileriniz sıfırlanmadı veya üzerine yazılmadı.",
  "startup.newerDataDownload": "Element’u indir",
  "startup.newerDataGuide": "Kılavuzu aç",
  "startup.newerDataQuit": "Çık",
} as const satisfies PartialTranslation<typeof source>;
