import { CorevizConfigModal } from '@/components/CorevizConfigModal';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useFrames } from '@/contexts/FramesContext';
import { Camera, CameraView } from 'expo-camera';
import { Image } from 'expo-image';
import * as MediaLibrary from 'expo-media-library';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Dimensions, SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  const {
    capturedFrames,
    addFrame,
    clearFrames,
    isRecording,
    setIsRecording,
    uploadAllFrames,
    isUploading,
    uploadProgress,
    apiKey,
    entityId,
    setApiCredentials,
    isConfigured
  } = useFrames();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [countdown, setCountdown] = useState(10);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    (async () => {
      const cameraStatus = await Camera.requestCameraPermissionsAsync();
      const mediaLibraryStatus = await MediaLibrary.requestPermissionsAsync();
      setHasPermission(cameraStatus.status === 'granted' && mediaLibraryStatus.status === 'granted');
    })();
  }, []);

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
          skipProcessing: false, // Allow processing to handle orientation
          exif: true,           // Include EXIF data for orientation info
        });

        if (photo) {
          const now = new Date();
          const timestamp = now.toLocaleTimeString();

          console.log('Camera captured photo:', {
            uri: photo.uri,
            width: photo.width,
            height: photo.height,
            timestamp: now.toISOString(),
            exif: photo.exif ? 'Available' : 'Not available',
            orientation: photo.exif?.Orientation || 'Unknown',
          });

          const newFrame = {
            uri: photo.uri,
            timestamp,
            fullTimestamp: now,
            width: photo.width,
            height: photo.height,
            exif: photo.exif, // Include EXIF data for orientation
            // Note: file size will be calculated during upload
          };

          addFrame(newFrame);

          // Save to media library
          await MediaLibrary.saveToLibraryAsync(photo.uri);
        }
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Error', 'Failed to capture frame');
      }
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    setCountdown(10);

    // Take first picture immediately
    takePicture();

    // Set up interval for taking pictures every 10 seconds
    intervalRef.current = setInterval(() => {
      takePicture();
      setCountdown(10);
    }, 10000);

    // Set up countdown timer
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          return 10;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    setCountdown(10);
  };

  const handleClearFrames = () => {
    clearFrames();
  };

  if (hasPermission === null) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Requesting permissions...</ThemedText>
      </ThemedView>
    );
  }

  if (hasPermission === false) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Camera permission is required for this app to work.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Camera View */}
      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          ref={cameraRef}
          facing="back"
          mode="picture"
        >
          {/* Overlay UI */}
          <View style={styles.overlay}>
            <ThemedView style={styles.statusBar}>
              <View style={styles.headerRow}>
                <ThemedText type="defaultSemiBold" style={styles.title}>
                  🟢 Glasses Connected
                </ThemedText>
                <TouchableOpacity
                  style={styles.configButton}
                  onPress={() => setShowConfigModal(true)}
                >
                  <ThemedText style={styles.configButtonText}>⚙️</ThemedText>
                </TouchableOpacity>
              </View>

              {isRecording && (
                <ThemedText style={styles.countdownText}>
                  Next capture in: {countdown}s
                </ThemedText>
              )}

              {!isConfigured && (
                <ThemedText style={styles.warningText}>
                  ⚠️ Upload not configured - tap ⚙️ to set up CoreViz
                </ThemedText>
              )}

              {isUploading && (
                <ThemedText style={styles.uploadProgressText}>
                  Uploading: {uploadProgress.current}/{uploadProgress.total}
                </ThemedText>
              )}
            </ThemedView>

            {/* Control Buttons */}
            <View style={styles.controls}>
              <TouchableOpacity
                style={[styles.button, isRecording ? styles.stopButton : styles.startButton]}
                onPress={isRecording ? stopRecording : startRecording}
              >
                <ThemedText style={styles.buttonText}>
                  {isRecording ? 'Stop Recording' : 'Start Recording'}
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.button}
                onPress={takePicture}
              >
                <ThemedText style={styles.buttonText}>Manual Capture</ThemedText>
              </TouchableOpacity>

              {capturedFrames.length > 0 && isConfigured && (
                <TouchableOpacity
                  style={[styles.button, styles.uploadButton, isUploading && styles.disabledButton]}
                  onPress={uploadAllFrames}
                  disabled={isUploading}
                >
                  <ThemedText style={styles.buttonText}>
                    {isUploading ? 'Uploading...' : 'Upload Frames'}
                  </ThemedText>
                </TouchableOpacity>
              )}

              {capturedFrames.length > 0 && (
                <TouchableOpacity
                  style={[styles.button, styles.clearButton]}
                  onPress={handleClearFrames}
                >
                  <ThemedText style={styles.buttonText}>Clear Frames</ThemedText>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </CameraView>
      </View>

      {/* Captured Frames Display */}
      {capturedFrames.length > 0 && (
        <View style={styles.framesContainer}>
          <ThemedText type="subtitle" style={styles.framesTitle}>
            Captured Frames ({capturedFrames.length})
          </ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.framesScroll}>
            {capturedFrames.map((frame, index) => (
              <View key={`${frame.timestamp}-${index}`} style={styles.frameItem}>
                <Image source={{ uri: frame.uri }} style={styles.frameImage} />
                <ThemedText style={styles.frameTimestamp}>{frame.timestamp}</ThemedText>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Configuration Modal */}
      <CorevizConfigModal
        visible={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        onSave={setApiCredentials}
        initialApiKey={apiKey}
        initialEntityId={entityId}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    marginBottom: 84,
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
  },
  statusBar: {
    margin: 20,
    padding: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  title: {
    fontSize: 16,
    color: '#fff',
    flex: 1,
  },
  configButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
  },
  configButtonText: {
    fontSize: 16,
    color: '#fff',
  },
  countdownText: {
    fontSize: 14,
    color: '#ffeb3b',
    textAlign: 'center',
    marginTop: 5,
  },
  warningText: {
    fontSize: 12,
    color: '#ff9800',
    textAlign: 'center',
    marginTop: 5,
  },
  uploadProgressText: {
    fontSize: 12,
    color: '#4CAF50',
    textAlign: 'center',
    marginTop: 5,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 10,
    flexWrap: 'wrap',
  },
  button: {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 120,
  },
  startButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.9)',
  },
  stopButton: {
    backgroundColor: 'rgba(244, 67, 54, 0.9)',
  },
  clearButton: {
    backgroundColor: 'rgba(255, 152, 0, 0.9)',
  },
  uploadButton: {
    backgroundColor: 'rgba(33, 150, 243, 0.9)',
  },
  disabledButton: {
    backgroundColor: 'rgba(158, 158, 158, 0.9)',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 14,
  },
  framesContainer: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 15,
    maxHeight: 140,
  },
  framesTitle: {
    color: '#fff',
    marginHorizontal: 20,
    marginBottom: 10,
  },
  framesScroll: {
    paddingHorizontal: 20,
  },
  frameItem: {
    marginRight: 10,
    alignItems: 'center',
  },
  frameImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#333',
  },
  frameTimestamp: {
    color: '#ccc',
    fontSize: 10,
    marginTop: 5,
    textAlign: 'center',
  },
});
