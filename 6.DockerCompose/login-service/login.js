const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const dbconnect = require("./dbconnect.js");
const UserModel = require("./userModel.js");

const app = express();
app.use(express.json());

const JWT_SECRETE = process.env.JWT_SECRETE;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";

app.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password ||
      !role
    ) {
      return res.status(400).json({
        message: "Email, password, and role are required",
      });
    }

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({
        message: "Role must be either user or admin",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({ message: "Enter a valid email address" });
    }

    const user = await UserModel.findOne({
      email: normalizedEmail,
      role,
    }).select("+password");

    const passwordMatches = user
      ? await bcrypt.compare(password, user.password)
      : false;

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid email, password, or role",
      });
    }

    const token = jwt.sign(
      { email: user.email, role: user.role },
      JWT_SECRETE,
      { expiresIn: JWT_EXPIRES_IN },
    );

    return res.status(200).json({ token, message: "Login successful" });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({ message: "Unable to log in" });
  }
});

const PORT = process.env.PORT || 5002;

async function startServer() {
  try {
    if (!JWT_SECRETE) {
      throw new Error("JWT_SECRETE is missing from the .env file");
    }

    await dbconnect.connectDB();
    app.listen(PORT, () => {
      console.log(`Authentication Service is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Authentication Service failed to start:", error.message);
    process.exit(1);
  }
}

startServer();
