import { PrismaClient } from "../src/generated/prisma";
import bcrypt from "bcryptjs";
import readline from "readline";

const prisma = new PrismaClient();
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function createAdmin() {
  console.log("\n--- Create Admin Account ---");

  rl.question("Enter Admin Email: ", async (email) => {
    if (!email) {
      console.error("Email is required.");
      process.exit(1);
    }

    rl.question("Enter Admin Password: ", async (password) => {
      if (!password || password.length < 6) {
        console.error("Password must be at least 6 characters.");
        process.exit(1);
      }

      try {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const user = await prisma.user.create({
          data: {
            email,
            password: hashedPassword,
          },
        });

        console.log(`\n✅ Admin account created successfully: ${user.email}`);
      } catch (error: any) {
        if (error.code === 'P2002') {
          console.error("\n❌ Error: A user with this email already exists.");
        } else {
          console.error("\n❌ Error creating admin:", error);
        }
      } finally {
        await prisma.$disconnect();
        rl.close();
      }
    });
  });
}

createAdmin();
