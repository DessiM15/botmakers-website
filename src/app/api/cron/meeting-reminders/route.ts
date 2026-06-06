// SPEC: Google Calendar Integration > Cron > Meeting Reminders (hourly)
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { calendarEvents } from "@/lib/db/schema";
import { getEventsNeedingReminder } from "@/lib/db/queries/calendar";
import { sendEmail } from "@/lib/email/client";
import { meetingReminder24h } from "@/lib/email/templates/meeting-reminder-24h";
import { meetingReminder4h } from "@/lib/email/templates/meeting-reminder-4h";
import { sendSms } from "@/lib/integrations/twilio";
import { smsReminder24h, smsReminder4h } from "@/lib/sms/templates";
import { env } from "@/lib/env";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let sent24h = 0;
  let sent4h = 0;
  let sms24h = 0;
  let sms4h = 0;

  try {
    // 24-hour reminders
    const events24h = await getEventsNeedingReminder("24h");
    for (const event of events24h) {
      if (!event.bookedByEmail || !event.bookedByName) continue;

      const startDate = new Date(event.startTime);
      const email = meetingReminder24h({
        name: event.bookedByName,
        date: startDate.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
        }),
        time: startDate.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        }),
        meetingLink: event.meetingLink,
      });

      await sendEmail({
        to: event.bookedByEmail,
        subject: email.subject,
        html: email.html,
      }).catch((err) =>
        console.error("[CB-INT-001] 24h reminder failed:", err)
      );

      // Send SMS if phone available
      if (event.bookedByPhone) {
        const timeStr = startDate.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        });
        await sendSms({
          to: event.bookedByPhone,
          body: smsReminder24h({
            name: event.bookedByName,
            time: timeStr,
            meetingLink: event.meetingLink,
          }),
        }).catch((err) =>
          console.error("[CB-INT-005] 24h SMS reminder failed:", err)
        );
        sms24h++;
      }

      await db
        .update(calendarEvents)
        .set({ reminder24hSent: true })
        .where(eq(calendarEvents.id, event.id));

      sent24h++;
    }

    // 4-hour reminders
    const events4h = await getEventsNeedingReminder("4h");
    for (const event of events4h) {
      if (!event.bookedByEmail || !event.bookedByName) continue;

      const startDate = new Date(event.startTime);
      const email = meetingReminder4h({
        name: event.bookedByName,
        time: startDate.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        }),
        meetingLink: event.meetingLink,
      });

      await sendEmail({
        to: event.bookedByEmail,
        subject: email.subject,
        html: email.html,
      }).catch((err) =>
        console.error("[CB-INT-001] 4h reminder failed:", err)
      );

      // Send SMS if phone available
      if (event.bookedByPhone) {
        const timeStr = startDate.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        });
        await sendSms({
          to: event.bookedByPhone,
          body: smsReminder4h({
            name: event.bookedByName,
            time: timeStr,
            meetingLink: event.meetingLink,
          }),
        }).catch((err) =>
          console.error("[CB-INT-005] 4h SMS reminder failed:", err)
        );
        sms4h++;
      }

      await db
        .update(calendarEvents)
        .set({ reminder4hSent: true })
        .where(eq(calendarEvents.id, event.id));

      sent4h++;
    }
  } catch (err) {
    console.error("[CB-INT-006] Meeting reminders cron failed:", err);
    return NextResponse.json(
      { error: "Cron job failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    message: `Sent ${sent24h} 24h and ${sent4h} 4h email reminders, ${sms24h} 24h and ${sms4h} 4h SMS reminders`,
  });
}
