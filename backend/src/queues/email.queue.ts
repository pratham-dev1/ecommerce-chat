import { Queue } from "bullmq";

import { queueConnection } from "../config/queueConnection";

export const emailQueueName = "email-queue";

export type EmailJobData = {
  subject: string;
  text: string;
  to: string;
};

export const emailQueue = new Queue<EmailJobData>(emailQueueName, {
  connection: queueConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      delay: 5000,
      type: "exponential",
    },
    removeOnComplete: {
      count: 5000,
    },
    removeOnFail: {
      count: 5000,
    },
  },
});
