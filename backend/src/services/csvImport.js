const fs = require("fs");
const csv = require("csv-parser");
const prisma = require("../config/db");
// const truncateTables = async () => {
//     try {
//         await prisma.$executeRaw`
//             TRUNCATE TABLE "Specification", "Part", "SubCategory", "Category" RESTART IDENTITY CASCADE;
//         `;
//         console.log("Old data truncated successfully. All IDs reset to 1.");
//     } catch (error) {
//         console.error("Error truncating tables:", error);
//         throw error;
//     }
// };

exports.processCSV = async (filePath) => {
    console.time("CSV Processing Time");
    return new Promise((resolve, reject) => {
        const results = [];

        fs.createReadStream(filePath)
            .pipe(csv())
            .on("data", (data) => results.push(data))
            .on("end", async () => {
                try {
                    console.log(`Processing ${results.length} rows...`);
                    // await truncateTables();
                    await saveToDatabase(results);
                    console.log("CSV Data Imported Successfully");

                    fs.unlinkSync(filePath);

                    resolve();
                    console.timeEnd("CSV Processing Time");
                } catch (error) {
                    console.error("Error saving to database:", error);
                    reject(error);
                    console.timeEnd("CSV Processing Time");
                }
            })
            .on("error", (error) => {
                reject(error);
                console.timeEnd("CSV Processing Time");
            });
    });
};

const saveToDatabase = async (data) => {
    // Extract unique categories and subcategories
    const categoriesMap = new Map();
    const subCategoriesMap = new Map();
    const partsData = [];

    for (const row of data) {
        const categoryName = row["Category"]?.trim();
        const subCategoryName = row["Sub-category"]?.trim();
        const partNumber = row["Part No."]?.trim();

        if (!categoryName || !subCategoryName || !partNumber) {
            console.warn("Skipping row with missing required data:", row);
            continue;
        }

        categoriesMap.set(categoryName, true);
        const subCategoryKey = `${categoryName}:${subCategoryName}`;
        subCategoriesMap.set(subCategoryKey, { categoryName, subCategoryName });

        partsData.push({
            partNumber,
            categoryName,
            subCategoryName,
            datasheetLink: row["Datasheet Link (PDF)"]?.trim(),
            vdss: row["VDSS\nV"],
            vgs: row["VGS\nV"],
            vthMin: row["VTH\nMin\nV"],
            vthMax: row["VTH\nMax\nV"],
            idAt25: row["ID(A) / TA=25"],
            vthMaxValue: row["VTH(V) Max."],
            ron4_5v: row["Ron 4.5v\n(mΩ)Max."],
            ron10v: row["Ron 10v\n(mΩ)Max."]
        });
    }

    console.log(`Found ${categoriesMap.size} unique categories and ${subCategoriesMap.size} unique subcategories`);

    const categoryNames = Array.from(categoriesMap.keys());
    const existingCategories = await prisma.category.findMany({
        where: {
            name: { in: categoryNames }
        }
    });

    const existingCategoryNames = existingCategories.map(cat => cat.name);
    const categoriesToCreate = categoryNames.filter(name => !existingCategoryNames.includes(name));

    let createdCategories = [];
    if (categoriesToCreate.length > 0) {
        createdCategories = await prisma.$transaction(
            categoriesToCreate.map(name =>
                prisma.category.create({
                    data: { name }
                })
            )
        );
    }

    const allCategories = [...existingCategories, ...createdCategories];
    const categoryIdMap = new Map(allCategories.map(cat => [cat.name, cat.id]));

    const subCategoryKeys = Array.from(subCategoriesMap.keys());
    const subCategoryEntries = Array.from(subCategoriesMap.values());

    const existingSubCategories = await prisma.subCategory.findMany({
        where: {
            OR: subCategoryEntries.map(sc => ({
                name: sc.subCategoryName,
                categoryId: categoryIdMap.get(sc.categoryName)
            }))
        }
    });

    // Create a map of existing subcategories
    const existingSubCategoryMap = new Map(
        existingSubCategories.map(sc => {
            const category = allCategories.find(cat => cat.id === sc.categoryId);
            return [`${category.name}:${sc.name}`, sc];
        })
    );

    const subCategoriesToCreate = subCategoryKeys
        .filter(key => !existingSubCategoryMap.has(key))
        .map(key => {
            const { categoryName, subCategoryName } = subCategoriesMap.get(key);
            return {
                name: subCategoryName,
                categoryId: categoryIdMap.get(categoryName)
            };
        });

    let createdSubCategories = [];
    if (subCategoriesToCreate.length > 0) {
        createdSubCategories = await prisma.$transaction(
            subCategoriesToCreate.map(sc =>
                prisma.subCategory.create({
                    data: sc
                })
            )
        );
    }

    const allSubCategories = [...existingSubCategories, ...createdSubCategories];

    const subCategoryIdMap = new Map();
    for (const sc of allSubCategories) {
        const category = allCategories.find(cat => cat.id === sc.categoryId);
        subCategoryIdMap.set(`${category.name}:${sc.name}`, sc.id);
    }
    const partNumbers = partsData.map(p => p.partNumber);
    const existingParts = await prisma.part.findMany({
        where: {
            partNumber: { in: partNumbers }
        },
        include: {
            specifications: true
        }
    });

    const existingPartsMap = new Map(existingParts.map(p => [p.partNumber, p]));

    const batchSize = 50;
    const batches = Math.ceil(partsData.length / batchSize);

    console.log(`Processing parts in ${batches} batches of ${batchSize}`);

    for (let i = 0; i < batches; i++) {
        const start = i * batchSize;
        const end = Math.min(start + batchSize, partsData.length);
        const batch = partsData.slice(start, end);

        const operations = batch.map(partData => {
            const subCategoryId = subCategoryIdMap.get(`${partData.categoryName}:${partData.subCategoryName}`);
            const existingPart = existingPartsMap.get(partData.partNumber);

            const specData = {
                vdss: partData.vdss === "-" ? null : (partData.vdss ? parseFloat(partData.vdss) : null),
                vgs: partData.vgs === "-" ? null : (partData.vgs ? parseFloat(partData.vgs) : null),
                vthMin: partData.vthMin === "-" ? null : (partData.vthMin ? parseFloat(partData.vthMin) : null),
                vthMax: partData.vthMax === "-" ? null : (partData.vthMax ? parseFloat(partData.vthMax) : null),
                idAt25: partData.idAt25 === "-" ? null : (partData.idAt25 ? parseFloat(partData.idAt25) : null),
                vthMaxValue: partData.vthMaxValue === "-" ? null : (partData.vthMaxValue ? parseFloat(partData.vthMaxValue) : null),
                ron4_5v: partData.ron4_5v === "-" ? null : (partData.ron4_5v ? parseFloat(partData.ron4_5v) : null),
                ron10v: partData.ron10v === "-" ? null : (partData.ron10v ? parseFloat(partData.ron10v) : null),
                hasVdss: partData.vdss === "-",
                hasVgs: partData.vgs === "-",
                hasVthMin: partData.vthMin === "-",
                hasVthMax: partData.vthMax === "-",
                hasIdAt25: partData.idAt25 === "-",
                hasVthMaxValue: partData.vthMaxValue === "-",
                hasRon4_5v: partData.ron4_5v === "-",
                hasRon10v: partData.ron10v === "-"
            };

            if (existingPart) {
                return prisma.part.update({
                    where: { partNumber: partData.partNumber },
                    data: {
                        datasheetLink: partData.datasheetLink,
                        subCategoryId,
                        specifications: {
                            upsert: {
                                create: specData,
                                update: specData
                            }
                        }
                    }
                });
            } else {
                return prisma.part.create({
                    data: {
                        partNumber: partData.partNumber,
                        datasheetLink: partData.datasheetLink,
                        subCategoryId,
                        specifications: {
                            create: specData
                        }
                    }
                });
            }
        });

        await prisma.$transaction(operations);
        console.log(`Processed batch ${i + 1} of ${batches}`);
    }
    console.log("All parts processed successfully");
};