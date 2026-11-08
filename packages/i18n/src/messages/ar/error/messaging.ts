import type { PartialTranslation } from "../../../message";
import type { messages as source } from "../../en/error/messaging";

export const messages = {
  "error.messaging.notConnected": "مساحة عمل Slack هذه غير متصلة.",
  "error.messaging.unsupported": "لا يمكن لهذا الحاسوب الاتصال بـ Slack.",
  "error.messaging.slackNotConfigured": "تطبيق Element على Slack غير مهيأ.",
  "error.messaging.relayUnavailable":
    "لا يمكن لـ Element استلام أحداث Slack على هذا الحاسوب. سجّل الدخول، وأعطِ هذا الحاسوب اسمًا، ثم أعد المحاولة.",
  "error.messaging.discordNotConnected": "خادم Discord هذا غير متصل.",
  "error.messaging.discordUnsupported": "لا يمكن لهذا الحاسوب الاتصال بـ Discord.",
  "error.messaging.discordNotConfigured": "تطبيق Element على Discord غير مهيأ.",
  "error.messaging.discordRelayUnavailable":
    "لا يمكن لـ Element استلام أحداث Discord على هذا الحاسوب. سجّل الدخول، وأعطِ هذا الحاسوب اسمًا، ثم أعد المحاولة.",
  "error.messaging.discordRolesUnsupported": "لا يمكن لـ Element عرض أدوار Discord بعد. أعد المحاولة لاحقًا.",
  "error.messaging.telegramNotConnected": "دردشة Telegram هذه غير متصلة.",
  "error.messaging.telegramUnsupported": "لا يمكن لهذا الحاسوب الاتصال بـ Telegram.",
  "error.messaging.telegramRelayUnavailable":
    "لا يمكن لـ Element الوصول إلى Telegram على هذا الحاسوب. سجّل الدخول، وأعطِ هذا الحاسوب اسمًا، ثم أعد المحاولة.",
  "error.messaging.telegramServiceUnavailable": "لا يمكن لـ Element ربط Telegram الآن. أعد المحاولة لاحقًا.",
  "error.messaging.whatsappNotConnected": "رقم WhatsApp هذا غير متصل.",
  "error.messaging.whatsappUnsupported": "لا يمكن لهذا الحاسوب الاتصال بـ WhatsApp.",
  "error.messaging.whatsappTooManySenders": "يمكن لرقم WhatsApp أن يسمح بما يصل إلى 200 من جهات الاتصال والمجموعات.",
  "error.messaging.whatsappRequestEnded": "انتهى هذا الطلب. اطلب من الشخص أن يكتب مرة أخرى للحصول على رمز جديد.",
  "error.messaging.memoryLimit": "يمكن أن تحتوي مساحة العمل المتصلة على {limit} ذكريات كحد أقصى. احذف واحدة أولًا.",
} as const satisfies PartialTranslation<typeof source>;
