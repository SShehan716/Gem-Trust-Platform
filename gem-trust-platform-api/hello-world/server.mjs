import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Routes
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to Gem Trust Platform Backend!',
        timestamp: new Date().toISOString(),
        status: 'success',
        endpoints: {
            hello: '/hello',
            health: '/health',
            api: '/api'
        }
    });
});

app.get('/hello', (req, res) => {
    res.json({
        message: 'Hello from Gem Trust Platform Backend!',
        timestamp: new Date().toISOString(),
        status: 'success'
    });
});

app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'gem-trust-platform-api',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

app.get('/api', (req, res) => {
    res.json({
        message: 'API endpoint working!',
        timestamp: new Date().toISOString(),
        status: 'success'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: 'The requested resource was not found',
        path: req.originalUrl
    });
});

// Start server
app.listen(PORT, HOST, () => {
    console.log(`🚀 Backend server running on http://${HOST}:${PORT}`);
    console.log(`📡 Health check: http://${HOST}:${PORT}/health`);
    console.log(`🌐 Hello endpoint: http://${HOST}:${PORT}/hello`);
    console.log(`🔌 API endpoint: http://${HOST}:${PORT}/api`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    process.exit(0);
});
