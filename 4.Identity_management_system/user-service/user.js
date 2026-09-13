const express = require("express");
const dbconnect = require("./dbconnect.js");
const UserModel = require("./userModel.js");

const app = express();
app.use(express.json());

function authenticatedEmail(req, res) {
  const email = req.headers["x-auth-email"];

  if (!email) {
    res.status(401).json({ message: "Authenticated user identity is missing" });
    return null;
  }

  return String(email).trim().toLowerCase();
}

app.get("/viewprofile", async (req, res) => {
  try {
    const email = authenticatedEmail(req, res);
    if (!email) return;

    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error("View profile error:", error.message);
    return res.status(500).json({ message: "Unable to retrieve profile" });
  }
});

app.put("/updateprofile", async (req, res) => {
  try {
    const email = authenticatedEmail(req, res);
    if (!email) return;

    const suppliedFields = Object.keys(req.body);
    const allowedFields = ["name", "phone"];
    const unsupportedFields = suppliedFields.filter(
      (field) => !allowedFields.includes(field),
    );

    if (suppliedFields.length === 0) {
      return res.status(400).json({
        message: "Provide at least one field to update: name or phone",
      });
    }

    if (unsupportedFields.length > 0) {
      return res.status(400).json({
        message: `Fields cannot be updated: ${unsupportedFields.join(", ")}`,
      });
    }

    if (req.body.name !== undefined && !String(req.body.name).trim()) {
      return res.status(400).json({ message: "Name cannot be empty" });
    }

    const updates = {};
    if (req.body.name !== undefined) updates.name = String(req.body.name).trim();
    if (req.body.phone !== undefined) updates.phone = String(req.body.phone).trim();

    const user = await UserModel.findOneAndUpdate({ email }, updates, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update profile error:", error.message);
    return res.status(500).json({ message: "Unable to update profile" });
  }
});

const PORT = process.env.PORT || 5004;

async function startServer() {
  try {
    await dbconnect.connectDB();
    app.listen(PORT, () => {
      console.log(`User Service is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("User Service failed to start:", error.message);
    process.exit(1);
  }
}

startServer();
