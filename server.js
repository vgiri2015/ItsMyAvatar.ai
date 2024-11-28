// Load environment variables first
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file
const envPath = path.resolve(process.cwd(), '.env');
console.log('Loading environment variables from:', envPath);
const result = dotenv.config({ path: envPath });

if (result.error) {
    console.error('Error loading .env file:', result.error);
    throw result.error;
}

// Debug environment variables
console.log('Environment variables loaded:', {
    PORTKEY_API_KEY: process.env.PORTKEY_API_KEY ? '[PRESENT]' : '[MISSING]',
    HUGGINGFACE_API_KEY: process.env.HUGGINGFACE_API_KEY ? '[PRESENT]' : '[MISSING]',
    OPENAI_API_KEY: process.env.OPENAI_API_KEY ? '[PRESENT]' : '[MISSING]',
});

const express = require('express');
const portkeyGateway = require('./services/PortkeyGateway');
const aiGateway = require('./services/AIGateway');
const app = express();

// Avatar-specific settings for different providers
const avatarSettings = {
    openai: {
        model: 'dall-e-3',
        quality: 'hd',
        style: 'vivid'
    },
    huggingface: {
        model: 'stabilityai/stable-diffusion-xl-base-1.0',
        guidance_scale: 8.5,
        num_inference_steps: 50
    }
};

// Middleware to parse JSON bodies
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Image Generation API endpoint
app.post('/api/generate', async (req, res) => {
    try {
        const { prompt, provider, options = {} } = req.body;
        const { style = 'none', quality = 'standard', type = 'general' } = options;
        
        console.log('Received generation request:', {
            prompt,
            provider,
            options: {
                style,
                quality,
                type
            }
        });

        // Enhance prompt based on quality
        let enhancedPrompt = prompt;
        if (quality === 'hd') {
            enhancedPrompt += ', highly detailed, sharp focus, high resolution';
        } else if (quality === '4k') {
            enhancedPrompt += ', ultra high definition, extremely detailed, 4K resolution, maximum quality, sharp focus';
        }

        // Add style-specific enhancements for general images
        if (type === 'general') {
            const styleEnhancements = {
                anime: ', high quality anime artwork, detailed anime art style, vibrant colors, manga-inspired, professional anime illustration',
                photographic: ', professional photography, perfect lighting, high-end camera, photorealistic quality, masterful composition, 8k resolution',
                'digital-art': ', professional digital artwork, detailed digital painting, concept art quality, trending on artstation, vibrant colors, masterful digital illustration',
                'oil-painting': ', masterful oil painting, rich textures, traditional oil painting techniques, detailed brushwork, gallery quality artwork, fine art',
                watercolor: ', beautiful watercolor painting, delicate brushstrokes, artistic watercolor effects, traditional watercolor techniques, professional watercolor illustration'
            };

            if (styleEnhancements[style]) {
                enhancedPrompt += styleEnhancements[style];
            }

            // Add quality-specific details
            if (quality === 'hd' || quality === '4k') {
                enhancedPrompt += ', masterpiece, best quality, highly detailed';
            }
        }

        // Avatar-specific optimizations
        let providerSettings = {};
        if (type === 'avatar') {
            const avatarStyleEnhancements = {
                realistic: ', professional headshot portrait, photorealistic, 8k, detailed facial features, professional lighting, high-end camera, clean background',
                anime: ', high quality anime portrait, detailed anime character design, studio ghibli inspired, professional anime illustration, clean background',
                '3d': ', 3D rendered portrait, pixar style, high quality 3D character, detailed textures, professional 3D modeling, clean background',
                pixel: ', high quality pixel art portrait, 32-bit style, detailed pixel art character, professional pixel art, clean background'
            };

            if (avatarStyleEnhancements[style]) {
                enhancedPrompt += avatarStyleEnhancements[style];
            }

            providerSettings = avatarSettings[provider] || {};
            console.log('Using avatar settings:', providerSettings);
        }

        // Try Portkey Gateway first
        try {
            console.log('Attempting to generate with Portkey Gateway...');
            const result = await portkeyGateway.generateImage({
                prompt: enhancedPrompt,
                provider: provider || 'auto',
                options: {
                    size: '1024x1024',
                    quality,
                    type,
                    style,
                    ...providerSettings
                }
            });

            console.log('Portkey generation successful');
            
            return res.json({
                success: true,
                imageUrl: result.url,
                metadata: {
                    gateway: 'PortkeyGateway',
                    provider: result.provider,
                    model: portkeyGateway.providerMap[result.provider]?.model || result.model,
                    prompt: enhancedPrompt,
                    style,
                    quality,
                    type,
                    timestamp: new Date().toISOString()
                }
            });
        } catch (portkeyError) {
            console.error('Portkey Gateway failed:', portkeyError);
            console.log('Falling back to AI Gateway...');

            // Fallback to AI Gateway
            const result = await aiGateway.generateImage({
                prompt: enhancedPrompt,
                provider: provider || 'auto',
                options: {
                    size: '1024x1024',
                    quality,
                    type,
                    style,
                    ...providerSettings
                }
            });

            console.log('AI Gateway generation successful');
            
            return res.json({
                success: true,
                imageUrl: result.url,
                metadata: {
                    gateway: result.gateway || 'AIGateway',
                    provider: result.provider,
                    model: result.model,
                    prompt: enhancedPrompt,
                    style,
                    quality,
                    type,
                    timestamp: new Date().toISOString()
                }
            });
        }
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
    console.log(`Server running on port ${PORT}`);
});
