# AI Gateway Image Generator

A powerful multi-provider AI image generation web application that leverages the Portkey Gateway for seamless integration with multiple AI providers.

## Introduction to Portkey Gateway

Portkey Gateway is a unified API gateway that simplifies access to multiple AI providers. Key features include:

- **Multi-Provider Support**: Seamlessly switch between providers like OpenAI, HuggingFace, and more
- **Smart Routing**: Automatically routes requests to the best available provider
- **Fallback Handling**: Built-in fallback mechanisms for high availability
- **Unified API**: Single consistent API interface for all providers
- **Cost Optimization**: Smart routing based on pricing and performance
- **Error Handling**: Robust error handling and retry mechanisms

## How It Works

### Architecture Overview

1. **Frontend Layer**
   - Modern web interface built with HTML, CSS, and JavaScript
   - Real-time image preview and editing capabilities
   - Responsive design for all device sizes

2. **Backend Layer**
   - Node.js/Express server handling API requests
   - Dual Gateway System:
     * Portkey Gateway for primary provider management
     * AI Gateway for additional provider support and fallback
   - Image processing and optimization

3. **AI Provider Integration**
   - Primary support for:
     * OpenAI (DALL-E)
     * HuggingFace
     * Additional providers through Portkey Gateway and AI Gateway

### Key Features

1. **Image Generation**
   - Text-to-image generation
   - Multiple style options
   - Quality control settings
   - Provider selection

2. **Image Editing**
   - Style Transfer:
     * Anime
     * Photographic
     * Digital Art
     * Oil Painting
     * Watercolor
   - Color Adjustments:
     * Brightness
     * Contrast
     * Saturation

3. **Smart Provider Selection**
   - Auto mode for optimal provider selection
   - Manual provider override option
   - Fallback mechanisms for reliability

## Architecture Diagram

```
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────────────┐
│                 │     │                      │     │   AI Providers       │
│   Frontend      │     │   Backend Server     │     │   ┌──────────────┐  │
│  ┌───────────┐  │     │  ┌────────────┐     │     │   │   OpenAI     │  │
│  │   UI      │  │     │  │   Express  │     │     │   └──────────────┘  │
│  │Components │  │ HTTP │  │   Server   │     │     │   ┌──────────────┐  │
│  └───────────┘  ├────►│  └────────────┘     │     │   │ HuggingFace  │  │
│  ┌───────────┐  │     │  ┌────────────┐     │     │   └──────────────┘  │
│  │  Image    │  │     │  │  Portkey   │     │     │   ┌──────────────┐  │
│  │  Editor   │  │     │  │  Gateway   ├─┐   │     │   │    Other     │  │
│  └───────────┘  │     │  └────────────┘ │   ├────►│   │  Providers   │  │
│  ┌───────────┐  │     │  ┌────────────┐ │   │     │   └──────────────┘  │
│  │  Style    │  │     │  │    AI      │ │   │     │                     │
│  │ Controls  │  │     │  │  Gateway   ├─┘   │     │   Fallback Chain    │
│  └───────────┘  │     │  └────────────┘     │     │   ┌─► Primary      │
│                 │     │  ┌────────────┐     │     │   └─► Secondary    │
│                 │     │  │   Image    │     │     │                     │
│                 │     │  │ Processing │     │     │                     │
└─────────────────┘     └──────────────────────┘     └─────────────────────┘
```

### Flow Description:

1. **Frontend Layer**
   - User interacts with UI components
   - Sends image generation/editing requests
   - Displays results and handles real-time previews

2. **Backend Server**
   - Express server handles HTTP requests
   - Dual Gateway System:
     * Portkey Gateway for primary provider management
     * AI Gateway for additional provider support and fallback
   - Image processing for edits and optimizations

3. **AI Providers**
   - Multiple provider support
   - Automatic fallback chain
   - Smart routing based on availability

## Setup and Configuration

1. **Prerequisites**
   ```bash
   - Node.js (v14 or higher)
   - npm or yarn
   ```

2. **Environment Variables**
   ```env
   PORTKEY_API_KEY=your_portkey_api_key
   HUGGINGFACE_API_KEY=your_huggingface_key
   OPENAI_API_KEY=your_openai_key
   ```

3. **Installation**
   ```bash
   npm install
   npm start
   ```

## Usage Flow

1. **Image Generation**
   - Enter a text prompt
   - Select desired style and quality
   - Choose provider (or use Auto)
   - Click Generate

2. **Image Editing**
   - Click Edit on generated image
   - Choose style transfer option
   - Adjust color settings
   - Apply changes

3. **Image Export**
   - Download generated/edited images
   - Metadata preserved with downloads

## Technical Implementation

1. **Provider Integration**
   ```javascript
   // Portkey Gateway handles provider selection and fallback
   const portkeyGateway = {
     generateImage: async (options) => {
       // Smart routing to best provider
       // Fallback handling
       // Error management
     }
   };
   ```

2. **Image Processing**
   - Real-time color adjustments
   - Style transfer processing
   - Image optimization

3. **Error Handling**
   - Graceful fallbacks
   - User-friendly error messages
   - Automatic retries

## Security Considerations

- API keys stored securely in environment variables
- Input sanitization for all user inputs
- Rate limiting implemented
- Secure image processing

## Future Enhancements

1. **Planned Features**
   - User authentication
   - Image history
   - Advanced editing tools
   - Additional providers

2. **Performance Optimizations**
   - Image caching
   - Progressive loading
   - Response time improvements

## Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests for any enhancements.

## License

MIT License - See LICENSE file for details
