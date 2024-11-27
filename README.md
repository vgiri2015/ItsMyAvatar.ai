# Multi Model AI Image Generator using AI Gateway

A versatile AI image generation service that provides a unified interface to multiple AI image generation providers including OpenAI (DALL-E), Hugging Face (Stable Diffusion), MidJourney, and DeepAI.

## 🚀 Features

- Multiple AI Provider Support:
  - OpenAI (DALL-E 2)
  - HuggingFace (Stable Diffusion v1-4)
  - MidJourney (via APIFrame.pro)
  - DeepAI
- Unified API Interface
- Automatic Provider Fallback
- Real-time Image Generation
- Model Information Display
- Robust Error Handling
- User-friendly Interface

## 🎨 Image Generation Features

- Provider Selection:
  - Choose specific provider or "Auto" mode
  - Auto mode tries all available providers
  - Displays which model generated the image
- Customization Options:
  - Style selection (realistic, artistic, etc.)
  - Size options (512x512, 1024x1024)
  - Quality settings (standard, HD)
- Metadata Display:
  - Provider and model information
  - Generation parameters
  - Image specifications

## 🛠️ Setup

1. **Clone Repository**:
   ```bash
   git clone https://github.com/vgiri2015/itsmyavatar.ai.git
   cd itsmyavatar.ai
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment**:
   Create a `.env` file with your API keys:
   ```env
   OPENAI_API_KEY=your_openai_key
   HUGGINGFACE_API_KEY=your_huggingface_key
   MIDJOURNEY_API_KEY=your_midjourney_key
   DEEPAI_API_KEY=your_deepai_key
   ```

   Get your API keys from:
   - OpenAI: https://platform.openai.com/account/api-keys
   - HuggingFace: https://huggingface.co/settings/tokens
   - MidJourney: https://apiframe.pro/ (Note: APIFrame.pro provides Midjourney API access)
   - DeepAI: https://deepai.org/dashboard/api-keys

4. **Start Server**:
   ```bash
   npm start
   ```

## 🚀 Running the Application

1. **Start the Server**:
   ```bash
   # Navigate to project directory
   cd itsmyavatar.ai
   
   # Start the server
   node server.js
   ```
   The server will start on http://localhost:3000 and display available AI providers.

2. **Verify Server Status**:
   - Check terminal for successful startup message
   - You should see "Server is running on http://localhost:3000"
   - Available AI providers will be listed

3. **Access the Application**:
   - Open your browser
   - Navigate to http://localhost:3000
   - You should see the image generation interface

4. **Managing the Server**:
   ```bash
   # To stop the server
   # Press Ctrl+C in the terminal
   
   # If the port is already in use, find and kill the process
   lsof -i :3000   # Find process using port 3000
   kill -9 <PID>   # Replace <PID> with the process ID
   
   # To run in background (optional)
   node server.js &
   ```

5. **Troubleshooting**:
   - If server won't start, check if port 3000 is already in use
   - Verify all environment variables are set in `.env`
   - Check terminal for error messages
   - Ensure all dependencies are installed (`npm install`)

## 🎯 Usage

1. **Select Provider**:
   - Choose a specific provider or "Auto (Try All Providers)"
   - Each provider uses different models:
     - OpenAI: DALL-E 2
     - HuggingFace: Stable Diffusion v1-4
     - MidJourney: Latest model via APIFrame.pro
     - DeepAI: Various models

2. **Customize Generation**:
   - Enter a descriptive prompt
   - Select style (realistic, artistic, etc.)
   - Choose image size and quality
   - Example prompt: "A cat eating lunch in Paris"

3. **Generate & View Results**:
   - Click "Generate" to create image
   - View generation progress
   - See which model was used
   - Review full metadata (provider, model, settings)

## 🖼 Sample Generated Images

Here are some examples of images generated using different providers:

### HuggingFace (Stable Diffusion v1-4)
![Sample Image 1](images/image3.png)
*Prompt: "cat in the Eiffel Tower street, artistic style"*

### OpenAI (DALL-E 2)
![Sample Image 2](images/image4.png)
*Prompt: "Iron Man in the Smoky Mountains, realistic style, high quality"*

### DeepAI
![Sample Image 3](images/image5.png)
*Prompt: "Cat and Elephant in the classroom, cartoon style"*

### Auto (Try All Providers)
![Sample Image 4](images/image6.png)
*Prompt: "Cat eating lunch"*


Each provider has its unique strengths and artistic style. Try different prompts and providers to find the best match for your needs!

## 🌟 Provider Details

### OpenAI (DALL-E 2)
- Latest DALL-E 2 model
- Excellent for realistic images
- Fast generation (2-5 seconds)
- Requires API credits

### HuggingFace (Stable Diffusion v1-4)
- Reliable open-source model
- Good for artistic styles
- Free tier available
- Multiple retry mechanism

### MidJourney
- High-quality artistic results
- Available through APIFrame.pro
- Unique artistic style
- Paid service required

### DeepAI
- Various AI models
- Good for experimentation
- Competitive pricing
- Simple API integration

## 🔧 Technical Details

### Error Handling
- Automatic provider fallback
- Multiple retry attempts
- Detailed error messages
- Graceful failure handling

### Image Processing
- Base64 and URL support
- Multiple size options
- Quality settings
- Metadata preservation

## 📁 Project Structure

```
.
├── server.js                    # Express server setup
├── services/                    # Provider services
│   ├── AIGateway.js            # Main gateway service
│   └── providers/              # Individual providers
├── public/                     # Static assets
└── package.json                # Dependencies
```

## 📝 Notes

- OpenAI (DALL-E) requires proper billing setup
- HuggingFace may have longer generation times
- Provider availability may vary
- Keep API keys secure and never commit them

## 🤝 Contributing

Contributions welcome! Please read the contributing guidelines first.

## 📄 License

MIT License - see LICENSE file for details
