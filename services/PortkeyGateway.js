const axios = require('axios');

class PortkeyGateway {
    constructor() {
        console.log('Initializing PortkeyGateway...');
        const apiKey = process.env.PORTKEY_API_KEY;
        console.log('API Key:', apiKey ? apiKey.substring(0, 4) + '...' : 'missing');
        
        if (!apiKey) {
            console.error('PORTKEY_API_KEY is missing in environment variables');
            throw new Error('PORTKEY_API_KEY is required');
        }

        try {
            console.log('Creating Portkey client...');
            this.client = axios.create({
                baseURL: 'https://api.portkey.ai',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    'X-Portkey-Mode': 'single'
                }
            });
            console.log('Portkey client created successfully');

            // Map our providers to Portkey's model names and configurations
            this.providerMap = {
                'huggingface': {
                    model: 'stabilityai/stable-diffusion-xl-base-1.0',
                    provider: 'huggingface',
                    apiKey: process.env.HUGGINGFACE_API_KEY,
                    endpoint: '/v1/images/generate'
                },
                'openai': {
                    model: 'dall-e-3',
                    provider: 'openai',
                    apiKey: process.env.OPENAI_API_KEY,
                    endpoint: '/v1/images/generations'
                },
                'stability': {
                    model: 'stable-diffusion-xl',
                    provider: 'stability',
                    apiKey: process.env.STABILITY_API_KEY,
                    endpoint: '/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image'
                },
                'deepai': {
                    model: 'text2img',
                    provider: 'deepai',
                    apiKey: process.env.DEEPAI_API_KEY,
                    endpoint: '/api/text2img'  // DeepAI's text2img endpoint
                },
                'firefly': {
                    model: 'text2img',
                    provider: 'firefly',
                    apiKey: process.env.ADOBE_API_KEY,
                    endpoint: '/v2/images/generations'
                },
                'midjourney': {
                    model: 'midjourney-v5',
                    provider: 'midjourney',
                    apiKey: process.env.MIDJOURNEY_API_KEY,
                    endpoint: '/v2/imagine'  // Using Next Leg API endpoint
                }
            };
            
            // Filter out providers without API keys
            this.availableProviders = Object.entries(this.providerMap)
                .filter(([_, config]) => config.apiKey)
                .map(([name]) => name);
            
            console.log('PortkeyGateway initialized with available providers:', this.availableProviders);
        } catch (error) {
            console.error('Error initializing Portkey:', error);
            throw error;
        }
    }

    isConfigured() {
        return this.availableProviders.length > 0;
    }

    async generateImage(options) {
        const { prompt, provider, options: imageOptions = {} } = options;
        const { size = '1024x1024', quality } = imageOptions;
        const [width, height] = size.split('x').map(Number);
        const errors = [];

        // If no providers are configured, throw error
        if (!this.isConfigured()) {
            throw new Error('No providers are configured. Please set up at least one provider API key.');
        }

        // If a specific provider is requested and available, try only that one
        if (provider && provider !== 'all') {
            if (!this.availableProviders.includes(provider)) {
                throw new Error(`Provider ${provider} is not configured. Available providers: ${this.availableProviders.join(', ')}`);
            }
            return await this.tryProvider(provider, prompt, width, height, quality);
        }

        // Try all available providers in sequence
        for (const providerName of this.availableProviders) {
            try {
                const result = await this.tryProvider(providerName, prompt, width, height, quality);
                if (result) {
                    return result;
                }
            } catch (error) {
                console.error(`Portkey ${providerName} provider failed:`, error);
                errors.push(`${providerName}: ${error.message}`);
            }
        }

        // If all providers failed, throw error
        throw new Error(`All Portkey providers failed: ${JSON.stringify(errors)}`);
    }

    async tryProvider(providerName, prompt, width, height, quality) {
        const config = this.providerMap[providerName];
        if (!config) {
            throw new Error(`Provider ${providerName} not found`);
        }

        if (!config.apiKey) {
            throw new Error(`API key missing for provider ${providerName}`);
        }

        // Update headers for the specific provider
        const headers = {
            ...this.client.defaults.headers,
            'X-Portkey-Provider': config.provider,
            [`X-Portkey-${config.provider}-Api-Key`]: config.apiKey
        };

        let requestConfig = {
            url: config.endpoint,
            method: 'POST',
            headers
        };

        // Configure request body based on provider
        if (providerName === 'huggingface') {
            console.log(`HuggingFace request with size ${width}x${height}`);
            requestConfig.data = {
                inputs: prompt,
                parameters: {
                    width,
                    height,
                    num_inference_steps: quality === 'hd' ? 50 : 30,
                    guidance_scale: 7.5
                }
            };
            console.log('HuggingFace request config:', {
                ...requestConfig,
                data: {
                    ...requestConfig.data,
                    inputs: prompt.substring(0, 30) + '...'  // Truncate for logging
                }
            });
        } else if (providerName === 'openai') {
            // DALL-E 3 only supports specific sizes
            let adjustedSize = '1024x1024';
            const ratio = width / height;
            if (ratio > 1.5) {
                adjustedSize = '1792x1024';  // Landscape
            } else if (ratio < 0.67) {
                adjustedSize = '1024x1792';  // Portrait
            }
            console.log(`OpenAI DALL-E size adjusted from ${width}x${height} to ${adjustedSize}`);

            requestConfig.data = {
                model: config.model,
                prompt,
                n: 1,
                size: adjustedSize,
                quality: quality === 'hd' ? 'hd' : 'standard',
                response_format: 'url'
            };
            console.log('OpenAI DALL-E request config:', {
                ...requestConfig,
                data: {
                    ...requestConfig.data,
                    prompt: prompt.substring(0, 30) + '...'  // Truncate for logging
                }
            });
        } else if (providerName === 'deepai') {
            console.log(`DeepAI request with size ${width}x${height}`);
            // DeepAI expects form-urlencoded data
            const formData = new URLSearchParams();
            formData.append('text', prompt);
            
            requestConfig.data = formData;
            requestConfig.headers['Content-Type'] = 'application/x-www-form-urlencoded';
            
            console.log('DeepAI request config:', {
                ...requestConfig,
                data: `text=${prompt.substring(0, 30)}...`  // Truncate for logging
            });
        } else if (providerName === 'stability') {
            requestConfig.data = {
                text_prompts: [{ text: prompt }],
                width,
                height,
                steps: quality === 'hd' ? 50 : 30,
                cfg_scale: 7.5
            };
        } else if (providerName === 'firefly') {
            requestConfig.data = {
                prompt,
                n: 1,
                size: { width, height },
                quality: quality === 'hd' ? 'high' : 'standard'
            };
        } else if (providerName === 'midjourney') {
            console.log(`Midjourney request with size ${width}x${height}`);
            requestConfig.data = {
                msg: prompt,
                ref: '',  // optional reference id
                webhookOverride: '',  // no webhook needed
                ignorePrefilter: false,
                dimensions: `${width}x${height}`
            };
            // Add Next Leg specific headers
            requestConfig.headers['X-Portkey-Next-Leg-Api-Key'] = config.apiKey;
            
            console.log('Midjourney request config:', {
                ...requestConfig,
                data: {
                    ...requestConfig.data,
                    msg: prompt.substring(0, 30) + '...'  // Truncate for logging
                }
            });
        }

        console.log(`Sending request to Portkey (${providerName}):`, {
            ...requestConfig,
            headers: {
                ...headers,
                'Authorization': '[REDACTED]',
                [`X-Portkey-${config.provider}-Api-Key`]: '[REDACTED]'
            }
        });

        try {
            const response = await this.client.request(requestConfig);
            console.log(`Portkey ${providerName} response status:`, response.status);

            // Extract image URL based on provider response format
            let imageUrl;
            if (providerName === 'huggingface') {
                if (response.data?.error) {
                    throw new Error(`HuggingFace error: ${response.data.error}`);
                }
                if (!response.data || !Array.isArray(response.data) || response.data.length === 0) {
                    throw new Error('HuggingFace response missing image data');
                }
                // HuggingFace can return base64 or URL
                const imageData = response.data[0];
                if (typeof imageData === 'string' && (imageData.startsWith('http') || imageData.startsWith('data:image'))) {
                    imageUrl = imageData;
                } else {
                    throw new Error('Invalid image format in HuggingFace response');
                }
                console.log('HuggingFace image data received:', 
                    imageData.startsWith('data:image') ? 'base64 image' : imageData.substring(0, 50) + '...');
            } else if (providerName === 'openai') {
                if (response.data?.error) {
                    throw new Error(`OpenAI error: ${response.data.error.message || response.data.error}`);
                }
                if (!response.data?.data?.[0]?.url) {
                    throw new Error('OpenAI response missing image URL');
                }
                imageUrl = response.data.data[0].url;
                console.log('OpenAI image URL received:', imageUrl.substring(0, 50) + '...');
            } else if (providerName === 'deepai') {
                if (response.data?.error) {
                    throw new Error(`DeepAI error: ${response.data.error}`);
                }
                if (!response.data?.output_url) {
                    throw new Error('DeepAI response missing output URL');
                }
                imageUrl = response.data.output_url;
                console.log('DeepAI image URL received:', imageUrl.substring(0, 50) + '...');
            } else if (providerName === 'stability') {
                imageUrl = response.data.artifacts[0].base64; // Base64 encoded image
            } else if (providerName === 'firefly') {
                imageUrl = response.data.data[0].url;
            } else if (providerName === 'midjourney') {
                if (response.data?.error) {
                    throw new Error(`Midjourney error: ${response.data.error.message || response.data.error}`);
                }
                // Midjourney returns a messageId first, which we need to poll
                if (!response.data?.messageId) {
                    throw new Error('Midjourney response missing messageId');
                }
                
                // Poll for the result
                let attempts = 0;
                const maxAttempts = 30;  // 5 minutes max
                while (attempts < maxAttempts) {
                    const pollResponse = await this.client.get(
                        `/api/v1/midjourney/message/${response.data.messageId}`,
                        { headers }
                    );
                    
                    const { progress, imageUrls } = pollResponse.data;
                    
                    if (progress === 100 && imageUrls?.[0]) {
                        imageUrl = imageUrls[0];
                        break;
                    }
                    
                    if (progress === -1) {
                        throw new Error('Midjourney image generation failed');
                    }
                    
                    // Wait 10 seconds before next attempt
                    await new Promise(resolve => setTimeout(resolve, 10000));
                    attempts++;
                }
                
                if (!imageUrl) {
                    throw new Error('Timeout waiting for Midjourney image');
                }
                
                console.log('Midjourney image URL received:', imageUrl.substring(0, 50) + '...');
            }

            if (!imageUrl) {
                throw new Error(`No image URL in ${providerName} response`);
            }

            return {
                url: imageUrl,
                provider: providerName,
                model: config.model
            };
        } catch (error) {
            console.error(`Portkey ${providerName} request failed:`, error.response?.data || error);
            throw new Error(`${providerName} request failed: ${error.response?.data?.error?.message || error.message}`);
        }
    }
}

module.exports = new PortkeyGateway();
