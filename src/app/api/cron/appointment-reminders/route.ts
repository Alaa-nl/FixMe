import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { notifyAndEmail } from "@/lib/notifications";
import { getPlatformSettings } from "@/lib/platformSettings";

/**
 * POST /api/cron/appointment-reminders
 * Send 24h and 1h reminders for upcoming SCHEDULED jobs.
 * Designed to be called every 15 minutes by an external cron service.
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const settings = await getPlatformSettings();
    if (!settings.notificationSettings.appointmentReminder) {
      return NextResponse.json(
        { message: "Appointment reminders disabled", sent: 0 },
        { status: 200 }
      );
    }

    const now = new Date();
    const results = { reminder24h: 0, reminder1h: 0, errors: 0 };

    const jobInclude = {
      customer: { select: { id: true, name: true, email: true } },
      fixer: {
        select: {
          id: true,
          name: true,
          email: true,
          fixerProfile: {
            select: { averageRating: true, verifiedBadge: true },
          },
        },
      },
      repairRequest: {
        select: {
          title: true,
          address: true,
          city: true,
        },
      },
    };

    // ---- 24-HOUR REMINDERS ----
    const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const jobs24h = await prisma.job.findMany({
      where: {
        status: "SCHEDULED",
        scheduledAt: { not: null, gt: now, lte: twentyFourHoursFromNow },
        reminder24hSentAt: null,
      },
      include: jobInclude,
    });

    for (const job of jobs24h) {
      try {
        const scheduledAt = job.scheduledAt!;
        const { dateStr, timeStr } = formatAppointmentDate(scheduledAt);
        const rating = job.fixer.fixerProfile?.averageRating;
        const ratingStr = rating ? ` (⭐ ${rating.toFixed(1)})` : "";
        const locationStr = formatLocation(job.repairRequest.address, job.repairRequest.city);

        await notifyAndEmail(
          job.customerId,
          "APPOINTMENT_REMINDER_24H",
          "Appointment tomorrow",
          `Reminder: ${job.fixer.name}${ratingStr} is coming to fix your ${job.repairRequest.title} on ${dateStr} at ${timeStr}${locationStr}.`,
          job.id
        );

        await notifyAndEmail(
          job.fixerId,
          "APPOINTMENT_REMINDER_24H",
          "Appointment tomorrow",
          `Reminder: You have an appointment to fix ${job.repairRequest.title} for ${job.customer.name} on ${dateStr} at ${timeStr}${locationStr}.`,
          job.id
        );

        await prisma.job.update({
          where: { id: job.id },
          data: { reminder24hSentAt: now },
        });

        results.reminder24h++;
      } catch (e) {
        console.error(`Failed 24h reminder for job ${job.id}:`, e);
        results.errors++;
      }
    }

    // ---- 1-HOUR REMINDERS ----
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

    const jobs1h = await prisma.job.findMany({
      where: {
        status: "SCHEDULED",
        scheduledAt: { not: null, gt: now, lte: oneHourFromNow },
        reminder1hSentAt: null,
      },
      include: jobInclude,
    });

    for (const job of jobs1h) {
      try {
        const scheduledAt = job.scheduledAt!;
        const timeStr = scheduledAt.toLocaleTimeString("nl-NL", {
          hour: "2-digit",
          minute: "2-digit",
        });
        const rating = job.fixer.fixerProfile?.averageRating;
        const ratingStr = rating ? ` (⭐ ${rating.toFixed(1)})` : "";
        const locationStr = formatLocation(job.repairRequest.address, job.repairRequest.city);

        await notifyAndEmail(
          job.customerId,
          "APPOINTMENT_REMINDER_1H",
          "Appointment in 1 hour",
          `${job.fixer.name}${ratingStr} is arriving soon to fix your ${job.repairRequest.title} at ${timeStr}${locationStr}. Be ready!`,
          job.id
        );

        await notifyAndEmail(
          job.fixerId,
          "APPOINTMENT_REMINDER_1H",
          "Appointment in 1 hour",
          `Heads up: Your appointment to fix ${job.repairRequest.title} for ${job.customer.name} is at ${timeStr}${locationStr}. Time to head out!`,
          job.id
        );

        await prisma.job.update({
          where: { id: job.id },
          data: { reminder1hSentAt: now },
        });

        results.reminder1h++;
      } catch (e) {
        console.error(`Failed 1h reminder for job ${job.id}:`, e);
        results.errors++;
      }
    }

    return NextResponse.json({
      message: `Sent ${results.reminder24h} 24h and ${results.reminder1h} 1h reminders`,
      ...results,
    });
  } catch (error) {
    console.error("Error sending appointment reminders:", error);
    return NextResponse.json(
      { error: "Failed to send appointment reminders" },
      { status: 500 }
    );
  }
}

function formatAppointmentDate(date: Date) {
  const dateStr = date.toLocaleDateString("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const timeStr = date.toLocaleTimeString("nl-NL", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return { dateStr, timeStr };
}

function formatLocation(address: string | null, city: string) {
  return address ? ` at ${address}, ${city}` : ` in ${city}`;
}
