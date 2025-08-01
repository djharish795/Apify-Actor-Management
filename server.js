const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Apify API base URL
const APIFY_API_BASE = 'https://api.apify.com/v2';

// Helper function to make Apify API calls
async function apifyRequest(endpoint, options = {}) {
    const config = {
        ...options,
        url: `${APIFY_API_BASE}${endpoint}`,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    };

    try {
        const response = await axios(config);
        return response.data;
    } catch (error) {
        if (error.response) {
            throw new Error(error.response.data.error?.message || 'API request failed');
        }
        throw new Error('Network error occurred');
    }
}

// Authentication endpoint
app.post('/api/authenticate', async (req, res) => {
    try {
        const { apiKey } = req.body;

        if (!apiKey) {
            return res.status(400).json({ error: 'API key is required' });
        }

        // Test the API key by fetching user info
        await apifyRequest('/users/me', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${apiKey}` }
        });

        res.json({ success: true, message: 'Authentication successful' });
    } catch (error) {
        res.status(401).json({ error: 'Invalid API key or authentication failed' });
    }
});

// Get user's actors
app.get('/api/actors', async (req, res) => {
    try {
        const apiKey = req.headers.authorization?.replace('Bearer ', '');
        
        if (!apiKey) {
            return res.status(401).json({ error: 'API key required' });
        }

        const data = await apifyRequest('/acts', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${apiKey}` }
        });

        const actors = data.data.items.map(actor => ({
            id: actor.id,
            name: actor.name,
            username: actor.username,
            description: actor.description,
            title: actor.title,
            isPublic: actor.isPublic
        }));

        res.json({ actors });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get actor input schema
app.get('/api/actors/:actorId/schema', async (req, res) => {
    try {
        const { actorId } = req.params;
        const apiKey = req.headers.authorization?.replace('Bearer ', '');

        if (!apiKey) {
            return res.status(401).json({ error: 'API key required' });
        }

        // Get actor details to fetch input schema
        const actorData = await apifyRequest(`/acts/${actorId}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${apiKey}` }
        });

        // Extract input schema
        const schema = actorData.data.inputSchema || {
            type: 'object',
            properties: {
                startUrls: {
                    type: 'array',
                    title: 'Start URLs',
                    description: 'List of URLs to crawl'
                }
            }
        };

        res.json({ schema, actor: actorData.data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Execute actor run
app.post('/api/actors/:actorId/run', async (req, res) => {
    try {
        const { actorId } = req.params;
        const { inputs } = req.body;
        const apiKey = req.headers.authorization?.replace('Bearer ', '');

        if (!apiKey) {
            return res.status(401).json({ error: 'API key required' });
        }

        const startTime = Date.now();

        // Start actor run
        const runData = await apifyRequest(`/acts/${actorId}/runs`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${apiKey}` },
            data: inputs
        });

        const runId = runData.data.id;

        // Wait for run completion with polling
        let runStatus = 'RUNNING';
        let attempts = 0;
        const maxAttempts = 60; // 5 minutes maximum wait time

        while (runStatus === 'RUNNING' && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
            
            const statusData = await apifyRequest(`/acts/${actorId}/runs/${runId}`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${apiKey}` }
            });

            runStatus = statusData.data.status;
            attempts++;
        }

        if (runStatus === 'RUNNING') {
            return res.json({
                runId,
                status: 'TIMEOUT',
                message: 'Run is still in progress. Please check manually.',
                duration: Date.now() - startTime
            });
        }

        // Fetch results if completed successfully
        let results = [];
        if (runStatus === 'SUCCEEDED') {
            try {
                const resultsData = await apifyRequest(`/acts/${actorId}/runs/${runId}/dataset/items`, {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${apiKey}` }
                });
                results = resultsData;
            } catch (resultsError) {
                console.warn('Could not fetch results:', resultsError.message);
            }
        }

        res.json({
            runId,
            status: runStatus,
            results: results.slice(0, 10), // Limit to first 10 results for display
            duration: Date.now() - startTime
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🕷️ Apify Web App running on http://localhost:${PORT}`);
    console.log(`📝 Ready for intern assignment submission!`);
});