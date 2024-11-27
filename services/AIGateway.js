const OpenAIService = require('./providers/OpenAIService');
const HuggingFaceService = require('./providers/HuggingFaceService');
const MidjourneyService = require('./MidjourneyService');
const DeepAIService = require('./providers/DeepAIService');

class AIGateway {
    constructor() {
        this.providers = {
            openai: new OpenAIService(),
            huggingface: new HuggingFaceService(process.env.HUGGINGFACE_API_KEY),
            midjourney: new MidjourneyService(process.env.MIDJOURNEY_API_KEY),
            deepai: new DeepAIService(process.env.DEEPAI_API_KEY)
        };
    }

    async generateImage(options) {
        const { prompt, provider, options: imageOptions = {} } = options;
        const errors = [];
        let lastError = null;

        // Validate prompt
        if (!prompt || typeof prompt !== 'string') {
            throw new Error('Invalid prompt: prompt must be a non-empty string');
        }

        // If using a source image, ensure we use OpenAI
        if (imageOptions.sourceImage) {
            console.log('Source image detected, using OpenAI for image variation');
            if (provider && provider !== 'openai' && provider !== 'all') {
                throw new Error('Image variations are only supported with OpenAI');
            }
            try {
                const result = await this.providers.openai.generateImage(prompt, imageOptions);
                return {
                    ...result,
                    provider: 'openai',
                    success: true
                };
            } catch (error) {
                console.error('OpenAI image variation failed:', error);
                throw new Error(`OpenAI image variation failed: ${error.message}`);
            }
        }

        // If a specific provider is requested, try only that one
        if (provider && provider !== 'all') {
            const selectedProvider = this.providers[provider];
            if (!selectedProvider) {
                throw new Error(`Provider ${provider} not found or not supported`);
            }
            try {
                console.log(`Attempting to generate image with ${provider}...`);
                const result = await selectedProvider.generateImage(prompt, imageOptions);
                if (!result || !result.url) {
                    throw new Error(`Invalid response from ${provider}`);
                }
                return {
                    ...result,
                    provider,
                    success: true
                };
            } catch (error) {
                console.error(`${provider} provider failed:`, error);
                throw new Error(`${provider} provider failed: ${error.message}`);
            }
        }

        // Try all configured providers
        const availableProviders = Object.entries(this.providers)
            .filter(([_, service]) => service.isConfigured());

        if (availableProviders.length === 0) {
            throw new Error('No providers are properly configured');
        }

        console.log('Available providers:', availableProviders.map(([name]) => name));

        for (const [providerName, service] of availableProviders) {
            try {
                console.log(`Attempting to generate image with ${providerName}...`);
                const result = await service.generateImage(prompt, imageOptions);
                if (result && result.url) {
                    return {
                        ...result,
                        provider: providerName,
                        success: true
                    };
                }
            } catch (error) {
                console.error(`${providerName} provider failed:`, error);
                errors.push(`${providerName}: ${error.message}`);
                lastError = error;
            }
        }

        // If we get here, all providers failed
        const errorMessage = `All providers failed: ${JSON.stringify(errors)}`;
        console.error(errorMessage);
        throw new Error(errorMessage);
    }
}

module.exports = new AIGateway();
