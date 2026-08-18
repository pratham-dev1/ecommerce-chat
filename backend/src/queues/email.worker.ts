import { Job, Worker } from "bullmq";

import { MailerService } from "../common/services/mailer.service";
import { env } from "../config/env";
import { queueConnection } from "../config/queueConnection";
import { EmailJobData, emailQueueName } from "./email.queue";

const mailerService = new MailerService();

// Errors thrown here are caught by BullMQ, which retries the job per emailQueue's defaultJobOptions.
async function processEmailJob(job: Job<EmailJobData>) {
  await mailerService.sendMail(job.data);
}

export function createEmailWorker() {
  const worker = new Worker<EmailJobData>(emailQueueName, processEmailJob, {
    concurrency: env.emailWorkerConcurrency,
    connection: queueConnection,
  });

  worker.on("failed", (job, error) => {
    console.error(`Email job ${job?.id} failed for "${job?.data.to}"`, error);
  });

  console.log(`Email worker started (concurrency: ${env.emailWorkerConcurrency})`);

  return worker;
}
