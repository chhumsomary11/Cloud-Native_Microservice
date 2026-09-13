const express = require("express");
const jwt = require("jsonwebtoken");
const { createProxyMiddleware } = require("http-proxy-middleware");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 4000;

if (!process.env.JWT_SECRETE) {
  throw new Error("JWT_SECRETE is missing from the .env file");
}

// Validate JWT
function authenticateToken(req, res, next) {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Access denied. No token provided",
    });
  }

  const token = authorization.split(" ")[1];

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRETE);
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token expired",
      });
    }

    return res.status(401).json({
      message: "Invalid or tampered token",
    });
  }
}

// Check role
function allowRole(requiredRole) {
  return (req, res, next) => {
    if (req.user.role !== requiredRole) {
      return res.status(403).json({
        message: `${requiredRole} access only`,
      });
    }

    next();
  };
}

function authenticatedProxy(target) {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    on: {
      proxyReq(proxyReq, req) {
        proxyReq.setHeader("x-auth-email", req.user.email);
        proxyReq.setHeader("x-auth-role", req.user.role);
      },
    },
  });
}

// Registration service: no token required
app.use(
  "/register",
  createProxyMiddleware({
    target: process.env.REGISTRATION_SERVICE_URL,
    changeOrigin: true,
  }),
);

// Login service: no token required
app.use(
  "/auth",
  createProxyMiddleware({
    target: process.env.LOGIN_SERVICE_URL,
    changeOrigin: true,
  }),
);

// Admin service: admin token required
app.use(
  "/admin",
  authenticateToken,
  allowRole("admin"),
  authenticatedProxy(process.env.ADMIN_SERVICE_URL),
);

// User service: user token required
app.use(
  "/user",
  authenticateToken,
  allowRole("user"),
  authenticatedProxy(process.env.USER_SERVICE_URL),
);

// Gateway test route
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Identity Management API Gateway is running",
  });
});

// Proxy errors
app.use((error, req, res, next) => {
  console.error("Gateway error:", error.message);

  res.status(502).json({
    message: "Microservice is unavailable",
  });
});

app.listen(PORT, () => {
  console.log(`API Gateway Service is running on port ${PORT}`);
});
