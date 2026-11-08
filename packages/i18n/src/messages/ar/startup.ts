import type { PartialTranslation } from "../../message";
import type { messages as source } from "../en/startup";

export const messages = {
  "startup.failedTitle": "تعذّر بدء تشغيل Element",
  "startup.failedBody":
    "{message}\n\nلم تُعَد تعيين بياناتك المحلية ولم يُكتب فوقها. راجع دليل استكشاف الأخطاء وإصلاحها لمعرفة خطوات الاسترداد.",
  "startup.archiveChangedTitle": "تم تغيير ملفات Element",
  "startup.archiveChangedBody":
    "غيّر برنامج آخر ملف Element المسمى app.asar. يعمل Element الآن، لكنه لن يفتح بعد إنهائه.\n\nلإصلاح Element، ثبّته من جديد. تبقى بياناتك المحلية.",
  "startup.archiveChangedDownload": "تنزيل Element",
  "startup.newerDataUpdatingTitle": "جارٍ تحديث Element",
  "startup.newerDataUpdatingBody":
    "حفظ إصدار أحدث من Element بياناتك. يثبّت Element أحدث إصدار ثم يفتح مرة أخرى.\n\nلم تتم إعادة تعيين بياناتك المحلية أو الكتابة فوقها.",
  "startup.newerDataTitle": "ثبّت أحدث إصدار من Element",
  "startup.newerDataBody":
    "حفظ إصدار أحدث من Element بياناتك، ولا يستطيع هذا الإصدار ({version}) فتحها. ثبّت أحدث إصدار لفتح بياناتك.\n\nلم تتم إعادة تعيين بياناتك المحلية أو الكتابة فوقها.",
  "startup.newerDataDownload": "تنزيل Element",
  "startup.newerDataGuide": "فتح الدليل",
  "startup.newerDataQuit": "إنهاء",
} as const satisfies PartialTranslation<typeof source>;
