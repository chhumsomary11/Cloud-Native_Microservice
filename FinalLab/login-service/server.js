const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Student = require("./student.model");

const app = express();
app.use(express.json());

app.get("/health", (req, res) => res.json({ status: "healthy" }));

app.post("/students/login", async (req, res) => {
  try {
    const { student_email, student_password } = req.body;
    if (!student_email || !student_password) {
      return res.status(400).json({ message: "Student email and password are required" });
    }

    const student = await Student.findOne({
      student_email: String(student_email).trim().toLowerCase(),
    }).select("+student_password");

    const matches = student
      ? await bcrypt.compare(String(student_password), student.student_password)
      : false;
    if (!matches) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { student_id: student.student_id, student_email: student.student_email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1h" },
    );

    return res.json({
      message: "Login successful",
      token,
      student: {
        student_id: student.student_id,
        student_name: student.student_name,
        student_email: student.student_email,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({ message: "Login failed" });
  }
});

async function start() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is required");
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is required");
  await mongoose.connect(process.env.MONGODB_URI);
  app.listen(process.env.PORT || 5002, "0.0.0.0", () => {
    console.log("Login service listening on port 5002");
  });
}

start().catch((error) => {
  console.error("Login service startup failed:", error.message);
  process.exit(1);
});
