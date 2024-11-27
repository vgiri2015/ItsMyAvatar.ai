const axios = require('axios');

class MidjourneyService {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseURL = 'https://api.midjourney.com/v2';  
    }

    isConfigured() {
        return Boolean(this.apiKey);
    }

    async generateImage(prompt) {
        try {
            console.log('Making imagine request to Midjourney with prompt:', prompt);
            
            const imagineResponse = await axios({
                method: 'post',
                url: `${this.baseURL}/imagine`,
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
                data: {
                    prompt: prompt,
                    model: 'midjourney-v5'
                }
            });

            console.log('Imagine Response:', imagineResponse.data);

            if (!imagineResponse.data || !imagineResponse.data.taskId) {
                throw new Error('Invalid response from Midjourney API');
            }

            const taskId = imagineResponse.data.taskId;
            console.log('Got task ID:', taskId);

            // Poll for the result
            let attempts = 0;
            const maxAttempts = 30;
            while (attempts < maxAttempts) {
                console.log(`Checking status (attempt ${attempts + 1}/${maxAttempts})...`);
                
                const statusResponse = await axios({
                    method: 'get',
                    url: `${this.baseURL}/result/${taskId}`,
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                    }
                });

                console.log('Status Response:', statusResponse.data);

                if (statusResponse.data.status === 'completed' && statusResponse.data.imageUrl) {
                    return {
                        success: true,
                        url: statusResponse.data.imageUrl,
                        provider: 'midjourney',
                        metadata: {
                            taskId: taskId
                        }
                    };
                }

                if (statusResponse.data.status === 'failed') {
                    throw new Error('Image generation failed');
                }

                await new Promise(resolve => setTimeout(resolve, 5000));
                attempts++;
            }

            throw new Error('Timed out waiting for image generation');
        } catch (error) {
            console.error('Midjourney API Error:', error.response ? {
                status: error.response.status,
                data: error.response.data
            } : error.message);
            
            throw new Error(error.response ? 
                `API Error (${error.response.status}): ${JSON.stringify(error.response.data)}` : 
                error.message);
        }
    }
}

module.exports = MidjourneyService;
