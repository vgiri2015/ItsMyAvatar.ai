const { HfInference } = require('@huggingface/inference');

class HuggingFaceService {
    constructor() {
        this.client = process.env.HUGGINGFACE_API_KEY ? 
            new HfInference(process.env.HUGGINGFACE_API_KEY) : null;
    }

    isConfigured() {
        return !!this.client;
    }

    async generateImage(prompt) {
        if (!this.isConfigured()) {
            throw new Error('HuggingFace is not configured');
        }

        try {
            const response = await this.client.textToImage({
                model: 'stabilityai/stable-diffusion-2',
                inputs: prompt,
            });

            // Convert blob to base64
            const buffer = await response.arrayBuffer();
            const base64 = Buffer.from(buffer).toString('base64');
            const url = `data:image/jpeg;base64,${base64}`;

            return {
                url,
                metadata: {
                    model: 'stable-diffusion-2',
                    provider: 'huggingface'
                }
            };
        } catch (error) {
            throw new Error(`HuggingFace image generation failed: ${error.message}`);
        }
    }
}

module.exports = HuggingFaceService;
