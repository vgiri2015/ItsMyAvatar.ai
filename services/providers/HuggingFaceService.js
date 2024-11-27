const axios = require('axios');

class HuggingFaceService {
    constructor(apiKey) {
        this.apiKey = apiKey;
        // Using a more reliable and faster model
        this.baseURL = 'https://api-inference.huggingface.co/models/CompVis/stable-diffusion-v1-4';
        this.maxRetries = 3;
        this.retryDelay = 10000; // 10 seconds
    }

    isConfigured() {
        return !!this.apiKey;
    }

    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async generateImage(prompt) {
        if (!this.isConfigured()) {
            throw new Error('HuggingFace is not configured');
        }

        let lastError = null;
        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                console.log(`Making request to HuggingFace with prompt (attempt ${attempt}/${this.maxRetries}):`, prompt);

                const response = await axios({
                    method: 'post',
                    url: this.baseURL,
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    data: {
                        inputs: prompt,
                        parameters: {
                            num_inference_steps: 30,
                            guidance_scale: 7.5,
                            width: 512,
                            height: 512
                        }
                    },
                    responseType: 'arraybuffer',
                    validateStatus: status => status === 200 || status === 503
                });

                // If model is loading, wait and retry
                if (response.status === 503) {
                    console.log('Model is loading, waiting before retry...');
                    await this.sleep(this.retryDelay);
                    continue;
                }

                // Convert buffer to base64
                const base64Image = Buffer.from(response.data).toString('base64');
                const imageUrl = `data:image/jpeg;base64,${base64Image}`;

                return {
                    url: imageUrl,
                    metadata: {
                        model: "stable-diffusion-v1-4",
                        provider: "huggingface",
                        size: "512x512"
                    }
                };
            } catch (error) {
                console.error(`HuggingFace error (attempt ${attempt}/${this.maxRetries}):`, error);
                lastError = error;

                if (attempt < this.maxRetries) {
                    console.log('Waiting before retry...');
                    await this.sleep(this.retryDelay);
                }
            }
        }

        throw new Error(`HuggingFace failed after ${this.maxRetries} attempts: ${lastError.message}`);
    }
}

module.exports = HuggingFaceService;
