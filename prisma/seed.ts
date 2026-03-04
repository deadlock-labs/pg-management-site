import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";
import path from "path";

const dbPath = path.join(process.cwd(), "dev.db");
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Create default bill types
  const billTypes = [
    { name: "Electricity", icon: "⚡" },
    { name: "Water", icon: "💧" },
    { name: "Maintenance", icon: "🔧" },
    { name: "Rent", icon: "🏠" },
    { name: "Internet", icon: "🌐" },
  ];

  for (const bt of billTypes) {
    await prisma.billType.upsert({
      where: { name: bt.name },
      update: {},
      create: bt,
    });
  }

  console.log("✅ Default bill types created");

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 12);
  await prisma.user.upsert({
    where: { email: "admin@pg.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@pg.com",
      password: adminPassword,
      role: "admin",
    },
  });

  console.log("✅ Admin user created (admin@pg.com / admin123)");

  // Create sample users
  const userPassword = await bcrypt.hash("user123", 12);
  const users = [
    { name: "Rahul Kumar", email: "rahul@example.com" },
    { name: "Priya Sharma", email: "priya@example.com" },
    { name: "Amit Patel", email: "amit@example.com" },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        ...u,
        password: userPassword,
        role: "user",
      },
    });
  }

  console.log("✅ Sample users created (password: user123)");

  // Create sample rooms
  const rooms = [
    { name: "Room 101", floor: 1, capacity: 3, rentAmount: 15000 },
    { name: "Room 102", floor: 1, capacity: 2, rentAmount: 12000 },
    { name: "Room 201", floor: 2, capacity: 3, rentAmount: 15000 },
  ];

  for (const r of rooms) {
    await prisma.room.upsert({
      where: { name: r.name },
      update: {},
      create: r,
    });
  }

  console.log("✅ Sample rooms created");
  console.log("\n🎉 Seed complete! Login with admin@pg.com / admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
