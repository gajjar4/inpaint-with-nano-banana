# 🚀 Setup Guide

Complete guide to get the Open Source Draw-to-Edit Annotation System up and running.

## 📋 Prerequisites

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **npm or yarn** - Comes with Node.js
- **Git** - [Download here](https://git-scm.com/)

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/open-source-draw-to-edit-nano-banana.git
cd open-source-draw-to-edit-nano-banana
```

### 2. Install Dependencies

```bash
# Using npm
npm install

# Or using yarn
yarn install
```

### 3. Configure Environment (Optional)

If you plan to use AI generation features:

```bash
# Copy the example environment file
cp env.example .env

# Edit .env with your API keys
# REACT_APP_OPENAI_API_KEY=your-key-here
# REACT_APP_API_BASE_URL=your-api-url
```

### 4. Start Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🎨 Basic Usage

1. **Upload an Image**: Click the upload button or drag & drop an image
2. **Select a Tool**: Choose from Draw, Arrow, Text, Image, or Mask
3. **Annotate**: Start drawing, adding text, or creating masks
4. **Generate** (if API configured): Use AI to edit based on your annotations
5. **Download**: Save your annotated image

## 🔧 Nano Banana API Integration

### Setting up your Backend

This system is designed to work with the Nano Banana API backend. Follow these steps:

#### 1. Environment Configuration

Create a `.env` file in the project root:

```bash
# Copy the example environment file
cp env.example .env

# Edit the .env file with your configuration
REACT_APP_NANO_BANANA_API_URL=https://your-nano-banana-backend.com
REACT_APP_FIREBASE_ID_TOKEN=your-firebase-id-token-here
```

#### 2. Enable API Client

Uncomment the API client configuration in `src/App.tsx`:

```tsx
import { createNanoBananaClient } from "./api";

const apiClient = createNanoBananaClient(
  process.env.REACT_APP_NANO_BANANA_API_URL!,
  process.env.REACT_APP_FIREBASE_ID_TOKEN
);

// Pass apiClient to AnnotationEditor
<AnnotationEditor apiClient={apiClient} />;
```

#### 3. Firebase Authentication

The Nano Banana API uses Firebase authentication. Make sure to:

1. Set up Firebase in your project
2. Obtain a valid Firebase ID token
3. Include it in your environment variables or pass it dynamically

#### 4. Backend Requirements

Your Nano Banana backend should support:

- **Endpoint**: `POST /api/image-editing/v1/generate`
- **Polling**: `POST /api/image-editing/v1/result`
- **Authentication**: Firebase ID token in Authorization header
- **Request Format**: JSON with encrypted data payload
- **Response Format**: JSON with success/error status and result data

## 📁 Project Structure Overview

```
src/
├── components/
│   ├── ui/                 # Basic UI components (Button, Input, etc.)
│   ├── Canvas/             # Canvas rendering components
│   ├── Toolbar/            # Tool selection and properties
│   ├── Modals/             # Modal dialogs
│   └── AnnotationEditor/   # Main editor component
├── hooks/                  # Custom React hooks
├── utils/                  # Utility functions
├── types/                  # TypeScript type definitions
└── api/                    # API integration layer
```

## 🔧 Customization

### Colors and Styling

Modify the config in `src/App.tsx`:

```tsx
<AnnotationEditor
  config={{
    colors: {
      draw: "#000000", // Drawing tool color
      arrow: "#ef4444", // Arrow tool color
      text: "#1f2937", // Text color
      mask: "#3b82f6", // Mask overlay color
    },
    defaultSizes: {
      drawThickness: 3, // Drawing line thickness
      arrowThickness: 3, // Arrow line thickness
      fontSize: 16, // Default text size
      brushSize: 30, // Mask brush size
    },
    canvas: {
      maxWidth: 1200, // Maximum canvas width
      maxHeight: 800, // Maximum canvas height
      backgroundColor: "#ffffff",
    },
  }}
/>
```

### Adding Custom Tools

1. **Extend types** in `src/types/index.ts`:

```tsx
export type ToolType =
  | "draw"
  | "arrow"
  | "text"
  | "image"
  | "mask"
  | "custom"
  | null;
```

2. **Add tool button** in toolbar components
3. **Implement tool logic** in canvas handlers
