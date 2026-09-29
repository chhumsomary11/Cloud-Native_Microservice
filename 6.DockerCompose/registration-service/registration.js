const express = require("express");
const bcrypt = require("bcryptjs");
const dbconnect = require("./dbconnect.js");
const UserModel = require("./userModel.js");

const app = express();
app.use(express.json());

app.post("/userregister", async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !name.trim() ||
      !email.trim() ||
      !password ||
      !role
    ) {
      return res.status(400).json({
        message: "Name, email, password, and role are required",
      });
    }

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({
        message: "Role must be either user or admin",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must contain at least 6 characters",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({ message: "Enter a valid email address" });
    }

    const existingUser = await UserModel.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await UserModel.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      phone,
      role,
    });

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Email already registered" });
    }

    console.error("Registration error:", error.message);
    return res.status(500).json({ message: "Unable to register user" });
  }
});

const PORT = process.env.PORT || 5001;

async function startServer() {
  try {
    await dbconnect.connectDB();
    app.listen(PORT, () => {
      console.log(`Registration Service is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Registration Service failed to start:", error.message);
    process.exit(1);
  }
}

startServer();
