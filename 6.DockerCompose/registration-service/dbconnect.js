// STEP-1 : IMPORT MONGOOSE PACKAGE
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI is missing from the .env file");
}

// Database Connection URL
const uri = process.env.MONGODB_URI;
// const uri = `mongodb://dananloeung_db_user:${db_password}@ac-irevfzj-shard-00-00.jh094ab.mongodb.net:27017,ac-irevfzj-shard-00-01.jh094ab.mongodb.net:27017,ac-irevfzj-shard-00-02.jh094ab.mongodb.net:27017/AUPP_Registration?ssl=true&replicaSet=atlas-u04hq6-shard-0&authSource=admin&appName=Cluster0`;

const clientOptions = {
  serverApi: { version: "1", strict: true, deprecationErrors: true },
};

async function connectDB() {
  try {
    // Create a Mongoose client with a MongoClientOptions object to set the Stable API version
    // STEP-2 : ESTABLISH CONNECTION WITH MONGODB DATABASE THROUGH MONGOOSE
    await mongoose.connect(uri, clientOptions);
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    throw error;
  }
}

// STEP-3 : EXPORT MODULE mongoose because we need it in other JS file
module.exports = { connectDB };
