const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');

const AppError = require('./utils/appError.js');
const globalErrorHandler = require('./middleware/error.js');

// Import routes
const authRoutes = require('./routes/authRoutes.js');
const userRoutes = require('./routes/userRoutes.js');
const courseRoutes = require('./routes/courseRoutes.js');
const assignmentRoutes = require('./routes/assignmentRoutes.js');
const resourceRoutes = require('./routes/resourceRoutes.js');
const discussionRoutes = require('./routes/discussionRoutes.js');
const announcementRoutes = require('./routes/announcementRoutes.js');
const courseLinkRoutes = require('./routes/courseLinkRoutes.js');
const app = express();

app.set("trust proxy", 1);
// Global middleware
// CORS
app.use(cors());
app.use(cors({ origin: "*", credentials: true }));

app.use(express.static('public'));  // Or your actual static files directory
app.use('/static', express.static(path.join(__dirname, 'static')));

// Set security HTTP headers
app.use(helmet());
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'", 
        "https://cdn.tailwindcss.com", 
        "https://cdn.jsdelivr.net", 
        "'unsafe-inline'"
      ],
      styleSrc: [
        "'self'", 
        "'unsafe-inline'", 
        "https://cdnjs.cloudflare.com"
      ],
      scriptSrcAttr: ["'self'", "'unsafe-inline'"],
      imgSrc: [
        "'self'", 
        "data:", 
        "https://picsum.photos", 
        "https://fastly.picsum.photos"
      ],
      connectSrc: ["'self'", "http://localhost:5000"],
      fontSrc: [
        "'self'",
        "data:",
        "https://cdnjs.cloudflare.com"  // If using Font Awesome from CDN
      ],
      // Add these missing directives
      objectSrc: ["'none'"],
      baseUri: ["'self'"]
    }
  })
);

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}




// Rate limiting
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000, // 1 hour
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

// Body parser
app.use(express.json({ limit: '10kb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

app.use(express.static(path.join(__dirname, 'Project1')));

// Mount routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/courses', courseRoutes);
app.use('/api/v1/assignments', assignmentRoutes);
app.use('/api/v1/resources', resourceRoutes);
app.use('/api/v1/discussions', discussionRoutes);
app.use('/api/v1/announcements', announcementRoutes);
app.use('/api/v1/', courseLinkRoutes);


app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});
app.use(express.static(path.join(__dirname, 'css')));
// Handle 404 routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handler
app.use(globalErrorHandler);


module.exports = app;