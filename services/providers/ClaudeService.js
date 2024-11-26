const axios = require('axios');

class ClaudeService {
    constructor() {
        this.client = process.env.CLAUDE_API_KEY ? axios.create({
            baseURL: 'https://api.anthropic.com/v1',
            headers: {
                'Authorization': `Bearer ${process.env.CLAUDE_API_KEY}`,
                'Content-Type': 'application/json',
            }
        }) : null;
    }

    isConfigured() {
        return !!this.client;
    }

    async generateImage(prompt) {
        if (!this.isConfigured()) {
            throw new Error('Claude is not configured');
        }

        // Note: This is a placeholder as Claude doesn't currently support image generation
        // This can be updated when Claude adds image generation capabilities
        throw new Error('Image generation not yet supported by Claude');
    }
}

module.exports = ClaudeService;
