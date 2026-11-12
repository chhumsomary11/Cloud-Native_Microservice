const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    student_id: { type: String, required: true, unique: true, trim: true },
    student_name: { type: String, required: true, trim: true },
    student_mobile: { type: String, required: true, trim: true },
    student_email: { type: String, required: true, unique: true, lowercase: true },
    student_password: { type: String, required: true, select: false },
  },
  { timestamps: true, collection: "students" },
);

module.exports = mongoose.models.Student || mongoose.model("Student", studentSchema);
