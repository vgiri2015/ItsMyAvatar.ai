const axios = require('axios');

class DeepAIService {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseURL = 'https://api.deepai.org/api';
    }

    async generateImage(prompt) {
        try {
            console.log('Making request to DeepAI with prompt:', prompt);
            
            const response = await axios({
                method: 'post',
                url: `${this.baseURL}/text2img`,
                headers: {
                    'api-key': this.apiKey,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                data: `text=${encodeURIComponent(prompt)}`,
                validateStatus: (status) => true // Allow any status code for debugging
            });

            console.log('DeepAI response status:', response.status);
            console.log('DeepAI response headers:', response.headers);
            console.log('DeepAI raw response:', JSON.stringify(response.data, null, 2));

            if (response.status !== 200) {
                throw new Error(`API returned status ${response.status}: ${JSON.stringify(response.data)}`);
            }

            if (response.data && response.data.output_url) {
                console.log('Successfully got output URL:', response.data.output_url);
                return {
                    success: true,
                    url: response.data.output_url,
                    provider: 'deepai'
                };
            } else {
                console.error('Invalid response structure:', response.data);
                throw new Error(`Invalid response structure from DeepAI: ${JSON.stringify(response.data)}`);
            }
        } catch (error) {
            console.error('DeepAI API Error:', error.response ? {
                status: error.response.status,
                data: error.response.data,
                headers: error.response.headers
            } : error.message);
            
            return {
                success: false,
                error: error.response ? 
                    `API Error (${error.response.status}): ${JSON.stringify(error.response.data)}` : 
                    error.message,
                provider: 'deepai'
            };
        }
    }
}

module.exports = DeepAIService;
