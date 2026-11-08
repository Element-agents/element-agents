import type { PartialTranslation } from "../../message";
import type { messages as source } from "../en/menu";

export const messages = {
  "menu.stopAllAgents": "Tüm ajanları durdur",
  "menu.checkForUpdates": "Güncellemeleri Denetle…",
  "menu.preferences": "Ayarlar…",
  "menu.actualSize": "Gerçek Boyut",
  "menu.zoomIn": "Yakınlaştır",
  "menu.zoomOut": "Uzaklaştır",
  "menu.copyLink": "Bağlantıyı Kopyala",
  "menu.quit": "Element'tan çık",
  "menu.quitConfirmTitle": "Element'tan çıkılsın mı?",
  "menu.quitConfirmBody": "Element'u yeniden açana kadar ajanlar ve rutinler durur.",
  "menu.quitConfirm": "Çık",
  "menu.quitHint": "Çıkmak için ⌘Q'yu basılı tutun veya iki kez basın",
  "menu.trayOpen": "Element'u aç",
  "menu.trayQuit": "Element'tan çık",
  "menu.trayTooltip": "Element",
  "menu.undo": "Geri al",
  "menu.redo": "Yinele",
  "menu.cut": "Kes",
  "menu.copy": "Kopyala",
  "menu.paste": "Yapıştır",
  "menu.pasteAndMatchStyle": "Yapıştır ve stili eşleştir",
  "menu.delete": "Sil",
  "menu.selectAll": "Tümünü seç",
} as const satisfies PartialTranslation<typeof source>;
