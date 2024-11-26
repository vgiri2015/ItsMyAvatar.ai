# AI Gateway Image Generator

A versatile AI image generation service that provides a unified interface to multiple AI image generation providers including OpenAI, Claude, LLaMA, and Hugging Face.

## Features

- Unified API interface for multiple AI image generation services
- Supports multiple providers:
  - OpenAI
  - Claude
  - LLaMA
  - Hugging Face
- Easy to extend with new providers
- Environment-based configuration
- Error handling and validation

## Installation

1. Clone the repository:
```bash
git clone https://github.com/vgiri2015/myavatar.ai.git
cd myavatar.ai
```

2. Install dependencies:
```bash
npm install
```

3. Set up your environment variables in a `.env` file:
```env
OPENAI_API_KEY=your_openai_api_key
CLAUDE_API_KEY=your_claude_api_key
HUGGINGFACE_API_KEY=your_huggingface_api_key
```

## Usage

The service provides a simple interface to generate images:

```javascript
const AIGateway = require('./services/AIGateway');

// Generate an image using the default provider
const image = await AIGateway.generateImage({
  prompt: "A beautiful sunset over mountains",
  provider: "openai" // or "claude", "llama", "huggingface"
});
```

## Project Structure

```
.
├── services/
│   ├── AIGateway.js         # Main gateway service
│   └── providers/           # Provider implementations
│       ├── OpenAIService.js
│       ├── ClaudeService.js
│       ├── LlamaService.js
│       └── HuggingFaceService.js
├── public/                  # Public assets
├── app.js                   # Express application
└── package.json            # Project dependencies
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
