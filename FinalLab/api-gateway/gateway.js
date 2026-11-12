const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
const port = process.env.PORT || 4000;
const registrationUrl = process.env.REGISTRATION_SERVICE_URL || "http://localhost:5001";
const loginUrl = process.env.LOGIN_SERVICE_URL || "http://login-service:5002";

function proxyError(serviceName) {
  return (error, req, res) => {
    console.error(`${serviceName} proxy error:`, error.message);
    if (!res.headersSent) {
      res.writeHead(502, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: `${serviceName} is unavailable` }));
    }
  };
}

app.get("/", (req, res) => {
  res.json({ message: "Student Management API Gateway is running" });
});

app.get("/health", (req, res) => res.json({ status: "healthy" }));

// POST /api/students/register -> POST /students/register
app.use(
  "/api",
  createProxyMiddleware({
    target: registrationUrl,
    changeOrigin: true,
    pathFilter: "/students/register",
    on: { error: proxyError("Registration service") },
  }),
);

// POST /api/students/login -> POST /students/login
app.use(
  "/api",
  createProxyMiddleware({
    target: loginUrl,
    changeOrigin: true,
    pathFilter: "/students/login",
    on: { error: proxyError("Login service") },
  }),
);

app.use((req, res) => res.status(404).json({ message: "Gateway route not found" }));

app.listen(port, "0.0.0.0", () => {
  console.log(`API Gateway listening on port ${port}`);
});
