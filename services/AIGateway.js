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
        const { prompt, provider } = options;
        const errors = [];
        let lastError = null;

        // Validate prompt
        if (!prompt || typeof prompt !== 'string') {
            throw new Error('Invalid prompt: prompt must be a non-empty string');
        }

        // If a specific provider is requested, try only that one
        if (provider && provider !== 'all') {
            const selectedProvider = this.providers[provider];
            if (!selectedProvider) {
                throw new Error(`Provider ${provider} not found or not supported`);
            }
            try {
                console.log(`Attempting to generate image with ${provider}...`);
                const result = await selectedProvider.generateImage(prompt);
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

        for (const [name, service] of availableProviders) {
            try {
                console.log(`Attempting to generate image with ${name}...`);
                const result = await service.generateImage(prompt);
                if (!result || !result.url) {
                    throw new Error(`Invalid response from ${name}`);
                }
                return {
                    ...result,
                    provider: name,
                    success: true
                };
            } catch (error) {
                console.error(`${name} provider failed:`, error);
                lastError = error;
                errors.push({ provider: name, error: error.message });
            }
        }

        // If we get here, all providers failed
        const errorMessage = `All providers failed: ${JSON.stringify(errors)}`;
        console.error(errorMessage);
        throw new Error(errorMessage);
    }
}

module.exports = new AIGateway();
