import { prisma } from "@/lib/prisma";
import { escapeHtml, isEmailConfigured, isValidTimeZone, sendEmail } from "@/lib/email";
import { DICTIONARIES } from "@/i18n/dictionaries";
import { fmt, isLocale, type Locale } from "@/i18n/config";

/**
 * Class reminders by email, a day before and about an hour before, to the
 * instructor and every accepted student. A scheduler calls
 * /api/cron/send-reminders every 15 minutes; each run sends whatever is due
 * and stamps it so nobody gets the same reminder twice.
 */
const MINUTE = 60 * 1000;
const WINDOWS = {
  // Classes booked less than 3 hours ahead skip the day-before email and only get the hour-before one.
  day: { from: 3 * 60 * MINUTE, to: 24 * 60 * MINUTE, field: "reminderDaySentAt" },
  hour: { from: 0, to: 90 * MINUTE, field: "reminderHourSentAt" },
} as const;
type Kind = keyof typeof WINDOWS;

// Resend's default limit is 2 requests a second.
const SEND_GAP_MS = 550;
const DEMO_DOMAIN = "@yogatropical.demo";

function siteUrl(): string {
  return (process.env.NEXTAUTH_URL || "https://www.yogatropical.com").replace(/\/$/, "");
}

interface Recipient {
  name: string;
  email: string;
  emailReminders: boolean;
  locale: string | null;
  timeZone: string | null;
}
const RECIPIENT_SELECT = { name: true, email: true, emailReminders: true, locale: true, timeZone: true } as const;

function wantsReminders(user: Recipient): boolean {
  return user.emailReminders && !user.email.toLowerCase().endsWith(DEMO_DOMAIN);
}

function formatClassTime(start: Date, locale: Locale, timeZone: string | null): string {
  // Intl has no Haitian Creole date formats; French reads naturally in Haiti.
  return start.toLocaleString(locale === "ht" ? "fr-HT" : locale, {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: timeZone && isValidTimeZone(timeZone) ? timeZone : "UTC",
    timeZoneName: "short",
  });
}

interface ClassInfo {
  id: string;
  title: string;
  startTime: Date;
  deliveryMethod: "VIRTUAL" | "IN_PERSON";
  locationAddress: string | null;
}

/** Builds one reminder email in the recipient's language and time zone. */
export function buildReminder(kind: Kind, cls: ClassInfo, user: Recipient, role: "student" | "instructor", studentCount = 0) {
  const locale: Locale = isLocale(user.locale) ? user.locale : "en";
  const r = DICTIONARIES[locale].reminders;
  const base = siteUrl();
  const vars = { title: cls.title, name: user.name.split(/\s+/)[0] || user.name };

  const lines = [
    fmt(r.greeting, vars),
    fmt(kind === "day" ? r.dayBody : r.hourBody, vars),
    fmt(r.when, { time: formatClassTime(cls.startTime, locale, user.timeZone) }),
  ];
  if (role === "instructor") lines.push(fmt(r.studentsBooked, { n: studentCount }));
  let action: { label: string; url: string } | null = null;
  if (cls.deliveryMethod === "VIRTUAL") {
    action = { label: r.joinRoom, url: `${base}/room/${cls.id}` };
    if (kind === "day") lines.push(fmt(r.cameraTip, { url: `${base}/room/test` }));
  } else if (cls.locationAddress) {
    lines.push(fmt(r.where, { address: cls.locationAddress }));
  }
  const dashboard = `${base}/dashboard/${role === "instructor" ? "instructor" : "client"}`;
  const footer = fmt(r.footer, { url: dashboard });

  const text = [...lines, ...(action ? [`${action.label}: ${action.url}`] : []), footer].join("\n\n");
  const html = `<div style="font-family:Arial,sans-serif;font-size:16px;line-height:1.5;color:#1f2933;max-width:560px">
${lines.map((l) => `<p>${escapeHtml(l)}</p>`).join("\n")}
${action ? `<p><a href="${escapeHtml(action.url)}" style="display:inline-block;background:#de6ba3;color:#1c1e23;padding:10px 20px;border-radius:999px;text-decoration:none;font-weight:bold">${escapeHtml(action.label)}</a></p>` : ""}
<p style="font-size:12px;color:#6b7280">${escapeHtml(footer)}</p>
</div>`;

  return { to: user.email, subject: fmt(kind === "day" ? r.subjectDay : r.subjectHour, vars), text, html };
}

/** Sends every reminder that's due. Failed sends aren't stamped, so the next run retries them. */
export async function sendDueReminders(now = new Date()) {
  if (!isEmailConfigured()) return { sent: 0, failed: 0, skipped: "Email isn't set up (RESEND_API_KEY)." };
  let sent = 0;
  let failed = 0;

  async function trySend(message: ReturnType<typeof buildReminder>) {
    if (sent + failed > 0) await new Promise((resolve) => setTimeout(resolve, SEND_GAP_MS));
    try {
      await sendEmail(message);
      sent++;
      return true;
    } catch (err) {
      console.error("Reminder email failed:", err);
      failed++;
      return false;
    }
  }

  for (const kind of Object.keys(WINDOWS) as Kind[]) {
    const { from, to, field } = WINDOWS[kind];
    const classes = await prisma.classSession.findMany({
      where: {
        startTime: { gt: new Date(now.getTime() + from), lte: new Date(now.getTime() + to) },
        status: { in: ["OPEN", "FULL"] },
        enrollments: { some: { status: "ACCEPTED" } },
      },
      include: {
        instructor: { select: RECIPIENT_SELECT },
        enrollments: { where: { status: "ACCEPTED", [field]: null }, include: { client: { select: RECIPIENT_SELECT } } },
        _count: { select: { enrollments: { where: { status: "ACCEPTED" } } } },
      },
    });

    for (const cls of classes) {
      for (const enrollment of cls.enrollments) {
        if (wantsReminders(enrollment.client) && !(await trySend(buildReminder(kind, cls, enrollment.client, "student")))) continue;
        await prisma.enrollment.update({ where: { id: enrollment.id }, data: { [field]: now } });
      }
      if (cls[field] === null) {
        const message = buildReminder(kind, cls, cls.instructor, "instructor", cls._count.enrollments);
        if (wantsReminders(cls.instructor) && !(await trySend(message))) continue;
        await prisma.classSession.update({ where: { id: cls.id }, data: { [field]: now } });
      }
    }
  }
  return { sent, failed };
}
