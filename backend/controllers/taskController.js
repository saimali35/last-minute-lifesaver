const Task = require("../models/Task");

// GET /api/tasks — get all tasks
const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find().sort({ urgency: -1, createdAt: -1 });
    res.json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/tasks — create a task
const createTask = async (req, res) => {
  try {
    const { title, deadline, category, urgency, aiTip } = req.body;
    const task = await Task.create({ title, deadline, category, urgency, aiTip });
    res.status(201).json({ success: true, data: task });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// PUT /api/tasks/:id — update a task
const updateTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });
    res.json({ success: true, data: task });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE /api/tasks/:id — delete a task
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });
    res.json({ success: true, message: "Task deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask };