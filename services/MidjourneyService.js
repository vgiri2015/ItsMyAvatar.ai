const axios = require('axios');
const FormData = require('form-data');

class MidjourneyService {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseURL = 'https://api.apiframe.pro/v1';
    }

    isConfigured() {
        return !!this.apiKey;
    }

    async generateImage(prompt) {
        if (!this.isConfigured()) {
            throw new Error('Midjourney is not configured');
        }

        try {
            console.log('Making request to Midjourney with prompt:', prompt);

            // Create task
            const createResponse = await axios.post(
                `${this.baseURL}/midjourney/imagine`,
                { prompt },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!createResponse.data || !createResponse.data.taskId) {
                throw new Error('Invalid response from Midjourney API');
            }

            const taskId = createResponse.data.taskId;
            console.log('Task created:', taskId);

            // Poll for result
            let attempts = 0;
            const maxAttempts = 30; // 5 minutes maximum wait time
            const delay = 10000; // 10 seconds between checks

            while (attempts < maxAttempts) {
                const statusResponse = await axios.get(
                    `${this.baseURL}/midjourney/result/${taskId}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${this.apiKey}`
                        }
                    }
                );

                console.log('Status check:', statusResponse.data);

                if (statusResponse.data.status === 'completed') {
                    return {
                        url: statusResponse.data.imageUrl,
                        metadata: {
                            provider: 'midjourney',
                            taskId: taskId
                        }
                    };
                }

                if (statusResponse.data.status === 'failed') {
                    throw new Error(`Midjourney task failed: ${statusResponse.data.error || 'Unknown error'}`);
                }

                await new Promise(resolve => setTimeout(resolve, delay));
                attempts++;
            }

            throw new Error('Midjourney task timed out');
        } catch (error) {
            console.error('Midjourney error:', error);
            throw error;
        }
    }
}

module.exports = MidjourneyService;
