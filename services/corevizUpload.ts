import { COREVIZ_CONFIG } from '@/config/coreviz';
import * as FileSystem from 'expo-file-system';

export interface UploadResult {
    success: boolean;
    url?: string;
    error?: string;
    mediaId?: string;
}

export interface FrameMetadata {
    width?: number;
    height?: number;
    fileSize?: number;
    timestamp: Date;
    exif?: any; // Camera EXIF data including orientation
}

// Get file information for upload
const getFileInfo = async (uri: string): Promise<{
    size: number;
    mimeType: string;
}> => {
    try {
        const fileInfo = await FileSystem.getInfoAsync(uri);
        if (!fileInfo.exists) {
            throw new Error('File does not exist');
        }

        return {
            size: fileInfo.size || 0,
            mimeType: 'image/jpeg', // Default to JPEG for camera captures
        };
    } catch (error) {
        console.error('Error reading file:', error);
        throw error;
    }
};

// Upload frame to CoreViz API using multipart endpoint
export const uploadFrame = async (
    frameUri: string,
    metadata: FrameMetadata
): Promise<UploadResult> => {
    try {
        if (!COREVIZ_CONFIG.API_KEY || !COREVIZ_CONFIG.ENTITY_ID) {
            return {
                success: false,
                error: 'API key or Entity ID not configured',
            };
        }

        console.log('Starting multipart upload for frame:', frameUri);

        // Get file information
        const fileInfo = await getFileInfo(frameUri);
        console.log('File info for upload:', {
            size: fileInfo.size,
            mimeType: fileInfo.mimeType,
            width: metadata.width,
            height: metadata.height,
        });

        // Generate unique filename
        const timestamp = metadata.timestamp.toISOString().replace(/[:.]/g, '-');
        const filename = `glasses-frame-${timestamp}.jpg`;

        // Create FormData for multipart upload
        const formData = new FormData();

        // Add the file (React Native format)
        formData.append('file', {
            uri: frameUri,
            type: fileInfo.mimeType,
            name: filename,
            // Add these to prevent processing:
            quality: 1.0,           // Maximum quality
            allowsEditing: false,   // No automatic editing
        } as any);

        // Add required fields
        formData.append('entityId', COREVIZ_CONFIG.ENTITY_ID);
        formData.append('authToken', COREVIZ_CONFIG.API_KEY);

        // Add optional metadata
        if (metadata.width) {
            formData.append('width', metadata.width.toString());
        }
        if (metadata.height) {
            formData.append('height', metadata.height.toString());
        }

        // Add EXIF data as JSON string (combine camera EXIF with our metadata)
        const exifData = {
            ...metadata.exif, // Include actual camera EXIF (with orientation info)
            capturedAt: metadata.timestamp.toISOString(),
            source: 'wearable-glasses',
            deviceType: 'mobile-camera',
            fileSize: fileInfo.size,
        };
        formData.append('exif', JSON.stringify(exifData));

        console.log('Including EXIF data:', {
            hasExif: !!metadata.exif,
            orientation: metadata.exif?.Orientation || 'Not set',
            capturedAt: exifData.capturedAt,
        });

        console.log('Uploading to multipart endpoint:', `${COREVIZ_CONFIG.API_BASE_URL}${COREVIZ_CONFIG.ENDPOINTS.UPLOAD}`);

        // Upload using the multipart endpoint
        const response = await fetch(`${COREVIZ_CONFIG.API_BASE_URL}${COREVIZ_CONFIG.ENDPOINTS.UPLOAD}`, {
            method: 'POST',
            body: formData,
            // Don't set Content-Type header - let React Native handle it
        });

        const responseText = await response.text();
        console.log('Upload response status:', response.status);
        console.log('Upload response body:', responseText);

        if (!response.ok) {
            console.error('Upload failed:', response.status, responseText);
            return {
                success: false,
                error: `Upload failed: ${response.status} ${responseText}`,
            };
        }

        // Parse the JSON response
        let result;
        try {
            result = JSON.parse(responseText);
        } catch (error) {
            console.error('Failed to parse response JSON:', error);
            return {
                success: false,
                error: 'Invalid response format',
            };
        }

        console.log('Upload result:', result);

        if (result.success) {
            return {
                success: true,
                url: result.url,
                mediaId: result.mediaId,
            };
        } else {
            return {
                success: false,
                error: result.message || 'Upload failed',
            };
        }

    } catch (error) {
        console.error('Upload error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown upload error',
        };
    }
};

// Batch upload multiple frames
export const uploadFramesBatch = async (
    frames: Array<{ uri: string; metadata: FrameMetadata }>
): Promise<UploadResult[]> => {
    const results: UploadResult[] = [];

    for (const frame of frames) {
        try {
            const result = await uploadFrame(frame.uri, frame.metadata);
            results.push(result);

            // Add small delay between uploads to avoid overwhelming the server
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
            results.push({
                success: false,
                error: error instanceof Error ? error.message : 'Upload failed',
            });
        }
    }

    return results;
};