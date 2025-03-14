const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testInsert() {
    try {
        // Ensure category exists
        await prisma.category.upsert({
            where: { id: 1 },
            update: {},
            create: { id: 1, name: "Semiconductors" }
        });

        // Insert Part
        const part = await prisma.part.create({
            data: {
                partNumber: "TEST123",
                datasheetLink: "https://example.com/test.pdf",
                subCategory: {
                    connectOrCreate: {
                        where: { name_categoryId: { name: "Transistors", categoryId: 1 } },
                        create: { name: "Transistors", categoryId: 1 }
                    }
                },
                specifications: {
                    create: {
                        vdss: 100,
                        hasVdss: true,
                        vgs: 20,
                        hasVgs: true,
                        idAt25: 85,
                        hasIdAt25: true
                    }
                }
            }
        });

        console.log("Inserted Part:", part);
    } catch (error) {
        console.error("Insert Error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

testInsert();
