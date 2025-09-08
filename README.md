#  Open Source Draw-to-Edit Annotation System

A powerful, modular React-based annotation system for AI-powered image editing. This open-source project provides a complete toolkit for creating annotation interfaces similar to those found in professional image editing applications.

## ✨ Features

### 🖊️ Drawing Tools

- **Freehand Drawing** - Smooth pen tool with adjustable thickness and colors
- **Arrows** - Perfect arrows with customizable styling
- **Text Annotations** - Rich text with font size and color controls
- **Image Overlays** - Add and manipulate overlay images
- **Mask Painting** - Advanced masking tools for AI-powered editing

### 🎨 Advanced Capabilities

- **Undo/Redo System** - Full history management with 50-step memory
- **Layer Management** - Organized annotation layers
- **Export Options** - Download annotated images
- **Touch Support** - Full mobile and tablet compatibility
- **Keyboard Shortcuts** - Efficient workflow controls
- **Responsive Design** - Works on all screen sizes

### 🤖 AI Integration Ready

- **Modular API System** - Easy integration with any AI service
- **Mask-based Generation** - Advanced inpainting capabilities
- **Prompt Support** - Text-to-image generation
- **Multiple Provider Support** - OpenAI, Stability AI, Replicate, custom APIs

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/gajjar4/inpaint-with-nano-banana.git
cd inpaint-with-nano-banana.git

# Install dependencies
npm install

# Start development server
npm run dev
```

### Basic Usage

```tsx
import React from "react";
import { AnnotationEditor } from "./components/AnnotationEditor";

function App() {
  return (
    <div className="h-screen">
      <AnnotationEditor
        onImageGenerated={(imageUrl) => console.log("Generated:", imageUrl)}
        onError={(error) => console.error("Error:", error)}
      />
    </div>
  );
}
```

## 🔧 Nano Banana API Integration

### Setting up your Nano Banana Backend

This system is specifically designed to work with the Nano Banana API backend. Here's how to integrate:

#### 1. Configure the API Client

```tsx
import { createNanoBananaClient } from "./api";

// Create Nano Banana API client
const apiClient = createNanoBananaClient(
  "https://your-nano-banana-backend.com", // Your backend URL
  "your-firebase-id-token" // Firebase authentication token
);
```

#### 2. Environment Variables

Create a `.env` file with your configuration:

```env
# Nano Banana API Configuration
REACT_APP_NANO_BANANA_API_URL=https://your-nano-banana-backend.com
REACT_APP_FIREBASE_ID_TOKEN=your-firebase-id-token-here

# Optional Configuration
REACT_APP_MAX_IMAGE_SIZE=2048
REACT_APP_GENERATION_TIMEOUT=300000
REACT_APP_MAX_HISTORY_SIZE=50
REACT_APP_POLLING_INTERVAL=10000
```

#### 3. API Endpoints

The Nano Banana API client uses these endpoints:

- **Generation**: `POST /api/image-editing/v1/generate`
- **Status Polling**: `POST /api/image-editing/v1/result`

#### 4. Request Format

The API client sends requests in this format:

```json
{
  "data": {
    "prompt": "Your editing prompt",
    "inputImage": ["base64-encoded-image"],
    "numOfImages": 1,
    "model": "NANO BANANA",
    "maskStrokes": [
      {
        "x": 100,
        "y": 150,
        "size": 30
      }
    ],
    "maskMode": true
  }
}
```

#### 5. Response Format

The API returns responses in this format:

```json
{
  "success": true,
  "requestId": "unique-request-id",
  "result": {
    "status": "COMPLETED",
    "output": "https://generated-image-url.com/image.png",
    "processingTime": 45.2
  }
}
```

## 📁 Project Structure

```
src/
├── components/           # React components
│   ├── ui/              # Basic UI components
│   ├── Canvas/          # Canvas components
│   ├── Toolbar/         # Tool panels
│   ├── Modals/          # Modal dialogs
│   └── AnnotationEditor/ # Main editor
├── hooks/               # Custom React hooks
├── utils/               # Utility functions
├── types/               # TypeScript definitions
└── api/                 # API integration
```

## 🎨 Customization

### Theming

Customize colors and styling through the config prop:

```tsx
<AnnotationEditor
  config={{
    colors: {
      draw: "#000000",
      arrow: "#ef4444",
      text: "#1f2937",
      mask: "#3b82f6",
    },
    defaultSizes: {
      drawThickness: 3,
      arrowThickness: 3,
      fontSize: 16,
      brushSize: 30,
    },
    canvas: {
      maxWidth: 1200,
      maxHeight: 800,
      backgroundColor: "#ffffff",
    },
  }}
/>
```

## 🛠️ Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```


