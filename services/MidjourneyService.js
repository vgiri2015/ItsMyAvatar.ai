const axios = require('axios');

class MidjourneyService {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseURL = 'https://api.midjourney.com/v1';
    }

    async generateImage(prompt) {
        try {
            const response = await axios.post(`${this.baseURL}/imagine`, {
                prompt: prompt,
                version: 'v4'
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data && response.data.imageUrl) {
                return {
                    success: true,
                    url: response.data.imageUrl,
                    provider: 'midjourney'
                };
            } else {
                throw new Error('Invalid response from Midjourney API');
            }
        } catch (error) {
            console.error('Midjourney API Error:', error.message);
            return {
                success: false,
                error: error.message,
                provider: 'midjourney'
            };
        }
    }
}

module.exports = MidjourneyService;
