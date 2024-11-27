const { HfInference } = require('@huggingface/inference');

class HuggingFaceService {
    constructor() {
        this.client = process.env.HUGGINGFACE_API_KEY ? 
            new HfInference(process.env.HUGGINGFACE_API_KEY) : null;
        
        // Use a more reliable model for image generation
        this.model = 'runwayml/stable-diffusion-v1-5';
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
                model: this.model,
                inputs: prompt,
                parameters: {
                    negative_prompt: "blurry, bad quality, distorted",
                    num_inference_steps: 30,
                    guidance_scale: 7.5
                }
            });

            // Convert blob to base64
            const buffer = await response.arrayBuffer();
            const base64 = Buffer.from(buffer).toString('base64');
            const url = `data:image/jpeg;base64,${base64}`;

            return {
                url,
                metadata: {
                    model: this.model,
                    provider: 'huggingface'
                }
            };
        } catch (error) {
            console.error('HuggingFace error:', error);
            throw new Error(`HuggingFace image generation failed: ${error.message}`);
        }
    }
}

module.exports = HuggingFaceService;
