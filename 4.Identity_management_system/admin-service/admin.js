const express = require("express");
const dbconnect = require("./dbconnect.js");
const UserModel = require("./userModel.js");

const app = express();
app.use(express.json());

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

app.get("/searchuser", async (req, res) => {
  try {
    const { name, email } = req.query;

    if ((!name && !email) || (name && email)) {
      return res.status(400).json({
        message: "Provide exactly one query parameter: name or email",
      });
    }

    const query = email
      ? { email: String(email).trim().toLowerCase() }
      : { name: new RegExp(`^${escapeRegex(String(name).trim())}$`, "i") };
    const user = await UserModel.findOne(query);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error("Search user error:", error.message);
    return res.status(500).json({ message: "Unable to search for user" });
  }
});

app.get("/viewalluser", async (req, res) => {
  try {
    const users = await UserModel.find().sort({ createdAt: -1 });
    return res.status(200).json({ users });
  } catch (error) {
    console.error("View users error:", error.message);
    return res.status(500).json({ message: "Unable to retrieve users" });
  }
});

app.delete("/deluser", async (req, res) => {
  try {
    if (!req.query.email) {
      return res
        .status(400)
        .json({ message: "Email query parameter is required" });
    }

    const email = String(req.query.email).trim().toLowerCase();
    const deletedUser = await UserModel.findOneAndDelete({ email });

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "User deleted successfully",
      user: deletedUser,
    });
  } catch (error) {
    console.error("Delete user error:", error.message);
    return res.status(500).json({ message: "Unable to delete user" });
  }
});

const PORT = process.env.PORT || 5003;

async function startServer() {
  try {
    await dbconnect.connectDB();
    app.listen(PORT, () => {
      console.log(`Admin Service is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Admin Service failed to start:", error.message);
    process.exit(1);
  }
}

startServer();
