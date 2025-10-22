require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const path = require('path');

// Routes
const authRoutes = require('./routes/auth');
const protectedRoutes = require('./routes/protected');
const adminCoursesRoutes = require('./routes/adminCourses');
const uploadRoutes = require('./routes/upload');
const publicRoutes = require('./routes/public');
const progressRoutes = require('./routes/progress');

// Utils
const connectDB = require('./config/db');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./middleware/error');

// Create express app
const app = express();

// Connect to MongoDB
connectDB();
const port = process.env.PORT || 5001;

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      frameAncestors: ["'self'", "http://localhost:5173", "https://*.vercel.app"]
    }
  }
}));

//local development
// app.use(cors({
//   origin: process.env.FRONTEND_URL || 'http://localhost:5173',
//   credentials: true
// }));

//production
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api', protectedRoutes);
app.use('/api/admin', adminCoursesRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/student', progressRoutes);

// Root endpoint for backend
app.get('/', (req, res) => {
  res.json({ 
    message: 'Online Course Platform Backend API',
    status: 'running',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      courses: '/api/public/courses',
      admin: '/api/admin'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'public')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
  });
}

// Handle 404 - Keep this as the last route
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handler
app.use(globalErrorHandler);

// Start server
const server = app.listen(port, () => {
  console.log(`Server running on port ${port} in ${process.env.NODE_ENV || 'development'} mode`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! Shutting down...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

// Handle SIGTERM
process.on('SIGTERM', () => {
  console.log('SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('Process terminated!');
  });
});