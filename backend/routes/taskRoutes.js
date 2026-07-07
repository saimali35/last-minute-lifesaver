const express = require("express");
const router  = express.Router();
const { getTasks, createTask, updateTask, deleteTask } = require("../controllers/taskController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect); // every route below requires a valid JWT

router.get("/",       getTasks);
router.post("/",      createTask);
router.put("/:id",    updateTask);
router.delete("/:id", deleteTask);

module.exports = router;