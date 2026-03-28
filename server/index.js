const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const config = require('./config');
const searchRoutes = require('./routes/search');

const app = express();

// Trust reverse proxy (e.g., Render, Heroku) for accurate IP tracking
app.set('trust proxy', 1);

// Security Headers
app.use(helmet());

// Web requests Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again after 15 minutes',
  },
  standardHeaders: true, 
  legacyHeaders: false,
});

// Apply rate limiting to all API routes
app.use('/api', apiLimiter);

// CORS
app.use(cors({
  origin: [
    config.frontendUrl,
    'http://localhost:5173',
    'http://localhost:3000',
    /\.vercel\.app$/,
    /\.netlify\.app$/,
  ],
  credentials: true,
}));

// Parsing
app.use(express.json());

// Prevent HTTP Parameter Pollution
app.use(hpp());

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.path.startsWith('/api')) {
      console.log(`${req.method} ${req.path} → ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// API routes
app.use('/api', searchRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'WebGrade API',
    version: '1.0.0',
    description: 'Live product comparison & grading platform',
    endpoints: {
      search: 'GET /api/search?q=<query>',
      sources: 'GET /api/sources',
      health: 'GET /api/health',
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('💥 Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
});

// Start server
app.listen(config.port, () => {
  console.log('');
  console.log('═══════════════════════════════════════');
  console.log('  🚀 WebGrade API Server');
  console.log(`  📡 Running on http://localhost:${config.port}`);
  console.log(`  🌐 Frontend URL: ${config.frontendUrl}`);
  console.log(`  🔧 Environment: ${config.nodeEnv}`);
  console.log('═══════════════════════════════════════');
  console.log('');
});

module.exports = app;
