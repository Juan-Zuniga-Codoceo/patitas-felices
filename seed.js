const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@patitas.cl';
    const plainPassword = 'admin';

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // Crear o actualizar admin user
    const admin = await prisma.user.upsert({
        where: { email },
        update: {
            password: hashedPassword,
        },
        create: {
            email,
            password: hashedPassword,
            name: 'Admin Patitas',
            role: 'ADMIN',
        },
    });

    console.log(`Usuario Admin creado/actualizado exitosamente: ${admin.email}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
