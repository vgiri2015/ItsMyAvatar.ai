const OpenAI = require('openai');

class OpenAIService {
    constructor() {
        this.client = process.env.OPENAI_API_KEY ? new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        }) : null;
    }

    isConfigured() {
        return !!this.client;
    }

    async generateImage(prompt) {
        if (!this.isConfigured()) {
            throw new Error('OpenAI is not configured');
        }

        const response = await this.client.images.generate({
            model: "dall-e-3",
            prompt: prompt,
            n: 1,
            size: "1024x1024",
        });

        if (!response.data || !response.data[0] || !response.data[0].url) {
            throw new Error('Invalid response from OpenAI API');
        }

        return {
            url: response.data[0].url,
            metadata: {
                model: "dall-e-3",
                provider: "openai"
            }
        };
    }
}

module.exports = OpenAIService;
