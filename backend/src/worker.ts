import { MailerService } from "./common/services/mailer.service";
import { createEmailWorker } from "./queues/email.worker";

const mailerService = new MailerService();

async function main() {
  await mailerService.verifyConnection();
  createEmailWorker();
  console.log("Email worker process started");
}

main().catch((error: unknown) => {
  console.error("Failed to start email worker", error);
  process.exit(1);
});
