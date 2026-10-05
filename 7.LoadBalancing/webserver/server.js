const express = require("express");
const { createClient } = require("redis");
const os = require("os");

const app = express();
const PORT = process.env.PORT || 5000;
const SERVER_NAME = process.env.SERVER_NAME || "unknown";
const REDIS_HOST = process.env.REDIS_HOST || "redis";

const redisClient = createClient({ url: `redis://${REDIS_HOST}:6379` });
redisClient.on("error", (err) => console.error("Redis error:", err.message));

app.get("/", async (req, res) => {
  try {
    const visits = await redisClient.incr("visits");
    res.send(`
      <html>
        <body style="font-family: Arial; text-align: center; margin-top: 80px;">
          <h1>Served by: ${SERVER_NAME}</h1>
          <p>Container hostname: ${os.hostname()}</p>
          <h2>Total visitors: ${visits}</h2>
        </body>
      </html>
    `);
  } catch (err) {
    res.status(500).send(`Error from ${SERVER_NAME}: ${err.message}`);
  }
});

(async () => {
  await redisClient.connect();
  app.listen(PORT, () =>
    console.log(`${SERVER_NAME} listening on port ${PORT}`),
  );
})();
