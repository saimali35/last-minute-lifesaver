const express = require("express");
const router  = express.Router();
const { scoreTask, chat } = require("../controllers/aiController");

router.post("/score",  scoreTask);
router.post("/chat",   chat);

module.exports = router;