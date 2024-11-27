const OpenAI = require('openai');
const sharp = require('sharp');

class OpenAIService {
    constructor() {
        // Clean up the API key by removing any whitespace
        const apiKey = process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.trim() : null;
        this.client = apiKey ? new OpenAI({
            apiKey: apiKey,
        }) : null;
    }

    isConfigured() {
        return !!this.client;
    }

    async generateImage(prompt, options = {}) {
        if (!this.isConfigured()) {
            throw new Error('OpenAI is not configured');
        }

        try {
            let response;
            
            if (options.sourceImage) {
                console.log('Source image provided, using image variation API');
                
                // Remove the data:image/[type];base64, prefix
                const base64Image = options.sourceImage.split(',')[1];
                console.log('Image data length:', base64Image.length);
                
                // Convert to PNG format (required by OpenAI)
                const imageBuffer = Buffer.from(base64Image, 'base64');
                const pngBuffer = await sharp(imageBuffer)
                    .resize(1024, 1024, { fit: 'contain' })
                    .png()
                    .toBuffer();
                
                // Create a variation of the uploaded image
                response = await this.client.images.createVariation({
                    image: pngBuffer,
                    n: 1,
                    size: "1024x1024",
                    response_format: "url"
                });
                console.log('Variation generated successfully');
            } else {
                console.log('No source image, using standard image generation');
                // Generate image from prompt
                response = await this.client.images.generate({
                    model: "dall-e-2",
                    prompt: prompt,
                    n: 1,
                    size: "1024x1024",
                    quality: "standard",
                    response_format: "url"
                });
            }

            if (!response.data || !response.data[0] || !response.data[0].url) {
                throw new Error('Invalid response from OpenAI API');
            }

            return {
                url: response.data[0].url,
                metadata: {
                    model: options.sourceImage ? "dall-e-variation" : "dall-e-2",
                    provider: "openai",
                    size: "1024x1024"
                }
            };
        } catch (error) {
            console.error('OpenAI error:', error);
            if (error.code === 'insufficient_quota') {
                throw new Error('OpenAI API quota exceeded. Please check your billing settings.');
            }
            throw new Error(`OpenAI image generation failed: ${error.message}`);
        }
    }
}

module.exports = OpenAIService;
