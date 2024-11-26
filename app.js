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

// Check for required API keys
if (!process.env.OPENAI_API_KEY) {
  log('warn', 'OpenAI API key is not configured');
}

app.use(express.json());
app.use(express.static('public'));

// Middleware for logging incoming requests
app.use((req, res, next) => {
  log('info', `Incoming request: ${req.method} ${req.url}`);
  next();
});

// Serve the HTML page
app.get('/', (req, res) => {
  log('info', 'Serving index.html');
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Generate image endpoint
app.post('/generate', async (req, res) => {
  try {
    const { prompt, providers } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      log('warn', 'Invalid prompt received in request', { prompt });
      return res.status(400).json({ error: 'Invalid prompt. Please provide a valid string.' });
    }

    log('info', 'Received prompt for image generation', { prompt, providers });

    const result = await aiGateway.generateImage(prompt, { providers });
    
    log('info', 'Image generated successfully', { result });
    res.json({ imageUrl: result.url, metadata: result.metadata });
  } catch (error) {
    log('error', 'Error during image generation', { error: error.message, stack: error.stack });
    res.status(500).json({ error: error.message || 'Failed to generate image' });
  }
});

// Start the server
app.listen(port, () => {
  log('info', `Server running at http://localhost:${port}`);
});
