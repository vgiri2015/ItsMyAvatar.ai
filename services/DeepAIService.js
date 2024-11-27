const axios = require('axios');

class DeepAIService {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseURL = 'https://api.deepai.org/api';
    }

    async generateImage(prompt) {
        try {
            const response = await axios.post(`${this.baseURL}/text2img`, {
                text: prompt,
            }, {
                headers: {
                    'api-key': this.apiKey,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data && response.data.output_url) {
                return {
                    success: true,
                    url: response.data.output_url,
                    provider: 'deepai'
                };
            } else {
                throw new Error('Invalid response from DeepAI API');
            }
        } catch (error) {
            console.error('DeepAI API Error:', error.message);
            return {
                success: false,
                error: error.message,
                provider: 'deepai'
            };
        }
    }
}

module.exports = DeepAIService;
