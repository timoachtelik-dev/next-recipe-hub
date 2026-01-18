import { PrismaClient } from "@prisma/client";
import { hashEmail } from "../src/lib/email-hash";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true },
  });

  let updated = 0;
  for (const user of users) {
    if (user.email.includes("@")) {
      await prisma.user.update({
        where: { id: user.id },
        data: { email: hashEmail(user.email) },
      });
      updated += 1;
    }
  }

  console.log(`Hashed ${updated} user email(s).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
