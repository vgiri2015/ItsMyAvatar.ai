require('dotenv').config();
const express = require('express');
const path = require('path');
const aiGateway = require('./services/AIGateway');
const app = express();

// Middleware to parse JSON bodies
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));

// Serve index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Image Generation API endpoint
app.post('/api/generate', async (req, res) => {
    try {
        const { provider, prompt, style, size, quality, sourceImage } = req.body;
        
        console.log('Received generation request:', {
            provider,
            prompt,
            style,
            size,
            quality,
            hasSourceImage: !!sourceImage
        });

        // Enhance the prompt with style and quality if provided
        let enhancedPrompt = prompt;
        if (style && style !== 'realistic') {
            enhancedPrompt = `${style} style: ${enhancedPrompt}`;
        }
        if (quality === 'hd' || quality === '4k') {
            enhancedPrompt = `${enhancedPrompt}, high quality, detailed`;
        }

        console.log('Enhanced prompt:', enhancedPrompt);

        // Generate image using AI Gateway
        const result = await aiGateway.generateImage({
            prompt: enhancedPrompt,
            provider: provider === 'all' ? undefined : provider,
            options: {
                size: size || '1024x1024',
                sourceImage: sourceImage,
                style,
                quality
            }
        });
        
        console.log('Generation successful:', {
            provider: result.provider,
            url: result.url
        });

        res.json({
            success: true,
            imageUrl: result.url,
            metadata: {
                provider: result.provider,
                prompt: enhancedPrompt,
                style,
                size,
                quality,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Error generating image:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    
    // Log available providers
    const providers = Object.keys(aiGateway.providers).filter(key => 
        aiGateway.providers[key].isConfigured()
    );
    console.log('Available providers:', providers);
});
