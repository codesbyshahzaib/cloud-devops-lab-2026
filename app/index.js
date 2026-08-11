const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Health Check API
app.get('/health', (req, res) => {
    res.json({
        status: 'UP',
        timestamp: new Date(),
        uptime: process.uptime()
    });
});

// Info API
app.get('/api/info', (req, res) => {
    res.json({
        appName: 'DevOps Mini Project App',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'production',
        author: 'Tkxel DevOps Intern'
    });
});

// Start server if not in test mode
if (process.env.NODE_ENV !== 'test') {
    app.listen(port, () => {
        console.log(`Application running on port ${port}`);
    });
}

module.exports = app;
