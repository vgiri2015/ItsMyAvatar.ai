const OpenAIService = require('./providers/OpenAIService');
const ClaudeService = require('./providers/ClaudeService');
const LlamaService = require('./providers/LlamaService');
const HuggingFaceService = require('./providers/HuggingFaceService');

class AIGateway {
    constructor() {
        this.providers = {
            openai: new OpenAIService(),
            claude: new ClaudeService(),
            llama: new LlamaService(),
            huggingface: new HuggingFaceService(),
        };
    }

    async generateImage(prompt, options = {}) {
        const results = [];
        const errors = [];

        // Define which providers to use based on options or use all by default
        const providersToUse = options.providers || Object.keys(this.providers);

        // Call each provider in parallel
        const promises = providersToUse.map(async (providerName) => {
            try {
                const provider = this.providers[providerName];
                if (!provider || !provider.isConfigured()) {
                    return;
                }

                const result = await provider.generateImage(prompt);
                results.push({
                    provider: providerName,
                    result,
                    timestamp: new Date(),
                });
            } catch (error) {
                errors.push({
                    provider: providerName,
                    error: error.message,
                });
            }
        });

        await Promise.all(promises);

        // If no successful results, throw an error with details
        if (results.length === 0) {
            throw new Error(`All providers failed: ${JSON.stringify(errors)}`);
        }

        // For now, return the first successful result
        // This can be enhanced with more sophisticated selection logic
        return results[0].result;
    }
}

module.exports = new AIGateway();
