import { schedule } from "node-cron";

import { UsersService } from "../modules/users/users.service";
import { emailQueue } from "../queues/email.queue";

const usersService = new UsersService();
const dailyUserEmailCronExpression = "0 11 * * *";
const bulkInsertChunkSize = 1000;

function getTodayDateKey() {
  return new Date().toISOString().slice(0, 10);
}

async function enqueueDailyUserEmails(regionLabel: string) {
  const dateKey = getTodayDateKey();
  const users = await usersService.listAllUsersForEmail();

  if (users.length === 0) {
    console.warn(`Daily user email (${regionLabel}): no users found`);
    return;
  }

  const jobs = users.map((user) => ({
    data: {
      subject: `Daily Update - ${regionLabel}`,
      text: `Hi ${user.name}, here is your daily update for ${regionLabel}.`,
      to: user.email,
    },
    name: "send-daily-email",
    opts: {
      jobId: `daily-email:${dateKey}:${regionLabel}:${user.id}`,
    },
  }));

  for (let offset = 0; offset < jobs.length; offset += bulkInsertChunkSize) {
    await emailQueue.addBulk(jobs.slice(offset, offset + bulkInsertChunkSize));
  }

  console.log(`Daily user email (${regionLabel}): enqueued ${jobs.length} job(s) for ${dateKey}`);
}

export function registerDailyUserEmailJobs() {
  schedule(
    dailyUserEmailCronExpression,
    () => {
      enqueueDailyUserEmails("India").catch((error: unknown) => {
        console.error("Daily user email (India) enqueue failed", error);
      });
    },
    { timezone: "Asia/Kolkata" },
  );

  schedule(
    dailyUserEmailCronExpression,
    () => {
      enqueueDailyUserEmails("USA").catch((error: unknown) => {
        console.error("Daily user email (USA) enqueue failed", error);
      });
    },
    { timezone: "America/New_York" },
  );

  console.log("Daily user email cron jobs registered (India 11:00 IST, USA 11:00 ET)");
}
