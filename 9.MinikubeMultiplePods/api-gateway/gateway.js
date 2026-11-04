const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 4000;
const LOGIN_SERVICE_URL = process.env.LOGIN_SERVICE_URL;
const REGISTRATION_SERVICE_URL = process.env.REGISTRATION_SERVICE_URL;

if (!LOGIN_SERVICE_URL) {
  throw new Error("LOGIN_SERVICE_URL is required");
}

if (!REGISTRATION_SERVICE_URL) {
  throw new Error("REGISTRATION_SERVICE_URL is required");
}

// Simple endpoint for checking that the API Gateway is running.
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Identity Management API Gateway is running",
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy" });
});

// Public URL: /register/userregister
// Forwarded URL: /userregister on the Registration Service.
app.use(
  "/register",
  createProxyMiddleware({
    target: REGISTRATION_SERVICE_URL,
    changeOrigin: true,
    on: {
      error(error, req, res) {
        console.error("Registration proxy error:", error.message);
        if (!res.headersSent) {
          res.writeHead(502, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({ message: "Registration service is unavailable" }),
          );
        }
      },
    },
  }),
);

// Public URL: /auth/login
// Forwarded URL: /login on the Login Service.
app.use(
  "/auth",
  createProxyMiddleware({
    target: LOGIN_SERVICE_URL,
    changeOrigin: true,
    on: {
      error(error, req, res) {
        console.error("Login proxy error:", error.message);
        if (!res.headersSent) {
          res.writeHead(502, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ message: "Login service is unavailable" }));
        }
      },
    },
  }),
);

app.use((req, res) => {
  res.status(404).json({ message: "Gateway route not found" });
});

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`API Gateway is running on port ${PORT}`);
  console.log(`Login target: ${LOGIN_SERVICE_URL}`);
  console.log(`Registration target: ${REGISTRATION_SERVICE_URL}`);
});

server.on("error", (error) => {
  console.error("API Gateway failed to start:", error.message);
  process.exit(1);
});
