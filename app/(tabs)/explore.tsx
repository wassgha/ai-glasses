import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useFrames } from '@/contexts/FramesContext';

export default function TabTwoScreen() {
  const { capturedFrames, isRecording } = useFrames();

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const groupFramesByDate = () => {
    const groups: { [key: string]: typeof capturedFrames } = {};

    capturedFrames.forEach(frame => {
      const dateKey = formatDate(frame.fullTimestamp);
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(frame);
    });

    return groups;
  };

  const frameGroups = groupFramesByDate();

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <View style={styles.headerContent}>
          <IconSymbol
            size={120}
            color="#ffffff20"
            name="clock.fill"
            style={styles.clockIcon}
          />
          <ThemedText type="title" style={styles.headerTitle}>
            Timeline
          </ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            {capturedFrames.length} moment(s)
          </ThemedText>
          {isRecording && (
            <View style={styles.recordingBadge}>
              <View style={styles.recordingDot} />
              <ThemedText style={styles.recordingText}>RECORDING</ThemedText>
            </View>
          )}
        </View>
      }>

      {capturedFrames.length === 0 ? (
        <ThemedView style={styles.emptyContainer}>
          <IconSymbol
            size={80}
            color="#80808080"
            name="camera.fill"
            style={styles.emptyIcon}
          />
          <ThemedText type="subtitle" style={styles.emptyTitle}>
            No moments captured yet
          </ThemedText>
          <ThemedText style={styles.emptyDescription}>
            Start recording in the Camera tab to begin capturing moments automatically every 10 seconds.
          </ThemedText>
        </ThemedView>
      ) : (
        Object.entries(frameGroups)
          .sort(([dateA], [dateB]) => {
            const a = new Date(dateA).getTime();
            const b = new Date(dateB).getTime();
            return b - a; // Most recent first
          })
          .map(([date, frames]) => (
            <ThemedView key={date} style={styles.dateSection}>
              <ThemedText type="subtitle" style={styles.dateHeader}>
                {date}
              </ThemedText>

              {frames.map((frame, index) => (
                <View key={`${frame.timestamp}-${index}`} style={styles.timelineItem}>
                  <View style={styles.timelineMarker}>
                    <View style={styles.timelineDot} />
                    {index < frames.length - 1 && <View style={styles.timelineLine} />}
                  </View>

                  <View style={styles.frameCard}>
                    <View style={styles.frameHeader}>
                      <ThemedText type="defaultSemiBold" style={styles.frameTime}>
                        {formatTime(frame.fullTimestamp)}
                      </ThemedText>
                      <View style={styles.frameStatus}>
                        <View style={[
                          styles.statusDot,
                          frame.uploadStatus === 'uploaded' && styles.uploadedDot,
                          frame.uploadStatus === 'uploading' && styles.uploadingDot,
                          frame.uploadStatus === 'failed' && styles.failedDot,
                        ]} />
                        <ThemedText style={[
                          styles.statusText,
                          frame.uploadStatus === 'uploaded' && styles.uploadedText,
                          frame.uploadStatus === 'uploading' && styles.uploadingText,
                          frame.uploadStatus === 'failed' && styles.failedText,
                        ]}>
                          {frame.uploadStatus === 'uploaded' ? 'Uploaded' :
                            frame.uploadStatus === 'uploading' ? 'Uploading...' :
                              frame.uploadStatus === 'failed' ? 'Upload Failed' :
                                'Captured'}
                        </ThemedText>
                      </View>
                    </View>

                    <View style={styles.frameImageContainer}>
                      <Image
                        source={{ uri: frame.uri }}
                        style={styles.frameImage}
                        contentFit="cover"
                      />
                      <View style={styles.imageOverlay}>
                        <IconSymbol
                          size={24}
                          color="#ffffff90"
                          name="eye.fill"
                        />
                      </View>
                    </View>

                    <View style={styles.frameFooter}>
                      <ThemedText style={styles.frameDescription}>
                        Frame captured from wearable glasses simulation
                      </ThemedText>
                    </View>
                  </View>
                </View>
              ))}
            </ThemedView>
          ))
      )}
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerContent: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 20,
  },
  clockIcon: {
    marginBottom: 10,
    position: 'absolute',
    bottom: 0,
    left: 0,
    transform: [{ scale: 3 }],
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#ffffff90',
    textAlign: 'center',
    marginBottom: 15,
  },
  recordingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(244, 67, 54, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  recordingText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    marginBottom: 20,
    opacity: 0.5,
  },
  emptyTitle: {
    textAlign: 'center',
    marginBottom: 10,
    opacity: 0.8,
  },
  emptyDescription: {
    textAlign: 'center',
    opacity: 0.6,
    lineHeight: 22,
  },
  dateSection: {
    marginBottom: 30,
  },
  dateHeader: {
    marginBottom: 20,
    paddingHorizontal: 4,
    opacity: 0.9,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  timelineMarker: {
    alignItems: 'center',
    marginRight: 15,
    width: 20,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: '#e0e0e0',
    marginTop: 4,
  },
  frameCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  frameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  frameTime: {
    fontSize: 16,
    color: '#333',
  },
  frameStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4CAF50',
  },
  statusText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  uploadedDot: {
    backgroundColor: '#2196F3',
  },
  uploadingDot: {
    backgroundColor: '#FF9800',
  },
  failedDot: {
    backgroundColor: '#F44336',
  },
  uploadedText: {
    color: '#2196F3',
  },
  uploadingText: {
    color: '#FF9800',
  },
  failedText: {
    color: '#F44336',
  },
  frameImageContainer: {
    position: 'relative',
    height: 200,
  },
  frameImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f5f5f5',
  },
  imageOverlay: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  frameFooter: {
    padding: 15,
  },
  frameDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});
