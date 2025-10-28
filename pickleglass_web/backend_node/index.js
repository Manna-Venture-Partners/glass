const express = require('express');
const cors = require('cors');
// const db = require('./db'); // No longer needed
const { identifyUser } = require('./middleware/auth');
const UpdateService = require('./updateService');

function createApp(eventBridge) {
    const app = express();
    const updateService = new UpdateService();

    const webUrl = process.env.pickleglass_WEB_URL || 'http://localhost:3000';
    console.log(`🔧 Backend CORS configured for: ${webUrl}`);

    app.use(cors({
        origin: webUrl,
        credentials: true,
    }));

    app.use(express.json());

    app.get('/', (req, res) => {
        res.json({ message: "pickleglass API is running" });
    });

    // Update feed endpoint for electron-updater (generic provider)
    app.get('/updates', async (req, res) => {
        const platform = req.query.platform || 'darwin';
        const version = req.query.version || '0.2.4';

        console.log(`[UpdateFeed] Request from ${platform}, version ${version}`);

        try {
            const feed = await updateService.getUpdateFeed(platform, version);
            
            if (!feed || !feed.url) {
                // No update available
                return res.status(204).send();
            }

            // Return the update metadata
            res.json(feed);
        } catch (error) {
            console.error('[UpdateFeed] Error:', error);
            res.status(500).json({ error: 'Failed to check for updates' });
        }
    });

    app.use((req, res, next) => {
        req.bridge = eventBridge;
        next();
    });

    app.use('/api', identifyUser);

    app.use('/api/auth', require('./routes/auth'));
    app.use('/api/user', require('./routes/user'));
    app.use('/api/conversations', require('./routes/conversations'));
    app.use('/api/presets', require('./routes/presets'));

    app.get('/api/sync/status', (req, res) => {
        res.json({
            status: 'online',
            timestamp: new Date().toISOString(),
            version: '1.0.0'
        });
    });

    app.post('/api/desktop/set-user', (req, res) => {
        res.json({
            success: true,
            message: "Direct IPC communication is now used. This endpoint is deprecated.",
            user: req.body,
            deprecated: true
        });
    });

    app.get('/api/desktop/status', (req, res) => {
        res.json({
            connected: true,
            current_user: null,
            communication_method: "IPC",
            file_based_deprecated: true
        });
    });

    return app;
}

module.exports = createApp;
