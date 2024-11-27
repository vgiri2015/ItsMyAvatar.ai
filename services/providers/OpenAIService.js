const OpenAI = require('openai');

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

    async generateImage(prompt) {
        if (!this.isConfigured()) {
            throw new Error('OpenAI is not configured');
        }

        try {
            const response = await this.client.images.generate({
                model: "dall-e-2",
                prompt: prompt,
                n: 1,
                size: "1024x1024",
                quality: "standard",
                response_format: "url"
            });

            if (!response.data || !response.data[0] || !response.data[0].url) {
                throw new Error('Invalid response from OpenAI API');
            }

            return {
                url: response.data[0].url,
                metadata: {
                    model: "dall-e-2",
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
