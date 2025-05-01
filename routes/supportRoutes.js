const express = require('express');
const router = express.Router();
const { sendSupportEmail } = require("../controllers/supportController");

router.post("/send-support-email", sendSupportEmail);
router.post('/support', sendSupportEmail);


module.exports = router;
