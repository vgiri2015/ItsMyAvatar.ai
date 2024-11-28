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
        const { style = 'none', size = '1024x1024', quality = 'standard' } = options;
        
        console.log('Received generation request:', {
            provider,
            prompt,
            options: {
                style,
                size,
                quality
            }
        });

        // Enhance the prompt based on style
        let enhancedPrompt = prompt;
        switch (style) {
            case 'anime':
                enhancedPrompt = `anime art style, ${prompt}, high quality anime artwork`;
                break;
            case 'photographic':
                enhancedPrompt = `photorealistic photograph, ${prompt}, professional photography, high resolution`;
                break;
            case 'digital-art':
                enhancedPrompt = `digital art style, ${prompt}, detailed digital illustration`;
                break;
            case 'oil-painting':
                enhancedPrompt = `oil painting style, ${prompt}, traditional oil painting, artistic, textured`;
                break;
            case 'watercolor':
                enhancedPrompt = `watercolor painting style, ${prompt}, soft watercolor artwork, artistic`;
                break;
            default:
                // No style modification for 'none'
                break;
        }

        // Add quality enhancement
        switch (quality) {
            case 'hd':
                enhancedPrompt = `${enhancedPrompt}, highly detailed, sharp focus, high resolution`;
                break;
            case '4k':
                enhancedPrompt = `${enhancedPrompt}, ultra high definition, extremely detailed, 4K resolution, maximum quality, sharp focus`;
                break;
            default:
                // No quality modification for 'standard'
                break;
        }

        console.log('Enhanced prompt:', enhancedPrompt);

        // Try Portkey Gateway first
        try {
            console.log('Attempting to generate image with Portkey Gateway...');
            const result = await portkeyGateway.generateImage({
                prompt: enhancedPrompt,
                provider: provider === 'all' ? undefined : provider,
                options: {
                    size,
                    quality
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
                    size,
                    quality,
                    timestamp: new Date().toISOString()
                }
            });
        } catch (portkeyError) {
            console.error('Portkey Gateway failed:', portkeyError);
            console.log('Falling back to AI Gateway...');

            // Fallback to AI Gateway
            const result = await aiGateway.generateImage({
                prompt: enhancedPrompt,
                provider: provider === 'all' ? undefined : provider,
                options: {
                    size,
                    quality
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
                    size,
                    quality,
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

// Image Edit API endpoint
app.post('/api/edit', async (req, res) => {
    try {
        const { imageUrl, originalProvider, options = {} } = req.body;
        const { style = 'none', quality = 'standard', colorAdjustments } = options;
        
        console.log('Received edit request:', {
            imageUrl,
            originalProvider,
            options: {
                style,
                quality,
                colorAdjustments
            }
        });

        // Create a prompt that describes the style transfer and adjustments
        let prompt = "Transform this exact image";
        
        // Add style description
        switch (style) {
            case 'anime':
                prompt = "Transform this exact image into anime art style while preserving the original composition and subject matter";
                break;
            case 'photographic':
                prompt = "Make this exact image photorealistic while maintaining the original composition and subject matter";
                break;
            case 'digital-art':
                prompt = "Convert this exact image into detailed digital art style while preserving the original composition and subject matter";
                break;
            case 'oil-painting':
                prompt = "Transform this exact image into an oil painting style while maintaining the original composition and subject matter";
                break;
            case 'watercolor':
                prompt = "Convert this exact image into a soft watercolor painting style while preserving the original composition and subject matter";
                break;
            default:
                // No style modification for 'none'
                break;
        }

        // Add color adjustment description if provided
        if (colorAdjustments) {
            const { brightness, contrast, saturation } = colorAdjustments;
            if (brightness !== 100) {
                prompt += brightness > 100 ? ", make it brighter" : ", make it darker";
            }
            if (contrast !== 100) {
                prompt += contrast > 100 ? ", increase contrast" : ", decrease contrast";
            }
            if (saturation !== 100) {
                prompt += saturation > 100 ? ", make colors more vibrant" : ", make colors more muted";
            }
        }

        // Add quality enhancement
        switch (quality) {
            case 'hd':
                prompt = `${prompt}, highly detailed, sharp focus, high resolution`;
                break;
            case '4k':
                prompt = `${prompt}, ultra high definition, extremely detailed, 4K resolution, maximum quality, sharp focus`;
                break;
            default:
                // No quality modification for 'standard'
                break;
        }

        // Ensure we're using the source image
        prompt += ", based on the provided reference image";

        console.log('Enhanced edit prompt:', prompt);

        // Try Portkey Gateway for editing
        try {
            console.log('Attempting to edit image with Portkey Gateway...');
            const result = await portkeyGateway.generateImage({
                prompt,
                provider: originalProvider || 'huggingface',
                options: {
                    size: '1024x1024',
                    quality,
                    sourceImage: imageUrl,
                    mode: 'edit', // Specify edit mode
                    strength: 0.8, // Control how much to preserve from the original image
                    guidanceScale: 7.5 // Control adherence to prompt
                }
            });

            console.log('Portkey edit successful');

            return res.json({
                success: true,
                imageUrl: result.url,
                metadata: {
                    gateway: 'PortkeyGateway',
                    provider: result.provider,
                    model: portkeyGateway.providerMap[result.provider]?.model || result.model,
                    prompt,
                    style,
                    quality,
                    colorAdjustments,
                    timestamp: new Date().toISOString()
                }
            });
        } catch (portkeyError) {
            console.error('Portkey Gateway failed:', portkeyError);
            console.log('Falling back to AI Gateway...');

            // Fallback to AI Gateway
            const result = await aiGateway.generateImage({
                prompt,
                provider: originalProvider || 'huggingface',
                options: {
                    size: '1024x1024',
                    quality,
                    sourceImage: imageUrl,
                    mode: 'edit', // Specify edit mode
                    strength: 0.8, // Control how much to preserve from the original image
                    guidanceScale: 7.5 // Control adherence to prompt
                }
            });

            console.log('AI Gateway edit successful');

            return res.json({
                success: true,
                imageUrl: result.url,
                metadata: {
                    gateway: result.gateway || 'AIGateway',
                    provider: result.provider,
                    model: result.model,
                    prompt,
                    style,
                    quality,
                    colorAdjustments,
                    timestamp: new Date().toISOString()
                }
            });
        }
    } catch (error) {
        console.error('Error editing image:', error);
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
