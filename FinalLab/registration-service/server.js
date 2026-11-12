const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Student = require("./student.model");

const app = express();
app.use(express.json());

app.get("/health", (req, res) => res.json({ status: "healthy" }));

app.post("/students/register", async (req, res) => {
  try {
    const {
      student_id,
      student_name,
      student_mobile,
      student_email,
      student_password,
    } = req.body;

    if (![student_id, student_name, student_mobile, student_email, student_password].every(
      (value) => typeof value === "string" && value.trim(),
    )) {
      return res.status(400).json({ message: "All student fields are required" });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(student_email)) {
      return res.status(400).json({ message: "Student email is invalid" });
    }
    if (student_password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const student = await Student.create({
      student_id: student_id.trim(),
      student_name: student_name.trim(),
      student_mobile: student_mobile.trim(),
      student_email: student_email.trim().toLowerCase(),
      student_password: await bcrypt.hash(student_password, 10),
    });

    return res.status(201).json({
      message: "Student registered successfully",
      student: {
        student_id: student.student_id,
        student_name: student.student_name,
        student_mobile: student.student_mobile,
        student_email: student.student_email,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Student ID or email already exists" });
    }
    console.error("Registration error:", error.message);
    return res.status(500).json({ message: "Registration failed" });
  }
});

async function start() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is required");
  await mongoose.connect(process.env.MONGODB_URI);
  app.listen(process.env.PORT || 5001, "0.0.0.0", () => {
    console.log("Registration service listening on port 5001");
  });
}

start().catch((error) => {
  console.error("Registration service startup failed:", error.message);
  process.exit(1);
});
