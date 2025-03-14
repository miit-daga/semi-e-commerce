const csvImportService = require("../services/csvImport");

exports.uploadCSV = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        await csvImportService.processCSV(req.file.path);

        res.status(200).json({ message: "CSV uploaded and processed successfully" });
    } catch (error) {
        console.error("CSV Upload Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
