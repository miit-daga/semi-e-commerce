require("dotenv").config();
const express = require("express");
const cors = require("cors");
const csvRoutes = require("./routes/csvRoutes");
const productRoutes = require("./routes/productRoutes");

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
    origin: "https://semi-ecommerce.netlify.app",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"]
}));


// Routes
app.use("/api/csv", csvRoutes);
app.use("/api/products", productRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
