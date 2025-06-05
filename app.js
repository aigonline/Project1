const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const path = require("path");

const AppError = require("./utils/appError.js");
const globalErrorHandler = require("./middleware/error.js");

// Import routes
const authRoutes = require("./routes/authRoutes.js");
const userRoutes = require("./routes/userRoutes.js");
const courseRoutes = require("./routes/courseRoutes.js");
const assignmentRoutes = require("./routes/assignmentRoutes.js");
const resourceRoutes = require("./routes/resourceRoutes.js");
const discussionRoutes = require("./routes/discussionRoutes.js");
const announcementRoutes = require("./routes/announcementRoutes.js");
const courseLinkRoutes = require("./routes/courseLinkRoutes.js");
const reportRoutes = require("./routes/reportRoutes.js");

const app = express();

// ✅ Fix for Express proxy & X-Forwarded-For issue
// Fixes 'trust proxy' misconfiguration
app.set("trust proxy", "loopback, linklocal, uniquelocal");

// ✅ Improved CORS configuration
app.use(cors({ origin: "*", credentials: true }));

// ✅ Security headers
app.use(helmet());
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "https://cdn.tailwindcss.com", "https://cdn.jsdelivr.net", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
            scriptSrcAttr: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "http://localhost:5000/uploads", "https://picsum.photos", "https://fastly.picsum.photos"],
            connectSrc: ["'self'", "http://localhost:5000", "http://127.0.0.1:5500"],
            fontSrc: ["'self'", "data:", "https://cdnjs.cloudflare.com"],
            objectSrc: ["'none'"],
            baseUri: ["'self'"]
        }
    })
);

// ✅ Development logging
if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}

// ✅ Rate limiting (prevents abuse)
const limiter = rateLimit({
  max: 1000, 
  windowMs: 60 * 60 * 1000, // 1 hour
  standardHeaders: true, // Sends `RateLimit-*` headers
  legacyHeaders: true,  // Disables deprecated `X-RateLimit-*` headers
  message: "Too many requests from this IP, please try again in an hour!"
});

app.use("/api", limiter);

// ✅ Middleware for parsing JSON & sanitizing data
app.use(express.json({ limit: "800kb" }));
app.use(mongoSanitize());

// ✅ Serve static files correctly
// ✅ Serve static files correctly
app.use(express.static(path.join(__dirname, "public")));
app.use("/static", express.static(path.join(__dirname, "static")));

// ✅ Serve uploaded files (add this!)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Route mounting
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/courses", courseRoutes);
app.use("/api/v1/assignments", assignmentRoutes);
app.use("/api/v1/resources", resourceRoutes);
app.use("/api/v1/discussions", discussionRoutes);
app.use("/api/v1/announcements", announcementRoutes);
app.use("/api/v1", courseLinkRoutes);
app.use("/api/v1/reports", reportRoutes);

// ✅ Serve frontend (fixes missing pages)


// ✅ Handle unknown API routes
app.all("/api/*", (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// ✅ Serve frontend for all other non-API, non-static routes
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// ✅ Global error handling
app.use(globalErrorHandler);

module.exports = app;
