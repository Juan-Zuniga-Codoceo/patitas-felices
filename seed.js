const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
    console.log("🐾 Iniciando proceso de Seed en la Base de Datos PostgreSQL...");

    // 1. Limpieza Inicial (Opcional pero segura en entornos limpios)
    // Se recomienda precaución en producción; como es el seed inicial, podemos limpiar si es necesario.

    // 2. Administrador Global de SynapseDev
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@synapsedev.cl' },
        update: {},
        create: {
            email: 'admin@synapsedev.cl',
            password: adminPassword,
            name: 'Administrador Principal',
            role: 'ADMIN',
        },
    });
    console.log(`✅ Administrador creado: ${admin.email}`);

    // 3. Proveedor por Defecto (Requerido para el Modelo Product)
    const provider = await prisma.provider.create({
        data: {
            name: 'Dropi Oficial Chile',
            type: 'Dropi',
            email: 'contacto@dropi.cl',
            phone: '+56900000000',
        }
    });
    console.log(`✅ Proveedor Creado: ${provider.name}`);

    // 4. Catálogo de Productos Ganadores (Winning Products)
    const productsToSeed = [
        {
            name: "Cama Ortopédica Viscoelástica Premium",
            category: "Dog",
            price: 45990.0,
            costPrice: 20000.0,
            sku: "BED-VP-DOG",
            weight: 2.5,
            length: 80.0,
            width: 60.0,
            height: 15.0,
            providerType: "Dropi",
            providerId: provider.id,
            imageUrl: "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
            description: `## Comodidad sin límites para tu mejor amigo\n\nNuestra **Cama Ortopédica Premium** está diseñada ergonómicamente con espuma viscoelástica (Memory Foam) de alta densidad.\n\n- **Soporte articular:** Alivia dolores en perros mayores o con displasia.\n- **Fácil de lavar:** Funda removible, resistente a los arañazos y de secado rápido.\n- **Base antideslizante:** Firmeza total sin importar los saltos.`,
            variants: [
                { color: "Gris Grafito", stock: 25, priceAdjustment: 0 },
                { color: "Beige Arena", stock: 15, priceAdjustment: 0 }
            ]
        },
        {
            name: "Rascador Torre Multinivel Deluxe",
            category: "Cat",
            price: 35990.0,
            costPrice: 15500.0,
            sku: "TOWER-CAT-001",
            weight: 6.0,
            length: 45.0,
            width: 45.0,
            height: 130.0,
            providerType: "Dropi",
            providerId: provider.id,
            imageUrl: "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
            description: `## El paraíso vertical para tu gato\n\nProtege tus muebles y brinda horas de diversión con esta **Torre Rascador** equipada con postes de sisal natural.\n\n- **Hamacas y Refugios:** Dos plataformas acolchadas y una casita secreta.\n- **Anti-Estrés:** Reduce la ansiedad de los felinos indoor.\n- **Estabilidad asegurada:** Base reforzada de madera premium.`,
            variants: [
                { color: "Gris Claro", stock: 10, priceAdjustment: 0 },
                { color: "Café Moca", stock: 12, priceAdjustment: 0 }
            ]
        },
        {
            name: "Fuente de Agua Inteligente con Sensor",
            category: "Both",
            price: 22990.0,
            costPrice: 10000.0,
            sku: "WATER-SMART-2L",
            weight: 0.8,
            length: 20.0,
            width: 20.0,
            height: 18.0,
            providerType: "Dropi",
            providerId: provider.id,
            imageUrl: "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
            description: `## Hidratación constante y purificada\n\nLas mascotas prefieren agua en movimiento. Esta **Fuente Inteligente** de 2.2L atrapa impurezas y motiva la hidratación.\n\n- **Filtro de Carbón Activo:** Elimina pelos, cloro y metales pesados.\n- **Ultra silenciosa:** Menos de 30dB, no asusta a tus mascotas.\n- **Sensor Infrarrojo:** Solo fluye cuando se acercan, ahorrando energía.`,
            variants: [
                { color: "Blanco Perla", stock: 40, priceAdjustment: 0 },
                { color: "Transparente LED", stock: 35, priceAdjustment: 2000.0 }
            ]
        },
        {
            name: "Arnés y Correa Táctica Anti-Tirones",
            category: "Dog",
            price: 18990.0,
            costPrice: 8000.0,
            sku: "ARNES-TAC-02",
            weight: 0.35,
            length: 30.0,
            width: 25.0,
            height: 5.0,
            providerType: "Dropi",
            providerId: provider.id,
            imageUrl: "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
            description: `## Paseos bajo control absoluto\n\nOlvídate de los ahogos. Arnés reflectante con enganche frontal **Anti-Tirones** diseñado bajo estándares tácticos militares.\n\n- **Material Oxford 900D:** Extrema resistencia a mordeduras y desgaste.\n- **Distribución de fuerza:** Protege la tráquea y el cuello de tu perro.\n- **Asa de seguridad superior:** Para emergencias cruzando la calle.`,
            variants: [
                { color: "Negro Táctico", stock: 50, priceAdjustment: 0 },
                { color: "Verde Oliva", stock: 45, priceAdjustment: 0 }
            ]
        },
        {
            name: "Arenero Cerrado XL Anti-Olores",
            category: "Cat",
            price: 29990.0,
            costPrice: 14000.0,
            sku: "LITTER-BOX-XL",
            weight: 3.5,
            length: 55.0,
            width: 45.0,
            height: 40.0,
            providerType: "Dropi",
            providerId: provider.id,
            imageUrl: "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
            description: `## Privacidad e higiene en tu hogar\n\nEl arenero definitivo. Diseño amplio y cerrado que impide que la arena y los olores escapen al resto de la casa.\n\n- **Filtro de Carbón Superior:** Absorbe rápidamente amoniaco y olores desagradables.\n- **Bandeja Extraíble:** Limpieza diaria en menos de un minuto.\n- **Privacidad Gatuna:** Reduce el nerviosismo de los felinos asustadizos.`,
            variants: [
                { color: "Rosa Pastel", stock: 8, priceAdjustment: 0 },
                { color: "Azul Petróleo", stock: 12, priceAdjustment: 0 }
            ]
        }
    ];

    for (const p of productsToSeed) {
        const { variants, ...productData } = p;
        const newProduct = await prisma.product.create({
            data: productData,
        });

        // Add variants using mapped product.id
        const variantData = variants.map(v => ({ ...v, productId: newProduct.id }));
        await prisma.productVariant.createMany({
            data: variantData
        });

        console.log(`✅ Producto insertado: ${newProduct.name} (${variants.length} variantes)`);
    }

    console.log("🚀 ¡Seed ejecutado exitosamente! Tu base de datos tiene datos relacionales listos para operar.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
