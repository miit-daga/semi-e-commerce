const express = require("express");
const prisma = require("../config/db.js");
const router = express.Router();

// Fetch products by category, subcategory, or part number
router.get("/", async (req, res) => {
    try {
        const { category, subcategory, partNumber } = req.query;

        let whereClause = {};

        if (category) {
            whereClause.subCategory = {
                category: { name: category },
            };
        }

        if (subcategory) {
            whereClause.subCategory = { name: subcategory };
        }

        if (partNumber) {
            whereClause.partNumber = partNumber;
        }

        const products = await prisma.part.findMany({
            where: whereClause,
            include: {
                subCategory: { include: { category: true } }, 
                specifications: true,
            },
        });

        res.json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
