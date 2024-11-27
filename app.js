require('dotenv').config();
const express = require('express');
const path = require('path');
const aiGateway = require('./services/AIGateway');

const app = express();
const port = 3000;

// Utility for enhanced logging
const log = (level, message, details = {}) => {
  console.log(`[${new Date().toISOString()}] [${level.toUpperCase()}]: ${message}`, details);
};

app.use(express.json());
app.use(express.static('public'));

// Middleware for logging incoming requests
app.use((req, res, next) => {
  log('info', `Incoming request: ${req.method} ${req.url}`);
  next();
});

// Serve the HTML page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Generate image endpoint
app.post('/generate', async (req, res) => {
  try {
    const { prompt, provider } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      const error = 'Invalid prompt. Please provide a non-empty string.';
      log('warn', error, { prompt });
      return res.status(400).json({ error });
    }

    log('info', 'Processing image generation request', { prompt, provider });

    const result = await aiGateway.generateImage({ prompt, provider });

    if (!result || !result.url) {
      throw new Error('Invalid response from image generation service');
    }

    log('info', 'Image generated successfully', { provider: result.provider });
    res.json({
      success: true,
      url: result.url,
      provider: result.provider,
      metadata: result.metadata || {}
    });

  } catch (error) {
    log('error', 'Image generation failed', { 
      error: error.message, 
      stack: error.stack,
      prompt: req.body.prompt,
      provider: req.body.provider
    });

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate image'
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  log('error', 'Unhandled error', { error: err.message, stack: err.stack });
  res.status(500).json({ 
    success: false,
    error: 'Internal server error' 
  });
});

// Start the server
app.listen(port, () => {
  log('info', `Server running at http://localhost:${port}`);
});
