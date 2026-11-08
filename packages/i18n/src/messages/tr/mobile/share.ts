import type { PartialTranslation } from "../../../message";
import type { messages as source } from "../../en/mobile/share";

export const messages = {
  "mobile.share.signInTitle": "Paylaşmak için oturum açın",
  "mobile.share.signInDescription":
    "Bilgisayarınızdaki Element'ta QR kodunu tarayın. Ardından paylaştığınız içeriği alacak ajanı seçebilirsiniz.",
  "mobile.share.reading": "Paylaştığınız içerik okunuyor…",
  "mobile.share.readFailed": "Element paylaştığınız içeriği okuyamadı. Tekrar paylaşın.",
  "mobile.share.content": "Paylaşılacak",
  "mobile.share.footer":
    "Sohbet, bu içerik mesaj alanında olacak şekilde açılır. Siz gönderene kadar hiçbir şey gönderilmez.",
  "mobile.share.lastUsed": "Son kullanılan",
  "mobile.share.noAgents": "Ajan yok",
  "mobile.share.chooseAgent": "Bir ajan seçin",
  "mobile.share.action": "{name} ile paylaş",
  "mobile.share.extension.send": "Gönder",
  "mobile.share.extension.footer": "Element bunu şimdi ajana gönderir. Uygulama açılmaz.",
  "mobile.share.extension.sending": "{name} adlı ajana gönderiliyor…",
  "mobile.share.extension.sent": "{name} adlı ajana gönderildi",
  "mobile.share.extension.failed": "Element bunu gönderemedi. Oradan göndermek için uygulamayı aç.",
  "mobile.share.extension.unconfirmed": "Sunucu mesajı onaylamadı. Yeniden göndermeden önce sohbete bak.",
  "mobile.share.extension.openApp": "Element'u aç",
} as const satisfies PartialTranslation<typeof source>;
