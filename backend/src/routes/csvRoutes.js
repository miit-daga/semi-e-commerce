const express = require("express");
const multer = require("multer");
const csvController = require("../controllers/csvController");

const router = express.Router();

const upload = multer({ dest: "uploads/" });

router.post("/upload", upload.single("csvFile"), csvController.uploadCSV);

module.exports = router;
