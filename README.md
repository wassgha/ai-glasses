# Smart Glasses Demo w/ [CoreViz](https://coreviz.io) SDK

<p align="center">
  <img src="/assets/images/app.gif" alt="Smart Glasses Companion App" height="360"mstyle="display:inline-block; margin-right:2%;" />
  <img src="/assets//images/vision-qa.gif" alt="CoreViz VQA (Visual AI Question Answering)" height="360" style="display:inline-block;" />
</p>

[![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![CoreViz](https://img.shields.io/badge/CoreViz-FF6B35?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K&logoColor=white)](https://coreviz.io)

> **Visual Personal Intelligence for Smart Glasses**  
> A demo that captures moments automatically and uploads them to CoreViz for intelligent visual processing and personal super-memory. Features include search, object / face detection, visual question answering (VQA) and image similarity

## 🌟 Features

### 📸 Smart Camera Companion App

Demo app simulates syncing with smart glasses, capturing at regular intervals and uploading.

<p align="center">
  <img src="/assets/images/app.gif" alt="Smart Glasses Companion App" height="360"mstyle="display:inline-block; margin-right:2%;" />
</p>

- **Automatic Frame Capture**: Captures photos every 10 seconds when recording
- **High-Quality Processing**: 0.8 quality JPEG with full EXIF metadata
- **Orientation Aware**: Preserves camera orientation data for proper display
- **Media Library Integration**: Automatically saves captured frames locally
- **Timeline View**: Chronological organization of captured moments
- **Memory Lane**: Browse through your visual history by date

### CoreViz SDK (Visual Intelligence Integration)

Seamless integration through uploads to a smart collection (requires a [CoreViz](https://coreviz.io) account).

<p align="center">
   <img src="/assets//images/vision-qa.gif" alt="CoreViz VQA (Visual AI Question Answering)" height="360" style="display:inline-block;" />
</p>

- Object detection, face detection, clustering
- Indexing of images for quick search and RAG question answering
- Once images are uploaded, the CoreViz interface allows searching, tagging, answering questions and finding similar shots with Visual AI
- **Metadata Rich Uploads**: Includes timestamp, dimensions, and EXIF data
- **Batch Processing**: Upload multiple frames efficiently
- **Real-time Status**: Track upload progress and success/failure states

### 📱 Mobile-First Experience
- **Cross-Platform**: iOS, Android, and Web support via Expo
- **Responsive Design**: Adaptive UI for different screen sizes
- **Haptic Feedback**: Enhanced user interaction with tactile responses
- **Dark/Light Mode**: Automatic theme adaptation


## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or later)
- **Expo CLI** (`npm install -g @expo/cli`)
- **[CoreViz.io](https://coreviz.io/) Account** for API credentials

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/wassgha/ai-glasses.git
   cd glasses.coreviz
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npx expo start
   ```

4. **Run on your device**
   - **iOS**: Press `i` or scan QR with Camera app
   - **Android**: Press `a` or scan QR with Expo Go
   - **Web**: Press `w` to open in browser

## ⚙️ Configuration

### CoreViz API Setup

1. **Get Your Credentials**
   - Sign up at [CoreViz.io](https://coreviz.io)
   - Navigate to **Settings → API Keys**
   - Create a new API key
   - Note your Entity ID from your dataset

2. **Configure the App**
   - Open the app and go to the **Camera** tab
   - Tap the **⚙️ Settings** button
   - Enter your **API Key** and **Entity ID**
   - Tap **Save** to enable automatic uploads

### Environment Configuration

Update `config/coreviz.ts` with your settings:

```typescript
export const COREVIZ_CONFIG = {
    API_BASE_URL: 'https://your-coreviz-endpoint.com',
    API_KEY: '', // Set via app UI
    ENTITY_ID: '', // Set via app UI
    
    UPLOAD_SETTINGS: {
        MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
        SUPPORTED_FORMATS: ['image/jpeg', 'image/png', 'image/webp'],
        QUALITY: 0.8,
    }
};
```

## 📖 Usage Guide

### Starting a Recording Session

1. **Grant Permissions**: Allow camera and media library access
2. **Configure CoreViz**: Set up your API credentials in settings
3. **Start Recording**: Tap the record button in the Camera tab
4. **Automatic Capture**: Frames are captured every 10 seconds
5. **Upload Process**: Frames are automatically uploaded to CoreViz

### Managing Your Timeline

- **Browse Moments**: Use the Timeline tab to view captured frames
- **Date Organization**: Frames are grouped by capture date
- **Upload Status**: See real-time upload progress and status
- **Batch Operations**: Upload multiple frames at once

### Smart Features

- **Countdown Timer**: Visual indicator for next capture
- **Upload Progress**: Real-time progress tracking
- **Error Handling**: Automatic retry on failed uploads
- **Memory Management**: Keeps last 50 frames in memory

## 🏗️ Architecture

### Core Components

```
app/
├── (tabs)/
│   ├── index.tsx          # Camera interface and recording
│   ├── explore.tsx        # Timeline and frame browser
│   └── _layout.tsx        # Tab navigation
├── _layout.tsx            # App root layout
└── +not-found.tsx         # 404 handling

components/
├── CorevizConfigModal.tsx # API configuration UI
├── ParallaxScrollView.tsx # Smooth scrolling interface
├── ThemedText.tsx         # Themed text components
└── ThemedView.tsx         # Themed view components

contexts/
└── FramesContext.tsx      # Global state management

services/
└── corevizUpload.ts       # CoreViz API integration

config/
└── coreviz.ts            # API configuration
```

### Data Flow

1. **Capture**: Camera captures frame with metadata
2. **Store**: Frame added to local context with timestamp
3. **Process**: EXIF data extracted and preserved
4. **Upload**: Frame uploaded to CoreViz with rich metadata
5. **Track**: Upload status tracked and displayed

## 🔧 Development

### Available Scripts

```bash
# Development
npm start              # Start Expo development server
npm run android        # Run on Android emulator
npm run ios           # Run on iOS simulator
npm run web           # Run in web browser

# Utilities
npm run lint          # Run ESLint
npm run reset-project # Reset to clean state
```

### Key Technologies

- **Expo SDK 53**: Cross-platform development framework
- **React Native 0.79**: Mobile app framework
- **TypeScript**: Type-safe development
- **Expo Camera**: Camera API with EXIF support
- **Expo Media Library**: Local media storage
- **React Navigation**: Tab-based navigation

### CoreViz API Integration

The app integrates with CoreViz.io using multipart form uploads:

```typescript
// Upload with rich metadata
const formData = new FormData();
formData.append('file', {
    uri: frameUri,
    type: 'image/jpeg',
    name: `glasses-frame-${timestamp}.jpg`,
});
formData.append('entityId', COREVIZ_CONFIG.ENTITY_ID);
formData.append('authToken', COREVIZ_CONFIG.API_KEY);
formData.append('exif', JSON.stringify({
    ...cameraExif,
    capturedAt: timestamp,
    source: 'wearable-glasses',
    deviceType: 'mobile-camera',
}));
```

## 🔒 Privacy & Security

- **Local Storage**: Frames stored locally until upload
- **Secure Upload**: HTTPS-only API communication
- **Credential Management**: Secure storage of API keys
- **Data Retention**: Configurable frame retention policies

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Use semantic commit messages
- Add tests for new features
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **CoreViz.io** for providing the visual intelligence platform
- **Expo Team** for the excellent development framework
- **React Native Community** for continuous innovation

---

<div align="center">

**Built with ❤️ for the future of visual intelligence**

[🔗 CoreViz.io](https://coreviz.io) • [📱 Expo](https://expo.dev) • [⚛️ React Native](https://reactnative.dev)

</div>