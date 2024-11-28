const axios = require('axios');

class FireflyService {
    constructor(apiKey, clientId) {
        this.apiKey = apiKey;
        this.clientId = clientId;
        this.baseUrl = 'https://image.adobe.io/sensei/generate';
        this.headers = {
            'x-api-key': this.apiKey,
            'Authorization': `Bearer ${this.clientId}`,
            'Content-Type': 'application/json'
        };
    }

    async generateImage(prompt, options = {}) {
        try {
            const requestBody = {
                prompt: {
                    prompt: prompt,
                    n: options.n || 1,
                    size: options.size || { width: 1024, height: 1024 },
                    contentClass: "photo", // Can be "photo", "art", "graphic"
                    styles: options.styles || [],
                    negativePrompt: options.negativePrompt || "",
                },
                output: {
                    quality: options.quality || "standard", // "standard" or "premium"
                    format: options.format || "jpg"
                }
            };

            const response = await axios.post(
                this.baseUrl,
                requestBody,
                { headers: this.headers }
            );

            if (response.data && response.data.outputs) {
                return {
                    success: true,
                    images: response.data.outputs.map(output => ({
                        url: output.url,
                        seed: output.seed,
                        id: output.id
                    })),
                    provider: 'firefly'
                };
            }

            throw new Error('Invalid response format from Firefly API');

        } catch (error) {
            console.error('Firefly Image Generation Error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.error?.message || error.message,
                provider: 'firefly'
            };
        }
    }
}

module.exports = FireflyService;
