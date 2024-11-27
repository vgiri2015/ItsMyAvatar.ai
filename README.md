# AI Gateway Image Generator

A versatile AI image generation service that provides a unified interface to multiple AI image generation providers including OpenAI (DALL-E) and Hugging Face (Stable Diffusion).

## 🌟 Key Features

- **Multi-Provider Support**: Seamlessly switch between different AI image generation services
- **Unified API**: Simple, consistent interface for all providers
- **Provider-Specific Optimizations**: Each provider is configured for optimal performance
- **Error Handling**: Robust error handling and fallback mechanisms
- **Modern UI**: Clean, responsive interface with real-time feedback

## 🚀 Quick Start

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
HUGGINGFACE_API_KEY=your_huggingface_api_key
```

4. Start the server:
```bash
# First, ensure no other instance is running
pkill -f "node app.js"

# Then start the server
node app.js
```

5. Open your browser and visit:
```
http://localhost:3000
```

## 🎨 Using the Image Generator

1. **Select Provider**:
   - Choose between HuggingFace (Stable Diffusion) or OpenAI (DALL-E)
   - Each provider has different strengths and characteristics

2. **Enter Prompt**:
   - Be descriptive and specific
   - Include details about style, lighting, composition
   - Example: "A serene Japanese garden with a red maple tree, koi pond, and stone lanterns at sunset"

3. **Generate Image**:
   - Click "Generate Image" and wait for the result
   - Generation typically takes 10-20 seconds
   - The UI will show a loading indicator during generation

## 🔧 Architecture

### Provider System
```
AIGateway
    ├── OpenAI Service (DALL-E)
    └── HuggingFace Service (Stable Diffusion)
```

- **AIGateway**: Central service that routes requests to appropriate providers
- **Provider Services**: Individual implementations for each AI service
- **Fallback System**: If one provider fails, system can automatically try others

### API Endpoints

- `POST /generate`
  ```json
  {
    "prompt": "Your image description",
    "provider": "huggingface" // or "openai"
  }
  ```
  Returns:
  ```json
  {
    "success": true,
    "url": "generated_image_url",
    "provider": "provider_used"
  }
  ```

## 🔍 Troubleshooting

1. **Server Already Running**
   ```bash
   # Kill existing Node.js process
   pkill -f "node app.js"
   ```

2. **API Key Issues**
   - Verify keys in `.env` file
   - Check for whitespace in API keys
   - Ensure billing is set up for OpenAI
   - Verify HuggingFace token has proper permissions

3. **Generation Failures**
   - Check server logs for specific error messages
   - Verify network connectivity
   - Ensure prompt is appropriate and not too complex

## 🛠 Development

### Adding New Providers

1. Create new service in `services/providers/`
2. Implement required interface:
   ```javascript
   class NewProvider {
     async generateImage(prompt) {
       // Implementation
     }
   }
   ```
3. Register in `AIGateway.js`

### Project Structure
```
.
├── services/
│   ├── AIGateway.js              # Main gateway service
│   └── providers/                # Provider implementations
│       ├── OpenAIService.js      # DALL-E implementation
│       └── HuggingFaceService.js # Stable Diffusion implementation
├── public/                       # Frontend assets
│   └── index.html               # Main UI
├── app.js                        # Express application
└── package.json                 # Project dependencies
```

## 📝 Notes

- OpenAI (DALL-E) has usage limits and requires billing setup
- HuggingFace is free but might be slower
- Keep prompts clear and specific for best results
- Image generation can take varying times depending on provider and complexity

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
