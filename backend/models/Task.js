const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
    },
    deadline: {
      type: Date,
      required: [true, "Deadline is required"],
    },
    category: {
      type: String,
      enum: ["Work", "Study", "Finance", "Health", "Personal"],
      default: "Work",
    },
    urgency: {
      type: Number,
      min: 1,
      max: 10,
      default: 5,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    aiTip: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);