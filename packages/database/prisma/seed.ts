import { PrismaClient, Rol } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@taller.local";
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!password) {
    throw new Error("Define SEED_ADMIN_PASSWORD en .env para crear el usuario administrador.");
  }

  const existente = await prisma.usuario.findUnique({ where: { email } });
  if (existente) {
    console.log(`El usuario administrador ${email} ya existe.`);
    return;
  }

  await prisma.usuario.create({
    data: {
      email,
      nombre: "Administrador",
      passwordHash: await bcrypt.hash(password, 10),
      rol: Rol.ADMIN,
    },
  });
  console.log(`Usuario administrador creado: ${email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
