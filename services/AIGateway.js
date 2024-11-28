const axios = require('axios');

class AIGateway {
    constructor() {
        // Initialize provider configurations
        this.providers = {
            huggingface: {
                isConfigured: () => !!process.env.HUGGINGFACE_API_KEY,
                generateImage: this.generateHuggingFaceImage.bind(this),
                model: 'stabilityai/stable-diffusion-xl-base-1.0'
            },
            openai: {
                isConfigured: () => !!process.env.OPENAI_API_KEY,
                generateImage: this.generateOpenAIImage.bind(this),
                model: 'dall-e-3'
            },
            midjourney: {
                isConfigured: () => !!process.env.MIDJOURNEY_API_KEY,
                generateImage: this.generateMidjourneyImage.bind(this),
                model: 'midjourney-v5'
            },
            deepai: {
                isConfigured: () => !!process.env.DEEPAI_API_KEY,
                generateImage: this.generateDeepAIImage.bind(this),
                model: 'text2img'
            },
            firefly: {
                isConfigured: () => !!process.env.ADOBE_API_KEY && !!process.env.ADOBE_CLIENT_ID,
                generateImage: this.generateFireflyImage.bind(this),
                model: 'firefly-v1'
            }
        };
    }

    isConfigured() {
        return Object.values(this.providers).some(provider => provider.isConfigured());
    }

    async generateImage(options) {
        const { prompt, provider, options: imageOptions = {} } = options;
        const { size = '1024x1024', quality } = imageOptions;

        // Get available providers
        const availableProviders = Object.entries(this.providers)
            .filter(([name, service]) => service.isConfigured())
            .map(([name]) => name);

        if (availableProviders.length === 0) {
            throw new Error('No AI providers are configured');
        }

        // If specific provider requested, use it
        if (provider && provider !== 'all') {
            if (!this.providers[provider]) {
                throw new Error(`Provider ${provider} not supported`);
            }
            if (!this.providers[provider].isConfigured()) {
                throw new Error(`Provider ${provider} not configured`);
            }
            const result = await this.providers[provider].generateImage(options);
            return {
                ...result,
                gateway: 'AIGateway',
                provider: provider,
                model: this.providers[provider].model
            };
        }

        // Try all available providers
        const errors = [];
        for (const providerName of availableProviders) {
            try {
                const result = await this.providers[providerName].generateImage(options);
                return {
                    ...result,
                    gateway: 'AIGateway',
                    provider: providerName,
                    model: this.providers[providerName].model
                };
            } catch (error) {
                console.error(`${providerName} provider failed:`, error);
                errors.push(`${providerName}: ${error.message}`);
            }
        }

        throw new Error(`All providers failed: ${JSON.stringify(errors)}`);
    }

    async generateHuggingFaceImage(options) {
        const { prompt, options: imageOptions = {} } = options;
        const { size = '1024x1024', quality } = imageOptions;
        const [width, height] = size.split('x').map(Number);

        const apiKey = process.env.HUGGINGFACE_API_KEY;
        if (!apiKey) {
            throw new Error('HUGGINGFACE_API_KEY not configured');
        }

        try {
            const response = await axios.post(
                'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0',
                {
                    inputs: prompt,
                    parameters: {
                        width,
                        height,
                        num_inference_steps: quality === 'hd' ? 50 : 30,
                        guidance_scale: 7.5
                    }
                },
                {
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    responseType: 'arraybuffer'
                }
            );

            const base64Image = Buffer.from(response.data).toString('base64');
            return {
                url: `data:image/jpeg;base64,${base64Image}`
            };
        } catch (error) {
            console.error('Hugging Face image generation failed:', error);
            throw new Error(`Hugging Face image generation failed: ${error.message}`);
        }
    }

    async generateOpenAIImage(options) {
        const { prompt, options: imageOptions = {} } = options;
        const { size = '1024x1024', quality } = imageOptions;

        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            throw new Error('OPENAI_API_KEY not configured');
        }

        // DALL-E 3 only supports 1024x1024, 1024x1792, and 1792x1024
        let adjustedSize = '1024x1024';
        if (size.includes('x')) {
            const [width, height] = size.split('x').map(Number);
            const ratio = width / height;
            if (ratio > 1.5) {
                adjustedSize = '1792x1024';  // Landscape
            } else if (ratio < 0.67) {
                adjustedSize = '1024x1792';  // Portrait
            }
        }

        try {
            const response = await axios.post(
                'https://api.openai.com/v1/images/generations',
                {
                    model: "dall-e-3",
                    prompt,
                    n: 1,
                    size: adjustedSize,
                    quality: quality === 'hd' ? 'hd' : 'standard',
                    response_format: 'url'
                },
                {
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return {
                url: response.data.data[0].url
            };
        } catch (error) {
            console.error('OpenAI image generation failed:', error.response?.data || error);
            throw new Error(`OpenAI image generation failed: ${error.response?.data?.error?.message || error.message}`);
        }
    }

    async generateMidjourneyImage(options) {
        const { prompt, options: imageOptions = {} } = options;
        const { size = '1024x1024', quality } = imageOptions;

        const apiKey = process.env.MIDJOURNEY_API_KEY;
        if (!apiKey) {
            throw new Error('MIDJOURNEY_API_KEY not configured');
        }

        try {
            // First, create the imagine task
            const imagineResponse = await axios.post(
                'https://api.thenextleg.io/v2/imagine',
                {
                    msg: prompt,
                    ref: '',  // optional reference id
                    webhookOverride: '',  // no webhook needed
                    ignorePrefilter: false
                },
                {
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const messageId = imagineResponse.data.messageId;
            if (!messageId) {
                throw new Error('No messageId in response');
            }

            // Poll for the result
            let attempts = 0;
            const maxAttempts = 30;  // 5 minutes max
            while (attempts < maxAttempts) {
                const resultResponse = await axios.get(
                    `https://api.thenextleg.io/v2/message/${messageId}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${apiKey}`
                        }
                    }
                );

                const { progress, response } = resultResponse.data;
                
                if (progress === 100 && response?.imageUrls?.[0]) {
                    return {
                        url: response.imageUrls[0]
                    };
                }

                if (progress === -1) {
                    throw new Error('Image generation failed');
                }

                // Wait 10 seconds before next attempt
                await new Promise(resolve => setTimeout(resolve, 10000));
                attempts++;
            }

            throw new Error('Timeout waiting for image generation');
        } catch (error) {
            console.error('Midjourney image generation failed:', error.response?.data || error);
            throw new Error(`Midjourney image generation failed: ${error.response?.data?.error || error.message}`);
        }
    }

    async generateDeepAIImage(options) {
        const { prompt, options: imageOptions = {} } = options;
        const { size = '1024x1024', quality } = imageOptions;

        const apiKey = process.env.DEEPAI_API_KEY;
        if (!apiKey) {
            throw new Error('DEEPAI_API_KEY not configured');
        }

        try {
            // Create form data
            const formData = new FormData();
            formData.append('text', prompt);
            
            // Add enhanced parameters based on quality
            if (quality === 'hd' || quality === '4k') {
                formData.append('grid_size', '1');
                formData.append('width', '1024');
                formData.append('height', '1024');
            }

            const response = await axios({
                method: 'post',
                url: 'https://api.deepai.org/api/text2img',
                data: formData,
                headers: {
                    'api-key': apiKey,
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (!response.data.output_url) {
                throw new Error('No image URL in response');
            }

            return {
                url: response.data.output_url
            };
        } catch (error) {
            console.error('DeepAI image generation failed:', error.response?.data || error);
            throw new Error(`DeepAI image generation failed: ${error.response?.data?.error || error.message}`);
        }
    }

    async generateFireflyImage(options) {
        // TO DO: implement Firefly image generation
    }
}

module.exports = new AIGateway();
